'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';
import { dashboard } from '@/theme/theme';

interface QuickAction {
  label: string;
  icon: keyof typeof icons;
  href: string;
  minWidth?: number;
}

type QuickActionsWrapper = 'spotlight' | 'card';

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  wrapper?: QuickActionsWrapper;
  className?: string;
  style?: React.CSSProperties;
  gap?: number;
}

export function QuickActions({
  title = 'Quick Actions',
  actions,
  wrapper = 'spotlight',
  className,
  style,
  gap = wrapper === 'card' ? 16 : 12,
}: QuickActionsProps) {
  const router = useRouter();
  const defaultMinWidth = 100;

  const content = (
    <>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#005b7c',
          marginBottom: '16px',
        }}
      >
        {title}
      </h3>
      <div style={{ display: 'flex', gap: `${gap}px`, flexWrap: 'wrap' }}>
        {actions.map(({ label, icon, href, minWidth }) => (
          <Button
            key={href}
            variant="secondary"
            size="md"
            onClick={() => router.push(href)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: `${minWidth ?? defaultMinWidth}px`,
              padding: '8px 16px',
              backgroundColor: 'white',
              border: '1px solid rgba(1, 188, 198, 0.3)',
              color: '#008eab',
              fontWeight: '500',
              borderRadius: '16px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(1, 188, 198, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(1, 188, 198, 0.5)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 188, 198, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'rgba(1, 188, 198, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {React.createElement(icons[icon], {
              size: 16,
              style: { color: '#008eab' },
            })}
            {label}
          </Button>
        ))}
      </div>
    </>
  );

  if (wrapper === 'card') {
    return (
      <div style={{ ...dashboard.card, ...style }} className={className}>
        {content}
      </div>
    );
  }

  return (
    <SpotlightCard variant="default" className={className ?? 'p-6'} style={style}>
      {content}
    </SpotlightCard>
  );
}

