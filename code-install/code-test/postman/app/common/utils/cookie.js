/*
  Utility functions for cookie based operations common to browser and node
*/

// Refer tough-cookie: https://github.com/salesforce/tough-cookie/blob/v4.0.0/lib/cookie.js#L100
// Dumped from ip-regex@4.0.0, with the following changes:
// * all capturing groups converted to non-capturing -- "(?:)"
// * support for IPv6 Scoped Literal ("%eth1") removed
// * lowercase hexadecimal only
const IP_REGEX_LOWERCASE = /(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-f\d]{1,4}:){7}(?:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-f\d]{1,4}|:)|(?:[a-f\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,2}|:)|(?:[a-f\d]{1,4}:){4}(?:(?::[a-f\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,3}|:)|(?:[a-f\d]{1,4}:){3}(?:(?::[a-f\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,4}|:)|(?:[a-f\d]{1,4}:){2}(?:(?::[a-f\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,5}|:)|(?:[a-f\d]{1,4}:){1}(?:(?::[a-f\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,6}|:)|(?::(?:(?::[a-f\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-f\d]{1,4}){1,7}|:)))$)/;

// @todo replace with sdk Cookie.parse
/**
 * Converts a cookie object to a string
 * @param cookieObj
 *
 * @return {string} cookie
 */
function stringifyCookieObject (cookieObj) {
  if (cookieObj === '') {
    return cookieObj;
  }
  var retVal = cookieObj.name + '=' + cookieObj.value + '; Path=' + cookieObj.path + ';';

  // Safety check before adding cookie to cookieString
  if (!cookieObj.hostOnly && cookieObj.domain) {
    var domain = cookieObj.domain;

    // Remove `[]` from IPv6 domain as workaround of following issue in tough-cookie.
    // Issue: https://github.com/salesforce/tough-cookie/issues/153
    // todo: remove this once the issue is solved in tough-cookie
    if (domain[0] === '[' && domain[domain.length - 1] === ']') {
      domain = domain.substring(1, domain.length - 1);
    }

    retVal += ' Domain=' + cookieObj.domain + ';';
  }

  if (cookieObj.secure) {
    retVal += ' Secure;';
  }
  if (cookieObj.httpOnly) {
    retVal += ' HttpOnly;';
  }

  // Do not show Expires in UI if it is a Session Cookie (expires === -1)
  if (cookieObj.expires && cookieObj.expires !== -1) {
    retVal += ' Expires=' + new Date(cookieObj.expires).toGMTString() + ';';
  }
  return retVal;
}

/**
 * returns array of cookie objects comaptible with electron
 */
function _parseCookieHeader (host, cookieString) {
  if (!cookieString) { return []; }

  var cookies = _.split(cookieString, ';');
  var numCookies = cookies.length;
  var retVal = [];
  for (var i = 0; i < numCookies; i++) {
    cookies[i] !== '' && retVal.push(_parseSingleCookieString(host, cookies[i]));
  }
  return retVal;
}

/**
* parse a single cookie string
*/
function _parseSingleCookieString (host, cookieString) {
  // if this was set using the cookie manager, it might have path and domain too
  var thisCookieParts = _.chain(cookieString)
    .trim()
    .split(';')
    .filter((part) => { return !_.isEmpty(part); })
    .value();
  var len = thisCookieParts.length;
  var retVal = { hostOnly: true };
  var i = 0;

  var thisCookie = _.chain(thisCookieParts[i]).trim().split('=').value();
  if (thisCookie.length >= 1) {
    // Added this to allow cookie values to have '='
    // Zendesk 1344
    try {
      var cName = _.trim(thisCookie[0], '\n '), // this is the part before the first =
          valueParts = thisCookie.splice(1), // parts after the first =
          cValue;

      cValue = _.chain(valueParts)
        .map((valuePart) => { return _.trim(valuePart, '\n '); })
        .join('=')
        .value();

      retVal.url = host;
      retVal.name = cName;
      retVal.value = cValue;
    }
    catch (e) {
      console.log('Error setting cookie: ' + e);
    }
  }

  // process all the other parts
  retVal.secure = false;
  retVal.httpOnly = false;

  // if max-age exists, delete any cookiePart with expiry
  if (_.find(thisCookieParts, function (cookiePart) { return (cookiePart && cookiePart.trim().indexOf('Max-Age') == 0); })) {
    _.remove(thisCookieParts, function (cookiePart) { return (cookiePart && cookiePart.trim().indexOf('Expires') == 0); });
  }

  // Adding domain by default for hostOnly cookies in which case
  // the `Domain` attribute is not present in the cookie string
  retVal.domain = host;

  i++;
  for (;i < len; i++) {
    // session: cookie.HttpOnly,
    // secure: cookie.Secure,
    // expirationDate: cookie.Expiry,
    // handle special cases for httponly/secure
    try {
      var thisParts = _.chain(thisCookieParts[i]).trim().split('=').value();
      var propName = _.chain(thisParts[0]).trim('\n ').toLower().value();
      var propVal = _.trim(thisParts[1], '\n ');

      if (propName === 'secure') {
        retVal.secure = true;

        // https should be present while setting the cookie in a secure way
        // https://github.com/flarum/core/issues/1084
        if (!_.startsWith(retVal.url, 'https://')) {
          if (!_.startsWith(retVal.url, 'http://')) {
            retVal.url = 'https://' + retVal.url;
          }

          // Reaching here means the url starts with http:// we need to replace it with https://
          else {
            retVal.url.replace('http://', 'https://');
          }
        }
        continue;
      }
      if (propName === 'httponly') {
        retVal.httpOnly = true;
        continue;
      }
      if (propName === 'path') {
        retVal.path = propVal;
        continue;
      }
      if (propName === 'expires') {
        var date = new Date(propVal);
        if (date) {
          retVal.expires = date.getTime();
        }
        continue;
      }
      if (propName === 'max-age') {
        var date = new Date();
        retVal.expires = parseInt(date.getTime() + (parseInt(propVal) * 1000));
        continue;
      }

      if (propName === 'domain') {
        let domain = propVal;

        if (domain[0] === '[' && domain[domain.length - 1] === ']') {
          domain = domain.substring(1, domain.length - 1);
        }

        // If `domain` is present in cookie string and
        // the domain is a valid domain - contains `.` & is not an IP,
        // then set hostOnly as false for that cookie
        if (_.includes(domain, '.') && !IP_REGEX_LOWERCASE.test(domain)) {
          retVal.hostOnly = false;
        }
      }

      retVal[propName] = propVal;
    }
    catch (e) {
      pm.logger.error('Could not save property for cookie: ', thisCookieParts[i]);
    }
  }

  return retVal;
}


module.exports = {
  stringifyCookieObject: stringifyCookieObject,
  _parseCookieHeader: _parseCookieHeader,
  _parseSingleCookieString: _parseSingleCookieString
};
