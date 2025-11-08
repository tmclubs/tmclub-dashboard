FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
