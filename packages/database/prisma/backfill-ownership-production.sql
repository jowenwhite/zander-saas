-- HIGH-3 Production Backfill: Set default owners for existing records
-- Generated: 2026-02-07
--
-- Tenant mappings:
-- 64 West Holdings LLC (cmjl4vkcv0000xp8pbshyq2if) -> dave@sixtyfourwest.com (cmjl4vkir0004xp8pde61hare)
-- My Cabinet Factory (tenant_mcf) -> jonathan@sixtyfourwest.com (cmjl4vkgy0002xp8payfedl7k)
-- Zander Inc (tenant_zander) -> testuser@zanderos.com (test_onboarding_user_001)

BEGIN;

-- ==========================================
-- TENANT: 64 West Holdings LLC
-- User: dave@sixtyfourwest.com
-- ==========================================

-- Deals (5 records)
UPDATE deals
SET
  "ownerId" = 'cmjl4vkir0004xp8pde61hare',
  "assignedToId" = 'cmjl4vkir0004xp8pde61hare'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'cmjl4vkcv0000xp8pbshyq2if';

-- Contacts (5 records)
UPDATE contacts
SET
  "ownerId" = 'cmjl4vkir0004xp8pde61hare',
  "assignedToId" = 'cmjl4vkir0004xp8pde61hare'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'cmjl4vkcv0000xp8pbshyq2if';

-- EmailMessages outbound (7 records)
UPDATE email_messages
SET "userId" = 'cmjl4vkir0004xp8pde61hare'
WHERE
  "userId" IS NULL
  AND direction = 'outbound'
  AND "tenantId" = 'cmjl4vkcv0000xp8pbshyq2if';

-- Forms (3 records)
UPDATE forms
SET "createdById" = 'cmjl4vkir0004xp8pde61hare'
WHERE
  "createdById" IS NULL
  AND "tenantId" = 'cmjl4vkcv0000xp8pbshyq2if';

-- ==========================================
-- TENANT: My Cabinet Factory
-- User: jonathan@sixtyfourwest.com
-- ==========================================

-- Deals (12 records)
UPDATE deals
SET
  "ownerId" = 'cmjl4vkgy0002xp8payfedl7k',
  "assignedToId" = 'cmjl4vkgy0002xp8payfedl7k'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'tenant_mcf';

-- Contacts (11 records)
UPDATE contacts
SET
  "ownerId" = 'cmjl4vkgy0002xp8payfedl7k',
  "assignedToId" = 'cmjl4vkgy0002xp8payfedl7k'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'tenant_mcf';

-- ==========================================
-- TENANT: Zander Inc
-- User: testuser@zanderos.com
-- ==========================================

-- SmsMessages outbound (1 record)
UPDATE sms_messages
SET "userId" = 'test_onboarding_user_001'
WHERE
  "userId" IS NULL
  AND direction = 'outbound'
  AND "tenantId" = 'tenant_zander';

-- Forms (1 record)
UPDATE forms
SET "createdById" = 'test_onboarding_user_001'
WHERE
  "createdById" IS NULL
  AND "tenantId" = 'tenant_zander';

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

SELECT '=== BACKFILL VERIFICATION ===' as status;

SELECT 'deals_with_owner' as metric, COUNT(*) as count
FROM deals WHERE "ownerId" IS NOT NULL
UNION ALL
SELECT 'deals_null_owner', COUNT(*)
FROM deals WHERE "ownerId" IS NULL
UNION ALL
SELECT 'contacts_with_owner', COUNT(*)
FROM contacts WHERE "ownerId" IS NOT NULL
UNION ALL
SELECT 'contacts_null_owner', COUNT(*)
FROM contacts WHERE "ownerId" IS NULL
UNION ALL
SELECT 'emails_with_user', COUNT(*)
FROM email_messages WHERE "userId" IS NOT NULL
UNION ALL
SELECT 'emails_outbound_null', COUNT(*)
FROM email_messages WHERE "userId" IS NULL AND direction = 'outbound'
UNION ALL
SELECT 'sms_with_user', COUNT(*)
FROM sms_messages WHERE "userId" IS NOT NULL
UNION ALL
SELECT 'sms_outbound_null', COUNT(*)
FROM sms_messages WHERE "userId" IS NULL AND direction = 'outbound'
UNION ALL
SELECT 'forms_with_creator', COUNT(*)
FROM forms WHERE "createdById" IS NOT NULL
UNION ALL
SELECT 'forms_null_creator', COUNT(*)
FROM forms WHERE "createdById" IS NULL;

COMMIT;
