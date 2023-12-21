const electron = require('electron');
const appSettings = require('./appSettings').appSettings;
const _ = require('lodash').noConflict();

const DISABLE_GPU_SETTING = 'disableGPU';

const setDisableGPUSetting = async (value) => {
  pm.logger.info(`Setting ${DISABLE_GPU_SETTING} to ${value}`);
  return new Promise((resolve, reject) => {
    appSettings.set(DISABLE_GPU_SETTING, Boolean(value), (error) => {
      return error ? reject(error) : resolve();
    });
  });
};

const relaunch = async (browserWindow, title, message, onRestart) => {
  const response = await electron.dialog.showMessageBox(browserWindow, {
    title,
    message,
    type: 'info',
    buttons: ['取消', '重启'],
    defaultId: 1,
    cancelId: 0
  });

  if (response.response !== 1) {
    return;
  }

  await onRestart();
  electron.app.relaunch();
  electron.app.exit(0);
};

exports.isGPUEnabled = async () => {
  return electron.app.getGPUInfo('basic').then((gpuInfo) => {
    for (const device of gpuInfo.gpuDevice) {
      pm.logger.info(`GPU detected VID ${device.vendorId} DID ${device.deviceId} ACTIVE ${device.active}`);
    }

    // The current Electron version seems to fail to detect any
    // "gpuDevice" as "active", however the main GPU is still in
    // use. This could be a bug in Electron.
    // TODO(jviotti): Check if this is still the case after the
    // Electron v11 upgrade.
    if (process.platform === 'win32') {
      return true;
    }

    return _.some(gpuInfo.gpuDevice, (device) => {
      return device.active;
    });
  }).catch((error) => {
    // If the GPU is not enabled, then the `getGPUInfo` function
    // will crash with an error like this.
    if (error.message.startsWith('GPU access not allowed')) {
      return false;
    }

    throw error;
  });
};

exports.disableGPU = async (browserWindow = electron.BrowserWindow.getFocusedWindow()) => {
  if (!electron.app.isReady()) {
    pm.logger.info('Disabling GPU');
    electron.app.disableHardwareAcceleration();

    // Disabling hardware acceleration does not completely
    // disable the GPU, while these flags do.
    electron.app.commandLine.appendSwitch('disable-software-rasterizer');
    electron.app.commandLine.appendSwitch('disable-gpu');

    // The presence of this flag makes the Linux version of Electron crash
    if (process.platform === 'darwin' || process.platform === 'win32') {
      electron.app.commandLine.appendSwitch('in-process-gpu');
    }

    await setDisableGPUSetting(true);
    return;
  }

  const isGPUEnabled = await exports.isGPUEnabled();
  if (!isGPUEnabled) {
    pm.logger.info('The GPU is already disabled');
    return;
  }

  return relaunch(browserWindow,
    '禁用硬件加速中',
    '您即将禁用硬件加速. 需要重新启动应用程序才能使此更改生效.', async () => {
      return setDisableGPUSetting(true);
    });
};

exports.enableGPU = async (browserWindow = electron.BrowserWindow.getFocusedWindow()) => {
  const isGPUEnabled = await exports.isGPUEnabled();
  if (isGPUEnabled) {
    pm.logger.info('The GPU is already enabled');
    return;
  }

  // Electron does not provide a method to re-enable the GPU
  // if it was manually disabled before the application is ready,
  // so this is the best that we can do in this case. The GPU
  // will be re-enabled the next time the application is started.
  if (!electron.app.isReady()) {
    await setDisableGPUSetting(false);
    return;
  }

  return relaunch(browserWindow,
    '启用硬件加速中',
    '您即将启用硬件加速. 需要重新启动应用程序才能使此更改生效.', async () => {
      return setDisableGPUSetting(false);
    });
};

exports.shouldDisableGPU = () => {
  // https://postman.zendesk.com/agent/tickets/19959
  // This environment variable has precedence
  if (process.env.POSTMAN_DISABLE_GPU === 'true') {
    pm.logger.info('The POSTMAN_DISABLE_GPU is set to true');
    return true;
  }

  const disableGPU = _.attempt(appSettings.getSync, DISABLE_GPU_SETTING);
  pm.logger.info(`The ${DISABLE_GPU_SETTING} setting is set to ${disableGPU}`);

  // The setting has been manually set
  if (typeof disableGPU === 'boolean') {
    return disableGPU;
  } else if (_.isError(disableGPU)) {
    pm.logger.error(disableGPU);
  }

  // Enable GPU by default
  return false;
};

exports.getToggleMenuItem = async () => {
  return new electron.MenuItem({
    type: 'checkbox',
    label: '硬件加速',
    checked: await exports.isGPUEnabled(),
    click: (menuItem, browserWindow) => {
      Promise.resolve().then(async () => {
        if (menuItem.checked) {
          await exports.enableGPU(browserWindow);
        } else {
          await exports.disableGPU(browserWindow);
        }

        menuItem.checked = await exports.isGPUEnabled();
      }).catch((error) => {
        throw error;
      });
    }
  });
};
