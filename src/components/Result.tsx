import type { TypingResult } from "../hooks/useTypingState";
import { Stat } from "./Stat";

interface ResultProps {
	readonly result: TypingResult;
	readonly language: string;
	readonly onRetry: () => void;
	readonly onBack: () => void;
}

export function Result({ result, language, onRetry, onBack }: ResultProps) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<h1 className="mb-2 font-sans text-4xl font-light tracking-tight text-zen-text">
				Complete!
			</h1>
			<p className="mb-8 text-zen-text-muted">{language}</p>
			<div className="grid w-full max-w-md grid-cols-2 gap-4 mb-8">
				<Stat label="Time" value={`${result.elapsedTime.toFixed(1)}s`} />
				<Stat label="Keystrokes" value={String(result.totalKeystrokes)} />
				<Stat
					label="Speed"
					value={`${result.keystrokesPerSecond.toFixed(1)} keys/s`}
				/>
				<Stat label="Backspaces" value={String(result.backspaceCount)} />
			</div>
			<div className="flex gap-4">
				<button
					type="button"
					onClick={onRetry}
					className="cursor-pointer rounded-md bg-zen-accent px-6 py-3 font-medium text-zen-bg transition-all duration-300 hover:bg-zen-accent-hover"
				>
					Try Again
				</button>
				<button
					type="button"
					onClick={onBack}
					className="cursor-pointer rounded-md bg-zen-surface px-6 py-3 font-medium text-zen-text transition-all duration-300 hover:bg-zen-surface-hover"
				>
					Back to Select
				</button>
			</div>
		</div>
	);
}
