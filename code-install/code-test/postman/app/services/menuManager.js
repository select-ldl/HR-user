var electron = require('electron'),
    app = electron.app,
    Menu = electron.Menu,
    MenuItem = electron.MenuItem,
    path = require('path'),
    _ = require('lodash').noConflict(),
    gpu = require('./gpu'),
    menuManager = {},
    os = require('os'),
    BrowserWindow = require('electron').BrowserWindow,
    appName = electron.app.getName(),
    APP_UPDATE = 'app-update',
    APP_UPDATE_EVENTS = 'app-update-events',
    CHECK_FOR_ELECTRON_UPDATE = 'checkForElectronUpdate',
    { createEvent } = require('../common/model-event'),
    { WORKSPACE_BUILDER, WORKSPACE_BROWSER, MODAL } = require('../common/constants/views'),
    { OPEN_WORKSPACE_IDENTIFIER, SCRATCHPAD } = require('../common/constants/pages'),
    enterpriseUtils = require('../services/enterpriseUtil'),
    SETTINGS_ID = 'settings',

    PROXY_ALLOWED_ENVIRONMENTS = ['PostmanDev', 'PostmanBeta', 'PostmanCanary'],

    // Documentation for registering menu actions can be found in App.js~registerMenuActions
    getOsxTopBarMenuTemplate = async function () {
      return [{
        label: appName,
        submenu: _.compact([
          { role: 'about', label: '关于' },
          !enterpriseUtils.isEnterpriseApplication() ? {
            label: '检查更新...',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('checkElectronUpdates', null, options); }
          } : null,
          !enterpriseUtils.isEnterpriseApplication() ? { type: 'separator' } : null,
          await gpu.getToggleMenuItem(),
          { type: 'separator' },
          {
            // Preferences in macOS opens the settings modal so id is kept as settings
            // which is same for windows and linux also
            label: '首选项',
            id: SETTINGS_ID,
            accelerator: 'CmdOrCtrl+,',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openSettings', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER, WORKSPACE_BROWSER], blockedPages: [SCRATCHPAD] }, options); }
          },
          {
            role: 'services', label: '服务',
            submenu: []
          },
          { type: 'separator' },
          { role: 'hide', label: '隐藏' },
          { role: 'hideothers', label: '隐藏其他' },
          { role: 'unhide', label: '取消隐藏' },
          { type: 'separator' },
          { role: 'quit', label: '退出' }
        ])
      },
      {
        label: '文件',
        submenu: [
          {
            label: '新建...',
            accelerator: 'CmdOrCtrl+N',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCreateNewModal', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建标签页',
            accelerator: 'CmdOrCtrl+T',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建运行标签页',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openRunner', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建窗口',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newWindow', { type: 'shortcut', isGlobal: true }, options); }
          },
          { type: 'separator' },
          {
            label: '导入...',
            accelerator: 'CmdOrCtrl+O',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openImport', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { type: 'separator' },
          {
            label: '关闭窗口',
            accelerator: 'CmdOrCtrl+Shift+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('closeWindow', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '关闭标签页',
            accelerator: 'CmdOrCtrl+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('closeTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '强制关闭标签页',
            accelerator: 'CmdOrCtrl+Alt+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('forceCloseTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '撤消',
            accelerator: 'CmdOrCtrl+Z',
            click: function (menuItem, browserWindow, options) {
              // this is only for MacOS as undo didnt work implicilty for this platform
              // we are relying on electron for the case of windows and linux
              menuManager.handleMenuAction('undo', { type: 'shortcut', isGlobal: true }, options);
             }
          },
          {
            label: '恢复',
            accelerator: 'Shift+CmdOrCtrl+Z',
            click: function (menuItem, browserWindow, options) {
              // this is only for MacOS as redo didnt work implicilty for this platform
              // we are relying on electron for the case of windows and linux
              menuManager.handleMenuAction('redo', { type: 'shortcut', isGlobal: true }, options);
             }
          },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '拷贝' },
          { role: 'paste', label: '粘贴' },
          {
            label: '粘贴和匹配样式',
            accelerator: 'CmdOrCtrl+Shift+V',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('pasteAndMatch', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '删除',
            click: function (menuItem, browserWindow, options) {
              // This is only for MacOS platform as "delete" didnt work implicilty for this platform
              // We are relying on electron for the windows and linux platform
              menuManager.handleMenuAction('delete', { type: 'shortcut', isGlobal: true }, options);
             }
          },
          { role: 'selectall', label: '全选' }
        ]
      },
      {
        label: '视图',
        submenu: [
          { role: 'togglefullscreen', label: '切换全屏' },
          {
            label: '放大',
            accelerator: 'CmdOrCtrl+=',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('increaseZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '缩小',
            accelerator: 'CmdOrCtrl+-',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('decreaseZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '重置缩放',
            accelerator: 'CmdOrCtrl+0',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('resetZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '侧边收展',
            accelerator: 'CmdOrCtrl+\\',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleSidebar', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '切换两窗格视图',
            accelerator: 'CmdOrCtrl+Alt+V',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleLayout', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { type: 'separator' },
          {
            label: '显示 Postman 控制台',
            accelerator: 'CmdOrCtrl+Alt+C',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openConsole', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '开发者',
            submenu: [
              {
                label: '开发者工具(当前视图)',
                accelerator: (function () {
                  if (process.platform == 'darwin') {
                    return 'Alt+Command+I';
                  }
                  else {
                    return 'Ctrl+Shift+I';
                  }
                }()),
                click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleDevTools', { type: 'shortcut', isGlobal: true }, options); }
              },
              {
                label: '开发者工具(当前 Shell)',
                click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleShellDevTools', null, options); }
              },
              { type: 'separator' },
              {
                label: '在查找器中查看日志',
                click: function () { menuManager.handleMenuAction('openLogsFolder'); }
              }
            ]
          }
        ]
      },
      {
        role: 'window', label: '视窗',
        submenu: [
          { role: 'minimize', label: '最小化' },
          { role: 'zoom', label: '放大' },
          { role: 'close', label: '关闭' },
          { type: 'separator' },
          {
            label: '下一标签页',
            accelerator: 'Command+Shift+]',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('nextTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '上一标签页',
            accelerator: 'Command+Shift+[',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('previousTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { type: 'separator' },
          { role: 'front', label: '前面' }
        ]
      },
      {
        role: 'help', label: '帮助',
        submenu: _.compact([
          PROXY_ALLOWED_ENVIRONMENTS.includes(appName) ? {
            label: '设置 Web 网关支持',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openWebGatewayProxyWindow', { type: 'shortcut', isGlobal: true }, options); }
          } : null,
          PROXY_ALLOWED_ENVIRONMENTS.includes(appName) ?
          { type: 'separator' } : null,
          {
            label: '文档',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/docs', options); }
          },
          {
            label: 'GitHub',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/github', options); }
          },
          {
            label: 'Twitter',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/twitter', options); }
          },
          {
            label: '支持',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/support', options); }
          }
        ])
      }];
    },
    getTopBarMenuTemplate = async function () {
      return [{
        label: '文件',
        submenu: [
          {
            label: '新建...',
            accelerator: 'CmdOrCtrl+N',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCreateNewModal', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建标签页',
            accelerator: 'CmdOrCtrl+T',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建运行标签页',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openRunner', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '新建窗口',
            accelerator: 'CmdOrCtrl+Shift+N',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newWindow', { type: 'shortcut', isGlobal: true }, options); }
          },
          { type: 'separator' },
          {
            label: '导入...',
            accelerator: 'CmdOrCtrl+O',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openImport', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '设置',
            id: SETTINGS_ID,
            accelerator: 'CmdOrCtrl+,',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openSettings', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER, WORKSPACE_BROWSER], blockedPages: [SCRATCHPAD] }, options); }
          },
          { type: 'separator' },
          {
            label: '关闭窗口',
            accelerator: 'CmdOrCtrl+Shift+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('closeWindow', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '关闭标签页',
            accelerator: 'CmdOrCtrl+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('closeTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '强制关闭标签页',
            accelerator: 'CmdOrCtrl+Alt+W',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('forceCloseTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { role: 'quit', label: '退出' }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { role: 'undo', label: '撤消' },
          { role: 'redo', label: '恢复' },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '拷贝' },
          { role: 'paste', label: '粘贴' },
          { role: 'pasteandmatchstyle', label: '粘贴和匹配样式' },
          { role: 'delete', label: '删除' },
          { role: 'selectall', label: '全选' }
        ]
      },
      {
        label: '视图',
        submenu: [
          { role: 'togglefullscreen', label: '切换全屏' },
          {
            label: '放大',
            accelerator: 'CmdOrCtrl+=',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('increaseZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '缩小',
            accelerator: 'CmdOrCtrl+-',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('decreaseZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '重置缩放',
            accelerator: 'CmdOrCtrl+0',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('resetZoom', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '侧边收展',
            accelerator: 'CmdOrCtrl+\\',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleSidebar', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '切换两窗格视图',
            accelerator: 'CmdOrCtrl+Alt+V',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleLayout', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { type: 'separator' },
          {
            label: '下一标签页',
            accelerator: 'CmdOrCtrl+Tab',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('nextTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          {
            label: '上一标签页',
            accelerator: 'CmdOrCtrl+Shift+Tab',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('previousTab', { type: 'shortcut', allowedViews: [WORKSPACE_BUILDER], allowedPages: [OPEN_WORKSPACE_IDENTIFIER] }, options); }
          },
          { type: 'separator' },
          {
            label: '显示 Postman 控制台',
            accelerator: 'CmdOrCtrl+Alt+C',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openConsole', { type: 'shortcut', isGlobal: true }, options); }
          },
          {
            label: '开发者',
            submenu: [
              {
                label: '开发者工具(当前视图)',
                accelerator: (function () {
                  if (process.platform == 'darwin') {
                    return 'Alt+Command+I';
                  }
                  else {
                    return 'Ctrl+Shift+I';
                  }
                }()),
                click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleDevTools', { type: 'shortcut', isGlobal: true }, options); }
              },
              {
                label: '开发者工具(当前 Shell)',
                click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('toggleShellDevTools', null, options); }
              },
              { type: 'separator' },
              {
                label: process.platform === 'win32' ? '在资源管理器中查看日志' : '在文件管理器中查看日志',
                click: function () { menuManager.handleMenuAction('openLogsFolder'); }
              }
            ]
          }
        ]
      },

      /**
       * If current platform is linux and SNAP is running, removing the update flow
       */
      {
        label: '帮助',
        role: 'help', label: '帮助',
        submenu: _.compact([
          app.isUpdateEnabled ? {
            label: '检查更新',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('checkElectronUpdates', null, options); }
          } : null,
          app.isUpdateEnabled ?
          { type: 'separator' } : null,
          PROXY_ALLOWED_ENVIRONMENTS.includes(appName) ? {
            label: '设置 Web 网关支持',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openWebGatewayProxyWindow', { type: 'shortcut', isGlobal: true }, options); }
          } : null,
          PROXY_ALLOWED_ENVIRONMENTS.includes(appName) ?
          { type: 'separator' } : null,
          await gpu.getToggleMenuItem(),
          { type: 'separator' },
          {
            label: '文档',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/docs', options); }
          },
          {
            label: 'GitHub',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/github', options); }
          },
          {
            label: 'Twitter',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/twitter', options); }
          },
          {
            label: '支持',
            click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('openCustomUrl', 'https://go.pstmn.io/support', options); }
          }
        ])
      }];
    },
    dockMenuTemplate = [
      {
        label: '新建集合',
        click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newCollection', null, options); }
      },
      {
        label: '新建窗口',
        click: function (menuItem, browserWindow, options) { menuManager.handleMenuAction('newWindow', null, options); }
      }
    ];
menuManager = {
  dockMenuTemplate: dockMenuTemplate,

  createMenu: function (shortcutsDisabled = false) {
    return this.getMenuBarTemplate().then((template) => {
      Menu.setApplicationMenu(
        Menu.buildFromTemplate(
          shortcutsDisabled ? this.removeShortcuts(template) : template
        )
      );
    });
  },

  removeShortcuts: function (menu) {
    return _.map(menu, (menuItem) => {
      if (_.has(menuItem, 'submenu')) {
        _.set(menuItem, 'submenu', this.removeShortcuts(menuItem.submenu));
      }
      return _.omit(menuItem, ['accelerator']);
    });
  },

  updateMenuItems: function (windowType) {
    if (windowType === 'requester') {
      this.showMenuItem(SETTINGS_ID);
    }
    else if (windowType === 'console') {
      this.hideMenuItem(SETTINGS_ID);
    }
  },

  showMenuItem: function (menuItemId) {
    let menuItem = Menu.getApplicationMenu().getMenuItemById(menuItemId);

    if (menuItem) {
      menuItem.visible = true;
    }
  },

  hideMenuItem: function (menuItemId) {
    let menuItem = Menu.getApplicationMenu().getMenuItemById(menuItemId);

    if (menuItem) {
      menuItem.visible = false;
    }
  },

  getMenuBarTemplate: function () {
    var platform = os.platform();
    if (platform === 'darwin') {
      return getOsxTopBarMenuTemplate();
    }
    else {
      return getTopBarMenuTemplate();
    }
  },

  handleMenuAction: function (action, meta, options) {
    // This import is moved from the global to here because it is only required here
    // and if kept global produces a cyclic dependency where menuManager imports windowManager
    // and vice versa which causes one of the module to be undefined.
    let windowManager = require('./windowManager').windowManager;

    // If the menu action is a global action and is to be handled in the main process itself,
    // we put it inside this if condition so that it is carried out without checking any further constraints
    if (meta && meta.type === 'shortcut' && meta.isGlobal) {
      if (action === 'toggleDevTools') {
        let win = BrowserWindow.getFocusedWindow();
        win && win.webContents.send('shellMessage', { type: 'toggleDevTools' });
      }
      else if (action === 'newWindow') {
        windowManager.createOrRestoreRequesterWindow();
      }
      else if (action === 'openConsole') {
        windowManager.sendInternalMessage({
          event: 'showPostmanConsole',
          'object': { triggerSource: 'menuAction' }
        });
      }
      else if (action === 'undo') {
        let win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents && win.webContents.send('undo');
        }
      }
      else if (action === 'redo') {
        let win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents && win.webContents.send('redo');
        }
      }
      else if (action === 'delete') {
        let win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents && win.webContents.send('delete');
        }
      }
      else if (action === 'closeWindow') {
        let win = BrowserWindow.getFocusedWindow();
        win && win.close();
      }
      else if (action === 'pasteAndMatch') {
        let focusedWebContents = electron.webContents && electron.webContents.getFocusedWebContents();
        focusedWebContents && focusedWebContents.pasteAndMatchStyle();
      }
    }

    if (action === 'toggleShellDevTools') {
      let win = BrowserWindow.getFocusedWindow();
      if (win) {
        let webContents = win.webContents;
        (!webContents.isDevToolsOpened()) && (webContents.toggleDevTools({ mode: 'detach' }));
      }
    }
    else if (action === 'openCustomUrl') {
      windowManager.openCustomURL(meta);
    }
    else if (action === 'checkElectronUpdates') {
      let updaterEventBus = global.pm.eventBus.channel(APP_UPDATE_EVENTS);
      updaterEventBus.publish({ name: CHECK_FOR_ELECTRON_UPDATE, namespace: APP_UPDATE });
    }
    else if (action === 'openLogsFolder') {

      // shell.openItem is deprecated from electron v9, hence changed to shell.openPath
      // https://github.com/electron/governance/blob/master/wg-api/spec-documents/shell-openitem.md
      electron.shell.openPath(electron.app.logPath).then((errorMessage) => {
        if (errorMessage) {
          pm.logger.error(`MenuManager~handleMenuAction: Failed to open logs folder ${errorMessage}`);
        }
      });
    }
    else if (action === 'openWebGatewayProxyWindow') {
      windowManager.setWindowsDefaultVisibilityState(false);
      windowManager.closeRequesterWindows();
      windowManager.openWebBasedProxyWindow();
    }
    else {
      let win = BrowserWindow.getFocusedWindow();
      pm.eventBus.channel('menuActions').publish(createEvent(action, 'menuActions', { windowId: _.get(win, 'params[0].id') }, [], meta));
    }
  }
};

exports.menuManager = menuManager;
