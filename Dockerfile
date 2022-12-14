# syntax=docker/dockerfile:1
# FROM node:18-alpine
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install
CMD ["yarn", "start"]
EXPOSE 4000