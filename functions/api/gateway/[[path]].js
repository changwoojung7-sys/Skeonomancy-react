export async function onRequest(context) {
    const { request, params } = context;
    const pathSegments = params.path; // Array

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Path", { status: 400 });
    }

    // DETECT GOOGLE MODEL
    // Path usually: [acct, gw, 'google-ai-studio', 'v1', 'models', 'gemini-2.5-flash:generateContent']
    // We need to find the 'models' segment and what follows.
    const modelIndex = pathSegments.indexOf('models');
    let googleUrl = "";

    // Extract API Key
    const googleKey = request.headers.get("x-goog-api-key");

    if (modelIndex !== -1 && modelIndex + 1 < pathSegments.length) {
        const modelPart = pathSegments.slice(modelIndex + 1).join('/'); // 'gemini-2.5-flash:generateContent'
        // Google Direct Endpoint
        googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelPart}`;
    } else {
        // Fallback or Error
        return new Response("Could not parse model from path", { status: 400 });
    }

    if (!googleKey) {
        return new Response("Missing API Key", { status: 401 });
    }

    // Construct Direct Request URL with Key
    const targetUrl = `${googleUrl}?key=${encodeURIComponent(googleKey)}`;

    // Create clean request
    const proxyHeaders = new Headers();
    proxyHeaders.set("Content-Type", "application/json");
    // Don't send User-Agent or Referer to Google to keep it clean. 
    // Google API doesn't require specific UA.

    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Debug info
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Debug-Target", "Google-Direct");
        newHeaders.set("X-Debug-Status", response.status);

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        return new Response(`Direct Proxy Error: ${err.message}`, { status: 500 });
    }
}
