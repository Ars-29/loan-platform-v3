'use client';

import { usePathname, useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { useAuth } from '@/hooks/use-auth';

interface RouteConfig {
  path: string;
  label: string;
  icon?: keyof typeof import('@/components/ui/Icon').icons;
  parent?: string;
  dataFetcher?: 
    | ((params: any) => { label: string; href?: string }) // Synchronous
    | ((params: any, makeAuthenticatedRequest: (url: string) => Promise<any>) => Promise<{ label: string; href?: string }>); // Asynchronous
}

interface BreadcrumbConfig {
  [key: string]: RouteConfig;
}

// Comprehensive route configuration for all portals
const breadcrumbConfig: BreadcrumbConfig = {
  // Admin Portal Routes
  '/admin/dashboard': {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'home'
  },
  '/admin/loanofficers': {
    path: '/admin/loanofficers',
    label: 'Loan Officers',
    icon: 'profile',
    parent: '/admin/dashboard'
  },
  '/admin/loanofficers/[slug]': {
    path: '/admin/loanofficers/[slug]',
    label: 'Officer Details',
    icon: 'user',
    parent: '/admin/loanofficers',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        const data = await makeAuthenticatedRequest(`/api/officers/by-slug/${params.slug}`);
        return {
          label: `${data.officer.firstName} ${data.officer.lastName}`,
          href: `/admin/loanofficers/${params.slug}`
        };
      } catch (error) {
        console.error('Error fetching officer data:', error);
        return { label: 'Loading...', href: `/admin/loanofficers/${params.slug}` };
      }
    }
  },
  '/admin/loanofficers/[slug]/details': {
    path: '/admin/loanofficers/[slug]/details',
    label: 'Officer Details',
    icon: 'user',
    parent: '/admin/loanofficers',
    dataFetcher: (params: any) => {
      // Decode URL-encoded characters first, then convert slug to readable name
      const decodedSlug = decodeURIComponent(params.slug);
      let readableName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      // Remove numerical ID at the end (e.g., "1759496176601")
      readableName = readableName.replace(/\s+\d+$/, '');
      return { 
        label: readableName, 
        href: `/admin/loanofficers/${params.slug}/details` 
      };
    }
  },
  '/admin/loanofficers/[slug]/leads': {
    path: '/admin/loanofficers/[slug]/leads',
    label: 'Leads',
    icon: 'document',
    parent: '/admin/loanofficers/[slug]',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        const data = await makeAuthenticatedRequest(`/api/officers/by-slug/${params.slug}`);
        return {
          label: `${data.officer.firstName} ${data.officer.lastName}`,
          href: `/admin/loanofficers/${params.slug}`
        };
      } catch (error) {
        console.error('Error fetching officer data:', error);
        return { label: 'Loading...', href: `/admin/loanofficers/${params.slug}` };
      }
    }
  },
  '/admin/loanofficers/[slug]/leads/[leadSlug]': {
    path: '/admin/loanofficers/[slug]/leads/[leadSlug]',
    label: 'Lead Details',
    icon: 'profile',
    parent: '/admin/insights',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        console.log('🔍 Admin Lead Details dataFetcher called with params:', params);
        const data = await makeAuthenticatedRequest(`/api/leads/by-slug/${params.leadSlug}`);
        console.log('🔍 Admin Lead Details API response:', data);
        
        if (data.success && data.lead && data.lead.firstName && data.lead.lastName) {
          const fullName = `${data.lead.firstName} ${data.lead.lastName}`;
          console.log('✅ Admin Lead Details name resolved:', fullName);
          return {
            label: fullName,
            href: `/admin/loanofficers/${params.slug}/leads/${params.leadSlug}`
          };
        } else {
          throw new Error('Invalid lead API response structure');
        }
      } catch (error) {
        console.error('❌ Error fetching admin lead details data:', error);
        // Fallback to showing the slug as a readable name
        const readableName = params.leadSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        console.log('🔄 Using fallback name:', readableName);
        return { label: readableName, href: `/admin/loanofficers/${params.slug}/leads/${params.leadSlug}` };
      }
    }
  },
  '/admin/insights': {
    path: '/admin/insights',
    label: 'Leads Insights',
    icon: 'trendingUp',
    parent: '/admin/dashboard'
  },
  '/admin/insights/loanofficers/[slug]': {
    path: '/admin/insights/loanofficers/[slug]',
    label: 'Officer Insights',
    icon: 'user',
    parent: '/admin/insights',
    dataFetcher: async (params: any) => {
      try {
        const response = await fetch(`/api/officers/by-slug/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          return {
            label: `${data.officer.firstName} ${data.officer.lastName}`,
            href: `/admin/insights/loanofficers/${params.slug}`
          };
        }
      } catch (error) {
        console.error('Error fetching officer data:', error);
      }
      return { label: 'Loading...', href: `/admin/insights/loanofficers/${params.slug}` };
    }
  },
  '/admin/insights/loanofficers/[slug]/leads': {
    path: '/admin/insights/loanofficers/[slug]/leads',
    label: 'Leads',
    icon: 'document',
    parent: '/admin/insights/loanofficers/[slug]',
    dataFetcher: async (params: any) => {
      try {
        const response = await fetch(`/api/officers/by-slug/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          return {
            label: `${data.officer.firstName} ${data.officer.lastName}`,
            href: `/admin/insights/loanofficers/${params.slug}`
          };
        }
      } catch (error) {
        console.error('Error fetching officer data:', error);
      }
      return { label: 'Loading...', href: `/admin/insights/loanofficers/${params.slug}` };
    }
  },
  '/admin/insights/loanofficers/[slug]/leads/[leadSlug]': {
    path: '/admin/insights/loanofficers/[slug]/leads/[leadSlug]',
    label: 'Lead Details',
    icon: 'profile',
    parent: '/admin/insights',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        console.log('🔍 Admin Insights Lead Details dataFetcher called with params:', params);
        const data = await makeAuthenticatedRequest(`/api/leads/by-slug/${params.leadSlug}`);
        console.log('🔍 Admin Insights Lead Details API response:', data);
        
        if (data.success && data.lead && data.lead.firstName && data.lead.lastName) {
          const fullName = `${data.lead.firstName} ${data.lead.lastName}`;
          console.log('✅ Admin Insights Lead Details name resolved:', fullName);
          return {
            label: fullName,
            href: `/admin/insights/loanofficers/${params.slug}/leads/${params.leadSlug}`
          };
        } else {
          throw new Error('Invalid lead API response structure');
        }
      } catch (error) {
        console.error('❌ Error fetching admin insights lead details data:', error);
        // Fallback to showing the slug as a readable name
        const readableName = params.leadSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        console.log('🔄 Using fallback name:', readableName);
        return { label: readableName, href: `/admin/insights/loanofficers/${params.slug}/leads/${params.leadSlug}` };
      }
    }
  },
  '/admin/settings': {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'settings',
    parent: '/admin/dashboard'
  },
  '/admin/activities': {
    path: '/admin/activities',
    label: 'Activities',
    icon: 'activity',
    parent: '/admin/dashboard'
  },
  '/admin/stats': {
    path: '/admin/stats',
    label: 'Conversion Stats',
    icon: 'calculator',
    parent: '/admin/dashboard'
  },

  // Officers Portal Routes
  '/officers/dashboard': {
    path: '/officers/dashboard',
    label: 'Dashboard',
    icon: 'home'
  },
  '/officers/leads': {
    path: '/officers/leads',
    label: 'Leads',
    icon: 'document',
    parent: '/officers/dashboard'
  },
  '/officers/leads/[leadId]': {
    path: '/officers/leads/[leadId]',
    label: 'Lead Details',
    icon: 'profile',
    parent: '/officers/leads',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        const data = await makeAuthenticatedRequest(`/api/leads/by-slug/${params.leadId}`);
        return {
          label: `${data.lead.firstName} ${data.lead.lastName}`,
          href: `/officers/leads/${params.leadId}`
        };
      } catch (error) {
        console.error('Error fetching lead data:', error);
        return { label: 'Loading...', href: `/officers/leads/${params.leadId}` };
      }
    }
  },
  '/officers/profile': {
    path: '/officers/profile',
    label: 'Profile',
    icon: 'profile',
    parent: '/officers/dashboard'
  },
  '/officers/customizer': {
    path: '/officers/customizer',
    label: 'Customizer',
    icon: 'edit',
    parent: '/officers/dashboard'
  },
  '/officers/settings': {
    path: '/officers/settings',
    label: 'Settings',
    icon: 'settings',
    parent: '/officers/dashboard'
  },
  '/officers/activities': {
    path: '/officers/activities',
    label: 'Activities',
    icon: 'activity',
    parent: '/officers/dashboard'
  },

  // Super Admin Portal Routes
  '/super-admin/dashboard': {
    path: '/super-admin/dashboard',
    label: 'Dashboard',
    icon: 'home'
  },
  '/super-admin/companies': {
    path: '/super-admin/companies',
    label: 'Companies',
    icon: 'building',
    parent: '/super-admin/dashboard'
  },
  '/super-admin/companies/[slug]/details': {
    path: '/super-admin/companies/[slug]/details',
    label: 'Company Details',
    icon: 'building',
    parent: '/super-admin/companies',
    dataFetcher: (params: any) => {
      // Decode URL-encoded characters first, then convert slug to readable name
      const decodedSlug = decodeURIComponent(params.slug);
      let readableName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      // Remove numerical ID at the end (e.g., "1759496176601")
      readableName = readableName.replace(/\s+\d+$/, '');
      return { 
        label: readableName, 
        href: `/super-admin/companies/${params.slug}/details` 
      };
    }
  },
  '/super-admin/officers': {
    path: '/super-admin/officers',
    label: 'Loan Officers',
    icon: 'profile',
    parent: '/super-admin/dashboard'
  },
  '/super-admin/officers/[slug]': {
    path: '/super-admin/officers/[slug]',
    label: 'Officer Details',
    icon: 'user',
    parent: '/super-admin/officers',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        console.log('🔍 Super Admin Officer dataFetcher called with params:', params);
        const data = await makeAuthenticatedRequest(`/api/officers/by-slug/${params.slug}`);
        console.log('🔍 Super Admin Officer API response:', data);
        
        if (data.success && data.officer && data.officer.firstName && data.officer.lastName) {
          const fullName = `${data.officer.firstName} ${data.officer.lastName}`;
          console.log('✅ Super Admin Officer name resolved:', fullName);
          return {
            label: fullName,
            href: `/super-admin/officers/${params.slug}`
          };
        } else {
          throw new Error('Invalid officer API response structure');
        }
      } catch (error) {
        console.error('❌ Error fetching super admin officer data:', error);
        // Fallback to showing the slug as a readable name
        const readableName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        console.log('🔄 Using fallback name:', readableName);
        return { label: readableName, href: `/super-admin/officers/${params.slug}` };
      }
    }
  },
  '/super-admin/officers/[slug]/details': {
    path: '/super-admin/officers/[slug]/details',
    label: 'Officer Details',
    icon: 'user',
    parent: '/super-admin/officers',
    dataFetcher: (params: any) => {
      // Decode URL-encoded characters first, then convert slug to readable name
      const decodedSlug = decodeURIComponent(params.slug);
      let readableName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      // Remove numerical ID at the end (e.g., "1759496176601")
      readableName = readableName.replace(/\s+\d+$/, '');
      return { 
        label: readableName, 
        href: `/super-admin/officers/${params.slug}/details` 
      };
    }
  },
  '/super-admin/officers/[slug]/leads': {
    path: '/super-admin/officers/[slug]/leads',
    label: 'Leads',
    icon: 'document',
    parent: '/super-admin/officers/[slug]',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        console.log('🔍 Super Admin Officer Leads dataFetcher called with params:', params);
        const data = await makeAuthenticatedRequest(`/api/officers/by-slug/${params.slug}`);
        console.log('🔍 Super Admin Officer Leads API response:', data);
        
        if (data.success && data.officer && data.officer.firstName && data.officer.lastName) {
          const fullName = `${data.officer.firstName} ${data.officer.lastName}`;
          console.log('✅ Super Admin Officer Leads name resolved:', fullName);
          return {
            label: fullName,
            href: `/super-admin/officers/${params.slug}`
          };
        } else {
          throw new Error('Invalid officer API response structure');
        }
      } catch (error) {
        console.error('❌ Error fetching super admin officer leads data:', error);
        // Fallback to showing the slug as a readable name
        const readableName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        console.log('🔄 Using fallback name:', readableName);
        return { label: readableName, href: `/super-admin/officers/${params.slug}` };
      }
    }
  },
  '/super-admin/officers/[slug]/leads/[leadSlug]': {
    path: '/super-admin/officers/[slug]/leads/[leadSlug]',
    label: 'Lead Details',
    icon: 'profile',
    parent: '/super-admin/insights',
    dataFetcher: async (params, makeAuthenticatedRequest) => {
      try {
        console.log('🔍 Super Admin Lead Details dataFetcher called with params:', params);
        const data = await makeAuthenticatedRequest(`/api/leads/by-slug/${params.leadSlug}`);
        console.log('🔍 Super Admin Lead Details API response:', data);
        
        if (data.success && data.lead && data.lead.firstName && data.lead.lastName) {
          const fullName = `${data.lead.firstName} ${data.lead.lastName}`;
          console.log('✅ Super Admin Lead Details name resolved:', fullName);
          return {
            label: fullName,
            href: `/super-admin/officers/${params.slug}/leads/${params.leadSlug}`
          };
        } else {
          throw new Error('Invalid lead API response structure');
        }
      } catch (error) {
        console.error('❌ Error fetching super admin lead details data:', error);
        // Fallback to showing the slug as a readable name
        const readableName = params.leadSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        console.log('🔄 Using fallback name:', readableName);
        return { label: readableName, href: `/super-admin/officers/${params.slug}/leads/${params.leadSlug}` };
      }
    }
  },
  '/super-admin/insights': {
    path: '/super-admin/insights',
    label: 'Leads Insights',
    icon: 'trendingUp',
    parent: '/super-admin/dashboard'
  },
  '/super-admin/settings': {
    path: '/super-admin/settings',
    label: 'Settings',
    icon: 'settings',
    parent: '/super-admin/dashboard'
  },
  '/super-admin/activities': {
    path: '/super-admin/activities',
    label: 'Activities',
    icon: 'activity',
    parent: '/super-admin/dashboard'
  },
  '/super-admin/stats': {
    path: '/super-admin/stats',
    label: 'Conversion Stats',
    icon: 'calculator',
    parent: '/super-admin/dashboard'
  }
};

