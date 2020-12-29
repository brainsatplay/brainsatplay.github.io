// Scrolling Behavior
function moveViewport(id) {
    let viewportOffset = document.getElementById(id).getBoundingClientRect();
    let top = viewportOffset.top;
    console.log(window.pageYOffset + top)
    window.scrollTo(0, window.pageYOffset - top - 100);
}



// Switching Views

function getPerson(fullName){
    document.getElementById("team").style.display = `none`
    document.getElementById("person").innerHTML = `<${fullName}></${fullName}>`
    document.getElementById("person").insertAdjacentHTML( 'beforeend', `<button id="back" onclick="backToTeam()"> Back to the Team</button>`)
}

function backToTeam(){
    document.getElementById("team").style.display = `flex`
    document.getElementById("person").innerHTML = ``
}

// function switchToAvailableGames(){
//
//     if (state != 'available') {
//         goBack()
//         // document.getElementById("available-option").className = 'game-option selected'
//         document.getElementById("submitted-option").className = 'game-option'
//         // document.getElementById("available").style.display = 'block'
//         document.getElementById("submitted").style.display = 'none'
//         state = 'available';
//     }
// }

function switchToSubmittedGames(){
    if (state != 'submitted') {
        // document.getElementById("available-option").className = 'game-option'
        document.getElementById("submitted-option").className = 'game-option selected'
        // document.getElementById("available").style.display = 'none'
        document.getElementById("submitted").style.display = 'block'
        document.getElementById('back').addEventListener('click', function() {goBack()});
        if (switched == false) {
            displaySubmissions()
            switched = true;
        }
        state = 'submitted';
    }

}

// Dispay Submissions
function displaySubmissions(){
            document.getElementById('temp-message').style.display = 'none';
            document.getElementById('temp-message').innerHTML = '';
            let gameTag;
            Object.keys(submittedGamesJSON).forEach(function(key) {
                gameTag = `
<a id="${key}" class="game" onclick="getSubmissions(${key})" style="background-image: url(${submittedGamesJSON[key]["game-image"]})">
        <div class="game-text">
          <h3>${key}</h3>
          <i class="small">${submittedGamesJSON[key]['team-name']}</i>
          <p>${submittedGamesJSON[key]['game-pitch']}</p>
        </div>
        <div class="game-mask"></div>
      </a>`
                $('#submitted-game-gallery').append(gameTag);
            })
}


// Get And Manipulate Submissions
function goBack() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('game').innerHTML = '';
    document.getElementById('temp-message').style.display = 'none';
    document.getElementById('temp-message').innerHTML = '';
    document.getElementById('back').style.display = 'none';
    document.getElementById('submitted-game-gallery').style.display = 'flex';

    // Hide Grading Rubric
    if (brains.username != 'me') {
        document.getElementById('rubric-header').style.display = 'block';
        document.getElementById('rubric-message').style.display = 'block';
        document.getElementById('rubric-inputs').style.display = 'none';
        document.getElementById('rubric-game').style.display = 'none';
    }
}

