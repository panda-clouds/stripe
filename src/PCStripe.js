class PCStripe {
	constructor(secret) {
		this.secretKey = secret;
		this.stripe = require('stripe')(this.secretKey);
		// Pass the stripe secret key
	}

	static pass() {
	}

	static async getStripeOAuthLink(clientId) {
		let link = 'https://connect.stripe.com/oauth/authorize?response_type=code?client_id=' + clientId;

		// set scope
		link += '&scope=read_write';

		// TODO: integrate redirect_uri

		return link;
	}

	async getUserIdFromStripe(auth_code) {
		const request = require('request-promise');
		const options = {
			method: 'POST',
			json: true,
			headers: {},
			uri: 'https://connect.stripe.com/oauth/token',
			body: { client_secret: this.secretKey,
				code: auth_code,
				grant_type: 'authorization_code' },
		};

		const httpResponse = await request(options);

		return httpResponse;
	}

	async chargeConnectedAccount(src_acct_id, charge_amount, batch_id) {
		

		const charge = await this.stripe.charges.create({
			amount: charge_amount,
			currency: "usd",
			source: "tok_visa",
			transfer_group: batch_id
		});

		return charge;
	}

	async transferToConnectedAccount(dest_acct_id, payment_amount, group_id) {

		const transfer = await this.stripe.transfers.create({
			amount: payment_amount,
			currency: "usd",
			destination: dest_acct_id,
			transfer_group: group_id
		});

		return transfer;
	}
}

module.exports = PCStripe;
