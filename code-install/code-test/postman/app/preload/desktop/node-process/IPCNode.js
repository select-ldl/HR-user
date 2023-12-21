const { EventEmitter } = require('events'),
  { getIPCHandle, getResponseChannels } = require('./ipcUtils'),
  { createConnection } = require('net'),
  { NodeSocket } = require('./NodeSocket'),
  { Protocol } = require('./Protocol'),
  { CommunicationChannel } = require('./Channel');

/**
 * Creates a client connection to the provided named pipe
 * @param { String } pipe named pipe - path/handle for the IPC to connect
 */
function createClient (pipe) {
  return new Promise((resolve, reject) => {
    const socket = createConnection(pipe, () => {
      socket.removeListener('error', reject);
      resolve(socket);
    });

    socket.once('error', reject);
  });
}


/**
 * @description This IPC will provide a communication channel that allows messages to be passed back and forth between the NodeProcess and the current process
 * @class
 * @extends EventEmitter
 * @requires ChildProcess
 * @requires Logger
 */
class IPCNode extends EventEmitter {
  /**
   * @description Creates an IPC instance taking an identifier of the node process instance
   * @param { String } name The node process instance identifier
   * @param { Logger } logger logger instance to use
   */
  constructor (name, logger) {
      super();
      this._logger = logger;
      this.namedPipe = getIPCHandle(name);
      createClient(this.namedPipe)
      .then((socket) => {
        const nodeSocket = new NodeSocket(socket, this._logger);
        const protocol = new Protocol(nodeSocket, this._logger);
        this._commChannel = new CommunicationChannel(protocol, this._logger);
        this._commChannel.onMessage((data) => {
            if (data.channel === 'error') {
                return; // This is to avoid a crash
            }

            this.emit(data.channel, ...data.args);
        });
        this._commChannel.onClose(() => { this.emit('close'); });
        this.emit('connect');
      })
      .catch((err) => {
          this._logger.error('IPCNode~createClient~something wrong connecting to the IPC server', err);
      });

      this.on('error', (err) => {
          this._logger.error('IPCNode~something is wrong', err);
      });
  }

  dispose () {
    this._commChannel.dispose();
  }

  onConnect (listener) {
    this.on('connect', listener);
		return () => {
      this.removeListener('connect', listener);
    };
  }

  onClose (listener) {
    this.on('close', listener);
		return () => {
      this.removeListener('close', listener);
    };
	}

  /**
   * @description Listens to channel, when a new message arrives, listener would be called with ..args
   * @param { String } channel The type of the message to differentiate messages
   * @param { Function } listener The handler function to be run when channel type message is received
   * @returns { Function } A function to unsubscribe the listener. Calling this function would remove the listener for the channel
   */
  subscribe (channel, listener) {
      this.on(channel, listener);

      return () => {
          this.removeListener(channel, listener);
      };
  }

  /**
   * @description Listens to channel only once, when a new message arrives, listener would be called with ..args
   * @param { String } channel The type of the message to differentiate messages
   * @param { Function } listener The handler function to be run when channel type message is received
   * @returns { Void }
   */
  subscribeOnce (channel, listener) {
      let didFire = false;
      const disposeListener = this.subscribe(channel, (...args) => {
          if (didFire) {
              return disposeListener();
          }

          didFire = true;
          listener(...args);
      });
  }

  /**
   * @description Sends an asynchronous message of type channel to the main process.
   *   The arguments will be serialized with v8 serialization API based on the Structured Clone Algorithm.
   *
   * @param { String } channel The type of the message to differentiate messages
   * @param  {...any} args The arguments which will be passed on to the process
   * @returns { Number } will return false if the communication channel has closed or when the backlog of unsent messages exceeds a threshold that makes it unwise to send more. Otherwise, true.
   */
  send (channel, ...args) {
      const message = { channel, args };

      return this._commChannel.send(message);
  }

  /**
   * @description Send a message to the peer process via channel and expect a result asynchronously.
   * @param { String } channel The type of the message to differentiate messages
   * @param  { ...any } args The arguments which will be passed on to the process
   * @returns { Promise<any> } Resolve or reject with the response from the process.
   */
  invoke (channel, ...args) {
      const promise = new Promise((resolve, reject) => {

          const responseChannels = getResponseChannels(channel);
          args.push(responseChannels);

          this.subscribeOnce(responseChannels.data, resolve);
          this.subscribeOnce(responseChannels.error, reject);
      });
      this.send(channel, ...args);
      return promise;
  }
}

module.exports = { IPCNode };
