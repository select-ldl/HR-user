const { app, dialog, BrowserWindow } = require('electron');
const collectionSDK = require('postman-collection');
const { URL } = require('url');
const fs = require('fs');
const util = require('util');
const uuid = require('uuid');
const lodash = require('lodash');
const request = require('postman-request');
const grpc = require('@grpc/grpc-js');
const grpcReflection = require('grpc-reflection-js');
const ProtoLoader = require('@grpc/proto-loader');
const Protobuf = require('protobufjs');
const EventChannel = require('../channels/EventChannel');
const PostmanFs = require('../utils/postmanFs');

const PROTOBUF_OPTIONS = {
  keepCase: true,
  alternateCommentMode: true,
  json: true,
  enums: String,
  bytes: String,
  longs: String
};

class GRPCClient {
  constructor (defaultWorkingDir) {
    this.defaultWorkingDir = defaultWorkingDir;
  }

  // Opens a native file selector dialog for selecting proto files.
  async openProtoSelectorDialog () {
    if (process.platform === 'darwin') {
      app.focus({ steal: true });
    }

    const { filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
      filters: [{ name: 'Protobuf', extensions: ['proto'] }],
      properties: ['openFile', 'treatPackageAsDirectory']
    });

    return filePaths[0] || null;
  }

  // Generates a Protobuf JSON descriptor from local proto files.
  async loadProtoFromFilename (filenameOrArrayOfSuch) {
    const root = new Protobuf.Root();
    const files = [];

    // Overwrite the default "fetch" function to capture all source files.
    root.fetch = (filename, callback) => {
      fs.readFile(filename, 'utf8', (err, content) => {
        if (err) {
          callback(err);
        } else {
          files.push({ filename, content });
          callback(null, content);
        }
      });
    };

    await root.load(filenameOrArrayOfSuch, PROTOBUF_OPTIONS);
    root.resolveAll();

    return {
      files,
      descriptor: root.toJSON()
    };
  }

  async loadFromServerReflection ({ url, certs, auth, workingDir }) {
    const host = url.replace(/^(grpc:)?\/\//i, '');
    validateHost(host);

    const credentials = await generateCredentials(certs, auth, workingDir || this.defaultWorkingDir);
    const client = new grpcReflection.Client(host, credentials);
    const services = await client.listServices();

    const descriptors = await Promise.all(
      services
        .filter((service) => service && service !== 'grpc.reflection.v1alpha.ServerReflection')
        .map((service) => client.fileContainingSymbol(service).then((root) => root && root.toJSON()))
      );

    const descriptor = descriptors.reduce((acc, descriptor) => {
      if (!descriptor) return acc;

      Object.assign(acc.nested, descriptor.nested);

      return acc;
    }, { nested: {} });

    return { files: [], descriptor };
  }

  // Generates a Protobuf JSON descriptor from the response of a GET request.
  async loadProtoFromURL (rootUrl) {
    const root = new Protobuf.Root();
    const files = [];
    const resolvePath = root.resolvePath;

    // Overwrite the default "resolvePath" function to understand URLs.
    root.resolvePath = (relativeTo, filename) => {
      if ((/^https?:\/\//i).test(filename)) return filename;
      const parsedUrl = new URL(relativeTo);
      parsedUrl.pathname = resolvePath(parsedUrl.pathname, filename);
      return parsedUrl.toString();
    };

    // Overwrite the default "fetch" function to make HTTP requests.
    root.fetch = (url, callback) => {
      request(url, { timeout: 5000 }, (err, response, body) => {
        if (err) {
          callback(err);
        } else if (response.statusCode >= 300) {
          callback(new Error(`GET failed with ${response.statusCode} ${response.statusMessage} (${url})`));
        } else {
          const content = String(body);
          files.push({ filename: url, content });
          callback(null, content);
        }
      });
    };

    await root.load(rootUrl, PROTOBUF_OPTIONS);
    root.resolveAll();

    return {
      files,
      descriptor: root.toJSON()
    };
  }

  // Generates a Protobuf JSON descriptor from an in-memory (string) proto file.
  async loadProtoFromString (str) {
    const root = new Protobuf.Root();
    const fakeFilename = uuid.v4();

    // Overwrite the default "fetch" function to only return our string.
    root.fetch = (filename, callback) => {
      setImmediate(() => {
        if (filename === fakeFilename) callback(null, str);
        else callback(new Error(`unresolved import: ${filename}`));
      });
    };

    try {
      await root.load(fakeFilename, PROTOBUF_OPTIONS);
      root.resolveAll();
    } catch (err) {
      // Remove mentions of the fake filename in any error messages.
      err.message = err.message.replace(new RegExp(`\\b${fakeFilename}\\b(, *)?`, 'g'), '');
      throw err;
    }

    return {
      files: [{ filename: null, content: str }],
      descriptor: root.toJSON()
    };
  }

  // Invokes an RPC on a remote gRPC server.
  async request ({ location, message, metadata = [], certs, auth, workingDir }) {
    const packageDefinition = ProtoLoader.fromJSON(location.descriptor, PROTOBUF_OPTIONS);
    const hierarchy = grpc.loadPackageDefinition(packageDefinition);
    const Service = lodash.get(hierarchy, location.service);
    const host = location.url.replace(/^(grpc:)?\/\//i, '');

    const schemeMatch = host.match(/^([a-z0-9+.-]+):\/\//i);
    if (schemeMatch) {
      throw new Error(`Invalid protocol: ${schemeMatch[1]}`);
    }
    if (!Service) {
      throw new Error(`No gRPC service: ${location.service}`);
    }

    validateHost(host);
    const client = new Service(host, await generateCredentials(certs, auth, workingDir || this.defaultWorkingDir));
    const method = client[location.method];

    if (typeof method !== 'function') {
      throw new Error(`No gRPC method: ${location.method}`);
    }

    const args = [wrapMetadata(metadata)];
    const channel = new EventChannel();

    if (!method.requestStream) {
      args.unshift(message);
    }

    if (!method.responseStream) {
      args.push((err, data) => {
        if (err) {
          logUnexpectedError(err);
        } else {
          channel.emit('responseData', { data });
        }
      });
    }

    // Invoke the RPC, and output events to the channel.
    const call = method.apply(client, args)
      .on('metadata', (metadata) => {
        metadata = unwrapMetadata(metadata);
        channel.emit('responseStarted', { metadata, host });
      })
      .on('status', ({ code, details, metadata }) => {
        metadata = unwrapMetadata(metadata);
        channel.emit('status', { codeName: grpc.status[code], code, details, metadata });
        channel.destroy();
      })
      .on('data', (data) => {
        channel.emit('responseData', { data });
      })
      .on('error', logUnexpectedError);

    // Accept events received from the channel.
    channel
      .addCleanup(() => {
        call.cancel();
      })
      .on('cancel', () => {
        call.cancel();
      })
      .on('write', (data) => {
        if (call.writable) {
          call.write(data);
          channel.emit('requestData', { data });
        }
      })
      .on('end', () => {
        if (call.writable) {
          call.end();
        }
      });

    // Emit these events asynchronously.
    setImmediate(() => {
      const normalizedMetadata = unwrapMetadata(wrapMetadata(metadata));
      channel.emit('requestStarted', { metadata: normalizedMetadata, host });

      if (!method.requestStream) {
        channel.emit('requestData', { data: message });
      }
    });

    return channel;
  }
}

/**
 * Create channel credentials based on User configuration
 * @param {Object} certPaths
 * @param {String} certPaths.ca The file path for CA certificates
 * @param {String} certPaths.client The file path for the client's certificates
 * @param {String} certPaths.key The file path for the client's private key
 * @param {Object} auth The JSON representation of collectionSDK.RequestAuth
 * @param {String} workingDir The path from which certPaths is relative to
 *
 * @returns {Promise<grpc.credentials~ChannelCredentials>}
*/
async function generateCredentials (certPaths = {}, auth, workingDir) {
  // We assume the connection to be insecure if these are not provided.
  if (!certPaths.ca && !certPaths.client && !certPaths.key) {
    if (auth) {
      throw new Error('Cannot use Authorization without a secure connection');
    }

    return grpc.credentials.createInsecure();
  }

  if (!workingDir) {
    throw new TypeError('Missing path to working directory');
  }

  const postmanFs = new PostmanFs(workingDir);
  const readFile = util.promisify(postmanFs.readFile.bind(postmanFs));
  const args = await Promise.all([
    certPaths.ca ? readFile(certPaths.ca) : null,
    certPaths.key ? readFile(certPaths.key) : null,
    certPaths.client ? readFile(certPaths.client) : null
  ]);

  const channelCredentials = grpc.credentials.createSsl(...args);
  const callCredentials = auth ? generateCallCredentials(auth) : null;

  return grpc.credentials.combineChannelCredentials(channelCredentials, callCredentials);
}

/**
 * Create call credentials based on the auth provided by the user.
 * Supported types: 'basic' | 'bearer' | 'apikey'.
 * @param {Object} auth - JSON representation of collectionSDK.RequestAuth
 *
 * @returns {grpc.credentials~CallCredentials}
 */
function generateCallCredentials (auth) {
  if (!auth.type || !auth[auth.type]) {
    throw new Error('Invalid auth format');
  }

  const sdkAuth = new collectionSDK.RequestAuth(auth).parameters();
  const authData = { key: 'Authorization' };

  switch (auth.type) {
    case 'basic':
      const username = sdkAuth.get('username');
      const password = sdkAuth.get('password');

      if (!username && !password) {
        return null;
      }

      authData.value = `Basic ${Buffer.from(`${username || ''}:${password || ''}`, 'utf8').toString('base64')}`;

      break;

    case 'bearer':
      const token = sdkAuth.get('token');

      if (!token) {
        return null;
      }

      authData.value = `Bearer ${token}`;

      break;

    case 'apikey':
      const key = sdkAuth.get('key');
      const value = sdkAuth.get('value');

      if (!key && !value) {
        return null;
      }

      authData.key = key || '';
      authData.value = value || '';

      break;

    default:
      throw new Error(`Unsupported authentication type: ${auth.type}`);
  }

  return grpc.credentials.createFromMetadataGenerator((_, callback) => {
    const authMetadata = new grpc.Metadata();

    authMetadata.add(authData.key, authData.value);
    callback(null, authMetadata);
  });
}

// Converts an array of metadata into a format usable by the grpc-js library.
function wrapMetadata (metadata) {
  const grpcMetadata = new grpc.Metadata();

  for (const { key, value } of metadata) {
    let processedValue = String(value || '');

    if (key.toLowerCase().endsWith('-bin')) {
      // TODO: provide some hint to the user that metadata ending in "-bin" should be base64
      processedValue = Buffer.from(processedValue, 'base64');
    }

    grpcMetadata.add(key, processedValue);
  }

  return grpcMetadata;
}

// Converts metadata from the grpc-js library to an array of key-value pairs.
function unwrapMetadata (grpcMetadata) {
  const metadata = [];

  for (const [key, values] of Object.entries(grpcMetadata.toJSON())) {
    for (let value of values) {
      if (Buffer.isBuffer(value)) {
        value = value.toString('base64');
      }

      metadata.push({ key, value });
    }
  }

  return metadata;
}

function validateHost (host) {
  try {
    new URL(`http://${host}`); // eslint-disable-line no-new
  } catch (_) {
    const error = new Error(`Invalid URL: grpc://${host}`);

    error.code = 'ERR_INVALID_URL';

    throw error;
  }
}

// The grpc-js library is supposed to propagate any possible error to the
// "status" event, so we don't need to handle them in other places. However,
// just in case, we'll log any errors we find that aren't related to gRPC.
function logUnexpectedError (err) {
  if (!err.metadata) {
    pm.logger.error(err);
  }
}

module.exports = GRPCClient;
