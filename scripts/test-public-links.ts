import { db } from '../src/lib/db';
import { loanOfficerPublicLinks, users, companies } from '../src/lib/db/schema';
import { eq, and } from 'drizzle-orm';

async function testPublicLinks() {
  try {
    console.log('🔍 Testing public links...');
    
    // Check all public links
    const publicLinks = await db
      .select({
        id: loanOfficerPublicLinks.id,
        userId: loanOfficerPublicLinks.userId,
        companyId: loanOfficerPublicLinks.companyId,
        publicSlug: loanOfficerPublicLinks.publicSlug,
        isActive: loanOfficerPublicLinks.isActive,
        currentUses: loanOfficerPublicLinks.currentUses,
        createdAt: loanOfficerPublicLinks.createdAt,
      })
      .from(loanOfficerPublicLinks)
      .limit(10);

    console.log('📋 Public links found:', publicLinks);

    if (publicLinks.length > 0) {
      const activeLink = publicLinks.find(link => link.isActive);
      if (activeLink) {
        console.log('✅ Active public link found:', activeLink);
        
        // Test the public profile API
        const response = await fetch(`http://localhost:3000/api/public-profile/${activeLink.publicSlug}`);
        const result = await response.json();
        console.log('📡 Public profile API response:', result);
        
        if (result.success) {
          console.log('✅ Public profile API working!');
          console.log('👤 User data:', result.data.user);
          console.log('🏢 Company data:', result.data.company);
          
          // Test the public template API
          const templateResponse = await fetch(`http://localhost:3000/api/public-templates/${result.data.user.id}`);
          const templateResult = await templateResponse.json();
          console.log('🎨 Public template API response:', templateResult);
        }
      } else {
        console.log('❌ No active public links found');
      }
    } else {
      console.log('❌ No public links found in database');
    }
  } catch (error) {
    console.error('❌ Error testing public links:', error);
  }
}

testPublicLinks();

