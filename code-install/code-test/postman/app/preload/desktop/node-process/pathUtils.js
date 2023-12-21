const path = require('path'),
  os = require('os'),
  rendererProjectRoot = path.join(__dirname, '..', '..', '..');

/**
 * @returns the startup module for the node process
 */
function getEntryModulePath (entryModule) {
  if (process.type !== 'renderer') {
    return entryModule;
  }

  return path.resolve(rendererProjectRoot, entryModule);
}

/**
 * @returns the path for the node executable
 */
function getExecPath () {
  return process.execPath;
}

/**
* Returns the current running app name
*/
function getAppName () {
  // postman-skip-import-validation
  const packageJson = require(path.resolve(rendererProjectRoot, 'package.json'));
  return packageJson.name;
}

/**
* Returns the path of the current user data directory
* Tries to replicate the electron's app.getPath('userData') https://www.electronjs.org/docs/api/app#appgetpathname
*/
function getUserDataDirectory () {
  switch (os.platform()) {
      case 'darwin':
          return path.resolve(os.homedir(), 'Library', 'Application\ Support', getAppName());
      case 'win32':
          return path.resolve(process.env.APPDATA, getAppName());
      case 'linux':
          return path.resolve(os.homedir(), '.config', getAppName());
  }
}

/**
* @method getLogPath
* @description Assigns the logging folder path
* @return {String}
*/
function getLogPath () {
  return path.resolve(getUserDataDirectory(), 'logs');
}

module.exports = { getLogPath, getExecPath, getUserDataDirectory, getEntryModulePath };
