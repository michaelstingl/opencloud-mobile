const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'OpenCloud Mobile',
  tagline: 'Cross-platform mobile client for OpenCloud servers',
  url: 'https://michaelstingl.github.io',
  baseUrl: '/opencloud-mobile/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'michaelstingl', // Usually your GitHub org/user name.
  projectName: 'opencloud-mobile', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/michaelstingl/opencloud-mobile/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/michaelstingl/opencloud-mobile/edit/main/docs/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'OpenCloud Mobile',
        logo: {
          alt: 'OpenCloud Mobile Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'doc',
            docId: 'api/overview',
            position: 'left',
            label: 'API Reference',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/michaelstingl/opencloud-mobile',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/michaelstingl/opencloud-mobile/discussions',
              },
              {
                label: 'GitHub Issues',
                href: 'https://github.com/michaelstingl/opencloud-mobile/issues',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/michaelstingl/opencloud-mobile',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} OpenCloud Mobile. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});
