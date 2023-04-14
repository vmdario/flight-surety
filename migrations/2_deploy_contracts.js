const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const { default: BigNumber } = require('bignumber.js');
const fs = require('fs');

module.exports = function (deployer) {
    const weiMultiple = (new BigNumber(10)).pow(18);
    const owner = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    let appContract, dataContract;
    deployer.deploy(FlightSuretyData)
        .then(() => {
            return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
                .then(async () => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:8545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        },
                        "flights": ["F10001", "F00002", "X74993", "A00222", "V90003"]
                    }
                    appContract = await FlightSuretyApp.deployed();
                    dataContract = await FlightSuretyData.deployed();
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json', JSON.stringify(config, null, '\t'), 'utf-8');
                }).then(() => dataContract.authorizeCaller(FlightSuretyApp.address))
                .then(() => dataContract.registerAdmin(firstAirline))
                .then(() => appContract.registerAirline(firstAirline, { from: owner }))
                .then(() => dataContract.fund({ from: firstAirline, value: new BigNumber(10).times(weiMultiple) }));
        });
};
