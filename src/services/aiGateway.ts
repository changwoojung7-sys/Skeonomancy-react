import type { UserData, GatewayConfig } from '../types';

export const analyzeName = async (userData: UserData, config: GatewayConfig): Promise<string> => {
    // Use config if provided (from settings), otherwise fall back to Env Vars, then defaults
    const accountId = config.accountId || import.meta.env.VITE_CF_ACCOUNT_ID || '';
    const gatewayName = config.gatewayName || import.meta.env.VITE_CF_GATEWAY_NAME || 'calamus-ai-gateway';

    // Check for secrets in Env (User asked to put keys in .env)
    // We can support VITE_GOOGLE_AI_KEY or VITE_CF_AUTH_TOKEN
    // CLIENT SIDE KEY LOGIC REMOVED to prevent exposure.
    // The key is now handled server-side.

    if (!accountId) {
        throw new Error("Account ID is missing. Please check Settings or .env file.");
    }

    // URL for Google AI Studio via Cloudflare Gateway
    // Pattern: https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/google-ai-studio/v1beta/models/{model}:{action}
    // Proxy: /api/gateway/google-ai-studio/v1beta/models/gemini-1.5-flash:generateContent
    // Note: Google's API structure is different from OpenAI's. 

    // However, Cloudflare AI Gateway allows "Universal Endpoint" or provider specific.
    // If we want to use the Google Key, we should target the google provider.

    // Switched to 'gemini-1.5-flash' for stability and Gateway compatibility
    const usedModel = 'gemini-1.5-flash';
    // We need to adjust the proxy logic in vite.config.ts to handle this path or just use a generic rewrite
    // Current Proxy: /api/gateway -> https://gateway.ai.cloudflare.com/v1

    // Base URL selection:
    // Always use '/api/gateway' (Relative Path) to avoid CORS.
    // - Development: Handled by vite.config.ts proxy.
    // - Production: Handled by Cloudflare Pages Functions (functions/api/gateway/[[path]].js).
    const baseUrl = '/api/gateway';

    const url = `${baseUrl}/${accountId}/${gatewayName}/google-ai-studio/v1beta/models/${usedModel}:generateContent`;

    // REMOVED CLIENT-SIDE KEY to prevent exposure.
    // The key is now injected securely by the Cloudflare Pages Function (Proxy).

    // Debug info (safe)
    console.log("[Debug] Requesting Analysis:", { url });



    const prompt = `
Role: 20년 경력의 명리학 전문가이자 성명학 상담가.
Context:
- 이름: ${userData.name} (한자: ${userData.hanja})
- 성별: ${userData.gender === 'male' ? '남' : '여'}
- 생년월일시: ${userData.birthDate} ${userData.birthTime} (${userData.birthType})
- 고민/성향: ${userData.concern}

Task: 위 정보를 바탕으로 사주와 이름을 분석하여 심층 상담 결과를 작성하세요.

Response Framework (Markdown format):
### 1. 사주 오행 분석 (The Essence)
- 일간과 계절의 특징을 본인의 기운으로 설명.
- 쉬운 비유 사용.

### 2. 이름의 자원오행과 사주 보완 (Harmony)
- 한자의 오행이 사주의 부족한 점을 어떻게 채우는지 설명.

### 3. 수리길흉 (The Flow)
- 원/형/이/정 4격 풀이.
- 흉수도 긍정적으로 재해석.

### 4. 사용자 맞춤형 삶의 가이드 (Personalized Advice)
- 고민("${userData.concern}")과 연결하여 구체적 조언.
- "스토리텔링" 강화: 성향과 이름의 힘을 연결.

Tone: 다정하고 통찰력 있으며, 신비로운 분위기.
  `.trim();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Headers are clean. API Key is injected by the Server Proxy.

    // Google API Request Body Structure
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `System: 당신은 통찰력 있는 명리학자이자 성명학 전문가입니다.\n\nUser: ${prompt}` }]
            }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Google API Response Structure
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "분석 결과를 불러오지 못했습니다.";
};
