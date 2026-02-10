import type { CodeSample } from "../data/codes";
import type { Language } from "../data/languages";
import { matchesExtension } from "../data/languages";

// --- Types ---

export interface GitHubRepo {
	readonly full_name: string;
	readonly owner: { readonly login: string };
	readonly name: string;
	readonly default_branch: string;
}

export interface GitHubTreeEntry {
	readonly path: string;
	readonly type: "blob" | "tree";
	readonly size?: number;
	readonly sha: string;
}

export interface GitHubError {
	readonly type: "rate_limit" | "network" | "not_found" | "no_suitable_files";
	readonly message: string;
	readonly retryAfter?: number;
}

export type GitHubResult<T> =
	| { readonly ok: true; readonly data: T }
	| { readonly ok: false; readonly error: GitHubError };

// --- Constants ---

const GITHUB_API = "https://api.github.com";
const MIN_FILE_SIZE = 500;
const MAX_FILE_SIZE = 5000;
const MAX_REPO_ATTEMPTS = 3;

const EXCLUDED_DIRS: readonly string[] = [
	"node_modules",
	"vendor",
	"dist",
	"build",
	"generated",
	"test",
	"tests",
	"__tests__",
	"spec",
	"__mocks__",
];

const EXCLUDED_FILE_PATTERNS: readonly string[] = [
	".min.",
	".d.ts",
	"package-lock",
	"yarn.lock",
];

const JSON_HEADERS = {
	Accept: "application/vnd.github+json",
	"X-GitHub-Api-Version": "2022-11-28",
};

const RAW_HEADERS = {
	Accept: "application/vnd.github.raw+json",
	"X-GitHub-Api-Version": "2022-11-28",
};

// --- Helpers ---

function isExcludedPath(path: string): boolean {
	const segments = path.toLowerCase().split("/");
	const fileName = segments[segments.length - 1];
	if (segments.some((seg) => EXCLUDED_DIRS.includes(seg))) return true;
	if (EXCLUDED_FILE_PATTERNS.some((pat) => fileName.includes(pat))) return true;
	return false;
}

function handleRateLimit(headers: Headers): GitHubError {
	const retryAfter = headers.get("retry-after");
	return {
		type: "rate_limit",
		message: "GitHub rate limit exceeded.",
		retryAfter: retryAfter ? Number.parseInt(retryAfter, 10) : undefined,
	};
}

async function handleResponse<T>(
	fetchFn: () => Promise<Response>,
	parse: (res: Response) => Promise<T>,
): Promise<GitHubResult<T>> {
	try {
		const res = await fetchFn();
		if (
			res.status === 403 &&
			res.headers.get("x-ratelimit-remaining") === "0"
		) {
			return { ok: false, error: handleRateLimit(res.headers) };
		}
		if (!res.ok) {
			return {
				ok: false,
				error: {
					type: "not_found",
					message: `GitHub API returned ${res.status}`,
				},
			};
		}
		const data = await parse(res);
		return { ok: true, data };
	} catch {
		return {
			ok: false,
			error: { type: "network", message: "Failed to connect to GitHub." },
		};
	}
}

// --- Public API ---

export async function searchRepos(
	language: string,
): Promise<GitHubResult<readonly GitHubRepo[]>> {
	return handleResponse(
		() =>
			fetch(
				`${GITHUB_API}/search/repositories?q=language:${encodeURIComponent(language)}&sort=stars&order=desc&per_page=50`,
				{ headers: JSON_HEADERS },
			),
		async (res) => {
			const json = await res.json();
			if (!Array.isArray(json.items)) {
				throw new Error("Unexpected response: items is not an array");
			}
			return json.items as GitHubRepo[];
		},
	);
}

