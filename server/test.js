const cryptography = require("./cryptography");
const fs = require('fs');

let data = cryptography.pub_key_encrypt({"email":"test1@test.com","password":cryptography.hash("hi")});
console.log(cryptography.priv_key_decrypt(data,fs.readFileSync("private_key.pem")));