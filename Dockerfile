# The app is a static page served by nginx.
# The __ENVIRONMENT__ placeholder in public/index.html is replaced at build time.
# ENVIRONMENT must be "dev" or "prod"; a build without it fails.

FROM nginx:1.27-alpine

ARG ENVIRONMENT
RUN test "$ENVIRONMENT" = "dev" -o "$ENVIRONMENT" = "prod"

COPY public/ /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/50x.html && \
    sed -i "s|__ENVIRONMENT__|$ENVIRONMENT|" /usr/share/nginx/html/index.html
