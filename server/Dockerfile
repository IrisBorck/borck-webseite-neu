FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node server ./server
COPY --chown=node:node src/lib ./src/lib
COPY --chown=node:node src/data ./src/data
USER node
ENV HOST=0.0.0.0 PORT=8787
EXPOSE 8787
CMD ["node", "server/start.mjs"]
