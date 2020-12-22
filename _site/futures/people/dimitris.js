class Dimitris extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <h3>Dimitris Grammenos</h3>
        <i>Initiative Co-Founder</i>
        <p>Dimitris Grammenos is a Principal Researcher at the Institute of Computer Science of the Foundation for Research and Technology - Hellas. He has more than 20 years of international R&D experience in the domains of Human-Computer Interaction (HCI), User Experience, Interaction Design and Universal Design. Over the years, he has created numerous innovative interactive systems, several of which are installed in public spaces (museums, airports, exhibitions, etc.) and used by many thousands of people.</p>
        <p>As a member of the Ambient Intelligence (AmI) Programme of ICS-FORTH, Grammenos is heavily involved in the design and development of novel, human-centred, AmI environments and interactive applications. He is a member of the Program Board of several international conferences and Journals and member to MSc and PhD dissertation and examination committees.
</p>
`;
    }
}

customElements.define('dimitris-grammenos', Dimitris);

