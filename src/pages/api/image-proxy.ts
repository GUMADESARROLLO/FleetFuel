import { getClient, getBucket } from '../../lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET({ url }: { url: URL }) {
  try {
    const path = url.searchParams.get('path');
    if (!path) {
      return new Response('Missing path', { status: 400 });
    }

    const bucket = getBucket();
    const key = path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const data = await getClient().send(command);

    const chunks: Uint8Array[] = [];
    for await (const chunk of data.Body as any) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    return new Response(body, {
      headers: {
        'Content-Type': data.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
