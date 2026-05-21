#!/usr/bin/env python3
"""
Mirror lifewayprograms.org locally.
Usage:
    python3 mirror.py          # crawl & download
    python3 mirror.py --serve  # serve the downloaded mirror on http://localhost:8080
"""

import sys
import os
import re
import time
import urllib.request
import urllib.parse
import urllib.error
import html.parser
import http.server
import threading
from pathlib import Path

BASE_URL = "https://lifewayprograms.org"
OUT_DIR = Path(__file__).parent / "site_mirror"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36"
}


# ── HTML parser ────────────────────────────────────────────────────────────────

class LinkExtractor(html.parser.HTMLParser):
    ASSET_ATTRS = {
        "a": "href", "link": "href", "script": "src",
        "img": "src", "source": "src", "video": "src",
        "audio": "src", "iframe": "src", "form": "action",
    }

    def __init__(self, page_url):
        super().__init__()
        self.page_url = page_url
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        attr = self.ASSET_ATTRS.get(tag.lower())
        if attr and attrs.get(attr):
            abs_url = urllib.parse.urljoin(self.page_url, attrs[attr])
            self.links.append(abs_url)

        # srcset (responsive images)
        if "srcset" in attrs:
            for part in attrs["srcset"].split(","):
                src = part.strip().split()[0]
                if src:
                    self.links.append(urllib.parse.urljoin(self.page_url, src))

    def handle_starttag_end(self, tag, attrs):
        pass


def extract_css_urls(css_text, base_url):
    """Pull url(...) references out of CSS."""
    found = []
    for m in re.finditer(r'url\(\s*["\']?([^)"\']+)["\']?\s*\)', css_text):
        u = m.group(1).strip()
        if u and not u.startswith("data:"):
            found.append(urllib.parse.urljoin(base_url, u))
    return found


# ── File path helpers ──────────────────────────────────────────────────────────

def url_to_local_path(url):
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.lstrip("/")
    if not path or path.endswith("/"):
        path = path + "index.html"
    # query string → bake into filename to avoid collisions
    if parsed.query:
        safe_q = re.sub(r'[^\w=&-]', '_', parsed.query)[:60]
        base, ext = os.path.splitext(path)
        path = f"{base}__{safe_q}{ext}"
    return OUT_DIR / path


def ensure_parent(p: Path):
    p.parent.mkdir(parents=True, exist_ok=True)


# ── Downloader ─────────────────────────────────────────────────────────────────

def fetch(url, retries=2):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=8) as resp:
                content_type = resp.headers.get("Content-Type", "")
                data = resp.read()
                return data, content_type
        except urllib.error.HTTPError as e:
            print(f"  HTTP {e.code}: {url}")
            return None, ""
        except Exception as e:
            if attempt < retries:
                time.sleep(1)
            else:
                print(f"  ERROR {e}: {url}")
                return None, ""


def rewrite_html(html_bytes, page_url):
    """Rewrite absolute URLs to relative local paths."""
    text = html_bytes.decode("utf-8", errors="replace")
    parsed_base = urllib.parse.urlparse(BASE_URL)

    def make_relative(url_str):
        p = urllib.parse.urlparse(url_str)
        if p.netloc and p.netloc != parsed_base.netloc:
            return url_str  # external — leave as-is
        local = url_to_local_path(url_str)
        try:
            return os.path.relpath(local, OUT_DIR)
        except ValueError:
            return url_str

    # Replace href/src/action attributes
    def attr_replacer(m):
        attr = m.group(1)
        quote = m.group(2)
        val = m.group(3)
        abs_url = urllib.parse.urljoin(page_url, val)
        if urllib.parse.urlparse(abs_url).netloc == parsed_base.netloc:
            new_val = make_relative(abs_url)
            return f'{attr}={quote}{new_val}{quote}'
        return m.group(0)

    text = re.sub(
        r'(href|src|action)=(["\'])([^"\']+)\2',
        attr_replacer,
        text,
        flags=re.IGNORECASE,
    )
    return text.encode("utf-8")


# ── Crawler ────────────────────────────────────────────────────────────────────

