# LFC Jahi Tech Learn - Dark Mode Color System

## 📍 Location
All color definitions are centralized in: **`src/App.css`**

## 🎨 Color Palette

### Brand Colors (Fixed across themes)
These colors maintain consistency in both light and dark modes:

```css
/* Light Mode */
--lfc-red: #A41E21;           /* Primary brand red */
--lfc-red-hover: #8A1719;     /* Darker red for hover states */
--lfc-red-light: #C92428;     /* Lighter red accent */
--lfc-gold: #D4AF37;          /* Secondary brand gold */
--lfc-gold-hover: #B89530;    /* Darker gold for hover */
--lfc-gold-light: #E5C758;    /* Lighter gold accent */

/* Dark Mode - Darker, muted tones for eye comfort */
--lfc-red: #8B1518;           /* Darker, muted red */
--lfc-red-hover: #A41E21;     /* Slightly brighter on hover */
--lfc-red-light: #9A1A1D;     /* Light accent */
--lfc-gold: #E5C758;          /* Brighter gold (unchanged) */
--lfc-gold-hover: #F0D97A;    /* Brighter on hover */
--lfc-gold-light: #EDD685;    /* Light accent */
```

### Background Colors

#### Light Mode
```css
--bg-primary: #FFFFFF;        /* Main background (white) */
--bg-secondary: #F9FAFB;      /* Secondary surfaces */
--bg-tertiary: #F3F4F6;       /* Tertiary surfaces, inputs */
--bg-elevated: #FFFFFF;       /* Cards, modals */
```

#### Dark Mode
```css
--bg-primary: #0F1419;        /* Main background (very dark blue-gray) */
--bg-secondary: #16181D;      /* Secondary surfaces */
--bg-tertiary: #1C1F26;       /* Tertiary surfaces, inputs */
--bg-elevated: #22252D;       /* Cards, modals (slightly elevated) */
```

### Text Colors

#### Light Mode
```css
--text-primary: #111827;      /* Main text (near black) */
--text-secondary: #4B5563;    /* Secondary text */
--text-tertiary: #6B7280;     /* Tertiary text */
--text-muted: #9CA3AF;        /* Muted/disabled text */
```

#### Dark Mode
```css
--text-primary: #F9FAFB;      /* Main text (near white) */
--text-secondary: #D1D5DB;    /* Secondary text */
--text-tertiary: #9CA3AF;     /* Tertiary text */
--text-muted: #6B7280;        /* Muted/disabled text */
```

### Border Colors

#### Light Mode
```css
--border-primary: #E5E7EB;    /* Main borders */
--border-secondary: #D1D5DB;  /* Secondary borders */
--border-focus: var(--lfc-gold); /* Focus rings */
```

#### Dark Mode
```css
--border-primary: #2D3139;    /* Main borders (subtle) */
--border-secondary: #3A3F4A;  /* Secondary borders */
--border-focus: var(--lfc-gold); /* Focus rings */
```

### Interactive States

#### Light Mode
```css
--hover-bg: #F3F4F6;          /* Hover background */
--active-bg: #E5E7EB;         /* Active/pressed background */
--focus-ring: rgba(212, 175, 55, 0.3); /* Gold focus ring */
```

#### Dark Mode
```css
--hover-bg: #252930;          /* Hover background */
--active-bg: #2D3139;         /* Active/pressed background */
--focus-ring: rgba(229, 199, 88, 0.3); /* Gold focus ring */
```

### Semantic Colors

#### Light Mode
```css
--success: #10B981;           /* Success/positive actions */
--warning: #F59E0B;           /* Warning states */
--error: #EF4444;             /* Error states */
--info: #3B82F6;              /* Informational */
```

#### Dark Mode
```css
--success: #34D399;           /* Brighter success */
--warning: #FBBF24;           /* Brighter warning */
--error: #F87171;             /* Brighter error */
--info: #60A5FA;              /* Brighter info */
```

### Shadows

#### Light Mode
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

#### Dark Mode
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
```

## 🛠️ How to Adjust Colors

### 1. Edit Brand Colors
To change the red or gold colors:

```css
/* In src/App.css, find the :root section */
:root {
  --lfc-red: #YOUR_NEW_RED;
  --lfc-gold: #YOUR_NEW_GOLD;
}

