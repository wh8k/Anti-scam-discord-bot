const { Client, GatewayIntentBits, Partials, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const db = require('./db');
const { isScamLink, isNsfwLink } = require('./detector');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once('ready', () => {
  console.log(`[AntiScam] Online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const content = message.content;
  const scam = isScamLink(content);
  const nsfw = isNsfwLink(content);

  if (!scam && !nsfw) return;

  const reason = scam ? 'Scam link detected' : 'NSFW Discord invite detected';
  const type = scam ? 'SCAM' : 'NSFW';

  try {
    await message.delete();
  } catch {}

  const member = message.member;
  if (!member) return;

  // Don't touch server owner or admins
  if (
    member.id === message.guild.ownerId ||
    member.permissions.has(PermissionFlagsBits.Administrator)
  ) return;

  let banned = false;
  try {
    await member.ban({ reason, deleteMessageSeconds: 86400 });
    banned = true;
  } catch (e) {
    console.error(`[AntiScam] Ban failed: ${e.message}`);
  }

  const logChannelId = db.getLogChannel(message.guild.id);
  let logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;

  if (!logChannel) {
    logChannel = await ensureLogChannel(message.guild);
  }

  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor(type === 'SCAM' ? 0xff4444 : 0xff8800)
    .setTitle(`🚫 ${type} DETECTED`)
    .addFields(
      { name: 'User', value: `${message.author.tag} (${message.author.id})`, inline: true },
      { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
      { name: 'Action', value: banned ? '✅ Banned + Message Deleted' : '⚠️ Message Deleted (ban failed)', inline: false },
      { name: 'Reason', value: reason, inline: false },
      { name: 'Content', value: `\`\`\`${content.slice(0, 900)}\`\`\``, inline: false },
    )
    .setTimestamp();

  await logChannel.send({ embeds: [embed] }).catch(() => {});
});

async function ensureLogChannel(guild) {
  const logChannelId = db.getLogChannel(guild.id);
  if (logChannelId) {
    const existing = guild.channels.cache.get(logChannelId);
    if (existing) return existing;
  }

  try {
    const ch = await guild.channels.create({
      name: 'antiscam-logs',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
      reason: 'AntiScam bot log channel',
    });
    db.setLogChannel(guild.id, ch.id);
    return ch;
  } catch (e) {
    console.error(`[AntiScam] Could not create log channel: ${e.message}`);
    return null;
  }
}

// Slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) &&
      interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({ content: 'Admin only.', ephemeral: true });
  }

  const { commandName } = interaction;

  if (commandName === 'setlogchannel') {
    const channel = interaction.options.getChannel('channel');
    db.setLogChannel(interaction.guild.id, channel.id);
    return interaction.reply({ content: `✅ Log channel set to <#${channel.id}>`, ephemeral: true });
  }

  if (commandName === 'createlogchannel') {
    const ch = await ensureLogChannel(interaction.guild);
    return interaction.reply({ content: ch ? `✅ Log channel: <#${ch.id}>` : '❌ Failed to create channel.', ephemeral: true });
  }

  if (commandName === 'status') {
    const logChannelId = db.getLogChannel(interaction.guild.id);
    return interaction.reply({
      content: logChannelId ? `✅ Active — logs → <#${logChannelId}>` : '⚠️ No log channel set. Use /setlogchannel or /createlogchannel.',
      ephemeral: true,
    });
  }
});

module.exports = { client };
