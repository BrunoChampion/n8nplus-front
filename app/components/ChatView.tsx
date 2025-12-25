'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, Send, Search, Code2, Boxes, Key, MoreVertical, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = 'http://localhost:3001';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

interface AgentStatus {
    type: 'thinking' | 'tool_call' | 'tool_result' | 'responding' | 'complete' | 'error';
    message: string;
    toolName?: string;
    timestamp: number;
}

// Status message mappings for more user-friendly display
const getStatusDisplay = (status: AgentStatus): string => {
    switch (status.type) {
        case 'thinking':
            return status.message;
        case 'tool_call':
            const toolDisplayNames: Record<string, string> = {
                'search_nodes': 'Searching for nodes...',
                'get_node_details': 'Getting node details...',
                'get_node_parameters': 'Fetching node parameters...',
                'get_node_output_schema': 'Analyzing output schema...',
                'list_trigger_nodes': 'Finding trigger nodes...',
                'list_workflows': 'Listing workflows...',
                'get_workflow': 'Loading workflow...',
                'create_workflow': 'Creating workflow...',
                'update_workflow': 'Updating workflow...',
                'delete_workflow': 'Deleting workflow...',
                'execute_workflow': 'Executing workflow...',
                'activate_workflow': 'Activating workflow...',
                'deactivate_workflow': 'Deactivating workflow...',
                'list_executions': 'Checking executions...',
                'get_execution': 'Getting execution details...',
                'manage_variable': 'Managing variables...',
            };
            return toolDisplayNames[status.toolName || ''] || `Using ${status.toolName}...`;
        case 'tool_result':
            return `Completed: ${status.toolName}`;
        case 'responding':
            return 'Generating response...';
        case 'complete':
            return 'Done!';
        case 'error':
            return status.message;
        default:
            return 'Processing...';
    }
};

