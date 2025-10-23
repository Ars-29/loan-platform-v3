#!/bin/bash

# Fix hardcoded colors in tab components
TAB_FILES=(
  "src/components/landingPage/tabs/TodaysRatesTab.tsx"
  "src/components/landingPage/tabs/LearningCenterTab.tsx"
  "src/components/landingPage/tabs/MyHomeValueTab.tsx"
  "src/components/landingPage/tabs/FindMyHomeTab.tsx"
  "src/components/landingPage/tabs/ApplyNowTab.tsx"
  "src/components/landingPage/tabs/DocumentChecklistTab.tsx"
)

for file in "${TAB_FILES[@]}"; do
  echo "Fixing $file..."
  
  # Replace hardcoded button classes
  sed -i '' 's/bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md/px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white/g' "$file"
  sed -i '' 's/bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md/px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white/g' "$file"
  
  # Replace hardcoded outline classes
  sed -i '' 's/border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200/border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200/g' "$file"
  sed -i '' 's/border-2 border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-6 py-3 rounded-lg font-medium transition-all duration-200/border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200/g' "$file"
  
  # Replace hardcoded ghost classes
  sed -i '' 's/text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-all duration-200/px-4 py-2 rounded-lg font-medium transition-all duration-200/g' "$file"
  sed -i '' 's/text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition-all duration-200/px-4 py-2 rounded-lg font-medium transition-all duration-200/g' "$file"
  
  # Replace hardcoded icon classes
  sed -i '' 's/w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4/w-12 h-12 rounded-lg flex items-center justify-center mb-4/g' "$file"
  sed -i '' 's/w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4/w-12 h-12 rounded-lg flex items-center justify-center mb-4/g' "$file"
  sed -i '' 's/w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center/w-8 h-8 rounded-lg flex items-center justify-center/g' "$file"
  sed -i '' 's/w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center/w-8 h-8 rounded-lg flex items-center justify-center/g' "$file"
  
  echo "Fixed $file"
done

echo "All tab components fixed!"
