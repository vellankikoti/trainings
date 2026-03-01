# Incident Response Plan

## Severity Levels

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|----------|
| **SEV1** | Platform completely down | < 15 minutes | Site unreachable, database down, auth broken for all users |
| **SEV2** | Major feature broken | < 1 hour | Progress not saving, quizzes broken, certificates not generating |
| **SEV3** | Minor feature broken | < 4 hours | Styling issues, search not working, single page broken |
| **SEV4** | Cosmetic / low impact | Next business day | Typo in content, minor UI glitch, non-critical log errors |

## Incident Response Process

### 1. Detection

Incidents are detected through:
- Health check monitoring (automated)
- Sentry error alerts (automated)
- User reports (manual)
- Team member observation (manual)

### 2. Triage

1. Assess severity using the table above
2. Assign an incident owner
3. Create a communication thread (Slack channel / GitHub issue)

### 3. Mitigation

**For SEV1/SEV2:**

```
1. Can we rollback? → Vercel instant rollback to last working deployment
2. Is the database down? → Check Supabase status, contact support
3. Is auth broken? → Check Clerk status, verify API keys
4. Is it a code issue? → Identify the breaking commit, prepare hotfix
```

**Decision tree:**
- If the issue is in a recent deployment → **Rollback immediately**
- If the issue is in a third-party service → **Communicate to users, monitor**
- If the issue requires a code fix → **Hotfix branch → PR → merge → deploy**

### 4. Communication

**Where to communicate:**
- GitHub Issues: Create an issue tagged `incident`
- Status page: Update if one is configured
- Social media: For SEV1 lasting > 30 minutes

**Template for user-facing communication:**

```
We're aware of an issue affecting [feature]. Our team is actively working
on a resolution. We'll provide updates as we have them.

Last updated: [timestamp]
```

### 5. Resolution

1. Verify the fix resolves the issue
2. Monitor for 30 minutes after fix is deployed
3. Close the communication thread with resolution summary

### 6. Post-Mortem

Required for **SEV1 and SEV2** incidents.

#### Post-Mortem Template

```markdown
## Incident Post-Mortem: [Title]

**Date:** [Date]
**Duration:** [Start time] - [End time]
**Severity:** SEV[1/2]
**Owner:** [Name]

### Summary
[1-2 sentence description of what happened]

### Impact
- Users affected: [number/percentage]
- Duration: [minutes/hours]
- Data loss: [none/description]

### Timeline
- [HH:MM] First alert/report
- [HH:MM] Incident acknowledged
- [HH:MM] Root cause identified
- [HH:MM] Fix deployed
- [HH:MM] Incident resolved

### Root Cause
[What caused the incident]

### Resolution
[What was done to fix it]

### Action Items
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]
- [ ] [Monitoring improvement]

### Lessons Learned
[What we learned from this incident]
```

## Escalation Contacts

| Role | Contact | When to Escalate |
|------|---------|-----------------|
| Platform Lead | [GitHub / email] | All SEV1, SEV2 > 1 hour |
| Supabase Support | support.supabase.com | Database issues |
| Clerk Support | clerk.com/support | Authentication issues |
| Vercel Support | vercel.com/support | Deployment/hosting issues |
