module.exports = function(api) {
  api.cache(true); // Enable caching for better build performance.

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-react',
  ];

  const plugins = [];

  return {
    presets,
    plugins,
  };
};
