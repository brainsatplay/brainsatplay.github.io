import {accounts} from '../js/accounts.mjs'

// Show / Hide Fund Rewards
export let toggleMonthly = (recurring) => {

    let checkbox = document.body.querySelector('input[type="checkbox"]')
    let warning = document.getElementById('contribution-account-warning')

    if (accounts?.user?._id) {
        recurring = checkbox.checked
        warning.style.display = 'none'
    } else {
        recurring = checkbox.checked = false
        warning.style.display = 'block'
    }

    // if (recurring) {
    //     if (type) type.innerHTML = 'Monthly'
    //     if (rewards) rewards.innerHTML = 'Coming soon...'
    // } else {
    //     if (type) type.innerHTML = 'One Time'
    //     if (rewards) rewards.innerHTML = 'None'
    // }
    
    return recurring
}