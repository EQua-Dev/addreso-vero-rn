module.exports = {
  overrides: [
    {
      exclude: /\/node_modules\//,
      presets: ['module:react-native-builder-bob/babel-preset'],
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: false }],
        ['@babel/plugin-transform-private-methods', { loose: false }],
        [
          '@babel/plugin-transform-private-property-in-object',
          { loose: false },
        ],
      ],
    },
    {
      include: /\/node_modules\//,
      presets: ['module:@react-native/babel-preset'],
    },
  ],
};
