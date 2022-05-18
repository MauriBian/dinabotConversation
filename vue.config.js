
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "~@/styles/main.scss";'
      }
    }
  },
  // Change build paths to make them Maven compatible
  // see https://cli.vuejs.org/config/
  outputDir: 'target/dist',
  assetsDir: 'static'
}