import { BotInteraction } from "@federation-interservices-d-informatique/fiibot-common";
import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    MessageFlags
} from "discord.js";
import { InterServerClient } from "../classes/InterServerClient";

export default class InterserverCommand extends BotInteraction {
    declare client: InterServerClient;
    constructor(client: InterServerClient) {
        super(client, {
            name: "interserver",
            description: "Gestion des interserveurs",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "createfreq",
                    description: "Créer une fréquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "join",
                    description: "Rejoindre une féquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "info",
                    description: "Obtenir les informations sur une fréquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "leave",
                    description: "Quitter une fréquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "deletefreq",
                    description: "Supprimer une fréquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        }
                    ]
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "removechan",
                    description: "Retire un canal d'une fréquence",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "name",
                            description: "Nom de la fréquence",
                            required: true
                        },
                        {
                            type: ApplicationCommandOptionType.String,
                            name: "channel",
                            description: "ID du canal a retirer",
                            required: true
                        }
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: "list",
                    description: "Lister les fréquences qui existent",
                }
            ],
            dmPermission: false,
            defaultMemberPermissions: ["Administrator"],
        });
    }

    async runChatInputCommand(
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        if (interaction.options.getSubcommand() === "createfreq") {
            const name = interaction.options.getString("name");
            if (!name) return;

            const frequency = await this.client.prisma.frequency.findUnique({
                where: {
                    name
                }
            });

            if (frequency) {
                interaction.reply({
                    content: `La fréquence ${name} existe déjà et contient les canaux ${frequency.channels
                        .map((c) => `<#${c}>`)
                        .join(" ")} `,
                    ephemeral: true
                });
                return;
            }

            try {
                await this.client.prisma.frequency.create({
                    data: {
                        name,
                        ownerid: interaction.user.id,
                        channels: [interaction.channelId]
                    }
                });
                interaction.reply({
                    content: `OK! Fréquence ${name} créée!`,
                    ephemeral: true
                });
            } catch (e) {
                this.client.logger.error(
                    `Can't create frequency ${name}: ${e}`,
                    "INTERSERVER"
                );

                interaction.reply({
                    content: `Erreur: ${e}`,
                    ephemeral: true
                });
            }
        } else if (interaction.options.getSubcommand() === "join") {
            const name = interaction.options.getString("name");
            if (!name) return;

            if (
                !(await this.client.prisma.frequency.findUnique({
                    where: { name }
                }))
            ) {
                interaction.reply({
                    content: "La fréquence n'existe pas!",
                    ephemeral: true
                });
            }
            await this.client.prisma.frequency.update({
                where: {
                    name
                },
                data: {
                    channels: {
                        push: interaction.channelId
                    }
                }
            });

            interaction.reply({ content: "OK!", ephemeral: true });
        } else if (interaction.options.getSubcommand() === "info") {
            const name = interaction.options.getString("name");
            if (!name) return;

            const frequency = await this.client.prisma.frequency.findUnique({
                where: { name }
            });

            if (!frequency) {
                interaction.reply({
                    content: "La fréquence n'existe pas!",
                    ephemeral: true
                });
            } else {
                interaction.reply({
                    content: `Nom: ${name}\nCréée par: <@${frequency.ownerid
                        }> (${frequency.ownerid})\nCanaux: ${frequency.channels
                            .map((c) => `<#${c}>`)
                            .join(" ")}`,
                    ephemeral: true
                });
            }
        } else if (interaction.options.getSubcommand() === "leave") {
            const name = interaction.options.getString("name");
            if (!name) return;

            const freq = await this.client.prisma.frequency.findUnique({
                where: {
                    name
                }
            });
            if (!freq) {
                await interaction.reply("La fréquence n'existe pas!");
                return;
            }
            try {
                await this.client.prisma.frequency.update({
                    where: {
                        name
                    },
                    data: {
                        channels: freq.channels.filter(
                            (c) => c !== interaction.channelId
                        )
                    }
                });
                interaction.reply({
                    content: "Ok!",
                    ephemeral: true
                });
            } catch (e) {
                this.client.logger.error(
                    `Can't remove channel from freq: ${e}`
                );
                interaction.reply(`Erreur: ${e}`);
            }
        } else if (interaction.options.getSubcommand() === "deletefreq") {
            const name = interaction.options.getString("name");
            if (!name) return;

            const freq = await this.client.prisma.frequency.findUnique({
                where: {
                    name
                }
            });
            if (!freq) {
                await interaction.reply("La fréquence n'existe pas!");
                return;
            }
            try {
                await this.client.prisma.message.deleteMany({
                    where: { frequencyName: name }
                });
                await this.client.prisma.frequency.deleteMany({
                    where: { name }
                });
                interaction.reply({
                    content: "Ok!",
                    ephemeral: true
                });
            } catch (e) {
                this.client.logger.error(`Can't delete freq: ${e}`);
                interaction.reply(`Erreur: ${e}`);
            }
        } else if (interaction.options.getSubcommand() === "removechan") {
            if (this.client.isOwner(interaction.user)) {
                const name = interaction.options.getString("name")!;
                const channelId = interaction.options.getString("channel")!;
                const freq = await this.client.prisma.frequency.findUnique({
                    where: {
                        name
                    }
                });

                if (!freq) {
                    await interaction.reply("La fréquence n'existe pas!");
                    return;
                }

                try {
                    await this.client.prisma.frequency.update({
                        where: {
                            name
                        },
                        data: {
                            channels: freq.channels.filter(
                                (c) => c !== channelId
                            )
                        }
                    });
                    interaction.reply({
                        content: "Ok!",
                        flags: MessageFlags.Ephemeral
                    });
                } catch (e) {
                    this.client.logger.error(
                        `Can't remove channel from freq: ${e}`
                    );
                    interaction.reply({
                        content: `Erreur: ${e}`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            } else {
                interaction.reply({
                    content: `Vous ne pouvez pas faire ça!`,
                    flags: MessageFlags.Ephemeral
                })
            }
        } else if (interaction.options.getSubcommand() === "list") {
            const frequencies = await this.client.prisma.frequency.findMany()

            interaction.reply({
                flags: MessageFlags.Ephemeral,
                content: `Liste des fréquences existantes:
                
                ${frequencies.map(x =>
                    `* ${x.name}: ${x.channels.map(y => `<#${y}>`).join(' ')}`).join('\n')}`
            })
        }
    }
}
