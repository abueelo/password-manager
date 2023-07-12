var request = true;
var username = "";

var uuid = "";
var password = "";
/*
chrome.storage.local.set({ "username": "test1@test.com" })
chrome.storage.local.set({ "password": "hi" })
*/

function collect_data(data){
    database = JSON.parse(data);;
    updateDatabase()
}

function saveUUID(data){
    uuid = data;
    chrome.storage.local.set({ "uuid": data })
    chrome.storage.local.get(["password"]).then((result) => {
        if(result == undefined || result == ""){
            request = false;
        }
        password = result.password;
        protocol.post("localhost","/request_data",{"email":username,"password":password},"GET",uuid,collect_data);
    });
}

function request_data(){
    chrome.storage.local.get(["username"]).then((result) => {
        if(result == undefined || result == ""){
            request = false;
        }
        username = result.username;
    });
    
    chrome.storage.local.get(["password"]).then((result) => {
        if(result == undefined || result == ""){
            request = false;
        }
        let password = result.password;
        protocol.post("localhost","/authenticate",{"email":username,"password":password},"GET","undefined",saveUUID);
    });
}

request_data();