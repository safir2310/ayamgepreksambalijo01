import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  console.log('[Upload API] ========================================');
  console.log('[Upload API] Starting file upload...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('[Upload API] FormData keys:', Array.from(formData.keys()));
    console.log('[Upload API] File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      hasFile: !!file,
    });

    if (!file || file.size === 0) {
      console.error('[Upload API] No file or empty file in request');
      return NextResponse.json(
        { error: 'Tidak ada file yang diupload atau file kosong' },
        { status: 400 }
      );
    }

    // More flexible file type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    console.log('[Upload API] File extension:', fileExt);
    console.log('[Upload API] File MIME type:', file.type);

    // Check both MIME type and extension
    const isValidType = allowedTypes.includes(file.type) || 
                        ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(fileExt || '');

    if (!isValidType) {
      console.error('[Upload API] Invalid file type:', file.type, 'Extension:', fileExt);
      return NextResponse.json(
        { error: `Tipe file tidak valid. Gunakan: JPEG, PNG, WebP, GIF, atau SVG. File Anda: ${file.type || fileExt}` },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      console.error('[Upload API] File too large:', file.size, 'MB:', sizeInMB);
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimal 5MB. File Anda: ${sizeInMB}MB` },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    console.log('[Upload API] Upload directory:', uploadDir);
    console.log('[Upload API] Directory exists:', existsSync(uploadDir));
    
    if (!existsSync(uploadDir)) {
      console.log('[Upload API] Creating uploads directory...');
      try {
        await mkdir(uploadDir, { recursive: true });
        console.log('[Upload API] Directory created successfully');
      } catch (mkdirError) {
        console.error('[Upload API] Failed to create directory:', mkdirError);
        return NextResponse.json(
          { error: 'Gagal membuat folder upload. Silakan coba lagi.' },
          { status: 500 }
        );
      }
    }

    // Generate unique filename with proper extension
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = fileExt || file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${random}.${extension}`;
    const filepath = join(uploadDir, filename);

    console.log('[Upload API] Saving file to:', filepath);

    // Convert file to buffer and save
    try {
      const bytes = await file.arrayBuffer();
      console.log('[Upload API] File buffer size:', bytes.byteLength);
      
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      
      console.log('[Upload API] File saved successfully, checking if exists...');
      console.log('[Upload API] File exists after save:', existsSync(filepath));
    } catch (writeError) {
      console.error('[Upload API] Failed to write file:', writeError);
      return NextResponse.json(
        { error: 'Gagal menyimpan file. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;

    console.log('[Upload API] Upload successful:', {
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type,
    });
    console.log('[Upload API] ========================================');

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('[Upload API] ========================================');
    console.error('[Upload API] Error uploading file:', error);
    console.error('[Upload API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('[Upload API] ========================================');
    
    return NextResponse.json(
      { error: 'Gagal mengupload file. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
