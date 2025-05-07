import { getPackageVersion } from "@/shared/getPackageVersion";
import { InjectorVersionOptions } from "../types";

const createInjectorVersion = (
  options: Omit<InjectorVersionOptions, "callback">
) => {
  const { version = getPackageVersion() } = options || {};

  return function (html: string) {
    const versionMetaTag = `<meta name="version" content="${version}">`;
    return html.replace(/<head>/, `<head>${versionMetaTag}`);
  };
};

export default createInjectorVersion;
