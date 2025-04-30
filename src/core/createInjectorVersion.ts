import { InjectorVersionOptions } from "../types";

const createInjectorVersion = (
  options: Omit<InjectorVersionOptions, "callback">
) => {
  const {
    version = "1.0.0",
    log = false,
  } = options || {};

  return function (html: string) {
    const versionMetaTag = `<meta name="version" content="${version}">`;
    return html.replace(/<head>/, `<head>${versionMetaTag}`);
  };
};

export default createInjectorVersion;
