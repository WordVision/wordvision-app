import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

# 🚩 Setup paths
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
SUPABASE_ENV_PATH = ROOT_DIR / 'frontend' / '.env'
SUPABASE_DIR = ROOT_DIR / 'frontend' / 'supabase'
SEED_SQL = SUPABASE_DIR / 'seed.sql'
MIGRATIONS_DIR = SUPABASE_DIR / 'migrations'
UPLOAD_SCRIPT = SCRIPT_DIR / "upload_sample_books.py"

# 🧪 Confirm .env exists
if not SUPABASE_ENV_PATH.exists():
    print(f"❌ Could not find .env at {SUPABASE_ENV_PATH}")
    sys.exit(1)

# 🧬 Load environment variables
load_dotenv(dotenv_path=SUPABASE_ENV_PATH)

ACCESS_TOKEN = os.getenv('SUPABASE_ACCESS_TOKEN')
if not ACCESS_TOKEN:
    print("❌ Missing SUPABASE_ACCESS_TOKEN in .env")
    sys.exit(1)

def run(cmd, env=None):
    print(f"▶️ {cmd}")
    subprocess.run(cmd, shell=True, check=True, env=env or os.environ)

print("🚀 Initializing Supabase project...")
run("supabase init --force")

print("🔐 Logging into Supabase CLI with access token...")
run(f"echo '{ACCESS_TOKEN}' | supabase login")

print("🐘 Starting local Supabase database...")
run("supabase db start")

print("🔎 Checking if local DB is ready...")
try:
    run("PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -c '\\l' > /dev/null")
except subprocess.CalledProcessError:
    print("❌ Could not connect to local Postgres on port 54322")
    sys.exit(1)

# 📄 Apply latest migration (schema)
migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"), key=os.path.getmtime, reverse=True)
if not migration_files:
    print(f"❌ No migration file found in {MIGRATIONS_DIR}")
    sys.exit(1)

latest_migration = migration_files[0]
print(f"📐 Applying latest schema migration: {latest_migration.name}")
run(f"PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f {latest_migration}")

# 🌱 Seed the database with predefined data
print(f"🌾 Seeding local database using {SEED_SQL}")
run(f"PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f {SEED_SQL}")

print("✅ Local Supabase is up with schema and seed data applied!")

print("🏁 Restarting Supabase services")
run("supabase stop && supabase start")

# 🧾 Upload EPUB + covers to Supabase S3
if UPLOAD_SCRIPT.exists():
    print("📖 Uploading books to S3 Local Instance")
    run(f"python3 {UPLOAD_SCRIPT}")
else:
    print("⚠️ Could not find upload_sample_books.py in scripts/")
