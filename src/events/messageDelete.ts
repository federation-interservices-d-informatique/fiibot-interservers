import { clientEvent } from "@federation-interservices-d-informatique/fiibot-common";
import { Message, PartialMessage } from "discord.js";
import { deleteMessage } from "../utils/deleteMessage.js";

export default clientEvent({
    name: "messageDelete",
    type: "messageDelete",
    callback: async (msg: Message | PartialMessage): Promise<void> => {
        if (msg.partial) await msg.fetch();
        if (!msg.partial) await deleteMessage(msg);
    }
});
