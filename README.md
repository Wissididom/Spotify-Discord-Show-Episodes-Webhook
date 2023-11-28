# Spotify-Discord-Show-Episodes-Webhook

## Prerequisites

NodeJS v18+

## How to setup

### Step 1

Clone this repository

`git clone https://github.com/Wissididom/Spotify-Discord-Show-Episodes-Webhook`

### Step 2

Copy `example.env` into `.env` and adjust its values. Optionally, you can also provide the options inside `example.env` with the correct values as environment variables to the application.

### Step 3

Install dependencies

`npm i` or `npm install`

### Step 4

Run it with `node index.js` or specify it to run as a cronjob every 24 hours. The script ONLY checks once to see which episode of a show is the latest and if it has not already been posted. If it wasn't, it posts it to Discord; otherwise, it just prints it to the console, including the info on why it didn't post it to Discord. It does NOT run itself every 24 hours.
