class Nav extends HTMLElement {
    constructor() {
        super();
    }

connectedCallback() {
    this.innerHTML = `
      <a href="/" class="logo"><h4>Brains@Play</h4></a>
    <div id="links" class="stretch">
      <a href="/" class="link">Home</a>
<!--      <a href="about.html" class="link">Our Story</a>-->
      <a href="/sdk" class="link">SDK</a>
<!--      <a href="./games.html" class="link">Games</a>-->
      <a href="/futures" class="link">Futures Initiative</a>
<!--      <a href="projects.html" class="link">Projects</a>-->
<!--      <a href="contact.html" class="link">Contact</a>-->
    </div>
    `;
}
}

customElements.define('nav-bar', Nav);