def get_sitemap_urls():
    """Fetch all URLs from the sitemap index."""
    import re as _re
    sitemap_urls = []
    try:
        req = urllib.request.Request(
            "https://lifewayprograms.org/sitemap_index.xml", headers=HEADERS
        )
        index = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", errors="replace")
        sitemaps = _re.findall(r'<loc>(https://lifewayprograms\.org[^<]+\.xml)</loc>', index)
        for sm in sitemaps:
            try:
                req2 = urllib.request.Request(sm, headers=HEADERS)
                body = urllib.request.urlopen(req2, timeout=10).read().decode("utf-8", errors="replace")
                urls = _re.findall(r'<loc>(https://lifewayprograms\.org[^<]+)</loc>', body)
                sitemap_urls += urls
                print(f"  sitemap {sm.split('/')[-1]}: {len(urls)} URLs")
            except Exception as e:
                print(f"  WARN sitemap {sm}: {e}")
    except Exception as e:
        print(f"  WARN sitemap_index: {e}")
    return sitemap_urls


def crawl():
    OUT_DIR.mkdir(exist_ok=True)
    visited = set()

    print(f"Mirroring {BASE_URL} → {OUT_DIR}\n")
    print("Fetching sitemap URLs...")
    sitemap_urls = get_sitemap_urls()
    print(f"  {len(sitemap_urls)} sitemap URLs found\n")

    queue = [BASE_URL] + sitemap_urls

    while queue:
        url = queue.pop(0)
        # Normalise
        url = url.split("#")[0]  # drop fragments
        if not url.startswith(("http://", "https://")):
            continue
        if url in visited:
            continue
        visited.add(url)

        parsed = urllib.parse.urlparse(url)
        is_same_domain = parsed.netloc == urllib.parse.urlparse(BASE_URL).netloc
        if not is_same_domain:
            continue  # don't crawl external sites

        # Skip WordPress API/feed noise — not useful page content
        skip_prefixes = ("/wp-json/", "/feed/", "/xmlrpc", "?p=", "?feed=", "?rsd")
        if any(parsed.path.startswith(p) or p in url for p in skip_prefixes):
            continue

        local_path = url_to_local_path(url)
        is_html = url.endswith((".html", ".htm")) or parsed.path in ("", "/")
        is_css = url.endswith(".css")

        if local_path.exists():
            if is_html:
                # Re-fetch HTML to extract fresh (non-rewritten) links, but don't re-save
                data, content_type = fetch(url)
                if data:
                    extractor = LinkExtractor(url)
                    extractor.feed(data.decode("utf-8", errors="replace"))
                    for link in extractor.links:
                        link = link.split("#")[0]
                        if link not in visited:
                            queue.append(link)
            print(f"[{len(visited)}] SKIP {url}")
            continue

        print(f"[{len(visited)}] {url}")
        data, content_type = fetch(url)
        if data is None:
            continue

        is_html = is_html or "html" in content_type
        is_css = is_css or "css" in content_type

        ensure_parent(local_path)

        if is_html:
            extractor = LinkExtractor(url)
            extractor.feed(data.decode("utf-8", errors="replace"))
            for link in extractor.links:
                link = link.split("#")[0]
                if link not in visited:
                    queue.append(link)
            data = rewrite_html(data, url)

        elif is_css:
            css_text = data.decode("utf-8", errors="replace")
            for asset_url in extract_css_urls(css_text, url):
                if asset_url not in visited:
                    queue.append(asset_url)

        local_path.write_bytes(data)

    print(f"\nDone. {len(visited)} URLs processed. Files in: {OUT_DIR}")


# ── Local server ───────────────────────────────────────────────────────────────

def serve(port=8080):
    os.chdir(OUT_DIR)
    handler = http.server.SimpleHTTPRequestHandler

    class QuietHandler(handler):
        def log_message(self, fmt, *args):
            pass  # suppress per-request noise

    with http.server.HTTPServer(("", port), QuietHandler) as httpd:
        print(f"Serving mirror at http://localhost:{port}")
        print("Press Ctrl+C to stop.\n")
        httpd.serve_forever()


# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if "--serve" in sys.argv:
        if not OUT_DIR.exists():
            print("No mirror found. Run without --serve first to download the site.")
            sys.exit(1)
        serve()
    else:
        crawl()
        print("\nTo serve locally, run:  python3 mirror.py --serve")
