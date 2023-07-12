const { generateKey } = require("crypto");
const cryptography = require("./cryptography");
const protocol = require("./protocol");
const fs = require("fs")

var uuid = null;
var database = null;
var decryptedDatabase = null;

function response(data){
    console.log(data);
}

function storeUUID(_uuid){
    uuid = _uuid;
}

function storeDatabase(data){
    if(data != null){database = JSON.parse(data);}else{database = data}
    console.log(database);
}

function attemptDecrypt(){
    if(uuid != null && database != null){
        decryptedDatabase = [];
        for (let item = 0; item < database.length; item++) {
            decryptedDatabase.push(cryptography.decrypt(database[item],cryptography.generate_key(uuid,"hi")));
            //decryptedDatabase.push(cryptography.decrypt(database[item],cryptography.generate_key(uuid,"hello")));
        }
        console.log(decryptedDatabase);
        clearInterval(decryption);
    }
}

function add_entry(){
    if(uuid != null){
        //protocol.post("localhost","/add_entry",{"email":"test1@test.com","password":"hi","entry":entry},"POST",uuid,response);
        protocol.post("localhost","/add_entry",{"email":"test2@test.com","password":"hello","entry":entry},"POST",uuid,response);
        clearInterval(entry_addition);
    }
}

function req_data(){
    if(uuid != null){
        protocol.post("localhost","/request_data",{"email":"test1@test.com","password":"hi"},"GET",uuid,storeDatabase);
        clearInterval(req_dat);
    }
}

function remove_entry(){
    if(uuid != null){
        protocol.post("localhost","/remove_entry",{"email":"test1@test.com","password":"hi","ID":entry_id},"POST",uuid,response);
        clearInterval(entry_subtraction);
    }
}

//clear database
fs.writeFileSync("data.base",cryptography.encrypt([[]],"9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d"));


//protocol.post("localhost","/find_by",{"dictKey":"email","desired":"test1@test.com"},"POST","undefined")

//create_account
//protocol.post("localhost","/create_account",{"email":"test1@test.com","password":"hi"},"POST","undefined",response)
//protocol.post("localhost","/create_account",{"email":"test2@test.com","password":"hello"},"POST","undefined",response)

//authenticate
//protocol.post("localhost","/authenticate",{"email":"test1@test.com","password":"hi"},"GET","undefined",storeUUID);
//protocol.post("localhost","/authenticate",{"email":"test2@test.com","password":"hello"},"GET","undefined",storeUUID);

//add_entry
let entry = {
        "username": "test2@test.com",
        "password": "hi",
        "website_url": "google.com",
        "name": "yahoo login",
        "note": "",
}
//var entry_addition = setInterval(add_entry,100);

//request_data
//var req_dat = setInterval(req_data,100);
//protocol.post("localhost","/request_data",{"email":"test2@test.com","password":"hello"},"GET","undefined",storeDatabase);
//var decryption = setInterval(attemptDecrypt, 100);

//remove_entry
//let entry_id = "7xGnZZvWuiTt6pcEt62b1G";
//var entry_subtraction = setInterval(remove_entry,100);