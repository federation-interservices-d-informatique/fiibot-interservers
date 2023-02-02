import { Colors, Embed, Message } from "discord.js";

/**
 * Creates a "reply" embed
 * @param {Message} [reference] The referenced message
 */
export function makeReplyEmbed(reference: Message): Embed {
    return {
        author: {
            iconURL: reference.author.displayAvatarURL(),
            name: `En réponse à ${reference.author.username}`
        },
        description: `>>> ${reference.cleanContent}`,
        color: Colors.Blue
    } as Embed;
}
