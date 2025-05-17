FROM denoland/deno:2.3.3
WORKDIR /app
COPY deno.json .
COPY deno.lock .
RUN deno install
USER deno
COPY . .
RUN deno cache main.ts
CMD ["run", "-ERWN", "main.ts"]
