
const PCStripe = require('../src/PCStripe.js');

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
	const auth_code = 'ac_FBiuWezs8tNG2doKWIZEYc9E720ctf9L';

	it('should create the oauth link', async () => {
		expect.assertions(1);

		const join_link = await PCStripe.getStripeOAuthLink();

		expect(join_link).toContain('scope=read_write');
	});

	it('should fetch credentials from stripe', async () => {
		expect.assertions(7);
		const response = await PCStripe.getUserIdFromStripe(auth_code);

		console.log(response);

		expect(response.access_token).toContain('sk_test_');
		expect(response.livemode).toBe(false);
		expect(response.refresh_token).toContain('rt_');
		expect(response.token_type).toBe('bearer');
		expect(response.stripe_publishable_key).toContain('pk_test_');
		expect(response.stripe_user_id).toContain('acct_');
		expect(response.scope).toBe('read_write');
	});

	it('should make transfers', async () => {
		expect.assertions(1);

		const transfer = await PCStripe.transferToConnectedAccount()
	});
});
