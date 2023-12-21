const { ipcMain: actualIpcMain } = require('electron'),
  SerializedError = require('serialised-error'),
  CookieStorageRemoteClient = require('../../common/services/CookieStorageRemoteClient'),
  LinkableChannel = require('../../common/channels/LinkableChannel'),
  IPCChannel = require('../../common/channels/IPCChannel'),

  // This is a mapping between clientId and the respective CookieStorageRemoteClient instance
  // It is required so that in case of multiple clients, we are able to keep the
  // communication channel open with all the clients and use the correct cookieStorageRemoteClient
  // instance when a query/action needs to be performed.
  cookieStorageRemoteClientMap = new Map(),

  // A map to keep track of all clients associated with each of the opened windows
  // This is required for clean up during window close event.
  windowToClientMap = new Map(),

  // A map between the clientId and the set of all open websocket request connection ids
  // This is required for clean up during window close event.
  clientToWSConnectionMap = new Map();

/**
 * Agent interface to start listening and running
 */
function start (R, done) {
  const ipcMain = pm.sdk.IPC;

  ipcMain.subscribe('runtime-ipc-command', (event, clientId, message) => {
    if (message.namespace === 'init' && message.name === 'mapClientToWindow') {
      const windowId = message.data && message.data.windowId,
        clientIds = windowToClientMap.get(windowId) || new Set();

      // Map the client id to its window
      // This is done for enabling us to do the required cleanup when a window closes
      clientIds.add(clientId);
      windowToClientMap.set(windowId, clientIds);

      // Listen to close event for requester window,
      // 1.to clean the attached cookieStorageRemoteClient instances
      // 2.to close all open websocket request connections
      pm.eventBus.channel('requester-window-events').subscribe((windowEvent) => {
        if (!windowEvent || windowEvent.type !== 'window-closed') {
          return;
        }

        const closedWindowId = windowEvent.windowId,
          clientIdsForClosedWindow = windowToClientMap.get(closedWindowId);

        // No client for this window, bail out
        if (!clientIdsForClosedWindow || clientIdsForClosedWindow.size === 0) {
          return;
        }

        clientIdsForClosedWindow.forEach((clientId) => {
          // Delete cookieStorageRemoteClient instances for each client
          cookieStorageRemoteClientMap.delete(clientId);

          // Clean up all open websocket connections
          R.wsBulkDisconnect(Array.from(clientToWSConnectionMap.get(clientId) || []));
          clientToWSConnectionMap.delete(clientId);
        });

        // Delete clientId mapping for closed window
        windowToClientMap.delete(closedWindowId);
      });

      return;
    }

    if (message.namespace === 'execution' && message.name === 'terminate') {
      R.stopRun(message.data.execution, (message) => {
        event.reply('runtime-ipc-event', message);
      });

      return;
    }

    if (message.name === 'execute') {
      R.startRun(message.data.info, message.data.collection, message.data.variables, message.data.options, cookieStorageRemoteClientMap.get(clientId), (message) => {
        event.reply('runtime-ipc-event', message);
      });
      return;
    }

    if (message.namespace === 'execution' && message.name === 'pause') {
      R.pauseRun(message.data.execution, (message) => {
        event.reply('runtime-ipc-event', message);
      });
    }

    if (message.namespace === 'execution' && message.name === 'resume') {
      R.resumeRun(message.data.execution, (message) => {
        event.reply('runtime-ipc-event', message);
      });
    }

    if (message.namespace === 'cookie' && message.name === 'initializeManager') {
      cookieStorageRemoteClientMap.set(clientId, new CookieStorageRemoteClient((request) => {
        event.reply('runtime-ipc-cookie-request', request);
      }));
    }
  });

  ipcMain.subscribe('runtime-ipc-cookie-response', (event, clientId, message) => {
    const cm = cookieStorageRemoteClientMap.get(clientId);

    cm && cm.handleResponse(message);
  });

  ipcMain.handle('runtime-ipc-cb', async (e, clientId, event, fn, args) => {
    return new Promise((resolve) => {


      if (event === 'runtime' && fn === 'previewRequest') {
        return R.previewRequest(...args, cookieStorageRemoteClientMap.get(clientId), (err, result) => {
          resolve([err, result]);
        });
      }

      if (event === 'oauth2' && fn === 'clearAllCookies') {
        // Clearing all the electron cookies as only
        // OAuth2 cookies are stored in the electron session
        return R.clearAllElectronCookies(...args, (err) => {
          resolve([err]);
        });
      }

      if (event === 'files' && fn === 'create-temp') {
        return R.createTemporaryFile(...args, (err, tempFilePath) => {
          resolve([err, tempFilePath]);
        });
      }

      if (event === 'files' && fn === 'read') {
        return R.readFile(...args, (err, content) => {
          resolve([err, content]);
        });
      }

      if (event === 'files' && fn === 'access') {
        return R.accessFile(...args, (err) => {
          resolve([err]);
        });
      }

      if (event === 'files' && fn === 'saveResponse') {
        return R.saveStreamToFile(...args, (err, success) => {
          resolve([err, success]);
        });
      }

      return resolve([]);
    });
  });

  ipcMain.subscribe('ws-ipc-command', (event, clientId, message) => {
    const connectionIds = clientToWSConnectionMap.get(clientId) || new Set();

    if (message.name === 'wsConnect') {
      R.wsConnect(message.data.connectionId, message.data.connectionConfig, (message) => {
        event.reply('ws-ipc-event', message);

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

  ipcMain.handle('ws-ipc-cb', async (e, clientId, event, fn, args) => {
    return new Promise((resolve) => {
      if (event === 'ws' && fn === 'wsSend') {
        return R.wsSend(...args, () => { resolve([]); });
      }

      return resolve([]);
    });
  });

  ipcMain.subscribe('socketIO-ipc-command', (event, clientId, message) => {
    const connectionIds = clientToWSConnectionMap.get(clientId) || new Set();

    if (message.name === 'socketIOConnect') {
      R.socketIOConnect(message.data.connectionId, message.data.connectionConfig, (message) => {
        event.reply('socketIO-ipc-event', message);

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

  ipcMain.handle('socketIO-ipc-cb', async (e, clientId, event, fn, args) => {
    return new Promise((resolve) => {
      if (event === 'socketIO' && fn === 'socketIOPublish') {
        return R.socketIOPublish(...args, () => { resolve([]); });
      }

      if (event === 'socketIO' && fn === 'socketIOSubscribe') {
        return R.socketIOSubscribe(...args, () => { resolve([]); });
      }

      if (event === 'socketIO' && fn === 'socketIOUnsubscribe') {
        return R.socketIOUnsubscribe(...args, () => { resolve([]); });
      }

      return resolve([]);
    });
  });

  ipcMain.handle('grpc-ipc', async (e, fnName, args) => {
    let result;

    try {
      result = await R.grpc(fnName, ...args);
    } catch (err) {
      const serializedError = new SerializedError(err);

      return { error: serializedError };
    }

    if (result instanceof LinkableChannel) {
      const ipcChannel = new IPCChannel(e.sender, actualIpcMain);
      result.link(ipcChannel);
      return {
        result: Object.assign({}, result),
        channel: ipcChannel.getId()
      };
    }

    return { result };
  });

  ipcMain.subscribe('postman-runtime-ipc-sync', (event, fn, args) => {
    if (fn === 'isInWorkingDir') {
      return event.returnValue = R.isInWorkingDir(...args);
    }
  });

  pm.logger.info('RuntimeIPCAgent~started: Success');

  done && done();
}

module.exports = { start };
