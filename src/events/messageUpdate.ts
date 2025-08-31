import {
    clientEvent,
    SERVERS_HEADERS,
    ServersHeadersKey
} from "@federation-interservices-d-informatique/fiibot-common";
import { Message, MessageType, PartialMessage, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/InterServerClient";
import { MessageCloneData } from "../typings";
import { INTERSERVER_WH_NAME } from "../utils/constants.js";
import { makeReplyEmbed } from "../utils/embeds.js";

export default clientEvent({
    name: "messageUpdate",
    type: "messageUpdate",
    callback: async (
        _oldmessage: Message | PartialMessage,
        newmessage: Message | PartialMessage
    ): Promise<void> => {
        if (newmessage.partial) await newmessage.fetch();
        if (newmessage.partial) return;
        if (newmessage.author.bot) return;
        if (!newmessage.guild || !newmessage.guildId) return;

        const client = newmessage.client as InterServerClient;
        const dbMessage = await client.prisma.message.findUnique({
            where: { id: newmessage.id }
        });
        if (!dbMessage) return;
        for (const clone of dbMessage.clones as unknown as MessageCloneData[]) {
            const channel = client.channels.cache.get(
                clone.channelId
            ) as TextChannel | undefined;
            if (!channel) continue;
            const webHook = (await channel.fetchWebhooks()).find(
                (hook) => hook.name === INTERSERVER_WH_NAME
            );
            if (webHook) {
                // Handle message replies
                if (newmessage.type === MessageType.Reply) {
                    const reference = (await newmessage.fetchReference().catch(() => undefined));
                    if (!reference) return;

                    newmessage.embeds.push(makeReplyEmbed(reference));
                }
                try {
                    const hookMessage = await webHook.fetchMessage(clone.id);
                    await webHook.editMessage(clone.id, {
                        content:
                            // Check if server prefix is present
                            !hookMessage.content.startsWith(
                                `***${ newmessage.guild.toString() in SERVERS_HEADERS ?
                                    SERVERS_HEADERS[
                                        newmessage.guildId as ServersHeadersKey
                                    ] : `❓ ${newmessage.guild.name}`
                                }***`
                            )
                                ? // Don't re-add prefix
                                  newmessage.cleanContent.length == 0
                                    ? "​" // Invisible char
                                    : newmessage.cleanContent
                                : // Keep prefix in new content
                                  `***${ newmessage.guild.toString() in SERVERS_HEADERS ?
                                    SERVERS_HEADERS[
                                        newmessage.guildId as ServersHeadersKey
                                    ] : `❓ ${newmessage.guild.name}`
                                }***`,
                        embeds: newmessage.embeds,
                        allowedMentions: { parse: ["users"] },
                        files: newmessage.attachments.map(
                            (attachement) => attachement.url
                        )
                    });
                } catch (e: unknown) {
                    if (e instanceof Error)
                        client.logger.error(
                            `Can't edit message webhook message ${clone.id} in ${clone.channelId} (original message ${newmessage.id}): ${e}`,
                            "messageEditHandler"
                        );
                }
            }
        }
    }
});
