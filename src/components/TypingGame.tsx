import { useEffect, useRef } from "react";
import type { CodeSample } from "../data/codes";
import { type TypingResult, useTypingGame } from "../hooks/useTypingGame";

interface TypingGameProps {
	readonly sample: CodeSample;
	readonly onComplete: (result: TypingResult) => void;
}

function charToDisplay(key: string): string {
	if (key === "Enter") return "\n";
	if (key === "Tab") return "\t";
	return key;
}

function getTypedCharProps(typedKey: string, expectedChar: string) {
	const typedChar = charToDisplay(typedKey);
	const isCorrect = typedChar === expectedChar;
	return {
		className: isCorrect ? "text-white" : "text-red-400 bg-red-900/30",
		displayChar: isCorrect ? expectedChar : typedChar,
	};
}

export function TypingGame({ sample, onComplete }: TypingGameProps) {
	const { typed, currentIndex, isComplete, result } = useTypingGame(
		sample.code,
	);
	const cursorRef = useRef<HTMLSpanElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const completedRef = useRef(false);

	useEffect(() => {
		if (result && !completedRef.current) {
			completedRef.current = true;
			onComplete(result);
		}
	}, [result, onComplete]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll must trigger on each typed character
	useEffect(() => {
		if (cursorRef.current && containerRef.current) {
			const cursor = cursorRef.current;
			const container = containerRef.current;
			const containerRect = container.getBoundingClientRect();
			const cursorRect = cursor.getBoundingClientRect();
			const cursorRelativeTop = cursorRect.top - containerRect.top;
			const targetScroll =
				container.scrollTop + cursorRelativeTop - containerRect.height / 2;
			container.scrollTo({ top: targetScroll, behavior: "smooth" });
		}
	}, [typed.length]);

	const chars = sample.code.split("");

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="mb-4 text-sm text-gray-400">{sample.language}</div>
			<div
				ref={containerRef}
				className="relative max-h-[70vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-gray-900 p-6"
			>
				<pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-all">
					{chars.map((expectedChar, i) => {
						const isCurrent = i === currentIndex;
						const isTyped = i < typed.length;

						const { className, displayChar } = isTyped
							? getTypedCharProps(typed[i], expectedChar)
							: { className: "text-gray-600", displayChar: expectedChar };

						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: chars are from a fixed string, index is the stable identity
							<span key={i} className={className}>
								{isCurrent && !isComplete ? (
									<>
										<span
											ref={cursorRef}
											className="animate-pulse border-l-2 border-indigo-400"
										/>
										{displayChar}
									</>
								) : (
									displayChar
								)}
							</span>
						);
					})}
				</pre>
			</div>
			<div className="mt-4 text-sm text-gray-500">
				{currentIndex} / {chars.length} characters
			</div>
		</div>
	);
}
