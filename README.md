
<PCName>
=========
maintained by [PandaClouds.com](https://pandaclouds.com)

`<PCName>` provides a clean way to validate data in Parse Sever Cloud Code.


Installation
------------

1. If you want to use this library, you first need to install the [Node.js](https://nodejs.org/en/).

2. When you install node.js, will also be installed [npm](https://www.npmjs.com/).

3. Please run the following command.

```
npm install --save @panda-clouds/<pc-name>
```

Keys
----
Problem:
It's a bad secuirty to commit our Stripe API Keys to this repo.

Solution:
we have devised a system for each user to create a .gitignored file called 'apiKeys.js' that contains your specific keys.
Run these commands to create the boiler plate "apiKeys.js" file.
Git should never ask you to commit this file.

1. open terminal.
2. cd /my/path/to/proj
3. `echo -e "module.exports = function() {\n\tprocess.env.STRIPE_SECRET_KEY = 'sk_test_123';\n\tprocess.env.STRIPE_CLIENT_ID = 'ca_123';\n\tprocess.env.STRIPE_REFRESH_TOKEN = 'rt_123';\n\tprocess.env.STRIPE_AUTH_CODE = 'ac_123';\n};\n" > apiKeys.js`
4. open the file and replace `sk_test_123` with your key, etc



Usage
-----

### Node.js

```javascript
const <PCName> = require('@panda-clouds/<pc-name>');

// example usage

```

You can replace <PCName> with any variable.


Methods
-------

[Unit Tests] are an additional resource for learning functionality.

### - mustExist()

requires the property to be set,
else throws error

Example:

```javascript
Parse.Cloud.beforeSave('Book', request =>{
	const data = new <PCName>(request);
	data.prop('title').mustExist();    // will throw Error if request.object.get('title') doesn't exist
});
```



Contributions
-------------

Pull requests are welcome! here is a checklist to speed things up:

- modify `<PCName>.js`
- add unit tests in `<PCName>.spec.js`
- run `npm test`
- document method in `README.md`
- add your name to 'Contributors' in `README.md`


### Contributors

(Add your name)

- [*] [Marc Smith](https://github.com/mrmarcsmith)


[Unit Tests]: https://github.com/panda-clouds/string/blob/master/spec/<PCName>.spec.js
