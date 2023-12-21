const v8 = require('v8');

/**
 * Serializes the data for an IPC transfer.
 * Uses v8 serialization API where the data is cloneable. Otherwise, stringifies the data with JSON API and returns the Buffer.
 * Note: The serialization is faster when the data is cloneable. i.e., it doesn't contain functions, etc.,
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @param { any } data
 */
function serialize (data, logger) {
	try {
      return v8.serialize(data);
    } catch (err) {
      logger.error('serialization~serialize~Failed to serialize the IPC message', err);
      return Buffer.from(JSON.stringify(data));
    }
}

/**
 * Deserializes the data received from IPC transfer.
 * Tries v8 serialization API where the data is cloneable. Otherwise, parses the Buffer with JSON API and returns the data.
 * Note: The serialization is faster when the data is cloneable. i.e., it doesn't contain functions, etc.,
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @param { any } data
 * @param { Object } logger The logger object to use for logging
 */
function deserialize (buf, logger) {
	try {
      return v8.deserialize(buf.buffer);
    } catch (err) {
      logger.error('serialization~deserialize~Failed to deserialize the IPC message', err);
      return JSON.parse(buf.buffer);
    }
}

module.exports = { serialize, deserialize };
