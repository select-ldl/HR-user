// IMPORTANT: This file needs to be loaded as early as possible when the app starts
require('./preload');

var electron = require('electron'),
    fs = require('fs'),
    app = electron.app,
    BrowserWindow = electron.BrowserWindow,
    Menu = electron.Menu,
    dialog = electron.dialog,
    circularJSON = require('circular-json'),
    _ = require('lodash').noConflict(),
    async = require('async'),
    menuManager = require('./services/menuManager').menuManager,
    windowManager = require('./services/windowManager').windowManager,
    authHandler = require('./services/AuthHandler'),
    authHandlerAdapter = require('./services/adapters/AuthHandlerAdapter'),
    appSettings = require('./services/appSettings').appSettings,
    { getOrCreateInstallationId } = require('./services/id'),
    setupOAuth2WindowManager = require('./services/OAuth2WindowManager').initialize,
    os = require('os'),
    initializeEventBus = require('./common/initializeEventBus'),
    { isAppUpdateEnabled } = require('./services/AutoUpdaterService'),
    bootstrapModels = require('./bootstrap-models'),
    gpu = require('./services/gpu'),
    updaterHandler = require('./services/UpdaterHandler'),
    devtoolsInstaller = require('./services/devtoolsInstaller'),
    enterpriseUtils = require('./services/enterpriseUtil'),

    RuntimeIPCAgent = require('./runtime/agents/IPCAgent'),
    RuntimeExecutionService = require('./common/services/RuntimeExecutionService'),

    ProtocolHandler = require('./services/ProtocolHandler'),
    ipcClient = require('./services/ipcClient').ipcClient,
    initializeLogger = require('./services/Logger').init,
    initializePluginsHostHandler = require('./services/PluginsHostHandler').init,
    cleanupPluginsHostHandler = require('./services/PluginsHostHandler').cleanup,
    CrashReporter = require('./services/CrashReporter'),
    { getValue } = require('./utils/processArg'),
    { createDefaultDir } = require('./services/workingDirManager'),
    initializeAppBootListener = require('./common/services/AppBootListener'),
    interceptorBridgeInstaller = require('./services/interceptorBridgeInstaller').installer,
    ipcClientInitialized = false,
    cloudProxyManager = require('./services/CloudProxyManager'),
    leaderSelection = require('./services/LeaderSelection'),
    proxyCertificateService = require('./services/proxyCertificateService'),
    ProxyMainManager = require('./services/ProxyMainManager'),
    architectureService = require('./services/ArchitectureService'),
    proxyMainManager = new ProxyMainManager();

const MOVE_DIALOG_MESSAGE = '移至应用程序文件夹?',
      MOVE_DIALOG_ACTION_BUTTON = '移至应用程序文件夹',
      MOVE_DIALOG_CANCEL_BUTTON = '不移动',
      MOVE_DIALOG_CHECKBOX_MESSAGE = '不要再提醒我了',
      MOVE_DIALOG_DETAILS = '如果您愿意,我可以将自己移至应用程序文件夹. 这将确保将来的更新将被正确安装.',

      SUPPORT_LINK = 'https://go.pstmn.io/troubleshoot-could-not-open',
      COULD_NOT_OPEN_DIALOG_TITLE = '无法打开Postman',
      COULD_NOT_OPEN_DIALOG_MESSAGE = '请尝试重新启动该应用程序. 如果问题仍然存在,请参阅' + SUPPORT_LINK;

// We upgraded Electron to v7 that comes with node v12 in Postman v7.25.1. The default minimum
// supported version of TLS in node v10 was v1 which was changed to v1.2 in node v12
// Due to this, users still using the old servers won't be able to use Postman to send request
// See https://github.com/postmanlabs/postman-app-support/issues/8565
// As a fix, we are overriding this default minimum version of TLS back to v1
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';

const ipcMain = pm.sdk.IPC;

try {
  // set the path for the directory storing app's configuration files
  getValue('user-data-path') && app.setPath('userData', getValue('user-data-path'));
}
catch (e) {
  pm.logger.error(e);
}

app.sessionId = process.pid; // set the current process id as sessionId

let gotTheLock = app.requestSingleInstanceLock();

// Quit if this is another instance of app trying to open
if (!gotTheLock) {
  pm.logger.info('Could not get the lock, quitting');
  app.quit();
  return;
}

