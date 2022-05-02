import { getDirname } from "./utils/getdirname.js";
import { readdir, readFile } from "fs/promises";
import { EventData } from "./typings/index.js";
import { InterServerClient } from "./classes/Client.js";
import { existsSync } from "fs";
import { WebhookClient } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = new InterServerClient(
    {
        intents: ["GUILDS", "GUILD_MESSAGES"]
    },
    {
        commandManagerSettings: {
            commandsPath: [`${getDirname(import.meta.url)}/commands`]
        },
        owners: process.env.OWNERS.split(",").map((o) => parseInt(o)),
        token: process.env.BOT_TOKEN
    }
);

// Load all events and set presence
client.on("ready", async () => {
    for (const file of await readdir(`${getDirname(import.meta.url)}/events`)) {
        if (!file.endsWith(".js")) continue;
        const data: EventData = (
            await import(`${getDirname(import.meta.url)}/events/${file}`)
        ).default;
        client.eventManager.registerEvent(data.name, data.type, data.callback);
    }

    await client.user.setPresence({
        activities: [
            {
                name: "copier des messages",
                type: "PLAYING"
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
            id: process.env.LOGS_WEBHOOK_ID,
            token: process.env.LOGS_WEBHOOK_TOKEN
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
