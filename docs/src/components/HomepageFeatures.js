import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Cross-Platform',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        OpenCloud Mobile works seamlessly on iOS and Android, with a shared codebase 
        built on React Native and Expo for consistent user experience.
      </>
    ),
  },
  {
    title: 'Modern Authentication',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Secure your data with modern OpenID Connect authentication. WebFinger discovery
        makes server connections simple and straightforward.
      </>
    ),
  },
  {
    title: 'File Access & Sync',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Access your cloud files on the go. View, share and sync your content 
        between your mobile device and your OpenCloud server.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
