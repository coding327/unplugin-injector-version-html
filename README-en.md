# unplugin-injector-version-html

[中文文档](./README.md) (Chinese Documentation)

`unplugin-injector-version-html` is a plugin for Webpack that dynamically injects version information into the `<head>` section of HTML files during the build process. It also offers a client-side utility to check for application updates.

---

## Features

- **Supports Webpack**: Compatible with Webpack.
- **Dynamic Version Injection**: Injects version information into HTML files during the build process.
- **Easy to Configure**: Supports custom version numbers and other options for the Webpack plugin.
- **Type-Safe**: Developed with TypeScript, providing complete type declarations.
- **Version Check Utility**: Provides a client-side function to check for new application versions, with support for polling.

---

## Installation

Install via npm:

```bash
npm install unplugin-injector-version-html --save-dev
```

Or use pnpm:

```bash
pnpm add unplugin-injector-version-html --save-dev
```

---

## Usage

### Using with Webpack

1.  **Configure the Webpack Plugin**:

    Add the plugin to your `webpack.config.js`:

    ```javascript
    const InjectorVersionPlugin = require("unplugin-injector-version-html/webpack");

    module.exports = {
      plugins: [
        new InjectorVersionPlugin({
          injectorFilename: "index.html", // The HTML file to inject the version into
          version: "1.0.0", // Custom version number; if not provided, defaults to version from package.json
          injectVersionJson: true, // Whether to generate a version.json file in the output directory
          environment: "production", // Environment for the plugin: 'development', 'production', or 'all'
          callback: ({ version, compilation }) => {
            console.log(`Version ${version} injected successfully!`);
          },
        }),
      ],
    };
    ```

2.  **Run the Build**:

    ```bash
    npm run build
    ```

    After the build, the `<head>` section of the `index.html` file will include a meta tag similar to this (the timestamp will vary):

    ```html
    <meta name="version" content="1.0.0.1673246598765" />
    ```

    If `injectVersionJson` is `true` (the default), a `version.json` file will also be generated in the root of your build output directory:

    ```json
    { "version": "1.0.0.1673246598765" }
    ```

---

## Webpack Plugin Configuration Options

| Option              | Type                                                              | Default             | Description                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `injectorFilename`  | `string`                                                          | `index.html`        | The HTML file to inject the version number into.                                                                                                  |
| `version`           | `string`                                                          | From `package.json` | The version number to inject. If not provided, it attempts to read from the project's `package.json`.                                             |
| `injectVersionJson` | `boolean`                                                         | `true`              | Whether to generate a `version.json` file in the root of the build output.                                                                        |
| `environment`       | `'development' \| 'production' \| 'all'`                          | `production`        | The environment in which the plugin runs. The plugin will only execute if `process.env.NODE_ENV` matches this value (`all` means always execute). |
| `callback`          | `(params: { version: string; compilation: Compilation }) => void` | `undefined`         | Optional callback function executed after the build is complete.                                                                                  |

---

## Version Check Feature

In addition to injecting version numbers, this plugin also provides a client-side utility to detect if a new version of the application is available. This is implemented via the [`checkAppVersion`](src/core/versionChecker.ts) function.

### Usage

