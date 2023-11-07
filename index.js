import { WebhookClient } from "discord.js";
import * as DotEnv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";

DotEnv.config();

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

getToken(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET).then(
  (response) => {
    getShowEpisodes(response.access_token, process.env.SPOTIFY_SHOW_ID).then(
      async (episodes) => {
        if (episodes.items.length < 1) {
          console.log("No Item found");
          return;
        }
        console.log(episodes.items[0]);
        const client = new WebhookClient({
          url: process.env.DISCORD_WEBHOOK_URL,
        });
        if (existsSync("./lastCheckedId")) {
          const lastId = readFileSync("./lastCheckedId", "utf8");
          console.log(
            `Last ID: ${lastId}; Current ID: ${episodes.items[0].id}`,
          );
          if (lastId == episodes.items[0].id) {
            console.log(
              `Not posting because the ID ${episodes.items[0].id} was already posted the last time, the script was run!`,
            );
            return;
          }
        }
        client.send({
          content: `${episodes.items[0].name}\n\n${episodes.items[0].description}\n\n${episodes.items[0].external_urls.spotify}`,
        });
        writeFileSync("./lastCheckedId", episodes.items[0].id);
      },
    );
  },
);
