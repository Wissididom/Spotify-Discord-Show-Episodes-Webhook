# Spotify-Discord-Show-Episodes-Webhook

## Archived

This project is now archived, because my current use case doesn't post new
episodes anymore and also, I don't want to pay for a spotify premium account
just to be able to run the tool. I also now deleted my Spotify account so it's
unlikely that I will ever continue working on this project.

## Prerequisites

Deno v2+

## How to setup

### Step 1

Clone this repository

`git clone https://github.com/Wissididom/Spotify-Discord-Show-Episodes-Webhook`

### Step 2

Copy `example.env` into `.env` and adjust its values. Optionally, you can also
provide the options inside `example.env` with the correct values as environment
variables to the application.

### Step 3

Install dependencies

`deno install`

### Step 4

Run it with `deno --env -A index.js`. It is running indefinitly using node-cron
and only checks for new episodes on the given cron schedule from the env
variables