```javascript
import { checkAppVersion } from "unplugin-injector-version-html";

// Basic usage
checkAppVersion({
  apiUrl: "https://your-api.com/version", // Your version check API endpoint
  onResult: (result) => {
    if (result.hasNewVersion) {
      console.log(
        `New version found: ${result.latestVersion}, current version: ${result.currentVersion}`
      );
      // Act based on result.updateUrl, e.g., show an update button
      if (result.updateUrl) {
        // Example: display an update button that navigates to result.updateUrl
      }
    }
  },
  onError: (err) => {
    console.error("Failed to check for updates:", err);
  },
})
  .then((result) => {
    // .then is only relevant in non-polling mode
    if (result && result.hasNewVersion) {
      console.log("Non-polling mode: New version found");
    }
  })
  .catch((err) => {
    // .catch is only relevant in non-polling mode
    console.error("Non-polling mode: Failed to check for updates", err);
  });

// Advanced usage: Enable polling
const versionCheckerControls = checkAppVersion({
  apiUrl: "https://your-api.com/version",
  currentVersion: "1.0.0", // Optional, defaults to value from meta[name="version"] tag
  polling: true, // Enable polling
  pollingInterval: 300000, // Polling interval in milliseconds (e.g., 5 minutes)
  environment: "production", // Only check for versions in the production environment
  debug: true, // Enable debug logs
  onResult: (result) => {
    if (result.hasNewVersion) {
      alert(
        `New version available: ${result.latestVersion}. Please refresh the page or visit the update link.`
      );
      // If the API returns an update link
      if (result.updateUrl) {
        // You can provide an update link, e.g.:
        // showUpdateButton(result.updateUrl);
      }
      // If polling is enabled and a new version is found, polling will stop automatically
      // (unless update prompts are disabled in the development environment via disableDevUpdates)
    } else {
      console.log("Currently on the latest version.");
    }
  },
  onError: (error) => {
    console.warn("Version check failed:", error.message);
  },
  // Custom version comparison logic (optional)
  compareVersions: (current, latest) => {
    // Example: simple comparison, real projects might need more complex logic
    return latest !== current;
  },
});

// If polling is enabled, you can control the checker
if (
  versionCheckerControls &&
  typeof versionCheckerControls !== "function" && // Ensures it's the PollingControl object
  "start" in versionCheckerControls
) {
  // versionCheckerControls.start(); // Starts automatically by default unless prevented in config
  // versionCheckerControls.stop();
  // versionCheckerControls.checkNow();
  console.log("Polling status:", versionCheckerControls.isPolling);
}
```

### Version Check Configuration Options ([`CheckVersionOptions`](src/core/versionChecker.ts))

| Option              | Type                                           | Default                                    | Description                                                                                                                        |
| ------------------- | ---------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `apiUrl`            | `string`                                       | **Required**                               | Remote version API URL, should return a JSON object containing `version` (string) and optional `updateUrl` (string).               |
| `currentVersion`    | `string`                                       | From `<meta name="version">`, else "0.0.0" | The current version of the application.                                                                                            |
| `compareVersions`   | `(current: string, latest: string) => boolean` | Built-in comparison function               | Custom version comparison logic. Return `true` if there is a new version.                                                          |
| `onResult`          | `(result: VersionCheckResult) => void`         | `undefined`                                | Callback function when a result is detected (regardless of new version).                                                           |
| `onError`           | `(error: Error) => void`                       | `undefined`                                | Callback function when an error occurs during detection.                                                                           |
| `polling`           | `boolean`                                      | `false`                                    | Whether to enable polling checks.                                                                                                  |
| `pollingInterval`   | `number`                                       | Dev: 60000 (1 min), Prod: 300000 (5 mins)  | Polling interval in milliseconds.                                                                                                  |
| `maxRetries`        | `number`                                       | `0` (unlimited)                            | Maximum number of retries on polling check failure.                                                                                |
| `environment`       | `'development' \| 'production'`                | Based on `process.env.NODE_ENV`            | Environment for version checking.                                                                                                  |
| `debug`             | `boolean`                                      | Dev: `true`, Prod: `false`                 | Whether to output debug logs to the console.                                                                                       |
| `disableDevUpdates` | `boolean`                                      | `false`                                    | Whether to disable new version prompts in development (even if a new version is detected, `hasNewVersion` will be set to `false`). |

---

## Project Structure

```
unplugin-injector-version-html
├── src
│   ├── index.ts                     # Entry point for version check feature
│   ├── webpack.ts                   # Webpack plugin implementation
│   ├── types.ts                     # Type definitions for Webpack plugin
│   ├── core/
│   │   ├── createInjectorVersion.ts # Core logic for injecting version number
│   │   ├── versionChecker.ts        # Version check feature implementation and type definitions
│   │   └── index.ts                 # Entry point for core module
│   └── shared/
│       ├── getPackageVersion.ts     # Utility to get package.json version
│       ├── utils.ts                 # Shared utility functions
│       └── index.ts                 # Entry point for shared module
├── dist                             # Build output directory
├── tsup.config.ts                   # tsup build configuration
├── package.json                     # Project configuration file
├── README.md                        # Project documentation (Chinese)
└── README-en.md                     # Project documentation (English)
```

---

## Development and Build

1.  **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd unplugin-injector-version-html
    ```

2.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

3.  **Run the Build**:

    ```bash
    npm run build
    ```

4.  **Publish to npm**:

    ```bash
    npm publish --access public
    ```

---

## Vite Support

Currently, the plugin does not support Vite. Support for Vite may be added in future versions. Stay tuned!

---

## License

This project is licensed under the MIT License.
