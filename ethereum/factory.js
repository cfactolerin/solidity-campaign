import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json'

const instance = new web3.eth.Contract(JSON.parse(CampaignFactory.interface), 
	                                   '0xB39d8C830b2c264d780DaB6dC0a4DC4a7D030d0B');

export default instance;