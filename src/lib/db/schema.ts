import { pgTable, uuid, text, jsonb, timestamp, index, boolean, integer, decimal } from 'drizzle-orm/pg-core';

// Users table (managed by Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatar: text('avatar'),
  role: text('role').notNull().default('employee'), // super_admin, company_admin, employee
  isActive: boolean('is_active').default(true),
  deactivated: boolean('deactivated').default(false), // For deactivation control
  inviteStatus: text('invite_status').default('pending'), // pending, sent, accepted, expired
  inviteSentAt: timestamp('invite_sent_at'), // When invite was sent
  inviteExpiresAt: timestamp('invite_expires_at'), // When invite expires (24 hours)
  inviteToken: text('invite_token'), // Supabase invite token
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  website: text('website'),
  licenseNumber: text('license_number'),
  address: jsonb('address'), // { street, city, state, zip, country }
  phone: text('phone'),
  email: text('email'),
  adminEmail: text('admin_email'), // Email for company admin
  adminEmailVerified: boolean('admin_email_verified').default(false),
  adminUserId: uuid('admin_user_id'), // Reference to admin user once created
  inviteStatus: text('invite_status').default('pending'), // pending, sent, accepted, expired
  inviteSentAt: timestamp('invite_sent_at'), // When invite was sent
  inviteExpiresAt: timestamp('invite_expires_at'), // When invite expires (24 hours)
  inviteToken: text('invite_token'), // Supabase invite token
  subscription: text('subscription').default('basic'), // basic, pro, enterprise
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  isActive: boolean('is_active').default(true),
  deactivated: boolean('deactivated').default(false), // For deactivation control
  settings: jsonb('settings').default('{}'), // Company-wide settings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('company_slug_idx').on(table.slug),
  isActiveIdx: index('company_active_idx').on(table.isActive),
  adminEmailIdx: index('company_admin_email_idx').on(table.adminEmail),
}));

// User-Company relationships
export const userCompanies = pgTable('user_companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('employee'), // owner, admin, employee
  permissions: jsonb('permissions').default('[]'), // Array of specific permissions
  isActive: boolean('is_active').default(true),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  userIdx: index('user_company_user_idx').on(table.userId),
  companyIdx: index('user_company_company_idx').on(table.companyId),
  userCompanyIdx: index('user_company_unique_idx').on(table.userId, table.companyId),
}));

// Templates table - Updated to match theme.ts structure with user ownership
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  previewImage: text('preview_image'),
  isActive: boolean('is_active').default(true),
  isPremium: boolean('is_premium').default(false),
  isDefault: boolean('is_default').default(false), // true for default templates, false for user customizations
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // null for default templates, user ID for customizations
  
  // Template structure matching theme.ts
  colors: jsonb('colors').notNull().default('{}'), // { primary, secondary, background, text, textSecondary, border }
  typography: jsonb('typography').notNull().default('{}'), // { fontFamily, fontSize, fontWeight }
  content: jsonb('content').notNull().default('{}'), // { headline, subheadline, ctaText, ctaSecondary, companyName, tagline }
  layout: jsonb('layout').notNull().default('{}'), // { alignment, spacing, borderRadius, padding }
  advanced: jsonb('advanced').notNull().default('{}'), // { customCSS, accessibility }
  classes: jsonb('classes').notNull().default('{}'), // Generated CSS classes
  
  // New customization sections
  headerModifications: jsonb('header_modifications').default('{}'), // { officerName, avatar, phone, email, applyNowLink, personalInfo }
  bodyModifications: jsonb('body_modifications').default('{}'), // { activeTab, enabledTabs, tabOrder, tabSettings }
  rightSidebarModifications: jsonb('right_sidebar_modifications').default('{}'), // { socialMedia, companyName, logo, contactInfo, reviews }
  
  // Public profile template selection
  isSelected: boolean('is_selected').default(false), // true if this template is selected for public profile
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('template_slug_idx').on(table.slug),
  isActiveIdx: index('template_active_idx').on(table.isActive),
  isDefaultIdx: index('template_default_idx').on(table.isDefault),
  userIdIdx: index('template_user_idx').on(table.userId),
  userSlugIdx: index('template_user_slug_idx').on(table.userId, table.slug),
}));

// Page Settings table
export const pageSettings = pgTable('page_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').notNull().references(() => templates.id),
  template: text('template').notNull(), // Template slug for quick access
  settings: jsonb('settings').notNull().default('{}'),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyTemplateIdx: index('page_settings_company_template_idx').on(table.companyId, table.template),
  officerIdx: index('page_settings_officer_idx').on(table.officerId),
  templateIdx: index('page_settings_template_idx').on(table.templateId),
  publishedIdx: index('page_settings_published_idx').on(table.isPublished),
}));

// Page Settings Versions table
export const pageSettingsVersions = pgTable('page_settings_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  pageSettingsId: uuid('page_settings_id').notNull().references(() => pageSettings.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  template: text('template').notNull(),
  settings: jsonb('settings').notNull(),
  version: text('version').notNull(),
  storagePath: text('storage_path'),
  isAutoGenerated: boolean('is_auto_generated').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  pageSettingsIdx: index('page_settings_version_page_idx').on(table.pageSettingsId),
  companyTemplateIdx: index('page_settings_version_company_template_idx').on(table.companyId, table.template),
  versionIdx: index('page_settings_version_idx').on(table.version),
}));

