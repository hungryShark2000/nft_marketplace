# Testing The Contract (NFT.sol)

### 1. Open terminal
### 2. Boot up local development blockchain
```
$ npx hardhat node
```
If you see 20 accounts with a metric tonne of fake ether, we're good

### 4. Then to deploy them to local blockchain
```
$ npx hardhat run src/backend/scripts/deploy.js --network localhost
```
### 5. To get into the hardhat console
```
$ npx hardhat console --network localhost
```
This is an interactive javascript environment for interacting with our blockchain

### 5. Let's try fetching a deployed copy
get the contract address from previous command
```
$ const contract = await ethers.getContractAt("NFT", "CONTRACTADDRESS")
```
### 5. Can also do stuff like
can replace tokenCount with a bunch of stuff
```
$ const contract = await contract.tokenCount()
```
