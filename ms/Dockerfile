FROM node:19.9.0
WORKDIR /ms
COPY package.json /ms
RUN npm install
COPY . /ms
EXPOSE 5300
CMD npm start
