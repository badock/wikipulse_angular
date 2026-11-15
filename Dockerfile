# Build stage. Angular 11 (webpack 4) supports Node 10-14 only: newer Node fails with ERR_OSSL_EVP_UNSUPPORTED.
FROM node:14-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY angular.json tsconfig.json tsconfig.app.json .browserslistrc ./
COPY src/ src/
RUN npx ng build --prod

# Runtime stage: static files served by nginx
FROM nginx:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/wiki-pulse-angular/ /usr/share/nginx/html/
EXPOSE 80
