export const handleAdminTokenInput = (token: string | null) => {
  if (!token && typeof window !== 'undefined') {
    const newToken = localStorage.getItem('nesorter-admin-token') || prompt('Input ADMIN_TOKEN 🤔');

    if (newToken === 'null' || newToken === null) {
      location.reload();
    }

    localStorage.setItem('nesorter-admin-token', newToken as string);
    document.cookie = `nesorter-admin-token=${newToken}; path=/; max-age=${60 * 60 * 24 * 14};`;
    location.reload();
  }

  return Boolean(token);
};
