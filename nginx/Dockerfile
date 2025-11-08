FROM nginx:alpine

# Remove default content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx.conf into container
COPY nginx.conf /etc/nginx/nginx.conf

# Disable default server conf to avoid serving /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf || true

# Expose default HTTP port
EXPOSE 80

# Install curl and add healthcheck for readiness
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fs http://localhost/ || exit 1