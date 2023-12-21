const electron = require('electron'),
      app = electron.app,
      BrowserWindow = electron.BrowserWindow,
      _ = require('lodash'),
      path = require('path'),
      url = require('url'),
      { getEventName, getEventNamespace } = require('../common/model-event'),
      FileService = require('../common/services/FileService'),
      { encodeBase122, decodeBase122 } = require('../common/utils/base122EncodeDecode'),

      CONFIG_FILE_PATH = path.resolve(app.getPath('userData'), 'Postman_Config', 'proxy'),
      DEFAULT_PROXY_CONFIG = null,
      AUTH_WINDOW_OPTIONS = {
        width: 400,
        height: 320,
        frame: false,
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        alwaysOnTop: true,
        webPreferences: {
          nodeIntegration: true,
          partition: 'proxyConfig',
          devTools: false,
          enableRemoteModule: true,
          contextIsolation: false,
          preload: path.resolve(app.getAppPath(), 'preload/desktop/index.js')
        }
      };

class CloudProxyManager {
  constructor () {
    this._proxyAuthWindow = null;
    this._pendingAuthCbs = new Set();
    this._authCancelled = false;

    this._proxyConfig = DEFAULT_PROXY_CONFIG;
  }

  get _shouldAuthenticateRequest () {
    return !this._authCancelled && !this._proxyAuthWindow;
  }

  /**
   * Initialize CloudProxyManager
   */
  init (cb) {

    // The doesFileExist function needs to enclose only the read()
    // function of FileService. If the file cannot be read or,
    // if an error occurs in read(), then the default proxy
    // config will be set.
    FileService.doesFileExist(CONFIG_FILE_PATH)
      .then((fileStatus) => {

        // If the file is does not exist, this if block
        // adds a log stating that a proxy has not been
        // setup and returns.
        if (!fileStatus) {
          this._proxyConfig = DEFAULT_PROXY_CONFIG;
          pm.logger.info('Proxy configuration has not been setup');
          return;
        }

        // If there is any error while reading the file, then the catch clause of the
        // outer promise will handle it.
        return FileService.read(CONFIG_FILE_PATH)
          .then((configData) => {
            let parsedConfig = JSON.parse(decodeBase122(configData));
            this._proxyConfig = this.sanitizeConfig(parsedConfig);
          });

      })

      .catch((err) => {
        pm.logger.warn('Proxy configuration file cannot be read - ', err);
        this._proxyConfig = DEFAULT_PROXY_CONFIG;
      })

      .then(() => {
        app.on('login', (event, webContents, request, authInfo, proxyAuthCb) => {
          // If the login event is not coming from a proxy server, we bail out
          if (!authInfo.isProxy) {
            return;
          }

          pm.logger.info('CloudProxyManager~login: Received login event for proxy authentication with auth type - ', authInfo.scheme);

          if (!this._shouldAuthenticateRequest) {
            pm.logger.info('CloudProxyManager~login: Bailing out of login flow');
            return;
          }

          event.preventDefault();

          if (this._proxyConfig && this._proxyConfig.auth) {
            pm.logger.info('CloudProxyManager~login: Credentials already present. Authenticating user');
            proxyAuthCb(this._proxyConfig.auth.username, this._proxyConfig.auth.password);

            return;
          }

          // Saving the address of the proxy server
          this.resolveProxy(request.url, (err, proxyServer, authInfo) => {
            if (err) {
              pm.logger.warn('CloudProxyManager~resolveProxy: Error while resolving proxy for url');
              return;
            }

            this._proxyConfig = _.assign({}, this._proxyConfig, { proxyServer: proxyServer });
          });

          this.openProxyAuthWindow();
        });

        // Setting up listener to listen for logout and switch user events. We need to close the auth window
        // when the current user logs out or switches account
        pm.eventBus.channel('model-events').subscribe((event) => {
          let eventName = getEventName(event),
              eventNamespace = getEventNamespace(event);

          if ((eventNamespace === 'users' && eventName === 'switch') || (eventNamespace === 'user' && eventName === 'logout')) {
            if (!this._proxyAuthWindow) {
              return;
            }

            pm.logger.info('CloudProxyManager: Closing proxy authentication window as user logged out/switched account');
            this.closeProxyAuthWindow();
          }
        });

        this.attachProxyEventListeners();

        pm.logger.info('CloudProxyManager~init - Success');
        cb();
      }).catch((e) => {
        pm.logger.warn('CloudProxyManager~init - Failed with error', e);
        cb();
      });
  }

  /**
   * Open a new BrowserWindow for the user to enter their credentials
   */
  openProxyAuthWindow () {
    pm.logger.info('CloudProxyManager~openProxyAuthWindow: Opening proxy auth window');

    this._proxyAuthWindow = new BrowserWindow(AUTH_WINDOW_OPTIONS);

    this._proxyAuthWindow.loadURL(this.getProxyAuthHTML());
    this._proxyAuthWindow.show();
  }

