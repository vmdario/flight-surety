import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import { OracleManager } from './oracles';
import { FlightManager } from './flights';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
const oracleManager = new OracleManager(flightSuretyApp);
const flightManager = new FlightManager(flightSuretyApp);

async function start() {
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[15];

  await flightManager.registerFlights(accounts[0], accounts.slice(1, 6));
  
  await oracleManager.registerOracles(accounts.slice(11));
  oracleManager.handleOracleRequestEvents();
}
start().catch(console.error);

const app = express();
app.get('/api', (req, res) => {
  res.send({
    message: 'An API for use with your Dapp!'
  })
})

export default app;


