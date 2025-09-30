import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, gte, lte, sql, desc, asc, count, sum, avg, inArray } from 'drizzle-orm';
import { leads, users, companies, userCompanies } from '@/lib/db/schema';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient);

// Types for analytics data
export interface LeadInsightsData {
  totalLeads: number;
  convertedLeads: number;
  applications: number;
  approvals: number;
  closings: number;
  conversionRate: number;
  avgResponseTime: number;
  totalLoanVolume: number;
  totalCommission: number;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  companyId: string;
  companyName: string;
  totalLeads: number;
  closedDeals: number;
  conversionRate: number;
  avgResponseTime: number;
  totalLoanVolume: number;
  totalCommission: number;
  lastActivity: Date | null;
}

export interface LeadVolumeTrend {
  date: string;
  totalLeads: number;
  convertedLeads: number;
  applications: number;
  approvals: number;
  closings: number;
}

export interface LeadSourceData {
  source: string;
  count: number;
  conversionRate: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

// Date range filter type
export interface DateRange {
  start: Date;
  end: Date;
}

// Filter options
export interface AnalyticsFilters {
  dateRange?: DateRange;
  officerIds?: string[];
  companyIds?: string[];
  sources?: string[];
  statuses?: string[];
  conversionStages?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Get leads insights for a specific company
 */
export async function getCompanyLeadsInsights(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<LeadInsightsData> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  if (filters.officerIds && filters.officerIds.length > 0) {
    whereConditions.push(inArray(leads.officerId, filters.officerIds));
  }

  if (filters.sources && filters.sources.length > 0) {
    whereConditions.push(inArray(leads.source, filters.sources));
  }

  const result = await db
    .select({
      totalLeads: count(),
      convertedLeads: count(sql`CASE WHEN ${leads.status} = 'converted' THEN 1 END`),
      applications: count(sql`CASE WHEN ${leads.conversionStage} = 'application' OR ${leads.conversionStage} = 'approval' OR ${leads.conversionStage} = 'closing' THEN 1 END`),
      approvals: count(sql`CASE WHEN ${leads.conversionStage} = 'approval' OR ${leads.conversionStage} = 'closing' THEN 1 END`),
      closings: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
      avgResponseTime: avg(leads.responseTimeHours),
      totalLoanVolume: sum(leads.loanAmountClosed),
      totalCommission: sum(leads.commissionEarned),
    })
    .from(leads)
    .where(and(...whereConditions));

  const data = result[0];
  const conversionRate = data.totalLeads > 0 
    ? (Number(data.closings) / Number(data.totalLeads)) * 100 
    : 0;

  return {
    totalLeads: data.totalLeads || 0,
    convertedLeads: data.convertedLeads || 0,
    applications: data.applications || 0,
    approvals: data.approvals || 0,
    closings: data.closings || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgResponseTime: Math.round((Number(data.avgResponseTime) || 0) * 100) / 100,
    totalLoanVolume: parseFloat(data.totalLoanVolume || '0'),
    totalCommission: parseFloat(data.totalCommission || '0'),
  };
}

/**
 * Get officer performance data for a company
 */
export async function getCompanyOfficerPerformance(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<OfficerPerformance[]> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  const result = await db
    .select({
      officerId: leads.officerId,
      officerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      companyId: leads.companyId,
      companyName: companies.name,
      totalLeads: count(),
      closedDeals: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
      avgResponseTime: avg(leads.responseTimeHours),
      totalLoanVolume: sum(leads.loanAmountClosed),
      totalCommission: sum(leads.commissionEarned),
      lastActivity: sql<Date>`MAX(${leads.lastContactDate})`,
    })
    .from(leads)
    .innerJoin(users, eq(leads.officerId, users.id))
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .where(and(...whereConditions))
    .groupBy(leads.officerId, users.firstName, users.lastName, leads.companyId, companies.name)
    .orderBy(desc(count()));

  return result.map(row => {
    const conversionRate = row.totalLeads > 0 
      ? (Number(row.closedDeals) / Number(row.totalLeads)) * 100 
      : 0;

    return {
      officerId: row.officerId,
      officerName: row.officerName,
      companyId: row.companyId,
      companyName: row.companyName,
      totalLeads: row.totalLeads,
      closedDeals: row.closedDeals,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgResponseTime: Math.round((Number(row.avgResponseTime) || 0) * 100) / 100,
      totalLoanVolume: parseFloat(row.totalLoanVolume || '0'),
      totalCommission: parseFloat(row.totalCommission || '0'),
      lastActivity: row.lastActivity,
    };
  });
}

/**
 * Get lead volume trends over time
 */
export async function getLeadVolumeTrends(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<LeadVolumeTrend[]> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  if (filters.officerIds && filters.officerIds.length > 0) {
    whereConditions.push(inArray(leads.officerId, filters.officerIds));
  }

  const result = await db
    .select({
      date: sql<string>`DATE(${leads.createdAt})`,
      totalLeads: count(),
      convertedLeads: count(sql`CASE WHEN ${leads.status} = 'converted' THEN 1 END`),
      applications: count(sql`CASE WHEN ${leads.conversionStage} = 'application' THEN 1 END`),
      approvals: count(sql`CASE WHEN ${leads.conversionStage} = 'approval' THEN 1 END`),
      closings: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
    })
    .from(leads)
    .where(and(...whereConditions))
    .groupBy(sql`DATE(${leads.createdAt})`)
    .orderBy(asc(sql`DATE(${leads.createdAt})`));

  return result.map(row => ({
    date: row.date,
    totalLeads: row.totalLeads,
    convertedLeads: row.convertedLeads,
    applications: row.applications,
    approvals: row.approvals,
    closings: row.closings,
  }));
}

/**
 * Get lead source distribution
 */
export async function getLeadSourceData(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<LeadSourceData[]> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  const result = await db
    .select({
      source: leads.source,
      count: count(),
      closings: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
    })
    .from(leads)
    .where(and(...whereConditions))
    .groupBy(leads.source)
    .orderBy(desc(count()));

  return result.map(row => {
    const conversionRate = row.count > 0 
      ? (Number(row.closings) / Number(row.count)) * 100 
      : 0;

    return {
      source: row.source,
      count: row.count,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  });
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnelData(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<ConversionFunnelData[]> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  const result = await db
    .select({
      stage: leads.conversionStage,
      count: count(),
    })
    .from(leads)
    .where(and(...whereConditions))
    .groupBy(leads.conversionStage);

  const totalLeads = result.reduce((sum, row) => sum + row.count, 0);

  return result.map(row => ({
    stage: row.stage || 'unknown',
    count: row.count,
    percentage: totalLeads > 0 ? Math.round((row.count / totalLeads) * 100 * 100) / 100 : 0,
  }));
}

/**
 * Get all companies data (Super Admin only)
 */
export async function getAllCompaniesData(
  filters: AnalyticsFilters = {}
): Promise<OfficerPerformance[]> {
  const whereConditions = [];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  if (filters.companyIds && filters.companyIds.length > 0) {
    whereConditions.push(inArray(leads.companyId, filters.companyIds));
  }

  const baseQuery = db
    .select({
      officerId: leads.officerId,
      officerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      companyId: leads.companyId,
      companyName: companies.name,
      totalLeads: count(),
      closedDeals: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
      avgResponseTime: avg(leads.responseTimeHours),
      totalLoanVolume: sum(leads.loanAmountClosed),
      totalCommission: sum(leads.commissionEarned),
      lastActivity: sql<Date>`MAX(${leads.lastContactDate})`,
    })
    .from(leads)
    .innerJoin(users, eq(leads.officerId, users.id))
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .groupBy(leads.officerId, users.firstName, users.lastName, leads.companyId, companies.name)
    .orderBy(desc(count()));

  // Add pagination if specified
  let result;
  if (filters.limit && filters.offset) {
    result = await baseQuery.limit(filters.limit).offset(filters.offset);
  } else if (filters.limit) {
    result = await baseQuery.limit(filters.limit);
  } else if (filters.offset) {
    result = await baseQuery.offset(filters.offset);
  } else {
    result = await baseQuery;
  }

  return result.map(row => {
    const conversionRate = row.totalLeads > 0 
      ? (Number(row.closedDeals) / Number(row.totalLeads)) * 100 
      : 0;

    return {
      officerId: row.officerId,
      officerName: row.officerName,
      companyId: row.companyId,
      companyName: row.companyName,
      totalLeads: row.totalLeads,
      closedDeals: row.closedDeals,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgResponseTime: Math.round((Number(row.avgResponseTime) || 0) * 100) / 100,
      totalLoanVolume: parseFloat(row.totalLoanVolume || '0'),
      totalCommission: parseFloat(row.totalCommission || '0'),
      lastActivity: row.lastActivity,
    };
  });
}

/**
 * Get detailed leads data for tables
 */
export async function getLeadsData(
  companyId: string,
  filters: AnalyticsFilters = {},
  limit: number = 50,
  offset: number = 0
) {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  if (filters.officerIds && filters.officerIds.length > 0) {
    whereConditions.push(inArray(leads.officerId, filters.officerIds));
  }

  if (filters.sources && filters.sources.length > 0) {
    whereConditions.push(inArray(leads.source, filters.sources));
  }

  if (filters.statuses && filters.statuses.length > 0) {
    whereConditions.push(inArray(leads.status, filters.statuses));
  }

  if (filters.conversionStages && filters.conversionStages.length > 0) {
    whereConditions.push(inArray(leads.conversionStage, filters.conversionStages));
  }

  const result = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
      source: leads.source,
      status: leads.status,
      conversionStage: leads.conversionStage,
      priority: leads.priority,
      creditScore: leads.creditScore,
      loanAmount: leads.loanAmount,
      loanAmountClosed: leads.loanAmountClosed,
      commissionEarned: leads.commissionEarned,
      responseTimeHours: leads.responseTimeHours,
      leadQualityScore: leads.leadQualityScore,
      geographicLocation: leads.geographicLocation,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      officerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      companyName: companies.name,
    })
    .from(leads)
    .innerJoin(users, eq(leads.officerId, users.id))
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .where(and(...whereConditions))
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Get total count for pagination
 */
export async function getLeadsCount(
  companyId: string,
  filters: AnalyticsFilters = {}
): Promise<number> {
  const whereConditions = [
    eq(leads.companyId, companyId)
  ];

  if (filters.dateRange) {
    whereConditions.push(
      gte(leads.createdAt, filters.dateRange.start),
      lte(leads.createdAt, filters.dateRange.end)
    );
  }

  if (filters.officerIds && filters.officerIds.length > 0) {
    whereConditions.push(inArray(leads.officerId, filters.officerIds));
  }

  if (filters.sources && filters.sources.length > 0) {
    whereConditions.push(inArray(leads.source, filters.sources));
  }

  if (filters.statuses && filters.statuses.length > 0) {
    whereConditions.push(inArray(leads.status, filters.statuses));
  }

  if (filters.conversionStages && filters.conversionStages.length > 0) {
    whereConditions.push(inArray(leads.conversionStage, filters.conversionStages));
  }

  const result = await db
    .select({ count: count() })
    .from(leads)
    .where(and(...whereConditions));

  return result[0].count;
}
