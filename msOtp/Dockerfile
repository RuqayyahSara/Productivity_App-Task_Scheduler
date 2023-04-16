FROM node:19.9.0
WORKDIR /msOtp
COPY package.json /msOtp
RUN npm install
COPY . /msOtp
EXPOSE 5500
CMD npm start
