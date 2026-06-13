import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/media
 *
 * Handles Base64 media uploads.
 * Currently stores in memory - will be replaced with Firebase Storage or Supabase Storage.
 *
 * POST: Upload a base64-encoded media file
 * - Body: { base64: string, mimeType: string, filename: string }
 * - Returns: { url: string, id: string }
 *
 * When integrating with Firebase/Supabase:
 * - Upload the decoded base64 data to cloud storage
 * - Return the public URL
 */

// In-memory store for demo (replace with cloud storage)
const mediaStore = new Map<string, { data: string; mimeType: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64, mimeType, filename } = body;

    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: base64, mimeType' },
        { status: 400 }
      );
    }

    // Validate mime type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mpeg', 'audio/ogg', 'audio/wav',
    ];

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported media type: ${mimeType}` },
        { status: 400 }
      );
    }

    // Validate base64 size (max ~10MB after encoding)
    const sizeInBytes = (base64.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in memory (demo only - replace with cloud storage)
    mediaStore.set(id, { data: base64, mimeType });

    // TODO: Replace with actual cloud storage upload
    // Firebase:
    //   const url = await uploadMediaBase64(base64, `media/${filename || id}`);
    // Supabase:
    //   const url = await uploadMediaBase64Supabase(base64, 'media', filename || id);

    return NextResponse.json({
      id,
      url: base64, // In demo mode, return base64 directly
      mimeType,
      size: sizeInBytes,
      message: 'Media uploaded successfully (stored as Base64)',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process media upload' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id || !mediaStore.has(id)) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 });
  }

  const media = mediaStore.get(id)!;
  // Convert base64 to buffer and serve
  const base64Data = media.data.split(',')[1] || media.data;
  const buffer = Buffer.from(base64Data, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': media.mimeType,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}
