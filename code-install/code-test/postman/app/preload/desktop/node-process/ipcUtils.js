const path = require('path'),
  { getUserDataDirectory } = require('./pathUtils');

/**
 * @description Generates the IPC handle for windows platform depending on the type
 * @param { String } userDataPath The application user data path
 * @param { String } name The name of the IPC handle
 * @returns { String } The IPC handle
 */
function getWin32IPCHandle (name) {
  return `\\\\.\\pipe\\${name}-sock`;
}

/**
* @description Generates the IPC handle for Nix platform depending on the type
* @param { String } userDataPath The application user data path
* @param { String } name The name of the IPC handle
* @returns { String } The IPC handle
*/
function getNixIPCHandle (userDataPath, name) {
  return path.join(userDataPath, `${name}.sock`);
}

/**
* @description Generates the IPC handle depending on the type. Refer https://nodejs.org/docs/latest-v12.x/api/net.html#net_identifying_paths_for_ipc_connections
* @param { String } userDataPath The application user data path
* @param { String } name The name of the IPC handle
* @returns { String } The IPC handle
*/
function getIPCHandle (name) {
  const userDataPath = getUserDataDirectory();
  if (process.platform === 'win32') {
      return getWin32IPCHandle(name);
  }

  return getNixIPCHandle(userDataPath, name);
}


/**
 * Gets unique response channels when registering handler
 * @param { String } channel The channel for which the handler is registered
 */
function getResponseChannels (channel) {
  const uid = process.hrtime.bigint();
  return {
      data: `${channel}-data-channel-${uid}`,
      error: `${channel}-error-channel-${uid}`
  };
}

module.exports = { getIPCHandle, getResponseChannels };
