import 'dotenv/config'
import { migrate } from 'postgres-migrations'
import { fileURLToPath } from 'url'
import path from 'path'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const url = new URL(connectionString)
const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
)

migrate(
  {
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: Number(url.port),
    ensureDatabaseExists: true,
  },
  migrationsDir
).catch((err) => {
  console.error(err)
  process.exit(1)
})
