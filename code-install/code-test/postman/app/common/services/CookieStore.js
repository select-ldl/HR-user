/**
 * @fileOverview
 *
 * A Tough-Cookie compatible in-memory store backed with a persistent storage/DB.
 *
 * Can be used as:
 *  1. in-sync with persistent store    - new CookieStore()
 *  2. read-only from persistent store  - new CookieStore(true, false)
 *  3. write-only to persistent store   - new CookieStore(false, true)
 *  4. in-memory store                  - new CookieStore(false, false)
 *
 * For on-demand updating persistent store with in-memory state, use `flushToStore` method.
 *
 * @note To add support for different persistent store
 *  - Update `PersistentStore` methods
 *  - Maybe pass persistent store as an argument to `CookieStore`
 */

const { Store, Cookie, pathMatch, permuteDomain } = require('tough-cookie'),

  /**
   * typeof `string`
   *
   * @const
   * @type {string}
   */
  STRING = 'string',

  /**
   * typeof `function`
   *
   * @const
   * @type {string}
   */
  FUNCTION = 'function',

  /**
   * typeof `object`
   *
   * @const
   * @type {string}
   */
  OBJECT = 'object',

  /**
   * typeof `boolean`
   *
   * @const
   * @type {string}
   */
  BOOLEAN = 'boolean',

  /**
   * Property of `idx` to denote that cookies for that domain are cached
   *
   * @const
   * @type {Symbol}
   */
  CACHED = Symbol('cached'), // eslint-disable-line no-undef


  SESSION_COOKIE = -1,
  EXPIRED_COOKIE = 0;

/**
 * Executes a provided function once for each array element.
 *
 * @note not completely asynchronous, don't compare with async.each
 *
 * @param {Array} items - Array of items to iterate over
 * @param {Function} fn - An async function to apply to each item in items
 * @param {Function} cb - A callback which is called when all iteratee functions have finished,
 * or an error occurs
 */
function forEachWithCallback (items, fn, cb) {
  !cb && (cb = function () { /* (ಠ_ಠ) */ });

  if (!(Array.isArray(items) && fn)) { return cb(); }

  let index = 0,
    totalItems = items.length,
    next = function (err) {
      if (err || index >= totalItems) {
        return cb(err);
      }

      try {
        fn.call(items, items[index++], next);
      } catch (error) {
        return cb(error);
      }
    };

  if (!totalItems) {
    return cb();
  }

  next();
}

/**
 * DB Persistent Store.
 *
 * @class
 */
class PersistentStore {
  constructor (cookieStorageRemoteClient) {
    if (!cookieStorageRemoteClient) {
      throw new Error('PersistentStore: CookieStorageRemoteClient is missing.');
    }

    this.cookieStorageRemoteClient = cookieStorageRemoteClient;
  }

  /**
   * Convert domain string to ToughCookie compatible domain
   *  - remove `[]` from IPv6 address
   *
   * @param {String} domain - DB compatible Domain name
   * @returns {String} ToughCookie compatible domain name
   */
  static serializeDomain (domain) {
    if (typeof domain !== STRING) {
      return domain;
    }

    // workaround of following issue in tough-cookie:
    // https://github.com/salesforce/tough-cookie/issues/153
    if (domain[0] === '[' && domain[domain.length - 1] === ']') {
      domain = domain.substring(1, domain.length - 1);
    }

    return domain;
  }

  /**
   * Convert domain string to DB compatible domain.
   *  - Add missing `[]` for IPv6 address
   *
   * @param {String} domain - Domain name
   * @returns {String} DB compatible domain
   */
  static deserializeDomain (domain) {
    if (typeof domain !== STRING) {
      return domain;
    }

    if (domain.indexOf(':') !== -1) {
      domain = `[${domain}]`;
    }

    return domain;
  }

  /**
   * Convert Cookie from DB to Tough Cookie instance.
   *
   * @param {DBCookie} cookie - Cookie in db compatible structure
   * @returns {ToughCookie} Tough Cookie instance
   */
  static serialize (cookie) {
    if (!cookie) {
      return;
    }

    return Cookie.fromJSON({
      key: cookie.name,
      value: cookie.value,
      expires: cookie.expires === SESSION_COOKIE ? undefined : new Date(cookie.expires),
      domain: PersistentStore.serializeDomain(cookie.domain),
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      hostOnly: cookie.hostOnly,
      sameSite: cookie.sameSite
    });
  }

