// Show / Hide Fund Rewards

let monthly = document.getElementById('fund-contribution-monthly') 
let checkbox = document.body.querySelector('input[type="checkbox"]')
let rewards = document.getElementById('fund-rewards')
let type = document.getElementById('contribution-type')

let checkRewards = () => {

    // TODO: Turn on checkbox toggling when we have account management
    // recurring = checkbox.checked
    recurring = checkbox.checked = false
    if (recurring) {
        if (type) type.innerHTML = 'Monthly'
        if (rewards) rewards.innerHTML = 'Coming soon...'
    } else {
        if (type) type.innerHTML = 'One Time'
        if (rewards) rewards.innerHTML = 'None'
    }

}
 
checkbox.onchange = checkRewards
checkRewards()