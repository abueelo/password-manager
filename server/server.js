const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cryptography = require('./cryptography');
const protocol = require('./protocol');
const crypto = require('crypto');
const fs = require("fs")
const short = require('short-uuid');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const port = 9000;

/*
database example:
[
    [], --> every email being used by users for checking against
    {
        "salt": ...
        "email": ...
        "master_password": ... [hashed with salt]
        "UUID": ...
        "data": [
            {
                "username": ...
                "password": ...
                "website_url": ...
                "name": ...
                "note": ...
                "ID": short-uuid, [added after by the server]
            }, --> [encrypted with key that is gettable by both ends (some combination of UUID and master_password)]
            {
                ... [more of above]
            }
        ]
    },
    {
        ... [more of above]
    },
    ...
]
*/

function saveDatabase(data){
    fs.writeFileSync("data.base",cryptography.encrypt(data,"9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d"));
}

function loadDatabase(){
    return cryptography.decrypt(fs.readFileSync("data.base","utf-8"),"9b1deb4d3b7d4bad9bdd2b0d7b3dcb6d");
}

function validEmail(email){
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const database = loadDatabase();
    if(!emailRegexp.test(email) || database[0].includes(email)){ return false; }
    return true;
}

function findEntryBy(dictKey,desired){
    const database = loadDatabase();
    for (let index = 1; index < database.length; index++) {
        if(database[index][dictKey] == desired){ return database[index]; }
    }
}

function getIndexOf(dictKey,desired){
    const database = loadDatabase();
    for (let index = 1; index < database.length; index++) {
        if(database[index][dictKey] == desired){ return index; }
    }
}

app.get('/', (req, res) => {
    res.send('hallo');
});

app.post('/', (req, res) => {
    console.log(req.body)
    res.sendStatus(200);
});

app.get('/log_database',(req,res) => {
    console.log(loadDatabase());
    res.sendStatus(200);
})

app.post('/create_account', (req,res) => {
    console.log(req.body);
    let response = protocol.handleResponse(req.body.data,fs.readFileSync('private_key.pem', 'utf8'));
    if(req.body.request_type == undefined || req.body.request_type != "POST"){ res.sendStatus(400); return; }
    if(response.email == undefined){ res.sendStatus(400); return; }
    if(response.password == undefined){ res.sendStatus(400); return; }
    if(!validEmail(response.email)){ res.sendStatus(400); return; }

    //valid email and password
    const database = loadDatabase();
    let uuid = uuidv4();
    let salt = crypto.randomBytes(16).toString('base64')
    let password = cryptography.hash(response.password+salt);
    let email = response.email;

    let temp_entry = {
        "salt": salt,
        "email": email,
        "master_password": password,
        "UUID": uuid,
        "data": cryptography.encrypt([],cryptography.generate_key(uuid,response.password))
    }

    database[0].push(email);
    database.push(temp_entry);
    saveDatabase(database);
    res.sendStatus(200);
});

app.post('/request_data', (req,res) => {
    if(req.body.request_type != "GET"){ res.sendStatus(400); return; }
    let response = protocol.handleResponse(req.body.data,fs.readFileSync('private_key.pem', 'utf8'));
    let data = findEntryBy("email",response.email);
    if(data == undefined){ res.sendStatus(400); return; }
    if(data.master_password != cryptography.hash(response.password+data.salt)){ res.sendStatus(400); return; }

    let temp_data = cryptography.decrypt(data.data,cryptography.generate_key(req.body.UUID,response.password));
    console.log(temp_data);
    res.send(temp_data);
});

/*
app.post('/find_by', (req,res) => {
    console.log(req.body);
    res.send(findEntryBy(req.body.dictKey,req.body.desired));
});
*/

app.post('/add_entry', (req, res) => {
    if(req.body.request_type != "POST" || req.body.data == undefined || req.body.UUID == undefined){ res.sendStatus(400); return; }
    let response = protocol.handleResponse(req.body.data,fs.readFileSync('private_key.pem', 'utf8'));
    let database = loadDatabase();
    let data = findEntryBy("email",response.email);
    console.log(response.email);
    console.log(data);
    if(data == undefined){res.sendStatus(500); return; }
    if(data.master_password != cryptography.hash(response.password+data.salt)){ res.sendStatus(400); return; }
    
    let temp_entry = response.entry;
    temp_entry.ID = short.generate();
    let encrypted_entry = temp_entry;
    console.log(encrypted_entry);
    let temp_data = cryptography.decrypt(data.data,cryptography.generate_key(req.body.UUID,response.password));
    temp_data.push(encrypted_entry);
    let encrypted_data = cryptography.encrypt(temp_data,cryptography.generate_key(req.body.UUID,response.password));
    data.data = encrypted_data;

    database[getIndexOf("email",response.email)] = data;
    saveDatabase(database);
    res.sendStatus(200);
});

app.post('/remove_entry', (req, res) => {
    if(req.body.request_type != "POST" || req.body.data == undefined || req.body.UUID == undefined){ res.sendStatus(400); return; }
    let response = protocol.handleResponse(req.body.data,fs.readFileSync('private_key.pem', 'utf8'));
    let data = findEntryBy("email",response.email);
    console.log(data);
    if(data.master_password != cryptography.hash(response.password+data.salt)){ res.sendStatus(400); return; }
    let database = loadDatabase();
    let new_list = [];
    let temp_data = cryptography.decrypt(data.data,cryptography.generate_key(req.body.UUID,response.password));
    for (let entry = 0; entry < temp_data.length; entry++) {
        if(temp_data[entry].ID != response.ID){
            new_list.push(temp_data[entry]);
        }
    }
    let encrypted_new_list = cryptography.encrypt(new_list,cryptography.generate_key(req.body.UUID,response.password));
    data.data = encrypted_new_list;
    database[getIndexOf("email",response.email)] = data;
    saveDatabase(database);
    res.sendStatus(200);
});

app.post('/authenticate', (req, res) => {
    if(req.body.request_type != "GET" || req.body.data == undefined){ res.sendStatus(400); return; }
    let response = protocol.handleResponse(req.body.data,fs.readFileSync('private_key.pem', 'utf8'));
    let data = findEntryBy("email",response.email);
    let database = loadDatabase();
    if(data == undefined){ res.sendStatus(400); return; }
    //if(data.master_password != cryptography.hash(response.password+data.salt)){ res.sendStatus(401); return; } //removed for testing
    database[getIndexOf("email",response.email)] = data;
    saveDatabase(database);
    res.send(data.UUID);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

/*
for me --> needs to be able to import from a csv file so i can import from old password manager. then also i guess export probably to csv or something nicer. json??!?!?!?!? is very easy to do because the database is already in json


return the users UUID on login so you can send it along with the password to be added and encrypted

we then send that UUID along withm our payload.

data is decrypted, encrypted again for storage with some key yet to be figured out. most likely a mixture of UUID and password hashed
the server searches database with the UUID and then stores data accordingly

when we first login we request a copy of the database and we can sync it every so often to keep our copy up to date.
data is sent back and is encrypted with a key that is calculatable on both ends. refer to encryption on server side

data is presented to user and can be autofilled


--creating an account--

username, master password

make sure username isnt already in use (hashed without salt and compare againsts stored list of hashed usernames)
create account and generate a UUID and store it in plain text alongside an encrypted empty dict of login data (refer to earlier encryption)


*/