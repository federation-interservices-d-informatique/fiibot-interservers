import { Message, TextChannel } from "discord.js";
import { InterServerClient } from "../classes/InterServerClient";
import { MessageCloneData } from "../typings";

export const deleteMessage = async (msg: Message) => {
    const client = msg.client as InterServerClient;
    const originalDbMsg = await client.prisma.message.findUnique({
        where: {
            id: msg.id
        }
    });
    if (originalDbMsg) {
        await client.prisma.message.delete({ where: { id: msg.id } });

        for (const clone of originalDbMsg.clones as unknown as MessageCloneData[]) {
            try {
                const channel = client.channels.cache.get(
                    clone.channelId
                ) as TextChannel | undefined;
                const message = await channel?.messages.fetch(clone.id).catch(() => undefined);
                if (!message) return;
                if (message.deletable) await message.delete();
            } catch (e) {
                if (e instanceof Error)
                    client.logger.error(
                        `Can't delete message ${clone.id} in ${clone.channelId} (${e})`,
                        "MESSAGEDELETE"
                    );
            }
        }
    } else {
        const cloneDbMsg = await client.prisma.message.findFirst({
            where: {
                clones: {
                    array_contains: [
                        {
                            id: msg.id,
                            channelId: msg.channelId
                        }
                    ]
                }
            }
        });
        if (!cloneDbMsg) return;

        await client.prisma.message.deleteMany({
            where: {
                clones: {
                    array_contains: [{ id: msg.id, channelId: msg.channelId }]
                }
            }
        });

        for (const clone of cloneDbMsg.clones as unknown as MessageCloneData[]) {
            if (clone.id === msg.id) continue;
            try {
                const channel = client.channels.cache.get(
                    clone.channelId
                ) as TextChannel | undefined;
                const message = await channel?.messages.fetch(clone.id);
                if (!message) continue;
                if (message.deletable) await message.delete();
            } catch (e) {
                if (e instanceof Error)
                    client.logger.error(
                        `Can't delete message ${clone.id} in ${clone.channelId}: ${e}`,
                        "DELETECLONES"
                    );
            }
        }
        try {
            const originalChan = client.channels.cache.get(
                cloneDbMsg.channelId
            ) as TextChannel | undefined;
            const originalMsg = await originalChan?.messages.fetch(
                cloneDbMsg.id
            );
            if (originalMsg?.deletable)
                await originalMsg.delete();
        } catch (e) {
            if (e instanceof Error)
                client.logger.error(
                    `Can't delete original message ${cloneDbMsg.id} in ${cloneDbMsg.channelId} ${e}`,
                    "DELETECLONES"
                );
        }
    }
};
