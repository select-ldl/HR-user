const async = require('async'),
  FileType = require('file-type'),
  io_v2 = require('socket.io-client-v2'),
  io_v3 = require('socket.io-client-v3'),
  HTTPAgent = require('http').Agent,
  HTTPSAgent = require('https').Agent,
  SerializedError = require('serialised-error'),

  VERSION_TO_CLIENT_MAP = {
    '2': io_v2,
    '3': io_v3,
    '4': io_v3
  };


/**
 * Serializes error object to normal object.
 *
 * @param {Error} err
 * @returns {Object}
 */
function serializeError (err, clientVersion = '3') {
  if (String(err && err.message).includes('v2.x with a v3.x')) {
    err = new Error(`It seems you are trying to reach a Socket.IO server in v2.x with a v${clientVersion}.x client. Switch the client version from request settings.`);
  }

  return new SerializedError(err);
}

/**
 * Parse HTTP request/response headers from raw chunk.
 *
 * @param {String} headerString
 * @returns {Object[]}
 */
function _parseHeaders (headerString) {
  let arr = headerString.split('\r\n'),
    headers = [];

  for (let i = 1, ii = arr.length - 2; i < ii; i++) {
    const splitIndex = arr[i].indexOf(':');

    headers.push({
      key: arr[i].slice(0, splitIndex),
      value: arr[i].slice(splitIndex + 2)
    });
  }

  return headers;
}

class SocketIOClient {
  constructor (url, listeners = [], options = {}) {
    this.clientVersion = options.version || '3';
    this.ioClient = VERSION_TO_CLIENT_MAP[options.version] || io_v3;
    this.listeners = new Set(listeners);

    this.options = {
      extraHeaders: options.headers,
      path: options.path || '/socket.io',
      timeout: options.handshakeTimeout === 0 ? 3e5 : options.handshakeTimeout
    };

    // Track whether connection was aborted (closed before getting established)
    this.isConnectionAborted = false;

    this._reconnectAttempts = -1; // -1 signify not connected
    this._retryCount = typeof options.retryCount !== 'number' ? 0 : options.retryCount;
    this._retryDelay = typeof options.retryDelay !== 'number' ? 5000 : options.retryDelay;

    setImmediate(() => {
      if (!(url && typeof url === 'string')) {
        this.onError(serializeError(new Error('Request URL is empty')));
        return this.onEnd();
      }

      switch (url.substr(0, url.indexOf('://')).toLowerCase()) {
        case 'ws':
        case 'wss':
        case 'http':
        case 'https':
          break;
        default:
          url = 'ws://' + url;
      }

      try {
        this.url = new URL(url);
        this._connect();
      } catch (error) {
        this.onError(serializeError(error));
        return this.onEnd();
      }
    });
  }

  _connect () {
    this.socket = this.ioClient(this.url.href, {
      ...this.options,
      forceNew: true,
      autoConnect: false,
      reconnection: false,
      rejectUnauthorized: false,
      transports: ['websocket'],
      agent: this._getRequestAgent()
    });

    this.socket.connect();

    this.socket.on('connect', () => {
      this.onConnect(this._request, this._response);

      this._reconnectAttempts = 0;
      this._request = this._response = null;

      this.listeners.forEach((event) => this.subscribe(event));
    });

    this.socket.on('disconnect', (reason) => {
      if (!this._reconnectAttempts) {
        this.onDisconnect(reason);
      }

      // Only try to reconnect if:
      // 1. It was not disconnected manually
      // 2. The connection was not aborted
      // 3. Connected at least once
      if (reason === 'io client disconnect' || this.isConnectionAborted || this._reconnectAttempts === -1) {
        return this.onEnd(reason);
      }

      this._reconnect(reason);
    });

    this.socket.on('connect_error', (error) => {
      // If connection was aborted, absorb the error
      if (this.isConnectionAborted) {
        return;
      }

      // Emit error only for the final reconnect attempt
      if (this._reconnectAttempts > 0 && this._reconnectAttempts < this._retryCount) {
        return this._reconnect();
      }

      this.onError(serializeError((error.description && error.description.error) || error, this.clientVersion), this._request, this._response);
      this.onEnd();
    });
  }

  _reconnect (reason) {
    this.socket.removeAllListeners();

    if (this._reconnectAttempts >= this._retryCount) {
      return this.onEnd(reason);
    }

    setTimeout(() => { this._connect(); }, this._retryDelay);
    this.onReconnect(++this._reconnectAttempts, this._retryDelay);
  }

  _getRequestAgent () {
    const self = this,
      { protocol, host } = this.url,
      AgentClass = (protocol === 'https:' || protocol === 'wss:') ? HTTPSAgent : HTTPAgent,
      agent = new AgentClass(),
      _createConnection = agent.createConnection;

    agent.createConnection = function () {
      const socket = _createConnection.apply(this, arguments);

      socket.on('lookup', () => {
        const req = socket._httpMessage;

        self._request = {
          method: req.method,
          href: `${req.agent.protocol}//${host}${req.path}`,
          headers: _parseHeaders(req._header),
          httpVersion: '1.1'
        };
      });

      socket.once('data', (chunk) => {
        const res = chunk.toString(),
          [
            _,
            httpVersion,
            statusCode,
            statusMessage
          ] = (/^HTTP\/(\d.\d) (\d{3}) (\S.+)/).exec(res);

        self._response = {
          statusCode: parseInt(statusCode),
          statusMessage: statusMessage,
          headers: _parseHeaders(res),
          httpVersion: httpVersion
        };
      });

      return socket;
    };

    return agent;
  }

  _onMessage = (event) => (...args) => {
    async.map(args, (value, next) => {
      let mimeType = 'text/plain',
        ext;

      if (Buffer.isBuffer(value)) {
        FileType.fromBuffer(value)
          .then(({ mime, ext: _ext } = {}) => {
            mimeType = mime || 'application/octet-stream';
            ext = _ext || 'bin';
          })
          .catch(() => {
            mimeType = 'application/octet-stream';
            ext = 'bin';
          })
          .finally(() => {
            next(null, { value, mimeType, ext });
          });

        return;
      }

      if (typeof value !== 'string') {
        value = JSON.stringify(value);
        mimeType = 'application/json';
      }

      next(null, { value, mimeType });
    }, (err, messages) => {
      !err && this.onMessage(messages, { event });
    });
  }

  publish (event, messages, opts = {}, cb) {
    if (!cb && typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    messages = messages.map(({ value, mimeType }) => {
      if (mimeType === 'application/octet-stream' && typeof value === 'string') {
        const buf = Buffer.from(value, 'base64');

        value = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
      }

      if (mimeType === 'application/json') {
        value = JSON.parse(value);
      }

      return value;
    });

    opts.acknowledgement && messages.push(this._onMessage(event));

    this.socket.emit(event, ...messages);
    cb && cb();
  }

  subscribe (event, cb) {
    this.socket.on(event, this._onMessage(event));

    this.listeners.add(event);
    cb && cb();
  }

  unsubscribe (event, cb) {
    this.socket.removeAllListeners(event);

    this.listeners.delete(event);
    cb && cb();
  }

  disconnect () {
    if (!this.socket.connected) {
      this.isConnectionAborted = true;
      this.onEnd();
    }

    this.listeners.clear();
    this.socket.disconnect();
  }

  close () {
    this.disconnect();
  }

  onConnect (request, response) {}

  onReconnect (attempt, timeout) {}

  onDisconnect (reason) {}

  onEnd (reason) {}

  onError (error, request, response) {}

  onMessage (message, meta) {}
}

module.exports = SocketIOClient;
