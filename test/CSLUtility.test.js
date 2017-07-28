import should from 'should';
import CSLUtility from '../CSLUtility';

describe('CSLUtility', ()=>{
    let array = [1,2,3];
    let offset = 0;
    let length = 3;

    describe("le", ()=>{
        let le = CSLUtility.toIntLE(array, offset, length);
        should(le).equal(0x030201);
        le = CSLUtility.toIntLE(array);
        should(le).equal(0x030201);
        le = CSLUtility.toIntLE(array, 0, 2);
        should(le).equal(0x0201);
        le = CSLUtility.toIntLE(array, 1, 2);
        should(le).equal(0x0302);
    });
    
    describe("be", ()=>{
        let be = CSLUtility.toIntBE(array, offset, length);
        should(be).equal(0x010203);
        be = CSLUtility.toIntBE(array);
        should(be).equal(0x010203);
        be = CSLUtility.toIntBE(array, 0, 2);
        should(be).equal(0x0102);
        be = CSLUtility.toIntBE(array, 1, 2);
        should(be).equal(0x0203);
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
    })
});