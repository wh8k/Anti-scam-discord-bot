const SCAM_PATTERNS = [
  /discord\.gift\/[a-zA-Z0-9]+/i,
  /discordgift\.site/i,
  /discord-nitro\./i,
  /nitro-discord\./i,
  /free-nitro\./i,
  /discordapp\.com\/gifts\//i,
  /steamcommunity\.com\/tradeoffer\//i,
  /steam-trade\./i,
  /steamtrade\./i,
  /free-steam\./i,
  /\bfreecsgoskins\b/i,
  /\bcryptodrops?\b/i,
  /\bairdrop.*claim\b/i,
  /\bclaim.*airdrop\b/i,
  /bit\.ly\/[a-zA-Z0-9]+/i,
  /tinyurl\.com\//i,
  /rb\.gy\//i,
  /cutt\.ly\//i,
  /is\.gd\//i,
  /t\.co\//i,
  /gg\/[a-zA-Z0-9]+/,
];

const NSFW_DISCORD_PATTERNS = [
  /discord\.gg\/[a-zA-Z0-9]+/i,
  /discord\.com\/invite\/[a-zA-Z0-9]+/i,
  /dsc\.gg\//i,
  /disboard\.org\/server\/join\//i,
];

const NSFW_KEYWORDS = [
  /\bnsfw\b/i,
  /\b18\+\b/i,
  /\bporn\b/i,
  /\bnudes?\b/i,
  /\bxxx\b/i,
  /\bhentai\b/i,
  /\bonlyfans\b/i,
  /\bleaked\b/i,
  /\bsextape\b/i,
];

const URL_REGEX = /https?:\/\/[^\s]+/gi;

function extractUrls(text) {
  return text.match(URL_REGEX) || [];
}

function isScamLink(content) {
  return SCAM_PATTERNS.some((p) => p.test(content));
}

function isNsfwLink(content) {
  const urls = extractUrls(content);
  if (!urls.length) return false;

  const hasDiscordInvite = NSFW_DISCORD_PATTERNS.some((p) => p.test(content));
  if (!hasDiscordInvite) return false;

  return NSFW_KEYWORDS.some((p) => p.test(content));
}

module.exports = { isScamLink, isNsfwLink };