export async function getRepoTree(
	owner: string,
	repo: string,
	branch: string,
): Promise<GitHubResult<readonly GitHubTreeEntry[]>> {
	return handleResponse(
		() =>
			fetch(
				`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
				{ headers: JSON_HEADERS },
			),
		async (res) => {
			const json = await res.json();
			if (!Array.isArray(json.tree)) {
				throw new Error("Unexpected response: tree is not an array");
			}
			return json.tree as GitHubTreeEntry[];
		},
	);
}

export async function getFileContent(
	owner: string,
	repo: string,
	path: string,
): Promise<GitHubResult<string>> {
	return handleResponse(
		() => {
			const encodedPath = path.split("/").map(encodeURIComponent).join("/");
			return fetch(
				`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`,
				{ headers: RAW_HEADERS },
			);
		},
		(res) => res.text(),
	);
}

export function filterSourceFiles(
	entries: readonly GitHubTreeEntry[],
	extensions: readonly string[],
): readonly GitHubTreeEntry[] {
	return entries.filter(
		(entry) =>
			entry.type === "blob" &&
			entry.size !== undefined &&
			entry.size >= MIN_FILE_SIZE &&
			entry.size <= MAX_FILE_SIZE &&
			matchesExtension(entry.path, extensions) &&
			!isExcludedPath(entry.path),
	);
}

export function pickRandom<T>(items: readonly T[]): T {
	if (items.length === 0) {
		throw new Error("Cannot pick from an empty array");
	}
	return items[Math.floor(Math.random() * items.length)];
}

export function sanitizeCode(raw: string): string {
	if (raw === "") return "";

	const normalized = raw.replace(/\r\n/g, "\n");
	const lines = normalized
		.split("\n")
		.map((line) => line.replace(/\t/g, "    ").replace(/\s+$/, ""));

	const trimmed = trimBlankLines(lines);
	return truncateToLimit(trimmed, 2000);
}

function trimBlankLines(lines: readonly string[]): readonly string[] {
	let start = 0;
	while (start < lines.length && lines[start] === "") {
		start++;
	}
	let end = lines.length;
	while (end > start && lines[end - 1] === "") {
		end--;
	}
	return lines.slice(start, end);
}

function truncateToLimit(lines: readonly string[], maxChars: number): string {
	const kept: string[] = [];
	let total = 0;

	for (const line of lines) {
		const addition = kept.length === 0 ? line.length : line.length + 1;
		if (total + addition > maxChars) break;
		kept.push(line);
		total += addition;
	}

	return kept.join("\n");
}

// --- Orchestrator ---

export async function fetchRandomCode(
	language: Language,
): Promise<GitHubResult<CodeSample>> {
	const reposResult = await searchRepos(language.githubQuery);
	if (!reposResult.ok) return reposResult;
	if (reposResult.data.length === 0) {
		return {
			ok: false,
			error: { type: "not_found", message: "No repositories found." },
		};
	}

	const shuffled = shuffleArray(reposResult.data);
	const candidates = shuffled.slice(0, MAX_REPO_ATTEMPTS);

	for (const repo of candidates) {
		const treeResult = await getRepoTree(
			repo.owner.login,
			repo.name,
			repo.default_branch,
		);
		if (!treeResult.ok) continue;

		const sourceFiles = filterSourceFiles(treeResult.data, language.extensions);
		if (sourceFiles.length === 0) continue;

		const file = pickRandom(sourceFiles);
		const contentResult = await getFileContent(
			repo.owner.login,
			repo.name,
			file.path,
		);
		if (!contentResult.ok) continue;

		const sanitized = sanitizeCode(contentResult.data);
		if (sanitized === "") continue;

		return {
			ok: true,
			data: {
				id: `github-${repo.full_name}-${file.path}`,
				language: language.name,
				title: `${file.path} from ${repo.full_name}`,
				code: sanitized,
			},
		};
	}

	return {
		ok: false,
		error: {
			type: "no_suitable_files",
			message: "No suitable source files found. Try another language.",
		},
	};
}

function shuffleArray<T>(items: readonly T[]): readonly T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}
