const os = require('os');
const fs = require('fs');
const https = require('https');
const { app } = require('electron');
const path = require('path');
const unzip = require('unzip-crx-3');
const devtoolsUtils = require('./devtoolsConstants');

/**
 *
 * @returns String - Path for extensions installed
 */
function _getPath () {
  const savePath = app.getPath('userData');
  return path.resolve(`${savePath}/extensions`);
}

/**
 *
 * @param {*} from
 * @param {*} to
 * @returns
 */
function _downloadFile (from, to) {
  return new Promise((resolve, reject) => {
    const req = https.request(from);
    req.on('response', (res) => {
      // Shouldn't handle redirect with `electron.net`, this is for https.get fallback
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return _downloadFile(res.headers.location, to).then(resolve).catch(reject);
      }
      res.pipe(fs.createWriteStream(to)).on('close', resolve);
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 *
 */
function _changePermissions (dir, mode) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    fs.chmodSync(filePath, parseInt(`${mode}`, 8));
    if (fs.statSync(filePath).isDirectory()) {
      _changePermissions(filePath, mode);
    }
  });
}

/**
 *
 * @param {String} chromeStoreID - Extension id
 * @param {Boolean} forceDownload - Forcefully download the extension
 * @param {number} attempts - number of times to reattempt downloading extension
 * @returns Promise<String>
 */
function _downloadChromeExtension (chromeStoreID, forceDownload, attempts = 5) {
  const extensionsStore = _getPath();
  if (!fs.existsSync(extensionsStore)) {
      fs.mkdirSync(extensionsStore, { recursive: true });
  }
  const extensionFolder = path.resolve(`${extensionsStore}/${chromeStoreID}`);
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(extensionFolder) || forceDownload) {
      if (fs.existsSync(extensionFolder)) {
        fs.rmdirSync(extensionFolder, { recursive: true });
      }
      const fileURL = `https://clients2.google.com/service/update2/crx?response=redirect&acceptformat=crx2,crx3&x=id%3D${chromeStoreID}%26uc&prodversion=32`; // eslint-disable-line
      const filePath = path.resolve(`${extensionFolder}.crx`);
      _downloadFile(fileURL, filePath)
        .then(() => {
          unzip(filePath, extensionFolder)
            .then(() => {
              _changePermissions(extensionFolder, 755);
              resolve(extensionFolder);
            })
            .catch((err) => {
              if (!fs.existsSync(path.resolve(extensionFolder, 'manifest.json'))) {
                  return reject(err);
              }
            });
        })
        .catch((err) => {
          pm.logger.info(`Failed to fetch extension, trying ${attempts - 1} more times`); // eslint-disable-line
          if (attempts <= 1) {
              return reject(err);
          }
          setTimeout(() => {
            _downloadChromeExtension(chromeStoreID, forceDownload, attempts - 1)
              .then(resolve)
              .catch(reject);
          }, 200);
        });
    }
    else {
      resolve(extensionFolder);
    }
  });
}

/**
 *
 */
function init (cb) {
  if (process.env.PM_BUILD_ENV !== 'development') {
    return cb(null);
  }

  const ListOfDevtools = devtoolsUtils.ListOfDevtools;
  const promiseArray = [];

  for (const index in ListOfDevtools) {
    promiseArray.push(_downloadChromeExtension(ListOfDevtools[index].id, false).then((extensionFolder) => {
      pm.logger.info(`DevtoolsInstaller~Extension downloaded for ${ListOfDevtools[index].name} at`, extensionFolder);
    }).catch((err) => {
      pm.logger.info(`DevtoolsInstaller~Error occurred while downloading extension for ${ListOfDevtools[index].name}`, err);
    }));
  }

  Promise.allSettled(promiseArray).then(() => {
    app.on('session-created', (session) => {
      if (!session.isPersistent() || !app.isReady()) {
        return;
      }
      const ListOfDevtools = devtoolsUtils.ListOfDevtools;
      var index;
      for (index in ListOfDevtools) {
        session.loadExtension(path.resolve(app.getPath('userData'), 'extensions', ListOfDevtools[index].id), { allowFileAccess: true }).then((result) => {
          pm.logger.info('DevtoolsInstaller~Devtools loaded', result.name);
        }).catch((err) => {
          pm.logger.error('DevtoolsInstaller~Error ocurred while attaching devtools', err);
        });
      }
    });
    return cb(null);
  });
}

module.exports = {
  init
};
