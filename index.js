import "dotenv/config";
import { WebhookClient } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { schedule } from "node-cron";

async function getToken(clientId, clientSecret) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
  });
  return await response.json();
}

async function getShowEpisodes(accessToken, showId) {
  // https://developer.spotify.com/documentation/web-api/reference/get-a-shows-episodes
  const response = await fetch(
    `https://api.spotify.com/v1/shows/${showId}/episodes?limit=1`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  return await response.json();
}

async function checkForNewEpisodes() {
  let response = await getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
  let showEpisodes = await getShowEpisodes(response.access_token, process.env.SPOTIFY_SHOW_ID);
  if (showEpisodes.items.length < 1) {
    console.log("No Item found");
    return;
  }
  console.log(showEpisodes.items[0]);
  if (existsSync("./lastCheckedId")) {
    const lastId = readFileSync("./lastCheckedId", "utf8");
    console.log(
      `Last ID: ${lastId}; Current ID: ${showEpisodes.items[0].id}`,
    );
    if (lastId.trim() == showEpisodes.items[0].id) {
      console.log(
        `Not posting because the ID ${showEpisodes.items[0].id} was already posted the last time, the script was run!`,
      );
      return;
    }
  }
  let webhookUrls = process.env.DISCORD_WEBHOOK_URLS.split(",");
  let pingEveryones = process.env.PING_EVERYONE.split(",");
  for (let i = 0; i < webhookUrls.length; i++) {
    const client = new WebhookClient({
      url: webhookUrls[i],
    });
    if (pingEveryones[i].toLowerCase() == "true") {
      client.send({
        content: `@everyone\n\n${showEpisodes.items[0].name}\n\n${showEpisodes.items[0].description}\n\n${showEpisodes.items[0].external_urls.spotify}`,
      });
    } else {
      client.send({
        content: `${showEpisodes.items[0].name}\n\n${showEpisodes.items[0].description}\n\n${showEpisodes.items[0].external_urls.spotify}`,
      });
    }
  }
  writeFileSync("./lastCheckedId", showEpisodes.items[0].id);
}

console.log(`Schedule worker for cron "${process.env.SPOTIFY_CRON}"`);
schedule(process.env.SPOTIFY_CRON, async () => {
  await checkForNewEpisodes();
},
{
  scheduled: true,
  timezone: process.env.SPOTIFY_TIMEZONE
});
