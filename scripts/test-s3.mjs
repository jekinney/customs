// Diagnose DigitalOcean Spaces connectivity with the configured S3 env.
//   docker compose exec app node scripts/test-s3.mjs
import 'dotenv/config'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
})

console.log('endpoint:', process.env.S3_ENDPOINT, 'region:', process.env.S3_REGION, 'bucket:', process.env.S3_BUCKET)
try {
  await client.send(
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: 'diag/hello.txt', Body: 'hi', ContentType: 'text/plain' }),
  )
  console.log('PUT ok')
  const l = await client.send(new ListObjectsV2Command({ Bucket: process.env.S3_BUCKET, MaxKeys: 10 }))
  console.log('LIST ok:', (l.Contents || []).map((o) => o.Key))
} catch (e) {
  console.error('S3 ERROR:', e?.name, '-', e?.message)
}
process.exit(0)
