const ChainsqlAPI = require('chainsql');
const chainsql = new ChainsqlAPI();
const crypto  = require('crypto');
const secp256k1 = require('secp256k1');

async function start() {

  await chainsql.connect("ws://");
 
  const user = {
    secret: "pwkpNabzRpiVVyoySFPYkE9tngvcokG3BFuEHXpv8hzz9JDbiZN",
    address: "znZq1NAg2qqHsFR6ymdE8pjKH7hKouVcUy",
    publicKey: "pYvGmm3LY8XGTEKNQYAxgFtACTaGWrB56bkhAEZ5sQpt6McPxq8p9n3b3B6Xhrcn1WVNN2BzuRUMiV3WbyAcUibvasd79CCQ"
  };
  await chainsql.as(user);
  
  //load the deployed contract and call a function
  // deploy the smart contract 
  const abi = '[{"inputs": [{"internalType": "string","name": "digest","type": "string"},{"internalType": "string","name": "cipher","type": "string"},{"internalType": "string","name": "signature","type": "string"}],"name": "AddS","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "string","name": "digest","type": "string"}],"name": "CheckS","outputs": [{"internalType": "int256","name": "rcode","type": "int256"},{"internalType": "string","name": "signature","type": "string"},{"internalType": "string","name": "cipher","type": "string"},{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "string","name": "sk","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "digest","type": "string"},{"internalType": "string","name": "sk","type": "string"}],"name": "UnlockS","outputs": [],"stateMutability": "nonpayable","type": "function"}]';
  const contractObj = chainsql.contract(JSON.parse(abi),"z3rDNjwNNMAGnrj6AyrU1oGDN69HjEhemP");

  let data = "RecordId:01111;EventId:000111;Sender:Alice;Recv:Bob;Amount:5000";

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
  let numcases = 90;
  var hasharry =new Array(numcases);
  for(let i =0; i < numcases; i++){
      let datai = data + i;
      hasharry[i] = crypto.createHash('sha256').update(datai).digest('hex');
  }
    

  //console.log(hash);
  // An encrypt function
  function encrypt(text) {
      
    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        
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
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(sk,'hex'), iv);
        
  // Updating encrypted text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
        
      // returns data after decryption
     return decrypted.toString();
  }

  //multiple test cases
  let start = Date.now();
  for(let i =0; i < numcases; i++){
    let datai = data + i;
    
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
    let ins = await contractObj.methods.AddS(hasharry[i],encryptedData,signature).submit({
      Gas: 500000,
      expect: "validate_success"
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
    
  }
  let time = Date.now() - start;
  console.log(`time for creating a timestamp = ${time} MS`);

  start = Date.now();
  for(let i =0; i < numcases; i++){
    
    let ins = await contractObj.methods.UnlockS(hasharry[i],key.toString('hex')).submit({
      Gas: 500000,
      expect: "validate_success"
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
    
  }
  time = Date.now() - start;
  console.log(`time for unlocking a timestamp = ${time} MS`);

  start = Date.now();
  let rcode, sig, cip, timestamp, sk;
  for(let i =0; i < numcases; i++){
    let ins  = await contractObj.methods.CheckS(hasharry[i]).call();
    rcode = ins.rcode;
    sig = ins.signature;
    cip = ins.cipher;
    timestamp = ins.timestamp;
    sk = ins.sk;
    //[rcode,sig,cip,timestamp,sk]
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
        console.log(verify.verify(publicKey, sig, 'hex'));
        verify.end();
        

    }
  }
  time = Date.now() - start;
  console.log(`time for verifying a timestamp = ${time} MS`);
 
}
start();






/*
let accountNew = chainsql.generateAddress();

// deploy the smart contract 
const abi = '[{"inputs": [{"internalType": "string","name": "digest","type": "string"},{"internalType": "string","name": "cipher","type": "string"},{"internalType": "string","name": "signature","type": "string"}],"name": "AddS","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "string","name": "digest","type": "string"}],"name": "CheckS","outputs": [{"internalType": "int256","name": "rcode","type": "int256"},{"internalType": "string","name": "signature","type": "string"},{"internalType": "string","name": "cipher","type": "string"},{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "string","name": "sk","type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "string","name": "digest","type": "string"},{"internalType": "string","name": "sk","type": "string"}],"name": "UnlockS","outputs": [],"stateMutability": "nonpayable","type": "function"}]';
const contractObj = chainsql.contract(JSON.parse(abi));
const deployBytecode = '0x608060405234801561001057600080fd5b50610ac8806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80634251bd3614610046578063758f4b77146101145780639d0e20db14610237575b600080fd5b6101126004803603604081101561005c57600080fd5b810190808035906020019064010000000081111561007957600080fd5b82018360208201111561008b57600080fd5b803590602001918460018302840111640100000000831117156100ad57600080fd5b9091929391929390803590602001906401000000008111156100ce57600080fd5b8201836020820111156100e057600080fd5b8035906020019184600183028401116401000000008311171561010257600080fd5b909192939192939050505061040f565b005b6102356004803603606081101561012a57600080fd5b810190808035906020019064010000000081111561014757600080fd5b82018360208201111561015957600080fd5b8035906020019184600183028401116401000000008311171561017b57600080fd5b90919293919293908035906020019064010000000081111561019c57600080fd5b8201836020820111156101ae57600080fd5b803590602001918460018302840111640100000000831117156101d057600080fd5b9091929391929390803590602001906401000000008111156101f157600080fd5b82018360208201111561020357600080fd5b8035906020019184600183028401116401000000008311171561022557600080fd5b9091929391929390505050610550565b005b6102ae6004803603602081101561024d57600080fd5b810190808035906020019064010000000081111561026a57600080fd5b82018360208201111561027c57600080fd5b8035906020019184600183028401116401000000008311171561029e57600080fd5b90919293919293905050506106d4565b60405180868152602001806020018060200185815260200180602001848103845288818151815260200191508051906020019080838360005b838110156103025780820151818401526020810190506102e7565b50505050905090810190601f16801561032f5780820380516001836020036101000a031916815260200191505b50848103835287818151815260200191508051906020019080838360005b8381101561036857808201518184015260208101905061034d565b50505050905090810190601f1680156103955780820380516001836020036101000a031916815260200191505b50848103825285818151815260200191508051906020019080838360005b838110156103ce5780820151818401526020810190506103b3565b50505050905090810190601f1680156103fb5780820380516001836020036101000a031916815260200191505b509850505050505050505060405180910390f35b3373ffffffffffffffffffffffffffffffffffffffff1660008585604051808383808284378083019250505092505050908152602001604051809103902060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161480156104d1575060008085856040518083838082843780830192505050925050509081526020016040518091039020600501805460018160011615610100020316600290049050145b80156105075750600080858560405180838380828437808301925050509250505090815260200160405180910390206004015414155b61051057600080fd5b818160008686604051808383808284378083019250505092505050908152602001604051809103902060050191906105499291906109e7565b5050505050565b60008087876040518083838082843780830192505050925050509081526020016040518091039020600401541461058657600080fd5b3360008787604051808383808284378083019250505092505050908152602001604051809103902060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550858560008888604051808383808284378083019250505092505050908152602001604051809103902060010191906106289291906109e7565b50818160008888604051808383808284378083019250505092505050908152602001604051809103902060030191906106629291906109e7565b508383600088886040518083838082843780830192505050925050509081526020016040518091039020600201919061069c9291906109e7565b504260008787604051808383808284378083019250505092505050908152602001604051809103902060040181905550505050505050565b6000606080600060606000808888604051808383808284378083019250505092505050908152602001604051809103902060040154141561075457606460006040518060200160405280600081525090604051806020016040528060008152509060405180602001604052806000815250945094509450945094506109dd565b6000808888604051808383808284378083019250505092505050908152602001604051809103902060030160008989604051808383808284378083019250505092505050908152602001604051809103902060020160008a8a60405180838380828437808301925050509250505090815260200160405180910390206004015460008b8b6040518083838082843780830192505050925050509081526020016040518091039020600501838054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108935780601f1061086857610100808354040283529160200191610893565b820191906000526020600020905b81548152906001019060200180831161087657829003601f168201915b50505050509350828054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561092f5780601f106109045761010080835404028352916020019161092f565b820191906000526020600020905b81548152906001019060200180831161091257829003601f168201915b50505050509250808054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109cb5780601f106109a0576101008083540402835291602001916109cb565b820191906000526020600020905b8154815290600101906020018083116109ae57829003601f168201915b50505050509050945094509450945094505b9295509295909350565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282610a1d5760008555610a64565b82601f10610a3657803560ff1916838001178555610a64565b82800160010185558215610a64579182015b82811115610a63578235825591602001919060010190610a48565b5b509050610a719190610a75565b5090565b5b80821115610a8e576000816000905550600101610a76565b509056fea26469706673582212201f369c4f07875d43920783f8a570f8447fb91f91126ba72d56a6e436aa8af9ba64736f6c63430007060033';
await contractObj.deploy({ContractData : deployBytecode,arguments:['TimeStampTest!']}).submit({Gas: '5000000',}).then(res => {
    console.log(res);
}).catch(err => {
    console.error(err);
});
});
const rootuser = {
  secret: "p97evg5Rht7ZB7DbEpVqmV3yiSBMxR3pRBKJyLcRWt7SL5gEeBb",
  address: "zN7TwUjJ899xcvNXZkNJ8eFFv2VLKdESsj",
  publicKey: "pYvWhW4azFwanovo5MhL71j5PyTWSJi2NVurPYUrE9UYaSVLp29RhtxxQB7xeGvFmdjbtKRzBQ4g9bCW5hjBQSeb7LePMwFM"
};
let accountNew = await chainsql.generateAddress({algorithm:"softGMAlg"});
console.log(accountNew);
await chainsql.pay(user.address, "2000").submit({expect:'validate_success'});
 
  let info = await chainsql.getAccountInfo(user.address);
  console.log(info);

*/