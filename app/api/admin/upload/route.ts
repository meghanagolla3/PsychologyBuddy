import { NextResponse } from 'next/server';
import { uploadBase64ToS3 } from '@/src/utils/s3';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// POST /api/admin/upload - Generic upload endpoint for admin users
export const POST = withPermission({
  module: 'PSYCHO_EDUCATION',
  action: 'CREATE',
})(async (req) => {
  try {
    const body = await req.json();
    const { base64, name } = body as { base64: string; name: string };
    if (!base64 || !name) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }
    const url = await uploadBase64ToS3(base64, name);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    const err = handleError(error);
    return NextResponse.json(err, { status: err.error?.code || 500 });
  }
});
