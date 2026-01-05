export interface UserData {
    name: string;
    hanja: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    birthType: 'solar' | 'lunar';
    concern: string;
}

export interface AnalysisResult {
    fullText: string;
}

export interface GatewayConfig {
    accountId: string;
    gatewayName: string;
    apiKey?: string; // Optional if using Gateway with stored keys, but often needed for client side if not proxied correctly. 
    // However, Cloudflare AI Gateway acts as a proxy. If the provider is OpenAI, we still need an OpenAI key unless it's stored in the Gateway.
    // The screenshot shows "Provider Keys" stored in the Gateway! 
    // So the client just needs to hit the Gateway URL. 
    // Wait, usually AI Gateway requires an API key for the *Gateway* itself if configured, or it passes through headers.
    // If "Provider Keys" are stored (as seen in screenshot), we might not need to send the OpenAI key from the client, 
    // BUT we might need a Cloudflare API Token for the Gateway if it's protected.
    // For this MVP, I'll assume we might need to pass an OpenAI key header if the Gateway doesn't inject it, 
    // OR just the Gateway URL structure is enough if it's open (risky) or IP allowed.
    // The user prompt says: "Provider Keys... Securely use your own provider API keys with AI Gateway without the hassle of managing them in code."
    // This implies the Gateway injects them.
    // So we just need to hit the Gateway URL.
}
