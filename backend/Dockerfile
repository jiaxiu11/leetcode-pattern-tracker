# Stage 1: dev
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json .
RUN npm install

EXPOSE 3001

CMD ["npx", "nodemon", "server.js"]

# Stage 2: prod
FROM node:20-alpine AS prod

WORKDIR /app

COPY package.json .
RUN npm install

COPY server.js .

EXPOSE 3001

CMD ["node", "server.js"]
