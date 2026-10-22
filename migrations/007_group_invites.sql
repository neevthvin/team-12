USE groupify;

CREATE TABLE IF NOT EXISTS Group_Invite (
    groupID       INT NOT NULL,
    invitedBy     INT NOT NULL,
    invitedUserID INT NOT NULL,
    status        ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (groupID, invitedUserID),
    FOREIGN KEY (groupID) REFERENCES `Team`(groupID) ON DELETE CASCADE,
    FOREIGN KEY (invitedBy) REFERENCES `User`(userID) ON DELETE CASCADE,
    FOREIGN KEY (invitedUserID) REFERENCES `User`(userID) ON DELETE CASCADE
);