function getSubmissions(name) {
    document.getElementById('game').innerHTML = '';
    document.getElementById('submitted-game-gallery').style.display = 'none';

    document.getElementById('temp-message').innerHTML = 'Grabbing files. Please wait...';
    document.getElementById('temp-message').style.display = 'block';

    // Show Grading Rubric
    if (brains.username != 'me') {
        document.getElementById('rubric-game').innerHTML = name.id;
        document.getElementById('rubric-game').style.display = 'block';
        document.getElementById('rubric-header').style.display = 'none';
        document.getElementById('rubric-message').style.display = 'none';
        document.getElementById('rubric-inputs').style.display = 'block';
    }

    // Set current game
    currentGame = name;

    // Fill basic content
                    $('#game').prepend(`
<div>
<div>
<h1 id='game-name'></h1>
<i id='game-pitch'></i>
<br/>
<div id='game-image' class="flex flex-center"></div>
<div class="center">
    <i id='game-prompt' class="small"></i>
</div>
<p id='game-description'></p>
<h2>Additional Information</h2>
<p id='additional-info'></p>

<h3>The Team</h3>
<h4 id='team-name'></h4>
<p id='team-members'>Members: </p>
<p id='team-ages'>Ages: </p>
<p id='team-country'>Country: </p>
<p class="small" id='contact'>For inquiries, please contact </p>

<h3>Video</h3>
<div id="video-link"></div>
<h3>Additional Images</h3>
<div id='additional-images' class='gallery'>
</div>
<br/>
<h2>Game Details</h2>
<br/>
<h3>How far in the future does your game take place?</h3>
<p id='game-futuretime'></p>
<h3>In what type of future does your game take place?</h3>
<p id='game-futuretype'></p>
<br/>
<h3>How many players?</h3>
<p id="players-number"></p>
<h3>Who are the players?</h3>
<p id="players-characteristics"></p>
<h3>Except human brains, are there other types of brains involved?</h3>
<p id="players-nonhuman"></p>
<h3>Where are players located while playing the game?</h3>
<p id="players-location"></p>
<h3>Why are they playing?</h3>
<p id="players-motivation"></p>
<h3>Which is the main theme of the game?</h3>
<p id="players-theme"></p>
<h3>Where does it take place?</h3>
<p id="players-world"></p>
<br/>
<h3>What kind of conflict does the game support?</h3>
<p id="rules-conflict"></p>
<h3>What players can (or cannot) do?</h3>
<p id="rules-what"></p>
<h3>How they can (or cannot) do it?</h3>
<p id="rules-how"></p>
<h3>What are the win/lose conditions—-if any?</h3>
<p id="rules-conditions"></p>
<br/>
<h3>What are the major ethical issues that might be raised by the game?</h3>
<p id="ethical-issues"></p>
<h3>Do you have any specific safeguards to protect players against them?</h3>
<p id="ethical-safeguards"></p>
</div>
</div>
`)

    var doc = submittedGamesJSON[name.id]

    document.getElementById("contact").innerHTML+= `${doc['contact-fn']} ${doc['contact-ln']} at ${doc['contact-email']}.`;
    document.getElementById("game-image").innerHTML += `<img class="game-feature" src="${doc["game-image"]}"/>`

    for (let img in doc["additional-images"]){
        $('#additional-images').prepend('<img class="item" alt="fetching from server..." src=' + doc["additional-images"][img] + ' />')
    }

    Object.keys(doc).forEach(function(field) {
        if (!['_id','additional-images', 'game-image','approved','contact-fn','contact-ln','contact-email','competition'].includes(field)) {
            document.getElementById(field).innerHTML += doc[field];
        }
    })

    let jsonOBJ = {'get': name}

    fetch(url + '/getsubmissions', {
        method: 'POST',
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'omit', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(jsonOBJ), // body data type must match "Content-Type" header
    }).then(response => {
        response.json().then(function (json) {
            document.getElementById('temp-message').style.display = 'none';
            if (json.error) {
                $('#game').prepend('<h1>' + json.error + '</h1>')
            } else {
                console.log(json)
                let doc = json[Object.keys(json)[0]]
                for (let img in doc["additional-images"]){
                    document.getElementById('additional-images').innerHTML = '';
                    $('#additional-images').prepend('<img class="item" src=' + doc["additional-images"][img] + ' />')
                }
            }
        })})

            document.getElementById('game').style.display = 'flex';
            if (brains.username =='me') {
                document.getElementById('back').style.display = 'block';
            }
        //     }
        // )
    // });
};


// Login
function toggleLoginScreen(){
    showLogin = !showLogin;

    if (showLogin){
        document.getElementById('login-container').style.zIndex = '100'
        document.getElementById('login-container').style.opacity = '1'
    } else {
        document.getElementById('login-container').style.opacity = '0'
        document.getElementById('login-container').style.zIndex = '-1'
    }
}

function toggleSignUpScreen(){
    showSignUp = !showSignUp;

    if (showSignUp){
        document.getElementById('signup-container').style.zIndex = '100'
        document.getElementById('signup-container').style.opacity = '1'
    } else {
        document.getElementById('signup-container').style.opacity = '0'
        document.getElementById('signup-container').style.zIndex = '0'
    }
}

async function login(brains, url, type){
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

    let resDict = await brains.login(formDict,url)
    if (resDict.result == 'OK'){
        document.getElementById('judge-username').innerHTML = brains.username;
        form.reset()
        toggleLoginScreen();
        document.getElementById('rubric-container').style.zIndex = '100';
        document.getElementById('rubric-container').style.opacity = '1';
    } else {
        document.getElementById('login-message').innerHTML = resDict.msg
    }
}

async function signup(brains, url){
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

        let resDict = await brains.signup(formDict,url);
        if (resDict.result == 'OK'){
            form.reset()
            toggleLoginScreen();
            toggleSignUpScreen();
        } else {
            document.getElementById('signup-message').innerHTML = resDict.msg
        }
    }
}

// Submit Ratings
async function submitRatings(){
    let form = document.getElementById('rubric')
    let formData = new FormData(form);
    let formDict = {}
    for (var pair of formData.entries()) {
        formDict[pair[0]] = pair[1];
    }
    formDict['username'] = brains.username;
    formDict['game'] = currentGame;

    let json  = JSON.stringify(formDict)

    // let resDict = await fetch(url + 'submitRubric',
    //     { method: 'POST',
    //         mode: 'cors',
    //         headers: new Headers({
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         }),
    //         body: json
    //     }).then((res) => {return res.json().then((message) => message)})
    //     .then((message) => {
    //         console.log(`\n${message}`);
    //         return message})
    //     .catch(function (err) {
    //         console.log(`\n${err.message}`);
    //     });
    //
    // if (resDict.result == 'OK'){
        console.log(submittedGamesJSON)
    // }
}
