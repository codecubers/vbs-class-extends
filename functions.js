var _lz = require('lz-string');
const RX = require('./constants');

const compress = (str) => str; //_lz.compressToBase64(str);
const deCompress = (str) => str; //_lz.decompressFromBase64(str);

const removeCommentsStart = (code) => code.replace(RX.COMMENTS_NEWLINE, '').replace(RX.COMMENTS_INLINE_NO_QUOTES, '');
const removeEmptyLines = (code) => code.replace(RX.EMPTY_LINE_TWO_OR_MORE, '\n\n');

function typeCheck(type) {
    type = type.trim().toUpperCase();
    return ['FUNCTION', 'SUB', 'PROPERTY'].includes(type) ? type : 'UNKNOWN';
}

module.exports = {
    compress,
    deCompress,
    removeCommentsStart,
    removeEmptyLines,
    typeCheck
}