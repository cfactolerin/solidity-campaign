const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory  = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;

let campaignAddress;
let campaign;

beforeEach(async() => {
	accounts = await web3.eth.getAccounts();

	factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
	                        .deploy({ data: compiledFactory.bytecode })
	                        .send({from: accounts[0], gas: '1000000'});

	await factory.methods.createCampaign('100')
	                     .send({from: accounts[0], gas: '1000000'});

	// [campaignAddress] is a syntax where it tells js that the call returns an array
	// and assign the first element to campaignAddress
	[campaignAddress] = await factory.methods.getDeployedCampaigns().call();

	// Create a new Campaign Contract using the created campaign in our local blockchain
	// by passing the campaignAddress as the second argument
	campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaigns', () => {
	it('deploys a factory and a campaign', () => {
		assert.ok(factory.options.address);
		assert.ok(factory.options.address);
	});

	it('should allow caller as the campaign manager', async () => {
		const manager = await campaign.methods.manager().call();
		assert.equal(manager, accounts[0]);
	});

	it('allows contribution and saves the sender as a contributor', async () => {
		await campaign.methods.contribute().send({
			from: accounts[1],
			gas: '1000000',
			value: 200
		});

		const isContributor = await campaign.methods.contributors(accounts[1]).call();
		assert(isContributor);
	});

	it('requires a minimum contribution', async () => {
		try {
			await campaign.methods.contribute().send({
				value: '5',
				from: accounts[1]
			});
			assert(false);
		} catch(err) {
			assert(err);
		}
	});

	it('should allow a manager to request for a payment', async () => {
		await campaign.methods
		              .createRequest('Pay office rent', '1000', accounts[1])
		              .send({
		              	from: accounts[0],
		              	gas: '1000000'
		              });
		const request = await campaign.methods.requests(0).call();
		assert.equal(request.description, 'Pay office rent');
	});

	it('processes requests', async () => {
		let oldBalance = await web3.eth.getBalance(accounts[2]);
		oldBalance = web3.utils.fromWei(oldBalance, 'ether');
		oldBalance = parseFloat(oldBalance);

		await campaign.methods.contribute().send({
			from: accounts[1],
			gas: '1000000',
			value: web3.utils.toWei('10', 'ether')
		});

		await campaign.methods
		              .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[2])
		              .send({ from: accounts[0], gas: '1000000'});

		await campaign.methods.approveRequest(0).send({
			from: accounts[1],
			gas: '1000000'
		});

		await campaign.methods.finalizeRequest(0).send({
			from: accounts[0],
			gas: '1000000'
		});


		const request = await campaign.methods.requests(0).call();
		assert(request.completed);

		let balance = await web3.eth.getBalance(accounts[2]);
		balance = web3.utils.fromWei(balance, 'ether');
		balance = parseFloat(balance);

		assert.equal(balance, (oldBalance + 5));


	});
	
});