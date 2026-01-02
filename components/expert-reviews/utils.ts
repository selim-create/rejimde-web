// Utility functions for expert reviews

/**
 * Get display name based on anonymous status
 * @param authorName - Full name of the author
 * @param isAnonymous - Whether the review is anonymous
 * @returns Display name (full name or initials)
 */
export const getDisplayName = (authorName: string, isAnonymous: boolean): string => {
  if (!authorName || authorName.trim() === '') {
    return 'Anonim Kullanıcı';
  }

  if (isAnonymous) {
    const parts = authorName.trim().split(/\s+/);
    const initials = parts
      .filter(part => part.length > 0)
      .map(word => word[0])
      .join('.')
      .toUpperCase();
    return initials ? initials + '.' : 'A.K.';
  }
  
  return authorName;
};
