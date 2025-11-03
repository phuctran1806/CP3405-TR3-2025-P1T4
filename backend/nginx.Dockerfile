# nginx.Dockerfile
FROM nginx:1.27-alpine

# Copy your custom config to serve images
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