// Shine animation component
const ShineStatus: React.FC<{ status: AgentStatus | null; isTyping: boolean }> = ({ status, isTyping }) => {
    // Show default message if typing but no status received yet
    const displayText = status ? getStatusDisplay(status) : (isTyping ? 'Connecting to AI...' : '');
    
    if (!isTyping && !status) return null;
    
    return (
        <div className="relative overflow-hidden bg-surface/80 backdrop-blur-sm border border-primary/30 px-4 py-3 rounded-2xl rounded-tl-none min-w-[200px]">
            {/* Shine effect overlay */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-white/90 font-medium transition-all duration-300">{displayText}</span>
            </div>
        </div>
    );
};

// Markdown content component for AI responses
const MarkdownContent: React.FC<{ content: string; isStreaming?: boolean }> = ({ content, isStreaming }) => {
    return (
        <div className="markdown-content prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom styling for code blocks
                    code: ({ className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match;
                        
                        if (isInline) {
                            return (
                                <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary font-mono text-xs" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        
                        return (
                            <div className="relative my-3">
                                <div className="absolute top-0 left-0 px-2 py-1 text-[10px] text-text-secondary bg-black/50 rounded-tl rounded-br">
                                    {match[1]}
                                </div>
                                <pre className="bg-black/40 p-4 pt-8 rounded-lg overflow-x-auto">
                                    <code className="text-xs font-mono text-gray-300" {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        );
                    },
                    // Custom styling for links
                    a: ({ children, href, ...props }: any) => (
                        <a 
                            href={href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                            {...props}
                        >
                            {children}
                        </a>
                    ),
                    // Custom styling for lists
                    ul: ({ children, ...props }: any) => (
                        <ul className="list-disc list-inside space-y-1 my-2" {...props}>{children}</ul>
                    ),
                    ol: ({ children, ...props }: any) => (
                        <ol className="list-decimal list-inside space-y-1 my-2" {...props}>{children}</ol>
                    ),
                    // Custom styling for headings
                    h1: ({ children, ...props }: any) => (
                        <h1 className="text-lg font-bold mt-4 mb-2 text-white" {...props}>{children}</h1>
                    ),
                    h2: ({ children, ...props }: any) => (
                        <h2 className="text-base font-bold mt-3 mb-2 text-white" {...props}>{children}</h2>
                    ),
                    h3: ({ children, ...props }: any) => (
                        <h3 className="text-sm font-bold mt-2 mb-1 text-white" {...props}>{children}</h3>
                    ),
                    // Paragraphs
                    p: ({ children, ...props }: any) => (
                        <p className="my-2 leading-relaxed" {...props}>{children}</p>
                    ),
                    // Blockquotes
                    blockquote: ({ children, ...props }: any) => (
                        <blockquote className="border-l-2 border-primary/50 pl-3 my-2 italic text-text-secondary" {...props}>
                            {children}
                        </blockquote>
                    ),
                    // Tables
                    table: ({ children, ...props }: any) => (
                        <div className="overflow-x-auto my-3">
                            <table className="min-w-full border border-border rounded" {...props}>{children}</table>
                        </div>
                    ),
                    th: ({ children, ...props }: any) => (
                        <th className="bg-surface px-3 py-2 text-left text-xs font-semibold border-b border-border" {...props}>{children}</th>
                    ),
                    td: ({ children, ...props }: any) => (
                        <td className="px-3 py-2 text-xs border-b border-border/50" {...props}>{children}</td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
            {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            )}
        </div>
    );
};

const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: 'assistant', content: "Hello! I'm your n8n AI agent. I can help you research nodes, create workflows, review workflows, etc. What would you like to do today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<AgentStatus | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentStatus]);

    // Setup SSE connection for status updates
    useEffect(() => {
        const connectSSE = () => {
            const eventSource = new EventSource('http://localhost:3001/ai/status');
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const status: AgentStatus = JSON.parse(event.data);
                    console.log('[SSE] Status:', status);
                    setCurrentStatus(status);
                    
                    // Clear status after completion or error
                    if (status.type === 'complete' || status.type === 'error') {
                        setTimeout(() => setCurrentStatus(null), 1500);
                    }
                } catch (e) {
                    console.error('[SSE] Parse error:', e);
                }
            };

            eventSource.onerror = (error) => {
                console.error('[SSE] Connection error:', error);
                eventSource.close();
                // Reconnect after 3 seconds
                setTimeout(connectSSE, 3000);
            };
        };

        connectSSE();

        return () => {
            eventSourceRef.current?.close();
        };
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = input;
        setInput('');
        setIsTyping(true);

        // Create a placeholder message for streaming
        const assistantMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { 
            id: assistantMessageId, 
            role: 'assistant', 
            content: '', 
            isStreaming: true 
        }]);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            console.log('[Chat] Sending message with streaming:', messageToSend.substring(0, 50));
            
            const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageToSend, history }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No reader available');
            }

            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        console.log('[Chat] Received SSE data:', data.substring(0, 100));
                        if (data === '[DONE]') {
                            console.log('[Chat] Stream complete, fullContent length:', fullContent.length);
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            console.log('[Chat] Parsed data:', { hasToken: !!parsed.token, tokenLength: parsed.token?.length });
                            if (parsed.token) {
                                fullContent += parsed.token;
                                console.log('[Chat] Updated fullContent, new length:', fullContent.length);
                                setMessages(prev => prev.map(m => 
                                    m.id === assistantMessageId 
                                        ? { ...m, content: fullContent }
                                        : m
                                ));
                            }
                        } catch (e) {
                            console.log('[Chat] JSON parse error for line:', line);
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

            // Mark streaming as complete
            setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                    ? { ...m, isStreaming: false }
                    : m
            ));

        } catch (error) {
            console.error('[Chat] Streaming error:', error);
            // Update the placeholder message with error
            setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                    ? { ...m, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
                    : m
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden h-full">
            <header className="h-16 flex items-center justify-between px-8 bg-surface border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold text-white">n8n AI Agent</h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-text-secondary font-medium">Gemini 2.0 Flash</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
                {messages.map((message) => {
                    // Hide empty streaming messages (they show status indicator instead)
                    if (message.isStreaming && !message.content) {
                        return null;
                    }
                    
                    return (
                        <div
                            key={message.id}
                            className={cn(
                                "flex w-full",
                                message.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] flex gap-3",
                                message.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold",
                                    message.role === 'user' ? "bg-primary text-white" : "bg-surface border border-border text-primary"
                                )}>
                                    {message.role === 'user' ? 'U' : 'AI'}
                                </div>
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                    message.role === 'user'
                                    ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10"
                                    : "bg-surface border border-border text-white rounded-tl-none shadow-sm"
                            )}>
                                    {message.role === 'assistant' ? (
                                        <MarkdownContent content={message.content} isStreaming={message.isStreaming} />
                                    ) : (
                                        message.content
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Status indicator with shine animation - show when typing and no content yet */}
                {isTyping && !messages.some(m => m.isStreaming && m.content) && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                <Cpu className="w-4 h-4 text-primary" />
                            </div>
                            <ShineStatus status={currentStatus} isTyping={isTyping} />
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="px-8 py-6 bg-background">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { icon: Search, label: "Search nodes" },
                            { icon: Code2, label: "Review node code" },
                            { icon: Boxes, label: "Explain workflow" },
                            { icon: Key, label: "Check API status" }
                        ].map((tool, i) => (
                            <button
                                key={i}
                                className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:border-primary/50 hover:bg-primary/5 rounded-full text-xs text-text-secondary hover:text-primary transition-all group"
                            >
                                <tool.icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                {tool.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask anything about your n8n workflows..."
                            rows={1}
                            className="w-full bg-surface border border-border group-hover:border-primary/50 focus:border-primary rounded-xl px-4 py-3.5 pr-14 text-sm text-white focus:outline-none transition-all resize-none shadow-sm"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isTyping}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:bg-gray-600"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-text-secondary">
                        AI can make mistakes. Verify important information with your n8n instance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
