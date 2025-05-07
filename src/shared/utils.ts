import { existsSync, readFileSync } from "fs";
import { dirname, join, parse } from "path";

// 获取当前执行目录向上查找的最近的文件内容
export function getFileContent(fileName: string, startDir?: string): any {
  try {
    let dir = startDir ?? process.cwd();

    while (dir !== parse(dir).root) {
      const filePath = join(dir, fileName);
      if (existsSync(filePath)) {
        return JSON.parse(readFileSync(filePath, "utf-8"));
      }
      dir = dirname(dir);
    }

    console.warn(
      `File ${fileName} not found in the directory tree starting from ${startDir}`
    );
    return null;
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error);
    return null;
  }
}
