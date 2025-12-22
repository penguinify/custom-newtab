// just a simple map for extensions -> mime types

// ill consider adding more types later, if issues arise
export const mimeMap: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	ico: "image/x-icon",
	svg: "image/svg+xml",
	gif: "image/gif",
	mp4: "video/mp4",
	webm: "video/webm",
	ogg: "video/ogg",
	mp3: "audio/mpeg",
	wav: "audio/wav",
};

export function getMimeFromExtension(extension: string): string | null {
	return mimeMap[extension.toLowerCase()] || null;
}
