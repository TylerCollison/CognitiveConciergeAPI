/**
 * Author: Tyler Collison
 * 
 * This script is responsible for encapsulating all encryption operations with 
 * various utility methods for encyrption and decryption. This script leverages the 
 * Crypto library to provide the implementation of some common encryption algorithms. 
 */

const crypto = require("crypto");

//The number of times to re-hash
const HASH_COUNT = 1;
//The fixed salt for the hash
const SALT = "6wVTR31Z18";
//The encryption/decryption algorithm
const ENCRYPTION_ALGORITHM = "aes-256-cbc";
//Random key size
const RANDOM_KEY_SIZE = 50;

/**
 * Hashes the given raw password using MD5 with the specified variable salt
 * and the fixed salt. 
 * @param {The plaintext password to be hashed} rawPassword 
 * @param {The variable salt to apply to the password before hashing} variableSalt 
 */
function hashPassword(rawPassword, variableSalt) {
    //Concatenate the raw password with the salts
    var hashedPassword = rawPassword + variableSalt + SALT;
    //Hash the password the specified number of times
    for (var i = 0; i < HASH_COUNT; i++) {
        //Hash the password with MD5
        var hash = crypto.createHash("md5");
        hash.update(hashedPassword);
        hashedPassword = hash.digest("hex");
    }
    return hashedPassword;
}

/**
 * Encrypts the given data using the specified password as its key
 * @param {The data to be encrypted} data 
 * @param {The password to used as a key} password 
 */
function encrypt(data, password) {
    //Create the encryption cipher
    cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, password + "," + SALT);
    //Encrypt the data
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Decrypts the given data using the specified password as its key
 * @param {The data to be decrypted} data 
 * @param {The password to be used as a key} password 
 */
function decrypt(data, password) {
    //Create the decryption decipher
    decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, password + "," + SALT);
    //Decrypt the data
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Generates a cryptographically secure random key
 */
function generateSecureRandomKey() {
    return crypto.randomBytes(RANDOM_KEY_SIZE).toString('hex');
}

module.exports.hashPassword = hashPassword;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.generateSecureRandomKey = generateSecureRandomKey;