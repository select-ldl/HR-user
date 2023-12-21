const waterfall = require('async').waterfall,
  fs = require('fs'),
  path = require('path'),
  parallel = require('async').parallel,
  _ = require('lodash'),
  proxyConstants = require('../constants/ProxyConstants'),
  { generateRootCa, getCertInfo } = require('./proxyCertificateUtil'),
  { promiseAllSettled } = require('../utils/promiseUtils');

/**
 * Deletes the certificates that have been expired
 *
 * @param {object} certMap object that contains the map of commonName to key and certificate path
 */
async function deleteCertificates (certMap, certMapFile, deleteAll = false, deleteExpired = false) {
  var toDelete = [];

  const promiseArray = _.map(certMap, async (value, key) => {
    if (deleteAll) {
      toDelete.push(key);
      fs.unlinkSync(value.certFile);
      fs.unlinkSync(value.keyFile);
    }
    if (deleteExpired) {
      return deletePairOnCertExpired(value.certFile, value.keyFile, key);
    }
  });

  const results = await promiseAllSettled(promiseArray);

  if (deleteExpired) {
    _.forEach(results, (res) => {
      if (res.status === 'fulfilled') {
        res.value && toDelete.push(res.value);
      }
    });
  }

  _.forEach(toDelete, (value) => {
    delete certMap[value];
  });
  fs.writeFileSync(certMapFile, JSON.stringify(certMap, true, 2));
}

/**
 * Creates root CA key and certificate by options mentioned
 *
 * @param {Number} keyBitSize
 * @param {Object} certOptions
 * @param {String} certOptions.country
 * @param {String} certOptions.state
 * @param {String} certOptions.locality
 * @param {String} certOptions.emailAddress
 * @param {String} certOptions.organization
 * @param {String} certOptions.organizationUnit
 * @param {Number} certOptions.days
 * @param {String} certOptions.commonName
 * @returns {Object} containing root key & cert
 */
function createRootCAKeyAndCertificate (keyBitSize, certOptions) {
  const certConfig = createConfigForCertificate(keyBitSize, certOptions);
  return new Promise((resolve, reject) => {
    waterfall([
      (next) => {
        generateRootCa(certConfig.attr, certConfig.options, certOptions, (error, details) => {
          if (error) {
            return next(error);
          }
          const pair = {
            cert: details.certificate,
            key: details.clientKey
          };
          return next(null, pair);
        });
      }
    ], (err, newCA) => {
      if (err) {
        pm.logger.error('Error encountered while creating root CA', err);
        return reject(err);
      }
      return resolve(newCA);
    });
  });
}

/**
 *
 * @returns
 */
function createConfigForCertificate () {
  const attr = [
    {
      name: 'commonName',
      value: proxyConstants.COMMON_NAME
    },
    {
      name: 'countryName',
      value: proxyConstants.COUNTRY
    },
    {
      shortName: 'OU',
      value: proxyConstants.ORGUNIT
    },
    {
      shortName: 'O',
      value: proxyConstants.ORG
    },
    {
      shortName: 'E',
      value: proxyConstants.EMAIL
    },
    {
      shortName: 'ST',
      value: proxyConstants.STATE
    },
    {
      shortName: 'L',
      value: proxyConstants.LOCALITY
    }];
    const options = {
      keySize: 2048,
      algorithm: proxyConstants.HASH,
      days: proxyConstants.DAYSTOEXPIRY,
      extensions: [
        {
          name: 'basicConstraints',
          cA: true
        }
      ]
    };
  return {
    attr, options
  };
}

/**
 * Ensures that a non-expired rootCA is present for HTTPS proxy
 * Creates rootCA if expired or not present
 * Deletes other keys signed by previous rootCA if the previous rootCA is deleted
 * Deletes all the expired keys signed by the rootCA
 *
 * @param {Number} options.keyBitSize - size of the private key
 * @param {Object} options.certOptions - certificate options
 * @param {String} options.certOptions.country
 * @param {String} options.certOptions.state
 * @param {String} options.certOptions.locality
 * @param {String} options.certOptions.emailAddress
 * @param {String} options.certOptions.organization
 * @param {String} options.certOptions.organizationUnit
 * @param {Number} options.certOptions.days
 * @param {String} options.certOptions.commonName
 * @param {Object} options.locationMeta
 * @param {String} options.locationMeta.rootCALocation - path to storing root CA
 * @param {String} options.locationMeta.certMapFile - path to cert.json file
 * @param {Object} certMap - cert map containing CN->cert location mapping
 * @returns {Object} containing root key & cert
 */
async function ensureRootCAPresence (options, certMap) {
  const { keyBitSize, certOptions } = options,
    { rootCALocation, certMapFile } = options.locationMeta;
  let rootCA = {};

  const rootCACertFile = path.resolve(rootCALocation, `${proxyConstants.CA_SUFFIX_NAME}.crt`),
    rootCAKeyFile = path.resolve(rootCALocation, `${proxyConstants.CA_SUFFIX_NAME}.key`);

  let deleteRootCA = false;
  try {
    if (!fs.existsSync(rootCACertFile) || !fs.existsSync(rootCAKeyFile)) {
      deleteRootCA = true;
    }
    if (await deletePairOnCertExpired(rootCACertFile, rootCAKeyFile)) {
      deleteRootCA = true;
    }
  } catch (e) {
    deleteRootCA = true;
  }

  if (deleteRootCA) {
    fs.existsSync(rootCACertFile) && fs.unlinkSync(rootCACertFile);
    fs.existsSync(rootCAKeyFile) && fs.unlinkSync(rootCAKeyFile);

    // Flush all certificates signed by previous rootCA
    await deleteCertificates(certMap, certMapFile, true, false);

    rootCA = await createRootCAKeyAndCertificate(keyBitSize, certOptions);
    !fs.existsSync(rootCALocation) && fs.mkdirSync(path.resolve(rootCACertFile, '..'));
    fs.writeFileSync(rootCACertFile, rootCA.cert, { flag: 'wx' });
    fs.writeFileSync(rootCAKeyFile, rootCA.key, { flag: 'wx' });
  } else {
    rootCA = await getCertificateAndKey(rootCACertFile, rootCAKeyFile);
  }
  return _.pick(rootCA, 'key', 'cert');
}

