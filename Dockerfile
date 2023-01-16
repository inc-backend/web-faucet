# build environment
FROM node:16 as build
ARG BUILD_ENV=production

WORKDIR /app
COPY package.json ./
COPY yarn.lock* ./
COPY . ./

# https://create-react-app.dev/docs/adding-custom-environment-variables#what-other-env-files-can-be-used
COPY .env.${BUILD_ENV} .env.local

RUN yarn install
RUN yarn build:$BUILD_ENV

# production environment
FROM nginx:stable
COPY --from=build /app/build /usr/share/nginx/html
# new
COPY etc/nginx/nginx-docker.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
