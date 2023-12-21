/**
 * Function to deeply map keys of an object according to the given callback function
 */
function mapKeysDeep (obj, cb) {
  if (!_.isFunction(cb)) {
    return new Error('DbQueryUtils~mapKeysDeep: Given callback is not a function');
  }

  // If the given obj is not an object
  if (!_.isPlainObject(obj)) {
    return Array.isArray(obj) ? obj.map((item) => {
      return mapKeysDeep(item, cb);
    }) : obj;
  }

  // Mapping the keys of the current object
  let currentObjWithKeysMapped = _.mapKeys(obj, cb);

  // Recursively mapping the values of the current object
  return _.mapValues(currentObjWithKeysMapped, (val) => {
    if (Array.isArray(val)) {
      return val.map((item) => {
        return mapKeysDeep(item, cb);
      });
    }

    if (_.isPlainObject(val)) {
      return mapKeysDeep(val, cb);
    }

    return val;
  });
}


export { mapKeysDeep };
