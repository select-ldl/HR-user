// ###### WARNING: DO NOT REQUIRE NON-ISOMORPHIC LIBRARIES HERE
let _ = require('lodash'),
  async = require('async'),

  EventProcessor = require('./RuntimeEventProcessor'),

  // ###### WARNING: DO NOT REQUIRE NON-ISOMORPHIC LIBRARIES HERE

  // Character detection to node encoding map
  CHARDET_BUFF_MAP = {
    ASCII: 'ascii',
    'UTF-8': 'utf8',
    'UTF-16LE': 'utf16le',
    'ISO-8859-1': 'latin1'
  },

  detectEncoding = (buff) => CHARDET_BUFF_MAP[chardet.detect(buff)],

  isBrowser = false,


  // TODO: Implement these using a dependency injection model like awilix
  fs,
  os,
  app,
  path,
  dialog,
  chardet,
  session,
  WebSocket,
  PostmanFs,
  CookieJar,
  grpcClient,
  dryRunRequest,
  SocketIOClient,
  getSystemProxy,
  SerializedError,
  collectionRunner,
  sanitizeFilename,
  postmanCollectionSdk,

  defaultWorkingDir,

  activeRuns = {},

  openWSConnections = {};

/**
 * Helper function to get the file extension given a mime-type
 * @param {String} mimeType
 */
function __getProbableExtension (mimeType) {
  var mimeExtensions = [
    {
      typeSubstring: 'text',
      extension: '.txt'
    },
    {
      typeSubstring: 'json',
      extension: '.json'
    },
    {
      typeSubstring: 'javascript',
      extension: '.js'
    },
    {
      typeSubstring: 'pdf',
      extension: '.pdf'
    },
    {
      typeSubstring: 'png',
      extension: '.png'
    },
    {
      typeSubstring: 'jpg',
      extension: '.jpg'
    },
    {
      typeSubstring: 'jpeg',
      extension: '.jpg'
    },
    {
      typeSubstring: 'gif',
      extension: '.gif'
    },
    {
      typeSubstring: 'excel',
      extension: '.xls'
    },
    {
      typeSubstring: 'zip',
      extension: '.zip'
    },
    {
      typeSubstring: 'compressed',
      extension: '.zip'
    },
    {
      typeSubstring: 'audio/wav',
      extension: '.wav'
    },
    {
      typeSubstring: 'tiff',
      extension: '.tiff'
    },
    {
      typeSubstring: 'shockwave',
      extension: '.swf'
    },
    {
      typeSubstring: 'powerpoint',
      extension: '.ppt'
    },
    {
      typeSubstring: 'mpeg',
      extension: '.mpg'
    },
    {
      typeSubstring: 'quicktime',
      extension: '.mov'
    },
    {
      typeSubstring: 'html',
      extension: '.html'
    },
    {
      typeSubstring: 'css',
      extension: '.css'
    }
  ];

  for (var i = 0; i < mimeExtensions.length; i++) {
    if (mimeType.indexOf(mimeExtensions[i].typeSubstring) > -1) {
      return mimeExtensions[i].extension;
    }
  }

  return '';
}


// #region API Functions

/**
 * @private
 */
function trackRun (executionId, run, processor) {
  // Set the processor as the runs processor
  run.processor = processor;

  activeRuns[executionId] = run;
}

/**
 * @private
 */
function addAborter (executionId, aborter) {
  activeRuns[executionId] && (activeRuns[executionId].aborter = aborter);
}

/**
 * @private
 */
function removeAborter (executionId) {
  activeRuns[executionId] && (delete activeRuns[executionId].aborter);
}

/**
 * @private
 * Sanitizes options to be sent to runtime. Mostly converting objects into SDK instances.
 *
 * @param {Object} rawOptions
 */