  /**
   * Close the authentication BrowserWindow
   */
  closeProxyAuthWindow () {
    pm.logger.info('CloudProxyManager~closeProxyAuthWindow: Closing proxy auth window');

    this._proxyAuthWindow && this._proxyAuthWindow.close();
    this._proxyAuthWindow = null;
  }

  /**
   * Save the credentials entered by the user to a file
   */
  saveProxyConfig () {
    return FileService.write(CONFIG_FILE_PATH, encodeBase122(this._proxyConfig));
  }

  /**
   * Save the credentials entered by the user to a file and then restart the app
   */
  saveConfigAndRestartApp () {
    this.saveProxyConfig()
      .then(() => {
        pm.logger.info('CloudProxyManager~saveConfigAndRestartApp: Config saved. Restarting app');

        app.relaunch();
        app.quit();
      })
      .catch((err) => {
        pm.logger.warn('CloudProxyManager~saveConfigAndRestartApp: Error while saving config: ', err);
      });
  }

  /**
   * Here we attach event listeners to listen for the following events -
   * 1. handleProxyAuthSubmit - This is the case when the user submits their credentials. In this
   *                            case, we get the credentials from the BrowserWindow and then call
   *                            authCb with the values to authenticate the user.
   * 2. handleProxyAuthCancel - This is the case when the user cancels the authentication. In this
   *                            case, we simply close the BrowserWindow.
   */
  attachProxyEventListeners () {
    const ipcMain = pm.sdk.IPC;

    ipcMain.subscribe('handleProxyAuthSubmit', (event, credentials = {}) => {
      // Caching the credentials entered by the user so that we can authenticate any future requests
      // automatically without having to prompt the user again for credentials.
      this._proxyConfig = this.sanitizeConfig(_.assign({}, this._proxyConfig, { auth: { username: credentials.username, password: credentials.password } }));


      pm.logger.info('CloudProxyManager~handleProxyAuthSubmit: Credentials submitted by user');

      this.closeProxyAuthWindow();
      this.saveConfigAndRestartApp();
    });

    ipcMain.subscribe('handleProxyAuthCancel', (event) => {
      pm.logger.info('CloudProxyManager~handleProxyAuthCancel: Authentication cancelled by user');

      this.closeProxyAuthWindow();
      this._authCancelled = true;
    });
  }

  /**
   * Resolves the proxy server for a given url. The callback given is then called
   * with the following arguments -
   * err -> error object (if there is an error. Otherwise it is null)
   * proxy -> String representing the proxy server. It is of the format 'DIRECT' || 'PROXY [host]:port;PROXY [host]:port;...'
   *          Example - 'PROXY [http://0.0.0.0]:8080;DIRECT;PROXY 0.0.0.0:8081'
   * authInfo -> An object containing the username and password if the proxy requires authentication
   *
   * @param {String} url - The url that the proxy server is to be resolved for
   * @param {Function} cb - Callback
   */
  resolveProxy (url, cb) {
    if (!url || !_.isFunction(cb)) {
      pm.logger.warn('CloudProxyManager~resolveProxy: Invalid parameter(s) given');
      return;
    }

    let defaultSession = electron.session.defaultSession;

    defaultSession.resolveProxy(url).then((proxy) => {
      let authInfo;

      if (this._proxyConfig && (proxy === this._proxyConfig.proxyServer)) {
        authInfo = {
          username: _.get(this._proxyConfig, 'auth.username'),
          password: _.get(this._proxyConfig, 'auth.password')
        };
      }

      cb(null, proxy, authInfo);
    }, (err) => {
      cb(err);
    });
  }

  getProxyAuthHTML () {
    let htmlPath = path.resolve(__dirname, '..', 'html');
    let authUrl = process.env.PM_BUILD_ENV !== 'development' ?
                url.format({ protocol: 'file', pathname: path.resolve(htmlPath, 'proxyAuth.html') }) :
                'http://localhost:8777/build/html/proxyAuth.html';

    return `${authUrl}?sessionId=${app.sessionId}&logPath=${app.logPath}`;
  }

  /**
   * Checks if the proxy config schema is valid or not. If it is not, returns the DEFAULT_PROXY_CONFIG.
   *
   * @param {Object} proxyConfig
   *
   * @returns {Object}
   */
  sanitizeConfig (proxyConfig) {
    let isConfigValid = true;

    // Here, we are checking if the proxyConfig object is valid or not. Cases being checked are -
    // 1) If the proxy config object does not exist, it is invalid
    // 2) If the auth object inside the proxyConfig does not exist, it is invalid
    // 3) If the auth object exists but username is undefined, we assume that the we have not
    //    received any credentials and that we need not store any auth values, so we fallback to the default
    if (!proxyConfig || !proxyConfig.auth || proxyConfig.auth.username === undefined) {
      isConfigValid = false;
    }

    return isConfigValid ? proxyConfig : DEFAULT_PROXY_CONFIG;
  }
}

module.exports = new CloudProxyManager();
