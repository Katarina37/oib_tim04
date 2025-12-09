import React from 'react';
import { Navigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  return <Navigate to="/production" replace />;
};

export default Dashboard;