export async function onRequest(context) {
    const { request, params } = context;

    // [[path]] parameter captures the rest of the URL path as an array
    const pathSegments = params.path;

    // If no path is provided, returning 404
    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
        return new Response("Invalid Gateway Path", { status: 400 });
    }

    const cleanPath = pathSegments.join('/');
    const targetUrl = `https://gateway.ai.cloudflare.com/v1/${cleanPath}`;

    // Clone headers to allow modification
    const proxyHeaders = new Headers(request.headers);

    // CRITICAL FIX: Delete the 'Host' header. 
    // If we forward the original Host (e.g. mysite.pages.dev), Cloudflare Gateway rejects it.
    // Using fetch(targetUrl) will automatically set the correct Host (gateway.ai.cloudflare.com).
    proxyHeaders.delete("Host");
    // Also delete Connection/Keep-Alive context headers just in case
    proxyHeaders.delete("Connection");

    const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.body,
    });

    try {
        const response = await fetch(proxyRequest);

        // Return the response to the client
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (err) {
        return new Response(`Gateway Proxy Error: ${err.message}`, { status: 500 });
    }
}
