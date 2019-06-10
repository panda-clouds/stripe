
const PCStripe = require('../src/PCStripe.js');
const myStripe = new PCStripe('sk_test_hPTcgGfDuH0frQtuABpPXloO');

try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

// The OAuth Workflow requires UI intervention
// Follow these steps to generate an auth Code
//
// 1. go to
// https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_F9qAHcnb9ICmtKU8Ra6JLX3LXgdGDKKe&scope=read_write
// 2. in the top banner press "Skip this account form"
// 3. grab the "ac_bla" token from the page and replace the "auth_code" variable below v
// 4. run the tests

describe('test OAuth', () => {
	// const auth_code = 'ac_FBiuWezs8tNG2doKWIZEYc9E720ctf9L';
	const refreshToken = 'rt_FENTYwbxoKbaLMsPtfQmrNbJzeAvXd2qyOVkUh2AzGbQigzU';
	let account_id;

	it('should create the oauth link', async () => {
		expect.assertions(1);

		const join_link = await PCStripe.getStripeOAuthLink();

		expect(join_link).toContain('scope=read_write');
	});

	// Test cannot run with stripes system without human interviention and is disabled for production test suites.
	it('should fetch credentials from stripe', async () => {
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

	it('should make transfers', async () => {
		expect.assertions(2);

		// comment
		const transfer = await myStripe.transferToConnectedAccount(account_id, 350, 'parent_job_id');

		// transfer is
		// {"amount": 350, "amount_reversed": 0, "balance_transaction": "txn_1Ejv2GL54TAiok0DXZAFspzV", "created": 1560202092, "currency": "usd", "description": null, "destination": "acct_1EjuhUKT5Kn7XEO2", "destination_payment": "py_1Ejv2HKT5Kn7XEO2pQWHYKQT", "id": "tr_1Ejv2GL54TAiok0DP8DMglnZ", "livemode": false, "metadata": {}, "object": "transfer", "reversals": {"data": [], "has_more": false, "object": "list", "total_count": 0, "url": "/v1/transfers/tr_1Ejv2GL54TAiok0DP8DMglnZ/reversals"}, "reversed": false, "source_transaction": null, "source_type": "card", "transfer_group": "parent_job_id"}
		expect(transfer.amount).toBe(350);
		expect(transfer.balance_transaction).toContain('txn_');
	});
});
