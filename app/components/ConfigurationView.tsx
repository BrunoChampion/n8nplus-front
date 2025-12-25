'use client';

import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Cpu, Key, Globe, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { settingsApi } from '../lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ConfigurationView: React.FC = () => {
    const [keys, setKeys] = useState({
        N8N_BASE_URL: '',
        N8N_API_KEY: '',
        GEMINI_API_KEY: '',
        MODEL_NAME: 'gemini-3-flash-preview'
    });
    const [showKeys, setShowKeys] = useState({ n8n: false, gemini: false });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        settingsApi.getAll().then(data => {
            if (Object.keys(data).length > 0) {
                setKeys(prev => ({ ...prev, ...data }));
            }
        });
    }, []);

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await settingsApi.update(keys);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 4000);
        } catch (error) {
            console.error('Failed to save settings', error);
            setSaveStatus('idle');
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            <header className="h-16 flex items-center justify-between px-8 bg-surface border-b border-border shrink-0">
                <h1 className="text-xl font-semibold text-white">System Configuration</h1>
                <button
                    onClick={handleSave}
                    disabled={saveStatus !== 'idle'}
                    className={cn(
                        "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                        saveStatus === 'saved' ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"
                    )}
                >
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? (
                        <><CheckCircle2 className="w-4 h-4" /> Saved</>
                    ) : (
                        <><Save className="w-4 h-4" /> Save Configuration</>
                    )}
                </button>
            </header>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Connection Settings */}
                    <section className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Globe className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">n8n Instance</h2>
                                <p className="text-xs text-text-secondary">Connect to your self-hosted n8n environment</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">API Base URL</label>
                                <input
                                    type="text"
                                    value={keys.N8N_BASE_URL}
                                    onChange={(e) => setKeys({ ...keys, N8N_BASE_URL: e.target.value })}
                                    placeholder="https://n8n.your-domain.com"
                                    className="w-full bg-background-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKeys.n8n ? "text" : "password"}
                                        value={keys.N8N_API_KEY}
                                        onChange={(e) => setKeys({ ...keys, N8N_API_KEY: e.target.value })}
                                        placeholder="n8n_api_..."
                                        className="w-full bg-background-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all pr-10"
                                    />
                                    <button
                                        onClick={() => setShowKeys({ ...showKeys, n8n: !showKeys.n8n })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showKeys.n8n ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Settings */}
                    <section className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Cpu className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">AI Engine (Gemini)</h2>
                                <p className="text-xs text-text-secondary">Configure your Google Gemini API access</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Gemini API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKeys.gemini ? "text" : "password"}
                                        value={keys.GEMINI_API_KEY}
                                        onChange={(e) => setKeys({ ...keys, GEMINI_API_KEY: e.target.value })}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-background-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all pr-10"
                                    />
                                    <button
                                        onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Model Version</label>
                                <select
                                    value={keys.MODEL_NAME}
                                    onChange={(e) => setKeys({ ...keys, MODEL_NAME: e.target.value })}
                                    className="w-full bg-background-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="gemini-3-flash-preview">Gemini 3.0 Flash Preview</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Security & Access */}
                    <section className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-teal-500/10 rounded-lg">
                                <ShieldCheck className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Security</h2>
                                <p className="text-xs text-text-secondary">Manage data access and retention</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-background-dark/50 rounded-lg border border-border/50">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Encrypted Storage</h4>
                                    <p className="text-[10px] text-text-secondary">Keys are encrypted using AES-256 before being stored in the database.</p>
                                </div>
                                <div className="w-10 h-5 bg-primary/20 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-background-dark/50 rounded-lg border border-border/50 opacity-50">
                                <div>
                                    <h4 className="text-sm font-medium text-white">Local Node Code Cache</h4>
                                    <p className="text-[10px] text-text-secondary">Speed up node analysis by caching source code locally.</p>
                                </div>
                                <div className="w-10 h-5 bg-gray-800 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-gray-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationView;
