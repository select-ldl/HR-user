const { EventEmitter } = require('events');
const { PMBuffer } = require('./PMBuffer');
const { serialize, deserialize } = require('./serialization');

class CommunicationChannel extends EventEmitter {
    constructor (protocol, logger) {
		super();
        this.protocol = protocol;
        this._logger = logger;
        this.protocol.onMessage((msg) => this.onBuffer(msg));
        this.protocol.onClose(() => this.emit('close'));
	}

	dispose () {
		this.protocol.dispose();
	}

  send (message) {
		const buffer = PMBuffer.wrap(serialize(message, this._logger));
		return this.sendBuffer(buffer);
	}

	onMessage (listener) {
		this.on('message', listener);
		return {
			dispose: () => this.removeListener('message', listener)
		};
	}

	sendBuffer (message) {
		try {
			this.protocol.send(message);
			return message.byteLength;
		} catch (err) {
			// noop
			return 0;
		}
	}

	onBuffer (message) {
		const data = deserialize(message, this._logger);
		this.emit('message', data);
  }

  onClose (listener) {
		this.on('close', listener);
		return {
			dispose: () => this.removeListener('close', listener)
		};
	}
}

module.exports = { CommunicationChannel };
