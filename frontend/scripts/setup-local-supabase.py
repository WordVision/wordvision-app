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
SUPABASE_DB_URL = "postgres://postgres:postgres@localhost:54322/postgres"

# 🧪 Confirm .env exists
if not SUPABASE_ENV_PATH.exists():
    print(f"❌ Could not find .env at {SUPABASE_ENV_PATH}")
    sys.exit(1)

# 🧬 Load environment variables
load_dotenv(dotenv_path=SUPABASE_ENV_PATH)

PROJECT_ID = os.getenv('EXPO_PUBLIC_SUPABASE_PROJECT_ID')
ACCESS_TOKEN = os.getenv('SUPABASE_ACCESS_TOKEN')
DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD', 'postgres')

if not PROJECT_ID or not ACCESS_TOKEN:
    print("❌ Missing EXPO_PUBLIC_SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN in .env")
    sys.exit(1)


def run(cmd, env=None):
    print(f"▶️ {cmd}")
    subprocess.run(cmd, shell=True, check=True, env=env or os.environ)


print("🚀 Initializing Supabase project with config overwrite...")
run("supabase init --force")

print("🔐 Logging into Supabase CLI with access token...")
run(f"echo '{ACCESS_TOKEN}' | supabase login")

print(f"🔗 Linking to Supabase project: {PROJECT_ID}")
run(f"supabase link --project-ref {PROJECT_ID}")

print("📥 Pulling latest schema from remote...")
run("supabase db pull")

print("🐘 Starting local Postgres (if not already running)...")
run("supabase db start")

print("🔎 Checking if local DB is ready...")
try:
    run("PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -c '\\l' > /dev/null")
except subprocess.CalledProcessError:
    print("❌ Could not connect to local Postgres on port 54322")
    sys.exit(1)

print(f"📦 Dumping data from production to {SEED_SQL}")
run(f"supabase db dump --data-only --file {SEED_SQL} --linked --use-copy")

# 📄 Get latest migration file
migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"), key=os.path.getmtime, reverse=True)
if not migration_files:
    print(f"❌ No migration file found in {MIGRATIONS_DIR}")
    sys.exit(1)

latest_migration = migration_files[0]
print(f"🧼 Re-applying latest schema: {latest_migration.name}")
run(f"PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f 
    {latest_migration}")

print("🔁 Final refresh: dump fresh data and reapply")
run(f"supabase db dump --data-only -f {SEED_SQL} --linked --use-copy")
run(f"PGPASSWORD=postgres psql -h localhost -U postgres -p 54322 -f {SEED_SQL}")

print("✅ Local Supabase is up and fully synced with latest schema + data!")
