'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import Icon from '@/components/ui/Icon';

interface NeighborhoodReportsTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
}

interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

export default function NeighborhoodReportsTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData
}: NeighborhoodReportsTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [reportBlobUrl, setReportBlobUrl] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (reportBlobUrl) {
        URL.revokeObjectURL(reportBlobUrl);
      }
    };
  }, [reportBlobUrl]);

  // Color customization - defined in component code (easy to change)
  // These colors will be sent to the API for HTML customization
  const reportColors = {
    primary: colors.primary || '#ec4899',
    secondary: colors.secondary || '#01bcc6',
    text: colors.text || '#111827',
    textSecondary: colors.textSecondary || '#6b7280',
    background: colors.background || '#ffffff',
    accent: colors.secondary || '#01bcc6',
    border: colors.border || '#e5e7eb',
  };

  // Get API URL from environment variable
  const getReportsApiUrl = () => {
    // Use environment variable - must be set in .env.local
    const apiUrl = process.env.NEXT_PUBLIC_LOCAL_LOGIC_REPORTS_API_URL;
    
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_LOCAL_LOGIC_REPORTS_API_URL is not set in environment variables');
      // Only use localhost fallback in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using localhost:3001 fallback for development. Set NEXT_PUBLIC_LOCAL_LOGIC_REPORTS_API_URL in .env.local for production.');
        return 'http://localhost:3001';
      }
      // In production, return empty string and handle error in UI
      return '';
    }
    
    // Remove trailing slash to avoid double slashes in URL construction
    return apiUrl.replace(/\/+$/, '');
  };

  // Geocode address using OpenStreetMap Nominatim (free)
  const geocodeAddress = async (addressInput: string): Promise<GeocodeResult | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressInput)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'LoanOfficerPlatform/1.0' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Address not found. Please try a more specific address.');
      }

      return {
        lat: data[0].lat,
        lon: data[0].lon,
        display_name: data[0].display_name
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to geocode address');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setReportHtml(null);
    setCoordinates(null);
    // Clean up previous blob URL
    if (reportBlobUrl) {
      URL.revokeObjectURL(reportBlobUrl);
      setReportBlobUrl(null);
    }

    try {
      // Step 1: Geocode address to get coordinates
      const geocodeResult = await geocodeAddress(address);
      
      if (!geocodeResult) {
        throw new Error('Could not find coordinates for this address');
      }

      const lat = parseFloat(geocodeResult.lat);
      const lng = parseFloat(geocodeResult.lon);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates received');
      }

      setCoordinates({ lat, lng });

      // Step 2: Call API with POST (secure - colors in body, not URL)
      const apiBaseUrl = getReportsApiUrl();
      
      if (!apiBaseUrl) {
        throw new Error('Local Logic Reports API is not configured. Please set NEXT_PUBLIC_LOCAL_LOGIC_REPORTS_API_URL in your environment variables.');
      }
      
      const response = await fetch(`${apiBaseUrl}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lng,
          address,
          type: 'nmr', // Default to NeighborhoodIntel report (can be changed to 'nmr' if needed)
          colors: reportColors, // Colors from component code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate report' }));
        throw new Error(errorData.error || errorData.message || 'Failed to generate report');
      }

      // Step 3: Get HTML response and create blob URL for iframe
      const html = await response.text();
      setReportHtml(html);

      // Create blob URL for iframe
      const blob = new Blob([html], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      setReportBlobUrl(blobUrl);

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process address');
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hide scrollbars but allow scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        .neighborhood-report-iframe {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE and Edge */
        }
        .neighborhood-report-iframe::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari, Opera */
          width: 0 !important;
          height: 0 !important;
        }
        .neighborhood-report-container {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* IE and Edge */
        }
        .neighborhood-report-container::-webkit-scrollbar {
          display: none !important; /* Chrome, Safari, Opera */
          width: 0 !important;
          height: 0 !important;
        }
      `}} />
      <div>
        <h2 
          className="text-2xl font-bold mb-2" 
          style={{ color: colors.text }}
        >
          Neighborhood Reports
        </h2>
        <p 
          className="text-sm mb-6" 
          style={{ color: colors.textSecondary }}
        >
          Get comprehensive neighborhood insights and market trends for any location
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
              setReportHtml(null);
              // Clean up previous blob URL
              if (reportBlobUrl) {
                URL.revokeObjectURL(reportBlobUrl);
                setReportBlobUrl(null);
              }
            }}
            placeholder="Enter an address (e.g., 500 Dudley St, Philadelphia, PA 19148)"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              borderColor: colors.border,
              borderRadius: `${layout.borderRadius}px`,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.boxShadow = 'none';
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: colors.primary,
              color: colors.background,
              borderRadius: `${layout.borderRadius}px`,
              opacity: (loading || !address.trim()) ? 0.5 : 1
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div 
          className="p-4 rounded-lg"
          style={{ 
            backgroundColor: '#fee2e2',
            borderColor: '#fca5a5',
            borderWidth: '1px',
            borderRadius: `${layout.borderRadius}px`
          }}
        >
          <p className="text-sm" style={{ color: '#dc2626' }}>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div 
            className="animate-spin rounded-full border-4 border-t-transparent"
            style={{ 
              width: '48px',
              height: '48px',
              borderColor: colors.primary,
              borderTopColor: 'transparent'
            }}
          />
          <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
            Finding location and generating report...
          </p>
        </div>
      )}

      {/* Report Iframe */}
      {reportBlobUrl && !loading && (
        <div 
          className="border rounded-lg neighborhood-report-container"
          style={{ 
            borderColor: colors.border,
            borderRadius: `${layout.borderRadius}px`,
            minHeight: '800px',
            maxHeight: '800px',
            overflow: 'auto', // Allow scrolling
            position: 'relative'
          }}
        >
          <iframe
            src={reportBlobUrl}
            width="100%"
            height="800px"
            frameBorder="0"
            scrolling="yes" // Allow scrolling inside iframe
            title="Neighborhood Report"
            className="w-full neighborhood-report-iframe"
            style={{ 
              minHeight: '800px',
              marginTop: '-100px',
              overflow: 'auto', // Allow scrolling
            }}
          />
        </div>
      )}

      {/* Instructions */}
      {!reportBlobUrl && !loading && !error && (
        <div 
          className="p-6 rounded-lg"
          style={{ 
            backgroundColor: `${colors.primary}10`,
            borderColor: colors.border,
            borderWidth: '1px',
            borderRadius: `${layout.borderRadius}px`
          }}
        >
          <div className="flex items-start gap-3">
            <Icon name="about" className="w-5 h-5 mt-0.5" color={colors.primary} />
            <div>
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>
                How to use:
              </h3>
              <ul className="text-sm space-y-1" style={{ color: colors.textSecondary }}>
                <li>• Enter a complete address (street, city, state, zip)</li>
                <li>• Click "Search" to generate a neighborhood report</li>
                <li>• The report includes neighborhood insights and market trends</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

