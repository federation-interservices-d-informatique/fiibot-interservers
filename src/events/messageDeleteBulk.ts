import { clientEvent } from "@federation-interservices-d-informatique/fiibot-common";
import { Message, Snowflake, Collection, PartialMessage } from "discord.js";
import { deleteMessage } from "../utils/deleteMessage.js";

export default clientEvent({
    name: "messageDeleteBulk",
    type: "messageDeleteBulk",
    callback: async (
        messages: Collection<Snowflake, Message | PartialMessage>
    ): Promise<void> => {
        for (const msg of messages.values()) {
            if (msg.partial) await msg.fetch();
            if (!msg.partial) await deleteMessage(msg);
        }
    }
});
