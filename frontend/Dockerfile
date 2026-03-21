# Stage 1: dev
FROM node:20-alpine AS dev

WORKDIR /app

COPY package.json .
RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# Stage 2: build (reuses node_modules from dev)
FROM dev AS build

COPY . .

RUN npm run build

# Stage 3: serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
