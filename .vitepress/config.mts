import { defineConfig } from 'vitepress'

const siteCopyright = 'Copyright © 2024-present Garrett Flynn and Contributors';

export default defineConfig({

  lang: 'en-US',
  title: "Brains@Play",
  description: "An API for 8B Brains",
  
  themeConfig: {

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide' },
      { text: 'Blog', link: '/posts' },
      { text: 'Team', link: '/team' },
      { text: 'Contact', link: 'mailto:garrettmflynn@gmail.com' }
    ],

    sidebar: {
      '/guide': [
        { text: 'Getting Started', link: '/guide' },
      ],
      '/projects': [
          {
            text: 'The Brains@Play Initiative',
            items: [
              { text: 'International Competition', link: '/projects/initiative/brains-and-games-competition' },
              { text: 'High School Course', link: '/projects/initiative/brains-at-play-course' },
              { text: 'Public Engagement Event', link: '/projects/initiative/livewire' },
            ]
          }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/neuralinterfaces/brainsatplay' }
    ],

    aside: false,
    footer: {
      message: 'Built with 🧠 by Garrett Flynn',
      copyright: siteCopyright
    }
  }
})
