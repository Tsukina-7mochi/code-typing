import { useEffect, useRef } from "react";
import type { CodeSample } from "../data/codes";
import { type TypingResult, useTypingGame } from "../hooks/useTypingGame";
import { ErrorInput } from "./ErrorInput";

interface TypingGameProps {
	readonly sample: CodeSample;
	readonly onComplete: (result: TypingResult) => void;
}

export function TypingGame({ sample, onComplete }: TypingGameProps) {
	const { errorInput, currentIndex, isComplete, result } = useTypingGame(
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
	}, [currentIndex, errorInput.length]);

	const correctText = sample.code.slice(0, currentIndex);
	const remainingText = sample.code.slice(currentIndex);

	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
			<div className="mb-4 text-sm text-gray-400">{sample.language}</div>
			<div
				ref={containerRef}
				className="relative max-h-[70vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-gray-900 p-6"
			>
				<pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-all">
					<span className="text-white">{correctText}</span>
					<ErrorInput errorInput={errorInput} />
					{!isComplete ? (
						<span
							ref={cursorRef}
							className="animate-pulse border-l-2 border-indigo-400"
						/>
					) : null}
					<span className="text-gray-600">{remainingText}</span>
				</pre>
			</div>
			<div className="mt-4 text-sm text-gray-500">
				{currentIndex} / {sample.code.length} characters
			</div>
		</div>
	);
}