function sanitizeRunOptions (rawOptions) {
  if (!rawOptions) {
    return;
  }

  if (rawOptions.useSystemProxy && !!getSystemProxy) {
    rawOptions.systemProxy = getSystemProxy;
  }

  if (rawOptions.proxies) {
    rawOptions.proxies = new postmanCollectionSdk.ProxyConfigList({}, rawOptions.proxies);
  }

  rawOptions.certificates = new postmanCollectionSdk.CertificateList({}, rawOptions.certificates);
}

/**
 * @private
 * Save the given stream to a file the user chooses
 *
 * @param {Object} contentInfo
 * @param {Buffer} stream
 */
function saveStreamToFile (contentInfo, stream, cb) {
  let name;

  // sdkResponse override
  if (contentInfo && contentInfo.fileName) {
    name = contentInfo.fileName || '';
  }

  if (_.isEmpty(name)) {
    name = 'response';
    name = (contentInfo && contentInfo.mimeType) ? `${name}${__getProbableExtension(contentInfo.mimeType)}` : name;
  }

  if (isBrowser) {
    // eslint-disable-next-line no-undef
    let blob = new Blob([stream]),
      url = URL.createObjectURL(blob),

      // eslint-disable-next-line no-undef
      element = document.createElement('a');

    element.setAttribute('href', url);
    element.setAttribute('download', name);
    element.style.display = 'none';

    // eslint-disable-next-line no-undef
    document.body.appendChild(element);

    // simulate click to start downloading
    element.click();

    // cleanup
    // eslint-disable-next-line no-undef
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    blob = null;

    // Known Issue: Firefox shows a default “save dialog” when downloading
    // response via browser or cloud agent. Due to this our success toasts
    // gets triggered irrespective of the option user selects in the dialog
    // See: https://postmanlabs.atlassian.net/browse/RUNTIME-2823

    return cb(null, true);
  }

  // WARNING: All usages below require native dependencies hence be careful in browser environment

  name = sanitizeFilename(name, { replacement: '-' });

  // Steal focus for agent application on macOS.
  // This is done to handle the case where the
  // save dialog was hiding behind the browser window on macOS.
  // Refer: https://github.com/electron/electron/blob/v9.4.3/docs/api/app.md#appfocusoptions
  if (process.platform === 'darwin') {
    app.focus({ steal: true });
  }

  dialog.showSaveDialog({
    title: 'Select path to save file',
    defaultPath: name // Default filename to be used
  }).then((result) => {
    if (result.canceled) {
      // If the request was cancelled then don't do anything, not even call the callback;
      return cb(null, false);
    }

    fs.writeFile(result.filePath, stream, (err) => {
      return cb(err, true);
    });
  })
  .catch(cb);
}

/**
 * Abort and cleanup an existing collection run
 *
 * @param {String} executionId - The execution id to terminate or dispose
 * @param {Function} emit - emitter to call to denote the execution has terminated/disposed
 */
function disposeRun (executionId, emit = _.noop) {
  if (!executionId || !activeRuns[executionId]) {
    return;
  }

  const run = activeRuns[executionId];

  run.host && run.host.dispose && run.host.dispose();

  // dispose the reference
  activeRuns[executionId] = null;

  emit({ id: executionId, event: '__dispose__' });
}

/**
 * @public
 * Stops and disposes an existing collection run
 *
 * @param {String} executionId - The execution id to terminate or dispose
 * @param {Function} emit - emitter to call to denote the execution has terminated/disposed
 */
function stopRun (executionId, emit) {
  if (!executionId || !activeRuns[executionId]) {
    return;
  }

  const run = activeRuns[executionId];

  run.aborter && run.aborter.abort();
  run.abort();

  // Force call the stop event as postman-runtime will no longer call any event
  run.processor.call('abort', [null]);

  disposeRun(executionId, emit);
}

/**
 * @public
 * Pause the current collection run
 *
 * @param {String} executionId
 */
function pauseRun (executionId) {
  if (!executionId || !activeRuns[executionId]) {
    return;
  }

  activeRuns[executionId].pause();
}

