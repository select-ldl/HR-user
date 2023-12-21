const { EventEmitter } = require('events');
const { PMBuffer } = require('./PMBuffer');

let emptyBuffer = null;

/**
 * Returns an empty buffer
 */
function getEmptyBuffer () {
	if (!emptyBuffer) {
		emptyBuffer = PMBuffer.alloc(0);
	}
	return emptyBuffer;
}

class ChunkStream {

	get byteLength () {
		return this._totalLength;
	}

	constructor () {
		this._chunks = [];
		this._totalLength = 0;
	}

	acceptChunk (buff) {
		this._chunks.push(buff);
		this._totalLength += buff.byteLength;
	}

	read (byteCount) {

		if (byteCount === 0) {
			return getEmptyBuffer();
		}

		if (byteCount > this._totalLength) {
			throw new Error('Cannot read so many bytes!');
		}

		if (this._chunks[0].byteLength === byteCount) {
			// super fast path, precisely first chunk must be returned
			const result = this._chunks[0];
			this._chunks.shift();
			this._totalLength -= byteCount;
			return result;
		}

		if (this._chunks[0].byteLength > byteCount) {
			// fast path, the reading is entirely within the first chunk
			const result = this._chunks[0].slice(0, byteCount);
			this._chunks[0] = this._chunks[0].slice(byteCount);
			this._totalLength -= byteCount;
			return result;
		}

		let result = PMBuffer.alloc(byteCount);
		let resultOffset = 0;
		let chunkIndex = 0;
		while (byteCount > 0) {
			const chunk = this._chunks[chunkIndex];
			if (chunk.byteLength > byteCount) {
				// this chunk will survive
				const chunkPart = chunk.slice(0, byteCount);
				result.set(chunkPart, resultOffset);
				resultOffset += byteCount;

				this._chunks[chunkIndex] = chunk.slice(byteCount);
				this._totalLength -= byteCount;

				byteCount -= byteCount;
			} else {
				// this chunk will be entirely read
				result.set(chunk, resultOffset);
				resultOffset += chunk.byteLength;

				this._chunks.shift();
				this._totalLength -= chunk.byteLength;

				byteCount -= chunk.byteLength;
			}
		}
		return result;
	}
}


class ProtocolReader extends EventEmitter {

	constructor (socket, logger) {
		super();
    this._socket = socket;
    this._logger = logger;
		this._isDisposed = false;
		this._incomingData = new ChunkStream();
		this._socket.onData(((data) => this.acceptChunk(data)));
        this._state = {
			readLen: 4,
			readHead: true
        };
	}

	onMessage (listener) {
		this.on('message', listener);
		return {
			dispose: () => this.removeListener('message', listener)
		};
	}

	acceptChunk (data) {
		if (!data || data.byteLength === 0) {
			return;
		}

		this._incomingData.acceptChunk(data);

		while (this._incomingData.byteLength >= this._state.readLen) {

			const buff = this._incomingData.read(this._state.readLen);

			if (this._state.readHead) {
				// buff is the header

				// save new state => next time will read the body
				this._state.readHead = false;
				this._state.readLen = buff.readUInt32BE(0);
			} else {
				// buff is the body

				// save new state => next time will read the header
				this._state.readHead = true;
				this._state.readLen = 4;

				this.emit('message', PMBuffer.wrap(buff));

				if (this._isDisposed) {
					// check if an event listener lead to our disposal
					break;
				}
			}
		}
	}

	dispose () {
		this._isDisposed = true;
	}
}

class ProtocolWriter {

	constructor (socket) {
		this._isDisposed = false;
		this._socket = socket;
		this._data = [];
		this._totalLength = 0;
	}

	dispose () {
		this.flush();
		this._isDisposed = true;
	}

	flush () {
		// flush
		this._writeNow();
	}

	write (msg) {
		if (this._isDisposed) {
			// ignore: there could be left-over promises which complete and then
			// decide to write a response, etc...
			return;
		}
		const header = PMBuffer.alloc(4);
		header.writeUInt32BE(msg.byteLength, 0);
		this._writeSoon(header, msg);
	}

	_bufferAdd (head, body) {
		const wasEmpty = this._totalLength === 0;
		this._data.push(head, body);
		this._totalLength += head.byteLength + body.byteLength;
		return wasEmpty;
	}

	_bufferTake () {
		const ret = PMBuffer.concat(this._data, this._totalLength);
		this._data.length = 0;
		this._totalLength = 0;
		return ret;
	}

	_writeSoon (header, data) {
		if (this._bufferAdd(header, data)) {
			setImmediate(() => {
				this._writeNow();
			});
		}
	}

	_writeNow () {
		if (this._totalLength === 0) {
			return;
		}
		this._socket.write(this._bufferTake());
	}
}


/**
 * A message has the following format:
 * ```
 *     /--------------------\
 *     | DATA_LENGTH | DATA |
 *     \--------------------/
 * ```
 *  - DATA_LENGTH is 4 bytes (u32be) - the length in bytes of DATA
 */
class Protocol extends EventEmitter {
	constructor (socket) {
		super();
		this._socket = socket;
		this._socketWriter = new ProtocolWriter(this._socket);
		this._socketReader = new ProtocolReader(this._socket);

		this._socketReader.onMessage((msg) => {
			this.emit('message', msg);
		});

		this._socket.onClose(() => this.emit('close'));
  }

  dispose () {
    this._socketReader.dispose();
    this._socketWriter.dispose();
    this._socket.dispose();
  }

	onMessage (listener) {
		this.on('message', listener);
		return {
			dispose: () => this.removeListener('message', listener)
		};
	}

	getSocket () {
		return this._socket;
	}

	send (buffer) {
		this._socketWriter.write(buffer);
	}

	onClose (listener) {
		this.on('close', listener);
		return {
			dispose: () => this.removeListener('close', listener)
		};
	}
}

module.exports = { Protocol };
