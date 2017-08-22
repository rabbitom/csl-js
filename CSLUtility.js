export default class CSLUtility {

    static toIntLE(buffer, offset, length) {
        var array = new Uint8Array(buffer);
        if(offset === undefined)
            offset = 0;
        if(length === undefined)
            length = array.length - offset;
        var result = 0;
        for(var i=length-1; i>=0; i--) {
            result = result * 0x100 + array[offset+i];
        }
        return result;
    }

    static writeIntLE(value, array, offset, length) {
        for(var i=0; i<length; i++)
            array[offset+i] = (value >> (8 * i)) & 0xff;
    }

    static toIntBE(buffer, offset, length) {
        var array = new Uint8Array(buffer);
        if(offset === undefined)
            offset = 0;
        if(length === undefined)
            length = array.length - offset;
        var result = 0;
        for(var i=0; i<length; i++) {
            result = result * 0x100 + array[offset+i];
        }
        return result;
    }

    static writeIntBE(value, array, offset, length) {
        for(var i=0; i<length; i++)
            array[offset + (length - 1 - i)] = (value >> (8 * i)) & 0xff;
    }

    static toHexString(buffer, offset, length, glue) {
        var array = new Uint8Array(buffer);
        if(offset === undefined)
            offset = 0;
        if(length === undefined)
            length = array.length - offset;
        var chars = [];
        for(var i=0; i<length; i++) {
            var n = array[offset+i];
            var char = n.toString(16).toUpperCase();
            if(n < 16)
                char = "0" + char;
            chars.push(char);
        }
        return chars.join(glue);
    }

    static arrayFromHexString(str) {
        var strLength = str.length;
        var maxLength = (strLength + 1) / 2;
        var array = new Uint8Array(maxLength);
        var arrayIndex = 0;
        var previousN = NaN;
        for (var i = 0; i < strLength; i++) {
            var char = str.slice(i, i + 1);
            var n = parseInt(char, 16);
            if(!isNaN(previousN)) {
                if(isNaN(n))
                    array[arrayIndex++] = previousN;
                else
                    array[arrayIndex++] = previousN * 0x10 + n;
                previousN = NaN;
            }
            else
                previousN = n;
        }
        if(!isNaN(previousN))
            array[arrayIndex++] = previousN;
        return array.subarray(0, arrayIndex);
    }

    //from http://jsperf.com/uint8array-vs-array-encode-to-utf8/2
    static arrayFromString(str) {
        var n = str.length,
        idx = 0,
        utf8 = new Uint8Array(new ArrayBuffer(n * 4)),
        i, j, c;

        //from http://user1.matsumoto.ne.jp/~goma/js/utf.js
        for (i = 0; i < n; ++i) {
            c = str.charCodeAt(i);
            if (c <= 0x7F) {
                utf8[idx++] = c;
            } else if (c <= 0x7FF) {
                utf8[idx++] = 0xC0 | (c >>> 6);
                utf8[idx++] = 0x80 | (c & 0x3F);
            } else if (c <= 0xFFFF) {
                utf8[idx++] = 0xE0 | (c >>> 12);
                utf8[idx++] = 0x80 | ((c >>> 6) & 0x3F);
                utf8[idx++] = 0x80 | (c & 0x3F);
            } else {
                j = 4;
                while (c >> (6 * j)) j++;
                utf8[idx++] = ((0xFF00 >>> j) & 0xFF) | (c >>> (6 * --j));
                while (j--)
                    utf8[idx++] = 0x80 | ((c >>> (6 * j)) & 0x3F);
            }
        }
        return utf8.subarray(0, idx);
    }

    static toString(buffer) {
        var array = new Uint8Array(buffer);
        var end = array.indexOf(0);
        if(end == 0)
            return '';
        var arr = (end > 0) ? array.slice(0, end) : array;
        var encodedString = String.fromCharCode.apply(null, arr),
            decodedString = decodeURIComponent(escape(encodedString));
        return decodedString;
    }
}