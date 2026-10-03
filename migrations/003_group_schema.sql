-- Upgrades databases created before the create-group schema change.
-- Run this before 001_workspace_teams.sql when Group/User_Group still exist.
USE groupify;

RENAME TABLE
    `Group` TO `Team`,
    User_Group TO User_Team;

ALTER TABLE `Team`
    ADD COLUMN description TEXT NULL,
    ADD COLUMN visibility VARCHAR(100) NULL,
    ADD COLUMN joinType VARCHAR(100) NULL;

UPDATE `Team`
SET visibility = 'private', joinType = 'request'
WHERE visibility IS NULL OR joinType IS NULL;

ALTER TABLE `Team`
    MODIFY COLUMN visibility VARCHAR(100) NOT NULL,
    MODIFY COLUMN joinType VARCHAR(100) NOT NULL;