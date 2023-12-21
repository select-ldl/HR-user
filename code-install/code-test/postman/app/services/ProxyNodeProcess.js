// pm.sdk containing ipc, logger will be available here

const electronProxy = require('./electronProxy').electronProxy,
  _ = require('lodash');

const ipcProxy = pm.sdk.ipc;

/**
 * Attach IPCNode to subscribe to messages to the current node process
 */
function attachIpcListeners () {
  ipcProxy.subscribeOnce('proxy-start-server', async () => {
    pm.logger.info('Start proxy server');

    electronProxy.startProxy(process.env.port, proxyClosedCallback, capturedRequestCallback,
      proxyStartErrorCallback, proxyStartSuccessCallback, proxyErrorCallback);
  });
}

/**
 * Callback on proxy close
 */
function proxyClosedCallback () {
  pm.logger.info('Sending Proxy server stopped ack');
}

/**
 * Callback on proxy error
 */
function proxyErrorCallback (err) {
  pm.logger.info('Error from proxy', err);
  ipcProxy.broadcast('proxy-error', err);
}

/**
 *
 * @param {*} url
 * @param {*} method
 * @param {*} headers
 * @param {*} data
  * @param {*} res
 * @param {*} timeTaken
 */
function capturedRequestCallback (url, method, headers, data, res, timeTaken) {
  if (!data) {
    data = '';
  }
  ipcProxy.broadcast('proxy-request-captured',
    {
      url: url,
      method: method,
      headers: headers,
      data: data,
      response: res,
      timeTaken: timeTaken
    }
  );
}

/**
 *
 * Notifies the renderer process if there is an error while starting proxy
 *
 * @param {Object} error - error object
 * @param {String} error.message - error message
 */
function proxyStartErrorCallback (err) {
  pm.logger.info('broadcasting proxy start error ipc message', err);
  ipcProxy.broadcast('proxy-start-error', {
    error: err,
    errorCode: _.get(err, ['error', 'code']),
    message: _.get(err, 'message')
  });
}

/**
 * Notifies the renderer process when the proxy is started successfully
 */
function proxyStartSuccessCallback () {
  pm.logger.info('broadcasting proxy start success ipc message');
  ipcProxy.broadcast('proxy-notif', {
    action: 'start',
    result: 'success'
  });
}

ipcProxy.onReady(() => {
  pm.logger.info('the ipc is ready for communication');
  attachIpcListeners();
});

ipcProxy.onClose(() => {
  pm.logger.info('The Proxy IPC is closed for now. The ipc server will be restarted and ready event will be emitted soon on success.');
});

pm.logger.info('ProxyNodeProcess~entryModule~cwd', process.cwd());
