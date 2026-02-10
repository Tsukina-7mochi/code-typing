import type { CodeSample } from "../data/codes";
import type { Language } from "../data/languages";
import { languages } from "../data/languages";
import { LanguageSelect } from "./LanguageSelect";

interface CodeSelectProps {
	readonly samples: readonly CodeSample[];
	readonly onSelect: (sample: CodeSample) => void;
	readonly onLanguageSelect: (language: Language) => void;
}

export function CodeSelect({
	samples,
	onSelect,
	onLanguageSelect,
}: CodeSelectProps) {
	return (
		<div className="flex gap-8 min-h-screen w-full flex-col items-center justify-center p-8">
			<h1 className="font-sans text-4xl font-light tracking-tight text-zen-text">
				Code Typing Practice
			</h1>
			<div className="w-full max-w-2xl">
				<h2 className="mb-4 font-sans text-xl font-light text-zen-text-muted">
					Fetch from GitHub
				</h2>
				<p className="mb-4 text-sm text-zen-text-muted">
					Practice typing real code from popular open source projects
				</p>
				<LanguageSelect languages={languages} onSelect={onLanguageSelect} />
			</div>
			<div className="flex flex-col gap-4 w-full max-w-2xl">
				{samples.map((sample) => (
					<button
						key={sample.id}
						type="button"
						onClick={() => onSelect(sample)}
						className="cursor-pointer rounded-md bg-zen-surface p-6 text-left transition-all duration-300 hover:bg-zen-surface-hover"
					>
						<h2 className="mb-2 text-lg font-medium text-zen-text">
							{sample.language}
						</h2>
						<pre className="overflow-hidden text-ellipsis whitespace-pre font-code text-sm text-zen-text-muted max-h-24">
							{sample.code}
						</pre>
					</button>
				))}
			</div>
		</div>
	);
}