/**
 * @public
 * Resume the paused current collection run
 *
 * @param {String} executionId
 */
function resumeRun (executionId) {
  if (!executionId || !activeRuns[executionId]) {
    return;
  }

  activeRuns[executionId].resume();
}

/**
 * @public
 * Start a collection run with the given collection and variables
 *
 * @param {Object} info
 * @param {Object} collection
 * @param {Object} variables
 * @param {Object} options
 */
function startRun (info, collection, variables, options = {}, cookieStorageRemoteClient, emit) {
  const sdkCollection = new postmanCollectionSdk.Collection(collection),

    // Create an event processor instance and handling runtime events
    eventProccessor = new EventProcessor(info.schema, (event, data, refs) => {
      emit({ id: info.id, event, data, refs });
    });

  let cookieJar;

  // We have the cookieStorageRemoteClient
  if (cookieStorageRemoteClient) {
    cookieJar = new CookieJar(cookieStorageRemoteClient, {
      programmaticAccess: options.cookieConfiguration,
      readFromDB: !_.get(info, 'cookie.runtimeWithEmptyJar', false),
      writeToDB: !_.get(info, 'cookie.disableRealtimeWrite', false),
      onCookieAccessDenied: (domain) => {
        let message = `Unable to access "${domain}" cookie store.` +
          ' Try whitelisting the domain in "Manage Cookies" screen.' +
          ' View more detailed instructions in the Learning Center: https://go.pstmn.io/docs-cookies';

        emit({
          name: 'log',
          namespace: 'console',
          data: {
            id: info.id,
            cursor: {},
            level: 'warn',
            messages: [message]
          }
        });
      }
    });

    _.set(options, ['requester', 'cookieJar'], cookieJar);
  }

  // fileResolver defined and we have PostmanFs
  if (options.fileResolver && !!PostmanFs) {
    let { workingDir, insecureFileRead, fileWhitelist } = options.fileResolver;

    _.set(options, 'fileResolver', new PostmanFs(workingDir || defaultWorkingDir, insecureFileRead, fileWhitelist));
  }

  // sanitize
  sanitizeRunOptions(options);

  // add variables
  variables.environment && (options.environment = new postmanCollectionSdk.VariableScope(variables.environment));
  variables.globals && (options.globals = new postmanCollectionSdk.VariableScope(variables.globals));

  collectionRunner.run(sdkCollection, options, function (err, run) {
    if (err) {
      pm.logger.error('RuntimeExecutionService~startRun - Error in starting the run', err);

      this.emit({ id: info.id, event: '__dispose__', error: true });
      return;
    }

    trackRun(info.id, run, eventProccessor);

    // Intercept beforeRequest and response and done events
    eventProccessor.intercept('beforeRequest', (_, __, ___, ____, aborter) => {
      addAborter(info.id, aborter);
    });

    eventProccessor.intercept('response', (err, _, response) => {
      removeAborter(info.id);

      // If the response is present, and download is set then
      if (!err && response && info.download) {
        saveStreamToFile(response.contentInfo(), response.stream, (err, success) => {
          // If there is an error success then emit the download event
          (err || success) && eventProccessor.call('download', [err]);
        });
      }
    });

    eventProccessor.intercept('done', () => {
      if (info.cookie && info.cookie.saveAfterRun && cookieJar && typeof cookieJar.updateStore === 'function') {
        // TODO - DECIDE on what to do with cookies when there was an error in done
        cookieJar.updateStore(() => {
          disposeRun(info.id, emit);
        });

        return;
      }
      disposeRun(info.id, emit);
    });

    // Note: .handlers should be called after all interceptors have been attached
    // else events not part of schema will be ignored
    run.start(eventProccessor.handlers());
  });
}

