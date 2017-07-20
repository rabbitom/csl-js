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
    });
    
    describe("be", ()=>{
        let be = CSLUtility.toIntBE(array, offset, length);
        should(be).equal(0x010203);
        be = CSLUtility.toIntBE(array);
        should(be).equal(0x010203);
    });
    
    describe("hex", ()=>{
        let string = CSLUtility.toHexString([1,10,255], 0, 3, "-");
        should(string).equal("01-0a-ff");
        let buffer = CSLUtility.fromHexString("120AFF");
        let array = new Uint8Array(buffer);
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x0A);
        should(array[2]).equal(0xFF);
        buffer = CSLUtility.fromHexString("120AF");
        array = new Uint8Array(buffer);
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x0A);
        should(array[2]).equal(0x0F);
        buffer = CSLUtility.fromHexString("12-0-AF");
        array = new Uint8Array(buffer);
        should(array[0]).equal(0x12);
        should(array[1]).equal(0x00);
        should(array[2]).equal(0xAF);
    })
});