# Database Migrations Workflow

## Overview

This project uses **Supabase CLI** for database migrations. All schema changes are tracked as sequential SQL migration files in `supabase/migrations/`.

## Migration Files

```
supabase/migrations/
├── 001_initial_schema.sql     # Tables, RLS, indexes, functions
├── 002_add_subscriptions.sql  # (example: future migration)
└── ...
```

### Naming Convention

```
{number}_{description}.sql
```

- **Number**: Three-digit sequential (001, 002, 003...)
- **Description**: Snake_case description of the change
- **Never modify** an already-applied migration file

## Creating a New Migration

### 1. Create the migration file

```bash
# Create a new migration file
touch supabase/migrations/002_add_subscriptions.sql
```

### 2. Write the SQL

```sql
-- 002_add_subscriptions.sql
-- Description: Add subscription tracking for premium users
-- Rollback: DROP TABLE IF EXISTS subscriptions;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'team')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
```

### 3. Always include rollback instructions

At the top of each migration file, include a comment with the rollback SQL:

```sql
-- Rollback: DROP TABLE IF EXISTS subscriptions;
```

### 4. Test on local/staging

```bash
# Link to your staging Supabase project
supabase link --project-ref <staging-project-ref>

# Push migrations to staging
supabase db push

# Verify the migration applied
supabase db diff
```

### 5. Apply to production

```bash
# Link to production project
supabase link --project-ref <production-project-ref>

# Push to production (ALWAYS test on staging first)
supabase db push
```

## Rollback Procedure

Supabase does not have built-in rollback. To rollback:

1. **Create a new migration** that reverses the changes
2. **Name it clearly**: `003_rollback_002_add_subscriptions.sql`
3. **Apply it** through the normal migration flow

```sql
-- 003_rollback_002_add_subscriptions.sql
-- Rollback for migration 002

DROP TABLE IF EXISTS subscriptions;
```

## Rules

1. **Never modify** a migration that has been applied to staging or production
2. **Always test** on staging before production
3. **Include rollback SQL** as a comment in every migration
4. **One concern per migration** — don't mix unrelated schema changes
5. **Use IF EXISTS / IF NOT EXISTS** for safety
6. **Always add RLS policies** when creating new tables
7. **Add indexes** for columns used in WHERE clauses or JOINs

## CI Validation

The CI pipeline checks that:
- Migration files are valid SQL (syntax check)
- Migration numbers are sequential with no gaps
- No existing migration files have been modified

## Environment Setup

| Environment | Supabase Project | Branch |
|-------------|-----------------|--------|
| Development | Local (`supabase start`) | Any |
| Staging | staging-project-ref | `develop` |
| Production | production-project-ref | `main` |

## Useful Commands

```bash
# Start local Supabase
supabase start

# Check migration status
supabase migration list

# Generate migration from diff
supabase db diff --use-migra -f <migration_name>

# Reset local database (destructive!)
supabase db reset

# Push migrations to linked project
supabase db push
```
