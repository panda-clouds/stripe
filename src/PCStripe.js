class PCStripe {
	constructor(secret) {
		this.secretKey = secret;
		this.stripe = require('stripe')(this.secretKey);
		// Pass the stripe secret key
	}

	static pass() {
	}

	static getStripeOAuthLink(clientId) {
		const link = 'https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=' + clientId;

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

	async getAccount(customer_id = null) {
		let customer = null;

		try {
			if (customer_id && customer_id.includes('cus')) {
				customer = await this.stripe.customers.retrieve(customer_id);
			}
		} catch (e) {
			this.processStripeError(e);
		}

		if (!customer) {
			throw new Error('Unable to locate customer in stripe');
		}

		return customer;
	}

	async getOrCreateAccount(customer_id = null, email = null, metadata = null) {
		let customer = null;

		try {
			if (customer_id && customer_id.includes('cus')) {
				// New Stripe API doesn't include sources or subscriptions which we need
				customer = await this.stripe.customers.retrieve(customer_id, { expand: ['sources', 'subscriptions'] });
			}

			if (!customer) {
				customer = await this.stripe.customers.create({
					email: email ? email : 'n/a',
					metadata: metadata,
				}, { expand: ['sources', 'subscriptions'] });
			}

			return customer;
		} catch (e) {
			this.processStripeError(e);
		}
	}

	async createCustomerToken(global_id, stripe_acct_num) {
		let token = null;

		try {
			token = await this.stripe.tokens.create({
				customer: global_id,
			}, {
				stripeAccount: stripe_acct_num,
			});

			return token;
		} catch (e) {
			this.processStripeError(e);
		}
	}

	async updateCustomerWithToken(customer_id, token_id) {
		try {
			await this.stripe.customers.update(customer_id, { source: token_id });
		} catch (e) {
			this.processStripeError(e);
		}
	}

	async createCharge(details, options, never) {
		let charge = null;

		// TODO: remove after transition
		if (never) {
			throw Error('Please update PCStripe');
		}

		try {
			charge = await this.stripe.charges.create(details, options);

			return charge;
		} catch (e) {
			this.processStripeError(e);
		}
	}

	async addPaymentToken(token_id, customer_id, is_default) {
		let source = null;

		try {
			source = await this.stripe.customers.createSource(customer_id, {
				source: token_id,
			});

			if (is_default) {
				await this.stripe.customers.update(customer_id, {
					default_source: source.id,
				});
			}

			return source;
		} catch (e) {
			this.processStripeError(e);
		}
	}

	processStripeError(e) {
		if (e) {
			switch (e.code) {
				case 'email_invalid':
					throw Error('Invalid email address');
				case 'card_declined':
					throw Error('Payment declined');
				case 'expired_card':
					throw Error('Card has expired');
				case 'incorrect_cvc':
					throw Error('CVC does not match');
				case 'incorrect_number':
					throw Error('Invalid card number');
				case 'processing_error':
					throw Error('Error processing payment');
				default:
					if (e.message === 'The customer must have an active payment source attached.') {
						throw Error('No payment source.');
					}

					console.log(e);
					throw Error('unhandled error');
			}
		}
	}
}

module.exports = PCStripe;
