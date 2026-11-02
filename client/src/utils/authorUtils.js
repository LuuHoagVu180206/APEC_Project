/**
 * Utility to resolve author display information based on project rules:
 * 1. Default/APEC sets show "APEC Group".
 * 2. Regular user sets show displayName (if present) or username (default).
 * 3. Anonymous mechanism (isAnonymous):
 *    - Only applies when set is public.
 *    - Admin and Set Owner see the author's real name with "(Ẩn danh)" / "(Bạn - Ẩn danh)".
 *    - All other users only see "Ẩn danh".
 */
export const getAuthorInfo = (set, currentUser) => {
    if (!set) {
        return {
            name: 'Ẩn danh',
            isAnonymous: false,
            isOfficial: false,
            avatarChar: '?',
            avatarImg: '',
            canSeeReal: false
        };
    }

    // Check if official APEC set (isDefault or created by APEC Group account)
    const ownerObj = (typeof set.owner === 'object' && set.owner !== null) ? set.owner : null;
    const isApecOfficial = Boolean(
        set.isDefault ||
        (ownerObj && (ownerObj.username === 'APEC Group' || ownerObj.displayName?.includes('APEC Group')))
    );

    if (isApecOfficial) {
        return {
            name: 'APEC Group',
            isAnonymous: false,
            isOfficial: true,
            avatarChar: '⭐',
            avatarImg: ownerObj?.avatar || '',
            canSeeReal: true
        };
    }

    // Determine real author name: displayName -> username -> authorName -> 'Ẩn danh'
    const displayName = ownerObj?.displayName?.trim();
    const username = ownerObj?.username?.trim();
    const fallbackAuthor = (set.authorName && set.authorName !== 'APEC Group') ? set.authorName.trim() : '';

    const realName = displayName || username || fallbackAuthor || 'Ẩn danh';

    // Check permissions
    const currentUserId = currentUser?._id || currentUser?.id;
    const ownerId = ownerObj?._id || ownerObj?.id || (typeof set.owner === 'string' ? set.owner : null);
    const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));
    const isAdmin = currentUser?.role === 'admin';

    // Anonymous check
    const isAnonymous = Boolean(set.isAnonymous);

    if (isAnonymous) {
        if (isOwner) {
            return {
                name: `${realName} (Bạn - Ẩn danh)`,
                isAnonymous: true,
                isOfficial: false,
                avatarChar: '🎭',
                avatarImg: ownerObj?.avatar || '',
                canSeeReal: true
            };
        }
        if (isAdmin) {
            return {
                name: `${realName} (Ẩn danh)`,
                isAnonymous: true,
                isOfficial: false,
                avatarChar: '🎭',
                avatarImg: ownerObj?.avatar || '',
                canSeeReal: true
            };
        }
        return {
            name: 'Ẩn danh',
            isAnonymous: true,
            isOfficial: false,
            avatarChar: '?',
            avatarImg: '',
            canSeeReal: false
        };
    }

    const firstChar = realName ? realName.charAt(0).toUpperCase() : 'A';
    return {
        name: realName,
        isAnonymous: false,
        isOfficial: false,
        avatarChar: firstChar,
        avatarImg: ownerObj?.avatar || '',
        canSeeReal: true
    };
};

