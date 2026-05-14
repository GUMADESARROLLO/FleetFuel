import { getClient, getBucket } from '../../lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET({ url }: { url: URL }) {
  try {
    const path = url.searchParams.get('path');
    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const bucket = getBucket();
    const key = path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const data = await getClient().send(command);

    if (!data.Body) {
      return new Response(JSON.stringify({ error: 'Empty body' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body: Uint8Array;
    if (typeof data.Body === 'object' && 'arrayBuffer' in (data.Body as any)) {
      body = new Uint8Array(await (data.Body as Blob).arrayBuffer());
    } else {
      const chunks: Uint8Array[] = [];
      for await (const chunk of data.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const totalLen = chunks.reduce((a, c) => a + c.length, 0);
      body = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        body.set(c, offset);
        offset += c.length;
      }
    }

    return new Response(body as BodyInit, {
      headers: {
        'Content-Type': data.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, name: err.name }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
