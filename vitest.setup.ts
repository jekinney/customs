// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// If running tests locally on the host machine (not in Docker), rewrite the
// DATABASE_URI from 'postgres' (the Docker service name) to '127.0.0.1'
if (process.env.DATABASE_URI && process.env.DATABASE_URI.includes('@postgres:')) {
  process.env.DATABASE_URI = process.env.DATABASE_URI.replace('@postgres:', '@127.0.0.1:')
} else if (!process.env.DATABASE_URI) {
  process.env.DATABASE_URI = 'postgres://customs:customs@127.0.0.1:5432/customs'
}

