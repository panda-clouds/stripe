class PCStripe {
	constructor() {
		// Empty Constructor
	}

	static pass() {
	}

	static getUserIdFromSTripe(auth_code, client_secret) {
		const request = require('request-promise'); 
		const options = {
				method: 'POST',
				json: true,
				headers: {
				 'Content-Type': 'application/json',
				 'Authorization': 'Bearer ' + process.env.BLA,
				},
				uri: 'https://connect.stripe.com/oauth/token',
				body: { client_secret: client_secret, 
					code: auth_code,
					grant_type: 'authorization_code'},
			};
		
		const httpResponse = await request(options);

		return httpResponse;
	}
}

module.exports = PCStripe;
