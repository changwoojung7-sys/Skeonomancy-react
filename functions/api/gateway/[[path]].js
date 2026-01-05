export async function onRequest(context) {
    const { request, params } = context;
    const pathSegments = params.path;

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    const cleanPath = pathSegments.join('/');
    const targetUrl = `https://gateway.ai.cloudflare.com/v1/${cleanPath}`;

    // SANITIZED HEADER CONSTRUCTION (Whitelisting Strategy)
    // Instead of copying potentially polluted headers, we only add what we need.
    const proxyHeaders = new Headers();

    // 1. Content-Type (Essential for JSON body)
    const cType = request.headers.get("Content-Type");
    if (cType) proxyHeaders.set("Content-Type", cType);

    // 2. API Key (Read from client request, put into proxy request)
    // Reverting to Header-based auth as it is more standard for "Universal Endpoint".
    const googleKey = request.headers.get("x-goog-api-key");
    if (googleKey) {
        proxyHeaders.set("x-goog-api-key", googleKey);
    } else {
        // If client missed it, check query param just in case? No, stick to header.
        // Log missing key?
    }

    // 3. Set a generic User-Agent to avoid "Missing UA" blocks
    proxyHeaders.set("User-Agent", "Mozilla/5.0 (Cloudflare-Pages-Proxy)");

    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Debug info
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Debug-Proxy", "v5-Sanitized-Headers");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
