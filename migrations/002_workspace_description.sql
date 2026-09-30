-- Adds the optional description stored by workspace creation.
USE groupify;

ALTER TABLE Workspace ADD COLUMN description VARCHAR(500);
