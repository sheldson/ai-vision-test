import http.server
import socketserver
import os
import time

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

PORT = 8080
Handler = NoCacheHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"服务器运行在 http://localhost:{PORT}")
    print("添加了强制缓存控制，所有文件将从磁盘重新加载")
    httpd.serve_forever()
