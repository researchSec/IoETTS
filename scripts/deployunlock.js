const crypto  = require('crypto');
const secp256k1 = require('secp256k1');
const util = require('util');


async function main() {
    
    const [deployer] = await ethers.getSigners();
  
    console.log("Etherum account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    //const TimeStampFC = await ethers.getContractFactory("TimeStamp");
    //const TimeStamp = await TimeStampFC.dep  
    let overrides = {

      // The maximum units of gas for the transaction to use
      gasLimit: 4200000,
  
      // The price (in wei) per unit of gas
      gasPrice:  ethers.utils.parseUnits('3', 'gwei'),

  
  };
    // The Contract interface
    let abi = [
      "function AddS(string calldata digest, string calldata cipher, string calldata signature) external",
      "function UnlockS(string calldata digest, string calldata sk) external ",
      "function CheckS(string calldata digest) external view returns (int rcode, string memory signature, string memory cipher, uint timestamp, string memory sk) "
    ];

    // Connect to the network
    //let provider = ethers.getDefaultProvider();

    // The address from the above deployment example
    let contractAddress = "0xF69039Be1C017564189F70806D800cf70054EAC1";

    // We connect to the Contract using a Provider, so we will only
    // have read-only access to the Contract
    let TimeStamp = new ethers.Contract(contractAddress, abi, deployer);



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
    //Unlock a timestamp
    start = Date.now();
    ins = await TimeStamp.UnlockS(hasharry[i],key.toString('hex'),overrides);
    time = Date.now() - start;
    console.log(`time for unlocking a timestamp = ${time} MS`);
    }



    

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });


    