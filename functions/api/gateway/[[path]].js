export async function onRequest(context) {
    const { request, params } = context;

    // [[path]] parameter captures the rest of the URL path as an array
    const pathSegments = params.path;

    // If no path is provided, returning 404 or ignoring
    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    const cleanPath = pathSegments.join('/');
    // Construct the target URL (Cloudflare AI Gateway)
    // Matching the behavior of local Vite proxy: /api/gateway/* -> https://gateway.ai.cloudflare.com/v1/*
    const targetUrl = `https://gateway.ai.cloudflare.com/v1/${cleanPath}`;

    // Create a new request to forward
    // We pass original headers (Auth, Content-Type, etc.)
    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Return the response to the client
        // By re-creating the response, we ensure it's compatible with the worker runtime
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
