var HttpProxy = require('http-proxy'),
  path = require('path'),
  http = require('http'),
  https = require('https'),
  net = require('net'),
  fs = require('fs'),
  urlParser = require('url'),
  tls = require('tls'),
  _ = require('lodash'),
  crypto = require('crypto'),
  getPort = require('get-port'),
  accumulateResponse = require('./ResponseAccumulator'),
  { parallel, waterfall } = require('async'),
  lruCache = require('lru-cache'),
  certMap = {},
  proxyConstants = require('../constants/ProxyConstants'),
  proxyCertificateService = require('./proxyCertificateService'),
  which = require('which'),
  { generateCert } = require('./proxyCertificateUtil'),
  certMapFile;

const STORE_LOC = process.env.STORE_LOC,
  ROOT_CA_DIR = path.resolve(STORE_LOC, 'proxy'),
  CERT_DIR = path.resolve(ROOT_CA_DIR, 'certificates'),
  SKIP_RESPONSE_TYPES = [
    'audio',
    'video',
    'image'
  ],
  PROXY_CAPTURE_HEADER = 'x-postman-captr';

// This was commented out because this set the property on the entire process
// including requests made through the Postman UI
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var regex_hostport = /^([^:]+)(:([0-9]+))?$/,
  proxyErrorMessage = '您可以在日志中找到更多信息(视图 > 开发者 > 在查找器/资源管理器中查看日志)',
  proxyGenericErrorMessage = `Postman的代理无法正确转发您的请求. ${proxyErrorMessage}`,
  proxyDNSFailedErrorMessage = `DNS查找失败. ${proxyErrorMessage}`,
  proxyConnectionRefusedErrorMessage = `无法建立连接. ${proxyErrorMessage}`;

/**
 * @description It returns the host and port from the host string
 * @return {Array}
 */
function getHostPortFromString (hostString, defaultPort) {
  var host = hostString;
  var port = defaultPort;

  var result = regex_hostport.exec(hostString);
  if (result != null) {
    host = result[1];
    if (result[2] != null) {
      port = result[3];
    }
  }

  return ([host, port]);
}

/**
 *
 * Exchanges data between proxy socket and request socket
 *
 * @param {*} socketRequest the Socket for the current request
 * @param {*} bodyHead the body headers for the request
 * @param {string} httpVersion the version of HTTP request
 * @param {number} freePort the port used for proxy connection
 */
function proxyData (socketRequest, bodyHead, httpVersion, freePort) {
  var host = 'localhost',
    proxySocket = new net.Socket();

  proxySocket.connect(parseInt(freePort), host, function () {
    proxySocket.write(bodyHead);
    socketRequest.write('HTTP/' + httpVersion + ' 200 Connection established\r\n\r\n');
  });

  proxySocket.pipe(socketRequest);
  socketRequest.pipe(proxySocket);

  proxySocket.on('error', function (err) {
    pm.logger.error('electronProxy~proxyData ~ proxySocket error: ', err);
    socketRequest.write('HTTP/' + httpVersion + ' 500 ConnectionError\r\n\r\n');
    socketRequest.end();
  });
  socketRequest.on('error', function (err) {
    pm.logger.error('electronProxy~proxyData ~ socketRequest error', err);
    proxySocket.end();
  });
  proxySocket.on('close', (hadError) => {
    if (hadError) {
      pm.logger.error('electronProxy~proxyData ~ Proxy socket had error');
    }
  });
  socketRequest.on('close', (hadError) => {
    if (hadError) {
      pm.logger.error('electronProxy~proxyData ~ Socket request had error');
    }
  });
}

