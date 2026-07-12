module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',
      viewportWidth: 1920,
      viewportUnit: 'vw',
      mediaQuery: true,
      minPixelValue: 0,
      replace: true,
      include: [
        /^.*\/src\/.*$/,
        /^.*\/shared\/.*$/
      ]
    }
  }
}
