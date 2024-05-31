
//Checking the crypto module
const { exception } = require('console');

const Cryptr = require('cryptr');
const cryptr = new Cryptr('#&$^');

//Encrypting text
function encrypt(text) {

    return new Promise((res, rej) => {
        try {
            res(cryptr.encrypt(text))
        } catch (error) {
            rej(error)
        }
    })

}

// Decrypting text
function decrypt(text) {
    return new Promise((res, rej) => {
        try {
            res(cryptr.decrypt(text))
        } catch (error) {
            rej(error)
        }
    })
}

module.exports = { encrypt, decrypt };