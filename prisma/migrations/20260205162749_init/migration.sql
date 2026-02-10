BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[SyncState] (
    [id] INT NOT NULL CONSTRAINT [SyncState_id_df] DEFAULT 1,
    [syncing] BIT NOT NULL CONSTRAINT [SyncState_syncing_df] DEFAULT 0,
    [syncStartedAt] DATETIME2,
    [syncVersion] NVARCHAR(1000),
    [status] NVARCHAR(1000),
    [errorMessage] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [SyncState_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [communicationKey] NVARCHAR(255),
    [communicationKeyWasSended] BIT NOT NULL CONSTRAINT [SyncState_communicationKeyWasSended_df] DEFAULT 0,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [SyncState_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PlaylistData] (
    [id] INT NOT NULL CONSTRAINT [PlaylistData_id_df] DEFAULT 1,
    [version] NVARCHAR(1000) NOT NULL,
    [rawJson] NVARCHAR(max) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PlaylistData_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PlaylistData_version_key] UNIQUE NONCLUSTERED ([version])
);

-- CreateTable
CREATE TABLE [dbo].[Media] (
    [id] NVARCHAR(1000) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [checksum] NVARCHAR(1000) NOT NULL,
    [errorCount] INT,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Media_status_df] DEFAULT 'pending',
    [isDownloaded] BIT NOT NULL CONSTRAINT [Media_isDownloaded_df] DEFAULT 0,
    [localPath] NVARCHAR(max) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Media_filename_key] UNIQUE NONCLUSTERED ([filename])
);

-- CreateTable
CREATE TABLE [dbo].[ApiKey] (
    [id] INT NOT NULL CONSTRAINT [ApiKey_id_df] DEFAULT 1,
    [key] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ApiKey_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ApiKey_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ApiKey_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Media_id_filename_idx] ON [dbo].[Media]([id], [filename]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
