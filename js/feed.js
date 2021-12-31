
const sources = [
    'garrettmflynn',
    'moothyknight',
    'tinkhauser',
]

const feed = document.getElementById('feed')

// sources.forEach(username => {
// })

let div = document.createElement('div')
let header = document.createElement('div')
header.classList.add('local-header')
feed.insertAdjacentElement('beforeend', header)
header.insertAdjacentHTML('beforeend',`<p><strong>Github Activity Feed</strong></p>`)
// feed.insertAdjacentElement("afterbegin", div);

let commits = document.createElement('div')
feed.insertAdjacentElement("beforeend", commits);

// sources.forEach(username => {
  // fetch(`${SERVER_URI}/feed/users/garrettmflynn`, {
    fetch(`${SERVER_URI}/feed/orgs/brainsatplay`, {
        mode: 'cors',
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
      // console.log(data);

      data.forEach(o => {

        let show = true
        // console.log('Data', o)
        // console.log('Payload', o.payload)
        let div = document.createElement('div')
        // let images = document.createElement('div')
        // images.classList.add('images')
        // div.insertAdjacentElement('beforeend', images)
        // images.innerHTML += `
        //   <a href="https://github.com/${o.actor.login}" class="link" target="_blank" rel="noopener"><img src="${o.actor.avatar_url}"/></a>
        // `
        // if (o.org) images.innerHTML += `<a href="https://github.com/${o.org.login}" class="link" target="_blank" rel="noopener"><img src="${o.org.avatar_url}"/></a>`


        let info = document.createElement('div')
        div.insertAdjacentElement('beforeend', info)
        // info.innerHTML = `
        //   <p><small><a href="https://github.com/${o.repo.name}" class="link" target="_blank" rel="noopener">${o.repo.name}</a></small></p>
        // `

        // Add Date/Time
        info.innerHTML += `<p style="color: gray;"><small>${formatDate(new Date(o.created_at))}</small></p>`

        // -------------- Push Event ----------------
        if (o.type === 'PushEvent'){
          o.payload.commits.forEach(c => {
            info.innerHTML += `
            <p><a href="https://github.com/${o.actor.login}" class="link" target="_blank" rel="noopener">${o.actor.login}</a> committed to <a href="https://github.com/${o.repo.name}" class="link" target="_blank" rel="noopener">${o.repo.name}</a></p>
            <p><small><a href="${c.url}" class="link" target="_blank" rel="noopener">${c.message}</a></small></p>
            `
          })
        } 
        
        // Starring
        else if (o.type === 'WatchEvent'){
          info.innerHTML += `<p><a href="https://github.com/${o.actor.login}" class="link" target="_blank" rel="noopener">${o.actor.login}</a> starred <a href="https://github.com/${o.repo.name}" class="link" target="_blank" rel="noopener">${o.repo.name}</a></p>`
        } 
        
        // Creating Repositories or Branches
        else if (o.type === 'CreateEvent'){
          if (o.payload.ref) info.innerHTML += `<p><a href="https://github.com/${o.actor.login}" class="link" target="_blank" rel="noopener">${o.actor.login}</a> created branch '${o.payload.ref}' on <a href="https://github.com/${o.repo.name}" class="link" target="_blank" rel="noopener">${o.repo.name}</a></p>`
          else {
            info.innerHTML += `
            <p><a href="https://github.com/${o.actor.login}" class="link" target="_blank" rel="noopener">${o.actor.login}</a> created <a href="https://github.com/${o.repo.name}" class="link" target="_blank" rel="noopener">${o.repo.name}</a></p>
            <p><small><a href="${o.payload.url}" class="link" target="_blank" rel="noopener">${o.payload.description}</a></small></p>
            `
          }
        }

        if (show) commits.insertAdjacentElement("beforeend", div);
      })
    })
// })

// ------------------- Date Stuff -------------------
function dateComponentPad(value) {
  var format = String(value);

  return format.length < 2 ? '0' + format : format;
}

function formatDate(date) {
  let now = new Date()
  let millisecondsAgo = now.getTime() - date.getTime()
  let secondsAgo = millisecondsAgo / (1000);
  let minutesAgo = millisecondsAgo / (1000 * 60);
  let hoursAgo = millisecondsAgo / (1000 * 60 * 60);
  let daysAgo = millisecondsAgo / (1000 * 60 * 60 * 24);
  let yearsAgo = millisecondsAgo / (1000 * 60 * 60 * 24 * 365);
  // console.log('secondsAgo', secondsAgo, Math.floor(secondsAgo))
  // console.log('minutesAgo', minutesAgo, Math.floor(minutesAgo))
  // console.log('hoursAgo', hoursAgo, Math.floor(hoursAgo))
  // console.log('daysAgo', daysAgo, Math.floor(daysAgo))
  // console.log('yearsAgo', yearsAgo)
  // console.log('secondsAgo', secondsAgo)

  if (Math.floor(minutesAgo) === 0) return `${Math.floor(secondsAgo)} second${(Math.floor(secondsAgo) === 1) ? '' : 's'} ago`
  else if (Math.floor(hoursAgo) === 0) return `${Math.floor(minutesAgo)} minute${(Math.floor(minutesAgo) === 1) ? '' : 's'} ago`
  else if (Math.floor(daysAgo) === 0) return `${Math.floor(hoursAgo)} hour${(Math.floor(hoursAgo) === 1) ? '' : 's'} ago`
  else if (Math.floor(yearsAgo) === 0) return `${Math.floor(daysAgo)} day${(Math.floor(daysAgo) === 1) ? '' : 's'} ago`
  else return `${Math.floor(yearsAgo)} year${(Math.floor(yearsAgo) === 1) ? '' : 's'} ago`

  // var datePart = [ date.getMonth() + 1, date.getDate() , date.getFullYear()].map(dateComponentPad);
  // var timePart = [ date.getHours(), date.getMinutes(), date.getSeconds() ].map(dateComponentPad);

  // return datePart.join('-') + ' ' + timePart.join(':');
}