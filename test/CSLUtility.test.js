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
    
});