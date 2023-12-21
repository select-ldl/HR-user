const { getOrCreateUuid, NIL_UUID } = require('./installationId');

const appSettings = require('../appSettings').appSettings,
  { app } = require('electron');

/**
 * @description Utility to generate and maintain a unique identifier per directory.
 *  Generates a uuid if not already generated. Also creates a file with .uuid extension to persist the uuid.
 *  Retrieves the previously generated uuid by using the meta data of uuid file.
 *  Inorder to respect the existing installation id, we are also looking in the app settings before creating.
 *  This change from using app settings to uuid file is due to https://postmanlabs.atlassian.net/browse/CFDTN-229
 *
 * @returns { Promise<Object> } A promise which resolves to an object with id and isCreatedNow properties.
 *  uuid will be '00000000-0000-0000-0000-000000000000', if storing a generated uuid fails - not to create multiple id's for a single installation.
 *  isCreatedNow will be true if the id is generated now, false otherwise.
 *  Uuid file creation fails if the API 'electron.app.getPath('userData')' breaks.
 *
 * @requires appSettings The electron storage since we try to retrieve the already stored installation id from it.
 * @requires pm.logger The logger to use
 */
function getOrCreateInstallationId () {
  const directory = app.getPath('userData'); // the directory where the uuid needs to be maintained.
  return getOrCreateUuid(directory, appSettings, pm.logger);
}

module.exports = { getOrCreateInstallationId, NIL_UUID };
