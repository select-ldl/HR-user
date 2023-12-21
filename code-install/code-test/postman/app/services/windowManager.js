var electron = require('electron'),
  nativeImage = require('electron').nativeImage,
  { session } = require('electron'),
  url = require('url'),
  path = require('path'),
  Storage = require('electron-json-storage'),
  app = electron.app,
  shell = electron.shell,
  BrowserWindow = electron.BrowserWindow,
  menuManager = require('./menuManager').menuManager,
  WindowController = require('../common/controllers/WindowController'),
  enterpriseUtils = require('./enterpriseUtil'),
  {
    DEFAULT_REQUESTER_BOUNDS,
    DEFAULT_CONSOLE_BOUNDS,
    MIN_ALLOWED_WINDOW_HEIGHT,
    MIN_ALLOWED_WINDOW_WIDTH
  } = require('../constants/WindowConstants'),
  uuidV4 = require('uuid/v4'),
  { getValue } = require('../utils/processArg'),
  _ = require('lodash').noConflict();

const SHELL_PARTITION_NAME = 'persist:postman_shell';
const MAX_WINDOW_RESTORE_COUNT = 4;

const ALL_DEV_TOOLS = ['requester', 'console'];
const devtools = getValue('dev-tools') === true ? ALL_DEV_TOOLS : getValue('dev-tools').split(',');

