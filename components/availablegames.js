class AvailableGames extends HTMLElement {
    constructor() {
        super();
    }

connectedCallback() {
    this.innerHTML = `
      <div id="game-gallery" class="gallery">
      <a id="brainstorm" class="game" onclick="window.location.href='/sdk/examples/brainstorm'" style="background-image: url('sdk/examples/brainstorm.png')">
        <div class="game-text">
          <h3>Brainstorm</h3>
          <i class="small">Brains@Play</i>
          <p>Couple minds across social, cultural, and political boundaries.</p>
        </div>
        <div class="game-mask"></div>
      </a>
    </div>
    `;
}
}

customElements.define('available-games', AvailableGames);

