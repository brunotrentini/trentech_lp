const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname.split("/").some((part) => part.startsWith("."))) {
      res.writeHead(404).end("Not found");
      return;
    }

    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      res.writeHead(404).end("Not found");
      return;
    }

    let stat = await fs.promises.stat(file);
    if (stat.isDirectory()) {
      file = path.join(file, "index.html");
      stat = await fs.promises.stat(file);
    }
    if (!stat.isFile()) throw new Error("Not a file");

    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": types[path.extname(file)] || "application/octet-stream"
    });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(3010, () => console.log("TRENTECH dev server: http://localhost:3010"));
