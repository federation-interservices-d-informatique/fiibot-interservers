-- CreateTable
CREATE TABLE "Frequency" (
    "ownerid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channels" TEXT[],

    CONSTRAINT "Frequency_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "clones" JSONB NOT NULL,
    "frequencyName" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_frequencyName_fkey" FOREIGN KEY ("frequencyName") REFERENCES "Frequency"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
