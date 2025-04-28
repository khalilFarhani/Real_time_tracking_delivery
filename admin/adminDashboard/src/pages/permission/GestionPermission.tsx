import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PermissionList from './PermissionList';
import PermissionForm from './PermissionForm';
import { Permission } from './types';

const GestionPermission: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [openPermissionDialog, setOpenPermissionDialog] = useState<boolean>(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const API_URL = 'http://localhost:5283';

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/permissions/liste`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions :', error);
    }
  };

  const handleSavePermission = async (permissionData: {
    permissionName: string;
    description: string;
  }) => {
    try {
      if (currentPermission) {
        await axios.put(
          `${API_URL}/api/permissions/modifier/${currentPermission.id}`,
          permissionData,
        );
      } else {
        await axios.post(`${API_URL}/api/permissions/ajouter`, permissionData);
      }
      fetchPermissions();
      setOpenPermissionDialog(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la permission :', error);
    }
  };

  const handleDeletePermission = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/permissions/supprimer/${id}`);
      fetchPermissions();
    } catch (error) {
      console.error('Erreur lors de la suppression de la permission :', error);
    }
  };

  return (
    <>
      <PermissionList
        permissions={permissions}
        onAddPermission={() => {
          setCurrentPermission(null);
          setOpenPermissionDialog(true);
        }}
        onEditPermission={(permission) => {
          setCurrentPermission(permission);
          setOpenPermissionDialog(true);
        }}
        onDeletePermission={handleDeletePermission}
      />

      <PermissionForm
        open={openPermissionDialog}
        onClose={() => setOpenPermissionDialog(false)}
        onSubmit={handleSavePermission}
        initialData={currentPermission || undefined}
      />
    </>
  );
};

export default GestionPermission;
