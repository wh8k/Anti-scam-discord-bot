const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/config.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    log_channel_id TEXT
  )
`);

function getLogChannel(guildId) {
  const row = db.prepare('SELECT log_channel_id FROM guild_config WHERE guild_id = ?').get(guildId);
  return row?.log_channel_id ?? null;
}

function setLogChannel(guildId, channelId) {
  db.prepare(`
    INSERT INTO guild_config (guild_id, log_channel_id)
    VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET log_channel_id = excluded.log_channel_id
  `).run(guildId, channelId);
}

module.exports = { getLogChannel, setLogChannel };
