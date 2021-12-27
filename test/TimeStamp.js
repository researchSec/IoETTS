// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const crypto  = require('crypto');
const secp256k1 = require('secp256k1');


describe("TimeStamp", function () {


  let TimeStamp;
  let hardhatTimeStamp;
  let owner;
  let addr1;
  let addr2;
  let addrs;


  before(async function () {

    TimeStamp = await ethers.getContractFactory("TimeStamp");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatTimeStamp = await TimeStamp.deploy();
  });


  describe("Transactions", function () {


    let data = "This a test record";

    // Difining algorithm
    const algorithm = 'aes-256-cbc';
    // Defining key
    const key = crypto.randomBytes(32);
    // Defining iv
    const iv = crypto.randomBytes(16);

    // Create a private key
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1'
    });
    let numcases = 100;
    var hasharry =new Array(numcases);
    for(let i =0; i < numcases; i++){
      let datai = data + i;
      hasharry[i] = crypto.createHash('sha256').update(datai).digest('hex');
    }
    

    //console.log(hash);
    // An encrypt function
    function encrypt(text) {
      
      // Creating Cipheriv with its parameter
      let cipher = 
          crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        
      // Updating text
      let encrypted = cipher.update(text);
        
      // Using concatenation
      encrypted = Buffer.concat([encrypted, cipher.final()]);
        
      // Returning iv and encrypted data
      return encrypted.toString('hex');
      }
    
      // A decrypt function
    function decrypt(encryptedData,sk) {
        
      let encryptedText = Buffer.from(encryptedData, 'hex');
        
      // Creating Decipher
      let decipher = crypto.createDecipheriv(
        algorithm, Buffer.from(sk,'hex'), iv);
        
      // Updating encrypted text
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
        
      // returns data after decryption
      return decrypted.toString();
    }

    it("Should stamp a record correctly", async function () {
    
    //multiple test cases

    for(let i =0; i < numcases; i++){
      let datai = data + i;
      let start = Date.now();
      // Encrypts output
      var encryptedData = encrypt(datai);
      //let time = Date.now() - start;
      //console.log(`time for Encryption = ${time} MS`);
      //start = Date.now();
      const sign = crypto.createSign('SHA256');
      sign.write(datai);
      sign.end();
      const signature = sign.sign(privateKey,'hex');
      //time = Date.now() - start;
      //console.log(`time for signing = ${time} MS`);
      //start = Date.now();
      let ins = await hardhatTimeStamp.AddS(hasharry[i],encryptedData,signature);
      let time = Date.now() - start;
      console.log(`time for creating a timestamp = ${time} MS`);
    }
    
    });



    it("Should unlock a record correctly", async function () {
   
      for(let i =0; i < numcases; i++){
        let start = Date.now();
        let ins = await hardhatTimeStamp.UnlockS(hasharry[i],key.toString('hex'));
        let time = Date.now() - start;
        console.log(`time for unlocking a timestamp = ${time} MS`);
      }
    });

    it("Should verify the stamp correctly", async function () {
      let rcode, sig, cip, timestamp, sk;
      for(let i =0; i < numcases; i++){
        let start = Date.now();
        [rcode,sig,cip,timestamp,sk] = await hardhatTimeStamp.CheckS(hasharry[i]);
        //let time = Date.now() - start;
        //console.log(`time for CheckS = ${time} MS`);
        if(rcode != 0){ 
          console.log("invalid");
        }else{
            // Decrypts output
            //start = Date.now();
            let dataToverify =  decrypt(cip,sk);
            //time = Date.now() - start;
            //console.log(`time for decryption = ${time} MS`);
            // verify
            //start = Date.now();
            const verify =  crypto.createVerify('SHA256');
            verify.write(dataToverify);
            verify.end();
            //console.log(verify.verify(publicKey, sig, 'hex'));
            let time = Date.now() - start;
            console.log(`time for verifying a timestamp = ${time} MS`);

        }
      }
    });


  


    /*

    it("Should set a secret sky correctly", async function () {

      let test = await hardhatTimeStamp.UnlockS("mytest0","mytest");
    });

    it("when the record doesnt exist", async function () {

      let test = await hardhatTimeStamp.UnlockS("mytest","mytest");
    });


    it("when the sender is not the owner", async function () {

       let test = await hardhatTimeStamp.connect(addr1).UnlockS("mytest0","mytest");
    });

   
     

    it("when the sk has existed", async function () {

     let test = await hardhatTimeStamp.UnlockS("mytest0","mytest");

    });
  
   
  
  */


    

  });
});