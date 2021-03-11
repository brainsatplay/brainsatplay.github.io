// Switching Views

let exampleSubDir = '/competition/examplesubmissions/'
let liveSubDir = '/competition/submissions/'
let chosenSubDir;
// if (window.location.pathname === '/' || window.location.pathname === '/competition/submissions/'){
    chosenSubDir = liveSubDir
// } else {
//     chosenSubDir = exampleSubDir
// }

function getPerson(fullName){
    document.getElementById("team").style.display = `none`
    document.getElementById("person").innerHTML = `<${fullName}></${fullName}>`
    document.getElementById("person").insertAdjacentHTML( 'beforeend', `<button id="back" onclick="backToTeam()"> Back to the Team</button>`)
}

function backToTeam(){
    document.getElementById("team").style.display = `flex`
    document.getElementById("person").innerHTML = ``
}

function switchToAvailableGames(){

    if (state != 'available') {
        goBack()
        document.getElementById("available-option").className = 'game-option selected'
        document.getElementById("submitted-option").className = 'game-option'
        document.getElementById("available").style.display = 'block'
        document.getElementById("submitted").style.display = 'none'
        state = 'available';
    }
}

function switchToSubmittedGames(){
    if (state != 'submitted') {
        document.getElementById("available-option").className = 'game-option'
        document.getElementById("submitted-option").className = 'game-option selected'
        document.getElementById("available").style.display = 'none'
        document.getElementById("submitted").style.display = 'flex'
        document.getElementById('back').addEventListener('click', function() {goBack()});
        state = 'submitted';
    }
}

function displaySubmissions(categories=['Brain Games','VR + Neurotech + Health', 'Computational Art']){

    if (!Array.isArray(categories)){
        categories = [categories]
    }
    document.getElementById('submitted-game-gallery').innerHTML = '';
    allGames = []

    d3.csv(chosenSubDir + 'submissions2.csv').then(function (data) {

        data.forEach((submission, row) => {
            if (submission['Finished'] === 'True') {
                if (categories.includes(submission['Q20']))
                if (submission['Q51'] !== '' && submission['Q57'] !== ''){
                    let gameTag;
                    let name;
                    let headerImg;
                    let submissionEmoji;

                    if (submission['Q20'] === 'Brain Games'){
                        name = submission['Q24'];
                        submissionEmoji = '🎮'
                        headerImg = `'${chosenSubDir}files/Q25/${submission['ResponseId']}_${submission['Q25_Name']}'`
                    } else if (submission['Q20'] === 'VR + Neurotech + Health'){
                        name = submission['Q24'];
                        submissionEmoji = '🧠';
                        headerImg = `'${chosenSubDir}files/Q25/${submission['ResponseId']}_${submission['Q25_Name']}'`
                    } else if (submission['Q20'] === 'Computational Art'){
                        name = submission['Q56'];
                        submissionEmoji = '✨';
                        headerImg = `'${chosenSubDir}files/Q69/${submission['ResponseId']}_${submission['Q69_Name']}'`
                    }

                    gameTag = `
                    <a id="${name}" class="game" onclick="showSubmission(${row})" style="background-image: url(${headerImg})">
                            <div class="submission-emoji">${submissionEmoji}</div>
                            <div class="game-text">
                            </div>
                            <div class="game-mask" style="opacity: 20%;"></div>
                          </a>`

                    allGames.push(name)
                    document.getElementById('submitted-game-gallery').innerHTML += gameTag;
                }
            }
        })
        if (document.getElementById('rubric-container') !== null) {
            populateJudgingRequirements(completedSubmissions)
        }
    })
}


// Get And Manipulate Submissions
function goBack() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('game').innerHTML = '';
    document.getElementById('back').style.display = 'none';
    document.getElementById('submitted-game-gallery').style.display = 'flex';
    window.scrollTo(0, 0);
    // Hide Rubric
    hideRubric()
}

