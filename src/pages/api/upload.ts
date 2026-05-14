import { uploadImage, generateImageKey } from '../../lib/s3';

export async function POST({ request }: { request: Request }) {
  try {
    const { base64, username, registroId, field } = await request.json();

    if (!base64 || !username || !registroId || !field) {
      return new Response(JSON.stringify({ error: 'Faltan campos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const key = generateImageKey(username, registroId, field);
    const url = await uploadImage(key, base64);

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