/**
* Creates a https server for a common name
*
* @param {number} freePort the free port on which https server is listening
* @param {object} keys object that has the client key and certificate associated with the commonName
* @param {httpProxyServer} proxyHttps the server used to proxy the requests
* @param {function} capturedRequestCallback the callback function called for each request captured
*/
function createHttpsServer (freePort, keys, capturedRequestCallback) {
  const map = {},
    cleanUpResource = (key) => {
      key && delete map[key];
    };

  let proxyHttps = HttpProxy.createProxyServer()
    .on('proxyRes', (proxyRes, req, res) => {
      const response = {},
        key = _.get(req.headers, PROXY_CAPTURE_HEADER);
      _.assign(response, _.pick(proxyRes, 'headers', 'statusCode', 'statusMessage'));

      let queryData = '',
        timeTaken,
        startTime;

      // Intercept response
      if (!isResponseInterceptSkipped(proxyRes)) {
        accumulateResponse(res, proxyRes, function (responseBody) {
          response['body'] = responseBody;

          const mappedInfo = map[key];
          if (mappedInfo) {
            ({ queryData, startTime, timeTaken } = mappedInfo);
            if (!timeTaken && startTime) {
              timeTaken = Date.now() - startTime;
            }
          }
          capturedRequestCallback(req.url, req.method, req.headers, queryData, response, timeTaken);
          cleanUpResource(key);
          return responseBody;
        });
      } else {
        const mappedInfo = map[key];
          if (mappedInfo) {
            ({ queryData, startTime, timeTaken } = mappedInfo);
            if (!timeTaken && startTime) {
              timeTaken = Date.now() - startTime;
            }
          }
        delete response['body'];
        capturedRequestCallback(req.url, req.method, req.headers, queryData, response, timeTaken);
        cleanUpResource(key);
      }
    })
    .on('error', function (err, req, res) {
      if (err.code === 'ECONNREFUSED') {
        res.end(proxyConnectionRefusedErrorMessage);
      }
      else if (err.code === 'ENOTFOUND') {
        res.end(proxyDNSFailedErrorMessage);
      }
      else {
        res.end(proxyGenericErrorMessage);
      }
      pm.logger.error('electronProxy - Error proxying https', err);
    });

  var proxyServerHttps = https.createServer(keys, (req, res) => {
    let oldProxyHttps = proxyHttps;
    const startTime = Date.now();
    let timeTaken;

    req.url = 'https://' + req.socket.servername + req.url;
    var urlParts = urlParser.parse(req.url, true),
      target = urlParts.protocol + '//' + urlParts.host,
      queryData = '';
    req.on('data', (data) => {
      queryData += data;
      if (queryData.length > 1e6) {
        queryData = '';
      }
    });
    req.on('error', (err) => {
      pm.logger.info('Error with proxy req', err);
    });
    req.on('end', () => {
      timeTaken = Date.now() - startTime;

      // Find relevant track
      let key = _.get(req.headers, PROXY_CAPTURE_HEADER);

      if (key) {
        map[key] = { queryData, startTime, timeTaken, ended: true };
      }
    });
    try {
      // Important
      // Set capture header to track
      const key = String(parseInt(Math.random() * 10000000));
      req.headers[PROXY_CAPTURE_HEADER] = key;
      map[key] = { queryData, startTime };
      oldProxyHttps.web(req, res, { target: target }, (err) => {
        pm.logger.info('Error while proxying HTTPS requests', err);
      });
    }
    catch (err) {
      pm.logger.info('Error in proxying HTTPS requests: ', err);
    }
  });
  proxyServerHttps.on('error', (err) => {
    pm.logger.info('Error while creating HTTPS proxy server', err);
  }).listen(freePort);
  return proxyServerHttps;
}

/**
 *
 * @returns {Promise} - resolves to true if openssl is present; false otherwise - does NOT reject
 */
function checkOpenSSLInstallation () {
  return new Promise((resolve) => {
    which('openssl', function (error) {
      if (error) {
        return resolve(false);
      }
      return resolve(true);
    });
  });
}

/**
 * Determines if response can be captured or not
 *
 * @param {object} capturedResponse The response returned by the proxy.
 * @returns {boolean} - true if response is eligible to be captured , else false
 */
function isResponseInterceptSkipped (capturedResponse) {
  const contentType = _.get(capturedResponse, ['headers', 'content-type']);
  return contentType && _.some(SKIP_RESPONSE_TYPES, (responsePattern) => (contentType && contentType.search(responsePattern) >= 0));
}


