import type { RefObject } from "react";

interface CursorProps {
	readonly ref: RefObject<HTMLSpanElement | null>;
}

export function Cursor({ ref }: CursorProps) {
	return (
		<>
			<span ref={ref} style={{ anchorName: "--cursor" }} />
			<span
				style={{
					positionAnchor: "--cursor",
					left: "anchor(left)",
					top: "anchor(top)",
					bottom: "anchor(bottom)",
				}}
				className="absolute w-0.5 bg-zen-accent animate-blink"
			/>
		</>
	);
}
