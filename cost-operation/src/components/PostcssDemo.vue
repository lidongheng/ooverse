<template>
  <div class="postcss-demo">
    <div class="demo-content">
      <h1 class="text-primary">📱 PostCSS px-to-viewport 演示</h1>
      <div class="version-info">
        <el-tag type="success">postcss@8.4.41</el-tag>
        <el-tag type="info">postcss-px-to-viewport@1.1.1</el-tag>
        <el-tag type="warning">Legacy 兼容配置</el-tag>
      </div>
      
      <!-- 自定义样式测试 -->
      <div class="custom-box">
        <h2>自定义样式测试</h2>
        <p>这个盒子宽度为 300px，高度为 200px，基于 1920px 设计稿应该被转换为 vw 单位</p>
        <div class="small-element">小元素 50px × 50px</div>
      </div>
      
      <!-- Element Plus 组件测试 -->
      <div class="element-test">
        <h2>Element Plus 组件测试</h2>
        <p>以下 Element Plus 组件的样式也应该被转换为 vw 单位：</p>
        
        <div class="component-group">
          <el-button type="primary" size="large">大按钮</el-button>
          <el-button type="success" size="default">默认按钮</el-button>
          <el-button type="warning" size="small">小按钮</el-button>
        </div>
        
        <div class="component-group">
          <el-input 
            v-model="inputValue" 
            placeholder="输入框测试"
            style="width: 300px;"
          />
        </div>
        
        <div class="component-group">
          <el-card class="demo-card">
            <template #header>
              <div class="card-header">
                <span>卡片标题</span>
              </div>
            </template>
            <p>这是一个测试卡片，padding 和 margin 应该被转换为 vw</p>
            <el-tag>标签 1</el-tag>
            <el-tag type="success">标签 2</el-tag>
            <el-tag type="info">标签 3</el-tag>
          </el-card>
        </div>
      </div>
      
      <!-- 配置信息 -->
      <div class="config-info">
        <h2>当前配置信息</h2>
        <div class="config-details">
          <div class="config-item">
            <strong>设计稿宽度:</strong> 1920px
          </div>
          <div class="config-item">
            <strong>转换精度:</strong> 5位小数
          </div>
          <div class="config-item">
            <strong>最小转换值:</strong> 1px
          </div>
          <div class="config-item">
            <strong>媒体查询转换:</strong> 否
          </div>
          <div class="config-item">
            <strong>警告屏蔽:</strong> 是 (postcss.plugin deprecated)
          </div>
        </div>
      </div>
      
      <!-- 转换说明 -->
      <div class="conversion-info">
        <h2>转换说明 (1920px 设计稿)</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>300px</strong> → <span class="vw-value">{{ calculateVw(300) }}vw</span>
          </div>
          <div class="info-item">
            <strong>200px</strong> → <span class="vw-value">{{ calculateVw(200) }}vw</span>
          </div>
          <div class="info-item">
            <strong>50px</strong> → <span class="vw-value">{{ calculateVw(50) }}vw</span>
          </div>
          <div class="info-item">
            <strong>20px</strong> → <span class="vw-value">{{ calculateVw(20) }}vw</span>
          </div>
        </div>
      </div>
      
      <!-- 检查工具 -->
      <div class="check-tools">
        <h2>检查工具</h2>
        <el-button @click="checkConversion" type="info">
          🔍 检查样式转换结果
        </el-button>
        <el-button @click="checkVersions" type="success">
          📦 检查版本信息
        </el-button>
        <div v-if="conversionResult" class="result">
          <h3>检查结果：</h3>
          <pre>{{ conversionResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const inputValue = ref('测试文本')
const conversionResult = ref('')

// 计算px转vw的值 (基于1920px设计稿)
const calculateVw = (px) => {
  return (px / 1920 * 100).toFixed(5)
}

const checkConversion = () => {
  const demoElement = document.querySelector('.custom-box')
  const elButton = document.querySelector('.el-button')
  const elInput = document.querySelector('.el-input')
  
  const customBoxStyle = window.getComputedStyle(demoElement)
  const buttonStyle = window.getComputedStyle(elButton)
  const inputStyle = window.getComputedStyle(elInput)
  
  conversionResult.value = `
样式转换检查 (1920px 设计稿):

自定义样式:
- .custom-box width: ${customBoxStyle.width}
- .custom-box height: ${customBoxStyle.height}
- .custom-box padding: ${customBoxStyle.padding}

Element Plus 样式:
- .el-button padding: ${buttonStyle.padding}
- .el-button height: ${buttonStyle.height}
- .el-input height: ${inputStyle.height}

转换对照表:
- 300px = ${calculateVw(300)}vw (300 ÷ 1920 × 100)
- 200px = ${calculateVw(200)}vw (200 ÷ 1920 × 100)
- 50px = ${calculateVw(50)}vw (50 ÷ 1920 × 100)

💡 如果显示 vw 单位，说明转换成功！
如果仍显示 px 单位，检查 postcss.config.js 配置。
  `
}

const checkVersions = () => {
  conversionResult.value = `
版本信息检查:

PostCSS 配置:
- 主版本: postcss@8.4.41 ✅
- 插件版本: postcss-px-to-viewport@1.1.1 ✅
- 兼容性: Legacy API with warning suppression ✅

配置方案:
- 警告屏蔽: console.warn 过滤
- 双插件配置: 源码 + Element Plus 分离处理
- 跨平台正则: /node_modules[\\\/]element-plus/

如需查看详细配置，请参考:
- postcss.config.js (当前配置)
- postcss.config.alternative.js (多种方案)
- docs/POSTCSS_LEGACY_SETUP.md (完整文档)
  `
}
</script>

<style lang="less" scoped>
@import '../styles/themes.less';

.postcss-demo {
  .theme-container();
  padding: 20px;
  min-height: 100vh;
}

.demo-content {
  max-width: 800px;
  margin: 0 auto;
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 28px; /* 应该被转换为 vw */
  }
  
  .version-info {
    text-align: center;
    margin-bottom: 30px;
    
    .el-tag {
      margin: 0 5px;
      font-size: 12px;
    }
  }
}

/* 自定义样式 - 这些 px 值应该被转换 */
.custom-box {
  background-color: var(--theme-bg-secondary);
  .theme-shadow();
  border-radius: 8px;
  padding: 20px;     /* 转换为 vw */
  margin-bottom: 30px; /* 转换为 vw */
  width: 300px;      /* 转换为 vw */
  height: 200px;     /* 转换为 vw */
  
  h2 {
    margin-bottom: 15px;
    font-size: 20px; /* 转换为 vw */
  }
  
  .small-element {
    width: 50px;     /* 转换为 vw */
    height: 50px;    /* 转换为 vw */
    background-color: var(--theme-primary);
    margin: 10px 0;  /* 转换为 vw */
    border-radius: 4px;
  }
}

.element-test {
  margin-bottom: 30px;
  
  h2 {
    margin-bottom: 15px;
    font-size: 20px; /* 转换为 vw */
  }
  
  .component-group {
    margin-bottom: 20px; /* 转换为 vw */
    
    .el-button {
      margin-right: 10px; /* 转换为 vw */
    }
  }
  
  .demo-card {
    width: 400px; /* 转换为 vw */
    
    .card-header {
      font-weight: bold;
      font-size: 16px; /* 转换为 vw */
    }
    
    .el-tag {
      margin-right: 8px; /* 转换为 vw */
    }
  }
}

.config-info {
  background-color: var(--theme-bg-secondary);
  .theme-shadow();
  border-radius: 8px;
  padding: 20px;     /* 转换为 vw */
  margin-bottom: 30px; /* 转换为 vw */
  
  h2 {
    margin-bottom: 15px;
    font-size: 20px; /* 转换为 vw */
    color: var(--theme-primary);
  }
  
  .config-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;        /* 转换为 vw */
    
    .config-item {
      background-color: var(--theme-bg-tertiary);
      padding: 12px;   /* 转换为 vw */
      border-radius: 6px;
      
      strong {
        color: var(--theme-text-primary);
        font-size: 14px; /* 转换为 vw */
        display: inline-block;
        margin-bottom: 5px; /* 转换为 vw */
      }
    }
  }
}

