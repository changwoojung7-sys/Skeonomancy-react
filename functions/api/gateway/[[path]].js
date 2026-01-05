export async function onRequest(context) {
    const { request, params } = context;
    const pathSegments = params.path;

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    const cleanPath = pathSegments.join('/');
    const targetUrl = `https://gateway.ai.cloudflare.com/v1/${cleanPath}`;

    // Clone headers
    const proxyHeaders = new Headers(request.headers);

    // Debug: Check if key exists
    const hasKey = proxyHeaders.has("x-goog-api-key");
    const keyLen = hasKey ? proxyHeaders.get("x-goog-api-key").length : 0;

    // STRIP BROWSER IDENTIFIERS
    proxyHeaders.delete("Host");
    proxyHeaders.delete("Origin");
    proxyHeaders.delete("Referer");
    proxyHeaders.delete("Cookie");
    proxyHeaders.delete("Connection");

    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Create new response to add debug headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Debug-Proxy", "v3-Key-Check");
        newHeaders.set("X-Debug-Key-Status", hasKey ? `Present-Len-${keyLen}` : "Missing");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