exports.electronProxy = {
  proxy: null,
  proxy_s: null,
  proxyServer: null,
  proxyServer_s: null,
  lastHttpsUrl: null,

  /**
   *
   * @param {Number} port - Number denoting the port on which to start the proxy
   * @param {Function} proxyClosedCallback callback function called when the proxy closes
   * @param {Function} capturedRequestCallback callback function to capture the request
   * @param {Function} proxyStartErrorCallback callback function called when there's an error while starting proxy
   * @param {Function} proxyStartSuccessCallback callback function called when proxy is started successfully
   */
  startProxy: async (port, proxyClosedCallback, capturedRequestCallback,
    proxyStartErrorCallback, proxyStartSuccessCallback, proxyErrorCallback) => {
    var cnPortCache = new lruCache({
      max: 200,
      length: (val, cn) => {
        return 1;
      },
      dispose: (cn, ctx) => {
        const server = ctx.server;
        server.close();
      }
    }),
      certMapFile = path.resolve(CERT_DIR, 'cert.json'),
      rootCA = {},
      certificatesGenerated = false,
      isOpenSSLInstalled = await checkOpenSSLInstallation();

    // Send error if openssl not installed
    if (!isOpenSSLInstalled) {
      proxyErrorCallback({
        type: 'opensslError'
      });
    }

    try {
      rootCA = await proxyCertificateService.generateRootCAForProxy(STORE_LOC);
      certMap = JSON.parse(fs.readFileSync(certMapFile, 'utf8'));
      certificatesGenerated = true;
    } catch (e) {
      pm.logger.error('Failed to ensure presence of root CA', e);
    }

    try {
      var oldThis = this;
      this.proxy = HttpProxy.createProxyServer({
        secure: false,
        ssl: {
          key: rootCA.key,
          cert: rootCA.cert
        }
      });
      this.proxy_s = HttpProxy.createProxyServer({
        secure: false,
        ssl: {
          key: rootCA.key,
          cert: rootCA.cert
        }
      });

      this.proxy.on('error', function (err, req, res) {
        if (err.code === 'ECONNREFUSED') {
          res.end(proxyConnectionRefusedErrorMessage);
        }
        else if (err.code === 'ENOTFOUND') {
          res.end(proxyDNSFailedErrorMessage);
        }
        else {
          res.end(proxyGenericErrorMessage);
        }
        pm.logger.error('electronProxy - Error proxying http', err);
      });

      this.proxy.on('close', function (e) {
        if (e) {
          pm.logger.error('electronProxy - Some error occurred while shutting down http proxy', e);
        }
        pm.logger.info('electronProxy - Shut down http proxy');
        proxyClosedCallback();
      });

      this.proxy_s.on('close', function (e) {
        pm.logger.info('electronProxy - Shut down https proxy');
        proxyClosedCallback();
      });
      this.proxyServer = http.createServer(function (req, res) {
        const start = Date.now();
        let response = {},
          timeTaken;
        var urlParts = urlParser.parse(req.url, true);
        var target1 = urlParts.protocol + '//' + urlParts.host;
        try {
          var queryData = '';
          if (req.method === 'POST' || req.method === 'PUT') {
            req.on('data', function (data) {
              queryData += data;
              if (queryData.length > 1e6) {
                queryData = '';
              }
            });
          }
          oldThis.proxy.web(req, res, { target: target1 });
          oldThis.proxy.once('proxyRes', function (proxyRes, req, res) {
            _.assign(response, _.pick(proxyRes, 'headers', 'statusCode', 'statusMessage'));
            if (!isResponseInterceptSkipped(proxyRes))
            accumulateResponse(res, proxyRes, function (responseBody) {
              response['body'] = responseBody;
              timeTaken = Date.now() - start;
              capturedRequestCallback(req.url, req.method, req.headers, queryData, response, timeTaken);
              return responseBody;
            });
          });
        }
        catch (e) {
          pm.logger.error('electronProxy - Error proxying', e);
        }
      });

      this.proxyServer.on('error', (e) => {
        this.proxyServer.close();
        if (e.code === 'EADDRINUSE') {
          proxyStartErrorCallback({
            message: 'One of the ports the proxy server requires ' +
              '(' + port + ') is already in use. Please choose a different port ' +
              'before restarting the proxy server.',
            error: e
          });
        }
        pm.logger.error('Error in proxy server', e);
      });

      try {
        pm.logger.info('Attempting to start proxy server on port: ' + port + '...');
        this.proxyServer.listen(port);
        if (this.proxyServer.listening) {
          // proxy server is ready to listen
          proxyStartSuccessCallback();
        }
      }
      catch (e) {
        pm.logger.error('electronProxy - Error in starting proxy', e);
      }

      // Connect event is the first event shared accross hostnames where we get certificate
      isOpenSSLInstalled && certificatesGenerated && this.proxyServer.addListener(
        'connect',
        function (request, socketRequest, bodyHead) {
          var url = request.url,
            httpVersion = request.httpVersion,
            hostport = getHostPortFromString(url, 443),
            hostname = hostport[0],
            options = {
              port: hostport[1],
              host: hostport[0],
              servername: hostport[0],
              ...rootCA
            },
            socket;

          oldThis.lastHttpsUrl = url;

          socket = tls.connect(options, async () => {
            var certificate = socket.getPeerCertificate(),
              commonName = _.get(certificate, 'subject.CN'),
              san = _.get(certificate, 'subjectaltname'),
              sanList = san && san.split(','), // check for existence of san
              temp, freePort, i;


            if (sanList) { // check for sanList
              // Format Subject Alternative Names for CSR creation
              for (i = 0; i < sanList.length; i++) {
                if (process.platform === 'linux') {
                  temp = 'DNS.' + (i + 1) + '=';
                  sanList[i] = sanList[i].replace(/[' ']?DNS:/, temp);
                }
                else {
                  temp = '';
                  sanList[i] = {
                    type: 2,
                    value: sanList[i].replace(/[' ']?DNS:/, temp)
                  };
                }
              }
            }


            if (cnPortCache.has(hostname)) {
              // This means server is already running so directly proxy data
              freePort = cnPortCache.get(hostname).port;
              proxyData(socketRequest, bodyHead, httpVersion, freePort);
            }

            else if (certMap[hostname]) {
              try {
                // certificate already exists in the certificates folder
                let filePath = certMap[hostname],
                  keys = {};

                // Read certificate and key file
                keys = await proxyCertificateService.getCertificateAndKey(filePath.certFile, filePath.keyFile);

                // find a free port to start a new HTTPS server.
                getPort().then((freePort) => {
                  const proxyHttpsServer = createHttpsServer(freePort, keys, capturedRequestCallback);
                  cnPortCache.set(hostname, {
                    server: proxyHttpsServer,
                    port: freePort
                  });
                  proxyData(socketRequest, bodyHead, httpVersion, freePort);
                });
              } catch (e) {
                pm.logger.error('Error occurred in proxying requests', e);
              }
            }

            else {
              const csrOptions = {
                country: proxyConstants.COUNTRY,
                state: proxyConstants.STATE,
                locality: proxyConstants.LOCALITY,
                organization: proxyConstants.ORG,
                organizationUnit: proxyConstants.ORGUNIT,
                commonName: commonName,
                emailAddress: proxyConstants.EMAIL,
                altNames: sanList
              };
              const attr = [
                {
                  name: 'commonName',
                  value: commonName
                },
                {
                  name: 'countryName',
                  value: proxyConstants.COUNTRY
                },
                {
                  shortName: 'O',
                  value: proxyConstants.ORG
                },
                {
                  shortName: 'OU',
                  value: proxyConstants.ORGUNIT
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
                  clientCertificate: true,
                  clientCertificateCN: commonName,
                  keySize: 2048,
                  keyPair: {
                    privateKey: rootCA.key,
                    publicKey: rootCA.cert
                  },
                  algorithm: proxyConstants.HASH,
                  days: proxyConstants.DAYSTOEXPIRY,
                  extensions: [
                    {
                      name: 'keyUsage',
                      digitalSignature: true,
                      nonRepudiation: true,
                      keyEncipherment: true
                    },
                    {
                      name: 'basicConstraints',
                      cA: false
                    },
                    {
                      name: 'subjectAltName',
                      altNames: sanList
                    }]
                  };
              waterfall([
                (callback) => {
                  // create a new certificate
                  generateCert(attr, options, csrOptions, (err, keys) => {
                      var hash = crypto.createHash('md5').update(hostname).digest('hex'),
                        certFileName = path.resolve(CERT_DIR, (hash + '.crt')),
                        keyFileName = path.resolve(CERT_DIR, (hash + '.key'));
                      certMap[hostname] = { keyFile: keyFileName, certFile: certFileName };

                      // write certificate, key and certMap
                      parallel([
                          (callback) => {
                            fs.writeFile(certFileName, keys.certificate, 'utf8', (err) => {
                              if (err) {
                                return callback(err);
                              }
                              callback();
                            });
                          },
                          (callback) => {
                            fs.writeFile(keyFileName, keys.clientKey, 'utf8', (err) => {
                              if (err) {
                                return callback(err);
                              }
                              callback();
                            });
                          },
                          (callback) => {
                            fs.writeFile(certMapFile, JSON.stringify(certMap, true, 2), (err) => {
                              if (err) {
                                return callback(err);
                              }
                              callback();
                            });
                          }
                      ]);
                      callback(err, keys);
                  });
                },
                (keys, callback) => {
                  // find a free port
                  getPort().then((freePort) => {
                    callback(null, keys, freePort);
                  }, (err) => {
                    callback(err, keys, null);
                  });
                },
                (keys, freePort, callback) => {
                  // start a new server for the common name and proxy data
                  let certificate = {
                    cert: keys.certificate,
                    key: keys.clientKey
                  };
                  const proxyHttpsServer = createHttpsServer(freePort, certificate, capturedRequestCallback);
                  cnPortCache.set(commonName, {
                    server: proxyHttpsServer,
                    port: freePort
                  });
                  proxyData(socketRequest, bodyHead, httpVersion, freePort);
                  callback(null);
                }
              ], (err) => {
                if (err) {
                  proxyStartErrorCallback(err);
                }
              });
            }
          });
        }
      );
      return 0;
    }
    catch (e) {
      pm.logger.error('electronProxy - Error listening to Port: ', e);
      return -1;
    }
  },

  /**
   * Stops the proxy
   */
  stopProxy: function () {
    var proxy = this.proxy;
    var proxy_s = this.proxy_s;
    var proxyServer = this.proxyServer;
    var proxyServer_s = this.proxyServer_s;
    if (proxy) { proxy.close(); }
    if (proxy_s) { proxy_s.close(); }
    if (proxyServer) { proxyServer.close(); }
    if (proxyServer_s) { proxyServer_s.close(); }
  }
};
