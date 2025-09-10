# 🌙 Crow Agent

Automatically add dark/light mode functionality to Tailwind CSS projects through natural language commands.

[![npm version](https://badge.fury.io/js/crow-agent.svg)](https://badge.fury.io/js/crow-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Natural Language Interface**: Simply run `crow "add dark mode"`
- **Framework Support**: React, Vue, Next.js, Nuxt.js, and vanilla HTML
- **Intelligent Analysis**: Scans your project and transforms existing Tailwind classes
- **Component Generation**: Creates theme toggle components for your framework
- **Git Integration**: Automatically commits changes with clear messages
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Accessibility**: Generated components follow WCAG AA guidelines

## 🚀 Quick Start

```bash
# Install globally
npm install -g crow-agent

# Navigate to your Tailwind project
cd my-tailwind-project

# Add dark mode support
crow "add dark mode"
```

That's it! Your project now has dark mode support.

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g crow-agent
```

### Local Installation
```bash
# npm
npm install --save-dev crow-agent

# yarn
yarn add -D crow-agent

# pnpm
pnpm add -D crow-agent
```

## 🎯 Usage

### Natural Language Commands

```bash
# Basic usage
crow "add dark mode"
crow "add dark theme"
crow "enable dark mode"

# With options
crow "add dark mode --dry-run"
crow "add dark mode --backup"
crow "add dark mode --force"

# Analysis commands
crow "scan project"
crow "status"
crow "help"
```

### Command Line Options

```bash
# Preview changes without applying
crow "add dark mode --dry-run"

# Create backup before changes
crow "add dark mode --backup"

# Force overwrite existing setup
crow "add dark mode --force"

# Skip git commit
crow "add dark mode --no-commit"

# Specify framework manually
crow "add dark mode --framework react"

# Custom component name and output
crow "add dark mode --component MyThemeToggle --output ./components"

# Verbose output
crow "add dark mode --verbose"
```

### Programmatic API

```typescript
import { 
  analyzeProject, 
  transformFiles, 
  generateThemeToggleComponent 
} from 'crow-agent';

// Analyze project
const analysis = await analyzeProject('./my-project');

// Transform components
const results = await transformFiles(analysis.componentFiles);

// Generate theme toggle
const component = await generateThemeToggleComponent({
  framework: 'react',
  outputPath: './src/components',
  typescript: true
});
```

## 🏗️ What It Does

Crow Agent performs the following transformations automatically:

### 1. Class Transformation
Converts existing Tailwind classes to include dark mode variants:

```diff
- <div className="bg-white text-gray-900">
+ <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

- <button className="bg-gray-200 border-gray-300">
+ <button className="bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
```

### 2. Configuration Update
Updates your `tailwind.config.js` to enable dark mode:

```diff
module.exports = {
+  darkMode: 'class',
   content: ['./src/**/*.{js,jsx,ts,tsx}'],
   // ...
}
```

### 3. Component Generation

#### React/Next.js
```jsx
import { ThemeToggle } from './components/ThemeToggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

#### Vue/Nuxt.js
```vue
<template>
  <header>
    <h1>My App</h1>
    <ThemeToggle />
  </header>
</template>

<script setup>
import ThemeToggle from './components/ThemeToggle.vue';
</script>
```

#### HTML
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
</head>
<body>
  <div data-theme-toggle></div>
  <script src="theme-toggle.js"></script>
</body>
</html>
```

## 🎨 Supported Transformations

Crow Agent intelligently transforms these Tailwind utility classes:

### Backgrounds
- `bg-white` → `bg-white dark:bg-gray-900`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-800`
- `bg-gray-100` → `bg-gray-100 dark:bg-gray-800`

### Text Colors
- `text-gray-900` → `text-gray-900 dark:text-gray-100`
- `text-gray-700` → `text-gray-700 dark:text-gray-300`
- `text-black` → `text-black dark:text-white`

### Borders
- `border-gray-200` → `border-gray-200 dark:border-gray-700`
- `border-gray-300` → `border-gray-300 dark:border-gray-600`

### And many more...
The tool includes comprehensive mappings for gray, slate, zinc, and neutral color scales.

## 🛠️ Framework Support

| Framework | Status | Features |
|-----------|--------|----------|
| React | ✅ | JSX transformation, TypeScript support, hook-based toggle |
| Next.js | ✅ | App Router support, SSR compatibility, hydration handling |
| Vue 3 | ✅ | SFC parsing, Composition API, TypeScript support |
| Nuxt.js | ✅ | Auto-imports, SSR compatibility |
| HTML | ✅ | Vanilla JS toggle, CDN compatibility |

## 📊 Project Analysis

Use the scan command to analyze your project:

```bash
crow "scan project --verbose"
```

Output:
```
🔍 Crow Agent - Project Analysis

✅ Project validation completed

📊 Project Analysis Results

Framework Detection:
  Framework: react
  Package.json: ✓
  Tailwind Config: ✓

Dark Mode Status:
  Currently Enabled: ✗

Component Analysis:
  Total Components: 12
  Transformable: 8 (67%)
  Estimated Changes: 45

💡 Recommendations:
  ✓ Ready for dark mode implementation
  Run: crow "add dark mode" to proceed
```

## ⚙️ Configuration

### Custom Color Mappings
You can extend the default color mappings by creating a `crow.config.js` file:

```javascript
module.exports = {
  colorMappings: {
    'bg-custom': 'bg-custom dark:bg-custom-dark',
    'text-brand': 'text-brand dark:text-brand-light',
  },
  ignore: ['*.test.js', 'node_modules/**'],
  typescript: true,
};
```

### Framework Detection
Crow Agent automatically detects your framework, but you can override it:

```bash
# Force React treatment
crow "add dark mode --framework react"

# Force Vue treatment  
crow "add dark mode --framework vue"
```

## 🔧 Advanced Usage

### Dry Run Mode
Preview changes before applying them:

```bash
crow "add dark mode --dry-run"
```

### Backup Creation
Create automatic backups:

```bash
crow "add dark mode --backup"
```

### Custom Component Names
```bash
crow "add dark mode --component DarkModeToggle"
```

### Skip Git Integration
```bash
crow "add dark mode --no-commit"
```

## 🎯 Examples

Check out example implementations in the [`examples/`](./examples) directory:

- [React + TypeScript](./examples/react-typescript)
- [Next.js App Router](./examples/nextjs-app-router)  
- [Vue 3 + Vite](./examples/vue-vite)
- [Nuxt.js](./examples/nuxtjs)
- [Vanilla HTML](./examples/vanilla-html)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/alexmckee/crow-agent.git
cd crow-agent

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm link
crow "help"
```

## 📝 License

MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the amazing utility-first framework
- [Commander.js](https://github.com/tj/commander.js) for CLI functionality
- [Babel](https://babeljs.io/) for JavaScript AST parsing
- [Vue.js](https://vuejs.org/) for SFC parsing utilities

## 🐛 Issues & Support

- [GitHub Issues](https://github.com/alexmckee/crow-agent/issues)
- [Discussions](https://github.com/alexmckee/crow-agent/discussions)

---

**Made with 🌙 by [Alex McKee](https://github.com/alexmckee)**

Transform your Tailwind projects to embrace the dark side! 🚀