// Leads table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  source: text('source').notNull(), // landing_page, rate_table, referral, etc.
  status: text('status').default('new'), // new, contacted, qualified, converted, lost
  priority: text('priority').default('medium'), // low, medium, high, urgent
  loanDetails: jsonb('loan_details'), // Selected loan information
  propertyDetails: jsonb('property_details'), // Property information
  creditScore: integer('credit_score'),
  loanAmount: decimal('loan_amount', { precision: 15, scale: 2 }),
  downPayment: decimal('down_payment', { precision: 15, scale: 2 }),
  notes: text('notes'),
  tags: jsonb('tags').default('[]'), // Array of tags
  customFields: jsonb('custom_fields').default('{}'), // Custom form fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyIdx: index('leads_company_idx').on(table.companyId),
  officerIdx: index('leads_officer_idx').on(table.officerId),
  statusIdx: index('leads_status_idx').on(table.status),
  emailIdx: index('leads_email_idx').on(table.email),
  createdAtIdx: index('leads_created_at_idx').on(table.createdAt),
}));

// Rate Data table (from Optimal Blue API)
export const rateData = pgTable('rate_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  loanType: text('loan_type').notNull(), // purchase, refinance, cash_out
  loanTerm: integer('loan_term').notNull(), // 15, 20, 30, etc.
  rate: decimal('rate', { precision: 6, scale: 4 }).notNull(),
  apr: decimal('apr', { precision: 6, scale: 4 }).notNull(),
  points: decimal('points', { precision: 6, scale: 2 }).default('0'),
  fees: decimal('fees', { precision: 10, scale: 2 }).default('0'),
  monthlyPayment: decimal('monthly_payment', { precision: 12, scale: 2 }),
  loanAmount: decimal('loan_amount', { precision: 15, scale: 2 }),
  creditScore: integer('credit_score'),
  ltv: decimal('ltv', { precision: 5, scale: 2 }), // Loan-to-Value ratio
  dti: decimal('dti', { precision: 5, scale: 2 }), // Debt-to-Income ratio
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  companyIdx: index('rate_data_company_idx').on(table.companyId),
  loanTypeIdx: index('rate_data_loan_type_idx').on(table.loanType),
  isActiveIdx: index('rate_data_active_idx').on(table.isActive),
  expiresAtIdx: index('rate_data_expires_idx').on(table.expiresAt),
}));

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  service: text('service').notNull(), // optimal_blue, zillow, etc.
  keyValue: text('key_value').notNull(),
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  companyIdx: index('api_keys_company_idx').on(table.companyId),
  serviceIdx: index('api_keys_service_idx').on(table.service),
  isActiveIdx: index('api_keys_active_idx').on(table.isActive),
}));

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  officerId: uuid('officer_id').references(() => users.id, { onDelete: 'cascade' }),
  event: text('event').notNull(), // page_view, rate_lookup, lead_submit, etc.
  data: jsonb('data').default('{}'), // Event-specific data
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  companyIdx: index('analytics_company_idx').on(table.companyId),
  officerIdx: index('analytics_officer_idx').on(table.officerId),
  eventIdx: index('analytics_event_idx').on(table.event),
  createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));

// Loan Officer Public Links table
export const loanOfficerPublicLinks = pgTable('loan_officer_public_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  publicSlug: text('public_slug').notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  maxUses: integer('max_uses'),
  currentUses: integer('current_uses').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_link_idx').on(table.userId),
  companyIdx: index('company_link_idx').on(table.companyId),
  publicSlugIdx: index('public_slug_idx').on(table.publicSlug),
  isActiveIdx: index('public_link_active_idx').on(table.isActive),
}));

// Public Link Usage table for analytics
export const publicLinkUsage = pgTable('public_link_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  linkId: uuid('link_id').notNull().references(() => loanOfficerPublicLinks.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  accessedAt: timestamp('accessed_at').defaultNow().notNull(),
}, (table) => ({
  linkIdx: index('link_usage_idx').on(table.linkId),
  accessedAtIdx: index('access_time_idx').on(table.accessedAt),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type UserCompany = typeof userCompanies.$inferSelect;
export type NewUserCompany = typeof userCompanies.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type PageSettings = typeof pageSettings.$inferSelect;
export type NewPageSettings = typeof pageSettings.$inferInsert;
export type PageSettingsVersion = typeof pageSettingsVersions.$inferSelect;
export type NewPageSettingsVersion = typeof pageSettingsVersions.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type RateData = typeof rateData.$inferSelect;
export type NewRateData = typeof rateData.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
export type LoanOfficerPublicLink = typeof loanOfficerPublicLinks.$inferSelect;
export type NewLoanOfficerPublicLink = typeof loanOfficerPublicLinks.$inferInsert;
export type PublicLinkUsage = typeof publicLinkUsage.$inferSelect;
export type NewPublicLinkUsage = typeof publicLinkUsage.$inferInsert;