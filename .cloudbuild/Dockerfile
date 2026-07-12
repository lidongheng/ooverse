FROM nginx:1.31.2

RUN pwd
ADD ooverse /usr/local/nginx/html/ooverse/
RUN ls -l /usr/local/nginx/html
RUN whoami

CMD ["./sbin/nginx", "-g", "daemon off;"]