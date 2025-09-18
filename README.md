# Loan Officer Landing Page Platform

A comprehensive platform for loan officers to create, customize, and manage professional landing pages with real-time customization, lead management, and rate integration.

## 🚀 Features

### Core Features
- **Real-time Customization**: Live preview with instant updates
- **Lead Management**: Complete lead tracking and management system
- **Rate Integration**: Live mortgage rates from Optimal Blue API
- **Multi-tenant Architecture**: Company and user management
- **Role-based Access Control**: Super Admin, Company Admin, Employee roles
- **Template System**: Multiple landing page templates
- **Analytics**: Comprehensive tracking and reporting
- **Background Jobs**: Automated versioning and storage

### Technical Features
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for authentication, database, storage, and real-time
- **Drizzle ORM** for database operations
- **Redis** for caching
- **Inngest** for background jobs
- **Zod** for validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Caching**: Upstash Redis
- **Background Jobs**: Inngest
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Validation**: Zod
- **Forms**: React Hook Form

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── companies/     # Company management
│   │   ├── leads/         # Lead management
│   │   ├── templates/     # Template management
│   │   ├── rates/         # Rate data
│   │   ├── page-settings/ # Page customization
│   │   └── user-company/  # User-company relationships
│   ├── dashboard/         # Main dashboard
│   ├── customizer/        # Page customizer
│   ├── admin/            # Admin panels
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── landing-page/     # Landing page components
│   ├── customizer/       # Customizer components
│   └── admin/            # Admin components
├── lib/                  # Utilities and configurations
│   ├── db/               # Database schema and connection
│   ├── supabase/         # Supabase client configuration
│   ├── redis/            # Redis configuration
│   ├── inngest/          # Background jobs
│   ├── contracts/        # API contracts with Zod
│   ├── theme/            # Design system
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Supabase account
- Upstash Redis account
- Inngest account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd loan-officer-platform
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Database Configuration
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   
   # Redis Configuration
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   
   # Inngest Configuration
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   yarn db:generate
   
   # Push schema to database
   yarn db:push
   
   # Or run migrations
   yarn db:migrate
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **companies**: Company information and settings
- **user_companies**: User-company relationships and roles
- **templates**: Landing page templates
- **page_settings**: Page customization data
- **page_settings_versions**: Version history
- **leads**: Lead management and tracking
- **rate_data**: Mortgage rate information
- **api_keys**: External API key management
- **analytics**: Usage analytics and tracking

## 🔧 Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking
- `yarn db:generate` - Generate database migrations
- `yarn db:migrate` - Run database migrations
- `yarn db:studio` - Open Drizzle Studio
- `yarn db:push` - Push schema to database

### Template Management Scripts

- `yarn tsx scripts/create-default-templates.ts` - Create default system templates
- `yarn tsx scripts/update-default-templates.ts` - Update existing templates to default
- `yarn tsx scripts/create-templates-for-existing-users.ts` - Create personal templates for existing users

## 🎨 Design System

The platform uses a comprehensive design system with:

- **Colors**: Primary (pink), Secondary (blue), Status colors
- **Typography**: Inter font family with multiple weights and sizes
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components
- **Theme**: Centralized theme configuration

## 🎨 Template System

The platform includes a comprehensive template system that allows for easy creation and management of landing page templates.

### Template Structure

Templates are stored in the `templates` table with the following structure:

```typescript
interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  preview_image?: string;
  is_active: boolean;
  is_premium: boolean;
  is_default: boolean;        // NEW: Marks system-wide default templates
  user_id?: string;           // NEW: Links to user for personal templates
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  content: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaSecondary: string;
    companyName: string;
    tagline: string;
  };
  layout: {
    alignment: string;
    spacing: number;
    borderRadius: number;
    padding: number;
  };
  advanced: {
    customCSS: string;
    accessibility: boolean;
  };
  classes: Record<string, any>;
  header_modifications: Record<string, any>;
  body_modifications: Record<string, any>;
  right_sidebar_modifications: Record<string, any>;
}
```

### Default Templates

The system includes two default templates that are available to all users:

#### Template 1 - Red Theme
- **Slug**: `template1`
- **Primary Color**: `#ec4899` (Pink)
- **Secondary Color**: `#3b82f6` (Blue)
- **Description**: Modern red-themed template with clean design

#### Template 2 - Purple Theme  
- **Slug**: `template2`
- **Primary Color**: `#9333ea` (Purple)
- **Secondary Color**: `#06b6d4` (Cyan)
- **Description**: Elegant purple-themed template with professional look

