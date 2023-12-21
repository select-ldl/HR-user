const os = require('os'),
      _ = require('lodash'),
      exec = require('child_process').exec,
      windowManager = require('./windowManager').windowManager,
      authHandler = require('./AuthHandler'),
      { app } = require('electron'),
      appStatus = require('../common/services/AppStatus'),
      protocolUtils = require('./ProtocolUtils'),

      DARWIN = 'Darwin',
      LINUX = 'linux',

      APP_NAME = app.getName(),

      PROTOCOL_NAME = protocolUtils.getProtocolName(APP_NAME),
      POSTMAN_PROTOCOL = `${PROTOCOL_NAME}://`,
      AUTH_NAMESPACE = `${POSTMAN_PROTOCOL}auth`;

/**
 * @method handleOpenUrl
 * @description This is used to do following things:
 * 1. Open the url in requester window through window manager
 * 2. For passing auth context from Identity to postman app.
 * @param {String} url
 */
function handleOpenUrl (url) {
  pm.logger.info(`ProtocolHandler~handleOpenUrl: ${url}`);

  // AuthHandler will handle all urls that belong to auth namespace.
   if (_.startsWith(url, AUTH_NAMESPACE)) {
      return authHandler.handleAuthUrl(url);
   }

  // Waiting for requester/scratchpad to boot before we open the URL
  appStatus.onAppBooted()
    .then(() => {
      windowManager.initUrl = url;
      windowManager.openUrl(url);
    });
}

/**
 * @method processArg
 * @description This will process the arguments provided to find the postman protocol init.
 * @param {Array<String>} argv
 */
function processArg (argv = []) {
  // Bail out for darwin as it will be handled on open-url event handling
  if (os.type() === DARWIN) {
    return;
  }

  // This would be linux or windows, since os.type() will have only 3 possible values
  // Electron will always append the latest argument at the end.
  // since, we attach the protocol handler with process.argv while doing app.setAsDefaultProtocolClient
  _.forEachRight(argv, (arg) => {
    if (arg.startsWith(POSTMAN_PROTOCOL)) {
      handleOpenUrl(arg);
      return false;
    }
  });
}

/**
 * @method handleOpenUrlForDarwin
 * @description This will handle the open-url event triggered in darwin
 * @param {Object} event
 * @param {String} url
 */
function handleOpenUrlForDarwin (event, url) {
  // https://electronjs.org/docs/api/app#event-open-url-macos
  // PreventDefault is needed if we are handling the event.
  event.preventDefault();
  pm.logger.info(`ProtocolHandler~handleOpenUrlForDarwin - Opened with url: ${url}`);
  handleOpenUrl(url);
}

/**
 * @method isDefaultProtocolClient
 * @description Method to check whether the current executable is registered with the protocol name or not
 * @returns {Promise}
 */
function isDefaultProtocolClient () {
  return new Promise((resolve) => {

    if (process.env.PM_BUILD_ENV === 'development') {
      // In dev mode, electron setDefaultProtocolClient API registers the protocol for the electron executable file which is present inside node_modules.
      // The electron setDefaultProtocolClient API doesn't support to modify the executable path other than the default `process.execPath` path.
      // Read more : https://www.electronjs.org/docs/api/app#appsetasdefaultprotocolclientprotocol-path-args
      // Hence, early bail out is done for isDefaultProtocolClient API for dev mode.
      return resolve(false);
    }

    // For darwin and windows
    if (process.platform !== LINUX) {
      return resolve(app.isDefaultProtocolClient(PROTOCOL_NAME));
    }

    // To check if the xdg-mime command registered the default correctly, we run the command 'xdg-mime query default x-scheme-handler/<PROTOCOL_NAME>'.
    // If the output of this command is '<APP_NAME>.desktop', the handler registered correctly.
    exec(`xdg-mime query default x-scheme-handler/${PROTOCOL_NAME}`, (error, stdout, stderr) => {

      // Case where above command returns the desktop file name as a output
      // The above command will not return anything if the executable path inside .desktop file is wrong (Because in that case protocol will not be registered successfully)
      if (stdout && stdout.includes(`${APP_NAME}.desktop`)) {
        return resolve(true);
      }

      // For the scenario where protocol was registered using `app.setAsDefaultProtocolClient` API
      if (app.isDefaultProtocolClient(PROTOCOL_NAME)) {
        return resolve(true);
      }

      // Default return false in following cases :
      // 1. Where the protocol was not registered using the `xdg-mime` linux command and electron API
      // 2. Where the `xdg-mime` linux command returns error
      return resolve(false);
    });
  });
}

/**
 * @method setDefaultProtocolClient
 * @description This method makes the Postman app as the default app for handling files with urls starting with <PROTOCOL_NAME>://
 * @returns {Promise}
 */
function setDefaultProtocolClient () {
  return new Promise((resolve) => {
    if (process.env.PM_BUILD_ENV === 'development') {
      // In dev mode, electron setDefaultProtocolClient API registers the protocol for the electron executable file which is present inside node_modules.
      // The electron setDefaultProtocolClient API doesn't support to modify the executable path other than the default `process.execPath` path.
      // Read more : https://www.electronjs.org/docs/api/app#appsetasdefaultprotocolclientprotocol-path-args
      // Hence, early bail out is done while registering the protocol for dev mode.
      return resolve(false);
    }

    if (process.platform !== LINUX) {
      let isCustomProtocolAssigned = app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath);

      pm.logger.info(`ProtocolHandler~init - Success with status: ${isCustomProtocolAssigned}]`);

      return resolve(isCustomProtocolAssigned);
    }

    // For handling Linux, we run the xdg-mime command manually instead of using the Electron api app.setAsDefaultProtocolClient.
    // This is because setAsDefaultProtocolClient uses xdg-settings to set the app as default. This led to the app being set as
    // default for html files as well.
    // Github issue - https://github.com/postmanlabs/postman-app-support/issues/5558

    // To check if the xdg-mime command registered the default correctly, we run the command 'xdg-mime query default x-scheme-handler/<PROTOCOL_NAME>'.
    // If the output of this command is '<APP_NAME>.desktop', the handler registered correctly.
    exec(`xdg-mime default ${APP_NAME}.desktop x-scheme-handler/${PROTOCOL_NAME}`, (error) => {
      if (error) {
        pm.logger.error(`ProtocolHandler~setDefaultProtocolClient: ${error.message}`);

        // Fallback in case xdg-mime gives an error
        return resolve(app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath));
      }

      return resolve(true);
    });
  });
}

/**
 * @method init
 * @description It initialized the handling needed for protocol handling.
 * @param {Function} [cb]
 * https://postmanlabs.atlassian.net/wiki/spaces/ENGINEERING/pages/757366824/How+Run+in+Postman+Protocol+handling+works+in+app
 */
function init () {
  let args = Array.from(process.argv);

  processArg(args);

  // For handling Darwin
  app.on('open-url', handleOpenUrlForDarwin);

  setDefaultProtocolClient();
}

module.exports = { init, processArg, isDefaultProtocolClient, setDefaultProtocolClient };
