#!/bin/bash

set -e

echo "🔑 Checking Supabase login..."
supabase projects list > /dev/null || supabase login

# Load project ref from .env
PROJECT_REF=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2 | sed -E 's~https://([a-z0-9]+)\.supabase\.co~\1~')
echo "📦 Project ref: $PROJECT_REF"

echo "🔑 Checking Supabase login..."
supabase projects list > /dev/null || supabase login

echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_REF

echo "📦 Dumping production schema and data..."
supabase db dump --file ./scripts/local-env/schema.sql
supabase db dump --data-only --file ./scripts/local-env/data.sql


echo "🐳 Starting Supabase via Docker..."
docker-compose -f ./scripts/local-env/docker-compose.supabase.yml up -d

# Wait for Postgres to be ready (basic check)
echo "⏳ Waiting for DB to be ready..."
until docker exec $(docker ps -qf "name=supabase-db") pg_isready -U postgres > /dev/null; do
  echo "⏳ Waiting for Postgres to be ready..."
  sleep 2
done

echo "📤 Importing schema..."
docker exec -i $(docker ps -qf "name=supabase-db") \
  psql -U postgres -d postgres < ./scripts/local-env/schema.sql

echo "📤 Importing data..."
docker exec -i $(docker ps -qf "name=supabase-db") \
  psql -U postgres -d postgres < ./scripts/local-env/data.sql

echo "📄 Using .env as single source of truth."

echo "✅ Supabase local dev is ready!"
