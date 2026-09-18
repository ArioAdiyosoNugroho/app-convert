const MAX_TIMEOUT_MS = 25000;

export default async function handler(req, res) {
  const setStatus = (code) => {
    if (res.status) res.status(code);
    else res.statusCode = code;
    return res;
  };
  const sendJson = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    setStatus(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    setStatus(405);
    sendJson({ error: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      setStatus(400);
      sendJson({ error: "Invalid JSON body" });
      return;
    }
  }

  const {
    url,
    method = "GET",
    headers = {},
    data,
    params,
    responseType,
  } = body || {};

  if (!url || typeof url !== "string") {
    setStatus(400);
    sendJson({ error: "Missing target url" });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(url);
    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
  } catch (e) {
    setStatus(400);
    sendJson({ error: "Invalid target url" });
    return;
  }

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    });
  }

  const fetchHeaders = { ...headers };
  delete fetchHeaders["host"];
  delete fetchHeaders["Host"];
  delete fetchHeaders["content-length"];
  delete fetchHeaders["Content-Length"];

  const fetchOptions = {
    method: String(method).toUpperCase(),
    headers: fetchHeaders,
  };

  if (data !== undefined && !["GET", "HEAD"].includes(fetchOptions.method)) {
    fetchOptions.body = typeof data === "string" ? data : JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);
  fetchOptions.signal = controller.signal;

  try {
    const upstream = await fetch(targetUrl.toString(), fetchOptions);
    clearTimeout(timeoutId);

    const contentType = upstream.headers.get("content-type") || "";
    const isBinary =
      responseType === "arraybuffer" ||
      /image|video|audio|octet-stream|font/.test(contentType);

    const responseHeaders = Object.fromEntries(upstream.headers.entries());

    if (isBinary) {
      const buf = Buffer.from(await upstream.arrayBuffer());
      setStatus(200);
      sendJson({
        status: upstream.status,
        headers: responseHeaders,
        data: buf.toString("base64"),
        encoding: "base64",
      });
      return;
    }

    const text = await upstream.text();
    setStatus(200);
    sendJson({
      status: upstream.status,
      headers: responseHeaders,
      data: text,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const message =
      err.name === "AbortError"
        ? "Upstream request timed out."
        : err.message || "Proxy request failed.";
    setStatus(502);
    sendJson({ error: message });
  }
}
