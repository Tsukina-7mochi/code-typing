import { useEffect, useRef } from "react";
import type { CodeSample } from "../data/codes";
import { findLanguageById } from "../data/languages";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler";
import { type TypingResult, useTypingState } from "../hooks/useTypingState";
import { ErrorInput } from "./ErrorInput";

interface TypingGameProps {
	readonly sample: CodeSample;
	readonly onComplete: (result: TypingResult) => void;
}

export function TypingGame({ sample, onComplete }: TypingGameProps) {
	const language = findLanguageById(sample.languageId) ?? undefined;
	const { errorInput, currentIndex, isComplete, result, handleKey } =
		useTypingState(sample.code, language);
	useKeyboardHandler(handleKey);

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
			<div className="mb-2 text-sm text-zen-text-muted">{sample.language}</div>
			<div className="mb-4 text-xs text-zen-text-faint">{sample.title}</div>
			<div
				ref={containerRef}
				className="relative max-h-[70vh] min-w-[80ch] max-w-[120ch] overflow-y-auto rounded-md bg-zen-surface p-6"
			>
				<pre className="font-code text-lg leading-relaxed whitespace-pre-wrap break-all">
					<span className="text-zen-text">{correctText}</span>
					<ErrorInput errorInput={errorInput} />
					{!isComplete ? (
						<span
							ref={cursorRef}
							className="animate-blink border-l-2 border-zen-accent"
						/>
					) : null}
					<span className="text-zen-text-faint">{remainingText}</span>
				</pre>
			</div>
			<div className="mt-4 text-sm text-zen-text-muted">
				{currentIndex} / {sample.code.length} characters
			</div>
		</div>
	);
}
