// Connection Management
function toggleConnection(){
    if (ws == undefined){
        establishWebsocketConnection();
        document.getElementById("connection-button").innerHTML = 'Exit the Brainstorm';
        brains.users.delete('other');
        brains.users.delete('me');
        brains.addBrain('me');
        stateManager()
        generate = false;
    } else {
        ws.close()
        document.getElementById("connection-button").innerHTML = 'Enter the Brainstorm'; 
        document.getElementById('userId').innerHTML = 'Simulation'
        brains = newBrains('me');
        brains.addBrain('other');
        stateManager()
        generate = true;
    }
}

// Request Handling
async function clientAction(destination,method){
    return await fetch(url + destination, { method: method,
        mode: 'cors',
        credentials: 'include'
    }).then((res) => handleResponse(res))
        .then((message) => {
            showMessage(message); 
            return message.userId})
        .catch(function (err) {
            showMessage(err.message);
        });}

function handleResponse(res) {
    return res.ok
        ? res.json().then((data) => data)
        : Promise.reject(new Error('Unexpected response'));
}

function showMessage(message) {
    if (message.userId != undefined){
    // console.log(`\n${message.userId} assigned`);
    } else {
        console.log(`\n${message}`);
    }
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

    ws.onopen = function () {showMessage('WebSocket connection established')};

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

            console.log(obj)

            for (newUser = 0; newUser < obj.n; newUser++){
                if (brains.users.get(obj.ids[newUser]) == undefined && obj.ids[newUser] != undefined){
                    brains.addBrain(obj.ids[newUser])
                }
            }
            
            brains.initializeBuffer(buffer='userVoltageBuffer')

            // Announce number of brains currently online
            if (obj.n > 0 && brains.users.get('me') != undefined){
                brains.users.delete('me')
                announcement(`<div>Welcome to the Brainstorm
                                <p class="small">${brains.users.size} brains online</p></div>`)
                document.getElementById('nBrains').innerHTML = `${brains.users.size}`
            } else {
                announcement(`<div>Welcome to the Brainstorm
                                <p class="small">No brains online</p></div>`)
                document.getElementById('nBrains').innerHTML = `0`

            }
        }
        else if (obj.destination == 'BrainsAtPlay'){

            console.log('new brain')
            console.log(obj)

            // let reallocationInd;
            update = obj.n;
            if (update > 0 && brains.users.get('me') != undefined){
                brains.users.delete('me')
            }

            if (update == 1){
                brains.addBrain(obj.id)
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
                brains.users.delete(obj.id)

                if (brains.users.size == 0){
                    brains.addBrain('me')
                }
            }

            announceUsers(update)

            if (state != 0){
                stateManager()
                // brains.reallocateUserBuffers(reallocationInd);
            }
            brains.initializeBuffer(buffer='userVoltageBuffer')
            document.getElementById('nBrains').innerHTML = `${brains.users.size}`
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
        document.getElementById('nBrains').innerHTML = `not connected`
    };
}

function establishWebsocketConnection() {

    // Declare What Type of Brains@Play User You Are
    setCookie('connectionType','interfaces', 30)

    // Validate Yourself or Be Assigned a UserID
    clientAction('login','POST').then(id => {

        if (id != undefined){
            document.getElementById('userId').innerHTML = id
            userId = id;
            setCookie('id',userId, 30)
            initializeWebsocket();
        }
    });
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