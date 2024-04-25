module.exports = {
    // Other Jest configuration options...
  
    transform: {
      '^.+\\.jsx?$': 'babel-jest'
    },
  
    // Ignore files from node_modules
    transformIgnorePatterns: ['/node_modules/(?!(@uiball/loaders)/)'],
  };
  