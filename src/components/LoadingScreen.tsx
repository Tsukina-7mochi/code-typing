interface LoadingScreenProps {
	readonly language: string;
	readonly onCancel: () => void;
}

export function LoadingScreen({ language, onCancel }: LoadingScreenProps) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="mb-4 text-lg text-zen-text-muted">
				Fetching {language} code from GitHub...
			</div>
			<div className="mb-8 animate-blink text-2xl text-zen-accent">...</div>
			<button
				type="button"
				onClick={onCancel}
				className="cursor-pointer rounded-md bg-zen-surface px-6 py-3 font-medium text-zen-text transition-all duration-300 hover:bg-zen-surface-hover"
			>
				Cancel
			</button>
		</div>
	);
}
