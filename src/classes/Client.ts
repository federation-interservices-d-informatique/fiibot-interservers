import {
    fiiClient,
    fiiClientOptions
} from "@federation-interservices-d-informatique/fiibot-common";
import Prisma from "@prisma/client";

import { ClientOptions } from "discord.js";

export class InterServerClient extends fiiClient {
    declare prisma: Prisma.PrismaClient;
    constructor(options: ClientOptions, fiiOptions: fiiClientOptions) {
        super(options, fiiOptions);

        this.prisma = new Prisma.PrismaClient();
    }
}
