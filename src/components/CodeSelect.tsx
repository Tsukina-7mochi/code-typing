import type { CodeSample } from "../data/codes";

interface CodeSelectProps {
	readonly samples: readonly CodeSample[];
	readonly onSelect: (sample: CodeSample) => void;
}

export function CodeSelect({ samples, onSelect }: CodeSelectProps) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<h1 className="mb-8 text-3xl font-bold text-white">
				Code Typing Practice
			</h1>
			<div className="flex flex-col gap-4 w-full max-w-2xl">
				{samples.map((sample) => (
					<button
						key={sample.id}
						type="button"
						onClick={() => onSelect(sample)}
						className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-left transition-colors hover:border-indigo-500 hover:bg-gray-750 cursor-pointer"
					>
						<h2 className="mb-2 text-lg font-semibold text-white">
							{sample.language}
						</h2>
						<pre className="overflow-hidden text-ellipsis whitespace-pre font-mono text-sm text-gray-400 max-h-24">
							{sample.code}
						</pre>
					</button>
				))}
			</div>
		</div>
	);
}
