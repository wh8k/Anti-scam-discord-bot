const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set an existing channel for antiscam logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((opt) =>
      opt.setName('channel')
        .setDescription('The channel to send logs to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('createlogchannel')
    .setDescription('Auto-create the antiscam-logs channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check bot status and log channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((c) => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  console.log('Registering slash commands...');
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  console.log('Done.');
})();
