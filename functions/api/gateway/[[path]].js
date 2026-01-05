export async function onRequest(context) {
    const { request, params } = context;
    const pathSegments = params.path;

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    const cleanPath = pathSegments.join('/');
    // Base URL
    let targetUrl = `https://gateway.ai.cloudflare.com/v1/${cleanPath}`;

    // Clone headers
    const proxyHeaders = new Headers(request.headers);

    // EXTRACT KEY AND MOVE TO URL QUERY PARAM
    // Strategy: Headers can be fickle through proxies. URL params are robust.
    const googleKey = proxyHeaders.get("x-goog-api-key");
    if (googleKey) {
        // Check if URL already has params
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${separator}key=${encodeURIComponent(googleKey)}`;

        // Remove from header to avoid duplication/confusion
        proxyHeaders.delete("x-goog-api-key");
    }

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
        newHeaders.set("X-Debug-Proxy", "v4-QueryParam");
        newHeaders.set("X-Debug-Key-Moved", googleKey ? "Yes" : "No-Input");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
