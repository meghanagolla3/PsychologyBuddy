-- Create COUNSELOR role if it doesn't exist
INSERT INTO "Roles" (id, name, description, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'COUNSELOR',
  'School counselor with access to students requiring mental health support',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Get the counselor role ID
DO $$
DECLARE
    counselor_role_id UUID;
BEGIN
    SELECT id INTO counselor_role_id FROM "Roles" WHERE name = 'COUNSELOR';
    
    -- Add permissions for counselor role
    INSERT INTO "RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt")
    SELECT 
        gen_random_uuid(),
        counselor_role_id,
        p.id,
        NOW(),
        NOW()
    FROM "Permissions" p
    WHERE p.name IN (
        'dashboard.view',
        'escalations.view', 
        'escalations.respond',
        'badges.view'
    )
    ON CONFLICT ("roleId", "permissionId") DO NOTHING;
    
    RAISE NOTICE 'Counselor role and permissions created successfully';
END $$;

-- Check if counselor role exists
SELECT * FROM "Roles" WHERE name = 'COUNSELOR';
