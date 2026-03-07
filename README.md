# Quant Dashboard

一个面向个人学习与创作场景的每日量化看板。  
你可以按日期记录英语、编程、绘画、文学创作等投入，系统自动计算分数，并支持文本导入导出与趋势统计。

项目基于 `Vue 3 + Vite`，可部署到 GitHub Pages，也支持本地离线独立窗口使用。

## 项目简介

Quant Dashboard 以“必须部分 + 可选部分”的规则进行日度计分：

- 必须部分：英语（上限 50）+ 编程（上限 50）
- 可选部分：上限 60
- 总分上限：160

核心目标是让每天的投入可记录、可复盘、可对比。

## 目录结构

```text
quant-dashboard/
├─ src/
│  ├─ components/
│  │  └─ StatsView.vue              # 历史数据解析与趋势图
│  ├─ stores/
│  │  └─ useProgressStore.js        # 状态与计分规则
│  ├─ App.vue                       # 录入页与业务交互
│  ├─ main.js                       # 应用入口
│  └─ style.css                     # 全局样式
├─ index.html
├─ vite.config.js                   # Pages/离线构建 base 配置
├─ start-offline.bat                # 本地离线服务启动脚本
├─ start-offline-silent.vbs         # 静默启动 + 独立窗口模式
└─ package.json
```

## 功能特性（亮点）

- 双页面模式：录入页 + 统计页，日常记录与复盘分离
- 自动计分：按规则实时计算英语、编程、可选与总分
- 编程细分：区分“编程单元”和“练习题组”（5 分/组，上限 30）
- 上限控制：各分项与总项封顶明确，避免异常输入拉高总分
- 导入导出：支持纯文本复制粘贴，便于备份和跨设备迁移
- 趋势图：按日期解析历史文本并生成多维折线图
- 离线可用：支持离线构建与本地运行，不依赖外网
- 独立窗口：可用 `--app` 模式以桌面应用窗口打开（600x700 居中）

## 安装与使用

### 1) 安装依赖

```bash
npm install
```

### 2) 本地开发

```bash
npm run dev
```

### 3) 生产构建（用于线上部署）

```bash
npm run build
```

### 4) 离线构建（本地 file 路径可打开）

```bash
npm run build:offline
```

生成目录为 `dist/`。

### 5) 离线运行（推荐）

#### 方式 A：命令行启动

```bash
start-offline.bat
```

该脚本会自动：

- 构建离线包
- 启动本地预览服务
- 打开应用地址

#### 方式 B：静默独立窗口启动（Windows）

双击 `start-offline-silent.vbs`。  
会以独立应用窗口（非浏览器标签页）打开，并默认 `600x700` 居中显示。

## 部署说明（GitHub Pages）

项目已兼容 GitHub Pages 的子路径部署，默认使用仓库路径作为 `base`。  
如需离线构建，请使用 `build:offline` 脚本自动切换为相对路径。
