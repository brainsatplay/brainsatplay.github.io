class Marientina extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <h3>Marientina Gotsis</h3>
        <i>Initiative Co-Founder</i>
        <p>Marientina Gotsis has a broad background in arts, design and engineering with a special interest in interactive entertainment applications for health, happiness and rehabilitation. She founded and leads USC's Games for Health Initiative since 2007, connecting health professionals with innovation in various forms of interactive media. She is co-founder and director of the <a href="http://cmbhc.usc.edu/" class="text">Creative Media & Behavioral Health Center</a>, an organized research unit between the School of Cinematic Arts and the Keck School of Medicine, which was established in 2010. This center designs, develops and evaluates entertainment applications at the intersection of behavioral science, medicine and public health.
        </p>
        <p>Her teams have developed interactive experiences and products to help increase literacy and public awareness, change behavior, and improve assessment and treatment techniques with funding from the National Institutes of Health, Robert Wood Johnson Foundation, Palix Foundation, Craig Neilsen Foundation, Department of Education, Department of Defense, Children’s Hospital Los Angeles and the Shafallah Center for Special Needs Children. Her students have created award-winning work that has been showcased at Serious Games, IndieCade, Games for Change, ACM SIGGRAPH and won awards by Unity, Steam, and the USDA. Gotsis is an advisor the USC mHealth Collaboratory, the USC Institute for Integrative Health and the Center for Technology Innovation in Pediatrics. In 2015, the center commercially released The Brain Architecture Game, a tabletop game for teaching the science of early childhood, played by thousands of people around the world.</p>
    `;
    }
}

customElements.define('marientina-gotsis', Marientina);

