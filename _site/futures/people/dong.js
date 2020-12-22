class Dong extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <h3>Dong Song</h3>
        <i>Initiative Co-Founder</i>
        <p>Dong Song is a Research Associate Professor of Biomedical Engineering and Co-Director of the Center for Neural Engineering at the University of Southern California (USC).  His research interests include nonlinear dynamical modeling of the nervous system, hippocampal memory prosthesis, neural interface technologies, and development of novel modeling strategies incorporating both statistical and mechanistic modeling methods.</p>
        <p>Song received his B.S. degree in Biophysics from the University of Science and Technology of China in 1994, and his Ph.D. degree in Biomedical Engineering from the University of Southern California in 2004.  He became a Research Assistant Professor in 2006, and a Research Associate Professor in 2013, at the Department of Biomedical Engineering, USC.  He received the James H. Zumberge Individual Award at USC in 2008, the Outstanding Paper Award of IEEE Transactions on Neural Systems and Rehabilitation Engineering in 2013, and the Society for Brain Mapping and Therapeutics Young Investigator Award in 2018.  Dr. Song has published over 160 peer-reviewed journal articles, book chapters, and reviewed conference papers.  He is a member of American Statistical Association, Biomedical Engineering Society, IEEE, Society for Neuroscience, Society for Brain Mapping and Therapeutics, Organization for Computational Neurosciences, and National Academy of Inventors.  Dr. Song’s research is supported by DARPA, NSF, and NIH.</p>
`;
    }
}

customElements.define('dong-song', Dong);

