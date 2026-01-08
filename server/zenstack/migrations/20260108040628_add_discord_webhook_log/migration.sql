-- CreateTable
CREATE TABLE "discord_webhook_event_log" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_webhook_event_log_pkey" PRIMARY KEY ("id")
);
