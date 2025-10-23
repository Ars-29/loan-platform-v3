import { NextRequest } from "next/server";
import { redisCache } from '@/lib/redis';

type SearchBody = Record<string, unknown>;

const OB_BASE_URL = process.env.OB_BASE_URL || "https://marketplace.optimalblue.com/consumer/api";
const BUSINESS_CHANNEL_ID = process.env.OB_BUSINESS_CHANNEL_ID || "64170";
const ORIGINATOR_ID = process.env.OB_ORIGINATOR_ID || "749463";
const OB_BEARER_TOKEN = process.env.OB_BEARER_TOKEN;

// Function to convert credit score range to integer
function parseCreditScore(creditScoreRange: string): number {
  if (!creditScoreRange || typeof creditScoreRange !== 'string') {
    return 750; // Default fallback
  }
  
  // Handle different range formats
  if (creditScoreRange.includes('-')) {
    const [min, max] = creditScoreRange.split('-').map(num => parseInt(num.trim()));
    if (!isNaN(min) && !isNaN(max)) {
      // Return the midpoint of the range
      return Math.round((min + max) / 2);
    }
  }
  
  // If it's already a single number
  const singleScore = parseInt(creditScoreRange);
  if (!isNaN(singleScore)) {
    return singleScore;
  }
  
  // Fallback for any other format
  return 750;
}

const DEBUG_OB = process.env.DEBUG_OB === '1';

