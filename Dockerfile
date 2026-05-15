FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm install
RUN npx prisma generate

COPY . .

# Không hard-code các biến env ở đây nữa để tránh lộ mã nguồn
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]