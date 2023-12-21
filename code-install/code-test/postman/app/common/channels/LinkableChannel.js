/*
  LinkableChannel is a base class for implementing pluggable, bidirectional
  event channels. A LinkableChannel can be linked with another LinkableChannel,
  making the two channels "peers" of each other. When one channel emits an
  event, its peer channel receives the event. Each subclass can have its own
  logic for what it means to "receive" an event. For example, one channel might
  represent the end of an IPC connection, while another channel might be a
  simple event emitter.

  Subclasses of LinkableChannel must implement the receive() method, which takes
  the arguments (string, any), where the first argument is an event name and the
  second argument is arbitrary event data.

  LinkableChannels can register cleanup functions, which are called when the
  channel is destroyed. This allows the channel to clean up any resources being
  used, peventing memory leaks. Every user of a LinkableChannel should call
  destroy() when the channel is no longer needed, to trigger cleanup.
*/

const PEER = Symbol();
const DISPOSERS = Symbol();
const IS_DESTROYED = Symbol();

class LinkableChannel {
  constructor () {
    this[PEER] = null;
    this[DISPOSERS] = [];
    this[IS_DESTROYED] = false;
  }

  emit (eventName, data) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Expected event name to be a string');
    }

    if (!this[IS_DESTROYED] && this[PEER]) {
      this[PEER].receive(eventName, data);
    }

    return this;
  }

  receive () {
    throw new TypeError('LinkableChannel receive() not implemented');
  }

  link (peerChannel) {
    if (!(peerChannel instanceof LinkableChannel)) {
      throw new TypeError('Expected link target to be a LinkableChannel');
    }
    if (this[PEER] !== null || peerChannel[PEER] !== null) {
      throw new TypeError('A channel link already exists');
    }

    peerChannel[PEER] = this;
    this[PEER] = peerChannel;

    if (this[IS_DESTROYED] || peerChannel[IS_DESTROYED]) {
      destroyChannel(this);
      destroyChannel(peerChannel);
    }

    return this;
  }

  destroy () {
    destroyChannel(this);
    if (this[PEER]) {
      destroyChannel(this[PEER]);
    }

    return this;
  }

  isDestroyed () {
    return this[IS_DESTROYED];
  }

  addCleanup (disposer) {
    if (typeof disposer !== 'function') {
      throw new TypeError('Expected disposer to be a function');
    }

    if (this[IS_DESTROYED]) {
      setTimeout(disposer.bind(this), 0);
    } else {
      this[DISPOSERS].push(disposer);
    }

    return this;
  }
}

function destroyChannel (channel) {
  for (const disposer of channel[DISPOSERS].splice(0)) {
    setTimeout(disposer.bind(channel), 0);
  }

  channel[IS_DESTROYED] = true;
}

module.exports = LinkableChannel;