// Initializing ProtocolHandler as early as possible to handle Run-In-Postman even when the app is closed.
// Recommended to do it on will-finish-launching event in electron docs - https://electronjs.org/docs/api/app#event-will-finish-launching
app.on('will-finish-launching', function () {
  ProtocolHandler.init();
});

// Disable GPU if needed. It is important to make sure this
// is done *before* the application emits the "ready" event,
// otherwise disabling the GPU might not have any effect.
if (gpu.shouldDisableGPU()) {
  gpu.disableGPU().catch((error) => {
    pm.logger.error('Main~GPU - Error while trying to disable GPU', error);
  });
} else {
  pm.logger.info('Not disabling GPU');
}

async.series([

  /**
   * Try creating the default working directory if running for the first time
   */
  (cb) => {
    appSettings.get('createdDefaultWorkingDir', (err, created) => {
      if (err) {
        pm.logger.error('Main~createDefaultWorkingDir - Error while trying to get from appSettings', err);
      }

      if (created) {
        pm.logger.info('Main~createDefaultWorkingDir - Default working dir creation already attempted');
        return cb();
      }

      // Record the attempt regardless of success of the creation. Prevents unnecessary attempts in
      // future.
      // @todo update the only update once successfull when robust file system API's are in place
      appSettings.set('createdDefaultWorkingDir', true);

      createDefaultDir((err) => {
        // Ignore any errors, this is single attempt flow
        if (err) {
          // Logging just for debugging
          pm.logger.error('Main~createDefaultWorkingDir - Error while creating default working dir', err);
        }

        return cb();
      });
    });
  },

  /**
   * Iniitialize crash reporter
   */
  CrashReporter.init,

  /**
   * initializeLogger
   */
  initializeLogger,

  (cb) => {
    // Initialize the devtools installer
    devtoolsInstaller.init(cb);
  },

  /**
   * Initialize the event bus in the global.pm object
   */
  (cb) => {

    // initializes event bus on global `pm` object
    initializeEventBus();
    cb(null);
  },

  (cb) => {
    cloudProxyManager.init(cb);
  },

  /**
   * Initialize the architecture service
   */
  (cb) => {
    architectureService.init();
    cb(null);
  },

  /**
   * It initialize the updateHandler and assigns the updaterInstance to the app object
   */
  (cb) => {
    // For enterprise application, do not intiialize the updateHandler
    if (enterpriseUtils.isEnterpriseApplication()) {
      cb();
    }
    else {
      updaterHandler.init((err, updaterInstance) => {
        app.updaterInstance = updaterInstance;
        cb(err);
      });
    }
  },

  /**
   * Start the Runtime IPC Agent
   */
  (cb) => {
    RuntimeIPCAgent.start(RuntimeExecutionService(), cb);
  },

  initializePluginsHostHandler

], (err) => {

  if (err) {
    // We are continue proceeding for now. even we see error.
    pm.logger.error('Main~booting: Failed', err);
  }

  leaderSelection.initialize();

  initializeAppBootListener();


  const eventBus = pm.eventBus;
  windowManager.eventBus = eventBus;

  // setup OAuth 2 window manager
  setupOAuth2WindowManager();

  // flag set to perform tasks before quitting
  app.quittingApp = false;

  /**
   * Populate installation id
   * it gets the installation id
   * and keep it in app object
   *
   */
  function populateInstallationId () {
    getOrCreateInstallationId()
    .then(({ id, isCreatedNow }) => {
      // Assign the values in app so that the renderers can make use of it.
      app.firstLoad = isCreatedNow;
      app.installationId = id;

      // Set the user scope for crash reporter
      CrashReporter.setUserScope({ app_id: app.installationId }, _.noop);
      CrashReporter.setExtraScope({ session: app.sessionId }, _.noop);
    })
    .catch((err) => {
      pm.logger.error('main~populateInstallationId: Failed to get or create installationId', err);
    });
  }

  /**
   * Setting whether App Updates are enabled or disabled
   */
  function populateUpdateSettings () {
    app.isUpdateEnabled = isAppUpdateEnabled();
  }

  /** */
  function attachIpcListeners () {
    ipcMain.subscribe('newConsoleWindow', function (event, arg) {
      windowManager.newConsoleWindow({}, arg);
    });

    ipcMain.subscribe('messageToElectron', function (event, arg) {
      if (arg.event === 'rendererProxyIpcNodeStart') {
        pm.logger.info('All communication channels established. Starting proxy server...');

        // Start proxy server
        proxyMainManager.sendStartProxyServer();
      } else if (arg.event === 'requestProxyState') {
        windowManager.sendInternalMessage({
          event: 'proxyStateResponse',
          'object': proxyMainManager.isProxyConnected()
        });
      }
      else if (arg.event === 'requestCaptured') {
        proxyMainManager.recordCaptureStats();
      }
      else if (arg.event === 'regenerateCertificates') {

        // Regenerating certificates in proxy to support android clients and hiding android banner
        proxyCertificateService.regenerateCertificates(app.getPath('userData'))
        .then(() => {
          pm.logger.info('Main~IPC-MessageToElectron - Certificates regenerated');

          // sending internal message to renderer to update showProxyBanner
          windowManager.sendInternalMessage({
            event: 'updateShowAndroidProxyBanner'
          });
        })
        .catch((e) => {
          pm.logger.error('Main~IPC-MessageToElectron - Error regenerating certificates');
        });
      }
      else if (arg.event === 'startProxy') {
        var port = 8080;
        if (arg.data && arg.data.port) {
          port = arg.data.port;
        }
        if (typeof port === 'string') {
          port = parseInt(port);
        }
        pm.logger.info('Main~IPC-MessageToElectron - Starting proxy on port: ' + port);
        try {
          var ret = 0;
          proxyMainManager.startProxyProcess({
            env: {
              port,
              STORE_LOC: app.getPath('userData'),
              ...process.env
            },
            inspect: false
          });

          // TODO: handle proxy close on user log-out
          // Setting up listener to listen for logout event. We need to close the proxy
          // when the current user logs out
          pm.eventBus.channel('model-events').subscribe((event) => {
            let eventName = _.get(event, 'name'),
              eventNamespace = _.get(event, 'namespace');

            if (eventNamespace === 'user' && eventName === 'logout') {
              try {
                proxyMainManager.killProxyProcess();
                windowManager.sendInternalMessage({
                  event: 'proxyNotif',
                  'object': 'stop',
                  'object2': 'success'
                });
              }
              catch (e) {
                windowManager.sendInternalMessage({
                  event: 'proxyNotif',
                  'object': 'stop',
                  'object2': 'failure'
                });
                pm.logger.error('Main~IPC-MessageToElectron - Error while stopping proxy: ', e);
              }
            }
          });

          event.sender.send('proxyStarted', ret);
        }
        catch (e) {
          // error while starting proxy
          pm.logger.error('Main~IPC-MessageToElectron - Error while starting proxy: ', e);
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'start',
            'object2': 'failure'
          });
        }
      }
      else if (arg.event === 'stopProxy') {
        try {
          proxyMainManager.killProxyProcess();
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'stop',
            'object2': 'success'
          });
        }
        catch (e) {
          windowManager.sendInternalMessage({
            event: 'proxyNotif',
            'object': 'stop',
            'object2': 'failure'
          });
        }
      }
      else if (arg.event === 'postmanInitialized') {
        // sent by the primary window when indexedDB has loaded
        windowManager.newRequesterOpened();
      }
      else if (arg.event === 'installInterceptorBridge') {
        interceptorBridgeInstaller.installInterceptorBridge();
      }
      else if (arg.event === 'checkInstallationStatus') {
        interceptorBridgeInstaller.checkInstallationStatus();
      }
      else if (arg.event === 'installNode') {
        try {
          interceptorBridgeInstaller.installNode();
        }
        catch (err) {
          console.log('Error occurred while installing Node: ', err);
        }
      }
      else if (arg.event === 'resetInterceptorBridgeInstallation') {
        interceptorBridgeInstaller.resetInstallation();
      }
      else if (arg.event === 'forwardInterceptorRequest') {
        ipcClient.sendEncryptedMessageToInterceptor(arg.message);
      }
      else if (arg.event === 'initializeInterceptorBridge') {
        // creating IPC bridge with native server
        if (!ipcClientInitialized) {
          ipcClient.initialize();
          ipcClientInitialized = true;
        }
        else {
          windowManager.sendInternalMessage({
            'event': 'refreshInterceptorBridgeConnectionStatus',
            'object': {
              connectedToInterceptorBridge: true
            }
          });
        }
      }
      else if (arg.event === 'disconnectInterceptorBridge') {
        ipcClient.disconnect();
      }

      else if (arg.event === 'setEncryptionKeyForInterceptor') {
        // setting the encryption key for App ~ Interceptor communication
        ipcClient.setEncryptionKeyForInterceptor(arg.message.encryptionKeyForInterceptor);

        if (ipcClientInitialized) {
          // checking for the same key at interceptor
          ipcClient.startKeyValidationFlow();
        }
      }
      else if (arg.event === 'getEncryptionKeyForInterceptor') {
        ipcClient.sendEncryptionKeyToRenderer();
      }
      else if (arg.event === 'getSyncDomainListForInterceptor') {
        ipcClient.sendSyncDomainListToRenderer();
      }
      else if (arg.event === 'fetchCustomEncryptionKey') {
        ipcClient.sendCustomEncryptionKeyToRenderer();
      }
    });


    ipcMain.handle('getSaveTarget', function (event, arg) {
      return new Promise((resolve, reject) => {
        showSaveDialog(event.sender, arg, (retPath) => {
          if (!retPath) {
            resolve(null);
          }
          else {
            resolve(retPath);
          }
        });
      });
    });

    ipcMain.subscribe('sendToAllWindows', function (event, arg) {
      try {
        let parsedArg = circularJSON.parse(arg);
        if (parsedArg.event === 'pmWindowPrimaryChanged') {
          windowManager.primaryId = arg.object;
          pm.logger.info('Main~IPC-sendToAllWindows - Primary Window set (id: ' + windowManager.primaryId + ')');
        }
        else if (parsedArg.event === 'quitApp') {
          windowManager.quitApp();
        }
        if (parsedArg.event !== 'quitApp') {
          windowManager.sendInternalMessage(parsedArg);
        }
      }
      catch (e) {
        pm.logger.warn('Main~IPC-sendToAllWindows - Malformed message, ignoring.', e);
      }
    });

    ipcMain.subscribe('newRequesterWindow', function (event, arg) {
      windowManager.newRequesterWindow({}, arg);
    });

    ipcMain.subscribe('reLaunchRequesterWindows', function () {
      windowManager.reLaunchRequesterWindows();
    });

    ipcMain.subscribe('closeRequesterWindow', function (event, arg) {
      windowManager.closedHandler(event, arg);
    });

    ipcMain.subscribe('closeWindow', (event, arg) => {
      var win = BrowserWindow.fromId(parseInt(arg));
      win && win.close();
    });

    ipcMain.subscribe('enableShortcuts', () => {
      menuManager.createMenu(false).then(() => {
        appSettings.set('shortcutsDisabled', false);
      });
    });

    ipcMain.subscribe('disableShortcuts', () => {
      menuManager.createMenu(true).then(() => {
        appSettings.set('shortcutsDisabled', true);
      });
    });
  }

  process.on('uncaughtException', function (e) {
    handleUncaughtError(e);
  });

  /**
   *
   * @param {*} e
   */
  function handleUncaughtError (e) {
    // Logger might not be there in this state, hence the safe check
    pm.logger && pm.logger.error('Main~handleUncaughtError - Uncaught errors', e) ||
      console.error('Main~handleUncaughtError - Uncaught errors', e); // eslint-disable-line no-console
  }

  /**
   *
   * @param {*} action
   * @param {*} url
   */
  function runPostmanShortcut (action) {
    if (action == 'newWindow') {
      windowManager.newRequesterWindow();
    }
    else {
      windowManager.sendToFirstWindow({
        name: action
      });
    }
  }

  // Quit when all windows are closed.
  app.on('window-all-closed', function () {
    if (process.platform != 'darwin' && windowManager.isFirstRequesterBooted) {
      app.quit();
    }
  });

  app.on('before-quit', function (event) {
    pm.logger.info('Quitting app');
    app.quittingApp = true;

    // Kill proxy before quitting
    proxyMainManager.killProxyProcess();

    // terminate the plugin process
    cleanupPluginsHostHandler();

    if (os.type() !== 'Linux') {
      app.updaterInstance = null;
    }
    else {
      event.preventDefault();
      appSettings.get('downloadedVersion', (err, downloadedVersion) => {
        if (!err) {
          let currentVersion = app.getVersion();

          // Update has been downloaded if `downloadedVersion` exists
          // Update the app and quit
          if (_.isNil(downloadedVersion) === false && currentVersion !== downloadedVersion) {

            // applyUpdateAndQuit() internally calls swapAndRelaunch.sh
            // Which servers the purpose of applying update & quit the app by killing the parent process
            // If called, any statement after this function call in `before-quit` event will be skipped.
            pm.logger.info('Applying update and quit the app');
            updaterHandler.applyUpdateAndQuit(app.updaterInstance);
          }

          // if there is no new downloaded updates to apply
          else {
            app.exit();
          }
        }
      });
    }
  });

  /**
   *
   * @param {*} window
   * @param {*} fileName
   */
  function showSaveDialog (window, fileName, cb) {
    dialog.showSaveDialog({
      title: '选择保存文件的路径',
      defaultPath: '~/' + fileName
    }).then((result) => {
      return cb(result.filePath);
    }, (err) => {
      return cb();
    });
  }
  attachIpcListeners();

  windowManager.initialize();

  var dockMenu = Menu.buildFromTemplate([
    {
      label: '新建集合',
      click: function () { runPostmanShortcut('newCollection'); }
    },
    {
      label: '新建窗口',
      click: function () { runPostmanShortcut('newWindow'); }
    }
  ]);

  /**
   * Determines whether to show the prompt for moving the current app to applications folder
   */
  function shouldShowMovePrompt (cb) {
    if (process.env.PM_BUILD_ENV === 'development' ||
        process.env.SKIP_MOVE_PROMPT === 'true' ||
        os.type() !== 'Darwin' ||
        app.isInApplicationsFolder()) {
      return cb(false);
    }

    appSettings.get('doNotRemindMoveToApplications', (err, doNotRemind) => {
      if (err) {
        pm.logger.error('Main~shouldShowMovePrompt - Error while trying to get "mode" from appSettings', err);
        return cb(false);
      }

      doNotRemind && pm.logger.info('Main~shouldShowMovePrompt - Not showing the prompt since user has chosen not to be reminded again');
      return cb(!doNotRemind);
    });
  }

  /**
   * This will show a prompt for moving the current app to applications folder when running on a mac
   */
  function promptMoveToApplicationsFolder (cb) {
    shouldShowMovePrompt((shouldShow) => {
      if (!shouldShow) {
        return cb();
      }

      pm.logger.info('Main~promptMoveToApplicationsFolder - Postman is not in applications folder, showing a prompt to move it there');

      dialog.showMessageBox({
        type: 'question',
        buttons: [MOVE_DIALOG_ACTION_BUTTON, MOVE_DIALOG_CANCEL_BUTTON],
        defaultId: 0, // Does not change the default selected button as mentioned in docs but only specifies the primary button (changes the color to blue)
        message: MOVE_DIALOG_MESSAGE,
        detail: MOVE_DIALOG_DETAILS,
        checkboxLabel: MOVE_DIALOG_CHECKBOX_MESSAGE
      }).then((result) => {
        // If the checkbox was selected, we need to wait for persisting this setting first before performing any action
        if (result.checkboxChecked) {
          appSettings.set('doNotRemindMoveToApplications', true, (err) => {
            if (err) {
              pm.logger.error('Main~promptMoveToApplicationsFolder - Failed to write the do not show prompt setting swallowing the error and continuing');
            }

            // Performing the action now
            if (result.response !== 0) {
              return cb();
            }

            // If user asked to move the application to applications directory we are not calling the callback here since the current app will be quitting anyway
            app.moveToApplicationsFolder();
          });
        }
        else {
          // If the checkbox was not selected, we can perform the action directly

          // If user didn't selected the move to application folder button
          if (result.response !== 0) {
            return cb();
          }

          // not calling the callback here since we the current app will be quitting anyway
          app.moveToApplicationsFolder();
        }
      });
    });
  }

  // This is the first instance, and another instance tried to open, here we should
  // 1. focus the first instance (current one)
  // 2. Allow protocol handler to parse the arguments and act accordingly
  app.on('second-instance', (event, commandLine) => {
    /**
     * bringing requester window in focus when an user tries to create another instance of the app.
     */
    windowManager.focusRequesterWindow()
    .catch((error) => {
      /**
       * Fallback step, if in  windowManager.focusRequesterWindow():
       * 1. openRequesterWindows has an id which actually does not exists.
       * 2. BrowserWindow.fromId() receives an argument which is not a number.
       * 3. openRequesterWindows does not contains the id of an already opened requester window.
       * 4. there is a failure while restoring the last closed requester window, when there are no open requester windows.
       */

      let errorMessage = error ? error.message : 'windowManager~focusRequesterWindow: Something went wrong while creating/focussing requester window';
      pm.logger.error(`main~makeSingleInstance: ${errorMessage}`);

      return windowManager.newRequesterWindow()
      .then((window) => {
        if (!window) {
          pm.logger.error('main~makeSingleInstance: New Requester window instance not found');
          return;
        }
      })
      .catch((e) => {
        pm.logger.error('main~makeSingleInstance: Error while creating a new Requester window', e);
        return;
      });
    })
    .finally(() => {
      return ProtocolHandler.processArg(commandLine);
    });
  });

  /**
   * Determines whether to shortcuts should be removed from menu.
   */
  function shouldHaveShortcuts (cb) {
    appSettings.get('shortcutsDisabled', (err, shortcutsDisabled) => {
      if (err) {
        pm.logger.error('Main~shouldHaveShortcuts - Error while trying to get "shortcutsDisabled" from appSettings. Assuming shortcuts are enabled.', err);
        return cb(err, false);
      }

      return cb(null, shortcutsDisabled);
    });
  }

  /**
   * This will be called when app is ready
   */
  function onAppReady () {
    promptMoveToApplicationsFolder(() => {
      // Populates the installation id
      populateInstallationId();
      populateUpdateSettings();
      bootstrapModels({ eventBus: eventBus }, (err, orm) => {
        global.pm.models = orm.collections;
        global.pm.__orm = orm;

        // initialize event bus
        let appEvents = eventBus.channel('app-events');

        appEvents.subscribe((event = {}) => {
          // If it is a boot process;
          if (_.get(event, 'name') === 'booted') {
            let process = event.namespace,
                err = event.data,
                meta = event.meta;

            if (process === 'requester' && meta && meta.isFirstRequester) {
              if (err) {
                pm.logger.error('Main~AppEvents - First requester window boot failed', err);

                let errorMessageToShow = err.name + ': ' + err.message;
                dialog.showErrorBox(COULD_NOT_OPEN_DIALOG_TITLE, errorMessageToShow + '\n\n' + COULD_NOT_OPEN_DIALOG_MESSAGE);

                return;
              }
            }

            pm.logger.info(`Main~AppEvents - Received booted event for process ${process}`);
          }
        });

        windowManager.openRequesterWindows();
      });

      appSettings.set('downloadedVersion', null);
      if (process.env.SKIP_SIGNIN !== 'true') {
        authHandler.init(authHandlerAdapter);
      }

      shouldHaveShortcuts((err, shortcutsDisabled) => {
        app.shortcutsDisabled = shortcutsDisabled;
        menuManager.createMenu(shortcutsDisabled);
      });

      if (app.dock) { // app.dock is only available on OSX
        app.dock.setMenu(dockMenu);
      }
    });

    // Generate rootCA certificates for HTTPS Proxy when app is ready
    try {
      proxyCertificateService.generateRootCAForProxy(app.getPath('userData'));
    } catch (e) {
      pm.logger.error('HTTPSProxy~Unable to generate certificates', e);
    }
  }

  // This method will be called when Electron has done everything
  // initialization and ready for creating browser windows.
  app.isReady() ? onAppReady() : app.on('ready', onAppReady);

  app.on('activate', function () {
    // bail out if first requester window is not booted
    if (!windowManager.isFirstRequesterBooted) {
      return;
    }

    windowManager
    .getOpenWindows('requester')
    .then((openRequesterWindows) => {
      // if there are open requester windows do nothing
      if (!_.isEmpty(openRequesterWindows)) {
        return;
      }

      // if there are no open requester windows open or restore a requester window
      windowManager.createOrRestoreRequesterWindow();
    });
  });
});
