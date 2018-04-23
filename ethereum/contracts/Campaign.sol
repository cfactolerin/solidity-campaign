pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimumContribution) public {
        address campaign = new Campaign(minimumContribution, msg.sender);
        deployedCampaigns.push(campaign);
    }
    
    function getDeployedCampaigns() public view returns(address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request {
        /**
         * Describe why the request has been created 
         */
        string description;
        
        /**
         * Amount of money the manager wants to send to a vendor
         */ 
        uint value;
        
        /**
         * Address where the money will be sent to
         */
        address recipient;
         
         /**
          * True if the money has been sent
          */ 
        bool completed;
        
        /**
         * Contains the number of people who approved the Request
         */
        uint approvalCount;
        
        /**
         * Contains the address that approved the request
         */
        mapping(address => bool) approvals;
    }
    
    address public manager;
    uint public minimumContribution;
    Request[] public requests;  // List of request from the manager that needs to be approved.
    mapping(address => bool) public contributors;
    uint public totalContributors;
    
    modifier managerOnly() {
        require(msg.sender == manager);
        _;
    }
    
    function Campaign(uint minimum, address creator) public { 
        manager = creator;
        minimumContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value >= minimumContribution);
        contributors[msg.sender] = true;
        totalContributors++;
    }
    
    function createRequest(string description,
                           uint value,
                           address recipient)
             public managerOnly {

        Request memory newRequest = Request({
           description: description,
           value: value,
           recipient: recipient,
           completed: false,
           approvalCount: 0
        });

        requests.push(newRequest);
    }
    
    function approveRequest(uint requestIdx) public {
        Request storage request = requests[requestIdx];
        require(contributors[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint requestIdx) public managerOnly {
        Request storage request = requests[requestIdx];
        
        require(!request.completed);
        require(request.approvalCount > (totalContributors/2));
        
        request.recipient.transfer(request.value);
        request.completed = true;
    }
}