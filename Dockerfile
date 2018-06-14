# ---------------------Dockerfile used front end-------------------------
FROM node:9.0.0

RUN node -v
RUN npm -v

# ----------------------Ember Web App------------------------------------
# Create app directories
RUN mkdir -p /usr/src/epilepsy_ember
WORKDIR /usr/src/epilepsy_ember

# Bundle app sources
COPY . /usr/src/epilepsy_ember

# install app dependencies
RUN npm install
RUN npm rebuild node-sass --force

# build react app
RUN npm run-script build

EXPOSE 4200

# Run server
CMD ["npm", "start"]

## ---------------------- The End -----------------------------------------
