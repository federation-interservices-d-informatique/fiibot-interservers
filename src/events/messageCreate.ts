import {
    clientEvent,
    SERVERS_HEADERS,
    ServersHeadersKey
} from "@federation-interservices-d-informatique/fiibot-common";
import { Prisma } from "@prisma/client";
import { Message, MessageType, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/InterServerClient";
import { INTERSERVER_WH_NAME } from "../utils/constants.js";
import { makeReplyEmbed } from "../utils/embeds.js";

export default clientEvent({
    name: "messageCreate",
    type: "messageCreate",
    callback: async (msg: Message) => {
        if (!msg.guild || !msg.guildId) return;
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
                webhook = await channel.createWebhook({
                    name: INTERSERVER_WH_NAME,
                    reason: "Interserveur"
                });
            }

            const lastMessage = (
                await msg.channel.messages.fetch({ limit: 2 })
            ).last();

            // Handle message replies
            if (msg.type === MessageType.Reply) {
                const reference = await msg.fetchReference();
                if (!reference) return;

                msg.embeds.push(makeReplyEmbed(reference));
            }

            const whMessage = await webhook.send({
                content: `${
                    lastMessage?.author.id === msg.author.id &&
                    lastMessage?.guildId === msg.guildId
                        ? ""
                        : `***${
                              SERVERS_HEADERS[
                                  msg.guildId as ServersHeadersKey
                              ] ?? `❓ ${msg.guild.name}`
                          }***`
                }\n${msg.content}`,
                username: msg.author.username,
                avatarURL: msg.author.displayAvatarURL(),
                embeds: msg.embeds,
                allowedMentions: { parse: [] },
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
});
