// node module to generate crypto key
const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

    //Digest is a term in cryptography to access the hash
    return hash.digest('hex');

};
module.exports = cryptoHash;