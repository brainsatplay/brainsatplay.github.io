
import {cancelSubscription} from '../fund/stripe.mjs'

export const accounts = new AccountsAPI("brainsatplay-tvmdj", {
    serverURI: SERVER_URI
}) // Account API from 'https://github.com/brainsatplay/accounts'

export const toggleLoginScreen = (show) => toggleOverlay('login-container', show, () => {
    toggleSignUpScreen(false)
})

export let toggleCurrentProfileOverlay = toggleLoginScreen

export const toggleSignUpScreen = (show) => toggleOverlay('signup-container', show)

export const toggleProfile = (show) => toggleOverlay('profile-container', show, () => {
    toggleLoginScreen(false)
    toggleSignUpScreen(false)
})

export function toggleOverlay(id, show, customShowCallback=()=>{}, customHideCallback=()=>{}){

    let container = document.getElementById(id)
    let overlays = document.querySelectorAll('.overlay')

    if (container){
        if (show || (show == null && container.style.opacity == 0)){
            container.style.opacity = 1
            container.style.pointerEvents = 'auto'
            document.body.classList.add('noscroll')
            customShowCallback()
        } else if (!show || (show == null && show.style.opacity == 1)) {
            container.style.opacity = 0
            container.style.pointerEvents = 'none'

            let numOpen = Array.from(overlays).reduce((a,b) => a + Number.parseInt((b.style.opacity === '') ? 0 : b.style.opacity), 0)
            if (numOpen === 0) document.body.classList.remove('noscroll')
            customHideCallback()
        }
    }
}

    export const throwProfileError = ({error}) => {

        let profileDetails = document.getElementById('profile-details')
        let profileError = document.getElementById('profile-error')
        profileDetails.style.display = 'none'
        profileError.style.display = 'block'
        profileError.innerHTML = error
    }
    

    export const setProfileInfo = (res) => {

        let profileDetails = document.getElementById('profile-details')
        let profileError = document.getElementById('profile-error')

        if (res){
            if (!('err' in res.data)){
                setCurrentOverlay('profile', true)
                profileDetails.style.display = 'block'
                profileError.style.display = 'none'
                document.getElementById('email').innerHTML = res.data.email
                document.getElementById('username').innerHTML = res.data.username ?? 'anonymous'

                if (res.data.image) profileDetails.querySelector('.profile-img').querySelector('img').src = res.data.image
                else profileDetails.querySelector('.profile-img').classList.add('placeholder')
                document.getElementById('full-name').innerHTML = `${res.data.firstName} ${res.data.lastName}`

                // Fill Subscriptions
                let subDiv = document.getElementById('subscriptions')
                let subErrorMsg = document.getElementById('subscription-error-message')
                if (res.data.customUserData?.stripe?.subscriptions){
                    let numSubs = Object.keys(res.data.customUserData?.stripe?.subscriptions).length
                    if (numSubs > 0){
                        for (let subId in res.data.customUserData.stripe.subscriptions) {

                            const subInfo = res.data.customUserData.stripe.subscriptions[subId]
                            const name = subInfo.name
                            const amount = subInfo.amount /= 100

                            const sub = document.createElement('div')
                            sub.classList.add('subscription')

                            sub.innerHTML = `<div><h4>${name}</h4><small>$${amount}/month</small></div>`
                            const button = document.createElement('button')
                            button.innerHTML = 'Cancel Subscription'
                            sub.insertAdjacentElement('beforeend', button)
                            
                            button.onclick = () => {
                                cancelSubscription(subId).then(res => {
                                    console.log(res)
                                    numSubs--
                                    sub.remove()
                                    if (numSubs === 0) subErrorMsg.style.display = 'block'
                                }).catch(console.error)
                            }

                            subDiv.insertAdjacentElement('beforeend', sub)
                        }
                        subErrorMsg.style.display = 'none'
                    } else subErrorMsg.style.display = 'block'
                } else subErrorMsg.style.display = 'block'

                // for (let key in res.data.customUserData) {
                //     profileDetails.insertAdjacentHTML('beforeend', `<p><strong>${key}</strong>: ${res.data.customUserData[key]}</p>`)
                // }

                console.log('User', res.data)
                // if (customUserData) customUserData.innerHTML = JSON.stringify(res.data.customUserData)
            } else {
                throwProfileError({error: 'No profile selected'})
                setCurrentOverlay('login', true)
            }
        } else throwProfileError({error: 'No profile selected'})
    }


    export const setCurrentOverlay = (name, hide) => {
        if (hide) toggleCurrentProfileOverlay(false)
        if (name === 'login') toggleCurrentProfileOverlay = toggleLoginScreen
        if (name === 'signup') toggleCurrentProfileOverlay = toggleSignUpScreen
        if (name === 'profile') toggleCurrentProfileOverlay = toggleProfile
    }