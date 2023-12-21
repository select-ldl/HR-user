const uuid = require('uuid');
const LinkableChannel = require('./LinkableChannel');

/*
  WebSocketChannel is a LinkableChannel that forwards its received events between
  server/client using a WebSocket connection (specifically Socket.IO).

  The constructor requires a "socket" instance as its first argument.
  If used in the renderer process, the instance of should be of client's socket.
  If used in the main process, the instance of should be corresponding server's socket.

  To connect an WebSocketChannel with another WebSocketChannel
  just ensure they have the same id. You can do this by passing the first
  channel's id to the second channel's second constructor argument.
*/

const ID = Symbol();
const SEND = Symbol();
const CLEANUP_TIMEOUT = 2000;

class WebSocketChannel extends LinkableChannel {
  constructor (socket, id = uuid.v4()) {
    if (typeof id !== 'string') {
      throw new TypeError('Expected WebSocketChannel id to be a string');
    }

    super();

    let queue = [];
    let afterFlush = () => {};

    // Queue messages until a peer connected channel is ready to receive them.
    const wsSend = (message) => {
      if (queue) {
        queue.push(message);
      } else {
        socket.emit(id, message);
      }
    };

    // Receive messages from a connected peer channel.
    const wsHandler = ({ command, eventName, data }) => {
      if (command === 'emit') {
        this.emit(eventName, data);
      } else if (command === 'ready') {
        flushQueue();
      } else if (command === 'destroy') {
        this.destroy();
      } else {
        pm.logger.error(`Unrecognized WebSocketChannel command: ${command}`);
      }
    };

    const flushQueue = () => {
      if (queue) {
        const messagesToFlush = queue;
        queue = null;
        socket.emit(id, { command: 'ready' });
        for (const message of messagesToFlush) {
          socket.emit(id, message);
        }
        afterFlush();
      }
    };

    socket.on(id, wsHandler);
    socket.emit(id, { command: 'ready' });

    this.addCleanup(function cleanup () {
      if (queue) {
        // Don't wait forever; we don't want bugs to cause memory leaks.
        const timeout = setTimeout(() => {
          pm.logger.warn('WSChannel timed out');
          flushQueue();
        }, CLEANUP_TIMEOUT);

        // Delay the actual cleanup until we've flushed all queued messages.
        afterFlush = () => {
          clearTimeout(timeout);
          cleanup();
        };
      } else {
        socket.removeListener(id, wsHandler);
        socket.emit(id, { command: 'destroy' });
        afterFlush = () => {};
      }
    });

    // If this is the "main" process (ws server), detect if the renderer process (client) goes away.
    if (typeof process !== 'undefined' && process.type === 'browser') {
      const destroy = this.destroy.bind(this);
      socket.on('disconnect', destroy);

      this.addCleanup(() => { socket.removeListener('disconnect', destroy); });
    }

    this[ID] = id;
    this[SEND] = wsSend;
  }

  receive (eventName, data) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Expected event name to be a string');
    }
    if (this.isDestroyed()) {
      return;
    }

    this[SEND]({ command: 'emit', eventName, data });
  }

  getId () {
    return this[ID];
  }
}

module.exports = WebSocketChannel;
