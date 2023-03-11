export const handleAdminTokenInput = (token: string | null) => {
  if (!token && typeof window !== 'undefined') {
    const newToken = localStorage.getItem('nesorter-admin-token');

    if (newToken === null) {
      return false;
    }

    document.cookie = `nesorter-admin-token=${newToken}; path=/; max-age=${60 * 60 * 24 * 14};`;
    location.reload();
  }

  return Boolean(token);
};
