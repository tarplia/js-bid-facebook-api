const fs = require('fs');
const devcert = require('devcert');

devcert.certificateFor('localhost')
.then(({key, cert}) => {
  console.log("got cert!");
  fs.writeFileSync('./certs/tls.key', key);
  fs.writeFileSync('./certs/tls.cert', cert);
})
.catch(console.error);
