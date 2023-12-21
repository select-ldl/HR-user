const async = require('async'),
  SerializedError = require('serialised-error'),
  sid = require('shortid'),

  noOp = () => { },
  get = (obj, path, defaultValue = undefined) => {
    const travel = (regexp) =>
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => { return (res !== null && res !== undefined ? res[key] : res); }, obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
  },

  /**
   * Removes circular references from the object and returns new object.
   * Refer: https://github.com/sindresorhus/serialize-error/blob/v7.0.1/index.js#L33
   *
   * @param {Object|Array} from
   * @returns {Object}
   */
  destroyCircular = (from, _seen = new WeakSet()) => {
    const to = (Array.isArray(from) ? [] : {});

    _seen.add(from);

    for (const [key, value] of Object.entries(from)) {
      if (typeof value === 'function') {
        continue;
      }

      if (!value || typeof value !== 'object') {
        to[key] = value;
        continue;
      }

      if (!_seen.has(from[key])) {
        to[key] = destroyCircular(from[key], _seen);
        continue;
      }

      to[key] = '[Circular]';
    }

    _seen.delete(from);

    return to;
  },

  serializeError = (err) => {
    // remove circular reference from error otherwise it can cause problems when
    // the error is set as mobx observable
    return destroyCircular(new SerializedError(err));
  },

  DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;

class Node {
  constructor (schema, manager) {
    // Replacement key for the property
    this.key = schema.key;

    // The source data structure
    this.from = schema.from || false;

    // The target data structure
    this.to = schema.to || false;

    // Create the selectation object chain
    if (schema.select) {
      // Create the selecters
      this.select = Object
        .keys(schema.select)
        .map((k) => {
          // If the value is false or null then we need to skip this selection
          if (schema.select[k] === false || schema.select[k] === null) {
            return false;
          }

          let N = {};

          // If the selection is a type of object then create new node
          if (typeof schema.select[k] === 'object') {
            N = new Node(schema.select[k], manager);
          }

          N._key = k;

          return N;
        })
        .filter(Boolean);
    } else {
      this.select = false;
    }

    // Create a single node to apply on every array element
    if (schema.forEach && (typeof schema.forEach === 'object')) {
      this.forEach = new Node(schema.forEach, manager);
    } else {
      this.forEach = false;
    }

    // Create the mutations
    this.replace = schema.replace || false;

    // Create stream
    this.stream = schema.stream || false;

    // Set the streamEmitter
    this.manager = manager;

    // Array to save the ref id
    this._ref = [];
  }

  refs () {
    if (!this.select) {
      return this._ref;
    }

    return this.select.reduce((A, N) => {
      if (!(N instanceof Node)) {
        return A;
      }

      return A.concat(...N.refs());

    }, this._ref);
  }

  saveRef (id, data, options) {
    this._ref.push(id);
    this.manager.saveRef(id, { data, options });
  }