/* And in .dark section */
.dark {
  --lfc-red: #YOUR_NEW_DARK_RED;
  --lfc-gold: #YOUR_NEW_DARK_GOLD;
}
```

### 2. Adjust Background Darkness
To make dark mode lighter or darker:

```css
.dark {
  --bg-primary: #0F1419;    /* Change this - darker = lower values */
  --bg-secondary: #16181D;  /* Keep ~5-10 units higher than primary */
  --bg-tertiary: #1C1F26;   /* Keep ~5-10 units higher than secondary */
  --bg-elevated: #22252D;   /* Keep ~5-10 units higher than tertiary */
}
```

### 3. Adjust Text Contrast
To increase/decrease text contrast:

```css
.dark {
  --text-primary: #F9FAFB;    /* Near white - increase for more contrast */
  --text-secondary: #D1D5DB;  /* Keep ~20-30% darker than primary */
  --text-tertiary: #9CA3AF;   /* Keep ~40-50% darker than primary */
}
```

## 📦 Utility Classes

Use these classes in your components:

### Background
```jsx
className="bg-primary"           // Uses --bg-primary
className="bg-secondary"         // Uses --bg-secondary
className="bg-tertiary"          // Uses --bg-tertiary
className="bg-elevated"          // Uses --bg-elevated
className="bg-lfc-red"           // Uses --lfc-red
className="bg-lfc-gold"          // Uses --lfc-gold
```

### Text
```jsx
className="text-primary"         // Uses --text-primary
className="text-secondary"       // Uses --text-secondary
className="text-tertiary"        // Uses --text-tertiary
className="text-muted"           // Uses --text-muted
className="text-lfc-red"         // Uses --lfc-red
className="text-lfc-gold"        // Uses --lfc-gold
```

### Borders
```jsx
className="border-primary"       // Uses --border-primary
className="border-secondary"     // Uses --border-secondary
className="border-lfc-red"       // Uses --lfc-red
className="border-lfc-gold"      // Uses --lfc-gold
```

## 🎯 Usage in Components

### Standard Pattern
```jsx
<div className="bg-white dark:bg-[var(--bg-elevated)] 
                text-gray-900 dark:text-[var(--text-primary)]
                border border-gray-200 dark:border-[var(--border-primary)]">
  Content
</div>
```

### Buttons
```jsx
<button className="bg-goldCustom dark:bg-[var(--lfc-gold)] 
                   hover:bg-[var(--lfc-gold-hover)]
                   text-white">
  Click Me
</button>
```

### Forms
```jsx
<input className="bg-white dark:bg-[var(--bg-tertiary)]
                  text-gray-900 dark:text-[var(--text-primary)]
                  border dark:border-[var(--border-primary)]
                  focus:ring-goldCustom dark:focus:ring-[var(--lfc-gold)]" />
```

## ✅ Updated Components

### Landing Page & Auth
- ✅ Landing Page
- ✅ Navbar
- ✅ Login Form
- ✅ Signup Form
- ✅ Verify Email
- ✅ Forgot Password

### Student Dashboard
- ✅ Student Dashboard Page
- ✅ Sidebar
- ✅ TopBar
- ✅ DashboardStats
- ✅ StatCard
- ✅ CourseCard

### Admin Dashboard
- ✅ Admin Dashboard Page
- ✅ Admin Sidebar
- ✅ Admin TopNav
- ✅ Admin StatCard
- ✅ All Admin Components (bulk update)

## 🔄 Theme Toggle

The theme is controlled by the `dark` class on the `<html>` element:

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Set dark mode
document.documentElement.classList.add('dark');

// Set light mode
document.documentElement.classList.remove('dark');
```

## 🎨 Design Philosophy

1. **Consistency**: Red and gold maintain brand identity across themes
2. **Contrast**: Dark mode uses slightly brighter colors for better visibility
3. **Hierarchy**: Clear visual hierarchy through background elevation
4. **Accessibility**: High contrast ratios for text readability
5. **Smooth Transitions**: All color changes animate smoothly (0.2s ease)

## 📝 Notes

- All colors use CSS custom properties for easy theming
- Dark mode backgrounds are deep blue-gray (not pure black) for reduced eye strain
- Shadows are more pronounced in dark mode for better depth perception
- Focus rings use gold color for consistency with brand
- All form inputs have proper dark mode styling with good contrast

## 🚀 Future Enhancements

Consider adding:
- Color scheme preference detection: `prefers-color-scheme`
- Additional theme variants (e.g., high contrast mode)
- Per-user theme preferences stored in database
- Theme preview before applying
