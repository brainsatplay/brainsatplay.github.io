

function getPerson(fullName){
    document.getElementById("team").style.display = `none`
    document.getElementById("person").innerHTML = `<${fullName}></${fullName}>`
    document.getElementById("person").insertAdjacentHTML( 'beforeend', `<button id="back" onclick="backToTeam()"> Back to the Team</button>`)
}

function backToTeam(){
    document.getElementById("team").style.display = `flex`
    document.getElementById("person").innerHTML = ``
}
