import type { GitHubError } from "../api/github";

interface ErrorScreenProps {
	readonly error: GitHubError;
	readonly onRetry: () => void;
	readonly onBack: () => void;
}

function formatErrorMessage(error: GitHubError): string {
	switch (error.type) {
		case "rate_limit":
			return error.retryAfter
				? `GitHub rate limit exceeded. Try again in ${error.retryAfter} seconds.`
				: "GitHub rate limit exceeded. Please wait a moment.";
		case "network":
			return "Failed to connect to GitHub. Check your internet connection.";
		case "not_found":
			return "No repositories found for this language.";
		case "no_suitable_files":
			return "No suitable source files found. Try another language or try again.";
	}
}

export function ErrorScreen({ error, onRetry, onBack }: ErrorScreenProps) {
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="mb-8 text-lg text-red-400">
				{formatErrorMessage(error)}
			</div>
			<div className="flex gap-4">
				<button
					type="button"
					onClick={onRetry}
					className="cursor-pointer rounded-lg border border-indigo-600 bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
				>
					Try Again
				</button>
				<button
					type="button"
					onClick={onBack}
					className="cursor-pointer rounded-lg border border-gray-600 px-6 py-3 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
				>
					Back
				</button>
			</div>
		</div>
	);
}
