# The app is a Next.js build (App Router, static export).
# Stage one exports the static site with Next.js; stage two serves the
# export with the same nginx image the pipeline has always used.
# The footer reads NEXT_PUBLIC_BUILD_BRANCH and NEXT_PUBLIC_BUILD_COMMIT
# at build time. They default to empty, which omits the footer's build
# line; the deploy workflow stamps the real values into the kamal
# builder args before it deploys.

FROM node:22-alpine AS build

ARG NEXT_PUBLIC_BUILD_BRANCH=
ARG NEXT_PUBLIC_BUILD_COMMIT=
ENV NEXT_PUBLIC_BUILD_BRANCH=$NEXT_PUBLIC_BUILD_BRANCH
ENV NEXT_PUBLIC_BUILD_COMMIT=$NEXT_PUBLIC_BUILD_COMMIT

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/out /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/50x.html
