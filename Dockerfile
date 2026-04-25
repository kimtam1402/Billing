FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm install
RUN npx prisma generate

COPY . .

# THÊM DÒNG NÀY (Thay bằng link MongoDB Atlas thật của bạn)
ENV MONGODB_URI="mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0"
ENV DATABASE_URL="mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0"
ENV NEXTAUTH_SECRET="cinestream-super-secret-key-2024-very-long-string"

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]