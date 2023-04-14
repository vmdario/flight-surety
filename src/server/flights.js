
export class FlightManager {
	constructor(flightSuretyApp) {
		this.flightSuretyApp = flightSuretyApp;
	}

	async registerFlights(owner, airlines = []) {
		const flights = require('./config.json').flights;
		const timestamp = '1';
		for (let i = 0; i < airlines.length; i++) {
			console.log('Registering flight', airlines[i], flights[i])
			await this.flightSuretyApp.methods
				.registerFlight(airlines[i], flights[i], timestamp)
				.send({ from: owner, gas: 100000 });
		}
	}
}