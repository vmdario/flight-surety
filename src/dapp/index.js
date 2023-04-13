
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async () => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational().then(result => {
            console.log(result);
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', value: result }], false, 'display-operational');
        }).catch(err => {
            console.log(err);
            display('Operational Status', 'Check if contract is operational error', [{ label: 'Operational Status', error: err }], false, 'display-operational');
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight).then(result => {
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', value: result.flight + ' ' + result.timestamp }], true);
            }).catch(err => {
                console.log(err);
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status error', error: err }], true);
            });
        });
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let airline = DOM.elid('buy-insurance-airline').value;
            let flight = DOM.elid('buy-insurance-flight').value;
            let timestamp = DOM.elid('buy-insurance-timestamp').value;
            console.log(airline, flight, timestamp)
            // Write transaction
            contract.buyFlightInsurance(airline, flight, timestamp).then(result => {
                console.log(error, result);
                display('Buy insurance result', '', [{ label: 'Result', value: result }], true);
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







