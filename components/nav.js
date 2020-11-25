class Nav extends HTMLElement {
    constructor() {
        super();
    }

connectedCallback() {
    this.innerHTML = `
      <a href="/index.html" class="logo"><h3>Brains@Play</h3></a>
    <div id="links" class="stretch">
      <a href="/index.html" class="link">Home</a>
<!--      <a href="about.html" class="link">Our Story</a>-->
      <a href="/app/brainstorm.html" class="link">App</a>
<!--      <a href="./games.html" class="link">Games</a>-->
      <a href="/futures-initiative.html" class="link">Futures Initiative</a>
<!--      <a href="projects.html" class="link">Projects</a>-->
<!--      <a href="contact.html" class="link">Contact</a>-->
    </div>
    `;
}
}

customElements.define('nav-bar', Nav);

