import { useKeyboardHandler } from "./useKeyboardHandler";
import { useTypingState } from "./useTypingState";

export type { TypingResult } from "./useTypingState";

export function useTypingGame(code: string) {
	const { errorInput, startTime, currentIndex, isComplete, result, handleKey } =
		useTypingState(code);

	useKeyboardHandler(handleKey);

	return {
		errorInput,
		startTime,
		currentIndex,
		isComplete,
		result,
	};
}
