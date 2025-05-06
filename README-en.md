# unplugin-injector-version-html

[中文文档](./README.md)

`unplugin-injector-version-html` is a plugin for Webpack that dynamically injects version information into the `<head>` section of HTML files during the build process.

---

## Features

- **Supports Webpack**: Compatible with major build tools.
- **Dynamic Version Injection**: Injects version information into HTML files during the build process.
- **Easy to Configure**: Supports custom version numbers and other options.
- **Type-Safe**: Developed with TypeScript, providing complete type declarations.

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

1. **Configure the Webpack Plugin**:

   Add the plugin to your `webpack.config.js`:

   ```javascript
   const InjectorVersionPlugin = require("unplugin-injector-version-html/webpack");

   module.exports = {
     plugins: [
       new InjectorVersionPlugin({
         injectorFilename: "index.html", // The HTML file to inject into
         version: "1.0.0", // Custom version number
         callback: (compilation) => {
           console.log("Version injected successfully!");
         },
       }),
     ],
   };
   ```

2. **Run the Build**:

   ```bash
   npm run build
   ```

   After the build, the `<head>` section of the `index.html` file will include:

   ```html
   <meta name="version" content="1.0.0" />
   ```

---

## Configuration Options

| Option             | Type       | Default      | Description                       |
| ------------------ | ---------- | ------------ | --------------------------------- |
| `injectorFilename` | `string`   | `index.html` | The HTML file to inject into      |
| `version`          | `string`   | `1.0.0`      | The version number to inject      |
| `callback`         | `Function` | `undefined`  | Callback function after injection |

---

## Project Structure

```
unplugin-injector-version-html
├── src
│   ├── webpack.ts               # Webpack plugin implementation
│   ├── core/
│   │   └── createInjectorVersion.ts # Core logic for version injection
├── dist                         # Build output directory
├── tsup.config.ts               # tsup build configuration
├── package.json                 # Project configuration file
└── README.md                    # Project documentation
```

---

## Development and Build

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd unplugin-injector-version-html
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Run the Build**:

   ```bash
   npm run build
   ```

4. **Publish to npm**:

   ```bash
   npm publish --access public
   ```

---

## Vite Support

Currently, the plugin does not support Vite. Support for Vite will be added in future versions. Stay tuned!

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
