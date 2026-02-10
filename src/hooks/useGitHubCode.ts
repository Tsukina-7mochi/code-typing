import { useCallback, useState } from "react";
import { fetchRandomCode, type GitHubError } from "../api/github";
import type { CodeSample } from "../data/codes";
import type { Language } from "../data/languages";

type GitHubCodeState =
	| { readonly status: "idle" }
	| { readonly status: "loading" }
	| { readonly status: "success"; readonly sample: CodeSample }
	| { readonly status: "error"; readonly error: GitHubError };

export function useGitHubCode() {
	const [state, setState] = useState<GitHubCodeState>({ status: "idle" });

	const fetchCode = useCallback(async (language: Language) => {
		setState({ status: "loading" });
		const result = await fetchRandomCode(language);
		if (result.ok) {
			setState({ status: "success", sample: result.data });
		} else {
			setState({ status: "error", error: result.error });
		}
	}, []);

	const reset = useCallback(() => {
		setState({ status: "idle" });
	}, []);

	return { state, fetchCode, reset } as const;
}