.conversion-info {
  background-color: var(--theme-bg-secondary);
  .theme-shadow();
  border-radius: 8px;
  padding: 20px;     /* 转换为 vw */
  margin-bottom: 30px; /* 转换为 vw */
  
  h2 {
    margin-bottom: 15px;
    font-size: 20px; /* 转换为 vw */
    color: var(--theme-primary);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;        /* 转换为 vw */
    
    .info-item {
      background-color: var(--theme-bg-tertiary);
      padding: 12px;   /* 转换为 vw */
      border-radius: 6px;
      text-align: center;
      
      strong {
        display: block;
        font-size: 16px; /* 转换为 vw */
        margin-bottom: 5px; /* 转换为 vw */
        color: var(--theme-text-primary);
      }
      
      .vw-value {
        color: var(--theme-success);
        font-weight: bold;
        font-size: 14px; /* 转换为 vw */
      }
    }
  }
}

.check-tools {
  background-color: var(--theme-bg-tertiary);
  padding: 20px;     /* 转换为 vw */
  border-radius: 8px;
  
  h2 {
    margin-bottom: 15px;
    font-size: 18px; /* 转换为 vw */
  }
  
  .el-button {
    margin-right: 10px; /* 转换为 vw */
    margin-bottom: 10px; /* 转换为 vw */
  }
  
  .result {
    margin-top: 20px; /* 转换为 vw */
    
    h3 {
      font-size: 16px; /* 转换为 vw */
      margin-bottom: 10px; /* 转换为 vw */
    }
    
    pre {
      background-color: var(--theme-bg-primary);
      padding: 15px;   /* 转换为 vw */
      border-radius: 4px;
      font-size: 12px; /* 转换为 vw */
      line-height: 1.5;
      overflow-x: auto;
    }
  }
}

/* 测试忽略转换的类 */
.ignore {
  width: 100px;  /* 这个不会被转换 */
  height: 100px; /* 这个不会被转换 */
}
</style> 