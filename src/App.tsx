import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { SchedulingPage } from './features/scheduling';
import { useState } from 'react';

export function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`app-main ${sidebarCollapsed ? 'app-main--collapsed' : ''}`}>
        <TopBar />
        <div className="app-content">
          <Routes>
            <Route path="/scheduling" element={<SchedulingPage />} />
            <Route path="*" element={<Navigate to="/scheduling" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
