const PASSWORD_STORAGE_KEY = 'lingoquest_admin_password';

export function getStoredAdminPassword(): string {
  return localStorage.getItem(PASSWORD_STORAGE_KEY) || '123456';
}

export function setStoredAdminPassword(password: string): void {
  localStorage.setItem(PASSWORD_STORAGE_KEY, password);
}
