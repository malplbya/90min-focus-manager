# 使用官方nginx镜像作为基础镜像
FROM nginx:alpine

# 安装必要工具
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制项目文件到nginx默认目录
COPY index.html .
COPY style.css .
COPY script.js .
COPY manifest.json .
COPY README.md .

# 创建自定义nginx配置
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 设置正确的权限
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/log/nginx

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
