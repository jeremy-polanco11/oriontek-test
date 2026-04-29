module.exports = (api) => {
  const isDev = api.env('development');
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { esmodules: true },
          bugfixes: true,
        },
      ],
      ['@babel/preset-react', { runtime: 'automatic', development: isDev }],
      '@babel/preset-typescript',
    ],
    plugins: [isDev && require.resolve('react-refresh/babel')].filter(Boolean),
  };
};