  /**
   * Convert Tough Cookie instance to DB compatible Cookie.
   *
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @returns {DBCookie} Cookie in db compatible structure
   */
  static deserialize (cookie) {
    if (!(cookie && cookie.domain)) {
      return;
    }

    let expiry = cookie.expiryTime();

    if (expiry === Infinity) { // session cookie
      expiry = SESSION_COOKIE;
    } else if (!Number.isFinite(expiry)) { // expired cookie
      // checking for -Infinity and NaN
      expiry = EXPIRED_COOKIE;
    }

    return {
      name: cookie.key,
      value: cookie.value,
      domain: PersistentStore.deserializeDomain(cookie.domain),
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      hostOnly: cookie.hostOnly,
      expires: expiry,
      sameSite: cookie.sameSite
    };
  }

  /**
   * Get all cookies matching filter.
   *
   * @param {Object} filter - Filter object
   * @property {String} filter.domain - Domain name
   * @property {String} filter.path - Path String
   * @param {getCallback} cb - Callback function
   */
  get (filter, cb) {
    if (typeof cb !== FUNCTION) {
      return;
    }

    if (typeof filter !== OBJECT) {
      filter = {};
    }

    if (filter.domain) {
      filter.domain = PersistentStore.deserializeDomain(filter.domain);
    }

    this.cookieStorageRemoteClient.get(filter).then((cookies) => {
      if (Array.isArray(cookies)) {
        return cb(null, cookies.map(PersistentStore.serialize));
      }
      return cb(null, []);
    }, (err) => {
      return cb(err, []);
    });
  }

  /**
   * Sets a cookie.
   *
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @param {setAndClearCallback} cb - Callback function
   */
  set (cookie, cb) {
    const dbCookie = PersistentStore.deserialize(cookie);

    if (!dbCookie) {
      return cb(new Error('invalid cookie'));
    }

    this.cookieStorageRemoteClient.set(dbCookie).then(() => {
      return cb();
    }, cb);
  }


  /**
   * Removed a cookie.
   *
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @param {removeCallback} cb - Callback function
   */
  remove (cookie, cb) {
    const dbCookie = PersistentStore.deserialize(cookie);

    if (!dbCookie) {
      return cb(new Error('invalid cookie'));
    }

    this.cookieStorageRemoteClient.remove(dbCookie)
      .then(() => cb && cb())
      .catch((err) => cb && cb(err));
  }

  /**
   * DB Cookie
   * @typedef {Object} DBCookie
   * @property {String} domain - The domain of the cookie;
   * @property {String} path - The path of the cookie.
   * @property {String} [name] - The name of the cookie.
   * @property {String} [value] - The value of the cookie. Defaults to empty string.
   * @property {Boolean} [hostOnly] - Whether the cookie is a host-only cookie. Defaults to `true`.
   * @property {Boolean} [secure] - Whether the cookie is marked as secure. Defaults to `false`.
   * @property {Boolean} [httpOnly] - Whether the cookie is marked as HTTP only. Defaults to 'false`.
   * @property {Double} [expires] - The expiration date of the cookie as the number of milliseconds
   * since the UNIX epoch. -1 for session cookie and 0 for expired cookie. Defaults to -1.
   * @property {String} [sameSite] - lax, none, strict or unspecified. Defaults to `unspecified`.
   */

  /**
   * Tough Cookie
   * @typedef {Object} ToughCookie
   * @property {String} [key=""] - The name or key of the cookie.
   * @property {String} [value=""] - The value of the cookie.
   * @property {Date} [expires="Infinity"] - The expiration date of the cookie.
   * @property {Number} [maxAge] - Number of seconds until the cookie expires.
   * @property {String} [domain] - The domain of the cookie.
   * @property {String} [path] - The path of the cookie.
   * @property {Boolean} [secure] - Whether the cookie is marked as secure.
   * @property {Boolean} [httpOnly] - Whether the cookie is marked as HTTP only.
   * @property {Array} [extensions] - Any unrecognized cookie attributes.
   * @property {Date} [creation] - When this cookie was constructed.
   * @property {Number} [creationIndex] - Set at construction, used to provide greater sort precision.
   */