function stableStringify(obj: any): string {
  const allKeys: string[] = [];
  JSON.stringify(obj, (key, value) => { allKeys.push(key); return value; });
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

async function postBestExecutionSearch(body: SearchBody) {
  const url = `${OB_BASE_URL}/businesschannels/${BUSINESS_CHANNEL_ID}/originators/${ORIGINATOR_ID}/bestexsearch`;
  
  // Prepare headers with authentication
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "api-version": "4",
  };

  // Add Bearer token authentication if available
  if (OB_BEARER_TOKEN) {
    headers["Authorization"] = `Bearer ${OB_BEARER_TOKEN}`;
  }

  if (DEBUG_OB) {
    console.log('=== OPTIMAL BLUE API REQUEST ===');
    console.log('URL:', url);
    console.log('Method:', 'POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Credit Score Range:', body.representativeFICO);
    console.log('Parsed Credit Score:', parseCreditScore(body.representativeFICO as string));
    console.log('Request Body:', JSON.stringify(body, null, 2));
    console.log('===============================');
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (DEBUG_OB) {
    console.log('=== OPTIMAL BLUE API RESPONSE ===');
    console.log('Status:', res.status);
    console.log('Status Text:', res.statusText);
    console.log('Response Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
  }
  
  // Get response body
  const responseText = await res.text();
  if (DEBUG_OB) console.log('Response Body:', responseText);
  
  // Try to parse as JSON for better formatting
  try {
    const responseJson = JSON.parse(responseText);
    if (DEBUG_OB) console.log('Parsed Response JSON:', JSON.stringify(responseJson, null, 2));
  } catch (e) {
    if (DEBUG_OB) console.log('Response is not valid JSON, showing raw text');
  }
  
  console.log('===============================');

  if (!res.ok) {
    if (DEBUG_OB) console.log(`API Error (${res.status}): ${responseText}`);
    
    // Handle different error types
    if (res.status === 401) {
      if (DEBUG_OB) {
        console.log('=== AUTHENTICATION FAILED ===');
        console.log('Status:', res.status);
        console.log('Error:', responseText);
        console.log('Bearer Token provided:', !!OB_BEARER_TOKEN);
        console.log('Business Channel ID:', BUSINESS_CHANNEL_ID);
        console.log('Originator ID:', ORIGINATOR_ID);
        console.log('============================');
        console.log('Authentication failed, returning mock data...');
      }
    } else if (res.status === 400) {
      if (DEBUG_OB) {
        console.log('=== VALIDATION ERROR ===');
        console.log('Status:', res.status);
        console.log('Error:', responseText);
        console.log('========================');
        console.log('Request validation failed, returning mock data...');
      }
    } else {
      if (DEBUG_OB) {
        console.log('=== API ERROR ===');
        console.log('Status:', res.status);
        console.log('Error:', responseText);
        console.log('==================');
        console.log('API error occurred, returning mock data...');
      }
    }
    
    // Return mock data for any API error (401, 400, etc.)
    if (res.status === 401 || res.status === 400 || res.status >= 500) {
      return {
        products: [
          {
            apr: 6.5,
            productType: "StandardProducts",
            armMargin: 0,
            closingCost: 2713,
            lastUpdate: new Date().toISOString(),
            loanTerm: "ThirtyYear",
            lockPeriod: 30,
            price: 100.0,
            rate: 6.25,
            rebate: 1000,
            discount: 0,
            principalAndInterest: 925,
            monthlyMI: 0,
            totalPayment: 925.0,
            amortizationTerm: "ThirtyYear",
            amortizationType: "Fixed",
            investorId: 123456,
            investor: "Mock Lender - Conventional",
            loanType: "Conventional",
            priceStatus: "Available",
            pendingUpdate: false,
            productCode: "MOCK001",
            productId: 99999999,
            productName: "Mock Conventional 30 Yr Fixed"
          },
          {
            apr: 6.75,
            productType: "StandardProducts",
            armMargin: 0,
            closingCost: 2713,
            lastUpdate: new Date().toISOString(),
            loanTerm: "ThirtyYear",
            lockPeriod: 30,
            price: 100.5,
            rate: 6.5,
            rebate: 500,
            discount: 0,
            principalAndInterest: 948,
            monthlyMI: 0,
            totalPayment: 948.0,
            amortizationTerm: "ThirtyYear",
            amortizationType: "Fixed",
            investorId: 123457,
            investor: "Mock Lender - FHA",
            loanType: "FHA",
            priceStatus: "Available",
            pendingUpdate: false,
            productCode: "MOCK002",
            productId: 99999998,
            productName: "Mock FHA 30 Yr Fixed"
          }
        ],
        totalLoanAmountDetails: {
          totalLoanAmount: 150000
        },
        cltv: 0,
        ltv: 66.67,
        hcltv: 0,
        amiPercentage: 95.15,
        amiPercentageFFIEC: 92.07,
        searchId: "MOCK_SEARCH_" + Date.now(),
        searchTime: new Date().toISOString(),
        customerInternalId: "OBSearch",
        isMockData: true, // Flag to indicate this is mock data
        source: 'mock_fallback'
      };
    }
    
    throw new Error(`Best Execution Search failed (${res.status}): ${responseText}`);
  }
  
  // Return the parsed JSON response
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.log('Failed to parse response as JSON, returning raw text');
    return { error: 'Invalid JSON response', rawResponse: responseText };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SearchBody;
    
    console.log('🔍 OB API: Request received');
    console.log('🔍 OB API: Body keys:', Object.keys(body));
    console.log('🔍 OB API: Loan terms in body:', body.loanTerms);
    
    if (DEBUG_OB) {
      console.log('=== INCOMING REQUEST TO API ROUTE ===');
      console.log('Request URL:', request.url);
      console.log('Request Method:', request.method);
      console.log('Request Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
      console.log('Request body received:', JSON.stringify(body, null, 2));
      console.log('=====================================');
    }

    // Transform the request body to match Optimal Blue API format
    const apiRequestBody = {
      borrowerInformation: {
        citizenship: "USCitizen",
        firstName: body.firstName || "test",
        lastName: body.lastName || "test1",
        vaFirstTimeUse: body.vaFirstTimeUse !== undefined ? body.vaFirstTimeUse : true,
        firstTimeHomeBuyer: body.firstTimeHomeBuyer !== undefined ? body.firstTimeHomeBuyer : false,
        monthsReserves: body.monthsReserves || 24,
        selfEmployed: body.selfEmployed !== undefined ? body.selfEmployed : true,
        waiveEscrows: body.waiveEscrows !== undefined ? body.waiveEscrows : false
      },
      propertyInformation: {
        appraisedValue: body.salesPrice || 225000,
        occupancy: body.occupancy || "PrimaryResidence",
        propertyStreetAddress: body.propertyStreetAddress || "string",
        county: body.county || "Collin",
        state: body.state || "TX",
        zipCode: body.zipCode || "75024",
        propertyType: body.propertyType || "SingleFamily",
        corporateRelocation: body.corporateRelocation || false,
        salesPrice: body.salesPrice || 225000,
        numberOfStories: body.numberOfStories || 1,
        numberOfUnits: "OneUnit" // Always set to OneUnit for single family homes
      },
      loanInformation: {
        loanPurpose: body.loanPurpose || "Purchase",
        lienType: body.lienType || "First",
        amortizationTypes: body.amortizationTypes || ["Fixed", "ARM"],
        armFixedTerms: body.armFixedTerms || ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
        automatedUnderwritingSystem: "NotSpecified",
        borrowerPaidMI: body.borrowerPaidMI || "Yes",
        buydown: "None",
        cashOutAmount: 0,
        desiredLockPeriod: 0,
        desiredPrice: 0,
        desiredRate: 0,
        feesIn: "No",
        expandedApprovalLevel: "NotApplicable",
        interestOnly: false,
        baseLoanAmount: body.baseLoanAmount || 150000,
        secondLienAmount: 0,
        helocDrawnAmount: 0,
        helocLineAmount: 0,
        loanTerms: body.loanTerms || ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"],
        loanType: body.loanType || "Conventional",
        prepaymentPenalty: "None",
        exemptFromVAFundingFee: false,
        includeLOCompensationInPricing: "YesLenderPaid",
        calculateTotalLoanAmount: true,
        expandedGuidelines: {
          incomeVerificationType: "FullDoc",
          housingEventType: "None",
          housingEventSeasoning: "NotApplicable",
          bankruptcyType: "None",
          bankruptcyOutcome: "NotApplicable",
          bankruptcySeasoning: "NotApplicable",
          mortgageLatesx30_12Mos: 0,
          mortgageLatesx30_13to24Mos: 0,
          mortgageLatesx60_12Mos: 0,
          mortgageLatesx60_13to24Mos: 0,
          mortgageLatesx90_12Mos: 0,
          mortgageLatesx90_13to24Mos: 0,
          mortgageLatesx120_12Mos: 0,
          mortgageLatesx120_13to24Mos: 0,
          debtConsolidation: false,
          uniqueProperty: false
        },
        representativeFICO: parseCreditScore(body.representativeFICO as string) || 750,
        loanLevelDebtToIncomeRatio: body.loanLevelDebtToIncomeRatio || 18,
        totalMonthlyQualifyingIncome: body.totalMonthlyQualifyingIncome || 9000,
        customerInternalId: "OBSearch"
      }
    };

    if (DEBUG_OB) {
      console.log('Transformed API request body:', JSON.stringify(apiRequestBody, null, 2));
      console.log('==========================================');
    }

    // Try Redis cache first (12h TTL)
    const cacheKey = `ob:bestex:${stableStringify(apiRequestBody)}`;
    const cached = await redisCache.get<any>(cacheKey);
    if (cached) {
      if (DEBUG_OB) console.log('✅ OB Cache hit:', cacheKey);
      return new Response(
        JSON.stringify(cached),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Optimal Blue Best Execution Search API
    console.log('🔍 OB API: About to call Optimal Blue API');
    console.log('🔍 OB API: Loan terms being sent:', apiRequestBody.loanInformation.loanTerms);
    console.log('🔍 OB API: ARM terms being sent:', apiRequestBody.loanInformation.armFixedTerms);
    const searchResponse = await postBestExecutionSearch(apiRequestBody);
    console.log('🔍 OB API: Response received:', searchResponse);
    
    if (DEBUG_OB) {
      console.log('=== OPTIMAL BLUE API RESPONSE DEBUG ===');
      console.log('Response received:', JSON.stringify(searchResponse, null, 2));
      console.log('=======================================');
    }

    // Check if the response contains mock data indicators
    const isMockData = searchResponse.isMockData === true || 
                      (searchResponse.products && 
                       searchResponse.products.some((product: any) => 
                         product.investor?.includes('Mock Lender') || 
                         product.productId === 99999999 || 
                         product.productId === 99999998
                       ));

    const dataSource = isMockData ? 'mock_fallback' : 'optimal_blue_api';

    if (DEBUG_OB) {
      console.log('=== DATA SOURCE DETECTION ===');
      console.log('Is mock data:', isMockData);
      console.log('Data source:', dataSource);
      console.log('==============================');
    }

    const finalResponse = {
      success: true,
      data: searchResponse,
      searchCriteria: body,
      timestamp: new Date().toISOString(),
      isMockData: isMockData,
      source: dataSource
    };

    if (DEBUG_OB) {
      console.log('=== FINAL RESPONSE TO CLIENT ===');
      console.log('Response Status:', 200);
      console.log('Is Mock Data:', isMockData);
      console.log('Data Source:', dataSource);
      console.log('Response Data:', JSON.stringify(finalResponse, null, 2));
      console.log('===============================');
    }

    // Cache successful non-mock responses for 12 hours
    if (!isMockData) {
      try {
        await redisCache.set(cacheKey, finalResponse, 12 * 60 * 60);
        if (DEBUG_OB) console.log('💾 OB cached:', cacheKey);
      } catch (e) {
        if (DEBUG_OB) console.log('Redis cache set failed:', e);
      }
    }

    return new Response(
      JSON.stringify(finalResponse),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error('❌ OB API Error:', error);
    console.error('❌ Error message:', message);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
