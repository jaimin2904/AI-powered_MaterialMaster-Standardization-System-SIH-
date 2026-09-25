import React, { useEffect, useState } from 'react';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/common/Toast';

// Pages
import DashboardPage from './pages/DashboardPage';
import MaterialSearchPage from './pages/MaterialSearchPage';
import MaterialComparisonPage from './pages/MaterialComparisonPage';
import DuplicateDetectionPage from './pages/DuplicateDetectionPage';
import CPSEMappingPage from './pages/CPSEMappingPage';
import AIApprovalPage from './pages/AIApprovalPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditHistoryPage from './pages/AuditHistoryPage';

export function App() {
  // ============================================================
  // DARK MODE
  // ============================================================

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('materialai-theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem(
      'materialai-theme',
      isDarkMode ? 'dark' : 'light'
    );

    // Also apply theme to the document.
    // This makes dark mode work even for elements outside
    // the immediate React app container.
    document.documentElement.classList.toggle(
      'dark-mode',
      isDarkMode
    );

    document.body.classList.toggle(
      'dark-mode',
      isDarkMode
    );
  }, [isDarkMode]);

  // ============================================================
  // GLOBAL STATE
  // ============================================================

  const [activeTab, setActiveTab] = useState('dashboard');

  const [selectedCpse, setSelectedCpse] = useState('all');

  const [activeRole, setActiveRole] =
    useState('Master Data Admin');

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [comparisonItems, setComparisonItems] =
    useState([]);

  // ============================================================
  // TOAST
  // ============================================================

  const [toastInfo, setToastInfo] = useState({
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToastInfo({
      message,
      type,
    });
  };

  // ============================================================
  // GLOBAL SEARCH
  // ============================================================

  const handleGlobalSearch = (term) => {
    const searchTerm = String(term || '').trim();

    if (!searchTerm) {
      setActiveTab('search');
      return;
    }

    setActiveTab('search');

    showToast(
      `Searching materials for: "${searchTerm}"`,
      'info'
    );
  };

  // ============================================================
  // ACTIVE PAGE RENDERER
  // ============================================================

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        );

      case 'search':
        return (
          <MaterialSearchPage
            selectedCpse={selectedCpse}
            setSelectedCpse={setSelectedCpse}
            comparisonItems={comparisonItems}
            setComparisonItems={setComparisonItems}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        );

      case 'comparison':
        return (
          <MaterialComparisonPage
            comparisonItems={comparisonItems}
            setComparisonItems={setComparisonItems}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        );

      case 'duplicates':
        return (
          <DuplicateDetectionPage
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        );

      case 'mapping':
        return (
          <CPSEMappingPage
            selectedCpse={selectedCpse}
            setSelectedCpse={setSelectedCpse}
            showToast={showToast}
          />
        );

      case 'approval':
        return (
          <AIApprovalPage
            showToast={showToast}
          />
        );

      case 'analytics':
        return (
          <AnalyticsPage
            showToast={showToast}
          />
        );

      case 'audit':
        return (
          <AuditHistoryPage
            selectedCpse={selectedCpse}
            setSelectedCpse={setSelectedCpse}
            showToast={showToast}
          />
        );

      default:
        return (
          <DashboardPage
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        );
    }
  };

  // ============================================================
  // APP LAYOUT
  // ============================================================

  return (
    <div
      className={`app-container ${
        isDarkMode ? 'dark-mode' : ''
      }`}
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',

        /* FIXED: use variables that actually exist */
        background: 'var(--background)',
        color: 'var(--text-h)',

        overflow: 'hidden',

        transition:
          'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* ======================================================
          MAIN APPLICATION
      ======================================================= */}

      <div
        className="main-wrapper"
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',

          /* FIXED */
          background: 'var(--background)',

          transition:
            'background-color 0.25s ease, margin-left 0.25s ease',
        }}
      >
        {/* ==================================================
            HEADER
        =================================================== */}

        <Header
          selectedCpse={selectedCpse}
          setSelectedCpse={setSelectedCpse}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          onGlobalSearch={handleGlobalSearch}

          /* DARK MODE */
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />

        {/* ==================================================
            PAGE CONTENT
        =================================================== */}

        <main
          className="page-content"
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',

            /* FIXED */
            background: 'var(--background)',

            color: 'var(--text)',

            transition:
              'background-color 0.25s ease, color 0.25s ease',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1800px',
              margin: '0 auto',
            }}
          >
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* ======================================================
          GLOBAL TOAST
      ======================================================= */}

      <Toast
        message={toastInfo.message}
        type={toastInfo.type}
        onClose={() =>
          setToastInfo({
            message: '',
            type: 'success',
          })
        }
      />
    </div>
  );
}

export default App;