import Web3 from 'web3';

let web3;

// Use metamask provider
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
	web3 = new Web3(window.web3.currentProvider);
} else {
	const provider = new Web3.providers.HttpProvider(
		'https://rinkeby.infura.io/BAfm7CdvxBX1NfHVevYk'
	);
	web3 = new Web3(provider);
}

export default web3;