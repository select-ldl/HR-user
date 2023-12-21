const { NodeProcess } = require('./NodeProcess'),
  { IPCNode } = require('./IPCNode'),
  fs = require('fs');

/**
 * @description Validates the parameters passed to create the NodeProcess class
 * @param { String } modulePath The absolute path of the entry module
 * @param { String } name The name of the process, a way to identify this process. This will be used to identify log file, config files, etc.,
 * @param { Object } options The options object
 * @returns { Boolean } returns true if the params are valid, false otherwise
 */
function validateParams (modulePath, name, options) {
  if (typeof name !== 'string') {
      pm.logger.error('index~validateParams - name must be a string');
      return false;
  }
  if (typeof modulePath !== 'string') {
      pm.logger.error('index~validateParams - modulePath must be a string representing an absolute path');
      return false;
  }
  if (!fs.existsSync(modulePath)) {
      pm.logger.error('index~validateParams - modulePath must be a valid path');
      return false;
  }
  if (options.env && !(typeof options.env === 'object' && options.env.constructor === Object)) {
      pm.logger.error('index~validateParams - options.env must be a JSON object');
      return false;
  }
  return true;
}

/**
 * @description Initializes NodeProcess instance
 * @param { String } modulePath The absolute path of the entry module
 * @param { String } name The name of the process, a way to identify this process. This will be used to identify log file, config files, etc.,
 * @param { Object } options The options object
 * @returns { NodeProcess | null } returns NodeProcess instance if the params are valid, null otherwise
 */
function spawn (modulePath, name, options) {
  typeof options !== 'object' && (options = {});
  if (!validateParams(modulePath, name, options)) {
    return null;
  }
  return new NodeProcess(modulePath, name, options);
}

module.exports = { spawn, IPCNode };
