FROM node:boron-alpine

RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN npm install yarn

RUN yarn

ADD . /usr/app

ENV PORT 3000
EXPOSE 3000

CMD [ "yarn", "start" ]