const uuidV4 = require('uuid').v4;

/**
 * CookieStorageRemoteClient encapsulates the details of cookie storage (db) that
 * is available on client and the communication involved to perform requests/actions
 * on the same.
 *
 * This remote client is capable to handle multiple requests at a time and ensures
 * that each request to the client gets correctly mapped to the corresponding response.
 *
 * @class CookieStorageRemoteClient
 */
class CookieStorageRemoteClient {
  constructor (emit) {
    /**
     * Cache of unresolved promises, waiting for response.
     *
     * @property {Map}
     */
    this.pendingPromises = new Map();

    this.emit = emit;
  }

  /**
   * Function to dispatch the action/query to DB and cache respective unresolved promises
   * CookieInterface~handleIncomingRequest is listening to queries/actions
   * emitted via this function call
   *
   * @private
   *
   * @param {Object} payload Action specific data
   * @property {String} payload.action Type of action ['set', 'get', 'remove]
   * @property {Object} payload.data Filter/Details related to cookie
   *
   * @param {Object} cb
   * @property {Function} cb.resolve Called on successful transaction
   * @property {Function} cb.reject Called when an error is encountered
   */
  _dispatchAction (payload, cb) {
    // Generate unique id for this particular transaction
    const actionId = uuidV4();

    if (!this.emit) {
      return cb.reject(new Error('CookieStorageRemoteClient~_dispatchAction: Emitter not found.'));
    }

    // Emit the action/query to DB
    this.emit(Object.assign({ id: actionId }, payload));

    // Cache the pending promises which will will resolved on receiving the response
    this.pendingPromises.set(actionId, cb);
  }

  /**
   * Function to handle incoming messages (response) from DB in correspondence to a previous query/action
   * and resolve pending promises
   *
   * @param {Object} message
   * @property {String} message.id - Unique id that was sent with the original query/action
   * @property {Object} message.data - response/result
   * @property {Error} message.error - Error Instance
   */
  handleResponse ({ id, data, error }) {
    if (!id) {
      pm.logger.error('CookieStorageRemoteClient(main)~handleResponse: Response Id not found');
    }

    const cb = this.pendingPromises.get(id);

    this.pendingPromises.delete(id);

    if (!cb) {
      return;
    }

    if (error) {
      return cb.reject(new Error(error));
    }

    cb.resolve(data);
  }

  /**
   * Get Cookies based on given filter from DB
   * Currently only supports filtering by `domain` and `path`
   *
   * @param {Object} filter
   * @property {String} filter.domain
   *
   * @return {Promise} Returns a promise that resolves with the fetched cookies
   */
  get (filter) {
    if (typeof filter !== 'object') {
      return Promise.reject(new Error('CookieStorageRemoteClient(main)~get: Invalid criteria'));
    }

    return new Promise((resolve, reject) => {
      this._dispatchAction({ action: 'get', data: filter }, { resolve, reject });
    });
  }

  /**
   * Set Cookie in DB
   *
   * @param {Object} details - Cookie Object with relevant properties that needs to be set
   *
   * @return {Promise} Returns a promise which resolves once the cookie is set successfully
   */
  set (details) {
    if (typeof details !== 'object') {
      return Promise.reject(new Error('CookieStorageRemoteClient(main)~set: Invalid data'));
    }

    return new Promise((resolve, reject) => {
      this._dispatchAction({ action: 'set', data: details }, { resolve, reject });
    });
  }

  /**
   * Delete a cookie from DB
   *
   * @param {Object} details - Details about cookie that needs to be deleted
   * @property {String} [domain] cookie domain
   * @property {String} [path] cookie path
   * @property {String} [name] cookie name
   *
   * @return {Promise} Returns a promise which resolves once the cookie is deleted successfully
   */
  remove (details) {
    if (typeof details !== 'object') {
      return Promise.reject(new Error('CookieStorageRemoteClient(main)~remove: Invalid criteria'));
    }

    return new Promise((resolve, reject) => {
      this._dispatchAction({ action: 'remove', data: details }, { resolve, reject });
    });
  }
}

module.exports = CookieStorageRemoteClient;
