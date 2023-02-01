import { clientEvent } from "@federation-interservices-d-informatique/fiibot-common";
import { Message, PartialMessage, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/InterServerClient";
import { MessageCloneData } from "../typings";
import {
    INTERSERVER_WH_NAME,
    ServersHeadersKey,
    SERVERS_HEADERS
} from "../utils/constants.js";

export default clientEvent({
    name: "messageUpdate",
    type: "messageUpdate",
    callback: async (
        oldmessage: Message | PartialMessage,
        newmessage: Message | PartialMessage
    ): Promise<void> => {
        if (newmessage.partial) await newmessage.fetch();
        if (newmessage.partial) return;
        if (newmessage.author?.bot) return;
        if (!newmessage.guild || !newmessage.guildId) return;

        const client = newmessage.client as InterServerClient;
        const dbMessage = await client.prisma.message.findUnique({
            where: { id: newmessage.id }
        });
        if (!dbMessage) return;
        for (const clone of dbMessage.clones as unknown as Array<MessageCloneData>) {
            const channel = client.channels.cache.get(
                clone.channelId
            ) as TextChannel;
            if (!channel) continue;
            const webHook = (await channel.fetchWebhooks()).find(
                (hook) => hook.name === INTERSERVER_WH_NAME
            );
            if (webHook) {
                const replyEmbed = oldmessage.embeds.find((e) =>
                    e.title?.startsWith("En réponse à")
                );
                if (replyEmbed) {
                    newmessage.embeds.push(replyEmbed);
                }
                try {
                    const hookMessage = await webHook.fetchMessage(clone.id);
                    webHook.editMessage(clone.id, {
                        content:
                            // Check if server prefix is present
                            !hookMessage?.content.startsWith(
                                `***${
                                    SERVERS_HEADERS[
                                        newmessage.guildId as ServersHeadersKey
                                    ] ?? `❓ ${newmessage.guild.name}`
                                }***`
                            )
                                ? // Don't re-add prefix
                                  newmessage.cleanContent.length == 0
                                    ? "​" // Invisible char
                                    : newmessage.cleanContent
                                : // Keep prefix in new content
                                  `***${
                                      SERVERS_HEADERS[
                                          newmessage.guildId as ServersHeadersKey
                                      ] ?? `❓ ${newmessage.guild.name}`
                                  }***\n${newmessage.content}`,
                        embeds: newmessage.embeds,
                        allowedMentions: { parse: ["users"] },
                        files: newmessage.attachments.map(
                            (attachement) => attachement.url
                        )
                    });
                } catch (e) {
                    client.logger.error(
                        `Can't edit message webhook message ${clone.id} in ${clone.channelId} (original message ${newmessage.id})`,
                        "messageEditHandler"
                    );
                }
            }
        }
    }
});
