FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest as builder
USER root
WORKDIR /app
COPY . /app
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest
USER root
WORKDIR /app
COPY package.json /app
COPY app.js /app
COPY --from=builder /app/dist /app/dist
RUN npm install
RUN npm cache clean --force 
RUN chown -R 1001:0 /app
RUN rm -rf /app/.npm
USER 1001
EXPOSE 8080
CMD [ "sh", "-c", "node app.js" ]