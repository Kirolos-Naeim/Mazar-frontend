import axios from 'axios';
import { getClientSession } from './session';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

export const adminHeaders = {
  'x-user-id': process.env.NEXT_PUBLIC_ADMIN_USER_ID || 'demo-admin',
  'x-user-role': 'ADMIN',
};

export function currentAuthHeaders() {
  const session = getClientSession();

  if (session.role === 'ADMIN') {
    return {
      'x-user-id': session.userId || adminHeaders['x-user-id'],
      'x-user-role': 'ADMIN',
    };
  }

  if (session.role === 'CUSTOMER') {
    if (!session.userId) return undefined;
    return {
      'x-user-id': session.userId,
      'x-user-role': 'CUSTOMER',
    };
  }

  return undefined;
}
