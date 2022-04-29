import { Message } from "discord.js";
import { EventData } from "../typings/index";
import { deleteMessage } from "../utils/deleteMessage.js";

const data: EventData = {
    name: "messageDelete",
    type: "messageDelete",
    callback: async (msg: Message): Promise<void> => {
        await deleteMessage(msg);
    }
};

export default data;
