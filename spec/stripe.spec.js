
const PCStripe = require('../src/PCStripe.js');

try {
	require('../apiKeys.js')();
} catch (e) {
	// It's ok if we don't load the keys from the apiKeys file
	// In CI we load directly
}

describe('test OAuth', () => {
	it('should ', () => {
		expect.assertions(1);
		expect(3).toBe(3);
		PCStripe.pass();
	});
});
