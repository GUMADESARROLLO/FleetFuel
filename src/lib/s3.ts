import './db';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client: S3Client | null = null;

export function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return client;
}

export function getBucket(): string {
  return process.env.AWS_BUCKET || 'fleetfuel';
}

export async function uploadImage(
  key: string,
  base64: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64');

  const upload = new Upload({
    client: getClient(),
    params: {
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    },
  });

  await upload.done();

  return `${getBucket()}/${key}`;
}

export function generateImageKey(
  username: string,
  registroId: string,
  field: string
): string {
  return `registros/${username}/${registroId}/${field}.jpg`;
}

export async function getSignedImageUrl(key: string, expiresIn: number = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseContentDisposition: 'inline',
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteImage(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getClient().send(command);
}
