# unplugin-injector-version-html

[英文文档](./README-en.md)

`unplugin-injector-version-html` 是一个用于 Webpack 的插件，可以在构建过程中将版本号动态注入到 HTML 文件的 `<head>` 部分。

---

## 功能特性

- **支持 Webpack**：兼容主流构建工具。
- **动态注入版本号**：在构建时将版本号插入到 HTML 文件中。
- **易于配置**：支持自定义版本号和其他选项。
- **类型安全**：使用 TypeScript 开发，提供完整的类型声明。

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

1. **配置 Webpack 插件**：

   在你的 `webpack.config.js` 中引入并使用插件：

   ```javascript
   const InjectorVersionPlugin = require("unplugin-injector-version-html/webpack");

   module.exports = {
     plugins: [
       new InjectorVersionPlugin({
         injectorFilename: "index.html", // 要注入的 HTML 文件
         version: "1.0.0", // 自定义版本号
         callback: (compilation) => {
           console.log("版本号已注入！");
         },
       }),
     ],
   };
   ```

2. **运行构建**：

   ```bash
   npm run build
   ```

   构建完成后，`index.html` 文件的 `<head>` 部分会包含类似以下内容：

   ```html
   <meta name="version" content="1.0.0" />
   ```

---

## 配置选项

| 参数               | 类型       | 默认值                   | 描述                             |
| ------------------ | ---------- | ------------------------ | -------------------------------- |
| `injectorFilename` | `string`   | `index.html`             | 要注入版本号的 HTML 文件名       |
| `version`          | `string`   | `从 package.json 中获取` | 要注入的版本号                   |
| `callback`         | `Function` | `undefined`              | 构建完成后执行的回调函数（可选） |

---

## 项目结构

```
unplugin-injector-version-html
├── src
│   ├── webpack.ts               # Webpack 插件实现
│   ├── core/
│   │   └── createInjectorVersion.ts # 注入版本号的核心逻辑
├── dist                         # 打包输出目录
├── tsup.config.ts               # tsup 打包配置
├── package.json                 # 项目配置文件
└── README.md                    # 项目文档
```

---

## 开发与构建

1. **克隆项目**：

   ```bash
   git clone <repository-url>
   cd unplugin-injector-version-html
   ```

2. **安装依赖**：

   ```bash
   pnpm install
   ```

3. **运行打包**：

   ```bash
   npm run build
   ```

4. **发布到 npm**：

   ```bash
   npm publish --access public
   ```

---

## 版本检测功能

除了注入版本号，本插件还提供了一个在前端检测应用是否有新版本的功能。

### 使用方法

```javascript
import { checkAppVersion } from "unplugin-injector-version-html";

// 基本用法
checkAppVersion({
  apiUrl: "https://your-api.com/version",
})
  .then((result) => {
    if (result.hasNewVersion) {
      console.log(`发现新版本: ${result.latestVersion}`);
      // 显示升级提醒
    }
  })
  .catch((err) => {
    console.error("检查更新失败:", err);
  });

// 高级用法
checkAppVersion({
  apiUrl: "https://your-api.com/version",
  currentVersion: "1.0.0", // 可选，默认从meta标签获取
  onResult: (result) => {
    if (result.hasNewVersion) {
      alert(`有新版本可用: ${result.latestVersion}`);

      // 如果API返回了更新链接
      if (result.updateUrl) {
        // 可以提供更新链接
        showUpdateButton(result.updateUrl);
      }
    }
  },
  onError: (error) => {
    console.warn("版本检查失败:", error.message);
  },
  // 自定义版本比较逻辑
  compareVersions: (current, latest) => {
    // 自定义比较逻辑
    return latest !== current;
  },
});
```

---

## Vite 支持

目前插件尚未支持 Vite，未来版本将会添加对 Vite 的支持，敬请期待。

---

## 许可证

本项目基于 MIT 许可证开源，详情请查看 [LICENSE](./LICENSE) 文件。
