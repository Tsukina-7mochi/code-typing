interface LoadingScreenProps {
	readonly language: string;
	readonly onCancel: () => void;
}

export function LoadingScreen({ language, onCancel }: LoadingScreenProps) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="mb-4 text-lg text-gray-400">
				Fetching {language} code from GitHub...
			</div>
			<div className="mb-8 animate-pulse text-2xl text-indigo-400">...</div>
			<button
				type="button"
				onClick={onCancel}
				className="cursor-pointer rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
			>
				Cancel
			</button>
		</div>
	);
}
