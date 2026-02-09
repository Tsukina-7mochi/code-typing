import { useEffect } from "react";

function isTypableKey(key: string): boolean {
	return (
		key === "Backspace" || key === "Enter" || key === "Tab" || key.length === 1
	);
}

export function useKeyboardHandler(onKey: (key: string) => void) {
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (!isTypableKey(event.key)) return;
			event.preventDefault();
			onKey(event.key);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [onKey]);
}
