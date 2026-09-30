"""Local dev server with caching turned off, so edits show up on a normal refresh.

Usage: python3 serve.py [port]   (default 8000)
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f"Serving on http://localhost:{port}", flush=True)
ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
