-- Script SQL pour ajouter l'authentification JWT
-- Exécutez ce script sur votre base de données AxiaLivraison

-- 1. Ajouter la colonne DateCreation à la table Utilisateurs
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Utilisateurs]') AND name = 'DateCreation')
BEGIN
    ALTER TABLE [dbo].[Utilisateurs] 
    ADD [DateCreation] datetime2 NOT NULL DEFAULT GETUTCDATE();
END

-- 2. Créer la table RefreshTokens
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefreshTokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RefreshTokens](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Token] [nvarchar](max) NOT NULL,
        [UtilisateurId] [int] NOT NULL,
        [ExpiryDate] [datetime2](7) NOT NULL,
        [CreatedDate] [datetime2](7) NOT NULL,
        [IsRevoked] [bit] NOT NULL DEFAULT 0,
        [RevokedDate] [datetime2](7) NULL,
        [RevokedByIp] [nvarchar](max) NULL,
        [ReplacedByToken] [nvarchar](max) NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    -- Ajouter la clé étrangère
    ALTER TABLE [dbo].[RefreshTokens] 
    ADD CONSTRAINT [FK_RefreshTokens_Utilisateurs_UtilisateurId] 
    FOREIGN KEY([UtilisateurId]) REFERENCES [dbo].[Utilisateurs] ([Id]) ON DELETE CASCADE;

    -- Créer l'index sur UtilisateurId
    CREATE NONCLUSTERED INDEX [IX_RefreshTokens_UtilisateurId] 
    ON [dbo].[RefreshTokens] ([UtilisateurId] ASC);

    -- Créer l'index sur Token pour les recherches rapides
    CREATE NONCLUSTERED INDEX [IX_RefreshTokens_Token] 
    ON [dbo].[RefreshTokens] ([Token] ASC);
END

-- 3. Créer la table BlacklistedTokens
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BlacklistedTokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BlacklistedTokens](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [TokenId] [nvarchar](max) NOT NULL,
        [BlacklistedDate] [datetime2](7) NOT NULL DEFAULT GETUTCDATE(),
        [ExpiryDate] [datetime2](7) NOT NULL,
        [Reason] [nvarchar](max) NULL,
        [UtilisateurId] [int] NULL,
        CONSTRAINT [PK_BlacklistedTokens] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    -- Ajouter la clé étrangère (optionnelle)
    ALTER TABLE [dbo].[BlacklistedTokens] 
    ADD CONSTRAINT [FK_BlacklistedTokens_Utilisateurs_UtilisateurId] 
    FOREIGN KEY([UtilisateurId]) REFERENCES [dbo].[Utilisateurs] ([Id]);

    -- Créer l'index sur UtilisateurId
    CREATE NONCLUSTERED INDEX [IX_BlacklistedTokens_UtilisateurId] 
    ON [dbo].[BlacklistedTokens] ([UtilisateurId] ASC);

    -- Créer l'index sur TokenId pour les recherches rapides
    CREATE NONCLUSTERED INDEX [IX_BlacklistedTokens_TokenId] 
    ON [dbo].[BlacklistedTokens] ([TokenId] ASC);
END

-- 4. Mettre à jour la table __EFMigrationsHistory
IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20250115000000_AddJWTAuthentication')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20250115000000_AddJWTAuthentication', N'9.0.2');
END

PRINT 'Migration JWT Authentication appliquée avec succès!';

-- 5. Vérification des tables créées
SELECT 
    'RefreshTokens' as TableName,
    COUNT(*) as RecordCount
FROM [dbo].[RefreshTokens]
UNION ALL
SELECT 
    'BlacklistedTokens' as TableName,
    COUNT(*) as RecordCount
FROM [dbo].[BlacklistedTokens]
UNION ALL
SELECT 
    'Utilisateurs (avec DateCreation)' as TableName,
    COUNT(*) as RecordCount
FROM [dbo].[Utilisateurs]
WHERE [DateCreation] IS NOT NULL;
