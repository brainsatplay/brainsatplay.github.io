// Elements
const fundTotal = document.getElementById('fund-total-current')
const latestContributor = document.getElementById('fund-latest-contributor')
const displayName = document.getElementById('fund-latest-contributor-name')
const actionReadout = document.getElementById('fund-latest-contributor-action')

// Variables
let total = 0
let decoder = new TextDecoder();


// Request
fetch(`${SERVER_URI}/fund`,{
    method: 'GET',
    mode: 'cors',
}).then(async res => {

    // Recieve Contribution Information as a Readable Stream (organized by latest)
    let chunkCount = 0
    const reader = res.body.getReader();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value)
        chunk.split('}').forEach(json => {
            try {
                const dict = JSON.parse(`${json}}`)
                dict.amount /= 100
                total += dict.amount
                fundTotal.innerHTML = `$${total}`

                if (dict.order === 0){
                    latestContributor.style.opacity = 1
                    displayName.innerHTML = dict.displayName || 'anonymous'
                    actionReadout.innerHTML = `contributed $${dict.amount} USD`
                }
            } catch {}
            chunkCount++
        })
    }

}).catch(e => {
    console.error(e)
})