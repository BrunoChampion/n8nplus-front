'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, Clock, Plus, Search, Webhook, Mail, Terminal, BarChart3, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { n8nApi } from '../lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const WorkflowsView: React.FC = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        n8nApi.getWorkflows().then(data => {
            setWorkflows(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch workflows', err);
            setLoading(false);
        });
    }, []);

    const activeWorkflows = workflows.filter(w => w.active).length;
    const totalWorkflows = workflows.length;
    // Mock usage calculation: $0.05 per active workflow + $0.001 per node
    const estimatedMonthlyUsage = (activeWorkflows * 0.50 + workflows.reduce((acc, w) => acc + (w.nodes?.length || 0) * 0.05, 0)).toFixed(2);

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            <header className="h-16 flex items-center justify-between px-8 bg-surface border-b border-border shrink-0">
                <h1 className="text-xl font-semibold text-white">Workflows Dashboard</h1>
                <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all">
                        <Plus className="w-4 h-4" /> New Workflow
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-secondary">Total Workflows</span>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Webhook className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">{totalWorkflows}</div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-secondary">Active Now</span>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <Zap className="w-4 h-4 text-green-500" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">{activeWorkflows}</div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-secondary">Total Nodes</span>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Terminal className="w-4 h-4 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                            {workflows.reduce((acc, w) => acc + (w.nodes?.length || 0), 0)}
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-secondary">Monthly Usage</span>
                            <div className="p-2 bg-pink-500/10 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-pink-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">${estimatedMonthlyUsage}</div>
                    </div>
                </div>

                {/* Workflows Table */}
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h2 className="font-semibold text-white">All Workflows</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black/20">
                                    <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Workflow Name</th>
                                    <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Nodes</th>
                                    <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Last Modified</th>
                                    <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">Loading workflows...</td>
                                    </tr>
                                ) : workflows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">No workflows found.</td>
                                    </tr>
                                ) : workflows.map((workflow) => (
                                    <tr key={workflow.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/30">
                                                    {workflow.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-white">{workflow.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                workflow.active ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", workflow.active ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
                                                {workflow.active ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {workflow.nodes?.length || 0} nodes
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-text-secondary">
                                                {new Date(workflow.updatedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all text-text-secondary">
                                                <Play className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkflowsView;
