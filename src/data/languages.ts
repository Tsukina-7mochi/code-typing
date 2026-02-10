export interface Language {
	readonly id: string;
	readonly name: string;
	readonly githubQuery: string;
	readonly extensions: readonly string[];
	readonly lineCommentTokens: readonly string[];
	readonly blockCommentPairs: readonly CommentPair[];
}

export interface CommentPair {
	readonly start: string;
	readonly end: string;
}

export const languages: readonly Language[] = [
	{
		id: "typescript",
		name: "TypeScript",
		githubQuery: "typescript",
		extensions: [".ts", ".tsx"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
	{
		id: "javascript",
		name: "JavaScript",
		githubQuery: "javascript",
		extensions: [".js", ".jsx"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
	{
		id: "python",
		name: "Python",
		githubQuery: "python",
		extensions: [".py"],
		lineCommentTokens: ["#"],
		blockCommentPairs: [
			{ start: '"""', end: '"""' },
			{ start: "'''", end: "'''" },
		],
	},
	{
		id: "go",
		name: "Go",
		githubQuery: "go",
		extensions: [".go"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
	{
		id: "rust",
		name: "Rust",
		githubQuery: "rust",
		extensions: [".rs"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
	{
		id: "java",
		name: "Java",
		githubQuery: "java",
		extensions: [".java"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
	{
		id: "c",
		name: "C",
		githubQuery: "c",
		extensions: [".c", ".h"],
		lineCommentTokens: ["//"],
		blockCommentPairs: [{ start: "/*", end: "*/" }],
	},
];

export function matchesExtension(
	path: string,
	extensions: readonly string[],
): boolean {
	return extensions.some((ext) => path.endsWith(ext));
}

export function findLanguageById(id: string): Language | null {
	return languages.find((language) => language.id === id) ?? null;
}