function hideRubric(){
    if (game.me.username != 'me') {
        document.getElementById('rubric-header').style.display = 'block';
        document.getElementById('rubric-message').style.display = 'block';
        document.getElementById('rubric-inputs').style.display = 'none';
        document.getElementById('rubric-game').style.display = 'none';
        document.getElementById('judge-category').style.display = 'block'
    }
}
function showRubric() {
    if (game.me.username != 'me') {
        document.getElementById('rubric-submission-category').innerHTML = document.getElementById('judge-category').innerHTML
        document.getElementById('judge-category').style.display = 'none'
        document.getElementById('rubric-header').style.display = 'none';
        document.getElementById('rubric-message').style.display = 'none';
        document.getElementById('rubric-inputs').style.display = 'block';
    }
}
function showSubmission(row) {
    document.getElementById('game').innerHTML = '';
    document.getElementById('submitted-game-gallery').style.display = 'none';

    // Show Grading Rubric
    showRubric()

    let submissionArr;
    let questions;
    var rows;
    var headers;

    d3.text(chosenSubDir + 'submissions2.csv').then(function (text) {
        rows = d3.csvParseRows(text)
        headers = rows[0]
        questions = rows[1]
        submissionArr = rows[row+1]
    }).then(() => {

        let submissionCategory = submissionArr[headers.findIndex(val => val === 'Q20')];
        currentCategory = submissionCategory
        let name;
        let submissionEmoji;
        let toIgnore;
        let nameQuestion;
        let ageQuestion;
        let nameQuestion_Ignore;
        let ageQuestion_Ignore
        let duplicateManager = {}
        if (submissionCategory === 'Computational Art') {
            name = submissionArr[headers.findIndex(val => val === 'Q56')]
            submissionEmoji = '✨';
            toIgnore = ['StartDate', 'EndDate', 'Status', 'IPAddress', 'Progress', 'Duration (in seconds)', 'Finished', 'RecordedDate', 'ResponseId', 'RecipientLastName', 'RecipientFirstName', 'RecipientEmail', 'ExternalReference', 'LocationLatitude', 'LocationLongitude', 'DistributionChannel', 'UserLanguage', 'Q27 - Sentiment', 'Q27 - Sentiment Score', 'Q27 - Sentiment Polarity', 'Q27 - Topic Sentiment Label', 'Q27 - Topic Sentiment Score', 'Q27 - Topics', 'Q27 - Parent Topics', 'Q22 - Sentiment', 'Q22 - Sentiment Score', 'Q22 - Sentiment Polarity', 'Q22 - Topic Sentiment Label', 'Q22 - Topic Sentiment Score', 'Q22 - Topics', 'Q22 - Parent Topics',
                'Q56','Q31','Q35','Q46','Q47','Q69_Name',
                'Q22','Q24','Q25_Id','Q25_Name','Q25_Size','Q25_Type','Q26_Id','Q26_Name','Q26_Size','Q26_Type','Q27','Q28_Id','Q28_Name','Q28_Size','Q28_Type','Q29','Q30','Q31_Id','Q31_Name','Q31_Size','Q31_Type','Q33','Q34','Q27','Q28','Q29','Q31','Q32','Q33','Q34','Q35','Q36','Q44_Id','Q44_Name','Q44_Size','Q44_Type','Q37','Q43_Id','Q43_Name','Q43_Size','Q43_Type','Q38','Q42_Id','Q42_Name','Q42_Size','Q42_Type','Q39','Q40','Q41_Id','Q41_Name','Q41_Size','Q41_Type','Q45','Q46','Q47','Q48','Q49_Id','Q49_Name','Q49_Size','Q49_Type'
            ]
            nameQuestion = 'Q79'
            ageQuestion = 'Q80'
            nameQuestion_Ignore = 'Q2'
            ageQuestion_Ignore = 'Q4'
        } else {
            name = submissionArr[headers.findIndex(val => val === 'Q24')]
            if (submissionCategory === 'Brain Games') {
                submissionEmoji = '🎮';
            } else {
                submissionEmoji = '🧠';
            }

            toIgnore = ['StartDate', 'EndDate', 'Status', 'IPAddress', 'Progress', 'Duration (in seconds)', 'Finished', 'RecordedDate', 'ResponseId', 'RecipientLastName', 'RecipientFirstName', 'RecipientEmail', 'ExternalReference', 'LocationLatitude', 'LocationLongitude', 'DistributionChannel', 'UserLanguage', 'Q27 - Sentiment', 'Q27 - Sentiment Score', 'Q27 - Sentiment Polarity', 'Q27 - Topic Sentiment Label', 'Q27 - Topic Sentiment Score', 'Q27 - Topics', 'Q27 - Parent Topics', 'Q22 - Sentiment', 'Q22 - Sentiment Score', 'Q22 - Sentiment Polarity', 'Q22 - Topic Sentiment Label', 'Q22 - Topic Sentiment Score', 'Q22 - Topics', 'Q22 - Parent Topics',
                'Q24','Q56', 'Q52', 'Q53', 'Q54', 'Q55','Q47','Q70', 'Q69_Name',
            ]
            nameQuestion = 'Q2'
            ageQuestion = 'Q4'
            nameQuestion_Ignore = 'Q79'
            ageQuestion_Ignore = 'Q80'
        }
        toIgnore.push('Q20')

        let names = []
        let ages = []
        let numMembers = submissionArr[headers.findIndex(val => val === 'Q3')]
        toIgnore.push('Q3')
        let cccMentorship = (submissionArr[headers.findIndex(val => val === 'Q51')] === 'Yes')
        toIgnore.push('Q51')
        let canPublish = (submissionArr[headers.findIndex(val => val === 'Q57')] === 'Yes')
        toIgnore.push('Q57')
        toIgnore.push('Q68') // Agree to rules
        toIgnore.push('Q62') // Team member text
        toIgnore.push('Q7','Q7_2_TEXT') // Country of residence

        for (let i = 1; i <= 4; i++) {
            let age = parseInt(submissionArr[headers.findIndex(val => val === i + '_' + ageQuestion)])
            let name = submissionArr[headers.findIndex(val => val === i + '_' + nameQuestion)] //+ ` (${age})`
            if (age && name) {
                ages.push(age)
                names.push(name)
            }
            toIgnore.push(i + '_' + nameQuestion)
            toIgnore.push(i + '_' + nameQuestion_Ignore)
            toIgnore.push(i+'_' + ageQuestion)
            toIgnore.push(i + '_' + ageQuestion_Ignore)
        }
        if (names.length != 1){
            names[names.length - 1] = `and ${names[names.length - 1]}`;
            if (names.length === 2){
                names = names.join(' ')
            } else if (names.length > 2) {
                names = names.join(', ')
            }
        }

        toIgnore.push('Q65') // Confirm over 18yo

        if (document.getElementById('rubric-game')) {
            document.getElementById('rubric-game').style.display = 'block';
            document.getElementById('rubric-game').innerHTML = name
        }

        currentGame = name

        document.getElementById('game').innerHTML += `
<!--    <div class="submission-emoji">${submissionEmoji}</div>-->
    <h1 id="game-name">${name}</h1>
    <p class="small">Submitted by <strong>${submissionArr[headers.findIndex(val => val === 'Q1')]}</strong> (${names}) for the <strong>${submissionCategory}</strong> category.
    Please send all inquiries to ${submissionArr[headers.findIndex(val => val === 'Q9')]} ${submissionArr[headers.findIndex(val => val === 'Q10')]} at <a class="text" href="mailto:${submissionArr[headers.findIndex(val => val === 'Q11')]}" class="text" target="_blank">${submissionArr[headers.findIndex(val => val === 'Q11')]}</a>.</p>
    `
        let headerImg;
      if (submissionCategory !== 'Computational Art')   {
          document.getElementById('game').innerHTML += `<blockquote>${submissionArr[headers.findIndex(val => val === 'Q29')]}</blockquote>`
            headerImg = `'${chosenSubDir}files/Q25/${submissionArr[headers.findIndex(val => val === 'ResponseId')]}_${submissionArr[headers.findIndex(val => val === 'Q25_Name')]}'`
      } else {
          headerImg = `'${chosenSubDir}files/Q69/${submissionArr[headers.findIndex(val => val === 'ResponseId')]}_${submissionArr[headers.findIndex(val => val === 'Q69_Name')]}'`
      }
        document.getElementById('game').innerHTML += `<div class="game-media-container"><img class="game-media" src=${headerImg}/></div>`

        toIgnore.push('Q29','Q1','Q9','Q10','Q11','Q25_Name')

        if (submissionCategory !== 'Computational Art') {
            let vidLink = `${chosenSubDir}files/Q26/${submissionArr[headers.findIndex(val => val === 'ResponseId')]}_${submissionArr[headers.findIndex(val => val === 'Q26_Name')]}`
            document.getElementById('game').innerHTML += `<div class="game-media-container">
<div>
<!--<p style="margin-right: 50px;">Please download video to view:</p> -->
<!--<video id="game-video" width="320" height="240" controls>-->
<!--          <source src='${vidLink}' type="video/mp4">-->
<!--        Your browser does not support the video tag.-->
<!--        </video>-->
<!--                <p class="small">If unavailable, please view <a href="https://brainsatplay.com${vidLink}" class="text" target="_blank">here</a></p>-->
                <p class="small">Please view the video for this submission on our <a href="https://youtube.com/playlist?list=PLdAKE-cHWv39kSpvhwB_4wM5btevE7CEy" class="text" target="_blank">Competition YouTube playlist</a></p>
        </div>
        </div>
`

            // document.getElementById('game-video').maxWidth = '100%'
        }


    // for (let img in doc["additional-images"]){
    //     $('#additional-images').append('<img class="additional-img" alt="fetching from server..." src=' + doc["additional-images"][img] + ' />')
    // }


        headers.forEach(function(qID,ind) {
        if (!toIgnore.includes(qID)) {
            if ('Q22'===qID){
                document.getElementById('game').innerHTML += `<br/><br/><h2>Game Overview</h2><hr/>`
                document.getElementById('game').innerHTML += `<h3>Prompt</h3><p>${submissionArr[ind]}</p>` // Prompt
            } else if ('Q27'===qID){
                if (!questions[ind].includes('video')){
                    document.getElementById('game').innerHTML += `<br/><br/><h2>The Players</h2><hr/>`
                    document.getElementById('game').innerHTML += `<h3>How many players can play at the same time?</h3><p>${submissionArr[ind]}</p>`
                }
            }
            else if ('Q36'===qID){
                    document.getElementById('game').innerHTML += `<br/><br/><h2>Rules/Gameplay</h2><hr/>`
                    document.getElementById('game').innerHTML += `<h3>What can players do?</h3><p>${submissionArr[ind]}</p>`
            } else if ('Q45'===qID){
                    document.getElementById('game').innerHTML += `<br/><br/><h2>Ethical Issues</h2><hr/>`
                    document.getElementById('game').innerHTML += `<h3>What are the major ethical issues that might be raised by your game?</h3><p>${submissionArr[ind]}</p>`
            }else if ('Q48'===qID){
                if (submissionArr[ind] !== '') {
                    document.getElementById('game').innerHTML += `<br/><br/><h2>Additional Materials</h2><hr/>`
                    document.getElementById('game').innerHTML += `<h3>Is there anything else you would like to say about your game?</h3><p>${submissionArr[ind]}</p>`
                }
            } else if ('Q64'===qID){
                if (submissionCategory === 'VR + Neurotech + Health') {
                    document.getElementById('game').innerHTML += `<h3>How is your team prepared to develop a function prototype of your VR + Neurotech + Health game?</h3><p>${submissionArr[headers.findIndex(val => val === 'Q64')]}</p>`
                }
            }
            else if(questions[headers.findIndex(val => val === qID)].includes('Consent Form')){
                // Filter out consent forms
            }
            else if(questions[headers.findIndex(val => val === qID)].includes('image')){
                if (qID.includes('Name')) {
                    let name = submissionArr[headers.indexOf(qID.split('_')[0] + '_Name')]
                    if (name != '') {
                        document.getElementById('game').innerHTML += `<div class="game-media-container"><img class="game-media" src='${chosenSubDir}files/${qID.split('_')[0]}/${submissionArr[headers.indexOf('ResponseId')]}_${name}'/></div>`
                    }
                }
            } else if(questions[headers.findIndex(val => val === qID)].includes('video')){
                // Filter out videos
            }
            else {
                if ('Q31'===qID){
                    document.getElementById('game').innerHTML += `<h3>Who are the players?</h3><p>${submissionArr[ind]}</p>`
                } else if ('Q35'===qID){
                    document.getElementById('game').innerHTML += `<h3>Why are players motivated to play?</h3><p>${submissionArr[ind]}</p>`
                } else if ('Q46'===qID){
                    if (submissionArr[ind]==='Yes'){
                        document.getElementById('game').innerHTML += `<h3>What ethical safeguards are in place to protect against these issues?</h3><p>${submissionArr[headers.findIndex(val => val === 'Q47')]}</p>`
                    }
                } else if ('Q52'===qID){
                    document.getElementById('game').innerHTML += `<br/><br/><p>Active Project (<a  class="text" href="${submissionArr[ind]}" target="_blank">link</a>)</p>`
                } else if ('Q70'===qID){
                    if (submissionArr[ind] != "") {
                        document.getElementById('game').innerHTML += `<p>Source Code (<a class="text" href="${submissionArr[ind]}" target="_blank">link</a>)</p>`
                    }
                }
                else if ('Q53'===qID){
                    document.getElementById('game').innerHTML += `<br/><br/><h2>Description</h2><hr/><p>${submissionArr[ind]}</p>`
                }else if ('Q55'===qID){
                    document.getElementById('game').innerHTML += `<br/><br/><h2>Bio</h2><hr/><p>${submissionArr[ind]}</p>`
                }else {
                    let startInd = 0
                    if (duplicateManager[qID]){
                        startInd = duplicateManager[qID]
                    }
                    let ind = headers.indexOf(qID,startInd)
                    if (submissionArr[ind] != '') {
                        document.getElementById('game').innerHTML += `<h3>${questions[ind]}</h3>`
                        document.getElementById('game').innerHTML += `<p>${submissionArr[ind]}</p>`
                    }
                    duplicateManager[qID] = ind+1
                }
            }
        }
    })

            document.getElementById('game').style.display = 'block';
            document.getElementById('back').style.display = 'block';
    })
};


