import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Media proxy route to bypass Google Drive iframe cookie and CORS restrictions
  const mediaProxyHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { url, id } = req.query;
      let targetUrl = "";

      if (id) {
        targetUrl = `https://docs.google.com/uc?export=download&id=${id}`;
      } else if (typeof url === 'string') {
        targetUrl = url;
      }

      if (!targetUrl) {
        res.status(400).send("Missing url or id parameter");
        return;
      }

      const isHead = req.method === "HEAD";

      // Always use GET for fetch to Google Drive as Google Drive does not support HEAD properly (returns 405 or 403)
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      if (!response.ok) {
        res.status(response.status).send(`Failed to fetch media: ${response.statusText}`);
        return;
      }

      let contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentDisposition = response.headers.get("content-disposition") || "";

      // Smart fallback: if content-type is application/octet-stream, check filename extension in content-disposition
      if (contentType === "application/octet-stream") {
        const cdLower = contentDisposition.toLowerCase();
        if (cdLower.includes('.mp3') || cdLower.includes('.wav') || cdLower.includes('.ogg') || cdLower.includes('.m4a') || cdLower.includes('.aac')) {
          contentType = "audio/mpeg";
        } else if (cdLower.includes('.png') || cdLower.includes('.jpg') || cdLower.includes('.jpeg') || cdLower.includes('.gif') || cdLower.includes('.webp')) {
          contentType = "image/jpeg";
        }
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");

      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        res.setHeader("Content-Length", contentLength);
      }

      if (isHead) {
        // Abort/Cancel the stream in Node.js fetch to avoid downloading the remaining bytes
        if (response.body) {
          try {
            await response.body.cancel();
          } catch (e) {
            // Ignore cancel error
          }
        }
        res.end();
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error: any) {
      console.error("Media proxy error:", error);
      res.status(500).send(`Internal media proxy error: ${error.message}`);
    }
  };

  app.get("/api/proxy-audio", mediaProxyHandler);
  app.head("/api/proxy-audio", mediaProxyHandler);
  app.get("/api/proxy-media", mediaProxyHandler);
  app.head("/api/proxy-media", mediaProxyHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
