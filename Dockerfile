FROM denoland/deno:2.4.5
WORKDIR /app
COPY . .
RUN deno install
RUN deno cache main.ts
USER deno
CMD ["run", "-ERWN", "main.ts"]
