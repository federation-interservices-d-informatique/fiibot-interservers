import { clientEvent } from "@federation-interservices-d-informatique/fiibot-common";
import {
    Message,
    Snowflake,
    ReadonlyCollection,
    PartialMessage,
    GuildTextBasedChannel
} from "discord.js";
import { deleteMessage } from "../utils/deleteMessage.js";

export default clientEvent({
    name: "messageDeleteBulk",
    type: "messageDeleteBulk",
    callback: async (
        messages: ReadonlyCollection<Snowflake, Message | PartialMessage>,
        _: GuildTextBasedChannel
    ): Promise<void> => {
        for (const msg of messages.values()) {
            if (msg.partial) await msg.fetch();
            if (!msg.partial) await deleteMessage(msg);
        }
    }
});
