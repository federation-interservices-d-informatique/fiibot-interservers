import {
    FiiClient,
    FiiClientOptions
} from "@federation-interservices-d-informatique/fiibot-common";
import Prisma from "@prisma/client";

import { ClientOptions } from "discord.js";

export class InterServerClient extends FiiClient {
    declare prisma: Prisma.PrismaClient;
    constructor(options: ClientOptions, fiiOptions: FiiClientOptions) {
        super(options, fiiOptions);

        this.prisma = new Prisma.PrismaClient();
    }
}
