function response(data){
    document.getElementById("result").innerHTML = data;
}
/*
"entry":{
            "username": ...
            "password": ...
            "website_url": ...
            "name": ...
            "note": ...
        }
*/

function post_new_entry(_username,_password,website_url,name,note){
    chrome.storage.local.get(["username", "password", "uuid"]).then((result) => {
        protocol.post("localhost","/add_entry",{"email":result.username,"password":result.password,"entry":{"username":_username,"password":_password,"website_url":website_url,"name":name,"note":note}},"POST",result.uuid,response);
    })
}

function post_remove_entry(id){
    chrome.storage.local.get(["username", "password", "uuid"]).then((result) => {
        protocol.post("localhost","/remove_entry",{"email":result.username,"password":result.password,"ID":id},"POST",result.uuid,response);
    })
}

function post_new_account(username,password){
    saveOptions();
    protocol.post("localhost","/create_account",{"email":username,"password":password},"POST","undefined",response);
    window.close()
}