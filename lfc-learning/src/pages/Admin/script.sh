#!/bin/bash

# Gradient background updater for ManageCourses.tsx
# Gradient from --bg-primary to --bg-elevated

echo "🎨 Adding gradient background to ManageCourses.tsx..."

# Check if file exists
if [ ! -f "ManageCourses.tsx" ]; then
    echo "❌ Error: ManageCourses.tsx not found in current directory"
    exit 1
fi

# Create a backup
cp ManageCourses.tsx ManageCourses.tsx.backup
echo "📦 Backup created: ManageCourses.tsx.backup"

# Replace the main container background with gradient
sed -i 's/className="p-6 dark:bg-\[var(--bg-primary)\]"/className="p-6 bg-gradient-to-b from-gray-100 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-elevated)]"/g' ManageCourses.tsx

# Replace the loading state background with gradient
sed -i 's/className="p-6 dark:bg-\[var(--bg-primary)\]"/className="p-6 bg-gradient-to-b from-gray-100 to-white dark:from-[var(--bg-primary)] dark:to-[var(--bg-elevated)]"/g' ManageCourses.tsx

echo "✅ Gradient background applied successfully!"
echo "📝 Changes applied:"
echo "   - 🌈 Gradient: from-gray-100 to-white (light mode)"
echo "   - 🌈 Gradient: from-[var(--bg-primary)] to-[var(--bg-elevated)] (dark mode)"
echo "   - 🎨 Creates smooth transition from darker to lighter"
echo ""
echo "🎉 Manage Courses now has a clean gradient background!"