# unplugin-injector-version-html

[英文文档](./README-en.md)

`unplugin-injector-version-html` 是一个用于 Webpack 的插件，可以在构建过程中将版本号动态注入到 HTML 文件的 `<head>` 部分。

---

## 功能特性

- **支持 Webpack**：兼容主流构建工具。
- **动态注入版本号**：在构建时将版本号插入到 HTML 文件中。
- **易于配置**：支持自定义版本号和其他选项。
- **类型安全**：使用 TypeScript 开发，提供完整的类型声明。
- **版本检测**：提供前端版本检测功能，可配置轮询。

---

## 安装

通过 npm 安装：

```bash
npm install unplugin-injector-version-html --save-dev
```

或者使用 pnpm：

```bash
pnpm add unplugin-injector-version-html --save-dev
```

---

## 使用方法

### 在 Webpack 中使用

1.  **配置 Webpack 插件**：

    在你的 `webpack.config.js` 中引入并使用插件：

    ```javascript
    const InjectorVersionPlugin = require("unplugin-injector-version-html/webpack");

    module.exports = {
      plugins: [
        new InjectorVersionPlugin({
          injectorFilename: "index.html", // 要注入的 HTML 文件名
          version: "1.0.0", // 自定义版本号，不提供则从 package.json 获取
          injectVersionJson: true, // 是否在输出目录生成 version.json 文件
          environment: "production", // 插件生效的环境，可选 'development', 'production', 'all'
          callback: ({ version, compilation }) => {
            console.log(`版本号 ${version} 已成功注入！`);
          },
        }),
      ],
    };
    ```

2.  **运行构建**：

    ```bash
    npm run build
    ```

    构建完成后，`index.html` 文件的 `<head>` 部分会包含类似以下内容：

    ```html
    <meta name="version" content="1.0.0.1673246598765" />
    ```

    如果 `injectVersionJson` 设置为 `true` (默认)，则在构建输出的根目录会生成一个 `version.json` 文件：

    ```json
    { "version": "1.0.0.1673246598765" }
    ```

---

## Webpack 插件配置选项

| 参数                | 类型                                                              | 默认值                 | 描述                                                                                         |
| ------------------- | ----------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| `injectorFilename`  | `string`                                                          | `index.html`           | 要注入版本号的 HTML 文件名                                                                   |
| `version`           | `string`                                                          | 从 `package.json` 获取 | 要注入的版本号。如果未提供，则尝试从项目的 `package.json` 中读取。                           |
| `injectVersionJson` | `boolean`                                                         | `true`                 | 是否在构建输出的根目录生成 `version.json` 文件。                                             |
| `environment`       | `'development' \| 'production' \| 'all'`                          | `production`           | 插件运行的环境。只有当 `process.env.NODE_ENV` 与此匹配时插件才会执行（`all` 表示始终执行）。 |
| `callback`          | `(params: { version: string; compilation: Compilation }) => void` | `undefined`            | 构建完成后执行的回调函数（可选）。                                                           |

---

## 版本检测功能

除了注入版本号，本插件还提供了一个在前端检测应用是否有新版本的功能。通过 [`checkAppVersion`](src/core/versionChecker.ts) 函数实现。

### 使用方法

```javascript
import { checkAppVersion } from "unplugin-injector-version-html";

// 基本用法
checkAppVersion({
  apiUrl: "https://your-api.com/version", // 您的版本检查接口
  onResult: (result) => {
    if (result.hasNewVersion) {
      console.log(
        `发现新版本: ${result.latestVersion}，当前版本: ${result.currentVersion}`
      );
      // 根据 result.updateUrl 进行提示或操作
      if (result.updateUrl) {
        // 例如：显示一个更新按钮，点击跳转到 result.updateUrl
      }
    }
  },
  onError: (err) => {
    console.error("检查更新失败:", err);
  },
})
  .then((result) => {
    // .then 仅在非轮询模式下有意义
    if (result && result.hasNewVersion) {
      console.log("非轮询模式：发现新版本");
    }
  })
  .catch((err) => {
    // .catch 仅在非轮询模式下有意义
    console.error("非轮询模式：检查更新失败", err);
  });

// 高级用法：启用轮询
const versionCheckerControls = checkAppVersion({
  apiUrl: "https://your-api.com/version",
  currentVersion: "1.0.0", // 可选，默认从 meta[name="version"] 标签获取
  polling: true, // 启用轮询
  pollingInterval: 300000, // 轮询间隔，单位毫秒 (例如：5分钟)
  environment: "production", // 只在生产环境进行版本检查
  debug: true, // 开启调试日志
  onResult: (result) => {
    if (result.hasNewVersion) {
      alert(
        `有新版本可用: ${result.latestVersion}。请刷新页面或访问更新链接。`
      );
      // 如果API返回了更新链接
      if (result.updateUrl) {
        // 可以提供更新链接，例如：
        // showUpdateButton(result.updateUrl);
      }
      // 如果启用了轮询，并且发现了新版本，轮询会自动停止（除非在开发环境禁用了更新提示）
    } else {
      console.log("当前已是最新版本。");
    }
  },
  onError: (error) => {
    console.warn("版本检查失败:", error.message);
  },
  // 自定义版本比较逻辑 (可选)
  compareVersions: (current, latest) => {
    // 示例：简单比较，实际项目中可能需要更复杂的比较逻辑
    return latest !== current;
  },
});

// 如果启用了轮询，可以控制检查器
if (
  versionCheckerControls &&
  typeof versionCheckerControls !== "function" &&
  "start" in versionCheckerControls
) {
  // versionCheckerControls.start(); // 默认会自动开始，除非在配置中阻止
  // versionCheckerControls.stop();
  // versionCheckerControls.checkNow();
  console.log("轮询状态:", versionCheckerControls.isPolling);
}
```

