const { PMBuffer } = require('./PMBuffer');

class NodeSocket {

	constructor (socket, logger) {
    this.socket = socket;
    this._logger = logger;
	}

	dispose () {
    try {
      this.socket.destroy();
    } catch (err) {
      this._logger.error('NodeSocket~dispose~Could not destroy socket', err);
    }
	}

	onData (_listener) {
		const listener = (buff) => _listener(PMBuffer.wrap(buff));
		this.socket.on('data', listener);
		return {
			dispose: () => this.socket.off('data', listener)
		};
	}

	onClose (listener) {
		this.socket.on('close', listener);
		return {
			dispose: () => this.socket.off('close', listener)
		};
	}

	write (buffer) {
		// return early if socket has been destroyed in the meantime
		if (this.socket.destroyed) {
			return;
		}

		// we ignore the returned value from `write` because we would have to cached the data
		// anyways and nodejs is already doing that for us:
		// > https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
		// > However, the false return value is only advisory and the writable stream will unconditionally
		// > accept and buffer chunk even if it has not been allowed to drain.
		try {
			this.socket.write(buffer.buffer);
		} catch (err) {
			if (err.code === 'EPIPE') {
				// An EPIPE exception at the wrong time can lead to a renderer process crash
				// so ignore the error since the socket will fire the close event soon anyways:
				// > https://nodejs.org/api/errors.html#errors_common_system_errors
				// > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
				// > process to read the data. Commonly encountered at the net and http layers,
				// > indicative that the remote side of the stream being written to has been closed.
				return;
			}
			this._logger.error('NodeSocket~write~Failedto write data', err);
		}
	}

	end () {
    try {
      this.socket.end();
    } catch (err) {
      this._logger.error('NodeSocket~end~Could not end socket', err);
    }
	}
}

module.exports = { NodeSocket };
