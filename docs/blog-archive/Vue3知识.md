# Vue3知识

> 用途：配合 `项目复现清单.md` 使用。  
> 思路：每个复现阶段对应你需要掌握的 Vue3 / Vite / Web API 知识点，并给出常见函数的“够用级”解释。

---

## 0. 启动阶段（Vite 基础）

### 你会用到

- `npm run dev`
- `npm run build`
- `npm run preview`
- `vite.config.js` 的 `defineConfig()`

### 关键知识

- Vite 是“开发服务器 + 构建工具”
- 开发时按 ESM 直接加载模块，构建时打包优化
- `mode` 可区分环境（比如 `offline`）

### 常见点

- `base` 配错会导致资源 404 或白屏

---

## 1. 入口与组件组织（`main.js` + `App.vue`）

### 你会用到

- `createApp(App).mount('#app')`
- SFC（单文件组件）结构：`<template> / <script setup> / <style>`

### 关键知识

- `main.js` 只负责“挂载”
- 业务逻辑尽量放到组件或 composable（本项目是 store）

---

## 2. 响应式核心（`ref` / `reactive` / `computed`）

### `ref()`

- 适合基础类型（字符串、数字、布尔）
- 访问值用 `.value`（模板里自动解包）

### `reactive()`

- 适合对象（表单状态）
- 直接改属性即可触发响应

### `computed()`

- 用于“派生状态”（例如各项分数）
- 自动缓存，依赖变化才重算

### 在本项目的对应

- `state`：`reactive`
- `scores`：`computed`
- `hint`、`activePage`：`ref`

---

## 3. 表单双向绑定与事件

### 你会用到

- `v-model`
- `v-model.number`（把输入转成数字）
- `@click`、`@change`
- `@pointerdown` / `@pointerup`（长按加减）

### 关键知识

- `v-model.number` 很适合计分表单，减少手动 `Number()` 转换
- 长按逻辑本质是 `setTimeout + setInterval + clear...`

---

## 4. 条件渲染与列表渲染

### 你会用到

- `v-if / v-else`
- `v-for`
- `:key`
- `:class="{ done: ... }"`

### 关键知识

- 录入页/统计页切换：`v-if`
- 目标列表：`v-for`
- 动态样式：对象语法的 `:class`

---

## 5. 组件懒加载（性能与结构）

### 你会用到

- `defineAsyncComponent(() => import('./components/StatsView.vue'))`

### 关键知识

- 首屏只加载录入页，统计页按需加载
- 这是前端常见的“分包”方式

---

## 6. 业务规则层（Composable / Store 思想）

### 你会用到

- 自定义函数：`useProgressStore()`
- 对外暴露：`state`、`scores`、`reset`

### 关键知识

- 规则统一放一处，避免“页面逻辑和统计逻辑各写一套”
- 先归一输入（非负整数），再计分
- 兼容旧字段要写在“入口处”统一处理

---

## 7. 导入/导出与文本协议

### 你会用到

- `split('\n')`
- `split('=')`
- `startsWith('[')` 判断日期段

### 关键知识

- 约定一个稳定文本格式，便于备份与跨设备迁移
- 导入要做三件事：
  1. 字段映射
  2. 类型归一
  3. 上限裁剪

---

## 8. 浏览器 API：剪贴板

### 你会用到

- `navigator.clipboard.writeText(text)`
- `navigator.clipboard.write([new ClipboardItem(...)])`

### 关键知识

- 文本复制：用于导出与总结
- 图片复制：用于复制图表
- 某些场景（`file://`、权限限制）可能失败，要给用户提示

---

## 9. 图表（Chart.js）

### 你会用到

- `new Chart(canvas, config)`
- 折线图 `type: 'line'`
- `datasets` 动态生成
- 组件卸载时 `chart.destroy()`

### 关键知识

- 数据结构通常是：
  - `labels`: 日期数组
  - `datasets`: 每条指标线
- 复选框控制系列显示，本质是过滤 `datasets`

---

## 10. 侦听与重渲染时机

### 你会用到

- `watch([records, selectedSeries], callback, { deep: true, immediate: true })`
- `nextTick()`

### 关键知识

- 图表依赖 DOM 与数据，通常在 `nextTick` 后渲染更稳
- `deep: true` 监听对象内部变化

---

## 11. 样式组织

### 你会用到

- 全局样式：`src/style.css`
- 局部样式：`<style scoped>`

### 关键知识

- 全局放基础规则（字体、背景）
- 组件内放业务 UI（表单、卡片、按钮）

---

## 12. 离线与桌面化启动知识

### 你会用到

- Vite `base` 配置按 `mode` 切换
- `vite preview --host --port 4173`
- Windows 脚本：`.bat` + `.vbs`
- 浏览器 `--app=URL` 参数（独立窗口）

### 关键知识

- 离线白屏常见原因：`base` 不是相对路径
- `.vbs` 可实现静默启动和窗口位置控制

---

## 13. 复现时建议优先掌握的函数（速记）

- `ref`：单值响应式
- `reactive`：对象响应式
- `computed`：派生计算
- `watch`：副作用侦听
- `defineAsyncComponent`：懒加载组件
- `nextTick`：等 DOM 更新后再做事
- `Math.min`：分数封顶
- `Number.isFinite` + `Math.floor`：输入归一
- `navigator.clipboard.writeText`：复制文本

---

## 14. 学习路径建议（最短）

1. 先把 `useProgressStore` 写出来（计分正确最重要）
2. 再写 `App.vue` 表单与展示
3. 然后做导入导出
4. 最后做 `StatsView` 图表与离线脚本

只要这条主线通了，你就已经具备独立做同类工具项目的能力。
