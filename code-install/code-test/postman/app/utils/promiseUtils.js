module.exports = {
  /**
 * Implementation of Promise.allSettled using Promise.all
 *
 * We need this implementation because the current version of NodeJS in the app
 * is 12.0 but Promise.allSettled is only supported from 12.9 onwards
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
 *
 * @param {Array<PromiseLike>} promises - Array of PromiseLike objects
 * @return {Promise<>} - Promise that resolves when all the given promises are settled
 */
  promiseAllSettled: (promises) => {
    if (!Array.isArray(promises)) {
      throw new TypeError('Expected argument 1 to be an array');
    }

    return Promise.all(promises.map(
      (promise) => Promise.resolve(promise)
        .then((value) => ({ status: 'fulfilled', value }))
        .catch((reason) => ({ status: 'rejected', reason }))
    ));
  }
};
