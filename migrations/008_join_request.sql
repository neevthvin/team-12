USE groupify;

CREATE TABLE IF NOT EXISTS Team_Request (
    requestID   INT AUTO_INCREMENT PRIMARY KEY,
    groupID     INT NOT NULL,
    workspaceID INT NOT NULL,
    userID      INT NOT NULL,
    createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_request (groupID, userID),
    FOREIGN KEY (groupID)     REFERENCES `Team`(groupID)          ON DELETE CASCADE,
    FOREIGN KEY (workspaceID) REFERENCES Workspace(workspaceID)   ON DELETE CASCADE,
    FOREIGN KEY (userID)      REFERENCES User(userID)             ON DELETE CASCADE
);