import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuthHook';
import { getDefaultRouteForRole } from '../helpers/roleAccess';

interface UnderConstructionPageProps {
  title: string;
  description?: string;
}

export const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({ 
  title, 
  description = 'Ova stranica je trenutno u izradi. Molimo vas da se vratite kasnije.' 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fallbackRoute = getDefaultRouteForRole(user?.role);

  return (
    <div className="under-construction">
      <div className="under-construction__icon">
        <Construction size={80} strokeWidth={1.5} />
      </div>
      <h1 className="under-construction__title">{title}</h1>
      <p className="under-construction__description">{description}</p>
      <p className="text-muted mt-md" style={{ fontSize: 'var(--font-size-sm)' }}>
        U izradi...
      </p>
      <button 
        className="btn btn--outline mt-lg"
        onClick={() => navigate(fallbackRoute)}
      >
        <ArrowLeft size={16} />
        Nazad na pocetnu
      </button>
    </div>
  );
};

export default UnderConstructionPage;
