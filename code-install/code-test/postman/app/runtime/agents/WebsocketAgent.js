const fs = require('fs'),
  http = require('http'),
  request = require('postman-request'),
  path = require('path'),
  url = require('url'),
  SerializedError = require('serialised-error'),

  async = require('async'),
  cors = require('cors'),
  polka = require('polka'),
  { v4: uuid } = require('uuid'),
  send = require('@polka/send'),

  io = require('socket.io')({
    path: '/agent',
    serveClient: false,
    transports: ['websocket'],
    allowUpgrades: false,
    cookie: false
  }),

  CookieStorageRemoteClient = require('./common/services/CookieStorageRemoteClient'),
  LinkableChannel = require('./common/channels/LinkableChannel'),
  WebSocketChannel = require('./common/channels/WebSocketChannel'),

  // This is a mapping between clientId and the respective CookieStorageRemoteClient instance
  // It is required so that in case of multiple clients, we are able to keep the
  // communication channel open with all the clients and use the correct cookieStorageRemoteClient
  // instance when a query/action needs to be performed.
  cookieStorageRemoteClientMap = new Map(),

  // A map to keep track of all clients associated with each of the opened windows
  // This is required for clean up during socket (agent) disconnect event.
  socketToClientMap = new Map(),


  // A map between the clientId and the set of all open websocket request connection ids
  // This is required for clean up during socket (agent) disconnect event.
  clientToWSConnectionMap = new Map(),

  // TODO: Implement a LRU here to clean up handshakes when not used
  HANDSHAKES = new Map([]),
  ALLOWED_HOSTS = pm.config.get('ALLOWED_HOSTS').map((s) => new RegExp(s));

/**
 *
 * @param {Object} request
 * @param {Function} cb
 */
function handleHandshake (request, cb) {
  // ><><> FOR LOCAL TESTING UNCOMMENT THIS LIKE
  // return cb(null, true);

  const query = url.parse(request.url, true).query;

  // Check if the handshake token exists, if not then bail
  if (!(query.token && HANDSHAKES.has(query.token))) {
    return cb('unauthorized', false);
  }

  // After handshake has been successfully consumed clear it of
  HANDSHAKES.delete(query.token);

  return cb(null, true);
}

/**
 *
 * @param {Function} done
 */