  /**
   *
   * @callback getCallback
   * @param {Error} err - Error instance
   * @param {[ToughCookie]} cookies - List of serialized Tough Cookie instance
   */

   /**
   *
   * @callback setAndClearCallback
   * @param {Error} err - Error instance
   */

   /**
   *
   * @callback removeCallback
   * @param {Error} err - Error instance
   */
}

/**
 * Used as private property for CookieStore.
 *
 * @private
 * @type {PersistentStore}
 *
 * @todo clean-up once private fields are supported
 * Refer: https://github.com/tc39/proposal-private-fields
 */
let persistentStore;

/**
 * Tough-Cookie Store.
 * In-memory cookie store backed with persistent store.
 *
 * If `readFromDB` is set, it will query from persistent store first and cache cookies for given
 *  domain+path in-memory.
 * If `writeToDB` is set, it will real-time add/update cookies to the persistent store as well.
 * To avoid real-time updates, use `flushToStore` method to update persistent store on-demand.
 *
 * @class
 * @extends Store
 */
class CookieStore extends Store {
  /**
   * Constructs a new CookieStore.
   *
   * @param {Boolean} [readFromDB=true] - Load existing cookies from DB
   * @param {Boolean} [writeToDB=true] - Add/Update cookies in DB
   *
   * @todo pass PersistentStore as an argument
   */
  constructor (cookieStorageRemoteClient, readFromDB, writeToDB) {
    // "Sometimes you have to take a leap of faith first, the trust part comes later."
    super();

    // disable synchronous API
    this.synchronous = false;

    // in-memory cache
    this.idx = {};

    // in-memory cache to track deleted cookies when writeToDB is `false`
    this.deletedCookies = {};

    this.readFromDB = typeof readFromDB === BOOLEAN ? readFromDB : true;
    this.writeToDB = typeof writeToDB === BOOLEAN ? writeToDB : true;

    // @note this should be private property to avoid exposing persistent store's APIs
    // as a workaround using this global variable assignment approach.
    persistentStore = new PersistentStore(cookieStorageRemoteClient);
  }

  /**
   * Cache all the cookies with given filer in-memory.
   * - cache all the cookies for domain by setting `path` to null.
   * - cache all the cookies in session by setting both `domain` and `path` to null.
   *
   * It will not query from session:
   *  - if given domain+path combination is cached
   *  - if `readFromDB` is false
   *
   * @private
   * @param {String} domain - Domain name
   * @param {String=} path - Path string
   * @param {Function} cb - Callback function
   */
  _cache (domain, path, cb) {
    if (typeof path === FUNCTION && !cb) {
      cb = path;
      path = null;
    }

    if (typeof cb !== FUNCTION) {
      return;
    }

    // bail out if all the domains are cached
    if (this.idx[CACHED]) {
      return cb(null);
    }

    // bail out if the domain is cached
    if (this.idx[domain] && this.idx[domain][CACHED]) {
      return cb(null);
    }

    // bail out if the path is cached
    if (this.idx[domain] && this.idx[domain][path]) {
      return cb(null);
    }

    // domain is required if path is set
    if (!domain && path) {
      return cb(new Error('invalid domain'));
    }

    if (domain && typeof domain !== STRING) {
      return cb(new Error('invalid domain'));
    }

    if (domain && path && typeof path !== STRING) {
      return cb(new Error('invalid path'));
    }

    if (domain && !this.idx[domain]) {
      this.idx[domain] = {};
    }

    // set local state to mark all domains as cached
    if (!domain) {
      this.idx[CACHED] = true;
    }

    // set local state to mark this domain as cached
    if (domain && !path) {
      this.idx[domain][CACHED] = true;
    }

    // set local state to mark this domain+path as cached
    if (domain && path && !this.idx[domain][path]) {
      this.idx[domain][path] = {};
    }

    // bail out if readFromDB is disabled
    if (!this.readFromDB) {
      return cb(null);
    }

    // query persistent store with given domain + path filter
    persistentStore.get({ domain, path }, (err, cookies) => {
      if (err || !Array.isArray(cookies)) {
        return cb(err);
      }

      // traverse all the cookies and cache in-memory
      cookies.forEach((cookie) => {
        // set local state
        if (!this.idx[cookie.domain]) {
          this.idx[cookie.domain] = {};
        }
        if (!this.idx[cookie.domain][cookie.path]) {
          this.idx[cookie.domain][cookie.path] = {};
        }

        // finally, cache the cookie
        // @note Need to check if the cookie is already present to ensure that
        // we don't overwrite it with stale info from the persistent store.
        // This situation can happen because when we have cached a path before
        // and we try to cache all paths for a domain, we read cookies for
        // this cached path again from the persistent store.
        if (!this.idx[cookie.domain][cookie.path][cookie.key]) {
          this.idx[cookie.domain][cookie.path][cookie.key] = cookie;
        }
      });

      cb(null);
    });
  }

