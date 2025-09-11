# 🎨 Theming Best Practices & Rules

## Theme Quality Framework

### 1. **Color Rules**

#### Contrast Requirements
- **Text on Background**: Minimum 4.5:1 ratio (WCAG AA)
- **Large Text**: Minimum 3:1 ratio  
- **UI Elements**: Minimum 3:1 ratio for buttons, form controls
- **Focus Indicators**: Minimum 3:1 ratio, distinct from background

#### Color Harmony
- Use color theory: Complementary, Triadic, or Analogous schemes
- Maintain consistent saturation levels within theme
- Primary and accent colors should be distinct (≥30° hue difference)
- Test with color blindness simulators

#### Semantic Color Usage
```typescript
// ✅ Good semantic naming
colors: {
  primary: '#8b5cf6',    // Main brand color
  secondary: '#71717a',  // Supporting text/elements  
  accent: '#6366f1',     // Call-to-action highlights
  muted: '#fafafa',      // Subtle backgrounds
  border: '#e4e4e7',     // Subtle separation
}

// ❌ Avoid non-semantic names
colors: {
  purple: '#8b5cf6',
  lightGray: '#71717a', 
  blue: '#6366f1',
}
```

### 2. **Component State Rules**

#### Interactive States Hierarchy
```css
/* Base state */
.button { opacity: 1; transform: scale(1); }

/* Hover - subtle enhancement */
.button:hover { transform: scale(1.02); }

/* Active - clear feedback */
.button:active { transform: scale(0.98); }

/* Focus - accessibility essential */
.button:focus { ring: 2px solid theme(colors.primary); }

/* Disabled - clearly non-interactive */
.button:disabled { opacity: 0.5; cursor: not-allowed; }
```

#### Animation Consistency
- **Fast**: 150ms for small state changes (hover, focus)
- **Medium**: 200-300ms for theme switches, reveals
- **Slow**: 500ms+ for major layout changes
- Use `ease-out` for most interactions
- Use `ease-in-out` for reversible animations

### 3. **Dark Mode Transformation Rules**

#### Systematic Color Mapping
```typescript
// Light → Dark transformation rules
const transformRules = {
  // Backgrounds: Light → Dark
  'bg-white': 'bg-gray-900',
  'bg-gray-50': 'bg-gray-800', 
  'bg-gray-100': 'bg-gray-700',
  
  // Text: Dark → Light  
  'text-gray-900': 'text-gray-100',
  'text-gray-800': 'text-gray-200',
  'text-gray-700': 'text-gray-300',
  
  // Borders: Maintain relative contrast
  'border-gray-200': 'border-gray-700',
  'border-gray-300': 'border-gray-600',
}
```

#### Theme-Aware Component Classes
```tsx
// ✅ Comprehensive theme coverage
className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100  
  border border-gray-200 dark:border-gray-700
  hover:bg-gray-50 dark:hover:bg-gray-800
  focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
  transition-colors duration-200
"

// ❌ Incomplete coverage
className="bg-white text-gray-900 border"
```

### 4. **Accessibility Rules**

#### Keyboard Navigation
- All interactive elements must be focusable
- Focus indicators must be visible and high-contrast
- Tab order should be logical and consistent
- Skip links for complex layouts

#### Screen Reader Support
```tsx
// ✅ Proper labeling
<button
  aria-label="Switch to dark mode"
  aria-pressed={theme === 'dark'}
  role="switch"
>

// ✅ Status announcements  
<div aria-live="polite" className="sr-only">
  Theme changed to {theme} mode
</div>
```

### 5. **Technical Implementation Rules**

#### CSS Custom Properties
```css
/* ✅ Systematic theme variables */
:root {
  --color-background: #ffffff;
  --color-foreground: #1f2937;
  --color-primary: #8b5cf6;
  --color-secondary: #71717a;
  --color-accent: #6366f1;
  --color-muted: #fafafa;
  --color-border: #e4e4e7;
}

:root.dark {
  --color-background: #09090b;
  --color-foreground: #fafafa;
  --color-primary: #a78bfa;
  --color-secondary: #a1a1aa;
  --color-accent: #8b5cf6;
  --color-muted: #1c1c1f;
  --color-border: #27272a;
}
```

#### Theme Persistence
```typescript
// ✅ Respect user preferences
const getInitialTheme = (): Theme => {
  // 1. Check localStorage
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  
  // 2. Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

// ✅ Listen for system changes
useEffect(() => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    if (theme === 'system') {
      updateResolvedTheme(media.matches ? 'dark' : 'light');
    }
  };
  media.addEventListener('change', handleChange);
  return () => media.removeEventListener('change', handleChange);
}, [theme]);
```

## Quality Checklist

### ✅ Visual Quality
- [ ] All colors pass WCAG AA contrast requirements
- [ ] Color scheme uses harmonious palette  
- [ ] Consistent visual hierarchy in both themes
- [ ] Smooth transitions between theme states
- [ ] All interactive states properly styled

### ✅ Functional Quality  
- [ ] Theme preference persists across sessions
- [ ] Respects system dark mode preference
- [ ] No flash of incorrect theme on load
- [ ] Works without JavaScript (graceful degradation)
- [ ] Theme toggle provides clear feedback

### ✅ Accessibility Quality
- [ ] Keyboard navigation works in both themes
- [ ] Screen reader announces theme changes  
- [ ] Focus indicators visible in both themes
- [ ] Color is not the only way to convey information
- [ ] Meets WCAG 2.1 AA standards

### ✅ Technical Quality
- [ ] Uses semantic color naming
- [ ] CSS custom properties for theme values
- [ ] Efficient rendering (no layout thrashing)
- [ ] TypeScript types for theme values
- [ ] Error handling for theme operations

## Theme Validation Command

Use the built-in validator to check theme quality:

```bash
# Validate all themes
crow validate-themes

# Detailed analysis
crow validate-themes --verbose

# JSON output for tooling
crow validate-themes --json

# Validate specific theme
crow validate-themes --theme linear
```

## Common Anti-Patterns

### ❌ Hard-coded Colors
```tsx
// Bad - hard to maintain and theme
<div style={{ backgroundColor: '#f3f4f6' }}>
```

### ❌ Incomplete Dark Mode Coverage  
```tsx
// Bad - only covers background
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900">Text won't be visible in dark mode!</p>
</div>
```

### ❌ Poor Contrast
```tsx
// Bad - insufficient contrast
<button className="bg-gray-200 text-gray-400">
  Hard to read button
</button>
```

### ❌ No Animation Consistency
```css
/* Bad - inconsistent timing */
.button { transition: all 50ms ease; }
.modal { transition: opacity 1s linear; }
.dropdown { transition: transform 300ms ease-out; }
```

Follow these rules for professional, accessible, and maintainable themes! 🎨✨