function start (R, done) {
  const PORT = pm.config.get('WS_PORT'),
    HOST = '127.0.0.1',
    server = http.createServer(),
    app = polka({ server });

  app
  .use(

    // CORS configuration
    cors({
      origin: ALLOWED_HOSTS,
      methods: 'GET'
    }),

    // Explicit origin block
    (req, res, next) => {
      const origin = req.headers['origin'],
        allow = ALLOWED_HOSTS.reduce((acc, v) => {
          return acc || v.test(origin);
        }, false);

      allow ? next() : send(res, 403, 'Forbidden - Request origin is not valid');
    }
  )

  // Health check endpoint
  .get('/knockknock', (__, res) => {
    return send(res, 200, 'OK');
  })

   // Create handshake endpoint to assign the verification of agents
  .get('/handshake', (req, res) => {
    request.get({
      baseUrl: pm.config.get('RUNTIME_AGENT_HOST'),
      url: '/v1/handshake/identity',
      headers: {
        'x-access-token': req.headers['x-access-token']
      },
      qs: {
        id: pm.installationId || '0', // Add the appId here
        os: process.platform,
        v: pm.config.get('_V'), // TODO: Add version of this application
        c: HANDSHAKES.size
      },
      json: true
    }, (err, response, body) => {
      if (err) {
        return send(res, 500, 'Internal Server Error - Error verifying handshake');
      }

      if (response.statusCode !== 200) {
        pm.logger.error('WebsocketAgent~handshake', body);

        return send(res, 403, 'Forbidden - Handshake could not be verified');
      }

      const id = uuid();

      // Save the response of handshake to be used later
      HANDSHAKES.set(id, body);

      // create payload to send back to web
      const payload = {
        id,
        versions: {
          ...process.versions,
          agent: pm.config.get('_V')
        }
      };

      return send(res, 200, JSON.stringify(payload), { 'Content-Type': 'application/json' });
    });
  });

  // Create a dummy handler for the agent endpoint to give control over to socket.io
  // Note: This will need to change if different namespace is used in socket.io
  app.get('/agent', () => {});

  // Attach the http server to socket.io
  io.attach(server, { allowRequest: handleHandshake });

  server.on('error', (err) => {
    pm.logger.error('WebsocketAgent~start - Could not start server', err.message);
  });

  server.on('listening', () => {
    pm.logger.info('WebsocketAgent~start - Listening on port', PORT);
  });

  io.on('connection', (socket) => {
    socket.on('init', (message) => {
      const socketId = socket.id,
        clientIds = socketToClientMap.get(socketId) || new Set();

      // Map the client id to its socket
      // This is done for enabling us to do the required cleanup when the connection closes
      clientIds.add(message.__clientId);
      socketToClientMap.set(socketId, clientIds);
    });

    // Listen on the runtime channel
    socket.on('runtime', (message) => {
      if (message.name === 'terminate') {
        R.stopRun(message.data.execution, (message) => {
          socket.emit('runtime', message);
        });

        return;
      }

      if (message.name === 'pause') {
        R.pauseRun(message.data.execution, (message) => {
          socket.emit('runtime', message);
        });

        return;
      }

      if (message.name === 'resume') {
        R.resumeRun(message.data.execution, (message) => {
          socket.emit('runtime', message);
        });

        return;
      }

      if (message.name === 'execute') {
        R.startRun(message.data.info, message.data.collection, message.data.variables, message.data.options, cookieStorageRemoteClientMap.get(message.__clientId), (message) => {
          socket.emit('runtime', message);
        });
        return;
      }

      if (message.namespace === 'cookie' && message.name === 'initializeManager') {
        cookieStorageRemoteClientMap.set(message.__clientId, new CookieStorageRemoteClient((request) => {
          socket.emit('cookie', request);
        }));

        return;
      }
    });

    socket.on('runtime-fn', (fn, args, cb) => {
      if (fn === 'previewRequest') {
        const [request, options] = args;

        return R.previewRequest(request, options, cookieStorageRemoteClientMap.get(options.__clientId), cb);
      }
    });

    // Listen on `ws` channel for any websocket related commands
    socket.on('ws', (message) => {
      const clientId = message.__clientId,
        connectionIds = clientToWSConnectionMap.get(clientId) || new Set();

      if (message.name === 'wsConnect') {
        R.wsConnect(message.data.connectionId, message.data.connectionConfig, (message) => {
          socket.emit('ws', message);

          // To clean up the map, when connection gets terminated without any user interaction
          if (message.event === 'end') {
            connectionIds.delete(message.connectionId);
            connectionIds.size === 0 ? clientToWSConnectionMap.delete(clientId) : clientToWSConnectionMap.set(clientId, connectionIds);
          }
        });

        // Map connection to its corresponding client when a new connection is opened
        connectionIds.add(message.data.connectionId);
        clientToWSConnectionMap.set(clientId, connectionIds);

        return;
      }

      if (message.name === 'wsDisconnect') {
        R.wsDisconnect(message.data.connectionId);

        // Clean up mapped connection, when a connection is closed
        connectionIds.delete(message.data.connectionId);
        connectionIds.size === 0 ? clientToWSConnectionMap.delete(clientId) : clientToWSConnectionMap.set(clientId, connectionIds);

        return;
      }
    });

    // Listen on `ws-fn` channel for any raw websocket related function calls
    socket.on('ws-fn', (fn, args, cb) => {
      if (fn === 'wsSend') {
        return R.wsSend(...args, cb);
      }
    });

    // Listen on `socketIO` channel for any socketIO request related commands
    socket.on('socketIO', (message) => {
      const clientId = message.__clientId,
        connectionIds = clientToWSConnectionMap.get(clientId) || new Set();

      if (message.name === 'socketIOConnect') {
        R.socketIOConnect(message.data.connectionId, message.data.connectionConfig, (message) => {
          socket.emit('socketIO', message);

          // To clean up the map, when connection gets terminated without any user interaction
          if (message.event === 'end') {
            connectionIds.delete(message.connectionId);
            connectionIds.size === 0 ? clientToWSConnectionMap.delete(clientId) : clientToWSConnectionMap.set(clientId, connectionIds);
          }
        });

        // Map connection to its corresponding client when a new connection is opened
        connectionIds.add(message.data.connectionId);
        clientToWSConnectionMap.set(clientId, connectionIds);

        return;
      }

      if (message.name === 'socketIODisconnect') {
        R.socketIODisconnect(message.data.connectionId);

        // Clean up mapped connection, when a connection is closed
        connectionIds.delete(message.data.connectionId);
        connectionIds.size === 0 ? clientToWSConnectionMap.delete(clientId) : clientToWSConnectionMap.set(clientId, connectionIds);

        return;
      }
    });

    // Listen on `socketIO-fn` channel for any socketIO related function calls
    socket.on('socketIO-fn', (fn, args, cb) => {
      if (fn === 'socketIOPublish') {
        return R.socketIOPublish(...args, cb);
      }

      if (fn === 'socketIOSubscribe') {
        return R.socketIOSubscribe(...args, cb);
      }

      if (fn === 'socketIOUnsubscribe') {
        return R.socketIOUnsubscribe(...args, cb);
      }
    });

    socket.on('grpc', async (fn, args, cb) => {
      let result;

      try {
        result = await R.grpc(fn, ...args);
      } catch (err) {
        const serializedError = new SerializedError(err);

        return cb({ error: serializedError });
      }

      if (result instanceof LinkableChannel) {
        const wsChannel = new WebSocketChannel(socket);

        result.link(wsChannel);

        return cb({
          result: Object.assign({}, result),
          channel: wsChannel.getId()
        });
      }

      return cb({ result });
    });

    // Listen on the cookie channel
    socket.on('cookie', (message) => {
      const cm = cookieStorageRemoteClientMap.get(message.__clientId);

      cm && cm.handleResponse(message);
    });

    // Listen on the files channel
    socket.on('files', (fn, args, cb) => {
      if (fn === 'create-temp') {
        return R.createTemporaryFile(...args, cb);
      } else if (fn === 'read') {
        // Check if path is relative then convert it to absolute path from working directory
        if (args && args[0] && !path.isAbsolute(args[0])) {
          args[0] = path.resolve(R.defaultWorkingDir || '', args[0]);
        }

        return R.readFile(...args, cb);
      } else if (fn === 'access') {
        // Check if path is relative then convert it to absolute path from working directory
        if (args && args[0] && !path.isAbsolute(args[0])) {
          args[0] = path.resolve(R.defaultWorkingDir || '', args[0]);
        }
        return R.accessFile(...args, cb);
      } else if (fn === 'saveResponse') {
        return R.saveStreamToFile(...args, cb);
      }
    });

    // Listen on the agent-updates channel
    socket.on('agent-updates', (fn, args, cb) => {
      // Not creating a build-time dependency on the update service. We are requiring it only when is needed
      // This file gets copied to <root>/lib at build-time so the update service path is relative to that
      const agentUpdateService = require('../services/agentUpdateService');

      if (fn === 'getStatus') {
        return cb(null, agentUpdateService.getStatus());
      } else if (fn === 'restartAndApplyUpdate') {
        agentUpdateService.restartAndUpdate();
      }
    });

    // Listen on uploads channel
    socket.on('uploads', (workingDir, name, data, cb) => {
      const dir = workingDir || R.defaultWorkingDir || '',
        P = path.resolve(dir, name);

      async.series([
        // Check the working directory is writable
        (next) => fs.access(dir, fs.constants.W_OK, next),

        // Create the full directory
        (next) => fs.mkdir(path.parse(P).dir, { recursive: true }, next),

        // Write the contents to the file
        (next) => fs.writeFile(P, data, next)
      ], cb);
    });

    socket.on('disconnect', () => {
      const socketId = socket.id,
        clientIds = socketToClientMap.get(socketId);

      // No client for this socket, bail out
      if (!clientIds || clientIds.size === 0) {
        return;
      }

      clientIds.forEach((clientId) => {
        // Delete cookieStorageRemoteClient instances for each client
        cookieStorageRemoteClientMap.delete(clientId);

        // Clean up all open websocket connections
        R.wsBulkDisconnect(Array.from(clientToWSConnectionMap.get(clientId) || []));
        clientToWSConnectionMap.delete(clientId);
      });

      // Delete clientId mapping for the disconnected socket
      socketToClientMap.delete(socketId);
    });

    socket.on('error', (err) => {
      pm.logger.error('WebsocketAgent~connection', err.message);
    });
  });

  // Start listening on the PORT and localhost on polka
  app.listen(PORT, HOST);

  done && done(null, server, io);
}

module.exports = { start };
