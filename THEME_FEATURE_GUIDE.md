# 主题切换功能说明

## 功能概述

系统支持日间模式和夜间模式无缝切换，用户可以根据个人喜好或环境光线选择合适的主题。

---

## 功能特性

### ✅ 1. 全局主题切换
- **位置**：Header右上角，用户信息右侧
- **图标**：
  - 日间模式：🌙 月亮图标
  - 夜间模式：☀️ 太阳图标
- **操作**：点击图标即可切换

### ✅ 2. 主题持久化
- 使用localStorage保存用户选择
- 下次访问自动应用上次的主题设置
- 存储键名：`app_theme`

### ✅ 3. 平滑过渡（已优化）
- 使用 **View Transitions API** 实现原生级别的平滑过渡
- 所有颜色、背景、边框支持0.4-0.5s自然过渡动画
- 采用 Material Design 推荐的 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动曲线
- 切换时视觉流畅，无闪烁
- 按钮带有涟漪效果和旋转动画

### ✅ 4. 全局生效
- 所有页面同步切换
- Ant Design组件自动适配
- 自定义组件支持主题变量

---

## 技术实现

### 1. 核心文件

```
src/
├── contexts/
│   └── ThemeContext.jsx         # 主题管理Context
├── styles/
│   └── theme.css                # 全局主题变量和样式
├── components/
│   └── Header/
│       ├── index.jsx            # Header组件（包含切换按钮）
│       └── style.css            # Header样式（包含主题适配）
└── App.jsx                      # 应用ThemeProvider
```

### 2. 使用Context管理状态

**ThemeContext.jsx** 提供：
- `theme` - 当前主题（'light' | 'dark'）
- `isDark` - 是否为夜间模式
- `isLight` - 是否为日间模式
- `toggleTheme()` - 切换主题
- `setLightTheme()` - 设置为日间模式
- `setDarkTheme()` - 设置为夜间模式

### 3. CSS变量系统

使用CSS自定义属性（变量）实现主题：

```css
/* 日间模式 */
:root[data-theme="light"] {
  --color-bg-base: #ffffff;
  --color-text-base: #000000;
  /* ... */
}

/* 夜间模式 */
:root[data-theme="dark"] {
  --color-bg-base: #141414;
  --color-text-base: #ffffff;
  /* ... */
}
```

### 4. 主题变量列表

| 变量类型 | 日间模式 | 夜间模式 |
|---------|---------|---------|
| 主背景 | #ffffff | #141414 |
| 容器背景 | #ffffff | #1f1f1f |
| 布局背景 | #f0f2f5 | #0a0a0a |
| 主文字 | #000000 | #ffffff |
| 次要文字 | #666666 | #d9d9d9 |
| 边框 | #d9d9d9 | #434343 |

---

## 使用方法

### 在组件中使用主题

```javascript
import { useTheme } from '../contexts/ThemeContext'

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme()
  
  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={toggleTheme}>
        切换到{isDark ? '日间' : '夜间'}模式
      </button>
    </div>
  )
}
```

### 在CSS中使用主题变量

```css
.my-component {
  background-color: var(--color-bg-container);
  color: var(--color-text-base);
  border: 1px solid var(--color-border-base);
}
```

### 针对特定主题的样式

```css
/* 日间模式特定样式 */
[data-theme="light"] .my-component {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 夜间模式特定样式 */
[data-theme="dark"] .my-component {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}
```

---

## 主题色板

### 日间模式配色

**背景系列：**
- 基础背景：`#ffffff`
- 布局背景：`#f0f2f5`
- 高亮背景：`#fafafa`

**文字系列：**
- 主文字：`#000000`
- 次要文字：`#666666`
- 辅助文字：`#999999`

**边框系列：**
- 基础边框：`#d9d9d9`
- 次要边框：`#f0f0f0`

### 夜间模式配色

**背景系列：**
- 基础背景：`#141414`
- 容器背景：`#1f1f1f`
- 浮层背景：`#2a2a2a`
- 布局背景：`#0a0a0a`

**文字系列：**
- 主文字：`#ffffff`
- 次要文字：`#d9d9d9`
- 辅助文字：`#8c8c8c`

**边框系列：**
- 基础边框：`#434343`
- 次要边框：`#303030`

---

## Ant Design组件适配

已自动适配的组件：
- ✅ Layout（布局）
- ✅ Card（卡片）
- ✅ Table（表格）
- ✅ Input（输入框）
- ✅ Select（选择器）
- ✅ Menu（菜单）
- ✅ Modal（对话框）
- ✅ Button（按钮）
- ✅ Descriptions（描述列表）

适配方式：通过CSS选择器 `[data-theme="dark"]` 覆盖组件默认样式。

---

## 扩展自定义组件

如果你的自定义组件需要支持主题，按以下步骤：

### 1. 使用CSS变量

```css
.custom-component {
  background: var(--color-bg-container);
  color: var(--color-text-base);
  border: 1px solid var(--color-border-base);
}
```

### 2. 或者使用主题选择器

```css
/* 日间模式 */
.custom-component {
  background: #fff;
  color: #000;
}

/* 夜间模式 */
[data-theme="dark"] .custom-component {
  background: #1f1f1f;
  color: #fff;
}
```

### 3. 在JS中判断主题

```javascript
import { useTheme } from '../contexts/ThemeContext'

function CustomComponent() {
  const { isDark } = useTheme()
  
  const iconColor = isDark ? '#fff' : '#000'
  
  return <Icon color={iconColor} />
}
```

---

## 测试检查清单

### 功能测试
- [ ] 点击切换按钮，主题正常切换
- [ ] 刷新页面，主题保持不变
- [ ] 日间模式图标显示月亮
- [ ] 夜间模式图标显示太阳

### 视觉测试
- [ ] 所有页面主题一致
- [ ] 文字清晰可读
- [ ] 边框和分割线可见
- [ ] 按钮和链接颜色正确

### 组件测试
- [ ] Header正常显示
- [ ] 卡片背景正确
- [ ] 表格样式正常
- [ ] 输入框可用
- [ ] Modal对话框正常
- [ ] Menu菜单正常

### 过渡动画
- [ ] 切换时平滑过渡
- [ ] 无闪烁现象
- [ ] 动画时长合适（0.3s）

---

## 常见问题

### Q1: 为什么有些组件没有适配夜间模式？

**A:** 在 `theme.css` 中添加对应组件的夜间模式样式：

```css
[data-theme="dark"] .your-component {
  background: var(--color-bg-container);
  color: var(--color-text-base);
}
```

### Q2: 如何禁用某个元素的主题过渡动画？

**A:** 添加 `no-transition` class：

```html
<div className="my-element no-transition">
  内容
</div>
```

### Q3: 如何获取当前主题？

**A:** 使用 `useTheme` hook：

```javascript
const { theme, isDark } = useTheme()
```

### Q4: 主题保存在哪里？

**A:** localStorage中，键名为 `app_theme`

---

## 未来优化方向

1. **自动主题**
   - 根据系统时间自动切换
   - 跟随系统主题设置

2. **更多主题**
   - 增加更多配色方案
   - 支持自定义主题色

3. **主题编辑器**
   - 可视化主题配置
   - 导出/导入主题配置

4. **性能优化**
   - 按需加载主题样式
   - 减少CSS变量数量

---

## 相关文档

- [系统概览](./SYSTEM_OVERVIEW_README.md)
- [UI优化总结](./UI_OPTIMIZATION_SUMMARY.md)
- [新功能指南](./NEW_FEATURES_GUIDE.md)
