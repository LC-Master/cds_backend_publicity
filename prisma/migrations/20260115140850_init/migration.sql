BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PlaylistData] (
    [id] INT NOT NULL CONSTRAINT [PlaylistData_id_df] DEFAULT 1,
    [version] NVARCHAR(1000) NOT NULL,
    [rawJson] NVARCHAR(1000) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PlaylistData_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PlaylistData_version_key] UNIQUE NONCLUSTERED ([version])
);

-- CreateTable
CREATE TABLE [dbo].[Media] (
    [id] NVARCHAR(1000) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [checksum] NVARCHAR(1000) NOT NULL,
    [isDownloaded] BIT NOT NULL CONSTRAINT [Media_isDownloaded_df] DEFAULT 0,
    [localPath] NVARCHAR(1000) NOT NULL,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Media_filename_key] UNIQUE NONCLUSTERED ([filename])
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
