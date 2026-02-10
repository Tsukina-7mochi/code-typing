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
			<h1 className="mb-2 text-3xl font-bold text-white">Complete!</h1>
			<p className="mb-8 text-gray-400">{language}</p>
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
					className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
				>
					Try Again
				</button>
				<button
					type="button"
					onClick={onBack}
					className="rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
				>
					Back to Select
				</button>
			</div>
		</div>
	);
}
