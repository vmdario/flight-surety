import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = ['F10001', 'F00002'];
        this.initialize(callback);
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 2) {
                this.airlines.push(accts[counter++]);
            }

            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }
    
    initializeFlights() {
        for (let i = 0; i < this.flights.length; i++) {
            console.log(this.airlines[0], this.flights[i])
            this.registerFlight(this.airlines[i], this.flights[i], '1')
                .then(() => console.log('Flight registered'))
                .catch(console.error);
        }
    }
    async registerOracles() {
        console.log('Registering oracles');
        const accounts = await this.web3.eth.getAccounts();
        for (let i = 0; i < accounts.length; i++) {
            console.log('Registering oracle from '+ accounts[i]);
            await this.flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: '1000000000000000000', gas: 100000 })
                .catch(console.error);
        }
    }

    isOperational() {
        let self = this;
        console.log('Contract', self)
        return self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner });
    }

    fetchFlightStatus(flight) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: '1'
        }
        return self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.passengers[0] });
    }
    registerFlight(airline, flight, timestamp) {
        let self = this;
        return self.flightSuretyApp.methods
            .registerFlight(airline, flight, timestamp)
            .send({ from: self.owner, gas: 100000 });
    }
    buyFlightInsurance(airline, flight, timestamp, value) {
        let self = this;
        return self.flightSuretyApp.methods
            .buyFlightInsurance(airline, flight, timestamp)
            .send({ from: self.passengers[0], value });
    }
}