/**
 * Writes a number as unsigned 32 bit big endian integer
 * @param { Buffer } destination The buffer where to write the value
 * @param { Number } value the value to be written
 * @param { Number } offset offset of the buffer from where to start writing
 */
function writeUInt32BE (destination, value, offset) {
	destination[offset + 3] = value;
	value = value >>> 8;
	destination[offset + 2] = value;
	value = value >>> 8;
	destination[offset + 1] = value;
	value = value >>> 8;
	destination[offset] = value;
}

/**
 * Reads an unsigned 32 bit big endian number from buffer
 * @param { Buffer } source The buffer from where to read number
 * @param { Number } offset offset of the buffer from where to start reading
 */
function readUInt32BE (source, offset) {
	return (
		source[offset] * 2 ** 24
		+ source[offset + 1] * 2 ** 16
		+ source[offset + 2] * 2 ** 8
		+ source[offset + 3]
	);
}

class PMBuffer {

	static alloc (byteLength) {
		return new PMBuffer(Buffer.allocUnsafe(byteLength));
	}

	static wrap (actual) {
		if (!(Buffer.isBuffer(actual))) {
			// https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
			// Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
			actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
		}
		return new PMBuffer(actual);
	}

	static concat (buffers, totalLength) {
		if (typeof totalLength === 'undefined') {
			totalLength = 0;
			for (let i = 0, len = buffers.length; i < len; i++) {
				totalLength += buffers[i].byteLength;
			}
		}

		const ret = PMBuffer.alloc(totalLength);
		let offset = 0;
		for (let i = 0, len = buffers.length; i < len; i++) {
			const element = buffers[i];
			ret.set(element, offset);
			offset += element.byteLength;
		}

		return ret;
	}


	constructor (buffer) {
		this.buffer = buffer;
		this.byteLength = this.buffer.byteLength;
	}

	slice (start = 0, end) {
		// IMPORTANT: use subarray instead of slice because TypedArray#slice
		// creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
		// ensures the same, performant, behaviour.
		return new PMBuffer(this.buffer.subarray(start, end));
	}

	set (array, offset) {
		if (array instanceof PMBuffer) {
			this.buffer.set(array.buffer, offset);
		} else {
			this.buffer.set(array, offset);
		}
	}

	readUInt32BE (offset) {
		return readUInt32BE(this.buffer, offset);
	}

	writeUInt32BE (value, offset) {
		writeUInt32BE(this.buffer, value, offset);
	}
}

module.exports = { PMBuffer };
