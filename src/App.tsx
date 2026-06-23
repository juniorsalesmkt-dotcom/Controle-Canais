/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthPage } from './components/AuthPage';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { ProjectView } from './components/ProjectView';
import { Project } from './types';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      document.title = 'Login - Ecosistema de Conteúdo';
    } else if (activeProjectId) {
      document.title = 'Projeto - Ecosistema de Conteúdo';
    } else {
      document.title = 'Início - Ecosistema de Conteúdo';
    }
  }, [user, activeProjectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px border #27272a',
        },
      }} />
      <Layout 
        onNavigateHome={() => setActiveProjectId(null)}
        onNavigateProject={(id) => setActiveProjectId(id)}
        activeProjectId={activeProjectId}
      >
        {activeProjectId ? (
          <ProjectView projectId={activeProjectId} />
        ) : (
          <Home onSelectProject={(id) => setActiveProjectId(id)} />
        )}
      </Layout>
    </>
  );
}

