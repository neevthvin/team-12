-- Adds the workspace group tables expected by workspaces.js and groups.js.
-- Safe to run more than once.
USE groupify;

CREATE TABLE IF NOT EXISTS `Team` (
    groupID     INT AUTO_INCREMENT PRIMARY KEY,
    groupName   VARCHAR(100) NOT NULL,
    description TEXT,
    ownerName   VARCHAR(100) NOT NULL,
    userID      INT NOT NULL,
    workspaceID INT NOT NULL,
    visibility  VARCHAR(100) NOT NULL,
    joinType    VARCHAR(100) NOT NULL,
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES `User`(userID) ON DELETE CASCADE,
    FOREIGN KEY (workspaceID) REFERENCES Workspace(workspaceID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS User_Team (
    userID      INT NOT NULL,
    workspaceID INT NOT NULL,
    groupID     INT NOT NULL,
    isOwner     VARCHAR(100) NOT NULL DEFAULT 'false',
    PRIMARY KEY (userID, workspaceID, groupID),
    FOREIGN KEY (userID) REFERENCES `User`(userID) ON DELETE CASCADE,
    FOREIGN KEY (workspaceID) REFERENCES Workspace(workspaceID) ON DELETE CASCADE,
    FOREIGN KEY (groupID) REFERENCES `Team`(groupID) ON DELETE CASCADE
);
