FROM node:18.15.0-bullseye AS build


COPY ./ /app/
WORKDIR /app

RUN  npm i && npm run build

ENTRYPOINT [ "" ]


FROM nginx:1.27.0
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html
COPY ci/files/nginx.conf /etc/nginx/conf.d/default.conf