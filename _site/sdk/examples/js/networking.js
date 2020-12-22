// Connection Management
function toggleConnection(){

    if (brains.network == undefined){
        if (['me'].includes(brains.username)){
            toggleLoginScreen();
        } else {
        document.getElementById("connection-button").innerHTML = 'Disconnect';
        if (window.innerWidth >= 768) {
            document.getElementById('id-params').style.display = `block`;
            document.getElementById('nBrains-params').style.display = `block`;
            document.getElementById('nInterfaces-params').style.display = `block`;
        }
        document.getElementById('access-mode-div').innerHTML = ` 
        <p id="access-mode" class="small">Public Mode</p>
        <label id="access-switch" class="switch">
            <input type="checkbox" onchange="toggleAccess()" checked>
            <span class="slider round"></span>
          </label>
          `
        brains.connect(url)
    }
    } else {
        brains.network.close()
        state = 1;
    }
}

async function login(type='guest'){
    let form = document.getElementById('login-form')
    let formDict = {}
    if (type === 'guest'){
        formDict.guestaccess = true
    } else {
        let formData = new FormData(form);
        for (var pair of formData.entries()) {
            formDict[pair[0]] = pair[1]; 
        }
        formDict.guestaccess = false
    }

        let resDict = await brains.login(formDict)
        if (resDict.result == 'OK'){
            document.getElementById('userId').innerHTML = brains.username
            form.reset()
            toggleLoginScreen();
            toggleConnection();
        } else {
            document.getElementById('login-message').innerHTML = resDict.msg
        }
}

async function signup(){
    let form = document.getElementById('signup-form')
    let formData = new FormData(form);
    let formDict = {}
    for (var pair of formData.entries()) {
        formDict[pair[0]] = pair[1]; 
    }

    if (formDict['username'] === ''){
        document.getElementById('signup-message').innerHTML = "username is empty. please try again."
    } else if (formDict['password'] ===''){
        document.getElementById('signup-message').innerHTML = "password is empty. please try again."
    }  else if (formDict['password'] !== formDict['confirm-password']) {
            document.getElementById('signup-message').innerHTML = "passwords don't match. please try again."
    }
    else {

        let resDict = await brains.signup(formDict);
        if (resDict.result == 'OK'){
            form.reset()
            toggleLoginScreen();
            toggleSignUpScreen();
        } else {
            document.getElementById('signup-message').innerHTML = resDict.msg
        }
    }
}

// Request Handling
async function clientAction(destination,method,data={}){

    let formData  = JSON.stringify(data)

    return await fetch(url + destination, 
        { method: method,
        mode: 'cors',
        // credentials: 'include',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }),
        body: formData
    }).then((res) => handleResponse(res))
        .then((message) => {
            showMessage(message); 
            return message})
        .catch(function (err) {
            showMessage(err.message);
        });}

function handleResponse(res) {
    return res.ok
        ? res.json().then((data) => data)
        : Promise.reject(new Error('Unexpected response'));
}

function showMessage(message) {
    console.log(`\n${message}`);
}

// Cookies
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(req,name) {
    const value = `; ${req.headers.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}