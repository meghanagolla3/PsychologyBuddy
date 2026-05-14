-- Manual SQL to update session status in CounselorAssignment table
-- Run this directly in your database (pgAdmin, DBeaver, etc.)

-- Update some existing assignments with different session statuses for testing
UPDATE "CounselorAssignments" 
SET "sessionStatus" = 'SCHEDULED' 
WHERE id IN (
  SELECT id FROM "CounselorAssignments" 
  WHERE "sessionStatus" IS NULL 
  LIMIT 3
);

UPDATE "CounselorAssignments" 
SET "sessionStatus" = 'IN_PROGRESS' 
WHERE id IN (
  SELECT id FROM "CounselorAssignments" 
  WHERE "sessionStatus" IS NULL 
  LIMIT 3
);

UPDATE "CounselorAssignments" 
SET "sessionStatus" = 'COMPLETED' 
WHERE id IN (
  SELECT id FROM "CounselorAssignments" 
  WHERE "sessionStatus" IS NULL 
  LIMIT 3
);

UPDATE "CounselorAssignments" 
SET "sessionStatus" = 'CANCELLED' 
WHERE id IN (
  SELECT id FROM "CounselorAssignments" 
  WHERE "sessionStatus" IS NULL 
  LIMIT 2
);

UPDATE "CounselorAssignments" 
SET "sessionStatus" = 'MISSED' 
WHERE id IN (
  SELECT id FROM "CounselorAssignments" 
  WHERE "sessionStatus" IS NULL 
  LIMIT 2
);

-- Check the results
SELECT 
  ca.id,
  ca."sessionStatus",
  u."firstName" || ' ' || u."lastName" as student_name,
  u2."firstName" || ' ' || u2."lastName" as counselor_name
FROM "CounselorAssignments" ca
JOIN "User" u ON ca."studentId" = u.id
JOIN "User" u2 ON ca."counselorId" = u2.id
ORDER BY ca."sessionStatus" DESC NULLS LAST;
