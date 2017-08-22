import should from 'should';
import CSLUtility from '../CSLUtility';

describe('CSLUtility', ()=>{
    
    describe("le", ()=>{
        let array = [1,2,3];
        let le = CSLUtility.toIntLE(array, 0, 3);
        should(le).equal(0x030201);
        le = CSLUtility.toIntLE(array);
        should(le).equal(0x030201);
        le = CSLUtility.toIntLE(array, 0, 2);
        should(le).equal(0x0201);
        le = CSLUtility.toIntLE(array, 1, 2);
        should(le).equal(0x0302);
        array = new Uint8Array(4);
        CSLUtility.writeIntLE(0x01020304, array, 0, 4);
        should(array[0]).equal(0x04);
        should(array[1]).equal(0x03);
        should(array[2]).equal(0x02);
        should(array[3]).equal(0x01);
    });
    
    describe("be", ()=>{
        let array = [1,2,3];
        let be = CSLUtility.toIntBE(array, 0, 3);
        should(be).equal(0x010203);
        be = CSLUtility.toIntBE(array);
        should(be).equal(0x010203);
        be = CSLUtility.toIntBE(array, 0, 2);
        should(be).equal(0x0102);
        be = CSLUtility.toIntBE(array, 1, 2);
        should(be).equal(0x0203);
        array = new Uint8Array(4);
        CSLUtility.writeIntBE(0x01020304, array, 0, 4);
        should(array[0]).equal(0x01);
        should(array[1]).equal(0x02);
        should(array[2]).equal(0x03);
        should(array[3]).equal(0x04);
    });
    
    describe("hex", ()=>{
        let string = CSLUtility.toHexString([1,10,255], 0, 3, "-");
        should(string).equal("01-0A-FF");
        string = CSLUtility.toHexString([1,10,255], 0, 3, "");
        should(string).equal("010AFF");
        string = CSLUtility.toHexString([1,10,255], 0, 2, "-");
        should(string).equal("01-0A");
        string = CSLUtility.toHexString([1,10,255], 1, 2, "-");
        should(string).equal("0A-FF");
        let array = CSLUtility.arrayFromHexString("120AFF");
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x0A);
        should(array[2]).equal(0xFF);
        array = CSLUtility.arrayFromHexString("120AF");
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x0A);
        should(array[2]).equal(0x0F);
        array = CSLUtility.arrayFromHexString("12-0-AF");
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x00);
        should(array[2]).equal(0xAF);
    });

    describe("uuid", ()=>{
        var a = [0x9E, 0xCA, 0xDC, 0x24, 0x0E, 0xE5, 0xA9, 0xE0, 0x93, 0xF3, 0xA3, 0xB5, 0x00, 0x00, 0x40, 0x6E];
        var b = [];
        for(var i=a.length-1; i>=0; i--)b[a.length-1-i]=a[i];
        var lengths = [4, 2, 2, 2, 6];
        var parts = [];
        var start = 0;
        for(var len of lengths) {
            var s = CSLUtility.toHexString(b, start, len, "");
            start += len;
            parts = parts.concat([s]);
        }
        var uuid = parts.join("-");
        console.log(uuid);
        should(uuid.length).equal(32+4);
    })
});