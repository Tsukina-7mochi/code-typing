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
					className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-4 text-center font-medium text-white transition-colors hover:border-indigo-500 hover:bg-gray-750"
				>
					{lang.name}
				</button>
			))}
		</div>
	);
}