  $replace (input) {
    if (this.replace === false) {
      return input;
    }

    if (this.replace.call && typeof input === 'function') {
      return input();
    } else if (this.replace.fn && typeof input[this.replace.fn] === 'function') {
      return input[this.replace.fn]();
    } else if (this.replace.set) {
      return get(input, this.replace.set);
    } else if (Array.isArray(input) && this.replace.slice) {
      input[this.replace.slice.to] = input.slice.apply(input, this.replace.slice.from);

      return input;
    } else if (Array.isArray(this.replace.error)) {
      this.replace.error.forEach((e) => {
        input[e] = input[e] && serializeError(input[e]);
      });

      return input;
    } else if (this.replace.stream && typeof Buffer !== 'undefined') { // If Buffer is undefined we can't stream
      // Streaming will work only if the input is a string or buffer
      if (!(typeof input === 'string' || Buffer.isBuffer(input))) {
        return input;
      }

      const chunk = this.replace.chunk || DEFAULT_CHUNK_SIZE;

      // If length if the input is smaller than the chunk size then just directly send it back
      // Streaming is not required;
      if (input.length <= chunk) {
        return input;
      }

      const id = sid.generate();

      this.saveRef(id, input, { chunk });

      return { $ref: id };
    } else if (this.replace.limit) {
      // Check on the existance of the .length property
      if (!input.length || input.length <= this.replace.limit) {
        return input;
      }

      if (this.replace.drop) {
        return { ___dropped___: true };
      } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
        return { ___truncated___: true, data: input.subarray(0, this.replace.limit) };
      } else if (typeof input === 'string') {
        return { ___truncated___: true, data: input.substring(0, this.replace.limit) };
      }

      return { ___truncated___: true };
    }
    else {
      return input || this.replace.default;
    }
  }

  $select (input) {
    if (this.select === false) {
      return input;
    }

    return this.select.reduce((A, T) => {
      let parsed = input[T._key];

      // if the parsed value is a function then bind the parent input
      if (typeof parsed === 'function') {
        parsed = parsed.bind(input);
      }

      // If T is not an instance of a node then its a leaf
      if ((parsed !== undefined && parsed !== null) && T instanceof Node) {
        parsed = T.parse(parsed);
      }

      if (T.error !== false &&
        (T.key === 'error' ||
          T.key === 'err' ||
          T._key === 'error' ||
          T._key === 'err') && Boolean(parsed)) {
        parsed = serializeError(parsed);
      }

      A[T.key || T._key] = parsed;

      return A;
    }, (Array.isArray(input) && this.to !== 'object') ? [] : {});
  }

  $forEach (input) {
    // Apply forEach on arrays only
    if (!(this.forEach && Array.isArray(input))) {
      return input;
    }

    return input.reduce((A, V, K) => {
      A[K] = this.forEach.parse(V);

      return A;
    }, []);
  }

  /**
   * The argument to parse with node
   * @param {Array|Object} arg
   */
  parse (arg) {
    return [
      this.$replace.bind(this),
      this.$select.bind(this),
      this.$forEach.bind(this)
    ].reduce((acc, fn) => fn(acc), arg);
  }
}

class EventProcessor {
  constructor (schema = {}, emitter = noOp) {
    // Save the emitter to output the final data
    this.emitter = emitter;

    // This is streamer interface which can be used to send chunked data
    this.emitQueue = async.queue(({ event, data, refs }, done) => {
      // Send the chunk of data with the given id to the process otherside
      emitter(event, data, refs);

      // Defer the next transmit to the next event loop cycle
      setTimeout(done, 0);
    });

    // Now lets crate the processor map
    this.events = new Map([]);

    // Iterate over all the events process then
    Object.keys(schema).forEach((event) => {
      // Set the root node to the events
      this.events.set(event, new Set([new Node(schema[event], this)]));
    });

    this.streams = new Map([]);
  }

  saveRef (id, data) {
    // We can later chose to save the refs to a file and stream from there
    this.streams.set(id, data);
  }

  intercept (event, fn) {
    if (this.events.has(event)) {
      this.events.get(event).add(fn);
    } else {
      this.events.set(event, new Set([fn]));
    }
  }

  streamPending (refs) {
    refs.forEach((ref) => {
      const { data, options } = this.streams.get(ref),
        chunk = options.chunk || (1 * 1024 * 1024); // Default to 1MB chunks

      // We start from the start index until the chunks runout
      for (var i = 0, ii = 0; i < data.length; i += chunk, ii++) {
        const subarray = data.subarray(i, Math.min(i + chunk, data.length));

        this.emitQueue.push({
          event: '__ref__',
          data: {
            id: ref,
            meta: { index: ii, offset: i, length: subarray.length },
            data: subarray
          }
        });
      }

      this.emitQueue.push({
        event: '__ref__',
        data: {
          id: ref,
          meta: { end: true }
        }
      });

      // Finally clear refs to get garbage collected
      this.streams.delete(ref);
    });
  }

  call (event, args) {
    // Check if the events still exists in the map, else return
    if (!this.events.has(event)) { return; }

    // Iterate through each of the handlers for this event and fire them one after another
    this.events
    .get(event)
    .forEach((handler) => {
      if (handler instanceof Node) {
        // Call the parser funciton with the incoming arguments
        // Note: .refs must always be called after .parse. Refs are not generated
        // Until data is parsed;
        const data = handler.parse(args),
          refs = handler.refs();

        // 1. Emit the event first (Order is important)
        this.emitQueue.push({ event, data, refs });

        // 2. Start streaming the pending refs
        this.streamPending(refs);
      } else if (typeof handler === 'function') {
        setTimeout(() => { handler(...args); }, 0);
      }
    });
  }

  handlers () {
    return [...this.events.keys()].reduce((acc, name) => {
      acc[name] = (...args) => { this.call(name, args); };

      return acc;
    }, {});
  }
}

module.exports = EventProcessor;
