'use client';

import React, { useState, useEffect } from 'react';
import { Bot, LayoutDashboard, Settings2, Cpu, LayoutGrid, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { n8nApi } from '../lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ViewType = 'agent' | 'workflows' | 'config';

interface SidebarProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
    const [workflowCount, setWorkflowCount] = useState<number | null>(null);

    useEffect(() => {
        n8nApi.getWorkflows().then(data => setWorkflowCount(data.length)).catch(() => { });
    }, []);

    const navItems = [
        { id: 'agent' as ViewType, icon: Cpu, label: 'AI Agent', badge: 'New' },
        { id: 'workflows' as ViewType, icon: LayoutGrid, label: 'Workflows', badge: workflowCount?.toString() },
        { id: 'config' as ViewType, icon: Settings, label: 'Configuration' },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between shrink-0 h-screen">
            <div className="flex flex-col flex-1 overflow-hidden p-4">
                <div className="flex items-center gap-3 px-3 py-6 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">n8n <span className="text-primary">+</span></span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                currentView === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-secondary hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    currentView === item.id ? "text-primary" : "text-text-secondary group-hover:text-white"
                                )} />
                                {item.label}
                            </div>
                            {item.badge && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold",
                                    currentView === item.id ? "bg-primary text-white" : "bg-white/5 text-text-secondary group-hover:text-white"
                                )}>
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border-2 border-border shadow-md" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">Bruno Costa</span>
                        <span className="text-[10px] text-text-secondary truncate">Self-hosted Pro</span>
                    </div>
                    <Settings2 className="w-4 h-4 ml-auto text-gray-500 group-hover:text-white transition-colors" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
