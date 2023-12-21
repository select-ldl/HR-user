const zlib = require('zlib'), // Included in Nodejs module
  concatStream = require('concat-stream'),
  BufferHelper = require('bufferhelper');

// Use this to queue tasks instead of queueMicrotask
// Reason: The event loop keeps calling microtasks until there are none left in the queue
// This could hamper the next tasks to be run as unzips are resource heavy tasks
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide#microtasks
let queueTask = (fn) => {
  setTimeout(() => fn && fn());
};

/**
 * Taps, accumulates and extracts the response from the readable response stream
 * Currently supports
 *  - gzip
 *  - deflate
 *
 * @param {Response} res The http response
 * @param {Object} proxyRes The http header content-encoding: gzip/deflate
 * @param {Function} callback Calls back with the final extracted response
 */
module.exports = function accumulateResponse (res, proxyRes, callback) {
  if (!callback || typeof callback !== 'function') {
    pm.logger.info('ResponseAccumulator~Cannot callback with response. Aborting proxy response accumulation');
    return;
  }
  let contentEncoding = proxyRes;
  if (proxyRes && proxyRes.headers) {
    contentEncoding = proxyRes.headers['content-encoding'];
  }

  let unzip;

  // Only handle gzip/deflate/undefined content-encoding
  switch (contentEncoding) {
    case 'gzip':
      unzip = zlib.Gunzip();
      break;
    case 'deflate':
      unzip = zlib.Inflate();
      break;
    case 'br':
      unzip = zlib.BrotliDecompress && zlib.BrotliDecompress();
      break;
  }

  // The response write and end methods can be called
  // in-parallel to accumulating response
  let _write = res.write;
  let _end = res.end;

  if (unzip) {
    unzip.on('error', function (e) {
      pm.logger.info('ResponseAccumulator~Response unzip error:', e);
      _end.call(res);
    });
    _handleCompressed(res, _write, _end, unzip, callback);
  } else if (!contentEncoding) {
    _handleUncompressed(res, _write, _end, callback);
  } else {
    pm.logger.info('ResponseAccumulator~Not supported content-encoding:', contentEncoding);
  }
};

/**
 * handle compressed
 */
function _handleCompressed (res, _write, _end, unzip, callback) {
  // The rewrite response method is replaced by unzip stream
  // Write to the response method in parallel
  res.write = (data) => {
    _write.call(res, data);

    // Queue task - leverage JS event queue
    queueTask(() => { unzip.write(data); });
  };

  res.end = () => {
    _end.call(res);

    // Queue task - leverage JS event queue
    queueTask(() => unzip.end());
  };

  // Concat the unzip stream
  let concatWrite = concatStream((data) => {
    // Queue task - leverage JS event queue
    queueTask(() => {
      let body;
      try {
        body = JSON.parse(data.toString());
      } catch (e) {
        body = data.toString();
      }

      // Callback with tapped response
      callback(body);
    });
  });

  unzip.pipe(concatWrite);
}

/**
 * handle Uncompressed
 */
function _handleUncompressed (res, _write, _end, callback) {
  let buffer = new BufferHelper();

  // Rewrite response method and get the content
  // Write to the response method in parallel
  res.write = (data) => {
    // Write to response and also
    _write.call(res, data);

    // Queue task - leverage JS event queue
    queueTask(() => buffer.concat(data));
  };

  res.end = () => {
    // Do not block the connection
    _end.call(res);

    // Queue task - leverage JS event queue
    queueTask(() => {
      let body;
      try {
        body = JSON.parse(buffer.toBuffer().toString());
      } catch (e) {
        body = buffer.toBuffer().toString();
      }

      // Callback with tapped response
      callback(body);
    });
  };
}
