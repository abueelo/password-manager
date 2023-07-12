const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const server_pub = `
` // add server public key here

module.exports = {
    server_pub: server_pub,
    encrypt: function (data,key) {
        return _encrypt(data,key)
    },
    decrypt: function (data,key) {
        return _decrypt(data,key)
    },
    pub_key_encrypt: function(data){
        return pubencrypt(data);
    },
    priv_key_decrypt: function(data,key){
        return privkeydecrypt(data,key);
    },
    hash: function(toHash){
        return _hash(toHash);
    },
    generate_key: function(uuid,master_password){
        return _hash(uuid.slice(0,5)+master_password.slice(3,5)+uuid+uuid.slice(5,10));
    }
};

function _hash(plainText){
    return crypto.createHash('sha256').update(plainText).digest('hex');
}

function _encrypt(plainObject,key) {
    return CryptoJS.AES.encrypt(JSON.stringify(plainObject),key).toString();
}

function _decrypt(encryptedText,key) {
  try{
    var bytes = CryptoJS.AES.decrypt(encryptedText,key);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  }catch{
    return null;
  }
}

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pubencrypt(plainObject) {
    plainText = JSON.stringify(plainObject);
    return crypto.publicEncrypt({
        key: server_pub,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    },
    // We convert the data string to a buffer
    Buffer.from(plainText)
    ).toString('base64')
}

function privkeydecrypt(encryptedText,key) {
  try{
    return JSON.parse(crypto.privateDecrypt(
      {
        key: key,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      base64ToArrayBuffer(encryptedText)
    ));
  }catch{
    return null;
  }
}

function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}