import createInjectorVersion from "./core/createInjectorVersion";
import { InjectorVersionOptions } from "./types";
import type { Compilation, Compiler } from "webpack";

function InjectorVersionPlugin(options: InjectorVersionOptions) {
  const {
    injectorFilename = "index.html",
    injectVersionJson = true, // 默认为 true，保持向后兼容
    environment = "production",
    ...injectorVersionOptions
  } = options || {};

  const { version, injectorVersionFn } = createInjectorVersion(
    injectorVersionOptions
  );

  return {
    apply: (compiler: Compiler) => {
      // 确认环境
      if (environment !== "all" && process.env.NODE_ENV !== environment) return;

      // 判断是否是 Webpack 5
      const isWebpack5 = Boolean(compiler.webpack?.version?.startsWith("5."));

      // emit 是 Webpack 在生成资源并准备写入文件系统时触发的钩子，此时 compilation.assets 已经包含所有打包的资源
      compiler.hooks.emit.tapAsync(
        "InjectorVersionPlugin",
        (compilation: Compilation, callback) => {
          const indexHtml = compilation.assets[injectorFilename]
            .source()
            .toString();

          if (!indexHtml) {
            callback();
            return;
          }

          const updatedHtml = injectorVersionFn(indexHtml as string);

          // 更新 注入文件 的内容
          if (isWebpack5) {
            const RawSource = compiler.webpack.sources.RawSource;
            compilation.assets[injectorFilename] = new RawSource(updatedHtml);
          } else {
            // Webpack 4 及以下版本使用 webpack-sources
            const RawSource = require("webpack-sources").RawSource;
            compilation.assets[injectorFilename] = new RawSource(updatedHtml);
          }

          // 注入 version.json 文件 到 打包文件根目录
          if (injectVersionJson) {
            const versionJson = JSON.stringify({ version });
            if (isWebpack5) {
              const RawSource = compiler.webpack.sources.RawSource;
              compilation.assets["version.json"] = new RawSource(versionJson);
            } else {
              // Webpack 4 及以下版本使用 webpack-sources
              const RawSource = require("webpack-sources").RawSource;
              compilation.assets["version.json"] = new RawSource(versionJson);
            }
          }

          // 继续执行下一个插件
          callback();
        }
      );
    },
  };
}

export default InjectorVersionPlugin;
