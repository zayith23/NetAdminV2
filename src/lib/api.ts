// ============================================
// NETADMIN V9 - API CLIENT
// Utilidades para llamadas al backend
// ============================================

import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2`;

// Obtener el token de autenticación (demo mode usa el publicAnonKey)
const getAuthHeader = () => {
  // En modo demo, usamos la clave pública
  return `Bearer ${publicAnonKey}`;
};

// ============================================
// GABINETES/SWITCHES
// ============================================

export const gabineteApi = {
  // Obtener todos los gabinetes
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/gabinetes`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(`Error al obtener gabinetes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.gabinetes || [];
    } catch (error: any) {
      console.error('Error en gabineteApi.getAll:', error);
      throw error;
    }
  },

  // Crear gabinete
  create: async (gabinete: any) => {
    const response = await fetch(`${API_URL}/gabinetes`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gabinete)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear gabinete');
    }
    
    const data = await response.json();
    return data.gabinete;
  },

  // Actualizar gabinete
  update: async (id: string, gabinete: any) => {
    const response = await fetch(`${API_URL}/gabinetes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gabinete)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar gabinete');
    }
    
    const data = await response.json();
    return data.gabinete;
  },

  // Eliminar gabinete
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/gabinetes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar gabinete');
    }
    
    return true;
  }
};

// ============================================
// VLANS
// ============================================

export const vlanApi = {
  // Obtener todos los sites VLAN
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/vlans`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(`Error al obtener VLANs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.vlans || [];
    } catch (error: any) {
      console.error('Error en vlanApi.getAll:', error);
      throw error;
    }
  },

  // Crear site VLAN
  create: async (siteVlan: any) => {
    const response = await fetch(`${API_URL}/vlans`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(siteVlan)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear site VLAN');
    }
    
    const data = await response.json();
    return data.siteVlan;
  },

  // Actualizar site VLAN
  update: async (id: string, siteVlan: any) => {
    const response = await fetch(`${API_URL}/vlans/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(siteVlan)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar site VLAN');
    }
    
    const data = await response.json();
    return data.siteVlan;
  },

  // Eliminar site VLAN
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/vlans/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar site VLAN');
    }
    
    return true;
  }
};

// ============================================
// CONTROL DE CAMBIOS
// ============================================

export const controlCambiosApi = {
  // Obtener controles de cambios
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/control-cambios`, {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        // Retornar valores por defecto en lugar de lanzar error
        return { grupoCos: null, contacto: null };
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error en controlCambiosApi.getAll:', error);
      // Retornar valores por defecto en lugar de propagar el error
      return { grupoCos: null, contacto: null };
    }
  },

  // Guardar control de cambios
  save: async (control: any) => {
    const response = await fetch(`${API_URL}/control-cambios`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(control)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar control de cambios');
    }
    
    const data = await response.json();
    return data.control;
  }
};