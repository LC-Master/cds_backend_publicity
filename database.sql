USE [master];
GO

-- 1. Crear la Base de Datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CDS_DB')
BEGIN
    CREATE DATABASE [CDS_DB];
END
GO

USE [CDS_DB];
GO

BEGIN TRY
    BEGIN TRAN;

    -- 2. Tabla SyncState (Configuración y estado de sincronización)
    IF OBJECT_ID(N'[dbo].[SyncState]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[SyncState] (
            [id] INT NOT NULL CONSTRAINT [SyncState_id_df] DEFAULT 1,
            [syncing] BIT NOT NULL CONSTRAINT [SyncState_syncing_df] DEFAULT 0,
            [syncStartedAt] DATETIME2,
            [syncVersion] NVARCHAR(255),
            [status] NVARCHAR(255),
            [errorMessage] NVARCHAR(MAX),
            [createdAt] DATETIME2 NOT NULL CONSTRAINT [SyncState_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
            [communicationKey] NVARCHAR(255),
            [communicationKeyWasSended] BIT NOT NULL CONSTRAINT [SyncState_communicationKeyWasSended_df] DEFAULT 0,
            [updatedAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT [SyncState_pkey] PRIMARY KEY CLUSTERED ([id])
        );
    END

    -- 3. Tabla PlaylistData (JSON de la lista de reproducción)
    IF OBJECT_ID(N'[dbo].[PlaylistData]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[PlaylistData] (
            [id] INT NOT NULL CONSTRAINT [PlaylistData_id_df] DEFAULT 1,
            [version] NVARCHAR(255) NOT NULL,
            [rawJson] NVARCHAR(MAX) NOT NULL,
            [updatedAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT [PlaylistData_pkey] PRIMARY KEY CLUSTERED ([id]),
            CONSTRAINT [PlaylistData_version_key] UNIQUE NONCLUSTERED ([version])
        );
    END

    -- 4. Tabla Media (Archivos descargados y rutas)
    IF OBJECT_ID(N'[dbo].[Media]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[Media] (
            [id] NVARCHAR(150) NOT NULL, -- Soporta el uuid() de Prisma
            [filename] NVARCHAR(500) NOT NULL,
            [checksum] NVARCHAR(500) NOT NULL,
            [errorCount] INT,
            [status] NVARCHAR(50) NOT NULL CONSTRAINT [Media_status_df] DEFAULT 'pending',
            [isDownloaded] BIT NOT NULL CONSTRAINT [Media_isDownloaded_df] DEFAULT 0,
            [localPath] NVARCHAR(MAX) NOT NULL,
            [updatedAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id])
        );
    END

    -- 5. Tabla ApiKey (Tokens de acceso)
    IF OBJECT_ID(N'[dbo].[ApiKey]', N'U') IS NULL
    BEGIN
        CREATE TABLE [dbo].[ApiKey] (
            [id] INT NOT NULL CONSTRAINT [ApiKey_id_df] DEFAULT 1,
            [key] NVARCHAR(500) NOT NULL,
            [createdAt] DATETIME2 NOT NULL CONSTRAINT [ApiKey_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
            [updatedAt] DATETIME2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT [ApiKey_pkey] PRIMARY KEY CLUSTERED ([id]),
            CONSTRAINT [ApiKey_key_key] UNIQUE NONCLUSTERED ([key])
        );
    END

    -- 6. Índice para Media (Optimización de búsqueda)
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'Media_id_filename_idx' AND object_id = OBJECT_ID('dbo.Media'))
    BEGIN
        CREATE NONCLUSTERED INDEX [Media_id_filename_idx] ON [dbo].[Media]([id], [filename]);
    END

    COMMIT TRAN;
    PRINT '✅ Estructura de base de datos verificada con éxito.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrorMessage, 16, 1);
END CATCH;