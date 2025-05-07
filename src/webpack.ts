import createInjectorVersion from "./core/createInjectorVersion";
import { InjectorVersionOptions } from "./types";
import type { Compilation, Compiler } from "webpack";

function InjectorVersionPlugin(options: InjectorVersionOptions) {
  const {
    callback,
    injectorFilename = "index.html",
    ...injectorVersionOptions
  } = options || {};

  const { version, injectorVersionFn } = createInjectorVersion(
    injectorVersionOptions
  );

  return {
    apply: (compiler: Compiler) => {
      if (process.env.NODE_ENV !== "production") {
        return;
      }

      // 判断是否是 Webpack 5
      const isWebpack5 = Boolean(compiler.webpack?.version?.startsWith("5."));

      // emit 是 Webpack 在生成资源并准备写入文件系统时触发的钩子，此时 compilation.assets 已经包含所有打包的资源
      compiler.hooks.emit.tapAsync(
        "InjectorVersionPlugin",
        (compilation: Compilation, __callback) => {
          const indexHtml = compilation.assets[injectorFilename]
            .source()
            .toString();

          if (!indexHtml) {
            __callback();
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

          // 这里可以对 compilation.assets 进行操作，比如删除某些文件
          callback && callback({
            version,
            compilation
          });
          // 继续执行下一个插件
          __callback();
        }
      );
    },
  };
}

export default InjectorVersionPlugin;