exports.windowManager = {
  primaryId: '1',
  openWindowIds: [],
  initUrl: null,
  eventBus: null,
  windowState: {},
  isWindowVisibleByDefault: true,
  isFirstRequesterBooted: false,

  initialize () {
    if (process.env.PM_BUILD_ENV !== 'development') {
      const htmlFolderPath = path.resolve(__dirname, '..', 'html'),
            shellPath = path.resolve(htmlFolderPath, 'shell.html'),
            webProxyPath = path.resolve(htmlFolderPath, 'webProxy.html');

      // url.format helps in encoding any not allowed special characters in the path
      // The fix has been added where it was not possible to load the url for case below,
      // if user name contains #, creates # in the path, which is delimiter breaking the url.
      this._webViewPath = url.format({ protocol: 'file', pathname: shellPath });
      this.webProxyPath = url.format({ protocol: 'file', pathname: webProxyPath });
    }
    else {
      this._webViewPath = 'http://localhost:8777/build/html/shell.html';
      this.webProxyPath = 'http://localhost:8777/build/html/webProxy.html';
    }

    this.closedHandler = this.closedHandler.bind(this);
    this.debouncedStateChangeHandler = _.debounce(this.stateChangeHandler.bind(this), 100);
    this.windowBoundsHandler = this.windowBoundsHandler.bind(this);
    this.focusHandler = this.focusHandler.bind(this);
    this.channel = this.eventBus.channel('requester-window-events');


    this.eventBus.channel('app-events').subscribe((event = {}) => {
      if (_.get(event, 'name') === 'booted') {
        let process = event.namespace,
            err = event.data,
            meta = event.meta;

        if (process === 'requester' && meta && meta.isFirstRequester) {
          if (err) {
            return;
          }

          // open requester only if the window is not available, otherwise it will open on all hot-reload of first requester process
          if (!this.isFirstRequesterBooted) {
            pm.logger.info('windowManager: First requester booted successfully.');

            // Set first requester booted
            this.setFirstRequesterBooted();

            // Restore the rest of the requester windows
            return this.restoreWindows({
              windowIdsToSkip: [meta.windowId]
            });
          }
        }
      }
    });
  },

  getWebviewPath () {
    return `${this._webViewPath}?sessionId=${app.sessionId}&logPath=${app.logPath}`;
  },

  hideAllWindows () {
    for (let i = 0; i < this.openWindowIds.length; i++) {
      let openWindow = BrowserWindow.fromId(parseInt(this.openWindowIds[i]));
      openWindow && openWindow.hide();
    }
  },

  /**
   * Sets default visibility state of window.
   * This effect Requester and Console Windows.
   * @param {Boolean} visible whether to show windows by default.
   */
  setWindowsDefaultVisibilityState (visible) {
    this.isWindowVisibleByDefault = visible;
  },

  /**
    * Show all windows.
  */
  showAllWindows () {
    return WindowController
      .getAll({})
      .then((allWindows) => {
        // We get all windows from db and choose the one which are currently opened(they are hidden)
        // We apply the full screen transformation to opened windows
        allWindows.filter((window) => {
          return this.openWindowIds.includes(window.browserWindowId);
        }).forEach((window) => {
          let browserWindow = BrowserWindow.fromId(parseInt(window.browserWindowId));

          if (!browserWindow) {
            return;
          }

          this.setWindowMode({
            isFullScreen: window.visibility && window.visibility.isFullScreen,
            maximized: window.visibility && window.visibility.maximized
          }, browserWindow);

          browserWindow.show();
        });
      })
      .catch((e) => {
        pm.logger.error('WindowManager - Error in showing windows from db', e);

        // show windows even if there was an error,
        // skip setting window mode for now
        for (let i = 0; i < this.openWindowIds.length; i++) {
          let openWindow = BrowserWindow.fromId(parseInt(this.openWindowIds[i]));
          openWindow && openWindow.show();
        }
      });
  },


  sendCustomInternalEvent (action, object) {
    var message = {
      name: 'internalEvent',
      data: {
        event: action,
        object: object
      }
    };
    var bWindow = BrowserWindow.getFocusedWindow();
    if (!bWindow) {
      return;
    }
    bWindow.webContents.send('electronWindowMessage', message);
  },

  sendToFirstWindow (message) {
    var numWindowsLeft = this.openWindowIds.length;
    for (var i = 0; i < numWindowsLeft; i++) {
      var bWindow = BrowserWindow.fromId(parseInt(this.openWindowIds[i]));
      if (!bWindow) {
        continue;
      }
      bWindow.webContents.send('electronWindowMessage', message);
      return;
    }
  },

  sendToAllWindows (message) {
    // send event to all other windows
    var numWindowsLeft = 0;
    let openWindowIds = _.compact(this.openWindowIds);
    if (openWindowIds && openWindowIds.length) {
      numWindowsLeft = openWindowIds.length;
    }

    for (var i = 0; i < numWindowsLeft; i++) {
      var bWindow = BrowserWindow.fromId(parseInt(openWindowIds[i]));
      if (!bWindow) {
        continue;
      }
      bWindow.webContents.send('electronWindowMessage', message);
    }
  },

  sendInternalMessage (message) {
    this.sendToAllWindows({
      name: 'internalEvent',
      data: message
    });
  },

  hasExtension (extensionName) {
    return session.defaultSession.getAllExtensions().hasOwnProperty(extensionName);
  },

  getDefaultWindowState (windowName) {
    if (windowName === 'console') {
      return {
        center: true,
        height: 450,
        width: 950
      };
    }
    else {
      return {
        center: true,
        height: 800,
        width: 1280
      };
    }
  },

  loadWindowState (windowName, callback) {
    if (this.windowState[windowName]) {
      return callback(this.windowState[windowName]);
    }
    else {
      Storage.get(windowName, (error, lastWindowState) => {
        if (error) { pm.logger.error('WindowManager~loadWindowState - Failed to load window state: ' + windowName); }
        return callback(error || _.isEmpty(lastWindowState) ? this.getDefaultWindowState(windowName) : lastWindowState);
      });
    }
  },

  saveWindowState (windowName, callback) {
    Storage.set(windowName, this.windowState[windowName], (error) => {
      if (error) { pm.logger.error('WindowManager~loadWindowState - Failed to store window state: ' + windowName); }
      return callback && callback();
    });
  },

  newRequesterOpened () {
    if (this.listenForRequesterWindow && this.initUrl && this.initWindowId) {

      let channel = this.eventBus.channel('protocol-handler');
      channel.publish({
        url: this.initUrl,
        windowId: this.initWindowId
      });

      this.initUrl = this.initWindowId = this.listenForRequesterWindow = null;
    }

    this.channel.publish({
      type: 'window-opened'
    });
  },

  quitApp () {
    app.quit();
  },

  getWindowPref (title) {
    if (enterpriseUtils.isEnterpriseApplication()) {
      title = _.startCase(title);
    }
    return {
      title: title,
      backgroundColor: '#FFFFFF',
      webPreferences: {
        webSecurity: false,
        backgroundThrottling: false,
        partition: SHELL_PARTITION_NAME,
        nodeIntegration: true,
        webviewTag: true,
        enableRemoteModule: true,
        contextIsolation: false,
        preload: path.resolve(app.getAppPath(), 'preload/desktop/index.js')
      },
      icon: nativeImage.createFromPath(path.resolve(app.getAppPath(), 'assets/icon.png'))
    };
  },

  setWindowMode (windowState, activeWindow) {
    if (windowState.isFullScreen) { activeWindow.setFullScreen(true); }
    else if (windowState.maximized) {
      activeWindow.maximize();
    }
  },

  sanitizeCoordinates (bounds) {
    if (!_.isInteger(bounds.x) || !_.isInteger(bounds.y)) {
      return { x: null, y: null };
    }

    let screen = electron.screen,
      nearestDisplay = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y });

    let isWindowVisible = (
      (bounds.x >= nearestDisplay.bounds.x && bounds.x <= nearestDisplay.bounds.x + nearestDisplay.bounds.width) &&
      (bounds.y >= nearestDisplay.bounds.y && bounds.y <= nearestDisplay.bounds.y + nearestDisplay.bounds.height)
    );

    if (!isWindowVisible) {
      return {
        // APPSDK-34 - return nearest display x,y instead of null, so that in multi monitor it returns the x,y of the
        // nearest display rather than null which results in the app opening in the default monitor ignoring where it
        // was last closed.
        x: nearestDisplay.bounds.x,
        y: nearestDisplay.bounds.y
      };
    }

    return bounds;
  },

  getOpenWindows (type) {
    return WindowController
      .getAll({ type })
      .then((allTypeWindows) => {
        let allTypeWindowIds = _.map(allTypeWindows, (window) => window.browserWindowId),
            openWindowIds = this.openWindowIds,
            allOpenTypeWindows = _.intersection(openWindowIds, allTypeWindowIds);
        return allOpenTypeWindows;
      });
  },

  createOrRestoreRequesterWindow () {
    return this
      .getOpenWindows('requester')
      .then((allOpenRequesterWindows) => {
        if (_.isEmpty(allOpenRequesterWindows)) {
          // If no requester windows are open, there will be only one requester window in the Window table
          // Restore that.
          return WindowController
            .getAll({ type: 'requester' })
            .then((allRequesterWindows) => {
              if (_.size(allRequesterWindows) === 1) {
                return this.newRequesterWindow(allRequesterWindows[0]);
              }

              // Worst case. if there are more than one requester window in the DB, create a window normally
              return this.newRequesterWindow();
            });
        }
        else {
          // Create a new window normally
          return this.newRequesterWindow();
        }
      });
  },

  newRequesterWindow (window = {}, params = {}) {
    let startTime = Date.now(),
        windowName = 'requester',
        bounds = {
          x: _.get(window, 'position.x'),
          y: _.get(window, 'position.y'),
          width: _.get(window, 'size.width'),
          height: _.get(window, 'size.height')
        },
        sanitizedBounds = this.sanitizeBounds(bounds, windowName);

    // If we are trying to open a requester window (except first requester) before the first requester is booted, we bail
    if (!params.isFirstRequester && !this.isFirstRequesterBooted) {
      pm.logger.warn('WindowManager~newRequesterWindow - Bailing requester window creation as first requester is not booted.');
      return;
    }

    let mainWindow = new BrowserWindow(Object.assign(
      this.getWindowPref(app.getName()),
      {
        width: sanitizedBounds.width,
        height: sanitizedBounds.height,
        x: sanitizedBounds.x,
        y: sanitizedBounds.y,
        center: !window.position,
        show: this.isWindowVisibleByDefault,
        minWidth: MIN_ALLOWED_WINDOW_WIDTH,
        minHeight: MIN_ALLOWED_WINDOW_HEIGHT
      }
    ));

    this.windowState[windowName] = window;

    // We do not want to apply fullScreen flag for windows created in hidden mode
    // since applying it will make these windows visible. Instead, We will apply this flag later
    // (after the auth window is closed) when we want to show these windows.
    this.isWindowVisibleByDefault && this.setWindowMode({
      isFullScreen: window.visibility && window.visibility.isFullScreen,
      maximized: window.visibility && window.visibility.maximized
    }, mainWindow);

    if (!this.openWindowIds.length) {
      this.primaryId = mainWindow.id;
    } // this is the only window. make it primary
    this.openWindowIds.push(mainWindow.id);

    let windowId = window.id || uuidV4();

    mainWindow.webContents.on('dom-ready', () => {
      // From electron v11, there are some rendering issues with the chromium side which is affecting webview, browserViews and browserWindows.
      // This issue is only seen when there is a hidden window launched and another window is opened on top of it. In our case shared window is the hidden window
      // Adding a workaround for the issue with electron v11 where the requester window appears blank while launching the app.
      // Taking the focus away from requester window fixes the problem. This workaround needs to be put in when the content is ready. Similar issue is reported here https://github.com/electron/electron/issues/27353
      if (this.isWindowVisibleByDefault && process.platform === 'win32') {
        mainWindow.showInactive();
        mainWindow.focus();
      }

      mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
      mainWindow.webContents.send('shell-loaded', {
        id: mainWindow.id,
        type: 'requester',
        startTime,
        devtools: _.includes(devtools, 'requester'),
        primaryId: this.primaryId,
        allIds: this.openWindowIds,
        isFirstRequester: params.isFirstRequester,
        authResponse: params.authResponse
      });
      if (this.initUrl) {
        this.listenForRequesterWindow = true;
        this.initWindowId = windowId;
      }
    });

    let windowParams = [{
      type: 'requester',
      id: windowId,
      browserWindowId: mainWindow.id,
      activeSession: window.activeSession || '',
      position: { x: sanitizedBounds.x, y: sanitizedBounds.y },
      size: { width: sanitizedBounds.width, height: sanitizedBounds.height },
      visibility: window.visibility || { maximized: false, isFullScreen: false }
    }, {
      id: windowId,
      session: {
        id: window.activeSession,
        workspace: params.workspace
      },
      triggerSource: params && params.triggerSource
    }];

    mainWindow.windowName = windowName;
    mainWindow.type = 'requester';
    mainWindow.params = windowParams;

    Promise.resolve()
      .then(() => {
        if (window.id) {
          // Checking if the window to restore actually does exist in DB Or not before updating.
          // This makes sure that when the window starts booting, a record always exists in the DB
          return WindowController.get({ id: window.id });
        }
        return;
      })
      .then((dbWindow) => {
        if (dbWindow) {
          // Restoring
          return WindowController
            .update({
              id: window.id,
              browserWindowId: mainWindow.id,
              position: { x: sanitizedBounds.x, y: sanitizedBounds.y },
              size: { width: sanitizedBounds.width, height: sanitizedBounds.height }
            });
        }
        else {
          // Not restoring
          return WindowController
            .create.apply(WindowController, windowParams);
        }
      })
      .then(() => {
        mainWindow.loadURL(this.getWebviewPath());
      })
      .catch((e) => {
        pm.logger.error('WindowManager~newRequesterWindow - Error in loading window from db', e);
      });

    this.addListeners(mainWindow);

    this.sendInternalMessage({
      event: 'pmWindowOpened',
      object: mainWindow.id
    });
    return mainWindow;
  },

  newConsoleWindow (window = {}, params = {}) {
    let startTime = Date.now(),
        windowName = 'console',
        bounds = {
          x: _.get(window, 'position.x'),
          y: _.get(window, 'position.y'),
          width: _.get(window, 'size.width'),
          height: _.get(window, 'size.height')
        },
        sanitizedBounds = this.sanitizeBounds(bounds, windowName);

    if (!this.isFirstRequesterBooted) {
      pm.logger.warn('WindowManager~newConsoleWindow - Bailing requester window creation as first requester is not booted!');
      return;
    }

    if (!this.consoleWindowId) {
      let mainWindow = new BrowserWindow(Object.assign(
        this.getWindowPref('Postman Console'),
        {
          width: sanitizedBounds.width,
          height: sanitizedBounds.height,
          x: sanitizedBounds.x,
          y: sanitizedBounds.y,
          center: !window.position,
          show: this.isWindowVisibleByDefault,
          minWidth: MIN_ALLOWED_WINDOW_WIDTH,
          minHeight: MIN_ALLOWED_WINDOW_HEIGHT
        }
      ));

      this.windowState[windowName] = window;

      // We do not want to apply fullScreen flag for windows created in hidden mode
      // since applying it will make these windows visible. Instead, We will apply this flag later
      // (after the auth window is closed) when we want to show these windows.
      this.isWindowVisibleByDefault && this.setWindowMode({
        isFullScreen: window.visibility && window.visibility.isFullScreen,
        maximized: window.visibility && window.visibility.maximized
      }, mainWindow);

      this.consoleWindowId = mainWindow.id;
      this.openWindowIds.push(this.consoleWindowId);

      mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
        mainWindow.webContents.send('shell-loaded', {
          id: mainWindow.id,
          type: 'console',
          startTime,
          devtools: _.includes(devtools, 'console')
        });
      });

      let windowId = window.id || uuidV4();
      let windowParams = [{
        type: 'console',
        id: windowId,
        browserWindowId: mainWindow.id,
        activeSession: window.activeSession || '',
        position: { x: sanitizedBounds.x, y: sanitizedBounds.y },
        size: { width: sanitizedBounds.width, height: sanitizedBounds.height },
        visibility: window.visibility || { maximized: false, isFullScreen: false }
      }, {
        id: windowId,
        session: { id: window.activeSession },
        triggerSource: params && params.triggerSource
      }];

      mainWindow.windowName = windowName;
      mainWindow.type = 'console';
      mainWindow.params = windowParams;

      Promise.resolve()
      .then(() => {
        if (window.id) {
          // Checking if the window to restore actually does exist in DB Or not before updating.
          // This makes sure that when the window starts booting, a record always exists in the DB
          return WindowController.get({ id: window.id });
        }
        return;
      })
      .then((dbWindow) => {
        if (dbWindow) {
          // Restoring
          return WindowController
            .update({
              id: window.id,
              browserWindowId: mainWindow.id,
              position: { x: sanitizedBounds.x, y: sanitizedBounds.y },
              size: { width: sanitizedBounds.width, height: sanitizedBounds.height }
            });
        }
        else {
          // Not restoring
          return WindowController
            .create.apply(WindowController, windowParams);
        }
      })
      .then(() => {
        mainWindow.loadURL(this.getWebviewPath());
      })
      .catch((e) => {
        pm.logger.error('WindowManager~newConsoleWindow - Error in loading console window from db', e);
      });

      // Reset console ID when 'closed' is emitted.
      // 'close' not used as it is not emitted when destroy() is called.
      // This makes sure console can be launched after switching accounts while it is open.
      // Github issue - https://github.com/postmanlabs/postman-app-support/issues/5409
      mainWindow.on('closed', () => {
        if (this.consoleWindowId) {
          this.consoleWindowId = null;
        }
      });

      this.addListeners(mainWindow);
    }
    else {
      let consoleWindow = BrowserWindow.fromId(parseInt(this.consoleWindowId));
      if (!consoleWindow) {
        return;
      }
      consoleWindow.show();
      consoleWindow.restore();
    }
  },

  addListeners (activeWindow) {
    activeWindow.on('close', this.closedHandler);
    activeWindow.on('move', this.debouncedStateChangeHandler);
    activeWindow.on('resize', this.debouncedStateChangeHandler);
    activeWindow.on('restore', this.windowBoundsHandler);
    activeWindow.on('focus', this.focusHandler);
  },

  updateWindowState (windowName, activeWindow) {
    const bounds = activeWindow.getBounds();
    this.windowState[windowName] = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      maximized: activeWindow.isMaximized(),
      isFullScreen: activeWindow.isFullScreen()
    };
  },

  stateChangeHandler (e) {
    const activeWindow = e.sender;

    if (!activeWindow || activeWindow.isDestroyed()) {
      return Promise.resolve();
    }

    const bounds = activeWindow.getBounds();

    this.updateWindowState(activeWindow.windowName, e.sender);
    this.saveWindowState(activeWindow.windowName);

    return WindowController.get({ browserWindowId: activeWindow.id })
      .then((window) => {
        WindowController.update({
          id: window.id,
          position: {
            x: bounds.x,
            y: bounds.y
          },
          size: {
            width: bounds.width,
            height: bounds.height
          },
          visibility: {
            maximized: activeWindow.isMaximized(),
            isFullScreen: activeWindow.isFullScreen()
          }
        });
      });
  },

  deleteWindowFromDB (browserWindow) {
    let windowType = browserWindow.type,
        windowId = browserWindow.id;
    if (windowType !== 'requester') {
      return WindowController
        .get({ browserWindowId: browserWindow.id })
        .then((closedWindow) => {
          return WindowController.delete({ id: closedWindow.id });
        });
    }
    else {
      return WindowController
        .count({ type: 'requester' })
        .then((requesterWindowCount) => {
          if (requesterWindowCount > 1) {
            return WindowController
              .get({ browserWindowId: windowId })
              .then((window) => {
                return WindowController.delete({ id: window.id });
              });
          }

          return;
        });
    }
  },

  closedHandler (e) {
    // The first requester window should not be closed before the web view boots up
    if (!this.isFirstRequesterBooted) {
      e.preventDefault();
      return;
    }

    if (app.quittingApp) {
      // Windows are being closed because the app was quit, don't try to
      // delete window records
      return;
    }

    let window = e.sender,
        windowId = window.id;

    pm.logger.info(`WindowManager~closeHandler - Closed Window (id: ${windowId} )`);

    this.removeListeners(window);
    this.removeWindowId(windowId);

    this.deleteWindowFromDB(window)
      .then(() => {
        // If there are no more open windows, quit the app on Windows & Linux
        if (process.platform != 'darwin' && _.isEmpty(this.openWindowIds)) {
          app.quit();
        }
      })
      .catch(() => {
        // If there are no more open windows, quit the app on Windows & Linux
        if (process.platform != 'darwin' && _.isEmpty(this.openWindowIds)) {
          app.quit();
        }
      });

      this.channel.publish({
        type: 'window-closed',
        windowId
      });
  },

  focusHandler (e) {
    let window = _.get(e, 'sender', {});

    menuManager.updateMenuItems(window.type);
  },

  removeListeners (activeWindow) {
    activeWindow.removeListener('close', this.closedHandler);
    activeWindow.removeListener('resize', this.debouncedStateChangeHandler);
    activeWindow.removeListener('move', this.debouncedStateChangeHandler);
    activeWindow.removeListener('restore', this.windowBoundsHandler);
    activeWindow.removeListener('focus', this.focusHandler);
  },

  getFirstRequesterWindow () {
    return WindowController
      .getAll({ type: 'requester' })
      .then((allRequesterWindows) => {
        let requesterWindowIds = _.map(allRequesterWindows, (window) => window.browserWindowId),
            openWindowIds = this.openWindowIds,
            openRequesterWindows = _.intersection(openWindowIds, requesterWindowIds);

        if (openRequesterWindows.length) {
          return _.find(allRequesterWindows, (window) => window.browserWindowId === openRequesterWindows[0]);
        }
        return;
      });
  },

  openUrl (url) {
    this.getFirstRequesterWindow()
        .then((window) => {
          if (window) {
            let channel = this.eventBus.channel('protocol-handler');
            channel.publish({
              url,
              windowId: window.id
            });

            var bWindow = BrowserWindow.fromId(window.browserWindowId);
            if (bWindow) {
              bWindow.show();
              bWindow.restore();
            }

            this.initUrl = null;
          }
          else {
            // Open a new window
            this.initUrl = url;
            this.createOrRestoreRequesterWindow();
          }
        });
  },

  removeWindowId (windowId) {
    // remove windowId from openWindowIds
    var index = this.openWindowIds.indexOf(windowId);

    if (index !== -1) {
      this.openWindowIds.splice(index, 1);
    }
  },

  openCustomURL (url) {
    shell.openExternal(url);
  },

  hasOpenWindows () {
    return !_.isEmpty(BrowserWindow.getAllWindows());
  },

  restoreWindows (options = {}) {
    pm.logger.info('windowManager~restoreWindows: Restoring requester windows');

    if (!this.isFirstRequesterBooted) {
      pm.logger.error('windowManager~restoreWindows: Bailing out of restoreWindows as the first requester is not booted');
      return;
    }

    let windowIdsToSkip = options.windowIdsToSkip || [];

    return WindowController.getAll({})
      .then((allWindows) => {
        let allWindowIds = _.map(allWindows, (window) => window.id),
            windowsToRestore = _.slice(allWindows, 0, MAX_WINDOW_RESTORE_COUNT),
            windowsToRestoreIds = _.slice(allWindowIds, 0, MAX_WINDOW_RESTORE_COUNT),
            idsToDelete = _.differenceWith(allWindowIds, windowsToRestoreIds);

        if (_.isEmpty(idsToDelete)) {
          return windowsToRestore;
        }
        return WindowController
          .delete({ id: idsToDelete })
          .then(() => {
            return windowsToRestore;
          });
      })
      .then((allWindows = []) => {
        // Filter out the IDs of the windows to skip. These will not be restored
        allWindows = allWindows.filter((window = {}) => {
          // We keep the window ID if the list of IDs to skip does not have the
          // current window's ID
          return !windowIdsToSkip.includes(window.id);
        });

        if (!_.isEmpty(allWindows)) {
          _.each(allWindows, (window) => {
            switch (window.type) {
              case 'requester':
                this.newRequesterWindow(window);
                break;
              case 'console':
                this.newConsoleWindow(window);
                break;
            }
          });
        }
      });
  },

  /**
   * Closes all requester windows
   */
  closeRequesterWindows () {
    this.unsetFirstRequesterBooted();
    this.closeAllWindows();
  },

  closeAllWindows () {
    _.each(this.openWindowIds, (windowId) => {
      let window = BrowserWindow.fromId(parseInt(windowId));
      window && this.removeListeners(window);
      window && window.destroy();
    });

    this.openWindowIds = [];

    /**
     * Earlier there was a windowController.delete() which used to wipe out the complete window file,
     * so on restore actions it never used to find any window and would open a new one.
     * Case where user does a add new account, cancels that operation and clicks take me back to signed in account
     *
     * Also, when the shared process is booted that calls windowManager.restoreWindows, which keeps the
     * MAX_WINDOW_RESTORE_COUNT number of windows and clears the rest of them. Hence clean up is done on
     * every shared booted.
     */
  },

  /**
   * This function handles the case when the position at which the window is to be restored is outside
   * the bounds of the current display configuration. This causes the bug where the app is loaded off-screen.
   * If this case arises, this function displays the window on the primary display.
   *
   * NOTE: This function is triggered by the 'restore' event emitted by the window on being restored from a minimized state.
   * The 'show' event would have been more appropriate but 'restore' is used because the 'show' event is inconsistent
   * across different platforms. So it would have worked well on macOS but not on Windows and Linux.
   *
   * Electron issue - https://github.com/electron/electron/issues/8664
   */
  windowBoundsHandler (e) {
    let window = e.sender;
    if (!window) {
      return;
    }

    let primaryDisplay = electron.screen.getPrimaryDisplay(),
        sanitizedCoordinates = this.sanitizeCoordinates({ x: window.getBounds().x, y: window.getBounds().y }),
        finalBounds = { x: sanitizedCoordinates && sanitizedCoordinates.x,
                        y: sanitizedCoordinates && sanitizedCoordinates.y,
                        width: window.getBounds().width,
                        height: window.getBounds().height
                      };

    // Case where the sanitized bounds returns null i.e. the bounds were outside the current display
    if (_.isNull(finalBounds.x) || _.isNull(finalBounds.y)) {
      finalBounds = primaryDisplay.bounds;
    }

    window.setBounds(finalBounds);

  },

  /**
   * Function to bring the requester window in focus
   *
   * If no requester window is open, a new requester window is opened with state of the last closed requester window
   * else the existing requester window in brought in focus
   */
  focusRequesterWindow () {
    let window;
    return this.getOpenWindows('requester')
      .then((allOpenRequesterWindows) => {
        if (_.isEmpty(allOpenRequesterWindows)) {
          return WindowController.getAll({ type: 'requester' })
            .then((allRequesterWindows) => {
              if (!_.isEmpty(allRequesterWindows)) {
                window = this.newRequesterWindow(allRequesterWindows[0]);
              }
              if (!window) {
                return Promise.reject(new Error('windowManager~focusRequesterWindow: Unable to restore the last closed requester window'));
              }
              return window;
            });
        }
        else {
          window = BrowserWindow.fromId(allOpenRequesterWindows[0]);
          if (!window) {
            return Promise.reject(new Error('windowManager~focusRequesterWindow: Unable to focus the existing requester window'));
          }
          if (window.isMinimized()) { window.restore(); }
          window.focus();
          return window;
        }
      });
  },

  /**
   * Function to sanitize position coordinates and dimensions for window. It makes sure when
   * window is restored or opened its position coordinates and size are valid.
   * @param {Object} bounds - Object which has window's position and size values
   * @param {String} windowName - Window type
   */
  sanitizeBounds (bounds = {}, windowName) {
    let defaultBounds,
        sanitizedCoordinates;

    switch (windowName) {
      case 'requester':
        defaultBounds = DEFAULT_REQUESTER_BOUNDS;
        break;
      case 'console':
        defaultBounds = DEFAULT_CONSOLE_BOUNDS;
        break;
      default:
        defaultBounds = DEFAULT_REQUESTER_BOUNDS;
        break;
    }

    // Addded this safe check for the issue: https://github.com/postmanlabs/postman-app-support/issues/6304
    if (!_.isInteger(bounds.width) ||
        !_.isInteger(bounds.height) ||
        bounds.width < MIN_ALLOWED_WINDOW_WIDTH ||
        bounds.height < MIN_ALLOWED_WINDOW_HEIGHT) {
      return defaultBounds;
    }

    sanitizedCoordinates = this.sanitizeCoordinates({ x: bounds.x, y: bounds.y });

    return {
      x: sanitizedCoordinates.x,
      y: sanitizedCoordinates.y,
      width: bounds.width,
      height: bounds.height
    };
  },

  /**
   * Close and Open all requester windows for the app
   * @param {Object} data - The authentication response
   */
  reLaunchRequesterWindows (data = {}) {
    this.closeRequesterWindows();
    return this.openRequesterWindows(data);
  },

  /**
   * Open all requester windows for the app
   * @param {Object} data - The authentication response
   */
  openRequesterWindows (data = {}) {
    this.unsetFirstRequesterBooted();
    return this.openFirstRequesterWindow(data);
  },

  /**
   * Open a new requester window with the isFirstRequester flag set as true
   *
   * If there are windows to be restored, we take the first window from the
   * list and open that as the first requester.
   * Otherwise, we just create a new requester window and set the isFirstRequester
   * flag for that as true
   * @param {Object} response An object containing authentication response
   */
  openFirstRequesterWindow ({ authResponse } = {}) {
    // If the first requester is already booted, bail out
    if (this.isFirstRequesterBooted) {
      pm.logger.info('windowManager~openFirstRequesterWindow: Bailing out as first requester is already open');
      return Promise.resolve();
    }

    return WindowController.getAll({ type: 'requester' })
      .then((requesterWindows) => {
        let params = {
          isFirstRequester: true,
          authResponse
        };

        if (_.size(requesterWindows) === 0) {
          return this.newRequesterWindow({}, params);
        }

        let firstRequester = requesterWindows[0];
        return this.newRequesterWindow(firstRequester, params);
      });
  },

  openWebBasedProxyWindow () {
    if (this.webProxyWindowID) {
      let window = BrowserWindow.fromId(parseInt(this.webProxyWindowID, 10));
      if (window && !window.isFocused()) {
        window.show();
      }
      return;
    }

    const mainWindow = new BrowserWindow(
      {
        title: 'Proxy Window',
        backgroundColor: '#FFFFFF',
        width: 1280,
        height: 800,
        webPreferences: {
          webSecurity: true,
          backgroundThrottling: false,
          partition: SHELL_PARTITION_NAME,
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          webviewTag: true,
          preload: path.resolve(app.getAppPath(), 'preload/desktop/index.js')
        },
        icon: nativeImage.createFromPath(path.resolve(app.getAppPath(), 'assets/icon.png'))
      }
    );

    this.webProxyWindowID = mainWindow.id;
    mainWindow.loadURL(`${this.webProxyPath}`);

    let unsubscribe,
      ipcMain = pm.sdk.IPC;

    unsubscribe = ipcMain.subscribe('webproxy-authenticate-close-window-event', () => {
      mainWindow && mainWindow.close();
    });

    mainWindow.on('close', () => {
      unsubscribe();
      this.webProxyWindowID = null;

      // Handle the case where app is getting closed, don't restore the windows in that case
      if (app.quittingApp) {
        return;
      }

      this.setWindowsDefaultVisibilityState(true);
      this.openRequesterWindows();
    });
  },

  setFirstRequesterBooted () {
    this.isFirstRequesterBooted = true;
  },

  unsetFirstRequesterBooted () {
    this.isFirstRequesterBooted = false;
  }
};
