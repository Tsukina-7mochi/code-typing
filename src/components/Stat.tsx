interface StatProps {
	readonly label: string;
	readonly value: string;
}

export function Stat({ label, value }: StatProps) {
	return (
		<div className="rounded-lg bg-gray-800 p-4 text-center">
			<div className="text-2xl font-bold text-white">{value}</div>
			<div className="text-sm text-gray-400">{label}</div>
		</div>
	);
}
