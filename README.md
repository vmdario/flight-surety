# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Technologies used
- Truffle v5.7.6 (core: 5.7.6)
- Ganache v7.7.3
- Solidity - ^0.4.24 (solc-js)
- Node v16.19.0
- Web3.js v1.8.2

This repository is organized as follows:
- `contracts` - directory where all solidity files are
- `migrations` - scripts to perform migration of contracts to the blockchain
- `src/dapp` - files related to the dapp 
- `src/server` - files related to the oracle server 
- `test` - test files


Follow the steps below accordingly.


## Install


To install, download or clone the repo, then:

`npm install`

`truffle compile`


Start ganache:

`bash ./run_ganache.sh`


## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`

![img/fs_test1.png](img/fs_test1.png)

`truffle test ./test/oracles.js`

![img/fs_test2.png](img/fs_test2.png)


To use the dapp, run the commands below in a new terminal:

`truffle migrate`

`npm run dapp`


## Develop Server

Start server in a new terminal:

`npm run server`

At this point all flights and oracles have been registered successfully:
![img3](img/fs_server.png)


Open the browser in `http://localhost:8000` to interact with the dapp.



## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)