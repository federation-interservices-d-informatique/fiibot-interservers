import { Prisma } from "@prisma/client";
import { Message, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/Client";
import { EventData } from "../typings/eventdata";
import { INTERSERVER_WH_NAME } from "../utils/constants.js";

const data: EventData = {
    name: "messageCreate",
    type: "messageCreate",
    callback: async (msg: Message) => {
        if (msg.partial) await msg.fetch();
        if (msg.author.bot) return;
        const client = msg.client as InterServerClient;

        const freq = await client.prisma.frequency.findFirst({
            where: {
                channels: {
                    has: msg.channelId
                }
            }
        });
        if (!freq) return;

        const clones = [] as Prisma.JsonArray;

        for (const channelId of freq.channels) {
            if (msg.channelId === channelId) continue;
            const channel = client.channels.cache.get(channelId) as TextChannel;
            let webhook = (await channel.fetchWebhooks()).find(
                (wh) => wh.name === INTERSERVER_WH_NAME
            );

            if (!webhook) {
                webhook = await channel.createWebhook(INTERSERVER_WH_NAME, {
                    reason: "Interserveur"
                });
            }

            const whMessage = await webhook.send({
                content:
                    msg.cleanContent.length == 0
                        ? "​" // Invisible char
                        : msg.cleanContent,
                username: `${msg.author.username} - ${msg.guild.name}`,
                avatarURL: msg.author.avatarURL(),
                embeds: msg.embeds,
                allowedMentions: { parse: ["users"] },
                files: msg.attachments.map((attachement) => attachement.url)
            });
            clones.push({ channelId, id: whMessage.id });
        }

        await client.prisma.message.create({
            data: {
                id: msg.id,
                sender: msg.author.id,
                channelId: msg.channelId,
                frequencyName: freq.name,
                guildId: msg.guildId,
                clones
            }
        });
    }
};

export default data;
