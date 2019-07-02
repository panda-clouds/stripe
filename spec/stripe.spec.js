try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

const PCStripe = require('../src/PCStripe.js');
const myStripe = new PCStripe(process.env.STRIPE_SECRET_KEY);


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
	it('should fetch credentials from stripe using refresh', async () => {
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

	it('should make charges', async () => {
		expect.assertions(2);

		const charge = await myStripe.chargeConnectedAccount(account_id, 420, 'charge_spec', 'used in charge spec');

		console.log('charge: ' + JSON.stringify(charge));

		expect(charge.amount).toBe(420);
		expect(charge.balance_transaction).toContain('txn_');
	});
});
