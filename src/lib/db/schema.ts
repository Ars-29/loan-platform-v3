import { pgTable, uuid, text, jsonb, timestamp, index, boolean, integer, decimal } from 'drizzle-orm/pg-core';

// Users table (managed by Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  nmlsNumber: text('nmls_number'), // NMLS# for loan officers
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
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  nmlsNumberIdx: index('users_nmls_number_idx').on(table.nmlsNumber),
}));

// Companies table - Enhanced with comprehensive company profile fields
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  
  // Legacy fields (kept for backward compatibility)
  logo: text('logo'),
  website: text('website'),
  licenseNumber: text('license_number'),
  address: jsonb('address'), // { street, city, state, zip, country }
  phone: text('phone'),
  email: text('email'),
  
  // Admin fields
  adminEmail: text('admin_email'), // Email for company admin
  adminEmailVerified: boolean('admin_email_verified').default(false),
  adminUserId: uuid('admin_user_id'), // Reference to admin user once created
  
  // Invite fields
  inviteStatus: text('invite_status').default('pending'), // pending, sent, accepted, expired
  inviteSentAt: timestamp('invite_sent_at'), // When invite was sent
  inviteExpiresAt: timestamp('invite_expires_at'), // When invite expires (24 hours)
  inviteToken: text('invite_token'), // Supabase invite token
  
  // Subscription fields
  subscription: text('subscription').default('basic'), // basic, pro, enterprise
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  
  // Status fields
  isActive: boolean('is_active').default(true),
  deactivated: boolean('deactivated').default(false), // For deactivation control
  
  // Enhanced company profile fields (non-redundant)
  companyTagline: text('company_tagline'),
  companyDescription: text('company_description'),
  companyNmlsNumber: text('company_nmls_number'),
  companyEstablishedYear: integer('company_established_year'),
  companyTeamSize: text('company_team_size'),
  companySpecialties: jsonb('company_specialties').default('[]'),
  companyAwards: jsonb('company_awards').default('[]'),
  companyTestimonials: jsonb('company_testimonials').default('[]'),
  companySocialMedia: jsonb('company_social_media').default('{}'),
  companyBranding: jsonb('company_branding').default('{}'),
  companyContactInfo: jsonb('company_contact_info').default('{}'),
  companyBusinessHours: jsonb('company_business_hours').default('{}'),
  companyServiceAreas: jsonb('company_service_areas').default('[]'),
  companyLanguages: jsonb('company_languages').default('[]'),
  companyCertifications: jsonb('company_certifications').default('[]'),
  companyInsuranceInfo: jsonb('company_insurance_info').default('{}'),
  companyFinancialInfo: jsonb('company_financial_info').default('{}'),
  companyMarketingInfo: jsonb('company_marketing_info').default('{}'),
  companyPrivacySettings: jsonb('company_privacy_settings').default('{}'),
  companySeoSettings: jsonb('company_seo_settings').default('{}'),
  companyAnalyticsSettings: jsonb('company_analytics_settings').default('{}'),
  companyIntegrationSettings: jsonb('company_integration_settings').default('{}'),
  companyNotificationSettings: jsonb('company_notification_settings').default('{}'),
  companyBackupSettings: jsonb('company_backup_settings').default('{}'),
  companySecuritySettings: jsonb('company_security_settings').default('{}'),
  companyComplianceSettings: jsonb('company_compliance_settings').default('{}'),
  companyCustomFields: jsonb('company_custom_fields').default('{}'),
  companyMetadata: jsonb('company_metadata').default('{}'),
  companyVersion: integer('company_version').default(1),
  companyLastUpdatedBy: uuid('company_last_updated_by'),
  companyApprovalStatus: text('company_approval_status').default('pending'),
  companyApprovalNotes: text('company_approval_notes'),
  companyApprovalDate: timestamp('company_approval_date'),
  companyApprovalBy: uuid('company_approval_by'),
  
  // Legacy settings (kept for backward compatibility)
  settings: jsonb('settings').default('{}'), // Company-wide settings
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('company_slug_idx').on(table.slug),
  isActiveIdx: index('company_active_idx').on(table.isActive),
  adminEmailIdx: index('company_admin_email_idx').on(table.adminEmail),
  nmlsNumberIdx: index('companies_nmls_number_idx').on(table.companyNmlsNumber),
  licenseNumberIdx: index('companies_license_number_idx').on(table.licenseNumber),
  approvalStatusIdx: index('companies_approval_status_idx').on(table.companyApprovalStatus),
  versionIdx: index('companies_version_idx').on(table.companyVersion),
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
  
  // Layout configuration for different template layouts
  layoutConfig: jsonb('layout_config').default('{}'), // { headerLayout, mainContentLayout }
  
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
  
  // Analytics columns
  conversionStage: text('conversion_stage').default('lead'), // lead, application, approval, closing
  conversionDate: timestamp('conversion_date'),
  applicationDate: timestamp('application_date'),
  approvalDate: timestamp('approval_date'),
  closingDate: timestamp('closing_date'),
  loanAmountClosed: decimal('loan_amount_closed', { precision: 15, scale: 2 }),
  commissionEarned: decimal('commission_earned', { precision: 10, scale: 2 }),
  responseTimeHours: integer('response_time_hours'), // hours to first response
  lastContactDate: timestamp('last_contact_date'),
  contactCount: integer('contact_count').default(0),
  leadQualityScore: integer('lead_quality_score'), // 1-10 rating
  geographicLocation: text('geographic_location'), // city, state for mapping
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  companyIdx: index('leads_company_idx').on(table.companyId),
  officerIdx: index('leads_officer_idx').on(table.officerId),
  statusIdx: index('leads_status_idx').on(table.status),
  emailIdx: index('leads_email_idx').on(table.email),
  createdAtIdx: index('leads_created_at_idx').on(table.createdAt),
  // Analytics indexes
  conversionStageIdx: index('leads_conversion_stage_idx').on(table.conversionStage),
  conversionDateIdx: index('leads_conversion_date_idx').on(table.conversionDate),
  closingDateIdx: index('leads_closing_date_idx').on(table.closingDate),
  responseTimeIdx: index('leads_response_time_idx').on(table.responseTimeHours),
  qualityScoreIdx: index('leads_quality_score_idx').on(table.leadQualityScore),
  locationIdx: index('leads_location_idx').on(table.geographicLocation),
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

