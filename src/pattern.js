// a simple wrapper for the chr file

const { aliases, chr, colors } = require('./chr.json');

module.exports = name => aliases[name];
module.exports.PATTERNTABLE = chr;
