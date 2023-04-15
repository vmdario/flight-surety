import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];
        this.initialize(callback);
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            this.flights = require('./config.json').flights;

            callback();
        });
    }

    isOperational() {
        let self = this;
        console.log('Contract', self)
        return self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner });
    }

    async fetchFlightStatus(airline, flight, timestamp) {
        let self = this;
        let payload = {
            airline,
            flight,
            timestamp
        }
        return self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.passengers[0] })
            .then(() => {
                return new Promise((resolve, reject) => {
                    self.flightSuretyApp.once('FlightStatusInfo', {
                        filter: { airline, flight, timestamp }
                    }, function (error, event) {
                        if (error) {
                            console.log(error);
                            reject(new Error("Oracles may be inactive or flight is not found"));
                        } else {
                            console.log(event.returnValues);
                            const values = {
                                status: "",
                                flight: event.returnValues.flight,
                                airline: event.returnValues.airline,
                                timestamp: event.returnValues.timestamp
                            };
                            switch (event.returnValues.status) {
                                case "10": values.status = 'On Time'; break;
                                case "20": values.status = 'Late Airline'; break;
                                case "30": values.status = 'Late Weather'; break;
                                case "40": values.status = 'Late Technical'; break;
                                case "50": values.status = 'Late Other'; break;
                                default: values.status = 'Unknown';
                            }
                            resolve(values);
                        }
                    });
                });
            });
    }
    buyFlightInsurance(airline, flight, timestamp, value) {
        let self = this;
        return self.flightSuretyApp.methods
            .buyFlightInsurance(airline, flight, timestamp)
            .send({ from: self.passengers[0], value });
    }
    creditInsuree(airline, flight, timestamp) {
        let self = this;
        return self.flightSuretyApp.methods
            .creditInsuree(airline, flight, timestamp)
            .send({ from: self.passengers[0] });
    }
    payInsuree(airline, flight, timestamp) {
        let self = this;
        return self.flightSuretyApp.methods
            .payInsuree(airline, flight, timestamp)
            .send({ from: self.passengers[0] });
    }
}