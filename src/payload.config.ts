import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Vehicles } from './collections/Vehicles'
import { Inquiries } from './collections/Inquiries'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Store media in DigitalOcean Spaces when configured; otherwise fall back to
// Payload's local-disk storage (handy for local dev without cloud creds).
const storagePlugins = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          },
        },
      }),
    ]
  : []

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— 120 Customs',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/120-gear-gold.png' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#default',
        Icon: '@/components/admin/Icon#default',
      },
      logout: {
        Button: '@/components/admin/Logout#default',
      },
    },
  },
  collections: [Vehicles, Media, Inquiries, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // DigitalOcean Managed Postgres requires TLS (set DATABASE_SSL=true in prod).
      // Local Docker Postgres uses no SSL.
      ...(process.env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
    },
  }),
  sharp,
  localization: {
    locales: ['en'],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [...storagePlugins],
})
