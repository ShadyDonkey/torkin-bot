-- CreateTable
CREATE TABLE "user_tracking_entry" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "id" TEXT NOT NULL,
    "discord_user_id" TEXT NOT NULL,
    "tmdb_data" JSONB NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notify_on" TIMESTAMP(3),

    CONSTRAINT "user_tracking_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tracking_setting" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "discord_user_id" TEXT NOT NULL,
    "dm_channel_id" TEXT,
    "dm_failed_count" INTEGER NOT NULL DEFAULT 0,
    "notification_hour" INTEGER NOT NULL DEFAULT 15,

    CONSTRAINT "user_tracking_setting_pkey" PRIMARY KEY ("discord_user_id")
);
