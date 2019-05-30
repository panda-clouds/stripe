class PCStripe {
	constructor() {
		// Empty Constructor
	}

	static pass() {
	}

	static async getStripeOAuthLink() {
		let link = 'https://connect.stripe.com/oauth/authorize?response_type=code?client_id=' + await this.getStripeClientId();

		// set scope
		link += '&scope=read_write';

		// TODO: integrate redirect_uri

		return link;
	}

	// TODO: grab client id from db.
	static getStripeClientId() {
		return new Promise(resolve => {
			resolve('ca_F9qAHcnb9ICmtKU8Ra6JLX3LXgdGDKKe');
		});
	}

	static async getUserIdFromStripe(auth_code) {
		// get client secret
		const client_secret = await this.getClientSecret();

		const request = require('request-promise');
		const options = {
			method: 'POST',
			json: true,
			headers: {},
			uri: 'https://connect.stripe.com/oauth/token',
			body: { client_secret: client_secret,
				code: auth_code,
				grant_type: 'authorization_code' },
		};

		const httpResponse = await request(options);

		return httpResponse;
	}

	// TODO: grab secret key from db.
	static getClientSecret() {
		return new Promise(resolve => {
			resolve('sk_test_hPTcgGfDuH0frQtuABpPXloO');
		});
	}
}

module.exports = PCStripe;
