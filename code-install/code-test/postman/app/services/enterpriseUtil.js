const app = require('electron').app;

const enterpriseAppName = [
  'PostmanEnterpriseBeta',
  'PostmanEnterprise',
  'PostmanEnterpriseStage'
];

/**
 * This function returns the whether the application is enterprise application or not
 * @returns Boolean
 */
function isEnterpriseApplication () {
  return enterpriseAppName.includes(app.getName());

}

module.exports = {
  isEnterpriseApplication
};
