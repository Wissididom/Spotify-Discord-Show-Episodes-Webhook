# Spotify-Discord-Show-Episodes-Webhook

## Prerequisites

NodeJS v18+

## How to setup

### Step 1

Clone this repository

`git clone https://github.com/Wissididom/Spotify-Discord-Show-Episodes-Webhook`

### Step 2

Copy `example.env` into `.env` and adjust it's values. Optionally you can also provide the options inside `example.env` with the correct values as environment variables to the application.

### Step 3

Install dependencies

`npm i` or `npm install`

### Step 4

Run it with `node index.js` or specify it to run as a cronjob every 24h. The script ONLY checks once if the latest episode of a show was not already posted. If it wasn't it post it to Discord, else it just prints it to console including the info why it didn't post it to Discord. It does NOT run itself every 24h.