// Login
async function toggleLoginScreen(){
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
        document.getElementById('signup-container').style.zIndex = '-1'
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
            document.getElementById('judge-category').innerHTML = resDict.profile.judgingCategory
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
            displaySubmissions(resDict.profile.judgingCategory)
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

// Submit Ratings

function populateJudgingRequirements(completedList){
    let completed = document.getElementById('rubric-completed')
    let todo = document.getElementById('rubric-todo')

    completed.innerHTML = ''
    todo.innerHTML = ''

    let todoList = allGames;
    completedList.forEach((name) => {
        completed.innerHTML += `<li class="small">${name}</li>`
        todoList = todoList.filter(e => e !== name);
    })

    if (todoList.length === 0){
        document.getElementById('rubric-message').innerHTML = `<p class="small">No more submissions to judge. Browse all submissions on the Brains@Play <a href="/" class="text">homepage</a>.</p>`
    }

    todoList.forEach((name) => {
        todo.innerHTML += `<li class="small">${name}</li>`
    })
}
async function submitRatings(){
    let form = document.getElementById('rubric')
    let formData = new FormData(form);
    let formDict = {}
    for (var pair of formData.entries()) {
        formDict[pair[0]] = pair[1];
    }
    formDict['username'] = game.me.username;
    formDict['game'] = currentGame;
    formDict['category'] = currentCategory;

    let json  = JSON.stringify(formDict)

    let resDict = await fetch('https://brainsatplay.azurewebsites.net/' + 'judging',
        { method: 'POST',
            mode: 'cors',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: json
        }).then((res) => {return res.json()})


    if (resDict.result == 'OK'){
        form.reset()
        completedSubmissions = resDict.profile.completedSubmissions
        populateJudgingRequirements(completedSubmissions)
    }
}

function updateLabel(val, labelID){
    document.getElementById(labelID).innerHTML = val
}

async function getRatings(url = 'https://brainsatplay.azurewebsites.net/'){

    let resDict = await fetch(url + 'judging',
        { method: 'GET',
            mode: 'cors',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
        }).then((res) => {return res.json()})

    return resDict
}
