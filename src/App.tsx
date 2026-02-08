import { useCallback, useState } from "react";
import { CodeSelect } from "./component/CodeSelect";
import { Result } from "./component/Result";
import { TypingGame } from "./component/TypingGame";
import { type CodeSample, codeSamples } from "./data/codes";
import type { TypingResult } from "./hook/useTypingGame";

type Screen =
	| { readonly type: "select" }
	| { readonly type: "game"; readonly sample: CodeSample }
	| {
			readonly type: "result";
			readonly sample: CodeSample;
			readonly result: TypingResult;
	  };

export function App() {
	const [screen, setScreen] = useState<Screen>({ type: "select" });

	const handleSelect = useCallback((sample: CodeSample) => {
		setScreen({ type: "game", sample });
	}, []);

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
		setScreen({ type: "select" });
	}, []);

	switch (screen.type) {
		case "select":
			return <CodeSelect samples={codeSamples} onSelect={handleSelect} />;
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
