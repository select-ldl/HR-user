const LinkableChannel = require('./LinkableChannel');

/*
  An EventChannel is similar to an EventEmitter, except it doesn't emit events
  to itself; rather, it emits them to its linked "peer" channel.

  Interestingly, an EventChannel can be made to mimic the behavior of an
  EventEmitter by simply linking it to itself.
*/

const LISTENERS = Symbol();

class EventChannel extends LinkableChannel {
  constructor () {
    super();

    this[LISTENERS] = new Map();

    this.addCleanup(() => this[LISTENERS].clear());
  }

  on (eventName, listener) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Expected event name to be a string');
    }
    if (typeof listener !== 'function') {
      throw new TypeError('Expected event listener to be a function');
    }

    if (!this.isDestroyed()) {
      const listeners = this[LISTENERS].get(eventName);
      if (listeners) {
        listeners.push(listener);
      } else {
        this[LISTENERS].set(eventName, [listener]);
      }
    }

    return this;
  }

  off (eventName, listener) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Expected event name to be a string');
    }
    if (typeof listener !== 'function') {
      throw new TypeError('Expected event listener to be a function');
    }

    const listeners = this[LISTENERS].get(eventName);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        if (listeners.length === 1) {
          this[LISTENERS].delete(eventName);
        } else {
          listeners.splice(index, 1);
        }
      }
    }

    return this;
  }

  receive (eventName, data) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Expected event name to be a string');
    }
    if (this.isDestroyed()) {
      return;
    }

    const listeners = this[LISTENERS].get(eventName);
    if (listeners) {
      for (const listener of [...listeners]) {
        listener(data);
      }
    }
  }
}

module.exports = EventChannel;
