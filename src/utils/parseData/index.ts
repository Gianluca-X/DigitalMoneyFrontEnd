import { IRecord } from '../../components';

export const parseRecordContent = (record: any, variant: any) => {
  return {
    content: { 
      ...record,
      // El back manda 'date', lo guardamos también como 'dated'
      dated: record.date || record.dated, 
      // El back manda el texto en 'cvu', lo guardamos como 'name'
      name: record.name || record.cvu || "Ingreso de dinero",
    },
    variant,
  };
};

export function parseJwt(token: string) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}