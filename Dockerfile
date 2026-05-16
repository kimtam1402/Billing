FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "node scripts/seed.js && npx next start -H 0.0.0.0 -p 3000"]