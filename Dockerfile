FROM node:22
COPY app.js app.js
ENTRYPOINT ["node", "app.js"]
