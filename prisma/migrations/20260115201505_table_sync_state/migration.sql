/*
  Warnings:

  - You are about to drop the column `syncStartedAt` on the `PlaylistData` table. All the data in the column will be lost.
  - You are about to drop the column `syncing` on the `PlaylistData` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PlaylistData] DROP COLUMN [syncStartedAt],
[syncing];

-- CreateTable
CREATE TABLE [dbo].[SyncState] (
    [id] INT NOT NULL CONSTRAINT [SyncState_id_df] DEFAULT 1,
    [syncing] BIT NOT NULL CONSTRAINT [SyncState_syncing_df] DEFAULT 0,
    [syncStartedAt] DATETIME2,
    [syncVersion] NVARCHAR(1000),
    [status] NVARCHAR(1000),
    [errorMessage] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SyncState_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [SyncState_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