// Officer Content FAQs table
export const officerContentFaqs = pgTable('officer_content_faqs', {
  id: uuid('id').primaryKey().defaultRandom(),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  officerIdx: index('officer_content_faqs_officer_idx').on(table.officerId),
  categoryIdx: index('officer_content_faqs_category_idx').on(table.category),
}));

// Officer Content Videos table
export const officerContentVideos = pgTable('officer_content_videos', {
  id: uuid('id').primaryKey().defaultRandom(),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  videoUrl: text('video_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  duration: text('duration'), // e.g., "8:45"
  cloudinaryPublicId: text('cloudinary_public_id'), // for deletion
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  officerIdx: index('officer_content_videos_officer_idx').on(table.officerId),
  categoryIdx: index('officer_content_videos_category_idx').on(table.category),
}));

// Officer Content Guides table
export const officerContentGuides = pgTable('officer_content_guides', {
  id: uuid('id').primaryKey().defaultRandom(),
  officerId: uuid('officer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  fileUrl: text('file_url').notNull(),
  funnelUrl: text('funnel_url'), // Optional funnel URL for external redirects
  fileName: text('file_name').notNull(),
  fileType: text('file_type'), // MIME type
  cloudinaryPublicId: text('cloudinary_public_id'), // for deletion
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  officerIdx: index('officer_content_guides_officer_idx').on(table.officerId),
  categoryIdx: index('officer_content_guides_category_idx').on(table.category),
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
export type OfficerContentFaq = typeof officerContentFaqs.$inferSelect;
export type NewOfficerContentFaq = typeof officerContentFaqs.$inferInsert;
export type OfficerContentVideo = typeof officerContentVideos.$inferSelect;
export type NewOfficerContentVideo = typeof officerContentVideos.$inferInsert;
export type OfficerContentGuide = typeof officerContentGuides.$inferSelect;
export type NewOfficerContentGuide = typeof officerContentGuides.$inferInsert;