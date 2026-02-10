import { useCallback, useState } from "react";
import type { Language } from "../data/languages";

export interface TypingResult {
	readonly elapsedTime: number;
	readonly totalKeystrokes: number;
	readonly keystrokesPerSecond: number;
	readonly backspaceCount: number;
}

interface TypingState {
	readonly currentIndex: number;
	readonly errorInput: string;
	readonly startTime: number | null;
	readonly endTime: number | null;
	readonly backspaceCount: number;
	readonly totalKeystrokes: number;
}

type CommentConfig = Pick<Language, "lineCommentTokens" | "blockCommentPairs">;

const defaultCommentConfig: CommentConfig = {
	lineCommentTokens: [],
	blockCommentPairs: [],
};

function keyToChar(key: string): string {
	if (key === "Enter") return "\n";
	if (key === "Tab") return "\t";
	return key;
}

function findLineStart(code: string, index: number): number {
	const lastNewline = code.lastIndexOf("\n", Math.max(index - 1, 0));
	return lastNewline === -1 ? 0 : lastNewline + 1;
}

function findIndentEnd(code: string, lineStart: number): number {
	let current = lineStart;
	while (current < code.length) {
		const char = code[current];
		if (char !== " " && char !== "\t") break;
		current += 1;
	}
	return current;
}

function findCommentEnd(
	code: string,
	index: number,
	commentConfig: CommentConfig,
): number | null {
	for (const token of commentConfig.lineCommentTokens) {
		if (!code.startsWith(token, index)) continue;
		const newlineIndex = code.indexOf("\n", index + token.length);
		return newlineIndex === -1 ? code.length : newlineIndex + 1;
	}

	for (const pair of commentConfig.blockCommentPairs) {
		if (!code.startsWith(pair.start, index)) continue;
		const endIndex = code.indexOf(pair.end, index + pair.start.length);
		return endIndex === -1 ? code.length : endIndex + pair.end.length;
	}

	return null;
}

function findSkippableRegionEnd(
	code: string,
	index: number,
	commentConfig: CommentConfig,
): number {
	let current = index;
	while (current < code.length) {
		const lineStart = findLineStart(code, current);
		const indentEnd = findIndentEnd(code, lineStart);
		if (current >= lineStart && current <= indentEnd && indentEnd > current) {
			current = indentEnd;
			continue;
		}

		const commentEnd = findCommentEnd(code, current, commentConfig);
		if (commentEnd !== null && commentEnd > current) {
			current = commentEnd;
			continue;
		}

		let possibleCommentStart = current;
		while (
			possibleCommentStart < code.length &&
			(code[possibleCommentStart] === " " ||
				code[possibleCommentStart] === "\t")
		) {
			possibleCommentStart += 1;
		}
		if (possibleCommentStart > current && code[possibleCommentStart] !== "\n") {
			const spacedCommentEnd = findCommentEnd(
				code,
				possibleCommentStart,
				commentConfig,
			);
			if (
				spacedCommentEnd !== null &&
				spacedCommentEnd > possibleCommentStart
			) {
				current = spacedCommentEnd;
				continue;
			}
		}

		break;
	}

	return current;
}

function findLeadingCommentsAndBlankLinesEnd(
	code: string,
	commentConfig: CommentConfig,
): number {
	let current = 0;
	while (current < code.length) {
		const lineStart = current;
		const nonWhitespace = findIndentEnd(code, lineStart);
		const firstChar = code[nonWhitespace];

		if (firstChar === "\n") {
			current = nonWhitespace + 1;
			continue;
		}

		const commentEnd = findCommentEnd(code, nonWhitespace, commentConfig);
		if (commentEnd !== null && commentEnd > nonWhitespace) {
			current = commentEnd;
			continue;
		}

		break;
	}

	return current;
}

function findSkippedRegionStart(
	code: string,
	regionEnd: number,
	commentConfig: CommentConfig,
): number | null {
	for (let start = 0; start < regionEnd; start += 1) {
		const end = findSkippableRegionEnd(code, start, commentConfig);
		if (end === regionEnd && end > start) {
			return start;
		}
	}

	return null;
}

