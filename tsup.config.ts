import { defineConfig, type Options } from "tsup";

// 公用配置
const sharedConfig: Options = {
  format: ["cjs", "esm"], // 输出格式：CommonJS 和 ESM
  dts: true, // 生成类型声明文件
  clean: true, // 清理输出目录
  minify: false, // 是否压缩代码
  outDir: "dist", // 输出目录
  platform: "node", // 平台：node 或 browser
  splitting: false, // 是否开启代码分割
  shims: false, // 是否生成 shims 文件
  treeshake: true, // 去除未使用的代码
};

const createConfig = (options: Options): Options => {
  return {
    ...sharedConfig,
    ...options,
  };
};

export default defineConfig([
  // 编译核心库 webpack
  createConfig({
    entry: ["src/webpack.ts"], // 入口文件
  }),
  // 检测版本 core
  createConfig({
    entry: ["src/core/versionChecker.ts"], // 入口文件
    outDir: "dist", // 输出目录
    platform: "neutral", // 平台：node 或 browser
  }),
]);
