import type { Compilation } from "webpack";

export interface InjectorVersionOptions {
  version?: string;
  injectorFilename?: string;
  injectVersionJson?: boolean; // 是否注入 version.json 文件
  callback?: (params: { version: string; compilation: Compilation }) => void;
}
