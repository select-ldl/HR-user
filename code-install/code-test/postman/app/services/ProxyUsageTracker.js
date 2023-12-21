class ProxyUsageTracker {
  constructor () {
    this.startTime = null;
    this.endTime = null;
    this.numRequestsCaptured = 0;
  }

  reset () {
    this.startTime = null;
    this.endTime = null;
    this.numRequestsCaptured = 0;
  }

  incrementRequestCaptured (num = 1) {
    this.numRequestsCaptured += num;
  }

  recordProxyStart () {
    this.startTime = Date.now();
  }
  recordProxyStop () {
    this.endTime = Date.now();
  }

  getSessionTime () {
    return this.endTime - this.startTime;
  }

  getNumRequestsCaptured () {
    return this.numRequestsCaptured;
  }
}

module.exports = ProxyUsageTracker;
