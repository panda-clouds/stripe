
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
// 1. go to https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_F9qAHcnb9ICmtKU8Ra6JLX3LXgdGDKKe&scope=read_write
// 2. in the top banner press "Skip this account form"
// 3. grab the "ac_bla" token from the page and replace the "auth_code" variable below v
// 4. run the tests

describe('test OAuth', () => {
	const auth_code = 'ac_F9sFFZHsRkxIKT0hAX5TzHozsRWHHGlo';
	const client_secret = 'sk_test_hPTcgGfDuH0frQtuABpPXloO';

	it('should fetch credentials from stripe', async () => {
		expect.assertions(2);
		const response = await PCStripe.getUserIdFromStripe(auth_code, client_secret);

		// TODO: finish actual expectations.
		console.log(response);
		console.log(JSON.stringify(response));

		expect(response.stripe_publishable_key).stringContaining('pk_test_');
		expect(response.token_type).toBe('bearer');
	});
});
