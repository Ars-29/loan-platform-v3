import dotenv from 'dotenv';
import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq, isNull } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addUserNmls() {
  try {
    console.log('🔍 Adding NMLS# for users...');

    // Get all users without NMLS#
    const usersWithoutNmls = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        nmlsNumber: users.nmlsNumber
      })
      .from(users)
      .where(isNull(users.nmlsNumber));

    console.log('📋 Users without NMLS#:', usersWithoutNmls);

    if (usersWithoutNmls.length === 0) {
      console.log('✅ All users already have NMLS#');
      return;
    }

    // Add NMLS# for each user
    for (const user of usersWithoutNmls) {
      const nmlsNumber = `123${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      await db
        .update(users)
        .set({ 
          nmlsNumber: nmlsNumber,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      console.log(`✅ Added NMLS# ${nmlsNumber} for user: ${user.email}`);
    }

    console.log('🎉 NMLS# addition completed!');

  } catch (error) {
    console.error('❌ Error adding NMLS#:', error);
  }
}

addUserNmls();
