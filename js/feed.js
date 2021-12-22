const sources = [
    'garrettmflynn',
    'moothyknight',
    'tinkhauser',
]

const feed = document.getElementById('feed')

sources.forEach(username => {
    fetch("https://github.com/" + username + ".atom", {
        mode: 'cors'
    })
    .then(response => response.text())
    .then(str => {
        console.log(str)
        return new window.DOMParser().parseFromString(str, "text/xml")
    })
    .then(data => {
      console.log(data);
      const items = data.querySelectorAll("item");
      console.log(items)
      let html = ``;
      html += data.body.innerHTML

    //   items.forEach(el => {
    //     html += `
    //     <article>
    //       <img src="${el.querySelector("link").innerHTML}/image/large.png" alt="">
    //       <h2>
    //         <a href="${el.querySelector("link").innerHTML}" target="_blank" rel="noopener">
    //           ${el.querySelector("title").innerHTML}
    //         </a>
    //       </h2>
    //     </article>
    //   `;
    //   })
      console.log(html)
      document.body.insertAdjacentHTML("afterbegin", html);
    })
})
