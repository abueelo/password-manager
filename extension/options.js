// Saves options to chrome.storage
const saveOptions = () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
  
    chrome.storage.local.set({ "username": username, "password": password },
      () => {
        // Update status to let user know options were saved.
        let status = document.getElementById('status');
        status.textContent = 'Attempted Logged In';
        status.style="color:green;"
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };
function clear(){
    chrome.storage.local.remove(["username","password"],
        () => {
          // Update status to let user know options were saved.
          let status = document.getElementById('status');
          status.textContent = 'Logged Out.';
          status.style="color:red;"
          setTimeout(() => {
            status.textContent = '';
          }, 750);
        }
      );
}

function add_entry(){
    let name = document.getElementById('name').value;
    let username = document.getElementById('username_new').value;
    let password = document.getElementById('password_new').value;
    let website = document.getElementById('website url').value;
    let notes = document.getElementById('notes').value;
    post_new_entry(username,password,website,name,notes);
}

function remove_entry(){
    let id = document.getElementById('id').value;
    post_remove_entry(id);
}

function create_account(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    post_new_account(username,password);
}


document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clear').addEventListener('click', clear);
document.getElementById('add_entry').addEventListener('click', add_entry);
document.getElementById('remove_entry').addEventListener('click', remove_entry);
document.getElementById('create_account').addEventListener('click', create_account);