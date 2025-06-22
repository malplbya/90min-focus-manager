#!/bin/bash

# 90分钟专注管理器 - 管理脚本

PROJECT_DIR="/opt/focus-manager"
CONTAINER_NAME="focus-manager"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}90分钟专注管理器 - 管理工具${NC}"
    echo ""
    echo "使用方法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     - 启动服务"
    echo "  stop      - 停止服务"
    echo "  restart   - 重启服务"
    echo "  status    - 查看服务状态"
    echo "  logs      - 查看实时日志"
    echo "  update    - 更新应用"
    echo "  backup    - 备份数据"
    echo "  monitor   - 实时监控"
    echo "  cleanup   - 清理无用镜像"
    echo "  help      - 显示此帮助信息"
}

# 检查服务状态
check_status() {
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✅ 服务正在运行${NC}"
        return 0
    else
        echo -e "${RED}❌ 服务未运行${NC}"
        return 1
    fi
}

# 启动服务
start_service() {
    echo -e "${BLUE}🚀 启动服务...${NC}"
    cd $PROJECT_DIR
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服务启动成功${NC}"
        show_access_info
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
    fi
}

# 停止服务
stop_service() {
    echo -e "${BLUE}🛑 停止服务...${NC}"
    cd $PROJECT_DIR
    docker-compose down
    echo -e "${GREEN}✅ 服务已停止${NC}"
}

# 重启服务
restart_service() {
    echo -e "${BLUE}🔄 重启服务...${NC}"
    stop_service
    sleep 2
    start_service
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 服务状态:${NC}"
    cd $PROJECT_DIR
    docker-compose ps
    echo ""
    
    if check_status; then
        echo -e "${BLUE}🌐 访问信息:${NC}"
        show_access_info
        
        echo -e "${BLUE}📈 资源使用:${NC}"
        docker stats $CONTAINER_NAME --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    fi
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📝 实时日志 (按 Ctrl+C 退出):${NC}"
    cd $PROJECT_DIR
    docker-compose logs -f
}

# 更新应用
update_app() {
    echo -e "${BLUE}🔄 更新应用...${NC}"
    cd $PROJECT_DIR
    
    # 备份当前版本
    echo -e "${YELLOW}💾 备份当前版本...${NC}"
    docker-compose down
    
    # 重新构建
    echo -e "${BLUE}🏗️ 重新构建镜像...${NC}"
    docker-compose build --no-cache
    
    # 启动新版本
    echo -e "${BLUE}🚀 启动新版本...${NC}"
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 更新完成${NC}"
        show_access_info
    else
        echo -e "${RED}❌ 更新失败${NC}"
    fi
}

# 备份数据
backup_data() {
    BACKUP_DIR="/backup/focus-manager"
    DATE=$(date +%Y%m%d_%H%M%S)
    
    echo -e "${BLUE}💾 备份数据...${NC}"
    mkdir -p $BACKUP_DIR
    
    # 备份配置文件
    tar -czf $BACKUP_DIR/config_$DATE.tar.gz -C $PROJECT_DIR docker-compose.yml Dockerfile docker/
    
    # 备份日志
    if [ -d "$PROJECT_DIR/logs" ]; then
        tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C $PROJECT_DIR logs/
    fi
    
    # 清理旧备份（保留7天）
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    
    echo -e "${GREEN}✅ 备份完成: $BACKUP_DIR${NC}"
}

# 实时监控
monitor_service() {
    echo -e "${BLUE}📊 实时监控 (按 Ctrl+C 退出):${NC}"
    echo ""
    
    while true; do
        clear
        echo -e "${BLUE}=== 90分钟专注管理器 - 实时监控 ===${NC}"
        echo ""
        
        # 服务状态
        if check_status; then
            echo -e "${GREEN}状态: 运行中${NC}"
        else
            echo -e "${RED}状态: 停止${NC}"
        fi
        
        echo ""
        
        # 容器统计
        echo -e "${BLUE}资源使用:${NC}"
        docker stats $CONTAINER_NAME --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" 2>/dev/null || echo "容器未运行"
        
        echo ""
        
        # 访问统计
        if [ -f "$PROJECT_DIR/logs/access.log" ]; then
            echo -e "${BLUE}今日访问量:${NC}"
            today=$(date +%d/%b/%Y)
            grep "$today" $PROJECT_DIR/logs/access.log | wc -l
            
            echo -e "${BLUE}最近访问:${NC}"
            tail -5 $PROJECT_DIR/logs/access.log | cut -d' ' -f1,4,7 | sed 's/\[//g'
        fi
        
        echo ""
        echo -e "${YELLOW}更新时间: $(date)${NC}"
        sleep 5
    done
}

# 清理无用镜像
cleanup_images() {
    echo -e "${BLUE}🧹 清理无用镜像...${NC}"
    docker image prune -f
    docker container prune -f
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 显示访问信息
show_access_info() {
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')
    echo "  本地访问: http://localhost"
    if [ ! -z "$SERVER_IP" ]; then
        echo "  外网访问: http://$SERVER_IP"
    fi
}

# 主逻辑
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_app
        ;;
    backup)
        backup_data
        ;;
    monitor)
        monitor_service
        ;;
    cleanup)
        cleanup_images
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}未知命令: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
