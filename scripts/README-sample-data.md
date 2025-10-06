# Sample Data Creation Scripts

This directory contains scripts to populate the database with sample data for testing the Loan Officer Platform.

## Available Scripts

### 1. `create-sample-data-simple.ts` (Recommended)
Creates basic sample data without complex fields.

**What it creates:**
- 3 companies with basic information
- 3 company admins (1 per company)
- 9 loan officers (3 per company)
- 10-24 leads per officer (90-216 total leads)

**Usage:**
```bash
npx tsx scripts/create-sample-data-simple.ts
```

**After running:**
1. Go to Supabase Dashboard → Authentication → Users
2. Create auth users for the emails listed in the output
3. Set passwords for each user
4. Test the system with different user roles

### 2. `create-sample-data-with-auth.ts` (Fully Automated)
Creates sample data AND automatically creates Supabase auth users.

**What it creates:**
- Same data as simple script
- Automatically creates auth users with password: `password123`
- Ready to use immediately

**Usage:**
```bash
npx tsx scripts/create-sample-data-with-auth.ts
```

**Requirements:**
- `SUPABASE_SERVICE_ROLE_KEY` must be set in `.env.local`
- Service role key must have admin permissions

### 3. `create-sample-data-comprehensive.ts` (Advanced)
Creates comprehensive sample data with all company fields and templates.

**What it creates:**
- 5 companies with full profile information
- 5 company admins
- 15+ loan officers
- 200+ leads with detailed information
- Default templates
- Page settings for officers

**Usage:**
```bash
npx tsx scripts/create-sample-data-comprehensive.ts
```

## Sample Data Overview

### Companies Created
1. **Premier Mortgage Group** (New York)
   - Admin: Robert Johnson (admin@premiermortgage.com)
   - Officers: James Wilson, Sarah Martinez, David Thompson

2. **Elite Home Loans** (Los Angeles)
   - Admin: Maria Garcia (admin@elitehomeloans.com)
   - Officers: Jennifer Anderson, Michael Garcia, Lisa Rodriguez

3. **Metro Lending Solutions** (Chicago)
   - Admin: James Smith (admin@metrolending.com)
   - Officers: Robert Lee, Amanda White, Christopher Harris

### Lead Data
Each officer gets 10-24 leads with:
- Random names and contact information
- Various sources (landing_page, rate_table, referral, etc.)
- Different statuses (new, contacted, qualified, converted, lost)
- Loan details (amounts, terms, rates)
- Property information
- Quality scores and analytics data

### User Roles
- **Super Admin**: Can access all data across companies
- **Company Admin**: Can manage their company's officers and leads
- **Loan Officer**: Can view and manage their own leads

## Testing the System

After running any script, you can test:

1. **Super Admin Dashboard**: `/super-admin/dashboard`
   - View all companies, officers, and leads
   - Access analytics and insights

2. **Company Admin Dashboard**: `/admin/dashboard`
   - Login with any admin email
   - Manage company officers and view company leads

3. **Loan Officer Dashboard**: `/officers/dashboard`
   - Login with any officer email
   - View and manage personal leads

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` is correct
   - Ensure database is accessible

2. **Auth User Creation Failed**
   - Check `SUPABASE_SERVICE_ROLE_KEY` is valid
   - Ensure service role has admin permissions

3. **Duplicate Email Error**
   - Clear existing data first
   - Or modify email addresses in the script

### Clearing Existing Data

To start fresh, you can run:
```bash
npx tsx scripts/reset-seed.ts
```

## Customization

You can modify the scripts to:
- Change company names and details
- Add more officers per company
- Adjust lead generation parameters
- Modify user roles and permissions

## Notes

- All scripts use UUIDs for user IDs
- Passwords for auth users are set to `password123`
- Lead data includes realistic loan amounts and property details
- All users are created as active and verified
- Company admins are automatically linked to their companies

