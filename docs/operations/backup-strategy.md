# Database Backup Strategy

## Overview

The DevOps Engineers platform uses **Supabase** (PostgreSQL) as its primary database. This document outlines the backup strategy, restoration procedures, and monitoring requirements.

## Automatic Backups

### Supabase-Managed Backups

Supabase provides automatic daily backups:

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Daily Backups | 7-day retention | 30-day retention |
| Point-in-Time Recovery | Not available | Available (up to 7 days) |
| Backup Frequency | Daily | Daily + PITR |

### Verification

- Backups can be verified in the Supabase Dashboard under **Settings > Database > Backups**
- Each backup shows: timestamp, size, and status (completed/failed)

## Point-in-Time Recovery (Pro Tier)

With Supabase Pro, you can restore to any point in time within the retention window:

1. Go to **Supabase Dashboard > Settings > Database > Backups**
2. Select **Point-in-Time Recovery**
3. Choose the desired timestamp
4. Confirm the restoration

**Warning:** PITR replaces the current database state. Always verify you have the correct timestamp.

## Manual Backup Procedure

For additional safety, perform manual backups before major migrations or releases:

### Export via pg_dump

```bash
# Set connection string (from Supabase dashboard > Settings > Database)
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Full database dump
pg_dump $DATABASE_URL --clean --if-exists --format=custom -f backup_$(date +%Y%m%d_%H%M%S).dump

# Schema only (no data)
pg_dump $DATABASE_URL --schema-only -f schema_$(date +%Y%m%d_%H%M%S).sql

# Data only
pg_dump $DATABASE_URL --data-only -f data_$(date +%Y%m%d_%H%M%S).sql
```

### Export Specific Tables

```bash
# Export user data for compliance
pg_dump $DATABASE_URL -t profiles -t lesson_progress -t certificates \
  -f user_data_export_$(date +%Y%m%d).dump
```

## Restoration Procedure

### From Supabase Dashboard Backup

1. Navigate to **Supabase Dashboard > Settings > Database > Backups**
2. Find the desired backup by date
3. Click **Restore**
4. Wait for restoration to complete (may take several minutes depending on database size)
5. Verify data integrity by running health checks

### From Manual Backup

```bash
# Restore from custom format dump
pg_restore --clean --if-exists -d $DATABASE_URL backup_20260301_120000.dump

# Restore from SQL dump
psql $DATABASE_URL < schema_20260301_120000.sql
```

### Post-Restoration Checklist

- [ ] Verify `/api/health` returns healthy status
- [ ] Check user count matches expected
- [ ] Verify recent lesson progress entries exist
- [ ] Test authentication flow (sign in, access dashboard)
- [ ] Check certificates are accessible
- [ ] Verify quiz attempts are intact

## Data Export for Compliance

For GDPR or user data requests:

```bash
# Export all data for a specific user
psql $DATABASE_URL -c "
  SELECT * FROM profiles WHERE clerk_id = 'user_xxx';
  SELECT * FROM lesson_progress WHERE user_id = (
    SELECT id FROM profiles WHERE clerk_id = 'user_xxx'
  );
  SELECT * FROM quiz_attempts WHERE user_id = (
    SELECT id FROM profiles WHERE clerk_id = 'user_xxx'
  );
  SELECT * FROM certificates WHERE user_id = (
    SELECT id FROM profiles WHERE clerk_id = 'user_xxx'
  );
" > user_data_export.csv
```

## Monitoring

### Backup Health Checks

- **Daily:** Verify automatic backup completed in Supabase Dashboard
- **Weekly:** Check backup sizes for unexpected changes (data loss or bloat)
- **Monthly:** Test restoration procedure on a test database

### Alerts

Configure alerts for:
- Backup failure (Supabase sends email notifications)
- Database size approaching tier limits
- Connection count spikes (may indicate issues)

## Disaster Recovery

### Recovery Time Objective (RTO)
- **Target:** < 1 hour for full restoration
- **Supabase managed backup:** ~15-30 minutes
- **Manual backup restoration:** ~30-60 minutes depending on size

### Recovery Point Objective (RPO)
- **Free tier:** Up to 24 hours of data loss (daily backups)
- **Pro tier:** Minutes of data loss (PITR available)

## Schedule

| Action | Frequency | Owner |
|--------|-----------|-------|
| Automatic backup verification | Daily (automated) | Supabase |
| Dashboard backup check | Weekly | Platform team |
| Manual backup test | Monthly | Platform team |
| Full restoration drill | Quarterly | Platform team |
| Compliance data export review | As needed | Platform team |
