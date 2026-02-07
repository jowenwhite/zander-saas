-- HIGH-3 Backfill: Set default owners for existing records
-- Default user: Jonathan (owner) - cmj6db4qo000213d7ud5uspza
-- Tenant: 64 West Holdings - cmj6db4os000013d7mst7w3lq
-- Date: 2026-02-07

BEGIN;

-- 1. Backfill Deals (20 records)
UPDATE deals
SET
  "ownerId" = 'cmj6db4qo000213d7ud5uspza',
  "assignedToId" = 'cmj6db4qo000213d7ud5uspza'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'cmj6db4os000013d7mst7w3lq';

-- 2. Backfill Contacts (23 records)
UPDATE contacts
SET
  "ownerId" = 'cmj6db4qo000213d7ud5uspza',
  "assignedToId" = 'cmj6db4qo000213d7ud5uspza'
WHERE
  "ownerId" IS NULL
  AND "tenantId" = 'cmj6db4os000013d7mst7w3lq';

-- 3. Backfill EmailMessages (51 records)
-- Only backfill outbound emails (sent by users)
-- Inbound emails (received) will stay NULL - handled by service layer
UPDATE email_messages
SET "userId" = 'cmj6db4qo000213d7ud5uspza'
WHERE
  "userId" IS NULL
  AND direction = 'outbound'
  AND "tenantId" = 'cmj6db4os000013d7mst7w3lq';

-- 4. Backfill SmsMessages (7 records)
-- Only backfill outbound SMS (sent by users)
UPDATE sms_messages
SET "userId" = 'cmj6db4qo000213d7ud5uspza'
WHERE
  "userId" IS NULL
  AND direction = 'outbound'
  AND "tenantId" = 'cmj6db4os000013d7mst7w3lq';

-- 5. Backfill Forms (18 records)
UPDATE forms
SET "createdById" = 'cmj6db4qo000213d7ud5uspza'
WHERE
  "createdById" IS NULL
  AND "tenantId" = 'cmj6db4os000013d7mst7w3lq';

-- Verify counts
SELECT 'deals_updated' as operation, COUNT(*) as count
FROM deals WHERE "ownerId" = 'cmj6db4qo000213d7ud5uspza'
UNION ALL
SELECT 'contacts_updated', COUNT(*)
FROM contacts WHERE "ownerId" = 'cmj6db4qo000213d7ud5uspza'
UNION ALL
SELECT 'emails_updated', COUNT(*)
FROM email_messages WHERE "userId" = 'cmj6db4qo000213d7ud5uspza'
UNION ALL
SELECT 'sms_updated', COUNT(*)
FROM sms_messages WHERE "userId" = 'cmj6db4qo000213d7ud5uspza'
UNION ALL
SELECT 'forms_updated', COUNT(*)
FROM forms WHERE "createdById" = 'cmj6db4qo000213d7ud5uspza';

COMMIT;
