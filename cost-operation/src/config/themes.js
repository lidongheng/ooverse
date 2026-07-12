/**
 * 主题配置文件
 * 定义亮白和暗黑主题的所有颜色变量
 */

export const THEME_CONFIG = {
  // 默认主题
  defaultTheme: 'light',
  
  // 主题定义
  themes: {
    light: {
      name: '亮白主题',
      key: 'light',
      colors: {
        // 基础颜色
        '--theme-bg-primary': '#ffffff',           // 主背景色
        '--theme-bg-secondary': '#f8f9fa',         // 次背景色
        '--theme-bg-tertiary': '#f1f3f4',          // 三级背景色
        '--theme-bg-hover': '#f5f5f5',             // 悬停背景色
        '--theme-bg-active': '#e9ecef',            // 激活背景色
        
        // 文字颜色
        '--theme-text-primary': '#212529',         // 主文字色
        '--theme-text-secondary': '#6c757d',       // 次文字色
        '--theme-text-tertiary': '#adb5bd',        // 三级文字色
        '--theme-text-disabled': '#dee2e6',        // 禁用文字色
        '--theme-text-inverse': '#ffffff',         // 反色文字
        
        // 边框颜色
        '--theme-border-primary': '#dee2e6',       // 主边框色
        '--theme-border-secondary': '#e9ecef',     // 次边框色
        '--theme-border-light': '#f8f9fa',         // 浅边框色
        '--theme-border-dark': '#adb5bd',          // 深边框色
        
        // 阴影
        '--theme-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        '--theme-shadow': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        '--theme-shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        '--theme-shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        
        // 品牌色
        '--theme-primary': '#409eff',              // 主品牌色
        '--theme-primary-light': '#79bbff',        // 浅主品牌色
        '--theme-primary-dark': '#337ecc',         // 深主品牌色
        '--theme-primary-bg': '#ecf5ff',           // 主品牌背景色
        
        // 状态色
        '--theme-success': '#67c23a',              // 成功色
        '--theme-success-light': '#95d475',        // 浅成功色
        '--theme-success-bg': '#f0f9ff',           // 成功背景色
        
        '--theme-warning': '#e6a23c',              // 警告色
        '--theme-warning-light': '#ebb563',        // 浅警告色
        '--theme-warning-bg': '#fdf6ec',           // 警告背景色
        
        '--theme-danger': '#f56c6c',               // 危险色
        '--theme-danger-light': '#f78989',         // 浅危险色
        '--theme-danger-bg': '#fef0f0',            // 危险背景色
        
        '--theme-info': '#909399',                 // 信息色
        '--theme-info-light': '#a6a9ad',           // 浅信息色
        '--theme-info-bg': '#f4f4f5',              // 信息背景色
        
        // 卡片和容器
        '--theme-card-bg': '#ffffff',              // 卡片背景色
        '--theme-card-border': '#ebeef5',          // 卡片边框色
        '--theme-card-shadow': '0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04)',
        
        // 表单元素
        '--theme-input-bg': '#ffffff',             // 输入框背景色
        '--theme-input-border': '#dcdfe6',         // 输入框边框色
        '--theme-input-border-focus': '#409eff',   // 输入框聚焦边框色
        '--theme-input-placeholder': '#c0c4cc',    // 占位符颜色
        
        // 表格
        '--theme-table-bg': '#ffffff',             // 表格背景色
        '--theme-table-header-bg': '#fafafa',      // 表头背景色
        '--theme-table-stripe-bg': '#fafafa',      // 表格斑马纹背景色
        '--theme-table-border': '#ebeef5',         // 表格边框色
        '--theme-table-hover-bg': '#f5f7fa',       // 表格悬停背景色
        
        // 菜单和导航
        '--theme-menu-bg': '#ffffff',              // 菜单背景色
        '--theme-menu-hover-bg': '#ecf5ff',        // 菜单悬停背景色
        '--theme-menu-active-bg': '#409eff',       // 菜单激活背景色
        '--theme-menu-text': '#303133',            // 菜单文字色
        '--theme-menu-text-active': '#ffffff',     // 菜单激活文字色
      }
    },
    
    dark: {
      name: '暗黑主题',
      key: 'dark',
      colors: {
        // 基础颜色
        '--theme-bg-primary': '#1a1a1a',           // 主背景色
        '--theme-bg-secondary': '#2d2d2d',         // 次背景色
        '--theme-bg-tertiary': '#404040',          // 三级背景色
        '--theme-bg-hover': '#363636',             // 悬停背景色
        '--theme-bg-active': '#404040',            // 激活背景色
        
        // 文字颜色
        '--theme-text-primary': '#ffffff',         // 主文字色
        '--theme-text-secondary': '#b3b3b3',       // 次文字色
        '--theme-text-tertiary': '#8c8c8c',        // 三级文字色
        '--theme-text-disabled': '#595959',        // 禁用文字色
        '--theme-text-inverse': '#1a1a1a',         // 反色文字
        
        // 边框颜色
        '--theme-border-primary': '#404040',       // 主边框色
        '--theme-border-secondary': '#2d2d2d',     // 次边框色
        '--theme-border-light': '#262626',         // 浅边框色
        '--theme-border-dark': '#595959',          // 深边框色
        
        // 阴影
        '--theme-shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        '--theme-shadow': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        '--theme-shadow-md': '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        '--theme-shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3)',
        
        // 品牌色
        '--theme-primary': '#409eff',              // 主品牌色
        '--theme-primary-light': '#66b3ff',        // 浅主品牌色
        '--theme-primary-dark': '#3375b9',         // 深主品牌色
        '--theme-primary-bg': '#1a2332',           // 主品牌背景色
        
        // 状态色
        '--theme-success': '#67c23a',              // 成功色
        '--theme-success-light': '#85ce61',        // 浅成功色
        '--theme-success-bg': '#1f2518',           // 成功背景色
        
        '--theme-warning': '#e6a23c',              // 警告色
        '--theme-warning-light': '#ebb563',        // 浅警告色
        '--theme-warning-bg': '#2b2111',           // 警告背景色
        
        '--theme-danger': '#f56c6c',               // 危险色
        '--theme-danger-light': '#f78989',         // 浅危险色
        '--theme-danger-bg': '#2b1616',            // 危险背景色
        
        '--theme-info': '#909399',                 // 信息色
        '--theme-info-light': '#a6a9ad',           // 浅信息色
        '--theme-info-bg': '#1d1d1f',              // 信息背景色
        
        // 卡片和容器
        '--theme-card-bg': '#2d2d2d',              // 卡片背景色
        '--theme-card-border': '#404040',          // 卡片边框色
        '--theme-card-shadow': '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 6px rgba(0, 0, 0, 0.3)',
        
        // 表单元素
        '--theme-input-bg': '#2d2d2d',             // 输入框背景色
        '--theme-input-border': '#404040',         // 输入框边框色
        '--theme-input-border-focus': '#409eff',   // 输入框聚焦边框色
        '--theme-input-placeholder': '#8c8c8c',    // 占位符颜色
        
        // 表格
        '--theme-table-bg': '#2d2d2d',             // 表格背景色
        '--theme-table-header-bg': '#1a1a1a',      // 表头背景色
        '--theme-table-stripe-bg': '#262626',      // 表格斑马纹背景色
        '--theme-table-border': '#404040',         // 表格边框色
        '--theme-table-hover-bg': '#363636',       // 表格悬停背景色
        
        // 菜单和导航
        '--theme-menu-bg': '#2d2d2d',              // 菜单背景色
        '--theme-menu-hover-bg': '#1a2332',        // 菜单悬停背景色
        '--theme-menu-active-bg': '#409eff',       // 菜单激活背景色
        '--theme-menu-text': '#ffffff',            // 菜单文字色
        '--theme-menu-text-active': '#ffffff',     // 菜单激活文字色
      }
    }
  }
}

export default THEME_CONFIG 