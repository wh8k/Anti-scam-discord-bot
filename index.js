require('dotenv').config();
const { client } = require('./src/bot');
const fs = require('fs');
const path = require('path');

// Ensure data dir exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

client.login(process.env.DISCORD_TOKEN);
