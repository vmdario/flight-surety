
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
import BigNumber from 'bignumber.js';


(async () => {

    let contract = new Contract('localhost', async() => {

        // Read transaction
        contract.isOperational().then(result => {
            console.log(result);
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', value: result }], false, 'display-operational');
        }).catch(err => {
            console.log(err);
            display('Operational Status', 'Check if contract is operational error', [{ label: 'Operational Status', error: err }], false, 'display-operational');
        });

        DOM.elid('wallet').innerText = contract.passengers[0];
        DOM.elid('balance').innerText = await contract.web3.eth.getBalance(contract.passengers[0]);

        contract.airlines.forEach(airline => {
            DOM.elid('select-airline').appendChild(DOM.makeElement('option', { value: airline }, airline));
        });
        contract.flights.forEach(flight => {
            DOM.elid('select-flight').appendChild(DOM.makeElement('option', { value: flight }, flight));
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('flight-airline').value;
            let flight = DOM.elid('flight-number').value;
            let timestamp = DOM.elid('flight-timestamp').value;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, timestamp).then(result => {
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', value: result.status }], true);
            }).catch(err => {
                console.log(err);
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status error', error: err }], true);
            });
        });
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let airline = DOM.elid('select-airline').value;
            let flight = DOM.elid('select-flight').value;
            let amount = DOM.elid('airline-amount').value;
            let timestamp = DOM.elid('bi-timestamp').value;
            console.log(airline, flight, timestamp)
            // Write transaction
            contract.buyFlightInsurance(airline, flight, timestamp, new BigNumber(10).pow(18).times(amount).toString()).then(result => {
                console.log(result);
                display('Buy insurance result', '', [{ label: 'Result', value: 'Insurance purchased: ' + result.transactionHash }], true);
            }).catch(err => {
                console.log(err);
                display('Buy insurance result', '', [{ label: 'Error', error: err }], true);
            });
        });

    });
    window.AppContract = contract;
})();


function display(title, description, results, isTemporary = false, elid = 'display-wrapper') {
    let displayDiv = DOM.elid(elid);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-4 field' }, result.label));
        row.appendChild(DOM.div({ className: 'col-sm-8 field-value' }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
    if (isTemporary) {
        setTimeout(() => { displayDiv.innerHTML = ''; }, 10000);
    }
}







