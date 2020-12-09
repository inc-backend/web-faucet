FROM node:10.16.3 AS builder

WORKDIR /app

ENV REACT_APP_API_URL=http://api-faucet

COPY . .

RUN yarn
RUN yarn build

FROM nginx

EXPOSE 80 443

RUN apt-get update && apt-get install -y inotify-tools
#RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html/
COPY --from=builder /app/frontend.conf /etc/nginx/conf.d/

#COPY ./capital/webapp/dist /usr/share/nginx/html/

RUN chmod +r /usr/share/nginx/html/

#COPY ./nginx-docker/tls /etc/tls

#docker build -t poll-vote-app .
# poll-vote-app:latest
#docker run --name autoweb -d -p 80:80 poll-vote-app:latest
