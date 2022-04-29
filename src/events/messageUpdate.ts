import { Message, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/Client";
import { EventData, MessageCloneData } from "../typings";
import { INTERSERVER_WH_NAME } from "../utils/constants.js";

const data: EventData = {
    name: "messageUpdate",
    type: "messageUpdate",
    callback: async (
        oldmessage: Message,
        newmessage: Message
    ): Promise<void> => {
        if (newmessage.partial) await newmessage.fetch();
        if (newmessage.author.bot) return;
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
                try {
                    webHook.editMessage(clone.id, {
                        content:
                            newmessage.cleanContent.length == 0
                                ? "​" // Invisible char
                                : newmessage.cleanContent,
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
};

export default data;
