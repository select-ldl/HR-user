let path = require('path'),
  { windowManager } = require('./windowManager'),
  _ = require('lodash'),
  ProxyUsageTracker = require('./ProxyUsageTracker'),
  { v4: uuid } = require('uuid');

const proxyModulePath = path.resolve(__dirname, './ProxyNodeProcess.js'),
  releaseChannel = _.lowerCase(require('./AppConfigService').getConfig('__WP_RELEASE_CHANNEL__')),
  PROXY_PROCESS_IDENTIFIER = `proxy_node_process_${releaseChannel}`;

class ProxyMainManager {

  constructor () {
    this.proxyNodeProcess = null;
    this.proxyIpcNode = null;
    this.proxyState = 'off';
    this.sessionId = null;
    this.proxyUsageTracker = null;
  }

  _resetMainManager () {
    this.proxyNodeProcess = null;
    this.proxyIpcNode = null;
    this.proxyState = 'off';
    this.proxyUsageTracker && this.proxyUsageTracker.reset();
  }

  /**
   * Starts a node process to run proxy server
   * All communication with the proxy server will be through IPC
   *
   * @param {Object} options
   * @param {Object} options.env - contains the current process env as well
   * @param {Number} options.env.port - port on which proxy server should listen to
   * @param {String} options.env.STORE_LOC - path where user data is stored
   */
  startProxyProcess (options) {

    this.proxyNodeProcess = pm.sdk.NodeProcess.spawn(proxyModulePath, PROXY_PROCESS_IDENTIFIER, options);
    pm.logger.info(proxyModulePath);

    // Proxy Node process
    this.proxyNodeProcess.onReady(() => {
      pm.logger.info('The proxy node process is ready');
      this.attachProxyIpcNode();
    });
    this.proxyNodeProcess.onExit((code, signal) => {
      // Process terminated with error.
      if (code !== 0) {
        pm.logger.info(`~ProxyNodeProcess~ - subprocess exited with code: ${code}`);
        if (signal) {
          pm.logger.info(`in response to signal ${signal}`);
        }
      }
      pm.logger.info('Terminated with', code);
      this._resetMainManager();
    });
  }

  _recordSessionStart () {
    this.sessionId = uuid();
    this.proxyUsageTracker = new ProxyUsageTracker();
    this.proxyUsageTracker.recordProxyStart();

    // Broadcast proxy start details
    windowManager.sendInternalMessage({
      event: 'proxyUsageStats',
      'object': 'startProxyServer',
      'object2': this.sessionId
    });
  }

  recordCaptureStats () {
    if (this.isProxyConnected()) {
      this.proxyUsageTracker.incrementRequestCaptured();
    }
  }

  _recordSessionEnd () {
    this.proxyState = 'off';
    this.proxyUsageTracker.recordProxyStop();

    // Send usage information to
    if (this.proxyUsageTracker.startTime) {
      windowManager.sendInternalMessage({
        event: 'proxyUsageStats',
        'object': 'stopProxyServer',
        'object2': this.sessionId,
        'object3': this.proxyUsageTracker.getSessionTime(),
        'object4': this.proxyUsageTracker.getNumRequestsCaptured()
      });
    }

    // Reset after reporting usage
    this.proxyUsageTracker.reset();
  }

  /**
   * Sends message to proxy process to start the proxy server
   */
  sendStartProxyServer () {
    pm.logger.info('Proxy IPC Node created?', !_.isNil(this.proxyIpcNode));
    this.proxyIpcNode && this.proxyIpcNode.invoke('proxy-start-server');
  }

  /**
   * Creates and attaches the IPCNode for communication with proxy node process
   */
  attachProxyIpcNode () {
    // Detach previous ipc Node
    this.detachProxyIpcNode();

    this.proxyIpcNode = new pm.sdk.IPCNode(PROXY_PROCESS_IDENTIFIER, pm.logger);
    this.proxyIpcNode.onConnect(() => {
      pm.logger.info('ProxyIPCNode~node process client ipc connection successfully established');

      // Send internal message to renderer to connect an IPCNode
      windowManager.sendInternalMessage({
        event: 'connectProxyIpcNode'
      });

      this.proxyIpcNode.subscribe('proxy-start-error', async (message) => {
        // Kill proxy process if error on start
        this.killProxyProcess();
        pm.logger.error('ProxyIPCNode~Failed to start proxy', message.error);
        console.log('ProxyIPCNode~Failed to start proxy', message.error);
      });

      this.proxyIpcNode.subscribe('proxy-error', async (message) => {
        switch (message.type) {
          case 'opensslError': {
            windowManager.sendInternalMessage({
              event: 'proxyOpensslError'
            });
            break;
          }
        }
      });

      // Only listen to proxy start as proxy end will be called from killProcess
      this.proxyIpcNode.subscribe('proxy-notif', async (notifResult) => {
        pm.logger.info('received an ipc proxy-notif', notifResult);
        const { action, result } = notifResult;
        if (action === 'start' && result === 'success') {
          this.proxyState = 'on';
          this._recordSessionStart();
        }
      });
    });
  }

  /**
   * Detaches IPCNode to abandon communication with proxy node process
   */
  detachProxyIpcNode () {
    try {
      this.proxyIpcNode && this.proxyIpcNode.dispose();
      this.proxyIpcNode = null;
    } catch (e) {
      pm.logger.error('ProxyIPCNode~Error in detaching IPCNode for proxy process', e);
    }
  }

  /**
   * Tries to kill the node process and waits till is it killed
   *
   * @returns {Boolean} - true if the proxy node process was killed, false otherwise
   */
  killProxyProcess () {
    if (this.isProxyConnected()) {
      this._recordSessionEnd();
      try {
        if (this.proxyNodeProcess) {
          !this.proxyNodeProcess.isKilled() && this.proxyNodeProcess.kill();
          while (!this.proxyNodeProcess.isKilled()) {}
          this.proxyNodeProcess = null;
        }
        pm.logger.info('Killed Proxy node process');
        return true;
      } catch (e) {
        pm.logger.error('Could not kill Proxy node process', e);
        return false;
      }
    }
  }

  /**
   * Get the status of proxy
   *
   * @returns {Boolean} - true if proxy is connected, false otherwise
   */
  isProxyConnected () {
    return this.proxyState === 'on';
  }
}

module.exports = ProxyMainManager;
