import { readFile } from "fs/promises";
import { InterServerClient } from "./classes/InterServerClient.js";
import { existsSync } from "fs";
import { ActivityType, GatewayIntentBits, WebhookClient } from "discord.js";
import { getDirname } from "@federation-interservices-d-informatique/fiibot-common";

const rootDir = getDirname(import.meta.url);

const client = new InterServerClient(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    },
    {
        managersSettings: {
            interactionsManagerSettings: {
                interactionsPaths: [`${rootDir}/commands`]
            },
            eventsManagerSettings: {
                eventsPaths: [`${rootDir}/events`]
            }
        },
        token: process.env.BOT_TOKEN ?? ""
    }
);

// Load all events and set presence
client.on("ready", async () => {
    client.user?.setPresence({
        activities: [
            {
                name: "copier des messages",
                type: ActivityType.Playing
            }
        ]
    });
});

// Send migrations logs in production
client.on("ready", async () => {
    if (
        process.env.NODE_ENV === "production" &&
        existsSync("/tmp/migrations.log")
    ) {
        client.logger.info("Sending migration logs", "READY");
        const hookClient = new WebhookClient({
            id: process.env.LOGS_WEBHOOK_ID ?? "INVALID",
            token: process.env.LOGS_WEBHOOK_TOKEN ?? "INVALID"
        });

        try {
            await hookClient.send({
                content: "Migrations logs:",
                files: [
                    {
                        attachment: await readFile("/tmp/migrations.log"),
                        name: "migrations.log"
                    }
                ]
            });
        } catch (e) {
            console.error(e);
        }
    }
});
