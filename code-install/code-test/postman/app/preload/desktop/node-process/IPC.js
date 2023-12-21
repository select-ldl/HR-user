const { EventEmitter } = require('events'),
    fs = require('fs'),
    { createServer } = require('net'),
    { CommunicationChannel } = require('./Channel'),
    { Protocol } = require('./Protocol'),
    { NodeSocket } = require('./NodeSocket'),
    { getIPCHandle } = require('./ipcUtils');

/**
 * Create an IPC server for this process
 * @param { String } pipe the IPC named pipe handle
 */
function createIpcServer (pipe, logger) {
    /**
     * Closes the pipe and calls the callback function.
     * @param {Function} cb The callback function
     */
    function closePipe (cb) {
        fs.unlink(pipe, (err) => {
            if (err) {
                logger.error('IPC~closePipe~could not unlink pipe', err);
                return cb && cb(err);
            }
            logger.info('IPC~closePipe~IPC server is closing');
            return cb && cb(null);
        });
    }

    return new Promise((resolve, reject) => {
        /**
         * Handles the server launch errors. If the pipe is in use, closes it and retries to launch.
         * @param {Error} err The error object
         */
        function handleServerCreationError (err) {
            if (err.code === 'EADDRINUSE') {
                logger.info('IPC~handleServerCreationError~IPC server pipe in use, retrying...');

                closePipe((err) => {
                    if (err) {
                        logger.error('IPC~handleServerCreationError~could not close the IPC server', err);
                        return reject(err);
                    }
                    server.listen(pipe);
                });
            } else {
                return reject(err);
            }
        }

        const server = createServer();

        server.on('close', () => {
            closePipe();
        });
        server.on('error', handleServerCreationError);
        server.on('listening', () => {
            logger.info('IPC~Ipc server started listening');

            // Remove the listener as we do not want to reject twice from the same promise
            server.removeListener('error', handleServerCreationError);
            return resolve(server);
        });

        server.listen(pipe);
    });
}


/**
 * @description This IPC will provide a communication channel that allows messages to be passed back and forth between the NodeProcess and the Main process
 * @class
 * @extends EventEmitter
 * @requires ChildProcess
 * @requires Logger
 */
class IPC extends EventEmitter {
    /**
     * @description Creates an IPC instance taking a process/child_process instance
     * @param { Logger } logger logger instance to use
     */
    constructor (name, logger) {
        super();
        this._logger = logger;
        this.namedPipe = getIPCHandle(name);
        this._commChannels = [];

        createIpcServer(this.namedPipe, this._logger)
        .then((server) => {
            this._server = server;
            this._server.on('connection', (socket) => {
                const nodeSocket = new NodeSocket(socket, this._logger);
                const protocol = new Protocol(nodeSocket, this._logger);
                const commChannel = new CommunicationChannel(protocol, this._logger);
                commChannel.onMessage((data) => {
                    if (data.channel === 'error') {
                        return; // This is to avoid a crash
                    }
                    const event = {
                        reply: (channel, ...args) => { this._send(commChannel, channel, ...args); }
                    };
                    this.emit(data.channel, event, ...data.args);
                });
                commChannel.onClose(() => {
                    this._commChannels = this._commChannels.filter((curChannel) => {
                        return curChannel !== commChannel;
                    });
                });
            this._commChannels.push(commChannel);
            });
            this._server.on('close', () => {
                this.emit('close');
            });
            this.emit('ready');
        })
        .catch((err) => {
            this._logger.error('IPC~createIpcServer~something wrong creating the IPC server', err);
        });

        this.on('error', (err) => {
            this._logger.error('IPC~something is wrong', err);
        });
    }

    onReady (listener) {
        this.on('ready', listener);
            return () => {
          this.removeListener('ready', listener);
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
        const disposeListener = this.subscribe(channel, (event, ...args) => {
            if (didFire) {
                return disposeListener();
            }

            didFire = true;
            listener(event, ...args);
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
    _send (commChannel, channel, ...args) {
        const message = { channel, args };

        return commChannel && commChannel.send(message);
    }

    broadcast (channel, ...args) {
        for (let i = 0; i < this._commChannels.length; i++) {
            this._send(this._commChannels[i], channel, ...args);
        }
    }

    /**
     * @description Adds a handler for an invoke able IPC. This handler will be called whenever a process calls ipc.invoke(channel, ...args).
     *  If listener returns a Promise, the eventual result of the promise will be returned as a reply to the remote caller.
     *  Otherwise, the return value of the listener will be used as the value of the reply.
     *
     * @param { String } channel The type of the message to differentiate messages
     * @param { Function } listener The handler function to be run when channel type message is received
     * @returns { Function } A function to unsubscribe the listener. Calling this function would remove the listener for the channel
     */
    handle (channel, listener) {
        const wrapperListener = async (event, ...args) => {
            const responseChannels = args.pop();
            try {
                const result = await listener(event, ...args);
                event.reply(responseChannels.data, result);
            } catch (err) {
                event.reply(responseChannels.error, err);
            }
        };
        return this.subscribe(channel, wrapperListener);
    }

    /**
     * @description Similar to handle but does the same only once.
     *
     * @param { String } channel The type of the message to differentiate messages
     * @param { Function } listener The handler function to be run when channel type message is received
     * @returns { Function } A function to unsubscribe the listener. Calling this function would remove the listener for the channel
     */
    handleOnce (channel, listener) {
        const wrapperListener = async (event, ...args) => {
            const responseChannels = args.pop();
            try {
                const result = await listener(event, ...args);
                event.reply(responseChannels.data, result);
            } catch (err) {
                event.reply(responseChannels.error, err);
            }
        };
        return this.subscribeOnce(channel, wrapperListener);
    }
}

module.exports = { IPC };
