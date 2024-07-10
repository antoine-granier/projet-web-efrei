FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate dev

RUN npx prisma migrate

RUN npm run test

RUN npm run build --if-present

EXPOSE 3000

CMD [ "npm", "start" ]
