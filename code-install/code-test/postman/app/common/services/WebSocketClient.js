// @todo move this file to appropriate location

const { URL } = require('url'),
  WebSocket = require('postman-ws'),
  FileType = require('file-type'),
  SerializedError = require('serialised-error');

/**
 * Helper function to detect whether a give value is JSON or not
 *
 * @note This function only determines whether a given value is
 * JSON on best-effort basis and thus might result in false positives
 *
 * @param {String} value
 * @returns {Boolean}
 */
function isJSON (value) {
  value = value.trim();

  switch (value.charAt(0) + value.charAt(value.length - 1)) {
    case '[]':
    case '{}':
    case '0}': // socket.io open prefix
    case '4]': // socket.io message prefix
      return true;
    default:
      return false;
  }
}

/** */
function serializeError (err) {
  return new SerializedError(err);
}

class WebSocketClient {
  constructor (url, protocols = [], options = {}) {
    if (typeof options.retryCount !== 'number') {
      options.retryCount = 0;
    }

    if (typeof options.retryDelay !== 'number') {
      options.retryDelay = 5000;
    }

    this.protocols = protocols;
    this.options = { followRedirects: true, rejectUnauthorized: false, ...options };
    this.reconnectAttempts = -1; // -1 signify not connected

    // Track whether connection was aborted (closed before getting established)
    this.isConnectionAborted = false;

    // @todo throw synchronous error
    setImmediate(() => {
      if (!(url && typeof url === 'string')) {
        this.onError(serializeError(new Error('Request URL is empty')));
        return this.onEnd();
      }

      if (!(url.startsWith('ws://') || url.startsWith('wss://'))) {
        url = 'ws://' + url;
      }

      try {
        // Create URL object
        this.url = new URL(url);

        // Open connection
        this._open();
      } catch (error) {
        this.onError(serializeError(error));
        return this.onEnd();
      }
    });
  }

  _open () {
    const ws = this.ws = new WebSocket(this.url, this.protocols, this.options);

    ws.on('upgrade', () => {
      if (ws._debug) {
        const request = ws._debug[0].request,
          response = ws._debug[ws._debug.length - 1].response;

        return this.onUpgrade(request, response);
      }

      this.onUpgrade();
    });

    ws.on('open', () => {
      this.reconnectAttempts = 0;

      if (!ws._debug) {
        return this.onOpen(ws);
      }

      const request = ws._debug[0].request,
        response = ws._debug[ws._debug.length - 1].response;

      ws._debug = null;

      this.onOpen(ws, request, response);
    });

    ws.on('close', (code, reason) => {
      if (!this.reconnectAttempts) {
        this.onClose(code, reason);
      }

      // Only try to reconnect if:
      // 1. It was not a Normal Closure
      // 2. The connection was not aborted
      // 3. Connected at least once
      if (code === 1000 || this.isConnectionAborted || this.reconnectAttempts === -1) {
          return this.onEnd(code, reason);
      }

      this._reconnect(code, reason);
    });

    ws.on('message', (message) => {
      const meta = {
        mimeType: 'text/plain',
        size: 0,
        timestamp: Date.now()
      };

      if (typeof message === 'string') {
        meta.size = Buffer.byteLength(message);
        isJSON(message) && (meta.mimeType = 'application/json');

        return this.onMessage(message, meta);
      }

      meta.size = message.length;

      FileType.fromBuffer(message)
        .then(({ mime, ext } = {}) => {
          meta.mimeType = mime || 'application/octet-stream';
          meta.ext = ext || 'bin';
        })
        .catch(() => {
          meta.mimeType = 'application/octet-stream';
          meta.ext = 'bin';
        })
        .finally(() => {
          this.onMessage(message, meta);
        });
    });

    ws.on('error', (error) => {
      // If connection was aborted, absorb the error
      if (this.isConnectionAborted) {
        return;
      }

      // Emit error only for the final reconnect attempt
      if (this.reconnectAttempts > 0 && this.reconnectAttempts < this.options.retryCount) {
        return;
      }

      if (ws._debug) {
        const request = ws._debug[0].request,
          response = ws._debug[ws._debug.length - 1].response;

        ws._debug = null;

        return this.onError(serializeError(error), request, response);
      }

      this.onError(serializeError(error));
    });
  }

  _reconnect (code, reason) {
    this.ws && this.ws.removeAllListeners();

    if (this.reconnectAttempts >= this.options.retryCount) {
      return this.onEnd(code, reason);
    }

    setTimeout(() => { this._open(); }, this.options.retryDelay);
    this.onReconnect(++this.reconnectAttempts, this.options.retryDelay);
  }

  send (data, { messageType, ...options } = {}, callback) {
    if (messageType === 'binary' && typeof data === 'string') {
      const buf = Buffer.from(data, 'base64');
      data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }

    this.ws.send(data, options, callback);
  }

  close (code, reason) {
    // Mark connection as aborted if it's closed in non-open state
    // Refer: https://github.com/websockets/ws/blob/7.4.4/lib/websocket.js#L26
    if (this.ws.readyState !== 1) {
      this.isConnectionAborted = true;
    }

    this.ws.close(code, reason);
  }

  onClose (code, reason) {}

  onEnd () {}

  onError (error) {}

  onMessage (message, isBinary) {}

  onOpen () {}

  onReconnect (attempt, timeout) {}

  onUpgrade (response) {}
}

module.exports = WebSocketClient;
