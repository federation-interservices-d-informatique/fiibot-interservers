import { ClientEvents } from "discord.js";

export interface EventData {
    type: keyof ClientEvents;
    name: string;
    callback: (...args: unknown[]) => void;
}

export interface MessageCloneData {
    channelId: string;
    id: string;
}
