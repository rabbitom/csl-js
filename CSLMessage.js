import CSLUtility from './CSLUtility';

export default class CSLMessage {

    constructor(pattern) {
        //de could mean definition
        this.fields = new Map();
        this.templates = new Map();
        var addField = function(field) {
            if(field.id)
                this.fields.set(field.id, field);
            // if(field['as-template'])
            //     this.templates.set(field['as-template'], field);
            if(field.type == 'enum') {
                for(var subField of field.values)
                    addField(subField);
            }
        }
        if(pattern.id)
            addField(pattern);
        else
            this.defaultField = pattern;
    }

    encode(object, filedId) {
        var field = this.defaultField;
        if(filedId !== undefined)
            field = this.fields[filedId];
        if(field == null)
            return;
        return this.encodeField(object, field);
    }

    encodeField(object, field) {
        switch(field.type) {
            case 'fixed':
                return this.encodeValue(field.length, field.format, field.value);
            case 'variable': {
                var value = object[field.name];
                return this.encodeValue(field.length, field.format, value);
            }
            case 'combination': {
                var array = new Uint8Array(field.length);
                var offset = 0;
                for(var iField of field.value) {
                    var iArray = this.encodeField(object, iField);
                    array.set(iArray, offset);
                    offset += iArray.length;
                }
                return array;
            }
        }
    }

    encodeValue(length, format, value) {
        var array = new Uint8Array(length);
        switch(format) {
            case 'int':
            case 'int.le':
                CSLUtility.writeIntLE(value, array, 0, length);
                break;
            case 'int.be':
                CSLUtility.writeIntBE(value, array, 0, length);
                break;
            case 'string':
                var arrayFromString = CSLUtility.arrayFromString(value);
                for(var i=0; i<length; i++) {
                    if(i < arrayFromString.length)
                        array[i] = arrayFromString[i];
                    else
                        array[i] = 0;
                }
                break;
            case 'bcd':
                var valueBelowHundred = value % 100;
                var valueOfTens = Math.floor(valueBelowHundred / 10);
                var valueOfOnes = valueBelowHundred % 10;
                array[0] = valueOfTens * 0x10 + valueOfOnes;
                break;
        }
        return array;
    }

    decode(buffer, offset, length, fieldId) {
        var field = this.defaultField;
        if(fieldId !== undefined)
            field = this.fields[filedId];
        if(field == null)
            return;
        return this.decodeField(buffer, offset, length, field);
    }

    decodeField(buffer, offset, length, field) {
        switch(field.type) {
            case 'fixed':
            case 'variable': {
                if((length !== undefined) && (length < field.length))
                    return;
                else
                    length = field.length;
                var value = this.decodeValue(buffer, offset, length, field.format);
                if((field.type == 'fixed') && (value != field.value[0]))
                    return;
                var object = new Object();
                object[field.name] = value;
                return object;
            }
            case 'combination': {
                var object = new Object();
                var iOffset = 0;
                for(var iField of field.value) {
                    var iObject = this.decodeField(buffer, iOffset, iField.length, iField);
                    if(iObject === undefined)
                        return;
                    iOffset += iField.length;
                    for(var key in iObject)
                        object[key] = iObject[key];
                }
                return object;
            }
        }
    }

    decodeValue(buffer, offset, length, format) {
        switch(format) {
            case 'int':
            case 'int.le':
                return CSLUtility.toIntLE(buffer, offset, length);
            case 'int.be':
                return CSLUtility.toIntBE(buffer, offset, length);
            case 'string':
                return CSLUtility.toString(buffer, offset, length);
            case 'bcd':
                var bcd = buffer[offset];
                return (bcd >> 4) * 10 + (bcd % 16);
        }
    }
}