// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.7.0;

contract TimeStamp {

    
    struct Record {
        address owner;
        string digest;
        string cipher;
        string signature;
        uint timestamp;
        string sk;
    }

    mapping(string => Record) records;
    
    function AddS(string calldata digest, string calldata cipher, string calldata signature) external {
        require(records[digest].timestamp == 0);
        records[digest].owner = msg.sender;
        records[digest].digest = digest;
        records[digest].signature = signature;
        records[digest].cipher = cipher;
        records[digest].timestamp = block.timestamp;
    }

    function UnlockS(string calldata digest, string calldata sk) external {
        require(records[digest].owner == msg.sender && bytes(records[digest].sk).length == 0 && records[digest].timestamp != 0);
        records[digest].sk = sk;
    }
     
    function CheckS(string calldata digest) external view returns (int rcode, string memory signature, string memory cipher, uint timestamp, string memory sk) {
        if(records[digest].timestamp == 0){
            return (int256(100),'','',uint256(0),'');
        }
        return (int256(0),records[digest].signature,records[digest].cipher,records[digest].timestamp,records[digest].sk);
        
    }
}