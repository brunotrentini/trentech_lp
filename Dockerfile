FROM node:24-alpine

WORKDIR /app
COPY . .

USER node
EXPOSE 3010
CMD ["node", "server.js"]
