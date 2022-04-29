import { getDirname } from "./utils/getdirname.js";
import { readdir } from "fs/promises";
import { EventData } from "./typings/index.js";
import { InterServerClient } from "./classes/Client.js";

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

client.on("ready", async () => {
    for (const file of await readdir(`${getDirname(import.meta.url)}/events`)) {
        if (!file.endsWith(".js")) continue;
        const data: EventData = (
            await import(`${getDirname(import.meta.url)}/events/${file}`)
        ).default;
        client.eventManager.registerEvent(data.name, data.type, data.callback);
    }
});
