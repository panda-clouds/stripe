class PCStripe {
	constructor(secret) {
		this.secretKey = secret;
		this.stripe = require('stripe')(this.secretKey);
		// Pass the stripe secret key
	}

	static pass() {
	}

	static getStripeOAuthLink(clientId) {
		let link = 'https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=' + clientId;

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

	async getUserIdFromStripeRefresh(refresh) {
		const request = require('request-promise');
		const options = {
			method: 'POST',
			json: true,
			headers: {},
			uri: 'https://connect.stripe.com/oauth/token',
			body: { client_secret: this.secretKey,
				refresh_token: refresh,
				grant_type: 'refresh_token' },
		};

		const httpResponse = await request(options);

		return httpResponse;
	}

	async transferToConnectedAccount(dest_acct_id, payment_amount, group_id) {
		const transfer = await this.stripe.transfers.create({
			amount: payment_amount,
			currency: 'usd',
			destination: dest_acct_id,
			transfer_group: group_id,
		});

		return transfer;
	}

	async getOrCreateAccount(customer_id, email = null, metadata = null) {
		let customer = null;

		if (customer_id && customer_id.includes('cus')) {
			customer = await this.stripe.customers.retrieve(customer_id);
		}

		if (!customer) {
			customer = await this.stripe.customers.create({
				email: email ? email : 'n/a',
				metadata: metadata,
			});
		}

		return customer;
	}
}

module.exports = PCStripe;
