import os
import json
import uuid
import urllib.request
import urllib.error

# Configuration loader (env vars or .cloudflare_credentials.json)
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cloudflare_credentials.json")
_creds = {}
if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r") as f:
            _creds = json.load(f)
    except Exception:
        pass

ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", _creds.get("account_id", ""))
API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", _creds.get("api_token", ""))
ZONE_ID = os.environ.get("CLOUDFLARE_ZONE_ID", _creds.get("zone_id", ""))
BUCKET_NAME = os.environ.get("CLOUDFLARE_R2_BUCKET", _creds.get("bucket", "agentic"))
SCRIPT_NAME = "agentic-website"

WORKER_CODE = r'''export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    let path = decodeURIComponent(url.pathname);
    if (path === '/' || path === '') {
      path = '/index.html';
    }
    let key = path.startsWith('/') ? path.slice(1) : path;

    // Handle range requests for streaming video/audio and binary downloads
    const rangeHeader = request.headers.get('range');
    const getOptions = rangeHeader ? { range: request.headers, onlyIf: request.headers } : {};

    let object = await env.BUCKET.get(key, getOptions);

    // Fallbacks if not found directly
    if (!object && !key.includes('.')) {
      object = await env.BUCKET.get(key + '.html', getOptions);
      if (!object) object = await env.BUCKET.get(key + '/index.html', getOptions);
    }

    // Fallback for APKs in downloads/ or root
    if (!object) {
      if (key.startsWith('downloads/')) {
        const rootKey = key.replace(/^downloads\//, '');
        object = await env.BUCKET.get(rootKey, getOptions);
      } else if (key.endsWith('.apk')) {
        object = await env.BUCKET.get('downloads/' + key, getOptions);
      }
    }

    // Fallback for favicon
    if (!object && key === 'favicon.ico') {
      object = await env.BUCKET.get('favicon.svg', getOptions);
      if (object) key = 'favicon.svg';
    }

    // SPA fallback for non-file paths
    if (!object && !path.includes('.')) {
      object = await env.BUCKET.get('index.html', getOptions);
      if (object) key = 'index.html';
    }

    if (!object) {
      return new Response('File Not Found in Agentic R2', { 
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('accept-ranges', 'bytes');
    headers.set('access-control-allow-origin', '*');

    if (rangeHeader && object.range) {
      headers.set('content-range', `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`);
      headers.set('content-length', object.range.length.toString());
    } else {
      headers.set('content-length', object.size.toString());
    }

    // MIME mapping & Cache Policies
    const lowerKey = key.toLowerCase();
    if (lowerKey.endsWith('.html')) {
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'public, max-age=0, must-revalidate');
    } else if (lowerKey.endsWith('.js')) {
      headers.set('content-type', 'application/javascript; charset=utf-8');
      headers.set('cache-control', 'public, max-age=3600');
    } else if (lowerKey.endsWith('.css')) {
      headers.set('content-type', 'text/css; charset=utf-8');
      headers.set('cache-control', 'public, max-age=3600');
    } else if (lowerKey.endsWith('.svg')) {
      headers.set('content-type', 'image/svg+xml');
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.png')) {
      headers.set('content-type', 'image/png');
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.jpg') || lowerKey.endsWith('.jpeg')) {
      headers.set('content-type', 'image/jpeg');
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.mp4')) {
      headers.set('content-type', 'video/mp4');
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.mp3')) {
      headers.set('content-type', 'audio/mpeg');
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.apk')) {
      headers.set('content-type', 'application/vnd.android.package-archive');
      const filename = key.split('/').pop();
      headers.set('content-disposition', `attachment; filename="${filename}"`);
      headers.set('cache-control', 'public, max-age=3600');
    } else if (lowerKey.endsWith('.json')) {
      headers.set('content-type', 'application/json; charset=utf-8');
      headers.set('cache-control', 'public, max-age=3600');
    } else if (lowerKey.endsWith('.exe')) {
      headers.set('content-type', 'application/x-msdownload');
      const filename = key.split('/').pop();
      headers.set('content-disposition', `attachment; filename="${filename}"`);
      headers.set('cache-control', 'public, max-age=86400');
    } else if (lowerKey.endsWith('.zip')) {
      headers.set('content-type', 'application/zip');
      const filename = key.split('/').pop();
      headers.set('content-disposition', `attachment; filename="${filename}"`);
      headers.set('cache-control', 'public, max-age=86400');
    }

    if (request.method === 'HEAD') {
      return new Response(null, { headers, status: 200 });
    }

    const status = object.body ? (rangeHeader ? 206 : 200) : 304;
    return new Response(object.body, { headers, status });
  }
};
'''

metadata = {
    "main_module": "worker.js",
    "bindings": [
        {
            "name": "BUCKET",
            "type": "r2_bucket",
            "bucket_name": "agentic"
        }
    ],
    "compatibility_date": "2024-01-01"
}

boundary = "----CloudflareWorkerBoundary" + uuid.uuid4().hex

body = []
# Part 1: metadata
body.append(f"--{boundary}\r\n".encode('utf-8'))
body.append(b'Content-Disposition: form-data; name="metadata"\r\n')
body.append(b'Content-Type: application/json\r\n\r\n')
body.append(json.dumps(metadata).encode('utf-8'))
body.append(b'\r\n')

# Part 2: worker.js
body.append(f"--{boundary}\r\n".encode('utf-8'))
body.append(b'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\r\n')
body.append(b'Content-Type: application/javascript+module\r\n\r\n')
body.append(WORKER_CODE.encode('utf-8'))
body.append(b'\r\n')

body.append(f"--{boundary}--\r\n".encode('utf-8'))

full_body = b''.join(body)

url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/{SCRIPT_NAME}"

req = urllib.request.Request(
    url,
    data=full_body,
    headers={
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    },
    method="PUT"
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Worker deployment result:")
        print(json.dumps(res, indent=2))
        
        if ZONE_ID:
            print(f"Purging cache for zone {ZONE_ID}...")
            purge_url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache"
            purge_req = urllib.request.Request(
                purge_url,
                data=json.dumps({"purge_everything": True}).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {API_TOKEN}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(purge_req) as p_resp:
                p_res = json.loads(p_resp.read().decode("utf-8"))
                print("Cache purge result:", json.dumps(p_res, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
