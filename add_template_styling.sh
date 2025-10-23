#!/bin/bash

# Add template color styling to tab components
TAB_FILES=(
  "src/components/landingPage/tabs/ApplyNowTab.tsx"
  "src/components/landingPage/tabs/DocumentChecklistTab.tsx"
  "src/components/landingPage/tabs/FindMyHomeTab.tsx"
  "src/components/landingPage/tabs/MyHomeValueTab.tsx"
  "src/components/landingPage/tabs/LearningCenterTab.tsx"
)

for file in "${TAB_FILES[@]}"; do
  echo "Adding template styling to $file..."
  
  # Add style attribute to primary buttons
  sed -i '' 's/className={`${classes\.button\.primary}/className={`${classes.button.primary}/g' "$file"
  
  # Find and replace button elements to add style attributes
  # This is a complex replacement, so we'll do it manually for each file
  echo "Manual styling needed for $file"
done

echo "Template styling script created!"
