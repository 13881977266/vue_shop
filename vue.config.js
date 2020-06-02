module.exports = {
  /* 部署生产环境和开发环境下的URL：可对当前环境进行区分，baseUrl 从 Vue CLI 3.3 起已弃用，要使用publicPath */

  /* baseUrl: process.env.NODE_ENV === 'production' ? './' : '/' */
  // 修改 publicPath: process.env.NODE_ENV === "production" ? "/你在Tomcat新建的文件夹名称/" : "/",
  // publicPath: process.env.NODE_ENV === 'production' ? '/login-demo/' : '/',
  publicPath: './',
  /* 输出文件目录：在npm run build时，生成文件的目录名称 */
  outputDir: 'dist',
  /* 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录 */
  assetsDir: 'assets',
  /* 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度 */
  productionSourceMap: false,
  /* 默认情况下，生成的静态资源在它们的文件名中包含了 hash 以便更好的控制缓存，你可以通过将这个选项设为 false 来关闭文件名哈希。(false的时候就是让原来的文件名不改变) */
  filenameHashing: false,
  /* 代码保存时进行eslint检测 */
  lintOnSave: true,
  /* webpack-dev-server 相关配置 */
  devServer: {
    /* 自动打开浏览器 */
    open: false,
    /* 设置为0.0.0.0则所有的地址均能访问 */
    // host: '0.0.0.0',
    // port: 8080,
    // https: false,
    // hotOnly: false,
    /* 使用代理 */
    proxy: {
      '/api2': {
        // target: 'http://127.0.0.1:8088',
        target: 'http://127.0.0.1:8888',
        // ws: true, // 是否启用web sockets
        // secure: false, // 使用的是http协议则设置为false，https协议则设置为true
        changeOrigin: true,
        pathRewrite: {
          // '^/api2/': ''
          '/api/private/v1/api2/': '/api/private/v1/'
        }
      },
      '/api3': {
        target: 'http://127.0.0.1:8088',
        changeOrigin: true,
        pathRewrite: {
          '^/api3': ''
        }
      }
    }
  }
}