function createInitialState(
	code: string,
	commentConfig: CommentConfig,
): TypingState {
	return {
		currentIndex: findLeadingCommentsAndBlankLinesEnd(code, commentConfig),
		errorInput: "",
		startTime: null,
		endTime: null,
		backspaceCount: 0,
		totalKeystrokes: 0,
	};
}

export function useTypingState(code: string, language?: Language) {
	const commentConfig = language ?? defaultCommentConfig;
	const [state, setState] = useState<TypingState>(() =>
		createInitialState(code, commentConfig),
	);

	const currentIndex = state.currentIndex;
	const isComplete = state.currentIndex === code.length;

	const result: TypingResult | null =
		isComplete && state.startTime !== null && state.endTime !== null
			? {
					elapsedTime: (state.endTime - state.startTime) / 1000,
					totalKeystrokes: state.totalKeystrokes,
					keystrokesPerSecond:
						state.totalKeystrokes / ((state.endTime - state.startTime) / 1000),
					backspaceCount: state.backspaceCount,
				}
			: null;

	const handleKey = useCallback(
		(key: string) => {
			setState((prev) => {
				if (prev.currentIndex === code.length) return prev;

				if (key === "Backspace") {
					if (prev.errorInput.length > 0) {
						return {
							...prev,
							errorInput: prev.errorInput.slice(0, -1),
							backspaceCount: prev.backspaceCount + 1,
						};
					}

					if (prev.currentIndex === 0) return prev;

					const skippedRegionStart = findSkippedRegionStart(
						code,
						prev.currentIndex,
						commentConfig,
					);
					if (skippedRegionStart !== null) {
						const lineStart = findLineStart(code, skippedRegionStart);
						const targetIndex =
							skippedRegionStart === lineStart && skippedRegionStart > 0
								? skippedRegionStart - 1
								: skippedRegionStart;
						return {
							...prev,
							currentIndex: targetIndex,
							backspaceCount: prev.backspaceCount + 1,
						};
					}

					return {
						...prev,
						currentIndex: prev.currentIndex - 1,
						backspaceCount: prev.backspaceCount + 1,
					};
				}

				const now = Date.now();
				const typedChar = keyToChar(key);

				if (prev.errorInput.length > 0) {
					return {
						...prev,
						errorInput: prev.errorInput + typedChar,
						startTime: prev.startTime ?? now,
						totalKeystrokes: prev.totalKeystrokes + 1,
					};
				}

				if (key === "Tab") {
					const newIndex = findSkippableRegionEnd(
						code,
						prev.currentIndex,
						commentConfig,
					);
					if (newIndex > prev.currentIndex) {
						const isNowComplete = newIndex === code.length;
						return {
							...prev,
							currentIndex: newIndex,
							startTime: prev.startTime ?? now,
							endTime: isNowComplete ? now : prev.endTime,
							totalKeystrokes: prev.totalKeystrokes + 1,
						};
					}
				}

				const expectedChar = code[prev.currentIndex] ?? "";
				if (typedChar === expectedChar) {
					const newIndex = findSkippableRegionEnd(
						code,
						prev.currentIndex + 1,
						commentConfig,
					);
					const isNowComplete = newIndex === code.length;
					return {
						...prev,
						currentIndex: newIndex,
						startTime: prev.startTime ?? now,
						endTime: isNowComplete ? now : prev.endTime,
						totalKeystrokes: prev.totalKeystrokes + 1,
					};
				}

				return {
					...prev,
					errorInput: typedChar,
					startTime: prev.startTime ?? now,
					totalKeystrokes: prev.totalKeystrokes + 1,
				};
			});
		},
		[code, commentConfig],
	);

	return {
		errorInput: state.errorInput,
		startTime: state.startTime,
		currentIndex,
		isComplete,
		result,
		handleKey,
	};
}
