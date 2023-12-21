let base122 = require('./base122');

module.exports = {
  encodeBase122: function (data) {
    let stringifiedData = JSON.stringify(data),
        base122Encoded = base122.encode(Buffer.from(stringifiedData)),
        encodedData = Buffer.from(base122Encoded).toString();

    return encodedData;
  },

  decodeBase122: function (data) {
    let base122Decoded = base122.decode(Buffer.from(data)),
        decodedData = Buffer.from(base122Decoded).toString();

    return decodedData;
  }
};
