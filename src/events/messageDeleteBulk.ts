import { Message, Snowflake, Collection } from "discord.js";
import { EventData } from "../typings";
import { deleteMessage } from "../utils/deleteMessage.js";

const data: EventData = {
    name: "messageDeleteBulk",
    type: "messageDeleteBulk",
    callback: async (
        messages: Collection<Snowflake, Message>
    ): Promise<void> => {
        for (const msg of messages.values()) {
            await deleteMessage(msg);
        }
    }
};

export default data;
