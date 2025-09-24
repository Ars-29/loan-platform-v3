'use client';

import React from 'react';
import {
  Home,
  Info,
  Phone,
  Menu,
  X,
  FileText,
  Target,
  TrendingUp,
  Calculator,
  User,
  ArrowRight,
  MessageCircle,
  RefreshCw,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Search,
  Star,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Asterisk,
  Building2,
  ArrowUp,
  Calendar,
  Shield,
  Clock,
  Download,
  Share,
  Play,
  Book,
  Heart,
  Map,
  ExternalLink,
  Monitor,
  DollarSign,
  MessageSquare,
  Filter,
} from 'lucide-react';

// Centralized icon registry for the entire app
export const icons = {
  // Navigation
  home: Home,
  about: Info,
  contact: Phone,
  menu: Menu,
  close: X,

  // Loan Officer / Product
  apply: FileText,
  custom: Target,
  rates: TrendingUp,
  calculators: Calculator,
  profile: User,

  // Actions
  applyNow: ArrowRight,
  contactOfficer: MessageCircle,
  homePurchase: Home,
  homeRefinance: RefreshCw,

  // Social
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,

  // Reviews / Misc
  google: Search,
  zillow: Home,
  star: Star,

  // Contact
  phone: Phone,
  email: Mail,
  location: MapPin,

  // UI
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  check: Check,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: X,

  // Status
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,

  // Brand
  asterisk: Asterisk,
  logo: Building2,

  // Additional
  refresh: RefreshCw,
  document: FileText,
  arrowRight: ArrowRight,
  trendingUp: TrendingUp,
  arrowUp: ArrowUp,
  calendar: Calendar,
  shield: Shield,
  clock: Clock,
  target: Target,
  
  // Extended icons
  download: Download,
  share: Share,
  play: Play,
  book: Book,
  heart: Heart,
  map: Map,
  externalLink: ExternalLink,
  monitor: Monitor,
  fileText: FileText,
  mapPin: MapPin,
  calculator: Calculator,
  x: X,
  search: Search,
  mail: Mail,
  
  // New icons for lead details
  user: User,
  dollarSign: DollarSign,
  messageSquare: MessageSquare,
  filter: Filter,
} as const;

interface IconProps {
  name: keyof typeof icons;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({ 
  name, 
  size = 24, 
  className = '', 
  color,
  strokeWidth = 2 
}: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    console.warn(`Icon "${String(name)}" not found in ui/Icon registry`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}

export const IconNames = icons;
