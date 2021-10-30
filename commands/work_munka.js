const { MessageEmbed } = require("discord.js");
const { RandomInt } = require("../utils/random");
const { LocalData } = require("../utils/database");
const { Op } = require("sequelize");
const Config = require("../data/config.json");
const { Time } = require("../utils/time");

module.exports = {
    name: "munka",
    cooldown: { IsOn: true, Time: Time.minute * 5 }, // Time given in milliseconds
    help: {
        arguments: [],
        description: "Egy gyors és kockázatmentes pénzszerzési lehetőség."
    },
    async execute(bot, message, ...args){

        const [data, found] = await LocalData.findCreateFind({
            where: { [Op.and]: { SERVERID: message.guildId, ID: message.author.id } },
            defaults: { SERVERID: message.guildId, ID: message.author.id }
        });

        const payment = RandomInt(Config.Jobs.Work.reward.min, Config.Jobs.Work.reward.max);
        
        const affectedRows = await LocalData.increment(
            { BALANCE: +payment },
            { where: { [Op.and]: {SERVERID: message.guild.id, ID: message.author.id } } }
        );

        if(affectedRows <= 0) return;

        const embed = new MessageEmbed()
            .setTitle("Szorgos dolgozó")
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setDescription("Megjött a várva várt fizetésed.")
            .setTimestamp()
            .setColor(Config.embed.colors.money)
            .addFields(
                [
                    {name: "Fizetésed", value: payment.toLocaleString(), inline: true},
                    {name: "Új egyenleged", value: (data.BALANCE + payment).toLocaleString(), inline: true}
                ]
            )
            .setFooter("Hogy kipihend magad nem használhatod ezt a parancsot 5 percig.\n")


        message.reply({embeds: [embed], ephemeral: true});
    }
};