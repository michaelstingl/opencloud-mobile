/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  // Define a custom sidebar for better organization
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/getting-started',
        'guides/configuration',
        'guides/authentication',
        'guides/http-standards/index',
        'guides/openapi-management',
        'guides/api-request-flow',
        'guides/api-communication',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/how-to-contribute',
        'contributing/testing',
        'contributing/e2e-testing',
        'contributing/secrets-management',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
      ],
    },
  ],
};