  /**
   * Add or update cookie.
   *
   * @private
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @param {Function} cb - Callback function
   */
  _update (cookie, cb) {
    typeof cb !== FUNCTION && (cb = function () {});

    const { domain, path, key } = cookie;

    // set local state
    if (domain && !this.idx[domain]) {
      this.idx[domain] = {};
    }
    if (domain && path && !this.idx[domain][path]) {
      this.idx[domain][path] = {};
    }

    // if writeToDB is disabled, just update the cache
    if (!this.writeToDB) {
      this.idx[domain][path][key] = cookie;
      return cb(null);
    }

    // set cookie in session first and cache later
    persistentStore.set(cookie, (err) => {
      if (err) {
        return cb(err);
      }
      this.idx[domain][path][key] = cookie;
      cb(null);
    });
  }

  /**
   * Unset matching cookie.
   *
   * @private
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @param {Function} cb - Callback function
   */
  _unset (cookie, cb) {
    typeof cb !== FUNCTION && (cb = function () {});

    const { domain, path, key } = cookie;

    // if writeToDB is disabled, just update the cache
    if (!this.writeToDB) {
      // Cache the cookie that needs to be deleted
      // while flushing changes to Persistent store
      this.deletedCookies[`${domain}#${path}#${key}`] = cookie;

      delete this.idx[domain][path][key];

      return cb(null);
    }

    persistentStore.remove(cookie, (err) => {
      if (err) {
        return cb(err);
      }

      delete this.idx[domain][path][key];
      cb(null);
    });
  }

  /**
   * Get all the cached cookies.
   *
   * @private
   * @returns {[ToughCookie]} - List of cookies
   */
  _getAll () {
    let cookies = [],
      idx = this.idx,
      domains = Object.keys(idx);

    domains.forEach((domain) => {
      let paths = Object.keys(idx[domain]);
      paths.forEach((path) => {
        let keys = Object.keys(idx[domain][path]);
        keys.forEach((key) => {
          if (key !== null) {
            cookies.push(idx[domain][path][key]);
          }
        });
      });
    });

    // Sort by creationIndex so deserializing retains the creation order.
    cookies.sort((a, b) => {
      return (a.creationIndex || 0) - (b.creationIndex || 0);
    });

    return cookies;
  }

  /**
   * Update session store with cached cookies.
   *
   * @note it's a custom method, not in Tough-Cookie#Store's specification
   *
   * @param {Function} cb - Callback function
   */
  flushToStore (cb) {
    // 1. Remove all the deleted cookies from the Persistent Store
    // 2. Persist all the newly added/updated cookies
    forEachWithCallback(Object.values(this.deletedCookies), (cookie, next) => {
      persistentStore.remove(cookie, next);
    }, () => {
      forEachWithCallback(this._getAll(), (cookie, next) => {
        persistentStore.set(cookie, next);
      }, cb);
    });
  }

  /**
   * Retrieve a cookie with the given domain, path and key.
   *
   * @param {String} domain - The domain of the cookie
   * @param {String} path - The path of the cookie
   * @param {String} key - The name or key of the cookie
   * @param {Function} cb - Callback function
   */
  findCookie (domain, path, key, cb) {
    this._cache(domain, path, () => {
      if (!this.idx[domain]) {
        return cb(null, undefined);
      }
      if (!this.idx[domain][path]) {
        return cb(null, undefined);
      }
      return cb(null, this.idx[domain][path][key] || null);
    });
  }

