'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { icons } from '@/components/ui/Icon';
import SpotlightCard from '@/components/ui/SpotlightCard';

function SkeletonLine({ className }: { className: string }) {
  // Softer/slower pulse to reduce the "pulsating" feel
  return (
    <div
      className={`bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite] ${className}`}
    />
  );
}

export default function TodaysRatesSkeleton() {
  return (
    <DashboardLayout
      showBreadcrumb={true}
      breadcrumbVariant="default"
      breadcrumbSize="md"
      customBreadcrumbItems={[
        {
          label: 'Dashboard',
          href: '/officers/dashboard',
          icon: 'home' as keyof typeof icons,
        },
        {
          label: "Today's Rates",
          href: '/officers/todays-rates',
          icon: 'trendingUp' as keyof typeof icons,
          isLoading: true,
        },
      ]}
    >
      <div className="flex flex-col gap-6">
        <div>
          <SkeletonLine className="h-8 w-80 mb-3" />
          <SkeletonLine className="h-4 w-[520px] max-w-full" />
        </div>

        {/* Tabs Skeleton */}
        <div className="inline-flex p-1 mb-4 bg-gray-100 rounded-lg w-fit">
          <div className="px-4 py-2">
            <SkeletonLine className="h-4 w-24" />
          </div>
          <div className="px-4 py-2">
            <SkeletonLine className="h-4 w-28" />
          </div>
        </div>

        {/* Search Form Skeleton */}
        <SpotlightCard variant="default" className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <SkeletonLine className="h-3 w-28" />
                <SkeletonLine className="h-10 w-full" />
              </div>
            </div>

            <div className="flex justify-end">
              <SkeletonLine className="h-10 w-40" />
            </div>
          </div>
        </SpotlightCard>

        {/* Results Skeleton */}
        <div className="space-y-4">
          <SkeletonLine className="h-6 w-40" />
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <SpotlightCard key={index} variant="default" className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <SkeletonLine className="h-3 w-20 mb-2" />
                      <SkeletonLine className="h-5 w-32" />
                    </div>
                    <div>
                      <SkeletonLine className="h-3 w-20 mb-2" />
                      <SkeletonLine className="h-5 w-24" />
                    </div>
                    <div>
                      <SkeletonLine className="h-3 w-16 mb-2" />
                      <SkeletonLine className="h-5 w-24" />
                    </div>
                    <div>
                      <SkeletonLine className="h-3 w-24 mb-2" />
                      <SkeletonLine className="h-5 w-28" />
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    <SkeletonLine className="h-10 w-32" />
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

