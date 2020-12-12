class SubmittedGames extends HTMLElement {
    constructor() {
        super();
    }

connectedCallback() {
    this.innerHTML = `
            <section id="game" style="display:none;"></section>
            <section id="temp-message" style="display:none;" class="flex-center flex"></section>
            <button id="back" style="display:none;">
                Back to Games List
            </button>
            <div id="submitted-game-gallery" class="gallery"></div>
    `;
}
}

customElements.define('submitted-games', SubmittedGames);

