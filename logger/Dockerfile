FROM node:10
WORKDIR /var/app
COPY /package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["npm", "start"]