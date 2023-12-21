const forge = require('node-forge');
const pem = require('pem');
const { waterfall } = require('async');

/**
 * This function is used to generate the serial number
 * @param {string} hexString
 * @returns
 */
function toPositiveHex (hexString) {
  var mostSiginficativeHexAsInt = parseInt(hexString[0], 16);
  if (mostSiginficativeHexAsInt < 8) {
    return hexString;
  }

  mostSiginficativeHexAsInt -= 8;
  return mostSiginficativeHexAsInt.toString() + hexString.substring(1);
}

/**
 * Thus function is used to generate certificates using the postman root ca
 * @param {Object} attr
 * @param {Object} options
 * @param {Function} callback
 */
const generateCert = (attr, options, csrOptions, callback) => {
  try {
    if (process.platform === 'linux') {
      waterfall([
         (cb) => {
          // create a new CSR
          pem.createCSR(csrOptions, (err, keys) => {
          if (err) {
            pm.logger.info('Error while creating csr', err);
            return callback(err);
          }
          let configOpt, certOptions;

          configOpt = '[req]\nreq_extensions = v3_req\n\n';
          configOpt += '[v3_req]\nbasicConstraints = CA:FALSE\n';
          configOpt += 'keyUsage = nonRepudiation, digitalSignature, keyEncipherment\n';
          configOpt += 'subjectAltName = @alt_names\n\n[alt_names]\n';
          configOpt += csrOptions.altNames && csrOptions.altNames.join('\n'); // check for sanlist
          certOptions = {
            serviceKey: options.keyPair.privateKey,
            serviceCertificate: options.keyPair.publicKey,
            csr: keys.csr,
            clientKey: keys.clientKey,
            days: options.days,
            config: configOpt
          };
          return cb(err, certOptions);
          });
         },
          (certOptions, cb) => {
          // create a new certificate
            pem.createCertificate(certOptions, (err, keys) => {
              if (err) return callback(err);
              return callback(null, keys);
            });
          }
      ]);
    }
    else {
      const privateCAKey = forge.pki.privateKeyFromPem(options.keyPair.privateKey);
      const keys = forge.pki.rsa.generateKeyPair(options.keySize);
      const cert = forge.pki.createCertificate();

      const caCrt = forge.pki.certificateFromPem(options.keyPair.publicKey);

      cert.publicKey = keys.publicKey;

      cert.serialNumber = toPositiveHex(forge.util.bytesToHex(forge.random.getBytesSync(9)));
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + options.days);

      cert.setSubject(attr);
      cert.setIssuer(caCrt.subject.attributes);
      cert.setExtensions(options.extensions);
      cert.sign(privateCAKey, forge.md.sha256.create());

      const pem = {
        clientKey: forge.pki.privateKeyToPem(keys.privateKey),
        public: forge.pki.publicKeyToPem(keys.publicKey),
        certificate: forge.pki.certificateToPem(cert)
      };
      return callback(null, pem);
    }
  }
  catch (err) {
    return callback(err);
  }

};

/**
 * This function generates the root certificate
 *
 * @param {Object} attr
 * @param {Object} options
 * @param {Function} callback
 */
const generateRootCa = (attrs, options, certOptions, callback) => {
  try {
    if (process.platform === 'linux') {
      pm.logger.info('Generated root certificate for linux');
      pem.createCertificate({
        ...certOptions,
        hash: 'sha256',
        keyBitsize: options.keySize,
        selfSigned: true,
        config: `[v3_req]
        basicConstraints = CA:TRUE`
      }, (error, details) => {
        if (error)
          return callback(error);

        return callback(null, details);
      });
    }
    else {
      const keys = forge.pki.rsa.generateKeyPair(options.keySize);
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = toPositiveHex(forge.util.bytesToHex(forge.random.getBytesSync(9)));
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + options.days);

      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      cert.setExtensions(options.extensions);

      cert.sign(keys.privateKey, forge.md.sha256.create());
      const pem = {
        clientKey: forge.pki.privateKeyToPem(keys.privateKey),
        public: forge.pki.publicKeyToPem(keys.publicKey),
        certificate: forge.pki.certificateToPem(cert)
      };
      return callback(null, pem);
    }
  }
  catch (err) {
    return callback(err);
  }
};

/**
 * This function provides the certificate information.
 *
 * @param {Object} cert
 * @param {Function} callback
 */
const getCertInfo = (cert, callback) => {
  try {
    const certDetails = forge.pki.certificateFromPem(cert);
    return callback(null, certDetails);
  }
  catch (err) {
    return callback(err);
  }
};

module.exports = { generateCert, generateRootCa, getCertInfo };
