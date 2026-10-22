-- Upgrades databases created before the create-group schema change.
-- Run this before 001_workspace_teams.sql when Group/User_Group still exist.
USE groupify;

RENAME TABLE
    `Group` TO `Team`,
    User_Group TO User_Team;

-- Bring the renamed membership table up to the workspace-aware shape used by
-- the application. Older User_Group tables only had userID and groupID.
ALTER TABLE User_Team
    ADD COLUMN workspaceID INT NULL,
    ADD COLUMN isOwner VARCHAR(100) NOT NULL DEFAULT 'false';

UPDATE User_Team ut
JOIN `Team` g ON g.groupID = ut.groupID
SET ut.workspaceID = g.workspaceID;

ALTER TABLE User_Team
    MODIFY COLUMN workspaceID INT NOT NULL,
    ADD CONSTRAINT fk_user_team_workspace
        FOREIGN KEY (workspaceID) REFERENCES Workspace(workspaceID) ON DELETE CASCADE;

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
