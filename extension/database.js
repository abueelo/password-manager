/*
const entry_template = `
<div class="entry">
    <h2 class="thin">${entry_name}</h2>
    <h3>${email} - ${password}</h3>
</div>
`;
*/

var database = [

]

function similarity(s1, s2) { //stolen from stackoverflow [https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely - credit "overlord1234"]
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

var passwords = {
    //id : "password",
}

function show(id){
    document.getElementById(id).innerHTML = passwords[id];
}

function hide(password){
    let val = "";
    for (let i = 0; i < password.length; i++) {
        val+="*"
    }
    return val
}

function _hide(password,id){
    let val = "";
    for (let i = 0; i < password.length; i++) {
        val+="*"
    }
    document.getElementById(id).innerHTML = val;
}

function updateDatabase(){
    let output = ``;
    let id = 0
    var ids = []
    database.forEach(entry => {
        var entry_template = `
            <div style="margin-top: -10px;" class="entry">
            <h2 style="margin-bottom: -4px;"class="thin">${entry.name}</h2>
            <h3 style="margin-top: 6px;">${entry.username} - <span id=${id}>${hide(entry.password)}</span><button id="show${id}">show</button></h3>
            <p style="margin-top: -14px;">ID: ${entry.ID}<p>
            </div>
            `;
        if(document.getElementById("search").value != ""){
            if(similarity(document.getElementById("search").value,entry.name) >= 0.1 || similarity(document.getElementById("search").value,entry.username) >= 0.1){
                ids.push(id);
                output+=entry_template;
                passwords[id] = entry.password
            }
        }else{
            ids.push(id);
            output+=entry_template;
            passwords[id] = entry.password
        }
        id++;      
    });

    if(database.length == 0){
        output = "";
    }
    document.getElementById("data").innerHTML = output;
}

document.body.addEventListener( 'click', function ( event ) {
    if(event.target.id.startsWith("show")){
        console.log(event.target.id);
        show(event.target.id.replace("show",""));
        event.target.innerHTML = "hide";
        event.target.id = "hide"+event.target.id.replace("show","")
    }else if(event.target.id.startsWith("hide")){
        _hide(passwords[Number(event.target.id.replace("hide",""))],event.target.id.replace("hide",""));
        event.target.innerHTML = "show";
        event.target.id = "show"+event.target.id.replace("hide","")
    }
});

document.getElementById("search").addEventListener("change", updateDatabase);