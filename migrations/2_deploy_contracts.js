const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const { default: BigNumber } = require('bignumber.js');
const fs = require('fs');

module.exports = function (deployer) {
    const weiMultiple = (new BigNumber(10)).pow(18);
    const owner = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    const airlines = [
        "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
        "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
        "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2",
        "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e",
    ];
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
                .then(() => appContract.registerAirline(airlines[0], { from: owner }))
                .then(() => appContract.registerAirline(airlines[1], { from: owner }))
                .then(() => appContract.registerAirline(airlines[2], { from: owner }))
                .then(() => appContract.registerAirline(airlines[3], { from: owner }))
                .then(() => dataContract.fund({ from: firstAirline, value: new BigNumber(10).times(weiMultiple) }))
                .then(() => dataContract.fund({ from: airlines[0], value: new BigNumber(10).times(weiMultiple) }))
                .then(() => dataContract.fund({ from: airlines[1], value: new BigNumber(10).times(weiMultiple) }))
                .then(() => dataContract.fund({ from: airlines[2], value: new BigNumber(10).times(weiMultiple) }))
                .then(() => dataContract.fund({ from: airlines[3], value: new BigNumber(10).times(weiMultiple) }));
        });
};
