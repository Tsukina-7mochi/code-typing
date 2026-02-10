import { CornerDownLeft } from "lucide-react";

interface ErrorInputProps {
	readonly errorInput: string;
}

export function ErrorInput({ errorInput }: ErrorInputProps) {
	if (errorInput.length === 0) {
		return null;
	}

	const renderedErrorInput = Array.from(
		errorInput.matchAll(/[\s\S]/g),
		(match) => {
			const char = match[0];
			const position = match.index ?? 0;

			if (char === "\n") {
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

			return <span key={`error-char-${position}`}>{char}</span>;
		},
	);

	return (
		<span className="text-red-400 bg-red-900/30">{renderedErrorInput}</span>
	);
}
