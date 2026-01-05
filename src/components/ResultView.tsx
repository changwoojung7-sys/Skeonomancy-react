import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface ResultViewProps {
    result: string;
    onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl mx-auto space-y-8"
        >
            <div className="card prose prose-invert prose-headings:text-mystic-gold prose-p:text-mystic-text prose-strong:text-white max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            <div className="text-center">
                <button
                    onClick={onReset}
                    className="px-6 py-2 border border-mystic-gold text-mystic-gold rounded-full hover:bg-mystic-gold hover:text-mystic-dark transition-colors"
                >
                    다른 이름 풀이하기
                </button>
            </div>
        </motion.div>
    );
};
