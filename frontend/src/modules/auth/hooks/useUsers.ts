import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../shared/lib/api-client';
import { useAuth } from './useAuth';
import type { User, CreateUserRequest, UpdateUserRequest, Company } from '../types/users.types';

export function useUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<User[]>('/api/users', token);
      setUsers(data);
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Failed to fetch users');
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCompanies = useCallback(async () => {
    if (!token || !currentUser?.is_super_admin) return;
    
    try {
      const data = await apiClient.get<Company[]>('/api/users/companies', token);
      setCompanies(data);
    } catch (err) {
      // Silently fail - companies are only for super admin
      console.error('Failed to fetch companies:', err);
    }
  }, [token, currentUser?.is_super_admin]);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  const createUser = useCallback(async (user: CreateUserRequest): Promise<User> => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const newUser = await apiClient.post<User>('/api/users', user, token);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Failed to create user');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateUser = useCallback(async (id: string, updates: UpdateUserRequest): Promise<User> => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiClient.patch<User>(`/api/users/${id}`, updates, token);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Failed to update user');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    if (!token) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/users/${id}`, token);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      const apiError = err instanceof Error ? err : new Error('Failed to delete user');
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    users,
    companies,
    loading,
    error,
    fetchUsers,
    fetchCompanies,
    createUser,
    updateUser,
    deleteUser,
  };
}
