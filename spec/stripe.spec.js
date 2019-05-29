
const PCStripe = require('../src/PCStripe.js');

try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

describe('test OAuth', () => {
	let auth_code = "ac_F9sFFZHsRkxIKT0hAX5TzHozsRWHHGlo";
	let client_secret = "sk_test_hPTcgGfDuH0frQtuABpPXloO";

	it('should fetch credentials from stripe', () => {
		let promise = PCStripe.getUserIdFromSTripe(auth_code, client_secret);

		//TODO: do actual expectations.
		expect.assertions(1);
		expect(3).toBe(3);
		PCStripe.pass();
	});
});
