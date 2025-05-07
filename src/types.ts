import type { Compilation } from "webpack";

export interface InjectorVersionOptions {
  /** 环境设置，用于配置开发和生产环境的不同行为 */
  environment?: "development" | "production" | "all";
  version?: string;
  injectorFilename?: string;
  injectVersionJson?: boolean; // 是否注入 version.json 文件
  callback?: (params: { version: string; compilation: Compilation }) => void;
}