/**
 * @public
 * LivePreview: Calling runtime's `dryRunRequest` to get previewed request
 *
 * @param {Request} request
 * @param {Object} info
 * @param {Object} options
 * @param {Function} cb
 */
function previewRequest (request, options = {}, cookieStorageRemoteClient, cb) {
  let requestToPreview = new postmanCollectionSdk.Request(request),
    dryRunOptions = _.pick(options, ['implicitCacheControl', 'implicitTraceHeader', 'protocolProfileBehavior']),
    disableCookies = dryRunOptions.protocolProfileBehavior && dryRunOptions.protocolProfileBehavior.disableCookies;

  !disableCookies && CookieJar &&
    (dryRunOptions.cookieJar = new CookieJar(cookieStorageRemoteClient, { readFromDB: true, writeToDB: false }));

  try {
    dryRunRequest(requestToPreview, dryRunOptions, (err, previewedRequest) => {
      cb(err, previewedRequest && previewedRequest.toJSON());
    });
  }
  catch (e) {
    pm.logger.error('RuntimeExecutionService~previewRequest.dryRunRequest', e);
  }
}

/**
 * Checks if the given path is within the working directory
 */
function isInWorkingDir (workingDir, path) {
  return Boolean((new PostmanFs(workingDir))._resolve(path, false));
}

/**
 * Create Temporary File
 * @param name
 * @param content
 */
function createTemporaryFile (name, content, cb) {
  const basePath = app.getPath('temp'),
    tempFilePath = path.join(basePath, name);

  async.waterfall([
    // Attempt to clear the file if it already exists.
    // Note: We ignore the error here
    (next) => fs.unlink(tempFilePath, () => next()),

    // Write the contents of the temp directory
    (next) => fs.writeFile(tempFilePath, content, next)
  ], (err) => {
    cb(err && new SerializedError(err), tempFilePath);
  });
}

/**
 * Read file from filesystem
 * @param {String} id
 * @param {String} path
 */
function readFile (path, cb) {
  fs.readFile(path, (err, content) => {
    if (!err) {
      try {
        // From here on we will try detect the encoding and convert the buffer accordingly
        content = content.toString(detectEncoding(content));
      } catch (e) {
        err = new Error('Failed to detect encoding of the file content');
      }
    }

    return cb(err && new SerializedError(err), content);
  });
}

/**
 * Check if the given path has the required file-system access
 * @param {String} id
 * @param {String} path
 * @param {Boolean} writable
 */
function accessFile (path, writeable, cb) {
  // If no path is given then there is nothing to check
  if (!path) {
    return cb();
  }

  const perm = writeable ? (fs.constants.R_OK | fs.constants.W_OK) : (fs.constants.R_OK);

  fs.access(path, perm, (err) => {
    cb(err && new SerializedError(err));
  });
}

/**
 * Clear all cookies for the given partition id
 *
 * @param {String} partitionId Cookie partition id
 * @param {Function} cb
 */
function clearAllElectronCookies (partitionId, cb) {
  if (!partitionId) {
    return cb();
  }

  const partition = session.fromPartition(partitionId);

  // NOTE: This will clear all the cookies from this partition
  partition.clearStorageData({ storages: ['cookies'] })
    .then(() => cb && cb())
    .catch((err) => cb && cb(new SerializedError(err)));
}

// #endregion

// #region Raw WebSocket Request APIs

/**
 * Establish a websocket connection with given URL and configs
 *
 * @param {String} connectionId Connection id
 * @param {Object} config
 * @param {String} config.url Server URL
 * @param {Array} config.protocols sub-protocols
 * @param {String} config.options options
 *
 */
