'use client';

import React, { useState } from 'react';
import Sidebar, { ViewType } from './components/Sidebar';
import ChatView from './components/ChatView';
import WorkflowsView from './components/WorkflowsView';
import ConfigurationView from './components/ConfigurationView';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('agent');

  const renderView = () => {
    switch (currentView) {
      case 'agent':
        return <ChatView />;
      case 'workflows':
        return <WorkflowsView />;
      case 'config':
        return <ConfigurationView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <main className="flex h-screen w-full bg-background overflow-hidden text-text-main">
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {renderView()}
      </div>
    </main>
  );
}
