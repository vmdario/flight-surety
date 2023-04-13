
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    await config.flightSuretyData.registerAdmin(config.firstAirline); // first airline
    await config.flightSuretyApp.registerAirline(config.firstAirline, { from: config.owner });
    await config.flightSuretyData.fund({ from: config.firstAirline, value: new BigNumber(10).times(config.weiMultiple) });
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    }
    catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    }
    catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    }
    catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
    }
    catch (e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline);

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });

  it('(multiparty) Only existing airline may register a new airline until there are at least four airlines registered', async () => {
    let failed = false;
    try {
      await config.flightSuretyApp.registerAirline(accounts[3], { from: accounts[4] });
    } catch (e) {
      failed = true;
    }
    assert.equal(failed, true, "Only existing airline may register a new airline");

    // register 3 more airlines with firstAirline
    for (let i = 2; i <= 4; ++i) {
      await config.flightSuretyApp.registerAirline(accounts[i], { from: config.firstAirline });
      await config.flightSuretyData.fund({ from: accounts[i], value: new BigNumber(10).times(config.weiMultiple) });
    }

    // fifth airline must be voted first therefore it's not registered yet
    await config.flightSuretyApp.registerAirline(accounts[5], { from: config.firstAirline });
    const airline = await config.flightSuretyData.airlines.call(accounts[5]);
    assert.equal(airline.isRegistered, false, "Five or more airlines must be voted to get registered");
  });
  
  it('(multiparty) Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async () => {
    const newAirline = accounts[5];
    
    for (let i = 1; i < 4; ++i) {
      await config.flightSuretyData.voteForNewAirline(newAirline, { from: accounts[i] });
    }
    const airline = await config.flightSuretyData.airlines.call(newAirline);
    assert.equal(airline.isRegistered, true, "Five or more airlines must be voted to get registered");
  });
});
