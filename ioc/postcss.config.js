module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16,
      unitPrecision: 5,
      propList: ['*'],
      selectorBlackList: ['.el-', '.no-rem'],
      replace: true,
      mediaQuery: false,
      minPixelValue: 1,
      // 当前只保留适配骨架，未来迁入 operationScreen 后才会转换对应目录。
      exclude: /^(?!.*operationScreen).*$/
    }
  }
}
