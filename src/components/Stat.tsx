interface StatProps {
	readonly label: string;
	readonly value: string;
}

export function Stat({ label, value }: StatProps) {
	return (
		<div className="rounded-md bg-zen-surface p-4 text-center">
			<div className="text-2xl font-bold text-zen-text">{value}</div>
			<div className="text-sm text-zen-text-muted">{label}</div>
		</div>
	);
}
