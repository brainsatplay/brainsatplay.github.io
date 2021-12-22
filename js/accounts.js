

async function toggleProfile(show){
    toggleLoginScreen(show)
}

// Login
async function toggleLoginScreen(showLogin){

    let container = document.getElementById('login-container')

    if (container){
        if (showLogin || (showLogin == null && container.style.opacity == 0)){
            container.style.opacity = 1
            container.style.pointerEvents = 'auto'
            toggleSignUpScreen(false)
        } else if (!showLogin || (showLogin == null && container.style.opacity == 1)) {
            container.style.opacity = 0
            container.style.pointerEvents = 'none'
        }
    }
}

function toggleSignUpScreen(showSignUp){

    let container = document.getElementById('signup-container')

    if (container)
        if (showSignUp || (showSignUp == null && container.style.opacity == 0)){
            toggleLoginScreen(false)
            container.style.opacity = 1
            container.style.pointerEvents = 'auto'
        } else if (!showSignUp || (showSignUp == null && container.style.opacity == 1)) {
            container.style.opacity = 0
            container.style.pointerEvents = 'none'
        }
    }

async function reset(command, url= 'https://brainsatplay.azurewebsites.net/'){
    let form = document.getElementById('reset-form')
    let formDict = {}
    let formData = new FormData(form);
    for (var pair of formData.entries()) {
        formDict[pair[0]] = pair[1];
    }

    formDict.command = command;
    if (formDict.command === 'replacePassword' && formDict['password'] ===''){
        document.getElementById('reset-message').innerHTML = "password is empty. please try again."
    }  else if (formDict.command === 'replacePassword' && formDict['password'] !== formDict['confirm-password']) {
        document.getElementById('reset-message').innerHTML = "passwords don't match. please try again."
    }
    else {

        formDict.command = command;
        let pageURL = window.location;
        let token = new URLSearchParams(pageURL.search).get('token');
        if (token !== null) {
            formDict.token = token
        }


        let json = JSON.stringify(formDict)

        let resDict = await fetch(url + 'reset',
            {
                method: 'POST',
                mode: 'cors',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: json
            }).then((res) => {
            return res.json().then((message) => message)
        })
            .then((message) => {
                return message
            })
            .catch(function (err) {
                console.log(`\n${err.message}`);
            });

        if (resDict.result === 'OK') {
            form.reset()
            document.getElementById('reset-message').innerHTML = resDict.msg
        }
    }
}

async function login(game, type){
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

    let resDict = await game.login(formDict);
    if (resDict.result == 'OK'){
        form.reset()
        toggleLoginScreen();
        if (resDict.profile.role === 'judge') {
            document.getElementById('judge-username').innerHTML = resDict.msg;
            // document.getElementById('judge-category').innerHTML = resDict.profile.judgingCategory
            document.getElementById('rubric-container').style.display = 'block';
            document.getElementById('rubric-container').style.zIndex = '10';
            document.getElementById('rubric-container').style.opacity = '1';
            document.getElementById('back').style.opacity = '0';
            document.getElementById('back').style.pointerEvents = 'none';
            if (document.getElementById('game-name')) {
                document.getElementById('rubric-game').innerHTML = document.getElementById('game-name').innerHTML
                showRubric()
            }
            completedSubmissions = resDict.profile.completedSubmissions
        }
    } else {
        document.getElementById('login-message').innerHTML = resDict.msg
    }
}

async function signup(game,url='https://brainsatplay.azurewebsites.net/'){
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
        let resDict = await game.signup(formDict,url);
        if (resDict.result == 'OK'){
            form.reset()
            toggleLoginScreen();
            toggleSignUpScreen();
        } else {
            document.getElementById('signup-message').innerHTML = resDict.msg
        }
    }
}