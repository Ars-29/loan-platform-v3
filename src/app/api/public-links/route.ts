import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loanOfficerPublicLinks, users, companies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for creating public links
const createPublicLinkSchema = z.object({
  expiresAt: z.string().optional(), // ISO string
  maxUses: z.number().optional(),
});

// GET: Check if user has a public link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Company ID are required' },
        { status: 400 }
      );
    }

    const existingLink = await db
      .select({
        id: loanOfficerPublicLinks.id,
        publicSlug: loanOfficerPublicLinks.publicSlug,
        isActive: loanOfficerPublicLinks.isActive,
        currentUses: loanOfficerPublicLinks.currentUses,
        maxUses: loanOfficerPublicLinks.maxUses,
        expiresAt: loanOfficerPublicLinks.expiresAt,
        createdAt: loanOfficerPublicLinks.createdAt,
      })
      .from(loanOfficerPublicLinks)
      .where(
        and(
          eq(loanOfficerPublicLinks.userId, userId),
          eq(loanOfficerPublicLinks.companyId, companyId),
          eq(loanOfficerPublicLinks.isActive, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      hasLink: existingLink.length > 0,
      data: existingLink[0] || null,
    });

  } catch (error) {
    console.error('Error checking public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new public link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyId, expiresAt, maxUses } = body;

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Company ID are required' },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = createPublicLinkSchema.parse({ expiresAt, maxUses });

    // Check if user already has any public link (active or inactive)
    console.log('🔍 Checking for existing links for userId:', userId, 'companyId:', companyId);
    const existingLink = await db
      .select()
      .from(loanOfficerPublicLinks)
      .where(
        and(
          eq(loanOfficerPublicLinks.userId, userId),
          eq(loanOfficerPublicLinks.companyId, companyId)
        )
      )
      .limit(1);
    
    console.log('🔗 Existing link query result:', existingLink);

    if (existingLink.length > 0) {
      const link = existingLink[0];
      console.log('✅ Found existing link:', {
        id: link.id,
        publicSlug: link.publicSlug,
        isActive: link.isActive
      });
      
      // If link exists but is inactive, reactivate it
      if (!link.isActive) {
        console.log('🔄 Reactivating existing link...');
        const reactivatedLink = await db
          .update(loanOfficerPublicLinks)
          .set({
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(loanOfficerPublicLinks.id, link.id))
          .returning();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const publicUrl = `${baseUrl}/public/profile/${reactivatedLink[0].publicSlug}`;

        console.log('✅ Link reactivated:', reactivatedLink[0]);
        return NextResponse.json({
          success: true,
          data: reactivatedLink[0],
          publicUrl,
          message: 'Public link reactivated',
        });
      }
      
      // If link is already active, return it
      console.log('✅ Link already active, returning existing link');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const publicUrl = `${baseUrl}/public/profile/${link.publicSlug}`;

      return NextResponse.json({
        success: true,
        data: link,
        publicUrl,
        message: 'Public link already exists',
      });
    }

    // Generate a unique public slug
    const publicSlug = `${userId.slice(0, 8)}-${Date.now().toString(36)}`;

    // Create the public link
    const newLink = await db
      .insert(loanOfficerPublicLinks)
      .values({
        userId,
        companyId,
        publicSlug,
        isActive: true,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        maxUses: validatedData.maxUses || null,
      })
      .returning();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const publicUrl = `${baseUrl}/public/profile/${newLink[0].publicSlug}`;

    return NextResponse.json({
      success: true,
      data: newLink[0],
      publicUrl,
    });

  } catch (error) {
    console.error('Error creating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing public link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, isActive, expiresAt, maxUses } = body;

    if (!linkId) {
      return NextResponse.json(
        { success: false, message: 'Link ID is required' },
        { status: 400 }
      );
    }

    const validatedData = createPublicLinkSchema.parse({ expiresAt, maxUses });

    const updatedLink = await db
      .update(loanOfficerPublicLinks)
      .set({
        isActive: isActive !== undefined ? isActive : undefined,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
        maxUses: validatedData.maxUses !== undefined ? validatedData.maxUses : undefined,
        updatedAt: new Date(),
      })
      .where(eq(loanOfficerPublicLinks.id, linkId))
      .returning();

    if (updatedLink.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Public link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLink[0],
    });

  } catch (error) {
    console.error('Error updating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate a public link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json(
        { success: false, message: 'Link ID is required' },
        { status: 400 }
      );
    }

    const updatedLink = await db
      .update(loanOfficerPublicLinks)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(loanOfficerPublicLinks.id, linkId))
      .returning();

    if (updatedLink.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Public link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Public link deactivated successfully',
    });

  } catch (error) {
    console.error('Error deactivating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
