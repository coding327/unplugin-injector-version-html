/**
 * 检查应用是否有新版本的配置选项
 */
export interface CheckVersionOptions {
  /** 远程接口URL，返回包含最新版本的JSON */
  apiUrl: string;
  /** 自定义比较函数，默认为简单数字版本比较 */
  compareVersions?: (current: string, latest: string) => boolean;
  /** 当前版本号，默认从meta标签获取 */
  currentVersion?: string;
  /** 处理检测结果的回调函数 */
  onResult?: (result: VersionCheckResult) => void;
  /** 检测失败时的回调函数 */
  onError?: (error: Error) => void;
  /** 是否启用轮询 */
  polling?: boolean;
  /** 轮询间隔时间(毫秒)，默认5分钟 */
  pollingInterval?: number;
  /** 最大尝试次数，0表示无限制 */
  maxRetries?: number;
  /** 环境设置，用于配置开发和生产环境的不同行为 */
  environment?: "development" | "production";
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 是否禁用在开发环境中的更新提示 */
  disableDevUpdates?: boolean;
}

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasNewVersion: boolean;
  updateUrl?: string;
  environment: "development" | "production";
}

/** 轮询控制接口 */
export interface PollingControl {
  /** 启动轮询 */
  start: () => void;
  /** 停止轮询 */
  stop: () => void;
  /** 是否正在轮询 */
  isPolling: boolean;
  /** 手动触发立即检查 */
  checkNow: () => Promise<VersionCheckResult>;
}

/**
 * 检查应用是否有新版本
 * @param options 检测选项
 * @returns 如果启用轮询，返回轮询控制对象；否则返回检测结果的Promise
 */
export function checkAppVersion(
  options: CheckVersionOptions
): Promise<VersionCheckResult> | PollingControl {
  // 确定当前环境
  const environment =
    options.environment ||
    (process.env.NODE_ENV === "development" ? "development" : "production");

  // 根据环境调整配置
  const adjustedOptions = {
    ...options,
    environment,
    // 开发环境默认启用调试日志
    debug: options.debug ?? environment === "development",
    // 如果是开发环境并且设置了禁用更新，则不显示更新提示
    onResult: (result: VersionCheckResult) => {
      // 如果是开发环境且设置了禁用开发环境更新提示
      if (
        environment === "development" &&
        options.disableDevUpdates &&
        result.hasNewVersion
      ) {
        // 创建新结果对象，但将hasNewVersion设为false
        const modifiedResult = { ...result, hasNewVersion: false };
        options.onResult?.(modifiedResult);
        return;
      }
      options.onResult?.(result);
    },
  };

  // 如果启用轮询，则返回轮询控制对象
  if (options.polling) {
    return createPollingCheck(adjustedOptions);
  }

  // 否则执行单次检查
  return performVersionCheck(adjustedOptions);
}

/**
 * 执行版本检查
 * @param options 检测选项
 */
async function performVersionCheck(
  options: CheckVersionOptions
): Promise<VersionCheckResult> {
  const environment = options.environment || "production";
  const debug = options.debug || false;

  try {
    // 记录调试日志
    if (debug) {
      console.log(`[Version Checker][${environment}] Checking for updates...`);
    }

    // 获取当前版本，默认从meta标签获取
    const currentVersion =
      options.currentVersion ||
      document.querySelector('meta[name="version"]')?.getAttribute("content") ||
      "0.0.0";

    if (debug) {
      console.log(
        `[Version Checker][${environment}] Current version: ${currentVersion}`
      );
    }

    // 获取最新版本
    const response = await fetch(options.apiUrl, {
      cache: "no-cache", // 禁用缓存，确保获取最新数据
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        // 添加环境标识到请求头，服务端可据此返回不同的版本信息
        "X-Environment": environment,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch version info: ${response.status}`);
    }

    const data = await response.json();
    const latestVersion = data.version;
    const updateUrl = data.updateUrl;

    if (debug) {
      console.log(
        `[Version Checker][${environment}] Latest version: ${latestVersion}`
      );
    }

    // 比较版本
    const compareVersions = options.compareVersions || defaultCompareVersions;
    const hasNewVersion = compareVersions(currentVersion, latestVersion);

    if (debug && hasNewVersion) {
      console.log(`[Version Checker][${environment}] New version available!`);
    }

    const result = {
      currentVersion,
      latestVersion,
      hasNewVersion,
      updateUrl,
      environment,
    };

    // 调用结果回调
    options.onResult?.(result);

    return result;
  } catch (error) {
    if (debug) {
      console.error(`[Version Checker][${environment}] Error:`, error);
    }

    // 调用错误回调
    if (options.onError && error instanceof Error) {
      options.onError(error);
    }
    throw error;
  }
}

/**
 * 创建轮询检查
 * @param options 检测选项
 */
function createPollingCheck(options: CheckVersionOptions): PollingControl {
  const environment = options.environment || "production";
  const debug = options.debug || false;

  // 环境特定配置：开发环境默认更频繁检查（每分钟），生产环境默认每5分钟
  const defaultInterval =
    environment === "development" ? 60 * 1000 : 5 * 60 * 1000;

  const interval = options.pollingInterval || defaultInterval;
  const maxRetries =
    typeof options.maxRetries === "number" ? options.maxRetries : 0;

  let timerId: number | null = null;
  let retryCount = 0;
  let isPolling = false;

  // 执行检查
  const check = async () => {
    try {
      const result = await performVersionCheck(options);

      // 如果发现新版本且不是开发环境下禁用更新提示的情况，停止轮询
      if (
        result.hasNewVersion &&
        !(environment === "development" && options.disableDevUpdates)
      ) {
        if (debug) {
          console.log(
            `[Version Checker][${environment}] Found new version, stopping polling.`
          );
        }
        stop();
      }

      // 重置重试计数
      retryCount = 0;

      return result;
    } catch (error) {
      retryCount++;

      // 如果达到最大重试次数，停止轮询
      if (maxRetries > 0 && retryCount >= maxRetries) {
        if (debug) {
          console.warn(
            `[Version Checker][${environment}] Max retries reached, stopping.`
          );
        }
        stop();
        return;
      }

      throw error;
    } finally {
      // 继续轮询
      if (isPolling) {
        timerId = window.setTimeout(check, interval);
      }
    }
  };

  // 启动轮询
  const start = () => {
    if (isPolling) return;

    if (debug) {
      console.log(
        `[Version Checker][${environment}] Starting polling (interval: ${interval}ms)`
      );
    }

    isPolling = true;
    retryCount = 0;
    check();
  };

  // 停止轮询
  const stop = () => {
    if (!isPolling) return;

    if (debug) {
      console.log(`[Version Checker][${environment}] Stopping polling`);
    }

    isPolling = false;
    if (timerId !== null) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  };

  // 手动触发立即检查
  const checkNow = async () => {
    if (debug) {
      console.log(
        `[Version Checker][${environment}] Manually triggering check`
      );
    }
    return performVersionCheck(options);
  };

  // 页面卸载时自动停止轮询
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", stop);
  }

  return {
    start,
    stop,
    checkNow,
    get isPolling() {
      return isPolling;
    },
  };
}

/**
 * 默认版本比较函数，比较两个版本号
 * @param current 当前版本
 * @param latest 最新版本
 * @returns 如果最新版本大于当前版本，返回true
 */
function defaultCompareVersions(current: string, latest: string): boolean {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }

  return false;
}
