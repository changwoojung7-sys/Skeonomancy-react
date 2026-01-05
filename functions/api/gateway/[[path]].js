export async function onRequest(context) {
    const { request, params, env } = context;
    const pathSegments = params.path;

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    // 1. SECURE GOOGLE KEY INJECTION
    const apiKey = env.GOOGLE_AI_KEY;
    if (!apiKey) {
        return new Response("Server Config Error: Missing GOOGLE_AI_KEY", { status: 500 });
    }

    // 2. SECURE CLOUDFLARE GATEWAY TOKEN INJECTION (New!)
    // If the Gateway is protected, we need this token.
    const gatewayToken = env.CF_GATEWAY_TOKEN;

    // RECONSTRUCT PATH (Force 1.5-flash)
    const cleanPath = pathSegments.join('/');
    let targetPath = cleanPath.replace('gemini-2.5-flash', 'gemini-1.5-flash');
    let targetUrl = `https://gateway.ai.cloudflare.com/v1/${targetPath}`;

    // HEADERS
    const proxyHeaders = new Headers();
    const cType = request.headers.get("Content-Type");
    if (cType) proxyHeaders.set("Content-Type", cType);

    // Inject Google Key (For Google Auth)
    proxyHeaders.set("x-goog-api-key", apiKey);

    // Inject Gateway Token (For Cloudflare Auth)
    if (gatewayToken) {
        proxyHeaders.set("cf-aig-authorization", `Bearer ${gatewayToken}`);
    }

    // User Agent
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
        newHeaders.set("X-Debug-Proxy", "v9-Gateway-Auth");
        newHeaders.set("X-Auth-Status", gatewayToken ? "Token-Provided" : "No-Token");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
