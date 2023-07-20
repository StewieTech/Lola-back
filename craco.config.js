module.exports = {
    webpack: {
      configure: {
        resolve: {
          fallback: {
            zlib: require.resolve('browserify-zlib'),
          },
        },
      },
    },
  };
  