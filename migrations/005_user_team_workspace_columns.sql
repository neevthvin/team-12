-- Repairs databases upgraded from the legacy User_Group table using the
-- original 003_group_schema.sql, which renamed the table without adding the
-- workspace-aware membership columns expected by the application.
-- Run only when User_Team is missing both workspaceID and isOwner.
USE groupify;

ALTER TABLE User_Team
    ADD COLUMN workspaceID INT NULL,
    ADD COLUMN isOwner VARCHAR(100) NOT NULL DEFAULT 'false';

UPDATE User_Team ut
JOIN `Team` g ON g.groupID = ut.groupID
SET ut.workspaceID = g.workspaceID
WHERE ut.workspaceID IS NULL;

ALTER TABLE User_Team
    MODIFY COLUMN workspaceID INT NOT NULL,
    ADD CONSTRAINT fk_user_team_workspace
        FOREIGN KEY (workspaceID) REFERENCES Workspace(workspaceID) ON DELETE CASCADE;
