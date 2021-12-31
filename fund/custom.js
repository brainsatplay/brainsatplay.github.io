let amounts = document.getElementById('fund-contribution-amounts')
let divs = amounts.querySelectorAll('div')
let custom = document.getElementById('custom')
let customInput = document.getElementById('custom-contribution-amount')

// Handle Custom Amount Input
customInput.oninput = (e) => {
    custom.setAttribute('data-amount', customInput.value)
    selectedContribution = Number.parseFloat(customInput.value)
}

for (let div of divs) {
    div.onclick = () => {
        for (let d of divs) d.classList.remove('selected')
        div.classList.add('selected')

        selectedContribution = Number.parseFloat(div.getAttribute('data-amount'))
    }
}