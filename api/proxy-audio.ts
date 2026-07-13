import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const id = urlObj.searchParams.get('id');
    const url = urlObj.searchParams.get('url');
    
    let targetUrl = "";
    if (id) {
      targetUrl = `https://docs.google.com/uc?export=download&id=${id}`;
    } else if (url) {
      targetUrl = url;
    }

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end("Missing url or id parameter");
      return;
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });

    if (!response.ok) {
      res.writeHead(response.status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Failed to fetch media: ${response.statusText}`);
      return;
    }

    let contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";

    // Fallback detection
    if (contentType === "application/octet-stream") {
      const cdLower = contentDisposition.toLowerCase();
      if (cdLower.includes('.mp3') || cdLower.includes('.wav') || cdLower.includes('.ogg') || cdLower.includes('.m4a') || cdLower.includes('.aac')) {
        contentType = "audio/mpeg";
      } else if (cdLower.includes('.png') || cdLower.includes('.jpg') || cdLower.includes('.jpeg') || cdLower.includes('.gif') || cdLower.includes('.webp')) {
        contentType = "image/jpeg";
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Content-Length": buffer.length.toString()
    });
    res.end(buffer);
  } catch (error: any) {
    console.error("Vercel proxy-audio error:", error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal media proxy error: ${error.message}`);
  }
}
