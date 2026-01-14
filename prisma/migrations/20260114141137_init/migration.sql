BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Campaign] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000),
    [department] NVARCHAR(1000),
    [agreement] NVARCHAR(1000),
    [copy] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL,
    [start_at] DATETIME2 NOT NULL,
    [end_at] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Campaign_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Campaign_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Media] (
    [id] NVARCHAR(1000) NOT NULL,
    [filename] NVARCHAR(1000) NOT NULL,
    [durationSeconds] INT,
    [local_path] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Media_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CampaignMedia] (
    [id] NVARCHAR(1000) NOT NULL,
    [campaignId] NVARCHAR(1000) NOT NULL,
    [mediaId] NVARCHAR(1000) NOT NULL,
    [slot] NVARCHAR(1000) NOT NULL,
    [position] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CampaignMedia_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CampaignMedia_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CampaignMedia_campaignId_mediaId_slot_key] UNIQUE NONCLUSTERED ([campaignId],[mediaId],[slot])
);

-- AddForeignKey
ALTER TABLE [dbo].[CampaignMedia] ADD CONSTRAINT [CampaignMedia_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[Campaign]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CampaignMedia] ADD CONSTRAINT [CampaignMedia_mediaId_fkey] FOREIGN KEY ([mediaId]) REFERENCES [dbo].[Media]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
