// Test script for Redis integration
import { redisCache } from '../src/lib/redis';

async function testRedisIntegration() {
  console.log('🧪 Testing Redis integration...');
  
  try {
    // Test basic operations
    const testKey = 'test:integration';
    const testData = { message: 'Hello Redis!', timestamp: Date.now() };
    
    // Set data
    await redisCache.set(testKey, testData, 60); // 1 minute TTL
    console.log('✅ Set test data');
    
    // Get data
    const retrievedData = await redisCache.get(testKey);
    console.log('✅ Retrieved test data:', retrievedData);
    
    // Check if data matches
    if (JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✅ Data integrity verified');
    } else {
      console.log('❌ Data integrity failed');
    }
    
    // Test template operations
    const userId = 'test-user-123';
    const templateSlug = 'template1';
    const templateData = {
      template: { id: 'test', slug: templateSlug, name: 'Test Template' },
      userInfo: { userId, companyId: 'test-company' },
      metadata: { templateSlug, isCustomized: false, isPublished: false }
    };
    
    // Set template
    await redisCache.setTemplate(userId, templateSlug, templateData);
    console.log('✅ Set template data');
    
    // Get template
    const retrievedTemplate = await redisCache.getTemplate(userId, templateSlug);
    console.log('✅ Retrieved template data:', retrievedTemplate);
    
    // Test selection operations
    await redisCache.setSelection(userId, templateSlug);
    console.log('✅ Set selection data');
    
    const retrievedSelection = await redisCache.getSelection(userId);
    console.log('✅ Retrieved selection data:', retrievedSelection);
    
    // Clean up
    await redisCache.delete(testKey);
    await redisCache.clearUserCache(userId);
    console.log('✅ Cleanup completed');
    
    console.log('🎉 Redis integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis integration test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRedisIntegration();
}

export { testRedisIntegration };