function wsConnect (connectionId, { url, headers, protocols = [], options = {} }, cb) {
  const ws = new WebSocket(url, protocols, _.assign(options, { headers }));

  openWSConnections[connectionId] = ws;

  ws.onOpen = ({ protocol, extensions }, request, response) => cb({ connectionId, event: 'open', data: { request, response, meta: { protocol, extensions } } });

  ws.onUpgrade = (request, response) => cb({
    connectionId,
    event: 'upgrade',
    data: { request, response }
  });

  ws.onMessage = (message, meta) => cb({ connectionId, event: 'message', data: { message, meta } });

  ws.onError = (error, request, response) => cb({ connectionId, event: 'error', data: { error, request, response } });

  ws.onClose = (code, reason) => cb({ connectionId, event: 'close', data: { code, reason } });

  ws.onReconnect = () => cb({ connectionId, event: 'reconnect' });

  ws.onEnd = (code, reason) => {
    cb({ connectionId, event: 'end', data: { code, reason, aborted: ws.isConnectionAborted } });

    // For cases when connection is closed from server
    delete openWSConnections[connectionId];
  };
 }

/**
 * Send message over the existing websocket connection
 *
 * @param {String} connectionId Connection id
 * @param {Array|Number|Object|String|ArrayBuffer|Buffer|DataView|TypedArray} payload
 * @param {Object} options
 * @param {Function} cb - An optional callback which is invoked when data is written out.
 */
function wsSend (connectionId, payload, options = {}, cb) {
  if (!connectionId) {
    return;
  }

  const ws = openWSConnections[connectionId];

  if (!ws) {
    return;
  }

  ws.send(payload, options, cb);
}

/**
 * Close a websocket connection
 *
 * @param {String} connectionId Connection Id
 */
function wsDisconnect (connectionId) {
  if (!connectionId) {
    return;
  }

  const ws = openWSConnections[connectionId];

  if (!ws) {
    return;
  }

  ws.close(1000);

  delete openWSConnections[connectionId];
}

/**
 * Disposes off all open websocket (raw + socketIO) request connections
 *
 * @param {Array} connectionIds IDs of connection that needs to closed
*/
function wsBulkDisconnect (connectionIds = []) {
  connectionIds.forEach((connectionId) => {
    const connectionInstance = openWSConnections[connectionId];

    if (!connectionInstance) {
      return;
    }

    connectionInstance.close();
  });
}

// #endregion

// #region SocketIO Request APIs

/**
 * Establish a websocket connection with given URL and configs
 *
 * @param {String} connectionId Connection id
 * @param {Object} config
 * @param {String} config.url Server URL
 * @param {Array} config.protocols sub-protocols
 * @param {String} config.options options
 *
 */
function socketIOConnect (connectionId, { url, headers, listeners = [], options = {} }, cb) {
  const socket = new SocketIOClient(url, listeners, _.assign(options, { headers }));

  openWSConnections[connectionId] = socket;

  socket.onConnect = (request, response) => cb({ connectionId, event: 'connect', data: { request, response } });

  socket.onMessage = (message, meta) => cb({ connectionId, event: 'message', data: { message, meta } });

  socket.onError = (error, request, response) => cb({ connectionId, event: 'error', data: { error, request, response } });

  socket.onReconnect = () => cb({ connectionId, event: 'reconnect' });

  socket.onEnd = (reason) => {
    cb({ connectionId, event: 'end', data: { reason, aborted: socket.isConnectionAborted } });

    // For cases when connection is closed from server
    delete openWSConnections[connectionId];
  };
 }

/**
 * Send message over the existing websocket connection
 *
 * @param {String} connectionId Connection id
 * @param {Array|Number|Object|String|ArrayBuffer|Buffer|DataView|TypedArray} payload
 * @param {Object} options
 * @param {Function} cb - An optional callback which is invoked when data is written out.
 */
function socketIOPublish (connectionId, event, payload, options, cb) {
  if (!connectionId) {
    return;
  }

  const socket = openWSConnections[connectionId];

  if (!socket) {
    return;
  }

  socket.publish(event, payload, options, cb);
}

