/**
 * Name of the interserver webhook
 */
export const INTERSERVER_WH_NAME = "FIIBOT_INTERSERVEUR";

/**
 * Server emoji names map
 */
export enum SERVERS_HEADERS {
    "622831434427662346" = "<:lpt:970386551945187338> LPT",
    "696156347946762240" = "<:mim:970386612162797638> MIM",
    "456901919344951298" = "<:cli:970386525906948106> CLI",
    "706283053160464395" = "<:hub:970386593405894687> HUB",
    "793993155343024160" = "<:hub:970386593405894687> TEST"
}

export type ServersHeadersKey = keyof typeof SERVERS_HEADERS;
