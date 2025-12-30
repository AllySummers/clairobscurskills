// Utility function for accent-insensitive search
export const normalizeString = (str: string): string =>
	str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

// Stable empty references to prevent unnecessary re-renders
export const EMPTY_SET = new Set<string>();
export const EMPTY_ARRAY: string[] = [];

