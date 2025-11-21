# Myotopia Color System Reference

## Overview
The Myotopia color system uses a consistent HSL-based design with orange/red gradients as the primary brand identity. All colors are defined as semantic tokens to ensure consistency and maintainability.

## Brand Colors

### Primary Brand (Orange)
- **Primary**: `24 95% 53%` - Vibrant orange (#F97316)
- **Primary Light**: `24 95% 60%`
- **Primary Dark**: `24 95% 45%`

### Secondary Brand (Red)
- **Secondary**: `0 84% 60%` - Vibrant red (#DC2626)
- **Secondary Light**: `0 84% 70%`
- **Secondary Dark**: `0 84% 50%`

## Base Colors (Dark Theme)

### Surfaces
- **Background**: `0 0% 3%` - Near black
- **Foreground**: `0 0% 98%` - Near white
- **Card**: `0 0% 7%` - Dark gray card background
- **Card Foreground**: `0 0% 98%`
- **Popover**: `0 0% 9%` - Slightly lighter than card
- **Popover Foreground**: `0 0% 98%`

### UI Elements
- **Muted**: `0 0% 10%` - Muted background
- **Muted Foreground**: `0 0% 60%` - Muted text
- **Accent**: `24 95% 53%` - Matches primary
- **Accent Foreground**: `0 0% 100%`
- **Border**: `0 0% 14%` - Subtle borders
- **Input**: `0 0% 14%` - Input backgrounds
- **Ring**: `24 95% 53%` - Focus rings

## State Colors

### Success
- **Light**: `142 76% 60%` - Light green
- **Default**: `142 76% 45%` - Success green
- **Dark**: `142 76% 35%` - Dark green

### Warning
- **Light**: `47 96% 70%` - Light yellow
- **Default**: `47 96% 53%` - Warning yellow
- **Dark**: `47 96% 40%` - Dark yellow

### Error/Destructive
- **Light**: `0 84% 75%` - Light red
- **Default**: `0 84% 60%` - Error red (matches secondary)
- **Dark**: `0 84% 45%` - Dark red

## Shadows & Glows

### Shadows
- **Scientific**: `0 10px 30px -10px hsl(24 95% 53% / 0.3)` - Orange shadow
- **Elevated**: `0 20px 40px -15px hsl(24 95% 53% / 0.4)` - Elevated shadow

### Glows
- **Primary**: `0 0 40px hsl(24 95% 53% / 0.6)` - Orange glow
- **Secondary**: `0 0 40px hsl(0 84% 60% / 0.6)` - Red glow
- **Success**: `0 0 30px hsl(142 76% 45% / 0.5)` - Green glow
- **Warning**: `0 0 30px hsl(47 96% 53% / 0.5)` - Yellow glow
- **Error**: `0 0 30px hsl(0 84% 60% / 0.5)` - Red glow

## Usage Guidelines

### Using Colors in Components

**✅ CORRECT - Use semantic tokens:**
```tsx
className="bg-primary text-primary-foreground"
className="border-border bg-card text-card-foreground"
className="text-muted-foreground hover:text-foreground"
```

**❌ INCORRECT - Don't use hardcoded colors:**
```tsx
className="bg-orange-500 text-white"  // ❌ No
className="bg-gray-900 text-gray-400" // ❌ No
```

### Brand Gradients

**Primary Button:**
```tsx
className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
```

**Utility Classes:**
```tsx
className="text-gradient"           // Orange to red gradient text
className="bg-brand-gradient"       // Full gradient background
className="bg-brand-gradient-subtle" // Subtle gradient background
```

### Dropdowns & Popovers
Always ensure dropdowns have proper background and z-index:
```tsx
className="z-[100] bg-popover/95 backdrop-blur-sm border-border"
```

## CSS Variables Reference

All colors are defined in `src/index.css` and referenced in `tailwind.config.ts`:

```css
:root {
  --primary: 24 95% 53%;
  --secondary: 0 84% 60%;
  --background: 0 0% 3%;
  --foreground: 0 0% 98%;
  /* ... more variables */
}
```

## Common Patterns

### Form Inputs
```tsx
className="bg-input border-border text-foreground placeholder:text-muted-foreground"
```

### Cards
```tsx
className="bg-card border-border text-card-foreground"
```

### Buttons
```tsx
// Primary button
className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"

// Secondary button
className="bg-secondary text-secondary-foreground hover:bg-secondary/90"

// Muted button
className="bg-muted text-muted-foreground hover:bg-muted/80"
```

### Links
```tsx
className="text-primary hover:text-primary/90"
```

## Important Notes

1. **Always use HSL format** - Never pass RGB values to `hsl()` functions
2. **Use semantic tokens** - Prefer `--primary` over specific color values
3. **Maintain consistency** - Use the design system for all color choices
4. **Dark theme only** - Currently only dark theme is implemented
5. **Accessibility** - Ensure sufficient contrast (WCAG AA minimum)

## Testing Colors

To verify colors are working correctly:
1. Check that no yellow tints appear (indicates RGB/HSL mismatch)
2. Verify gradients render smoothly
3. Test hover states and transitions
4. Check dark mode compatibility
5. Validate contrast ratios

## Future Considerations

- Light theme variant (if needed)
- Additional brand color variations
- Seasonal or theme-specific color schemes
- A11y high-contrast mode
