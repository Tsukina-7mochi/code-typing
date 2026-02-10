import type { Language } from "../data/languages";

interface LanguageSelectProps {
	readonly languages: readonly Language[];
	readonly onSelect: (language: Language) => void;
}

export function LanguageSelect({ languages, onSelect }: LanguageSelectProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{languages.map((lang) => (
				<button
					key={lang.id}
					type="button"
					onClick={() => onSelect(lang)}
					className="cursor-pointer rounded-md bg-zen-surface p-4 text-center font-medium text-zen-text transition-all duration-300 hover:bg-zen-surface-hover"
				>
					{lang.name}
				</button>
			))}
		</div>
	);
}
