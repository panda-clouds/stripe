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

	static async chargeConnectedAccount(src_acct_id, charge_amount, batch_id) {
		const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

		const charge = await stripe.charges.create({
			amount: charge_amount,
			currency: "usd",
			source: "tok_visa",
			transfer_group: batch_id
		});

		return charge;
	}

	static async transferToConnectedAccount(dest_acct_id, payment_amount, group_id) {
		const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

		const transfer = await stripe.transfers.create({
			amount: payment_amount,
			currency: "usd",
			destination: dest_acct_id,
			transfer_group: group_id
		});

		return transfer;
	}
}

module.exports = PCStripe;
