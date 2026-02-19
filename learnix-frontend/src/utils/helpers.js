/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length = 100) => {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + '...';
};
