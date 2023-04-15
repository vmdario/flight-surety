
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
import BigNumber from 'bignumber.js';


(async () => {

    let contract = new Contract('localhost', async () => {
        loadBalance().catch(console.error);
        // Read transaction
        contract.isOperational().then(result => {
            console.log(result);
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', value: result }], false, 'display-operational');
        }).catch(err => {
            console.log(err);
            display('Operational Status', 'Check if contract is operational error', [{ label: 'Operational Status', error: err }], false, 'display-operational');
        });

        contract.airlines.forEach(airline => {
            DOM.elid('flight-airline').appendChild(DOM.makeElement('option', { value: airline }, airline));
            DOM.elid('bi-select-airline').appendChild(DOM.makeElement('option', { value: airline }, airline));
            DOM.elid('wi-select-airline').appendChild(DOM.makeElement('option', { value: airline }, airline));
        });
        contract.flights.forEach(flight => {
            DOM.elid('flight-number').appendChild(DOM.makeElement('option', { value: flight }, flight));
            DOM.elid('bi-select-flight').appendChild(DOM.makeElement('option', { value: flight }, flight));
            DOM.elid('wi-select-flight').appendChild(DOM.makeElement('option', { value: flight }, flight));
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('flight-airline').value;
            let flight = DOM.elid('flight-number').value;
            let timestamp = DOM.elid('flight-timestamp').value;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, timestamp).then(result => {
                display('Oracles', 'Trigger oracles', [{ label: 'Flight Status', value: result.status }], true, 'display-wrapper-status');
            }).catch(err => {
                console.log(err);
                display('Oracles', 'Trigger oracles', [{
                    label: 'Flight Status error',
                    error: new Error("Oracles may be inactive or flight is not found")
                }], true, 'display-wrapper-status');
            });
        });
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let airline = DOM.elid('bi-select-airline').value;
            let flight = DOM.elid('bi-select-flight').value;
            let amount = DOM.elid('bi-airline-amount').value;
            let timestamp = DOM.elid('bi-timestamp').value;
            console.log(airline, flight, timestamp)
            // Write transaction
            contract.buyFlightInsurance(airline, flight, timestamp, new BigNumber(10).pow(18).times(amount).toString()).then(result => {
                console.log(result);
                loadBalance().catch(console.error);
                display('Buy insurance result', '', [{
                    label: 'Result',
                    value: 'Insurance purchased: ' + result.transactionHash
                }], true, 'display-wrapper-buy-insurance');
            }).catch(err => {
                console.log(err);
                display('Buy insurance result', '', [{ label: 'Error', error: err }], true, 'display-wrapper-buy-insurance');
            });
        });
        DOM.elid('credit-insuree').addEventListener('click', () => {
            let airline = DOM.elid('wi-select-airline').value;
            let flight = DOM.elid('wi-select-flight').value;
            let timestamp = DOM.elid('wi-timestamp').value;
            console.log(airline, flight, timestamp)
            // Write transaction
            contract.creditInsuree(airline, flight, timestamp).then(result => {
                console.log(result);
                loadBalance().catch(console.error);
                display('Credit insuree result', '', [{
                    label: 'Result',
                    value: 'Credited insuree: ' + result.transactionHash
                }], true, 'display-wrapper-withdraw-insurance');
            }).catch(err => {
                console.log(err);
                display('Credit insuree result', '', [{ 
                    label: 'Error', 
                    error: new Error("Flight is not late airline or insuree doesn't have insurance") 
                }], true, 'display-wrapper-withdraw-insurance');
            });
        });
        DOM.elid('pay-insuree').addEventListener('click', () => {
            let airline = DOM.elid('wi-select-airline').value;
            let flight = DOM.elid('wi-select-flight').value;
            let timestamp = DOM.elid('wi-timestamp').value;
            console.log(airline, flight, timestamp)
            // Write transaction
            contract.payInsuree(airline, flight, timestamp).then(result => {
                console.log(result);
                loadBalance().catch(console.error);
                display('Pay insuree result', '', [{
                    label: 'Result',
                    value: 'Paid insuree: ' + result.transactionHash
                }], true, 'display-wrapper-withdraw-insurance');
            }).catch(err => {
                console.log(err);
                display('Pay insuree result', '', [{ 
                    label: 'Error', 
                    error: new Error("No credit insuree yet or insuree doesn't have insurance") 
                 }], true, 'display-wrapper-withdraw-insurance');
            });
        });

    });

    async function loadBalance() {
        DOM.elid('wallet').innerText = contract.passengers[0];
        DOM.elid('balance').innerText = contract.web3.utils.fromWei(await contract.web3.eth.getBalance(contract.passengers[0]));
    }
    window.AppContract = contract;
})();


function display(title, description, results, isTemporary = false, elid = 'display-wrapper') {
    let displayDiv = DOM.elid(elid);
    let section = DOM.section();
    section.appendChild(DOM.h3(title));
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

