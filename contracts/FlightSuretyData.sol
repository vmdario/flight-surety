pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false
    uint constant M = 2;
    mapping(address => bool) public admins;
    address[] multiCalls = new address[](0);
    mapping(address => bool) public authorizedCallers;
    struct Airline {
        bool isRegistered;
        uint256 votes;
        uint256 balance;
    }
    mapping(address => Airline) public airlines;
    uint256 public registeredAirlines = 0;
    struct Insuree {
        address airline;
        uint256 balance;
        bool creditInsuree;
    }
    mapping(address => Insuree) public insurees;
    address[] public registrationQueue = new address[](0);

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor() public {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
    modifier requireAuthorizedCaller() {
        require(
            msg.sender == contractOwner || authorizedCallers[msg.sender],
            "Caller is not an authorized caller"
        );
        _;
    }
    modifier requireAirline() {
        require(isAirline(msg.sender), "Only airline can vote");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external {
        if (contractOwner == msg.sender) {
            operational = mode;
            return;
        }

        require(admins[msg.sender], "Caller is not admin");
        bool isDuplicate = false;
        for (uint i = 0; i < multiCalls.length; i++) {
            if (multiCalls[i] == msg.sender) {
                isDuplicate = true;
                break;
            }
        }
        require(!isDuplicate, "Caller has already called this function");

        multiCalls.push(msg.sender);
        if (multiCalls.length >= M) {
            operational = mode;
            multiCalls = new address[](0);
        }
    }

    function isAirline(address airline) public view returns (bool) {
        return airlines[airline].isRegistered && airlines[airline].balance >= 10 ether;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function registerAdmin(address caller) external requireContractOwner {
        admins[caller] = true;
    }

    function unregisterAdmin(address caller) external requireContractOwner {
        admins[caller] = false;
    }

    function authorizeCaller(address caller) external requireContractOwner {
        authorizedCallers[caller] = true;
    }

    function unauthorizeCaller(address caller) external requireContractOwner {
        authorizedCallers[caller] = false;
    }

    function voteForNewAirline(address airline) external requireAirline {
        Airline storage newAirline = airlines[airline];
        address foundAddress = address(0);
        uint i = 0;
        for (; i < registrationQueue.length; i++) {
            if (airline == registrationQueue[i]) {
                foundAddress = airline;
                break;
            }
        }
        require(
            foundAddress != address(0),
            "Airline address not in registration queue"
        );

        newAirline.votes = newAirline.votes.add(1);
        uint256 quorum = registeredAirlines.div(2);
        if (newAirline.votes > quorum) {
            newAirline.isRegistered = true;
            delete registrationQueue[i];
        }
    }

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        address airline
    ) external requireAuthorizedCaller returns (uint256) {
        if (registeredAirlines > 4) {
            registrationQueue.push(airline);
            return 0;
        } else {
            registeredAirlines++;
            airlines[airline].isRegistered = true;
            return airlines[airline].votes;
        }
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(address airline, address insuree) external payable {
        require(isAirline(airline), "Airline is not registered");
        airlines[airline].balance = airlines[airline].balance.add(msg.value);
        insurees[insuree].airline = airline;
        insurees[insuree].balance = insurees[insuree].balance.add(msg.value);
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(address airline) external {
        require(insurees[msg.sender].balance > 0, "Not enough balance");
        insurees[msg.sender].creditInsuree = true;
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external {
        require(insurees[msg.sender].creditInsuree);
        require(insurees[msg.sender].balance > 0, "Not enough balance");
        insurees[msg.sender].balance = 0;
        msg.sender.transfer(insurees[msg.sender].balance);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable {
        require(airlines[msg.sender].isRegistered, "Airline not registered");
        airlines[msg.sender].balance = airlines[msg.sender].balance.add(
            msg.value
        );
        if (airlines[msg.sender].balance >= 10 ether) {
            airlines[msg.sender].votes = 1;
        }
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
        fund();
    }
}
