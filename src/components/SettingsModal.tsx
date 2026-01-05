import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GatewayConfig } from '../types';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: GatewayConfig;
    onSave: (config: GatewayConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
    const [localConfig, setLocalConfig] = React.useState(config);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localConfig);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <div className="card w-full max-w-md pointer-events-auto bg-mystic-dark border-mystic-purple">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl text-mystic-gold font-serif">Cloudflare AI Gateway Settings</h3>
                                <button onClick={onClose} className="text-mystic-silver hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-mystic-silver mb-1">Account ID</label>
                                    <input
                                        type="text"
                                        value={localConfig.accountId}
                                        onChange={(e) => setLocalConfig({ ...localConfig, accountId: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g. 8f9a..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Found in your Cloudflare Dashboard URL.</p>
                                </div>

                                <div>
                                    <label className="block text-sm text-mystic-silver mb-1">Gateway Name</label>
                                    <input
                                        type="text"
                                        value={localConfig.gatewayName}
                                        onChange={(e) => setLocalConfig({ ...localConfig, gatewayName: e.target.value })}
                                        className="input-field"
                                        placeholder="calamus-ai-gateway"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button type="submit" className="btn-primary w-full py-2">
                                        Save Configuration
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
