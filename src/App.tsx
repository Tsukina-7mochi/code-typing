import { useCallback, useEffect, useState } from "react";
import type { GitHubError } from "./api/github";
import { CodeSelect } from "./components/CodeSelect";
import { ErrorScreen } from "./components/ErrorScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { Result } from "./components/Result";
import { TypingGame } from "./components/TypingGame";
import { type CodeSample, codeSamples } from "./data/codes";
import type { Language } from "./data/languages";
import { useGitHubCode } from "./hooks/useGitHubCode";
import type { TypingResult } from "./hooks/useTypingState";

type Screen =
	| { readonly type: "select" }
	| { readonly type: "github-loading"; readonly language: Language }
	| {
			readonly type: "github-error";
			readonly language: Language;
			readonly error: GitHubError;
	  }
	| { readonly type: "game"; readonly sample: CodeSample }
	| {
			readonly type: "result";
			readonly sample: CodeSample;
			readonly result: TypingResult;
	  };

export function App() {
	const [screen, setScreen] = useState<Screen>({ type: "select" });
	const { state: githubState, fetchCode, reset: resetGitHub } = useGitHubCode();

	// biome-ignore lint/correctness/useExhaustiveDependencies: sync screen with github hook state transitions
	useEffect(() => {
		if (githubState.status === "success") {
			setScreen({ type: "game", sample: githubState.sample });
			resetGitHub();
		} else if (
			githubState.status === "error" &&
			screen.type === "github-loading"
		) {
			setScreen({
				type: "github-error",
				language: screen.language,
				error: githubState.error,
			});
			resetGitHub();
		}
	}, [githubState.status]);

	const handleSelect = useCallback((sample: CodeSample) => {
		setScreen({ type: "game", sample });
	}, []);

	const handleLanguageSelect = useCallback(
		(language: Language) => {
			setScreen({ type: "github-loading", language });
			fetchCode(language);
		},
		[fetchCode],
	);

	const handleComplete = useCallback((result: TypingResult) => {
		setScreen((prev) => {
			if (prev.type !== "game") return prev;
			return { type: "result", sample: prev.sample, result };
		});
	}, []);

	const handleRetry = useCallback(() => {
		setScreen((prev) => {
			if (prev.type !== "result") return prev;
			return { type: "game", sample: prev.sample };
		});
	}, []);

	const handleBack = useCallback(() => {
		resetGitHub();
		setScreen({ type: "select" });
	}, [resetGitHub]);

	switch (screen.type) {
		case "select":
			return (
				<CodeSelect
					samples={codeSamples}
					onSelect={handleSelect}
					onLanguageSelect={handleLanguageSelect}
				/>
			);
		case "github-loading":
			return (
				<LoadingScreen language={screen.language.name} onCancel={handleBack} />
			);
		case "github-error":
			return (
				<ErrorScreen
					error={screen.error}
					onRetry={() => handleLanguageSelect(screen.language)}
					onBack={handleBack}
				/>
			);
		case "game":
			return (
				<TypingGame
					key={screen.sample.id}
					sample={screen.sample}
					onComplete={handleComplete}
				/>
			);
		case "result":
			return (
				<Result
					result={screen.result}
					language={screen.sample.language}
					onRetry={handleRetry}
					onBack={handleBack}
				/>
			);
	}
}
