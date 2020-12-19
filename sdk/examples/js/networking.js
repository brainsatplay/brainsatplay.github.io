// Connection Management
function toggleConnection(){


    if (ws == undefined){
        if (userId == undefined) {
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
        initializeWebsocket();
        brains.users.clear();
        brains.add('me');
        stateManager()
        generate = false;
    }
    } else {
        ws.close()
        userId = undefined;
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

        let resDict = await clientAction('login','POST', formDict);
        if (resDict.result == 'OK'){
            userId = resDict.msg;
            document.getElementById('userId').innerHTML = userId
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
        let resDict = await clientAction('signup','POST', formDict);
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

// Websockets

function initializeWebsocket(){
    if (ws) {
        ws.onerror = ws.onopen = ws.onclose = null;
        ws.close();
    }

    if (url.protocol == 'http:'){
    ws = new WebSocket(`ws://` + url.hostname,[userId, 'interfaces']);
    } else if (url.protocol == 'https:'){
        ws = new WebSocket(`wss://` + url.hostname,[userId, 'interfaces']);
    } else{
        console.log('invalid protocol')
        return
    }

    ws.onerror = function () {
        showMessage('WebSocket error');
        announcement('WebSocket error.\n Please refresh your browser and try again.');
    };

    ws.onopen = function () {
        showMessage('WebSocket connection established')
        initializeBrains()
    };

    ws.onmessage = function (msg) {
        let obj = JSON.parse(msg.data);
        if (obj.destination == 'chat'){
            $('#messages').append($('<li>').text(obj.msg));
        }
        else if (obj.destination == 'bci'){
            if (brains.users.get(obj.id) != undefined){
                brains.users.get(obj.id).streamIntoBuffer(obj.data)
            } 
            updateChannels(brains.getMaxChannelNumber())

        } else if (obj.destination == 'init'){

            brains.users.clear()

            if (obj.privateBrains && public === false){
                brains.add(obj.privateInfo.id, obj.privateInfo.channelNames)
            } else if (public === true){
                for (newUser = 0; newUser < obj.nBrains; newUser++){
                    if (brains.users.get(obj.ids[newUser]) == undefined && obj.ids[newUser] != undefined){
                        brains.add(obj.ids[newUser], obj.channelNames[newUser])
                    }
                }
            }

            if (brains.users.size == 0){
                brains.add('me');
            }
            generate = false;
            stateManager()
            brains.initializeBuffer(buffer='userVoltageBuffers')
            eegChannelsOfInterest = updateEEGChannelsOfInterest()

            nInterfaces = obj.nInterfaces-1;

            // Announce number of brains currently online

            if (public === true && (obj.nBrains > 0) && brains.users.get('me') == undefined){
                announcement(`<div>Welcome to the Brainstorm
                                <p class="small">${brains.users.size} brains online</p></div>`)
                document.getElementById('nBrains').innerHTML = `${brains.users.size}`
            } else if (public === false) {
                if (obj.privateBrains){
                    document.getElementById('nBrains').innerHTML = `1`
                } else {
                    document.getElementById('nBrains').innerHTML = `0`
                }
            } else {
                announcement(`<div>Welcome to the Brainstorm
                                <p class="small">No brains online</p></div>`)
                document.getElementById('nBrains').innerHTML = `0`
            }
            document.getElementById('nInterfaces').innerHTML = `${nInterfaces}`
        }

        else if (obj.destination == 'brains'){

            // let reallocationInd;
            update = obj.n;
            if (update > 0 && (brains.users.get('me') != undefined || brains.users.get(userId)!= undefined)){
                brains.remove('me')
            }
            if (update == 1){
                    if (public && obj.access === 'public'){
                        brains.add(obj.id, obj.channelNames)
                        document.getElementById('nBrains').innerHTML = `${brains.users.size}`
                    } else if (!public && obj.access === 'private') {
                        brains.add(obj.id, obj.channelNames)
                        document.getElementById('nBrains').innerHTML = `1`
                    }
                    reallocationInd = brains.users.size - 1
            } else if (update == -1){
                // get index of removed id
                let iter = 0;
                brains.users.forEach((key) =>{
                    if (key == obj.id){
                        reallocationInd = iter
                    }
                    iter++
                })
                // delete id from map
                brains.remove(obj.id)

                if (public && obj.access === 'public'){
                    if (brains.users.get('me') == undefined){
                        if (brains.users.size == 0){
                            announcement('all users left the brainstorm')
                            document.getElementById('nBrains').innerHTML = `0`
                            brains.add('me')
                        } else if (!public && obj.access === 'private'){
                            document.getElementById('nBrains').innerHTML = `${brains.users.size}`
                        }
                    }
                } else {
                    document.getElementById('nBrains').innerHTML = `0`
                    brains.add('me')
                }
            }
            if (state != 0){
                stateManager()
                // brains.reallocateUserBuffers(reallocationInd);
            }
            brains.initializeBuffer(buffer='userVoltageBuffers')
            eegChannelsOfInterest = updateEEGChannelsOfInterest()

            } 
            else if (obj.destination == 'interfaces'){
                    nInterfaces += obj.n;
                document.getElementById('nInterfaces').innerHTML = `${nInterfaces}`
            } 
            else {
            console.log(obj)
        }
    };

    ws.onclose = function () {
        showMessage('WebSocket connection closed');
        ws = null;
        announcement(`<div>Exiting the Brainstorm
        <p class="small">Thank you for playing!</p></div>`)
        if (window.innerWidth >= 768) {
            document.getElementById('id-params').style.display = `none`;
            document.getElementById('nBrains-params').style.display = `none`;
            document.getElementById('nInterfaces-params').style.display = `none`;
        }
        document.getElementById('access-mode-div').innerHTML = ` 
        <p id="access-mode" class="small">Not Connected</p>
          `
        nInterfaces = undefined;
        document.getElementById("connection-button").innerHTML = 'Connect'; 
        brains = newBrains('me');
        brains.add('other');
        stateManager();
        generate = true;
    };
}

function initializeBrains(){
    ws.send(JSON.stringify({'destination':'initializeBrains','public':public}));
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