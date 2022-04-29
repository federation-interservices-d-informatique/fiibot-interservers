import { Command } from "@federation-interservices-d-informatique/fiibot-common";
import { CommandInteraction } from "discord.js";
import { InterServerClient } from "../classes/Client";

export default class InterserverCommand extends Command {
    declare client: InterServerClient;
    constructor(client: InterServerClient) {
        super(
            client,
            {
                name: "interserver",
                description: "Gestion des interserveurs",
                options: [
                    {
                        type: "SUB_COMMAND",
                        name: "createfreq",
                        description: "Créer une fréquence",
                        options: [
                            {
                                type: "STRING",
                                name: "name",
                                description: "Nom de la fréquence",
                                required: true
                            }
                        ]
                    },
                    {
                        type: "SUB_COMMAND",
                        name: "join",
                        description: "Rejoindre une féquence",
                        options: [
                            {
                                type: "STRING",
                                name: "name",
                                description: "Nom de la fréquence",
                                required: true
                            }
                        ]
                    },
                    {
                        type: "SUB_COMMAND",
                        name: "info",
                        description:
                            "Obtenir les informations sur une fréquence",
                        options: [
                            {
                                type: "STRING",
                                name: "name",
                                description: "Nom de la fréquence",
                                required: true
                            }
                        ]
                    }
                ]
            },
            {
                userPermissions: ["ADMINISTRATOR"],
                guildOnly: true
            }
        );
    }

    async run(interaction: CommandInteraction): Promise<void> {
        if (interaction.options.getSubcommand() === "createfreq") {
            const name = interaction.options.getString("name");

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
                    content: `Nom: ${name}\nCréée par: <@${
                        frequency.ownerid
                    }> (${frequency.ownerid})\nCanaux: ${frequency.channels
                        .map((c) => `<#${c}>`)
                        .join(" ")}`,
                    ephemeral: true
                });
            }
        }
    }
}
