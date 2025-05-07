import { getPackageVersion } from "@/shared/getPackageVersion";
import { InjectorVersionOptions } from "../types";

const createInjectorVersion = (
  options: Omit<InjectorVersionOptions, "callback">
) => {
  const { version = getPackageVersion() } = options || {};
  const __version__ = `${version}.${Date.now()}`;

  return {
    version: __version__,
    injectorVersionFn: function (html: string) {
      const versionMetaTag = `<meta name="version" content="${__version__}">`;
      return html.replace(/<head>/, `<head>${versionMetaTag}`);
    },
  };
};

export default createInjectorVersion;
