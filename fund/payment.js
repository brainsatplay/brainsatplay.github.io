// Create a PayPal Checkout component
// Create a client.
const CLIENT_AUTHORIZATION = 'sandbox_9qgtbdsg_vsm2tjxr62wttvhk' // default sandbox client
const SERVER_URI = (window.location.hostname != 'brainsatplay.com') ? 'http://localhost:443' : 'https://brainsatplay.azurewebsites.net'

// Accept Visa: 4111111111111111
// Decline Visa: 4000111111111115

const checkout = document.getElementById('checkout-container')
const notification = document.body.querySelector('.notification')
const button = document.querySelector('#submit-button');
const action = document.querySelector('#error-action');
const errorName = document.querySelector('#error-name');
const error = document.querySelector('#error-response');
notification.style.display = 'none'
button.classList.add('disabled') // avoid sending multiple payment requests

const showError = (e, actn) => {
    action.innerHTML = actn ?? 'Issue with payment method.'
    errorName.innerHTML = e.name
    
    switch (e.message){
        case 'Failed to fetch':
            error.innerHTML = 'Server down'
            break;
        default:
            error.innerHTML = e.message
    }

    notification.style.display = 'block'
}

fetch(`${SERVER_URI}/transaction/new`,{
    method: 'GET',
    mode: 'cors',
}).then(res => {

braintree.dropin.create({
    authorization: res.body.clientToken ?? CLIENT_AUTHORIZATION,
    container: '#dropin-container',
    paypal: {
        flow: 'vault'
    }
  }, function (clientErr, clientInstance) {
  
    // Stop if there was a problem creating the client.
    // This could happen if there is a network error or if the authorization
    // is invalid.
    if (clientErr) {
      console.error('Error creating client:', clientErr);
      return;
    } else button.classList.remove('disabled') // avoid sending multiple payment requests

    button.addEventListener('click', function () {

        if (selectedContribution == null) {
            showError({
                name: 'ContributorError',
                message: 'No contribution specified.'
            }, 'No Contribution Specified')
        } else {
        clientInstance.requestPaymentMethod().then(function (payload) {
            notification.style.display = 'none'
            button.classList.add('disabled') // avoid sending multiple payment requests


            // Get Custom Fields for Form
            let form = document.getElementById('contributor-info-form')
            let formDict = {}
            let formData = new FormData(form);
            for (var pair of formData.entries()) {
                formDict[pair[0]] = pair[1];
            }

            formDict.nonce = payload.nonce
            formDict.amount = selectedContribution
            formDict.recurring = recurring

            fetch(`${SERVER_URI}/transaction`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify(formDict)
            }).then(async res => {
                const msg = await res.json()
                if (msg.errors) {
                    showError(msg.errors[0])
                    button.classList.remove('disabled') // allow another payment to be sent
                } else {
                    let id;
                    if (msg.transaction) id = msg.transaction.id // one-time transaction
                    else if (msg.subscription) id = msg.subscription.transactions[0].id // first subscription transaction

                    fetch(`${SERVER_URI}/transaction/${id}`,{
                        method: 'GET',
                        mode: 'cors',
                    }).then(async (res) => {
                        const msg = await res.json()
                        checkout.innerHTML = `<div><h2>${msg.header}</h2><p>${msg.message}</p></div>`
                    })
                }
            }).catch(e => {
                showError(e)
                button.classList.remove('disabled') // allow another payment to be sent
            })
          }).catch(function (e) {
            // Handle errors in requesting payment method
            showError(e, 'Please specify a payment method.')
            notification.style.display = 'block'
          })
        }
      });
      
  
    // // Create a PayPal Checkout component.
    // console.log(clientInstance)
    // braintree.paypalCheckout.create({
    //   client: clientInstance
    // }, function (paypalCheckoutErr, paypalCheckoutInstance) {
    //   paypalCheckoutInstance.loadPayPalSDK({
    //     vault: true
    //   }, function () {
    //     paypal.Buttons({
    //       fundingSource: paypal.FUNDING.PAYPAL,
  
    //       createBillingAgreement: function () {
    //         return paypalCheckoutInstance.createPayment({
    //           flow: 'vault', // Required
  
    //           // The following are optional params
    //           billingAgreementDescription: 'Your agreement description',
    //           enableShippingAddress: true,
    //           shippingAddressEditable: false,
    //           shippingAddressOverride: {
    //             recipientName: 'Scruff McGruff',
    //             line1: '1234 Main St.',
    //             line2: 'Unit 1',
    //             city: 'Chicago',
    //             countryCode: 'US',
    //             postalCode: '60652',
    //             state: 'IL',
    //             phone: '123.456.7890'
    //           }
    //         });
    //       },
  
    //       onApprove: function (data, actions) {
    //         return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
    //           // Submit `payload.nonce` to your server
    //         });
    //       },
  
    //       onCancel: function (data) {
    //         console.log('PayPal payment canceled', JSON.stringify(data, 0, 2));
    //       },
  
    //       onError: function (err) {
    //         console.error('PayPal error', err);
    //       }
    //     }).render('#submit-button').then(function () {
    //         console.log('RENDER')

    //       // The PayPal button will be rendered in an html element with the ID
    //       // `paypal-button`. This function will be called when the PayPal button
    //       // is set up and ready to be used
    //     });
  
    //   });
  
    // });
  
  });
})
