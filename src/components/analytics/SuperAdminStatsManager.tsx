'use client';

import React, { useState } from 'react';
import CompanyStatsSelector from './CompanyStatsSelector';
import ConversionStatsDashboard from './ConversionStatsDashboard';

const SuperAdminStatsManager: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCompanySelect = (companyId: string, companyName: string) => {
    setSelectedCompany({ id: companyId, name: companyName });
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
  };

  if (selectedCompany) {
    return (
      <ConversionStatsDashboard
        companyId={selectedCompany.id}
        isSuperAdmin={true}
        selectedCompanyName={selectedCompany.name}
        onBackToCompanies={handleBackToCompanies}
      />
    );
  }

  return (
    <CompanyStatsSelector onCompanySelect={handleCompanySelect} />
  );
};

export default SuperAdminStatsManager;
