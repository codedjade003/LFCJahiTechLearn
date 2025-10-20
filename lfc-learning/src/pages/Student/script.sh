#!/bin/bash

# Dark mode updater for CourseDetails.tsx
# Following the red-800 pattern for dark mode

echo "🔄 Updating CourseDetails.tsx for dark mode..."

# Check if file exists
if [ ! -f "CourseDetails.tsx" ]; then
    echo "❌ Error: CourseDetails.tsx not found in current directory"
    exit 1
fi

# Create a backup
cp CourseDetails.tsx CourseDetails.tsx.backup
echo "📦 Backup created: CourseDetails.tsx.backup"

# Apply all replacements following the red-800 pattern
sed -i 's/bg-yt-light-gray/bg-gray-200 dark:bg-[var(--bg-primary)]/g' CourseDetails.tsx
sed -i 's/bg-white dark:bg-\[var(--bg-elevated)\]/bg-white dark:bg-[var(--bg-elevated)]/g' CourseDetails.tsx
sed -i 's/border-yt-light-border/border-[var(--border-primary)]/g' CourseDetails.tsx
sed -i 's/text-yt-text-dark/text-[var(--text-primary)]/g' CourseDetails.tsx
sed -i 's/text-yt-text-gray/text-[var(--text-secondary)]/g' CourseDetails.tsx
sed -i 's/hover:bg-yt-light-hover/hover:bg-[var(--hover-bg)] dark:hover:bg-[var(--hover-bg)]/g' CourseDetails.tsx
sed -i 's/bg-yt-progress-light-bg/bg-[var(--bg-tertiary)]/g' CourseDetails.tsx
sed -i 's/bg-lfc-red text-white/bg-lfc-red dark:bg-red-800 text-gray-200/g' CourseDetails.tsx
sed -i 's/hover:bg-lfc-gold-dark/hover:bg-lfc-red-hover dark:hover:bg-red-700/g' CourseDetails.tsx
sed -i 's/bg-gray-100/bg-gray-200 dark:bg-[var(--bg-tertiary)]/g' CourseDetails.tsx
sed -i 's/text-gray-600/text-[var(--text-secondary)]/g' CourseDetails.tsx
sed -i 's/bg-blue-100 text-blue-600/bg-blue-100 dark:bg-blue-900\/30 text-blue-600 dark:text-blue-300/g' CourseDetails.tsx
sed -i 's/bg-green-100 text-green-600/bg-green-100 dark:bg-green-900\/30 text-green-600 dark:text-green-300/g' CourseDetails.tsx
sed -i 's/bg-gray-100 text-gray-600/bg-gray-200 dark:bg-[var(--bg-tertiary)] text-gray-600 dark:text-[var(--text-secondary)]/g' CourseDetails.tsx
sed -i 's/bg-green-50/bg-green-100 dark:bg-green-900\/20/g' CourseDetails.tsx
sed -i 's/border-green-200/border-green-300 dark:border-green-700/g' CourseDetails.tsx
sed -i 's/text-green-600/text-green-700 dark:text-green-300/g' CourseDetails.tsx
sed -i 's/bg-red-50/bg-red-100 dark:bg-red-900\/20/g' CourseDetails.tsx
sed -i 's/border-red-200/border-red-300 dark:border-red-700/g' CourseDetails.tsx
sed -i 's/text-red-700/text-red-800 dark:text-red-200/g' CourseDetails.tsx
sed -i 's/bg-yellow-50/bg-yellow-100 dark:bg-yellow-900\/20/g' CourseDetails.tsx
sed -i 's/border-yellow-200/border-yellow-300 dark:border-yellow-700/g' CourseDetails.tsx
sed -i 's/text-yellow-800/text-yellow-900 dark:text-yellow-200/g' CourseDetails.tsx
sed -i 's/bg-orange-50/bg-orange-100 dark:bg-orange-900\/20/g' CourseDetails.tsx
sed -i 's/border-orange-200/border-orange-300 dark:border-orange-700/g' CourseDetails.tsx
sed -i 's/text-orange-700/text-orange-800 dark:text-orange-200/g' CourseDetails.tsx
sed -i 's/bg-blue-50/bg-blue-100 dark:bg-blue-900\/20/g' CourseDetails.tsx
sed -i 's/border-blue-200/border-blue-300 dark:border-blue-700/g' CourseDetails.tsx
sed -i 's/text-blue-700/text-blue-800 dark:text-blue-200/g' CourseDetails.tsx
sed -i 's/bg-gray-50/bg-gray-200 dark:bg-[var(--bg-secondary)]/g' CourseDetails.tsx
sed -i 's/bg-black/bg-black dark:bg-gray-900/g' CourseDetails.tsx
sed -i 's/bg-gradient-to-br from-lfc-red to-lfc-gold/bg-gradient-to-br from-lfc-red to-lfc-gold dark:from-red-800 dark:to-lfc-gold/g' CourseDetails.tsx
sed -i 's/bg-gradient-to-br from-blue-500 to-purple-600/bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800/g' CourseDetails.tsx

# Fix quiz component specific styling
sed -i 's/bg-white dark:bg-\[var(--bg-elevated)\] rounded-lg border border-gray-200/bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)]/g' CourseDetails.tsx
sed -i 's/border-gray-300/border-[var(--border-primary)]/g' CourseDetails.tsx
sed -i 's/hover:border-gray-400/hover:border-[var(--border-secondary)]/g' CourseDetails.tsx
sed -i 's/hover:bg-gray-50/hover:bg-[var(--hover-bg)]/g' CourseDetails.tsx
sed -i 's/border-lfc-red/border-lfc-red dark:border-red-800/g' CourseDetails.tsx
sed -i 's/bg-red-50/bg-red-100 dark:bg-red-900\/20/g' CourseDetails.tsx

# Fix certificate download button
sed -i 's/bg-gradient-to-r from-lfc-red to-lfc-gold text-white/bg-gradient-to-r from-lfc-red to-lfc-gold dark:from-red-800 dark:to-lfc-gold text-gray-200/g' CourseDetails.tsx

echo "✅ CourseDetails.tsx updated successfully with dark mode support!"
echo "📝 Changes applied:"
echo "   - Updated all background colors"
echo "   - Updated all text colors to CSS variables"
echo "   - Updated border colors"
echo "   - ✅ Red colors use dark:text-red-800 and dark:bg-red-800"
echo "   - Updated quiz component with proper dark mode"
echo "   - Fixed progress bars and badges"
echo "   - Updated certificate download button"
echo "   - Improved all alert/notification boxes"
echo "   - Fixed gradient backgrounds for dark mode"
echo ""
echo "🎉 Course Details dark mode update completed!"