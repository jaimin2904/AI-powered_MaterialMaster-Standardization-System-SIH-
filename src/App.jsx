import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCpse, setSelectedCpse] = useState('all');
  const [activeRole, setActiveRole] = useState('Master Data Admin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [comparisonItems, setComparisonItems] = useState([]);

  // Toast state
  const [toastInfo, setToastInfo] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToastInfo({ message, type });
  };

  const handleGlobalSearch = (term) => {
    setActiveTab('search');
    showToast(`Searching materials for: "${term}"`, 'info');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} showToast={showToast} />;
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
        return <DuplicateDetectionPage setActiveTab={setActiveTab} showToast={showToast} />;
      case 'mapping':
        return (
          <CPSEMappingPage
            selectedCpse={selectedCpse}
            setSelectedCpse={setSelectedCpse}
            showToast={showToast}
          />
        );
      case 'approval':
        return <AIApprovalPage showToast={showToast} />;
      case 'analytics':
        return <AnalyticsPage showToast={showToast} />;
      case 'audit':
        return (
          <AuditHistoryPage
            selectedCpse={selectedCpse}
            setSelectedCpse={setSelectedCpse}
            showToast={showToast}
          />
        );
      default:
        return <DashboardPage setActiveTab={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div className="app-container">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          selectedCpse={selectedCpse}
          setSelectedCpse={setSelectedCpse}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          onGlobalSearch={handleGlobalSearch}
        />

        <main className="page-content">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Toast Notification Popup */}
      <Toast
        message={toastInfo.message}
        type={toastInfo.type}
        onClose={() => setToastInfo({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default App;
