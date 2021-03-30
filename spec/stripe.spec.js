try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

const PCStripe = require('../src/PCStripe.js');
const myStripe = new PCStripe(process.env.STRIPE_SECRET_KEY);
const globalStripe = new PCStripe(process.env.STRIPE_GLOBAL_SECRET_KEY);
const expYear = 2050;

// The OAuth Workflow requires UI intervention
// Follow these steps to generate an auth Code
//
// 1. go to
// const url = 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=' +
// process.env.STRIPE_CLIENT_ID
// '&scope=read_write'
// 2. in the top banner press "Skip this account form"
// 3. grab the "ac_bla" token from the page and replace the "auth_code" variable below v
// 4. run the tests

describe('test OAuth', () => {
	const refreshToken = process.env.STRIPE_REFRESH_TOKEN;
	const auth_code = process.env.STRIPE_AUTH_CODE;
	let account_id;
	let customer_id;
	let global_customer;
	let token;

	xit('should fetch credentials from stripe', async () => {
		expect.assertions(7);
		const response = await myStripe.getUserIdFromStripe(auth_code);

		console.log(response);

		expect(response.access_token).toContain('sk_test_');
		expect(response.livemode).toBe(false);
		expect(response.refresh_token).toContain('rt_');
		expect(response.token_type).toBe('bearer');
		expect(response.stripe_publishable_key).toContain('pk_test_');
		expect(response.stripe_user_id).toContain('acct_');
		account_id = response.stripe_user_id;
		expect(response.scope).toBe('read_write');
	});

	it('should create the oauth link', async () => {
		expect.assertions(1);

		const join_link = await PCStripe.getStripeOAuthLink();

		expect(join_link).toContain('scope=read_write');
	});

	// Test cannot run with stripes system without human interviention and is disabled for production test suites.
	xit('should fetch credentials from stripe using refresh', async () => {
		expect.assertions(7);
		const response = await myStripe.getUserIdFromStripeRefresh(refreshToken);

		console.log(response);

		expect(response.access_token).toContain('sk_test_');
		expect(response.livemode).toBe(false);
		expect(response.refresh_token).toContain('rt_');
		expect(response.token_type).toBe('bearer');
		expect(response.stripe_publishable_key).toContain('pk_test_');
		expect(response.stripe_user_id).toContain('acct_');
		account_id = response.stripe_user_id;
		expect(response.scope).toBe('read_write');
	});

	xit('should make transfers', async () => {
		expect.assertions(2);

		// comment
		const transfer = await myStripe.transferToConnectedAccount(account_id, 350, 'parent_job_id');

		// transfer is
		// {"amount": 350, "amount_reversed": 0, "balance_transaction": "txn_123", "created": 1560202092, "currency": "usd", "description": null, "destination": "acct_123", "destination_payment": "py_123", "id": "tr_123", "livemode": false, "metadata": {}, "object": "transfer", "reversals": {"data": [], "has_more": false, "object": "list", "total_count": 0, "url": "/v1/transfers/tr_123/reversals"}, "reversed": false, "source_transaction": null, "source_type": "card", "transfer_group": "parent_job_id"}
		expect(transfer.amount).toBe(350);
		expect(transfer.balance_transaction).toContain('txn_');
	});

	describe('getOrCreateAccount', () => {
		it('should create customers', async () => {
			expect.assertions(1);

			const customer = await myStripe.getOrCreateAccount(null, 'spec@mindmissiles.com', { name: 'first last' });

			customer_id = customer.id;

			expect(customer).toBeDefined();
		});

		it('should be able to retrieve that customer', async () => {
			expect.assertions(1);

			const customer = await myStripe.getOrCreateAccount(customer_id);

			expect(customer.id).toBe(customer_id);
		});

		it('should fill in an email with default if none is provided', async () => {
			expect.assertions(1);

			const customer = await myStripe.getOrCreateAccount();

			expect(customer.email).toBe('n/a');
		});
	});

	describe('getAccount', () => {
		it('should not create a customer', async () => {
			expect.assertions(1);

			await expect(myStripe.getAccount(null)).rejects.toThrow('Unable to locate customer in stripe');
		});

		it('should be able to retrieve the customer with getAccount', async () => {
			expect.assertions(1);

			const customer = await myStripe.getAccount(customer_id);

			expect(customer.id).toBe(customer_id);
		});
	});

	describe('addPaymentToken', () => {
		let global_token = null;

		it('should create a global customer', async () => {
			expect.assertions(1);

			global_customer = await globalStripe.getOrCreateAccount('', 'spec@mindmissiles.com', { name: 'first last' });

			expect(global_customer).toBeDefined();
		});

		it('should add a credit card', async () => {
			expect.assertions(1);

			global_token = await globalStripe.stripe.tokens.create({
				card: {
					number: '4242424242424242',
					exp_month: 12,
					exp_year: expYear,
					cvc: '123',
				},
			});

			expect(global_token).toBeDefined();
		});

		it('should add the card to the customer.', async () => {
			expect.assertions(1);

			const source = await globalStripe.addPaymentToken(global_token.id, global_customer.id, true);

			expect(source).toBeDefined();
		});
	});

	describe('createCustomerToken', () => {
		it('should error if the customer doesnt have a payment', async () => {
			expect.assertions(1);

			const no_payment = await globalStripe.getOrCreateAccount('', 'nopayment@spec.com');

			await expect(globalStripe.createCustomerToken(no_payment.id, process.env.STRIPE_ACCOUNT_NUMBER)).rejects.toThrow('No payment source.');
		});

		it('should create a customer token', async () => {
			expect.assertions(1);

			token = await globalStripe.createCustomerToken(global_customer.id, process.env.STRIPE_ACCOUNT_NUMBER);

			expect(token).toBeDefined();
		});
	});

	xdescribe('updateCustomerWithToken', () => {
		it('should update the customer with the token', async () => {
			expect.assertions(1);

			await myStripe.updateCustomerWithToken(customer_id, token.id);

			expect(true).toBe(true);
		});
	});

	xdescribe('createCharge', () => {
		it('should create a charge', async () => {
			expect.assertions(1);

			const charge = await myStripe.createCharge({
				amount: 350,
				currency: 'usd',
				customer: customer_id,
			}, {
				stripe_account: process.env.STRIPE_ACCOUNT_NUMBER,
			});

			expect(charge).toBeDefined();
		});
	});

	describe('processStripeError', () => {
		async function createTestUser(email, num, exp_month, exp_year, cvc) {
			// create the user
			const customer = await globalStripe.getOrCreateAccount('', email);

			let card;

			try {
				// give them a card.
				card = await globalStripe.stripe.tokens.create({
					card: {
						number: num,
						exp_month: exp_month,
						exp_year: exp_year,
						cvc: cvc,
					},
				});
			} catch (e) {
				globalStripe.processStripeError(e);
			}

			// add the card to the customer
			await globalStripe.addPaymentToken(card.id, customer.id, true);

			return customer;
		}

		it('should error w global if no email is provided', async () => {
			expect.assertions(1);

			await expect(globalStripe.getOrCreateAccount()).rejects.toThrow('Invalid email address');
		});

		it('should error if theres no card', async () => {
			expect.assertions(1);

			const global_acct = await globalStripe.getOrCreateAccount(null, 'nocard@spec.com');

			await expect(globalStripe.createCustomerToken(global_acct.id, process.env.STRIPE_ACCOUNT_NUMBER)).rejects.toThrow('No payment source.');
		});

		it('should error if the card was declined', async () => {
			expect.assertions(1);

			await expect(createTestUser('declined@spec.com', '4000000000000002', 12, expYear, 123)).rejects.toThrow('Payment declined');
		});

		it('should error if the card is expired', async () => {
			expect.assertions(1);

			await expect(createTestUser('expired@spec.com', '4000000000000069', 12, expYear, 123)).rejects.toThrow('Card has expired');
		});

		it('should error if the cvc is incorrect', async () => {
			expect.assertions(1);

			await expect(createTestUser('incorrect@spec.com', '4000000000000127', 12, expYear, 123)).rejects.toThrow('CVC does not match');
		});

		it('should error if the card number is invalid', async () => {
			expect.assertions(1);

			await expect(createTestUser('declined@spec.com', '4242424242424241', 12, expYear, 123)).rejects.toThrow('Invalid card number');
		});

		it('should error if there was a processing error', async () => {
			expect.assertions(1);

			await expect(createTestUser('processing@spec.com', '4000000000000119', 12, expYear, 123)).rejects.toThrow('Error processing payment');
		});
	});
});
