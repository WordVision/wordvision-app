#!/bin/bash

set -e

# 🔍 Resolve script and project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(cd "$SCRIPT_DIR/../.." && pwd)")
SUPABASE_ENV_PATH="$ROOT_DIR/frontend/.env"
SUPABASE_DIR="$ROOT_DIR/frontend/supabase"
SEED_SQL="$SUPABASE_DIR/seed.sql"
SUPABASE_DB_URL="postgres://postgres:postgres@localhost:54322/postgres"

# 🧪 Confirm .env exists
if [ ! -f "$SUPABASE_ENV_PATH" ]; then
  echo "❌ Could not find .env at $SUPABASE_ENV_PATH"
  exit 1
fi

# 🧬 Load env vars
set -o allexport
source "$SUPABASE_ENV_PATH"
set +o allexport

# 🔍 Extract required variables
PROJECT_ID="${EXPO_PUBLIC_SUPABASE_PROJECT_ID:-}"
ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

if [ -z "$PROJECT_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Missing EXPO_PUBLIC_SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN in .env"
  exit 1
fi

echo "🚀 Initializing Supabase project with config overwrite..."
supabase init --force

echo "🔐 Logging into Supabase CLI with access token..."
echo "$ACCESS_TOKEN" | supabase login

echo "🔗 Linking to Supabase project: $PROJECT_ID"
supabase link --project-ref "$PROJECT_ID"

echo "📥 Pulling latest schema from remote..."
supabase db pull

echo "🐘 Starting local Postgres (if not already running)..."
supabase db start

echo "🔎 Checking if local DB is ready..."
PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -c '\l' > /dev/null || {
  echo "❌ Could not connect to local Postgres on port 54322"
  exit 1
}

echo "📦 Dumping local data to $SEED_SQL..."
supabase db dump --data-only --file "$SEED_SQL" --local --use-copy

LATEST_MIGRATION="$(ls -t $SUPABASE_DIR/migrations/*.sql | head -n 1)"

if [ -z "$LATEST_MIGRATION" ]; then
  echo "❌ No migration file found in $SUPABASE_DIR/migrations"
  exit 1
fi

echo "🧼 Re-applying latest schema: $(basename "$LATEST_MIGRATION")"
PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f "$LATEST_MIGRATION"

echo "🌱 Re-seeding data from $SEED_SQL"
PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f "$SEED_SQL"

echo "📡 Opening psql shell (type \\q to exit)"
PGPASSWORD=postgres psql -h localhost -U postgres -p 54322

echo "✅ Local Supabase is up and fully synced with latest schema + data!"
