import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommandeMap from './CommandeMap';

const CommandeMapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return <>{id && <CommandeMap commandeId={parseInt(id, 10)} onBack={handleBack} />}</>;
};

export default CommandeMapPage;
