-- Script to fix notification URLs in existing database records
-- This updates all notification actionUrl values to remove invalid sub-routes

-- 1. Fix Proposal notifications
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/vendor/proposals/[^/]+$', '/vendor/proposals')
WHERE "type" IN ('PROPOSAL_RECEIVED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED')
  AND "actionUrl" ~ '/vendor/proposals/';

-- 2. Fix Contract notifications (remove /contract suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/contract$', '')
WHERE "type" IN ('CONTRACT_GENERATED', 'CONTRACT_SIGNED', 'CONTRACT_REMINDER')
  AND "actionUrl" ~ '/contract$';

-- 3. Fix Milestone notifications (remove /milestones suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/milestones$', '')
WHERE "type" IN ('MILESTONE_COMPLETED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED')
  AND "actionUrl" ~ '/milestones$';

-- 4. Fix Payment notifications (remove /payments suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/payments$', '')
WHERE "type" IN ('PAYMENT_REQUESTED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'PAYMENT_COMPLETED')
  AND "actionUrl" ~ '/payments$';

-- 5. Fix File/Folder notifications (remove /files suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/files$', '')
WHERE "type" IN ('FILE_UPLOADED', 'FOLDER_CREATED', 'FOLDER_ACCESS')
  AND "actionUrl" ~ '/files$';

-- 6. Fix Message notifications (remove conversation ID)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/messages/[^/]+$', '/messages')
WHERE "type" = 'MESSAGE_RECEIVED'
  AND "actionUrl" ~ '/messages/';

-- 7. Fix Incident notifications (remove incidents sub-route)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/incidents/[^/]+$', '')
WHERE "type" IN ('INCIDENT_CREATED', 'INCIDENT_RESOLVED')
  AND "actionUrl" ~ '/incidents/';

-- 8. Fix GitHub notifications (remove /github suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/github$', '')
WHERE "type" = 'GITHUB_COMMIT'
  AND "actionUrl" ~ '/github$';

-- 9. Fix Deliverable notifications (legacy - remove /deliverables suffix)
UPDATE "Notification"
SET "actionUrl" = REGEXP_REPLACE("actionUrl", '/deliverables$', '')
WHERE "type" IN ('DELIVERABLE_UPLOADED', 'DELIVERABLE_APPROVED')
  AND "actionUrl" ~ '/deliverables$';

-- Verification query - check updated notifications
SELECT 
  "type",
  COUNT(*) as count,
  STRING_AGG(DISTINCT "actionUrl", ', ') as unique_urls
FROM "Notification"
WHERE "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY "type"
ORDER BY "type";