/**
 *
 * @param {String} certPath
 * @param {String} keyPath
 * @returns {Promise} true if deleted, false otherwise
 */
function deletePairOnCertExpired (certPath, keyPath, key) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(certPath), 'utf8', (err, certificate) => {
      if (err) {
        console.log('error reading file' + err);
        reject(err);
      }
      else {
        getCertInfo(certificate, (err, details) => {
          if (!err) {
            const certValidity = new Date(details.validity.notAfter).getTime();
            if (certValidity < Date.now()) {
              // unlink expired certificates
              parallel([
                (callback) => {
                  fs.unlink(path.resolve(certPath), callback);
                },
                (callback) => {
                  fs.unlink(path.resolve(keyPath), callback);
                }
              ], (err) => {
                if (err) {
                  console.log('Error while unlinking the certificate pair', err);
                  reject(err);
                  return;
                }
                resolve(key);
              });
            } else {
              resolve(false);
            }
          }
          else {
            console.log('Error reading certificate', err);
            reject(err);
          }
        });
      }
    });
  });
}

/**
 *
 * Reads key & certificate from the given location
 *
 * @param {String} certPath certificate file path
 * @param {String} keyPath key file path
 * @returns {Object} contains key & cert
 */
function getCertificateAndKey (certPath, keyPath) {
  return new Promise(((resolve, reject) => {
    parallel([
      (callback) => {
        fs.readFile(path.resolve(certPath), 'utf8', (err, cert) => {
          if (err) {
            return callback(err);
          }
          callback(null, cert);
        });
      },
      (callback) => {
        fs.readFile(path.resolve(keyPath), 'utf8', (err, key) => {
          if (err) {
            return callback(err);
          }
          callback(null, key);
        });
      }
    ], (err, results) => {
        if (err) {
          reject(err);
        }
        resolve({
          cert: results[0],
          key: results[1]
        });
    });
  }));
}

/**
 *
 * Reads key & certificate from the given location
 *
 * @param {String} storeLocation location to rootCA cert store
 * @returns {Object} containing key & cert
 */
function generateRootCAForProxy (storeLocation) {
  return new Promise(async (resolve, reject) => {
    const rootCADir = path.resolve(storeLocation, 'proxy'),
      certMapDir = path.resolve(rootCADir, 'certificates'),
      certMapFile = path.resolve(certMapDir, 'cert.json');
    let certMap;

    try {
      !fs.existsSync(rootCADir) && fs.mkdirSync(rootCADir);
      !fs.existsSync(certMapDir) && fs.mkdirSync(certMapDir);
      !fs.existsSync(certMapFile) && fs.writeFileSync(certMapFile, JSON.stringify({}), { flag: 'wx' });
      certMap = JSON.parse(fs.readFileSync(certMapFile, 'utf8'));
      await deleteCertificates(certMap, certMapFile, false, true);
      const rootCA = await ensureRootCAPresence({
        keyBitSize: proxyConstants.KEYBITSIZE,
        certOptions: {
          country: proxyConstants.COUNTRY,
          state: proxyConstants.STATE,
          emailAddress: proxyConstants.EMAIL,
          locality: proxyConstants.LOCALITY,
          organization: proxyConstants.ORG,
          organizationUnit: proxyConstants.ORGUNIT,
          days: proxyConstants.DAYSTOEXPIRY,
          commonName: proxyConstants.COMMON_NAME,
          hash: proxyConstants.HASH
        },
        locationMeta: {
          rootCALocation: rootCADir,
          certMapFile: certMapFile
        }
      }, certMap);
      return resolve(rootCA);
    } catch (e) {
      pm.logger.error('Error generating rootCA certificate for HTTPS proxy', e);
      return reject(e);
    }
  });
}

/**
 * Deletes old certificates and regenerates new rootCA
 *
 * @param {*} storeLocation location to rootCA cert store
 */
async function regenerateCertificates (storeLocation) {
  const rootCADir = path.resolve(storeLocation, 'proxy'),
    rootCACertFile = path.resolve(rootCADir, `${proxyConstants.CA_SUFFIX_NAME}.crt`),
    rootCAKeyFile = path.resolve(rootCADir, `${proxyConstants.CA_SUFFIX_NAME}.key`),
    rootCACertFilep12 = path.resolve(rootCADir, `${proxyConstants.CA_SUFFIX_NAME}.p12`);

  try {
    fs.existsSync(rootCACertFile) && fs.unlinkSync(rootCACertFile);
    fs.existsSync(rootCAKeyFile) && fs.unlinkSync(rootCAKeyFile);
    fs.existsSync(rootCACertFilep12) && fs.unlinkSync(rootCACertFilep12);

    await generateRootCAForProxy(storeLocation);
  } catch (e) {
    pm.logger.error('Error regenerating certificates: ', e);
  }
}

module.exports = {
  getCertificateAndKey,
  generateRootCAForProxy,
  regenerateCertificates
};
