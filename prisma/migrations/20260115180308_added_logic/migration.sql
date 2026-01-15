BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Media] ALTER COLUMN [localPath] NVARCHAR(max) NOT NULL;
ALTER TABLE [dbo].[Media] ADD [errorCount] INT,
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [Media_status_df] DEFAULT 'pending';

-- AlterTable
ALTER TABLE [dbo].[PlaylistData] ALTER COLUMN [rawJson] NVARCHAR(max) NOT NULL;

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