/** */
function socketIOSubscribe (connectionId, event, cb) {
  if (!connectionId) {
    return;
  }

  const socket = openWSConnections[connectionId];

  if (!socket) {
    return;
  }

  socket.subscribe(event, cb);
}

/** */
function socketIOUnsubscribe (connectionId, event, cb) {
  if (!connectionId) {
    return;
  }

  const socket = openWSConnections[connectionId];

  if (!socket) {
    return;
  }

  socket.unsubscribe(event, cb);
}

/**
 * Close a websocket connection
 *
 * @param {String} connectionId Connection Id
 */
function socketIODisconnect (connectionId) {
  if (!connectionId) {
    return;
  }

  const socket = openWSConnections[connectionId];

  if (!socket) {
    return;
  }

  socket.disconnect();

  delete openWSConnections[connectionId];
}

// #endregion

/**
 * Call a gRPC-related function
 *
 * @param {String} fnName The name of the gRPC-related function
 * @param {...Any} args The arguments passed to the function
 */
 async function grpc (fnName, ...args) {

  return grpcClient[fnName](...args);
}

// We have two places that this is going to be used main process in electron and the we agent, hence we expose two API's here
module.exports = function () {
  /* native-ignore:start */ // IMPORTANT: Do not remove this comment. Used by webpack to ignore this section

  const postmanRuntime = require('postman-runtime');
  const GRPCClient = require('./GRPCClient');

  fs = require('fs');
  os = require('os');
  path = require('path');
  chardet = require('chardet');
  app = require('electron').app;
  dialog = require('electron').dialog;
  session = require('electron').session;
  sanitizeFilename = require('sanitize-filename');
  postmanCollectionSdk = require('postman-collection');
  SerializedError = require('serialised-error');

  // These are present in the main directory
  WebSocket = require('./WebSocketClient');
  SocketIOClient = require('./SocketIOClient');
  CookieJar = require('./CookieJar');
  getSystemProxy = require('../../utils/getSystemProxy');

  PostmanFs = require('../utils/postmanFs'); // This is within the common folder

  collectionRunner = new postmanRuntime.Runner();
  dryRunRequest = postmanRuntime.Requester && postmanRuntime.Requester.dryRun;

  defaultWorkingDir = path.join(os.homedir(), 'Postman', 'files');
  grpcClient = new GRPCClient(defaultWorkingDir);

  isBrowser = false;


  // WARNING: Be very contingent of what is being exposed here. Some API's need native dependency that may not be available for the web
  // TODO: This needs a better api in-terms of DEPENDENCY INJECTION. Can be worked out alter to prevent bugs
  return {
    startRun,
    stopRun,
    pauseRun,
    resumeRun,
    previewRequest,

    // WebSocket Request
    wsConnect,
    wsSend,
    wsDisconnect,
    wsBulkDisconnect,

    socketIOConnect,
    socketIOPublish,
    socketIOSubscribe,
    socketIOUnsubscribe,
    socketIODisconnect,

    // gRPC Request
    grpc,

    // Only native
    isInWorkingDir,
    createTemporaryFile,
    readFile,
    accessFile,
    defaultWorkingDir,
    saveStreamToFile,
    clearAllElectronCookies
  };

  /* native-ignore:end */ // IMPORTANT: Do not remove this comment. Used by webpack to ignore this section
};


module.exports.Browser = async function () {
  // eslint-disable-next-line
  const postmanRuntime = await import(/* webpackChunkName: "postman-runtime" */ 'postman-runtime/dist');

  chardet = require('chardet');
  postmanCollectionSdk = require('postman-collection');
  SerializedError = require('serialised-error');
  CookieJar = require('./CookieJar');

  collectionRunner = new postmanRuntime.Runner();
  dryRunRequest = postmanRuntime.Requester && postmanRuntime.Requester.dryRun;

  isBrowser = true;


  return {
    startRun,
    stopRun,
    pauseRun,
    resumeRun,

    previewRequest,
    saveStreamToFile
  };
};
