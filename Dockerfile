FROM denoland/deno:2.1.9
WORKDIR /app
USER deno
COPY deno.json .
COPY deno.lock .
RUN deno install
COPY . .
RUN deno cache main.ts
CMD ["run", "-ERWN", "main.ts"]
