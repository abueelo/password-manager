const CryptoJS = require("crypto-js");
const cryptography = require("./cryptography");
const http = require('http');

module.exports = {
    post: function(destination,path,data,request_type,UUID,callback){
        return POST(destination,path,data,request_type,UUID,callback);
    },
    handleResponse: function(response_data,key){
        return response(response_data,key);
    }
}
/* example data
{
    "request_type":"POST", //plain text
    "data":"---", //encrypted
    "UUID":"---" //plain text
}
*/
function POST(destination,path,data,request_type,UUID,callback){
    function OnResponse(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
            callback(data);
        });
    }
    var encrypted = data;//cryptography.pub_key_encrypt(data); //removed for testing
    //console.log(encrypted);
    const final_data = {"request_type":request_type,"data":encrypted,"UUID":UUID};
    //post it
    var urlparams = {
        host: destination,
        port: 9000,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    var request = http.request(urlparams, OnResponse);
    request.write(JSON.stringify(final_data));
    request.end();
}

function response(response_data,key){
    var decrypted = response_data;//cryptography.priv_key_decrypt(response_data,key); //removed for testing
    console.log(response_data);
    if(decrypted != null){
        var decryptedData = decrypted;
        return decryptedData;
    }else{
        return null
    }
}