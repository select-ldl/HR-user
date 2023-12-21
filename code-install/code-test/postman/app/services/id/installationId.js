const fs = require('fs'),
  path = require('path'),
  uuidV4 = require('uuid/v4'),
  NIL_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * @description Get uuid from the input directory. Lookup fails, if the input directory is invalid.
 *   This looks for a file with .uuid extension. The filename will be the uuid.
 *
 * @param { String } directory the directory where the uuid file needs to be searched.
 * @returns { Promise<String | null> } a promise which resolves to the id if exists, null otherwise.
 */
function getUuidFromTheDirectory (directory, logger) {
  return fs.promises.readdir(directory)
    .then((files) => {
      for (const file of files) {
        const parsedFile = path.parse(file);
        if (parsedFile.ext === '.uuid') {
          return parsedFile.name;
        }
      }
      return null;
    })
    .catch((err) => {
      logger.error('installationId~getUuidFromTheDir - Error while trying to read the uuid filename as installationId from the directory ', err);
      return null;
    });
}

/**
 * @description Writes it as the name of a uuid file in the input directory. Fails to create the file, if the directory is invalid.
 * @param { String } directory the directory where the uuid file needs to be created. The directory should exists.
 * @param { String } uuid unique id to be persisted.
 * @returns { Promise<Boolean> } Promise which resolves to true, if the file creation succeeds. false, otherwise
 */
function createUuidFile (directory, uuid, logger) {
  const uuidFilePath = path.resolve(directory, `${uuid}.uuid`);
  return fs.promises.writeFile(uuidFilePath, '')
    .then(() => { return true; })
    .catch((err) => {
      logger.error('installationId~createUuidFile - Error while trying to write the installationId as uuid filename in the directory ', err);
      return false;
    });
}

/**
 * @description Gets uuid from AppSettings of the application.
 * @returns { Promise<String | null> } a promise which resolves to the uuid, if exists in app settings, null otherwise.
 */
function getUuidFromAppSettings (appSettings, logger) {
  return new Promise((resolve, reject) => {
    appSettings.get('installationId', (err, id) => {
      if (id) {
        return resolve(id);
      }
      err && logger.warn('installationId~getUuidFromAppSettings - Error while trying to get installationId from appSettings');
      return resolve(null);
    });
  });
}

/**
 * @description Utility to generate and maintain a unique identifier per directory.
 *  Generates a uuid if not already generated. Also creates a file with .uuid extension to persist the uuid.
 *  Retrieves the previously generated uuid by using the meta data of uuid file.
 *  Inorder to respect the existing installation id, we are also looking in the app settings before creating.
 *
 * @param { String } directory The absolute path of the directory where the installation id is to be maintained.
 * @param { Object } appSettings The appSettings Service object which will be used to look up the previously generated installation id.
 * @param { Object } logger The logger object to use
 *
 * @returns { Promise<Object> } A promise which resolves to an object with id and isCreatedNow properties.
 *  uuid will be '00000000-0000-0000-0000-000000000000', if storing a generated uuid fails - not to create multiple id's for a single installation.
 *  isCreatedNow will be true if the id is generated now, false otherwise.
 *  Uuid file creation fails if the directory is not valid.
 */
async function getOrCreateUuid (directory, appSettings, logger = console) {
  let uuid = await getUuidFromTheDirectory(directory, logger);
  if (uuid) {
    return { id: uuid, isCreatedNow: false };
  }

  uuid = await getUuidFromAppSettings(appSettings, logger);
  if (uuid) {
    await createUuidFile(directory, uuid, logger);
    return { id: uuid, isCreatedNow: false };
  }

  uuid = uuidV4();
  const isUuidFileCreated = await createUuidFile(directory, uuid, logger);
  if (!isUuidFileCreated) {
    return { id: NIL_UUID, isCreatedNow: true };
  }
  return { id: uuid, isCreatedNow: true };
}

module.exports = { getOrCreateUuid, NIL_UUID };