  /**
   * Retrieve all the  cookies matching the given domain and path.
   *
   * @param {String} domain - The domain of the cookie
   * @param {String} path - The path of the cookie
   * @param {Function} cb - Callback function
   */
  findCookies (domain, path, cb) {
    if (!domain) {
      return cb(null, []);
    }

    let pathMatcher,
      results = [],
      domains = permuteDomain(domain) || [domain];

    if (!path) {
      // null means "all paths"
      pathMatcher = function matchAll (domainIndex) {
        for (let curPath in domainIndex) {
          let pathIndex = domainIndex[curPath];
          for (let key in pathIndex) {
            results.push(pathIndex[key]);
          }
        }
      };
    } else {
      pathMatcher = function matchRFC (domainIndex) {
        // NOTE: we should use path-match algorithm from S5.1.4 here
        // (see : https://github.com/ChromiumWebApps/chromium/blob/b3d3b4da8bb94c1b2e061600df106d590fda3620/net/cookies/canonical_cookie.cc#L299)
        Object.keys(domainIndex).forEach(function (cookiePath) {
          if (pathMatch(path, cookiePath)) {
            let pathIndex = domainIndex[cookiePath];
            for (let key in pathIndex) {
              results.push(pathIndex[key]);
            }
          }
        });
      };
    }

    // permute all possible domain matches of a given domain
    // e.g, for www.foo.com it traverse foo.com and www.foo.com
    forEachWithCallback(domains, (domain, next) => {
      this._cache(domain, () => {
        this.idx[domain] && pathMatcher(this.idx[domain]);
        next();
      });
    }, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, results);
    });
  }

  /**
   * Adds a new cookie to the store.
   *
   * @param {ToughCookie} cookie - Tough Cookie instance
   * @param {Function} cb - Callback function
   */
  putCookie (cookie, cb) {
    const { domain, path } = cookie;

    this._cache(domain, path, () => {
      this._update(cookie, cb);
    });
  }

  /**
   * Update an existing cookie.
   *
   * @param {ToughCookie} oldCookie - Tough Cookie instance of old cookie
   * @param {ToughCookie} newCookie - Tough Cookie instance of new cookie
   * @param {Function} cb - Callback function
   */
  updateCookie (oldCookie, newCookie, cb) {
    this.putCookie(newCookie, cb);
  }

  /**
   * Remove a cookie from the store.
   *
   * @param {String} domain - The domain of the cookie
   * @param {String} path - The path of the cookie
   * @param {String} key - The name or key of the cookie
   * @param {Function} cb - Callback function
   */
  removeCookie (domain, path, key, cb) {
    this._cache(domain, path, () => {
      if (!(this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key])) {
        return cb(null);
      }

      this._unset(this.idx[domain][path][key], cb);
    });
  }

  /**
   * Removes matching cookies from the store.
   *
   * @param {String} domain - The domain of the cookie
   * @param {String} [path] - The path of the cookie
   * @param {Function} cb - Callback function
   */
  removeCookies (domain, path, cb) {
    this._cache(domain, path, () => {
      if (!this.idx[domain]) {
        return cb(null);
      }
      if (!this.idx[domain][path]) {
        return cb(null);
      }

      let cookies = [],
        keys = Object.keys(this.idx[domain][path]);

      keys.forEach((key) => {
        if (key !== null) {
          cookies.push(this.idx[domain][path][key]);
        }
      });

      forEachWithCallback(cookies, this._unset, cb);
    });
  }

  /**
   * Removes all cookies from the store.
   *
   * @param {Function} cb - Callback function
   */
  removeAllCookies (cb) {
    throw new Error('removeAllCookies is not implemented');
  }

  /**
   * Retrieve all the  cookies from the store.
   *
   * @param {Function} cb - Callback function
   */
  getAllCookies (cb) {
    // cache all cookies
    this._cache(null, () => {
      cb(null, this._getAll());
    });
  }
}

module.exports = CookieStore;
