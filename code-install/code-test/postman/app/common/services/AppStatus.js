class AppStatus {
  constructor () {
    this._resolvePromise;

    // This promise gets resolved when appStatus.appBooted is called
    this._pendingPromise = new Promise((resolve, reject) => {
      this._resolvePromise = resolve;
    });
  }

  onAppBooted () {
    return this._pendingPromise;
  }

  appBooted () {
    this._resolvePromise && this._resolvePromise();
  }
}

module.exports = new AppStatus();
