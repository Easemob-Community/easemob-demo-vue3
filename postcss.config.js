// H5 移动端适配：以 375 设计稿为基准将 px 转为 vw
// 不想转换的 px 可给元素加 `.keep-px` 类（见 selectorBlackList）
export default {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px',
      viewportWidth: 375,
      unitPrecision: 5,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['keep-px'],
      minPixelValue: 1,
      mediaQuery: false,
      // 组件库（含后续接入的 vue3-uikit）不参与 H5 px→vw 转换
      // 登录页、布局壳、会话/通讯录页为桌面优先的固定像素布局，亦不参与转换
      exclude: [
        /node_modules/,
        /[\\/]login[\\/]/,
        /[\\/]layout[\\/]/,
        /[\\/]views[\\/]chat[\\/]/,
        /[\\/]views[\\/]contacts[\\/]/,
      ],
    },
  },
}