/**
 * Hook to automatically generate breadcrumbs based on current route
 */
export const useBreadcrumb = () => {
  const pathname = usePathname();
  const params = useParams();
  const { accessToken } = useAuth();
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Find the matching route configuration
  const findMatchingRoute = (path: string): RouteConfig | null => {
    // Direct match first
    if (breadcrumbConfig[path]) {
      return breadcrumbConfig[path];
    }

    // Try to match dynamic routes
    const pathSegments = path.split('/').filter(Boolean);
    
    for (const [routePath, config] of Object.entries(breadcrumbConfig)) {
      const routeSegments = routePath.split('/').filter(Boolean);
      
      if (pathSegments.length === routeSegments.length) {
        let matches = true;
        for (let i = 0; i < routeSegments.length; i++) {
          if (routeSegments[i].startsWith('[') && routeSegments[i].endsWith(']')) {
            // Dynamic segment - always matches
            continue;
          }
          if (pathSegments[i] !== routeSegments[i]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          return config;
        }
      }
    }
    
    return null;
  };

  // Helper function to make authenticated API requests
  const makeAuthenticatedRequest = async (url: string) => {
    console.log('🔍 Breadcrumb API request:', url);
    console.log('🔍 Access token available:', !!accessToken);
    console.log('🔍 Access token preview:', accessToken ? `${accessToken.substring(0, 20)}...` : 'None');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:', response.status, response.statusText, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  };

  // Helper function to build href from route path
  const buildHref = (routePath: string): string => {
    let href = routePath;
    
    // Replace dynamic segments with actual values from params
    if (Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        href = href.replace(`[${key}]`, value as string);
      });
    }
    
    return href;
  };

  // Build breadcrumb items recursively
  const buildBreadcrumbItems = (route: RouteConfig, visited = new Set<string>()): BreadcrumbItem[] => {
    if (visited.has(route.path)) {
      return []; // Prevent infinite loops
    }
    visited.add(route.path);

    const items: BreadcrumbItem[] = [];
    
    // Add parent items first
    if (route.parent) {
      const parentRoute = findMatchingRoute(route.parent);
      if (parentRoute) {
        const parentItems = buildBreadcrumbItems(parentRoute, visited);
        // Ensure parent items have proper hrefs
        parentItems.forEach(item => {
          if (!item.href && item.label !== route.label) {
            item.href = buildHref(route.parent!);
          }
        });
        items.push(...parentItems);
      }
    }

    // Add current item
    const currentItem: BreadcrumbItem = {
      label: route.label,
      icon: route.icon,
      isLoading: false // Will be set to true only for async operations
    };

    // Handle dynamic data fetching
    if (route.dataFetcher && Object.keys(params).length > 0) {
      const cacheKey = `${route.path}-${JSON.stringify(params)}`;
      
      if (dynamicData[cacheKey]) {
        currentItem.label = dynamicData[cacheKey].label;
        currentItem.href = dynamicData[cacheKey].href;
      } else {
        // Check if this is a synchronous dataFetcher (no makeAuthenticatedRequest parameter)
        const dataFetcherLength = route.dataFetcher.length;
        if (dataFetcherLength === 1) {
          // Synchronous dataFetcher - execute immediately
          try {
            console.log('🔍 Executing synchronous breadcrumb dataFetcher for:', route.path);
            const data = (route.dataFetcher as (params: any) => { label: string; href?: string })(params);
            currentItem.label = data.label;
            currentItem.href = data.href;
            // Cache the result
            setDynamicData(prev => ({
              ...prev,
              [cacheKey]: data
            }));
          } catch (error) {
            console.error('❌ Error in synchronous breadcrumb dataFetcher:', error);
          }
        } else if (!loading && accessToken) {
          // Asynchronous dataFetcher - use API call
          console.log('🔍 Making breadcrumb API call for:', route.path, 'with params:', params);
          setLoading(true);
          (route.dataFetcher as (params: any, makeAuthenticatedRequest: (url: string) => Promise<any>) => Promise<{ label: string; href?: string }>)(params, makeAuthenticatedRequest).then((data: { label: string; href?: string }) => {
            console.log('✅ Breadcrumb data fetched successfully:', data);
            setDynamicData(prev => ({
              ...prev,
              [cacheKey]: data
            }));
            setLoading(false);
          }).catch((error: any) => {
            console.error('❌ Error fetching breadcrumb data:', error);
            setLoading(false);
          });
        } else if (!accessToken) {
          // No access token, show loading state
          console.log('🔍 No access token available for breadcrumb API call');
          currentItem.isLoading = true;
        }
      }
    } else {
      // Static route - build href from the route path, replacing dynamic segments
      currentItem.href = buildHref(route.path);
    }

    items.push(currentItem);
    return items;
  };

  const breadcrumbItems = useMemo(() => {
    const route = findMatchingRoute(pathname);
    if (!route) {
      return [];
    }
    
    const items = buildBreadcrumbItems(route);
    return items;
  }, [pathname, params, dynamicData, loading, accessToken]);

  return {
    items: breadcrumbItems,
    isLoading: loading
  };
};

export default useBreadcrumb;
