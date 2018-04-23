const HDWalletProvider 	= require('truffle-hdwallet-provider');
const Web3 			   	= require('web3');

const compiledFactory = require('./build/CampaignFactory.json');

const mnemonics = ''; // Set the mnemonics here if you want to deploy

if (mnemonics == '') {
	console.log("Mnemonics is not yet set");
} else {
	console.log('Deploying from account: ', accounts[0]);

	const provider 	= new HDWalletProvider(mnemonics,
					  				   'https://rinkeby.infura.io/BAfm7CdvxBX1NfHVevYk');
	const web3		= new Web3(provider);

	const deploy = async() => {
		accounts = await web3.eth.getAccounts();
		const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
						.deploy({ data: compiledFactory.bytecode, arguments: [] })
						.send({ from: accounts[0], gas: '1000000' });
		console.log('Contract deployed to: ', result.options.address);
	};

	deploy();
}
