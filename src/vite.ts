import type { Plugin } from "vite";
import { InjectorVersionOptions } from "./types";
import { createInjectorVersion } from "./core";

function InjectorVersionPlugin(options: InjectorVersionOptions): Plugin {
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
    name: "vite-injector-version",
    transformIndexHtml(html) {
      // 确认环境
      if (environment !== "all" && process.env.NODE_ENV !== environment)
        return html;

      return injectorVersionFn(html);
    },
    generateBundle(outputOptions, bundle) {
      // 确认环境
      if (environment !== "all" && process.env.NODE_ENV !== environment) {
        return;
      }

      if (injectVersionJson) {
        const versionJsonContent = JSON.stringify({ version });
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: versionJsonContent,
        });
      }
    },
  };
}

export default InjectorVersionPlugin;
