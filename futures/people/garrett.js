class Garrett extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
                    <h3>Garrett Flynn</h3>
                    <i>Initiative Coordinator</i>
                    <p>Garrett Flynn is a progressive degree student in the Computational Neuroscience (BS) and Media Arts, Games, and Health (MA) programs. Working at the intersection of neuroscience, ethics, and interactive media, he leads several interdisciplinary projects out of the <a href="slab.usc.edu" class="text">Neural Modeling and Interface Lab</a> with <a href="#people" class="text" onclick="getPerson('dong-song')">Dong Song</a>.
                </p>
`;
    }
}

customElements.define('garrett-flynn', Garrett);

