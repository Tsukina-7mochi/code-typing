import { useKeyboardHandler } from "./useKeyboardHandler";
import { useTypingState } from "./useTypingState";

export type { TypingResult } from "./useTypingState";

export function useTypingGame(code: string) {
	const { typed, startTime, currentIndex, isComplete, result, handleKey } =
		useTypingState(code);

	useKeyboardHandler(handleKey);

	return {
		typed,
		startTime,
		currentIndex,
		isComplete,
		result,
	};
}
