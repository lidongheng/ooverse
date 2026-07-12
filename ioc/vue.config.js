const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const resolve = (directory) => path.join(__dirname, directory)
const timestamp = new Date().getTime()

module.exports = defineConfig({
  transpileDependencies: true,
  // 本地开发使用根路径，生产环境部署到统一镜像中的 ioc 子目录。
  publicPath: process.env.NODE_ENV === 'production' ? '/ooverse/ioc/' : '/',
  outputDir: 'dist/ioc',
  assetsDir: 'static',
  lintOnSave: false,
  productionSourceMap: false,
  pages: {
    index: {
      entry: 'src/index.js',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'index']
    },
    cost: {
      entry: 'src/cost.js',
      filename: 'cost.html',
      chunks: ['chunk-vendors', 'cost']
    },
    asset: {
      entry: 'src/asset.js',
      filename: 'asset.html',
      chunks: ['chunk-vendors', 'asset']
    },
    express: {
      entry: 'src/express.js',
      filename: 'express.html',
      chunks: ['chunk-vendors', 'express']
    }
  },
  configureWebpack: (config) => {
    config.context = path.resolve(__dirname, './')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve('src'),
      '@shared': resolve('../shared')
    }

    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimize = true
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log']
            }
          }
        }),
        new CssMinimizerPlugin()
      ]

      config.plugins.push(
        new FileManagerPlugin({
          onStart: {
            delete: ['./dist/ioc.zip']
          },
          onEnd: {
            archive: [
              {
                source: './dist/ioc',
                destination: './dist/ioc.zip'
              }
            ]
          }
        })
      )
    }
  },
  chainWebpack: (config) => {
    // Vue 3.5 编译时 feature flags，避免构建时产生相关警告。
    const vueFlags = {
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production' ? 'true' : 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    }

    if (config.plugins.has('feature-flags')) {
      config.plugin('feature-flags').tap((args) => {
        Object.assign(args[0], vueFlags)
        return args
      })
    } else {
      const webpack = require('webpack')
      config.plugin('feature-flags').use(webpack.DefinePlugin, [vueFlags])
    }

    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], vueFlags)
      return definitions
    })

    config.plugins.delete('prefetch')

    if (process.env.NODE_ENV === 'production') {
      // 为生产文件加入构建时间戳，避免发布后继续命中旧缓存。
      config.output.filename(`js/[name].${timestamp}.js`).end()
      config.output.chunkFilename(`js/[name].${timestamp}.js`).end()
      config.plugin('compressionPlugin').use(
        new CompressionWebpackPlugin({
          threshold: 10240,
          test: /\.(js|css|html)$/
        })
      )
    }

    // 让 shared 目录中的 JavaScript 和 Vue 文件参与当前项目的编译。
    config.module
      .rule('js')
      .include.add(resolve('src'))
      .add(resolve('../shared'))

    config.module
      .rule('vue')
      .include.add(resolve('src'))
      .add(resolve('../shared'))

    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif)(\?.*)?$/)
      .set('parser', {
        dataUrlCondition: {
          maxSize: 4000 * 1024
        }
      })

    config.optimization.splitChunks({
      chunks: 'async',
      minSize: 1000 * 1024,
      minChunks: 1,
      maxInitialRequests: 3,
      maxAsyncRequests: 5,
      automaticNameDelimiter: '~',
      cacheGroups: {
        elementPlus: {
          name: 'element-plus',
          test: /element-plus/,
          priority: 20,
          reuseExistingChunk: true
        },
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'chunk-common',
          priority: -20,
          minChunks: 2,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    })
  }
})
