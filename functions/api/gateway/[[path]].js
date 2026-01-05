export async function onRequest(context) {
    const { request, params, env } = context; // 'env' contains Secret Variables
    const pathSegments = params.path;

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    // 1. SECURE KEY INJECTION
    // Read key from Server Environment (Dashboard -> Settings -> Environment Variables)
    // Variable Name MUST be: GOOGLE_AI_KEY
    const apiKey = env.GOOGLE_AI_KEY;

    if (!apiKey) {
        // If missing, we can't authenticate.
        return new Response("Server Configuration Error: Missing GOOGLE_AI_KEY", { status: 500 });
    }

    // 2. FORCE Gateway Path & Model
    const cleanPath = pathSegments.join('/');
    // Force 1.5-flash just in case frontend sends something else
    let targetPath = cleanPath.replace('gemini-2.5-flash', 'gemini-1.5-flash');
    let targetUrl = `https://gateway.ai.cloudflare.com/v1/${targetPath}`;

    // 3. CONSTRUCT HEADERS
    const proxyHeaders = new Headers();
    const cType = request.headers.get("Content-Type");
    if (cType) proxyHeaders.set("Content-Type", cType);

    // Inject Key (This is safe, server-to-server)
    proxyHeaders.set("x-goog-api-key", apiKey);

    // Generic UA
    proxyHeaders.set("User-Agent", "Mozilla/5.0 (Cloudflare-Pages-Proxy)");

    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders, // Contains Key
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Debug info for Client
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Debug-Proxy", "v8-Secure-Injection");

        // Do NOT log the key status to client to be perfectly safe, 
        // or just say "Injected".
        newHeaders.set("X-Key-Status", "Securely-Injected");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
