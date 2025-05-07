import { getFileContent } from "./utils";

export function getPackageVersion() {
  const packageJson = getFileContent("package.json", process.cwd());
  if (packageJson && packageJson.version) {
    return packageJson.version;
  } else {
    console.warn("Package version not found.");
    return null;
  }
}
