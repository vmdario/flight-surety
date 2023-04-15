
export class OracleManager {
	constructor(flightSuretyApp) {
		this.flightSuretyApp = flightSuretyApp;
		this.oracleIndexAddressesMap = {};
	}

	async registerOracles(oracleAddresses = []) {
		console.log('Registering oracles');
		for (let i = 0; i < oracleAddresses.length; i++) {
			console.log('Registering oracle ' + oracleAddresses[i]);
			await this.flightSuretyApp.methods.registerOracle().send({ from: oracleAddresses[i], value: '1000000000000000000' });

			const indexes = await this.getOracleIndexes(oracleAddresses[i]);
			for (const index of indexes) {
				if (!this.oracleIndexAddressesMap[index]) {
					this.oracleIndexAddressesMap[index] = [];
				}
				this.oracleIndexAddressesMap[index].push(oracleAddresses[i]);
			}
		}
	}

	async getOracleIndexes(oracleAddress) {
		return await this.flightSuretyApp.methods.getMyIndexes().call({ from: oracleAddress });
	}

	handleOracleRequestEvents() {
		console.log('Listening to Oracle events');
		const self = this;
		this.flightSuretyApp.events.OracleRequest({
			fromBlock: 0
		}, async function (error, event) {
			if (error) console.log(error)
			else {
				console.log(event);
				const status = (1 + (Math.floor(Math.random() * 10) % 5)) * 10;
				const index = event.returnValues.index;
				for (const oracle of self.oracleIndexAddressesMap[index]) {
					console.log(
						'Submitting response:',
						index,
						oracle,
						event.returnValues.airline,
						event.returnValues.flight,
						event.returnValues.timestamp,
						status
					);
					self.flightSuretyApp.methods.submitOracleResponse(
						index,
						event.returnValues.airline,
						event.returnValues.flight,
						event.returnValues.timestamp,
						status
					).send({ from: oracle }).catch(e => console.log('Debug error:', e));
				}
			}
		});
	}
}