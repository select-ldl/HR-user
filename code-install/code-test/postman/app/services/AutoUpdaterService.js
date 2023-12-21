var _ = require('lodash'),
    app = require('electron').app,
    enterpriseUtils = require('./enterpriseUtil');

const LINUX = 'LINUX',
      LINUX_SNAP = 'LINUX_SNAP',
      PLATFORM = process.platform,
      SNAP = process.env.SNAP;

let _getInstallationType = function () {
  let installationType;

    switch (PLATFORM) {
      case 'linux':
        if (SNAP) {
          installationType = LINUX_SNAP;
        } else {
          installationType = LINUX;
        }
        break;
      case 'windows':
      case 'darwin':
        installationType = _.toUpper(PLATFORM);
        break;
    }

    return installationType;
},

isAppUpdateEnabled = function () {
  // App updates are not enabled for enterprise application
  if (enterpriseUtils.isEnterpriseApplication()) {
    return false;
  }
  return _getInstallationType() !== LINUX_SNAP;
};

module.exports = {
  isAppUpdateEnabled
};
