import React, { useState, useEffect } from 'react';
import { Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { SettingsModal } from './components/SettingsModal';
import { analyzeName } from './services/aiGateway';
import type { UserData, GatewayConfig } from './types';

function App() {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<GatewayConfig>(() => {
    const saved = localStorage.getItem('cf_gateway_config');
    // Use Env Vars as initial default if no local storage exists
    return saved ? JSON.parse(saved) : {
      accountId: import.meta.env.VITE_CF_ACCOUNT_ID || '',
      gatewayName: import.meta.env.VITE_CF_GATEWAY_NAME || 'calamus-ai-gateway'
    };
  });

  const handleConfigSave = (newConfig: GatewayConfig) => {
    setConfig(newConfig);
    localStorage.setItem('cf_gateway_config', JSON.stringify(newConfig));
  };

  const handleSubmit = async (data: UserData) => {
    if (!config.accountId) {
      alert("Please configure your Cloudflare Account ID in settings first.");
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const resultText = await analyzeName(data, config);
      setResult(resultText);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다. 설정을 확인하거나 다시 시도해주세요.\n" + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult('');
    setStep('input');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mystic-purple/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mystic-gold/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <header className="relative z-10 w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-mystic-gold/20 rounded-lg">
            <Sparkles className="text-mystic-gold w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">성명학 AI 상담소</h1>
            <p className="text-gray-400 text-sm">당신의 이름에 숨겨진 운명을 읽어드립니다</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://www.calamus.ai.kr/"
            className="text-mystic-silver/80 hover:text-white text-sm transition-colors border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5 hover:border-white/30"
          >
            Calamus 홈으로
          </a>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-mystic-silver hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Settings"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-4xl">
        {step === 'input' ? (
          <div className="w-full">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-mystic-gold mb-2">운명 정보 입력</h2>
              <p className="text-mystic-silver">정확한 분석을 위해 상세한 정보를 입력해주세요.</p>
            </div>
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        ) : (
          <ResultView result={result} onReset={handleReset} />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleConfigSave}
      />
    </div>
  );
}

export default App;
