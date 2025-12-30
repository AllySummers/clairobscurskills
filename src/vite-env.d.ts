/// <reference types="vite/client" />

// Allow importing JSON files as URLs
declare module '*.json?url' {
	const value: string;
	export default value;
}
