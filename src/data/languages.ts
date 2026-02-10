export interface Language {
	readonly id: string;
	readonly name: string;
	readonly githubQuery: string;
	readonly extensions: readonly string[];
}

export const languages: readonly Language[] = [
	{
		id: "typescript",
		name: "TypeScript",
		githubQuery: "typescript",
		extensions: [".ts", ".tsx"],
	},
	{
		id: "javascript",
		name: "JavaScript",
		githubQuery: "javascript",
		extensions: [".js", ".jsx"],
	},
	{
		id: "python",
		name: "Python",
		githubQuery: "python",
		extensions: [".py"],
	},
	{ id: "go", name: "Go", githubQuery: "go", extensions: [".go"] },
	{ id: "rust", name: "Rust", githubQuery: "rust", extensions: [".rs"] },
	{
		id: "java",
		name: "Java",
		githubQuery: "java",
		extensions: [".java"],
	},
	{ id: "c", name: "C", githubQuery: "c", extensions: [".c", ".h"] },
];

export function matchesExtension(
	path: string,
	extensions: readonly string[],
): boolean {
	return extensions.some((ext) => path.endsWith(ext));
}
