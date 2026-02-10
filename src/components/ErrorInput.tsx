import { CornerDownLeft } from "lucide-react";

interface ErrorInputProps {
	readonly errorInput: string;
}

export function ErrorInput({ errorInput }: ErrorInputProps) {
	if (errorInput.length === 0) {
		return null;
	}

	const renderedErrorInput = Array.from(
		errorInput.matchAll(/[^\n]+|\n/g),
		(match) => {
			const segment = match[0];
			const position = match.index ?? 0;

			if (segment === "\n") {
				return (
					<span key={`error-newline-${position}`}>
						<CornerDownLeft
							aria-label="line break"
							className="inline-block align-middle h-lh"
							size={16}
						/>
						{"\n"}
					</span>
				);
			}

			return <span key={`error-text-${position}`}>{segment}</span>;
		},
	);

	return (
		<span className="text-zen-error bg-zen-error-bg">{renderedErrorInput}</span>
	);
}