### Creating New Default Templates

To create new default templates for the system, follow these steps:

1. **Create a new script** in the `scripts/` directory (e.g., `create-new-template.ts`)

2. **Use the template structure** from `scripts/create-default-templates.ts` as a reference:

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createNewTemplate() {
  const newTemplate = {
    name: 'Your Template Name',
    slug: 'your-template-slug',
    description: 'Your template description',
    preview_image: null,
    is_active: true,
    is_premium: false,
    is_default: true,        // This makes it a system-wide default
    user_id: null,           // null for system templates
    colors: {
      primary: '#your-primary-color',
      secondary: '#your-secondary-color',
      background: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb'
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    content: {
      headline: 'Welcome to Our Service',
      subheadline: 'Get started with our amazing platform today.',
      ctaText: 'Get Started',
      ctaSecondary: 'Learn More',
      companyName: 'Your Company',
      tagline: 'Your trusted partner'
    },
    layout: {
      alignment: 'center',
      spacing: 16,
      borderRadius: 8,
      padding: 24
    },
    advanced: {
      customCSS: '',
      accessibility: true
    },
    classes: {},
    header_modifications: {},
    body_modifications: {},
    right_sidebar_modifications: {}
  };

  // Check if template already exists
  const { data: existing } = await supabase
    .from('templates')
    .select('slug')
    .eq('slug', 'your-template-slug')
    .eq('is_default', true)
    .is('user_id', null);

  if (existing && existing.length > 0) {
    console.log('⚠️ Template already exists, skipping...');
    return;
  }

  // Insert the new template
  const { data, error } = await supabase
    .from('templates')
    .insert(newTemplate)
    .select();

  if (error) {
    console.error('❌ Error creating template:', error);
  } else {
    console.log('✅ Created template:', data[0].id);
  }
}

createNewTemplate();
```

3. **Run the script**:
   ```bash
   yarn tsx scripts/create-new-template.ts
   ```

### Template Management Commands

- **Create default templates**: `yarn tsx scripts/create-default-templates.ts`
- **Update existing templates**: `yarn tsx scripts/update-default-templates.ts`
- **Create personal templates for users**: `yarn tsx scripts/create-templates-for-existing-users.ts`

### Template Customization

Users can customize templates through the customizer interface, which allows:
- Real-time color changes
- Typography adjustments
- Content modifications
- Layout customizations
- Advanced CSS overrides

### Database Schema Updates

The template system has evolved through several database migrations:

- **0003_adorable_old_lace.sql**: Added JSONB columns for colors, typography, content, layout, advanced, and classes
- **0004_conscious_zeigeist.sql**: Added `is_default` and `user_id` columns for template ownership
- **0006_romantic_venom.sql**: Added modification tracking columns for header, body, and right sidebar

### Best Practices

1. **Always check for existing templates** before creating new ones
2. **Use descriptive slugs** that are URL-friendly
3. **Provide comprehensive color palettes** with proper contrast ratios
4. **Include accessibility features** in the advanced settings
5. **Test templates** across different screen sizes
6. **Document template features** in the description field

## 🔐 Authentication & Authorization

- **Supabase Auth** for user authentication
- **Role-based access control** with three levels:
  - **Super Admin**: Full platform access
  - **Company Admin**: Company management
  - **Employee**: Personal landing page management
- **Middleware protection** for routes and API endpoints

## 📊 Features Overview

### Landing Page Customizer
- Three-panel interface (Sections, Preview, Settings)
- Real-time preview updates
- Drag-and-drop functionality
- Template system
- Version control

### Lead Management
- Lead capture from landing pages
- Lead tracking and status management
- Custom fields and tags
- Export functionality
- Email notifications

### Rate Integration
- Optimal Blue API integration
- Live rate updates
- Rate comparison tools
- Rate lock functionality

### Analytics
- Page view tracking
- Lead conversion metrics
- User engagement analytics
- Performance monitoring

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push

### Manual Deployment

1. **Build the application**
   ```bash
   yarn build
   ```

2. **Start the production server**
   ```bash
   yarn start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@loan-officer-platform.com or create an issue in the repository.

## 🔄 Roadmap

- [ ] Mobile app
- [ ] Advanced analytics
- [ ] A/B testing
- [ ] White-label solution
- [ ] API documentation
- [ ] Webhook system
- [ ] Advanced integrations

---

Built with ❤️ for loan officers everywhere.