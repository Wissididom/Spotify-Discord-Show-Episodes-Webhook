import { Buffer } from "node:buffer";
import { WebhookClient } from "discord.js";
import { schedule } from "node-cron";

async function fileExists(path: string) {
  try {
    await Deno.lstat(path);
    return true;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw err;
    }
  }
}

async function getToken(clientId: string, clientSecret: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
  });
  return await response.json();
}

async function getShowEpisodes(accessToken: string, showId: string) {
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
  const response = await getToken(
    Deno.env.get("SPOTIFY_CLIENT_ID")!,
    Deno.env.get("SPOTIFY_CLIENT_SECRET")!,
  );
  const showEpisodes = await getShowEpisodes(
    response.access_token,
    Deno.env.get("SPOTIFY_SHOW_ID")!,
  );
  if (showEpisodes.items.length < 1) {
    console.log("No Item found");
    return;
  }
  console.log(showEpisodes.items[0]);
  if (await fileExists("./lastCheckedId")) {
    const lastId = await Deno.readTextFile("./lastCheckedId");
    console.log(`Last ID: ${lastId}; Current ID: ${showEpisodes.items[0].id}`);
    if (lastId.trim() == showEpisodes.items[0].id) {
      console.log(
        `Not posting because the ID ${
          showEpisodes.items[0].id
        } was already posted the last time, the script was run!`,
      );
      return;
    }
  }
  const webhookUrls = Deno.env.get("DISCORD_WEBHOOK_URLS")!.split(",");
  const pingEveryones = Deno.env.get("PING_EVERYONE")!.split(",");
  for (let i = 0; i < webhookUrls.length; i++) {
    const client = new WebhookClient({
      url: webhookUrls[i],
    });
    if (pingEveryones[i].toLowerCase() == "true") {
      client.send({
        content: `@everyone\n\n${showEpisodes.items[0].name}\n\n${
          showEpisodes.items[0].description
        }\n\n${showEpisodes.items[0].external_urls.spotify}`,
      });
    } else {
      client.send({
        content: `${showEpisodes.items[0].name}\n\n${
          showEpisodes.items[0].description
        }\n\n${showEpisodes.items[0].external_urls.spotify}`,
      });
    }
  }
  await Deno.writeTextFile("./lastCheckedId", showEpisodes.items[0].id);
}

if (import.meta.main) {
  console.log(`Schedule worker for cron "${Deno.env.get("SPOTIFY_CRON")}"`);
  schedule(
    Deno.env.get("SPOTIFY_CRON")!,
    async () => {
      await checkForNewEpisodes();
    },
    {
      scheduled: true,
      timezone: Deno.env.get("SPOTIFY_CRON_TIMEZONE"),
    },
  );
}