### 版本检测配置选项 ([`CheckVersionOptions`](src/core/versionChecker.ts))

| 参数                | 类型                                           | 默认值                                              | 描述                                                                                       |
| ------------------- | ---------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `apiUrl`            | `string`                                       | **必填**                                            | 远程版本接口 URL，应返回包含 `version` (string) 和可选 `updateUrl` (string) 的 JSON 对象。 |
| `currentVersion`    | `string`                                       | 从 `<meta name="version">` 获取，否则 "0.0.0"       | 当前应用的版本号。                                                                         |
| `compareVersions`   | `(current: string, latest: string) => boolean` | 内置比较函数                                        | 自定义版本比较逻辑。返回 `true` 表示有新版本。                                             |
| `onResult`          | `(result: VersionCheckResult) => void`         | `undefined`                                         | 检测到结果（无论是否有新版本）时的回调函数。                                               |
| `onError`           | `(error: Error) => void`                       | `undefined`                                         | 检测过程中发生错误时的回调函数。                                                           |
| `polling`           | `boolean`                                      | `false`                                             | 是否启用轮询检查。                                                                         |
| `pollingInterval`   | `number`                                       | 开发环境: 60000 (1 分钟), 生产环境: 300000 (5 分钟) | 轮询间隔时间（毫秒）。                                                                     |
| `maxRetries`        | `number`                                       | `0` (无限制)                                        | 轮询检查失败时的最大重试次数。                                                             |
| `environment`       | `'development' \| 'production'`                | 根据 `process.env.NODE_ENV` 判断                    | 版本检查运行的环境。                                                                       |
| `debug`             | `boolean`                                      | 开发环境: `true`, 生产环境: `false`                 | 是否在控制台输出调试日志。                                                                 |
| `disableDevUpdates` | `boolean`                                      | `false`                                             | 是否在开发环境中禁用新版本提示（即使检测到新版本，`hasNewVersion` 也会被置为 `false`）。   |

---

## 项目结构

```
unplugin-injector-version-html
├── src
│   ├── index.ts                     # 版本检测功能入口
│   ├── webpack.ts                   # Webpack 插件实现
│   ├── types.ts                     # Webpack 插件类型定义
│   ├── core/
│   │   ├── createInjectorVersion.ts # 注入版本号的核心逻辑
│   │   ├── versionChecker.ts        # 版本检测功能实现和类型定义
│   │   └── index.ts                 # core 模块入口
│   └── shared/
│       ├── getPackageVersion.ts     # 获取 package.json 版本工具
│       ├── utils.ts                 # 共享工具函数
│       └── index.ts                 # shared 模块入口
├── dist                             # 打包输出目录
├── tsup.config.ts                   # tsup 打包配置
├── package.json                     # 项目配置文件
└── README.md                        # 项目文档 (中文)
└── README-en.md                     # 项目文档 (英文)
```

---

## 开发与构建

1.  **克隆项目**：

    ```bash
    git clone <repository-url>
    cd unplugin-injector-version-html
    ```

2.  **安装依赖**：

    ```bash
    pnpm install
    ```

3.  **运行打包**：

    ```bash
    npm run build
    ```

4.  **发布到 npm**：

    ```bash
    npm publish --access public
    ```

---

## Vite 支持

目前插件尚未支持 Vite，未来版本将会添加对 Vite 的支持，敬请期待。

---

## 许可证

本项目基于 MIT 许可证开源。
