'use client';

import React from 'react';
import { getTextClasses, getTextColor } from '@/theme/theme';

/**
 * Example component demonstrating the new context-aware text color system
 * This shows how to use proper text colors for different background contexts
 */
export default function TextColorExample() {
  // Get text classes for different background contexts
  const whiteBgTextClasses = getTextClasses('white');
  const coloredBgTextClasses = getTextClasses('colored');
  
  // Get direct color values
  const whiteBgColors = getTextColor('white');
  const coloredBgColors = getTextColor('colored');

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Text Color System Examples</h1>
      
      {/* White Background Section */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className={`${whiteBgTextClasses.heading.h2} mb-4`}>
          White Background - Black Text
        </h2>
        <p className={`${whiteBgTextClasses.body.base} mb-2`}>
          This text uses black colors for optimal contrast on white backgrounds.
        </p>
        <p className={`${whiteBgTextClasses.body.small} mb-2`}>
          Secondary text uses dark gray for hierarchy.
        </p>
        <p className={`${whiteBgTextClasses.body.xs}`}>
          Muted text uses medium gray for subtle information.
        </p>
        
        {/* Direct color usage example */}
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-mono">
            Direct colors: White BG: {whiteBgColors}, Colored BG: {coloredBgColors}
          </p>
        </div>
      </div>

      {/* Colored Background Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg">
        <h2 className={`${coloredBgTextClasses.heading.h2} mb-4`}>
          Colored Background - White Text
        </h2>
        <p className={`${coloredBgTextClasses.body.base} mb-2`}>
          This text uses white colors for optimal contrast on colored backgrounds.
        </p>
        <p className={`${coloredBgTextClasses.body.small} mb-2`}>
          All text elements use white for maximum readability.
        </p>
        <p className={`${coloredBgTextClasses.body.xs}`}>
          Even small text uses white for consistency.
        </p>
        
        {/* Direct color usage example */}
        <div className="mt-4 p-3 bg-white bg-opacity-20 rounded">
          <p className="text-sm font-mono text-white">
            Direct colors: White BG: {whiteBgColors}, Colored BG: {coloredBgColors}
          </p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">How to Use:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>For white/light backgrounds:</strong> <code>getTextClasses('white')</code></p>
          <p><strong>For colored/dark backgrounds:</strong> <code>getTextClasses('colored')</code></p>
          <p><strong>For direct color values:</strong> <code>getTextColor('white' | 'colored')</code></p>
        </div>
      </div>
    </div>
  );
}

