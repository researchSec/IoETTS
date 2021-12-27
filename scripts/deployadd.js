const crypto  = require('crypto');
const secp256k1 = require('secp256k1');
//const util = require('util');


async function main() {
    
    const [deployer] = await ethers.getSigners();
  
    console.log("Etherum account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    let overrides = {

      // The maximum units of gas for the transaction to use
      gasLimit: 4200000,
  
      // The price (in wei) per unit of gas
      gasPrice:  ethers.utils.parseUnits('5', 'gwei'),

  
  };
  
    const TimeStampFC = await ethers.getContractFactory("TimeStamp");
    const TimeStamp = await TimeStampFC.deploy(overrides);
  
    console.log("Contract address:", TimeStamp.address);
    let data = "RecordId:01111;EventId:000111;Sender:Alice;Recv:Bob;Amount:1000";

    // Difining algorithm
    const algorithm = 'aes-256-cbc';
// Defining key
const key = Buffer.from([0x1a, 0x2d, 0xf3, 0xca, 0xbc, 0x2c, 0x56, 0x76, 0xa3, 0x41, 0xc6 , 0xdb ,0xd5 ,0xe3 ,0xe6 ,0x0a, 0x0e, 0x40, 0x39, 0xf8, 0xe2, 0x75, 0x49, 0x35, 0x85, 0xa7, 0x5c, 0x92, 0x67, 0xa9, 0x77, 0x6d]); //crypto.randomBytes(32);
// Defining iv
const iv =  Buffer.from([0x1a, 0x2d, 0xf3, 0xca, 0xbc, 0x2c, 0x56, 0x76, 0xa3, 0x41, 0xc6, 0x1a, 0x2d, 0xf3, 0xca, 0xbc]);//crypto.randomBytes(16);

    // Create a private key
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'secp256k1'
    });

    let numcases = 1;
    var hasharry =new Array(numcases);
    for(let i =0; i < numcases; i++){
      let datai = data + i;
      hasharry[i] = crypto.createHash('sha256').update(datai).digest('hex');
    }
    
 
    //console.log("publicKey",publicKey).toString('hex');
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



    for(let i =0; i < numcases; i++){
    let start = Date.now();
    let datai = data + i;
    // Encrypts output
    var encryptedData = encrypt(data);
    //let time = Date.now() - start;
    //console.log(`time for encryption = ${time} MS`);
    //start = Date.now();
    const sign = crypto.createSign('SHA256');
    sign.write(data);
    sign.end();
    const signature = sign.sign(privateKey,'hex');
    //time = Date.now() - start;
    //console.log(`time for signing = ${time} MS`);

    //Add a timestamp
    start = Date.now();
    let ins =  await TimeStamp.AddS(hasharry[i],encryptedData,signature,overrides);
    let time = Date.now() - start;
    console.log(`time for adding a timestamp = ${time} MS`);
    }
    

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


    