import http.server
import socketserver
import os
import time
import sys

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加强制缓存控制头
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "-1")
        # 添加随机时间戳，防止浏览器缓存
        self.send_header("Last-Modified", time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.gmtime()))
        super().end_headers()
    
    def do_GET(self):
        # 添加随机查询参数，防止浏览器缓存
        if self.path.endswith('.html') or self.path.endswith('.js') or self.path.endswith('.css'):
            print(f"请求: {self.path}")
        return super().do_GET()

PORT = 8090
Handler = NoCacheHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\033[1;36m启动服务器在 http://localhost:{PORT}/\033[0m")
    print("\033[1;33m按 Ctrl+C 终止服务器\033[0m")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\033[1;31m服务器已停止\033[0m")
        sys.exit(0)
