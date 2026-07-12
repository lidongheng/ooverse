<template>
  <div class="theme-demo">
    <div class="theme-content">
      <h2 class="text-primary">🎨 主题系统演示</h2>
      
      <!-- 主题切换控制 -->
      <div class="theme-controls">
        <h3 class="text-secondary">主题切换</h3>
        <div class="button-group">
          <button 
            class="theme-btn"
            :class="{ active: currentTheme.isLight }"
            @click="switchToTheme('light')"
          >
            ☀️ 亮色主题
          </button>
          <button 
            class="theme-btn"
            :class="{ active: currentTheme.isDark }"
            @click="switchToTheme('dark')"
          >
            🌙 暗黑主题
          </button>
        </div>
        
        <div class="theme-info">
          <p class="text-secondary">
            当前主题: <span class="color-primary">{{ currentTheme.config?.name }}</span>
          </p>
          <p class="text-tertiary">
            通过URL参数测试: <code>?theme=light</code> 或 <code>?theme=dark</code>
          </p>
        </div>
      </div>

      <!-- 颜色演示 -->
      <div class="color-demo">
        <h3 class="text-secondary">色彩展示</h3>
        <div class="color-grid">
          <div class="color-item bg-primary">
            <span class="text-primary">主背景色</span>
          </div>
          <div class="color-item bg-secondary">
            <span class="text-primary">次背景色</span>
          </div>
          <div class="color-item bg-primary-color">
            <span>品牌主色</span>
          </div>
          <div class="color-item bg-success">
            <span>成功状态</span>
          </div>
          <div class="color-item bg-warning">
            <span>警告状态</span>
          </div>
          <div class="color-item bg-danger">
            <span>危险状态</span>
          </div>
        </div>
      </div>

      <!-- 组件演示 -->
      <div class="component-demo">
        <h3 class="text-secondary">组件演示</h3>
        
        <!-- 卡片演示 -->
        <div class="demo-section">
          <h4 class="text-primary">卡片样式</h4>
          <div class="card-demo">
            <div class="demo-card">
              <h5 class="text-primary">主题卡片</h5>
              <p class="text-secondary">这是一个使用主题样式的卡片，会根据当前主题自动调整背景、边框和阴影。</p>
              <div class="card-actions">
                <button class="btn btn-primary">主要按钮</button>
                <button class="btn btn-default">默认按钮</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单演示 -->
        <div class="demo-section">
          <h4 class="text-primary">表单样式</h4>
          <div class="form-demo">
            <el-form label-width="80px">
              <el-form-item label="用户名">
                <el-input placeholder="请输入用户名" class="theme-input-demo" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input type="password" placeholder="请输入密码" class="theme-input-demo" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input type="textarea" placeholder="请输入备注信息" class="theme-input-demo" />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 表格演示 -->
        <div class="demo-section">
          <h4 class="text-primary">表格样式</h4>
          <div class="table-demo">
            <el-table :data="tableData" stripe>
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="age" label="年龄" />
              <el-table-column prop="address" label="地址" />
              <el-table-column label="操作">
                <template #default>
                  <el-button size="small" type="primary">编辑</el-button>
                  <el-button size="small" type="danger">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 开发工具提示 -->
      <div class="dev-tools-tip">
        <h3 class="text-secondary">🛠️ 开发工具</h3>
        <div class="tip-content bg-tertiary">
          <p class="text-primary">在控制台中可以使用以下命令：</p>
          <ul class="text-secondary">
            <li><code>devTools.light()</code> - 切换到亮色主题</li>
            <li><code>devTools.dark()</code> - 切换到暗黑主题</li>
            <li><code>devTools.toggleTheme()</code> - 在两个主题之间切换</li>
            <li><code>devTools.showCurrentTheme()</code> - 查看当前主题信息</li>
            <li><code>devTools.testThemeAnimation()</code> - 测试主题切换动画</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, inject, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ThemeDemo',
  setup() {
    // 注入主题相关方法
    const theme = inject('theme')
    const currentTheme = ref(theme.getCurrentTheme())
    
    // 表格演示数据
    const tableData = ref([
      { name: '张三', age: 25, address: '北京市朝阳区' },
      { name: '李四', age: 30, address: '上海市浦东新区' },
      { name: '王五', age: 28, address: '广州市天河区' },
      { name: '赵六', age: 32, address: '深圳市南山区' }
    ])

    // 切换主题
    const switchToTheme = (themeName) => {
      theme.switchTheme(themeName)
      currentTheme.value = theme.getCurrentTheme()
    }

    // 监听主题变化事件
    const handleThemeChange = (event) => {
      currentTheme.value = theme.getCurrentTheme()
    }

    onMounted(() => {
      window.addEventListener('themeChanged', handleThemeChange)
    })

    onUnmounted(() => {
      window.removeEventListener('themeChanged', handleThemeChange)
    })

    return {
      currentTheme,
      tableData,
      switchToTheme
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/themes.less';

.theme-demo {
  .theme-container();
  padding: 20px;
  min-height: 100vh;
}

.theme-content {
  max-width: 1200px;
  margin: 0 auto;
  
  h2 {
    margin-bottom: 30px;
    text-align: center;
  }
}

// 主题控制区域
.theme-controls {
  margin-bottom: 30px;
  padding: 20px;
  .theme-card();
  border-radius: 8px;

  h3 {
    margin-bottom: 15px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .theme-btn {
    .theme-button(default);
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    .theme-transition();

    &.active {
      .theme-button(primary);
    }
  }

  .theme-info {
    p {
      margin: 5px 0;
    }

    code {
      background-color: @theme-bg-tertiary;
      color: @theme-text-primary;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }
  }
}

// 颜色演示区域
.color-demo {
  margin-bottom: 30px;
  padding: 20px;
  .theme-card();
  border-radius: 8px;

  h3 {
    margin-bottom: 15px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .color-item {
    padding: 20px;
    border-radius: 6px;
    text-align: center;
    .theme-transition();

    span {
      font-weight: 500;
    }
  }
}

// 组件演示区域
.component-demo {
  margin-bottom: 30px;

  .demo-section {
    margin-bottom: 25px;
    padding: 20px;
    .theme-card();
    border-radius: 8px;

    h4 {
      margin-bottom: 15px;
    }
  }

  // 卡片演示
  .card-demo {
    .demo-card {
      .theme-card();
      padding: 20px;
      border-radius: 8px;
      max-width: 400px;

      h5 {
        margin-bottom: 10px;
      }

      p {
        margin-bottom: 15px;
        line-height: 1.6;
      }

      .card-actions {
        display: flex;
        gap: 10px;
      }

      .btn {
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        .theme-transition();

        &.btn-primary {
          .theme-button(primary);
        }

        &.btn-default {
          .theme-button(default);
        }
      }
    }
  }

  // 表单演示
  .form-demo {
    max-width: 500px;
  }

  // 表格演示
  .table-demo {
    .theme-table();
  }
}

// 开发工具提示
.dev-tools-tip {
  padding: 20px;
  .theme-card();
  border-radius: 8px;

  h3 {
    margin-bottom: 15px;
  }

  .tip-content {
    padding: 15px;
    border-radius: 6px;

    p {
      margin-bottom: 10px;
      font-weight: 500;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin-bottom: 5px;
        line-height: 1.5;

        code {
          background-color: @theme-bg-primary;
          color: @theme-primary;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: 500;
        }
      }
    }
  }
}

// Element Plus 组件主题适配
:deep(.el-input__wrapper) {
  .theme-input();
}

:deep(.el-textarea__inner) {
  .theme-input();
}

:deep(.el-table) {
  .theme-table();
}

:deep(.el-button) {
  .theme-transition();
}
</style> 