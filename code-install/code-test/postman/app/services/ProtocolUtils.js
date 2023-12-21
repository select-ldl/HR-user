const _ = require('lodash');

const DEFAULT_PROTOCOL = 'postman',
  appNameProtocolMap = {
    Postman: 'postman',
    PostmanEnterprise: 'postman',
    PostmanCanary: 'postman',
    PostmanBeta: 'postman-beta',
    PostmanEnterpriseBeta: 'postman-beta',
    PostmanStage: 'postman-stage',
    PostmanEnterpriseStage: 'postman-stage',
    PostmanDev: 'postman-dev'
  },
  releaseChannelProtocolMap = {
    prod: 'postman',
    canary: 'postman',
    beta: 'postman-beta',
    stage: 'postman-stage',
    dev: 'postman-dev'
  };

/**
 * This function returns the protocol handler corresponding to the environment of current application
 * @param {String} name
 * @returns String
 */
function getProtocolName (name) {
  // For main process
  if (process && process.type && process.type === 'browser') {
    return appNameProtocolMap[name] || DEFAULT_PROTOCOL;
  }

  return releaseChannelProtocolMap[name] || DEFAULT_PROTOCOL;
}


module.exports = {
  getProtocolName
};

