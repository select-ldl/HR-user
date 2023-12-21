const uuid = require('uuid');
const LinkableChannel = require('./LinkableChannel');

/*
  IPCChannel is a LinkableChannel that forwards its received events to another
  process using IPC.

  The constructor requires a "sender" and a "receiver" as its two arguments,
  respectively. If used in the renderer process, the sender and receiver should
  both be the ipcRenderer module. If used in the main process, the sender should
  be a WebContents object, and the receiver should be the ipcMain module.

  To connect an IPCChannel with another IPCChannel from a different process,
  just ensure they have the same id. You can do this by passing the first
  channel's id to the second channel's third constructor argument.
*/

const ID = Symbol();
const SEND = Symbol();
const CLEANUP_TIMEOUT = 2000;

class IPCChannel extends LinkableChannel {
  constructor (sender, receiver, id = uuid.v4()) {
    if (typeof id !== 'string') {
      throw new TypeError('Expected IPCChannel id to be a string');
    }

    super();

    let queue = [];
    let afterFlush = () => {};

    // Queue messages until a connected IPC channel is ready to receive them.
    const ipcSend = (message) => {
      if (queue) {
        queue.push(message);
      } else {
        sender.send(id, message);
      }
    };

    // Receive messages from a connected IPC channel.
    const ipcHandler = (e, { command, eventName, data }) => {
      if (command === 'emit') {
        this.emit(eventName, data);
      } else if (command === 'ready') {
        flushQueue();
      } else if (command === 'destroy') {
        this.destroy();
      } else {
        pm.logger.error(`Unrecognized IPCChannel command: ${command}`);
      }
    };

    const flushQueue = () => {
      if (queue) {
        const messagesToFlush = queue;
        queue = null;
        sender.send(id, { command: 'ready' });
        for (const message of messagesToFlush) {
          sender.send(id, message);
        }
        afterFlush();
      }
    };

    receiver.on(id, ipcHandler);
    sender.send(id, { command: 'ready' });

    this.addCleanup(function cleanup () {
      if (queue) {
        // Don't wait forever; we don't want bugs to cause memory leaks.
        const timeout = setTimeout(() => {
          pm.logger.warn('IPCChannel timed out');
          flushQueue();
        }, CLEANUP_TIMEOUT);

        // Delay the actual cleanup until we've flushed all queued messages.
        afterFlush = () => {
          clearTimeout(timeout);
          cleanup();
        };
      } else {
        receiver.removeListener(id, ipcHandler);
        sender.send(id, { command: 'destroy' });
        afterFlush = () => {};
      }
    });

    // If this is the "main" process, detect if the renderer process goes away.
    if (typeof process !== 'undefined' && process.type === 'browser') {
      const destroy = this.destroy.bind(this);
      sender.on('destroyed', destroy);
      sender.on('render-process-gone', destroy);

      this.addCleanup(() => {
        sender.removeListener('destroyed', destroy);
        sender.removeListener('render-process-gone', destroy);
      });
    }

    this[ID] = id;
    this[SEND] = ipcSend;
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

module.exports = IPCChannel;
