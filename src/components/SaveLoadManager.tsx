import { useState, useEffect } from 'react';
import type { SaveData, NamedSave } from '../types.ts';

interface SaveLoadManagerProps {
	onLoad: (data: SaveData) => void;
}

export const SaveLoadManager = ({ onLoad }: SaveLoadManagerProps) => {
	const [saveName, setSaveName] = useState('');
	const [savedStates, setSavedStates] = useState<NamedSave[]>([]);

	useEffect(() => {
		const saved = localStorage.getItem('namedSaves');
		if (saved) {
			setSavedStates(JSON.parse(saved));
		}
	}, []);

	const saveNamedState = () => {
		if (!saveName.trim()) return;

		const currentData = localStorage.getItem('skillCalculatorData');
		if (!currentData) return;

		const newSave: NamedSave = {
			name: saveName.trim(),
			data: JSON.parse(currentData),
			timestamp: Date.now(),
		};

		const updated = [...savedStates, newSave];
		setSavedStates(updated);
		localStorage.setItem('namedSaves', JSON.stringify(updated));
		setSaveName('');
	};

	const loadNamedState = (save: NamedSave) => {
		onLoad(save.data);
	};

	const deleteNamedState = (index: number) => {
		const updated = savedStates.filter((_, i) => i !== index);
		setSavedStates(updated);
		localStorage.setItem('namedSaves', JSON.stringify(updated));
	};

	return (
		<details
			style={{
				marginBottom: '30px',
				border: '2px solid #444',
				borderRadius: '8px',
				backgroundColor: '#252525',
			}}
		>
			<summary
				style={{
					padding: '12px 15px',
					backgroundColor: '#333',
					color: '#e0e0e0',
					borderRadius: '6px',
					cursor: 'pointer',
					fontSize: '16px',
					fontWeight: '600',
					userSelect: 'none',
				}}
			>
				Save / Load Builds
			</summary>

			<div style={{ padding: '15px' }}>
				<div style={{ marginBottom: '20px' }}>
					<h3 style={{ marginTop: 0, marginBottom: '10px', color: '#e0e0e0' }}>
						Save Current Build
					</h3>
					<div style={{ display: 'flex', gap: '10px' }}>
						<input
							id="build-name"
							name="build-name"
							type="text"
							placeholder="Enter build name..."
							value={saveName}
							onChange={(e) => setSaveName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && saveNamedState()}
							style={{
								flex: 1,
								padding: '8px',
								fontSize: '14px',
								borderRadius: '4px',
								border: '1px solid #444',
								backgroundColor: '#2a2a2a',
								color: '#e0e0e0',
							}}
						/>
						<button
							onClick={saveNamedState}
							disabled={!saveName.trim()}
							style={{
								padding: '8px 20px',
								backgroundColor: '#4CAF50',
								color: '#fff',
								border: 'none',
								borderRadius: '4px',
								cursor: saveName.trim() ? 'pointer' : 'not-allowed',
								fontSize: '14px',
								fontWeight: '600',
								opacity: saveName.trim() ? 1 : 0.5,
							}}
						>
							Save
						</button>
					</div>
				</div>

				{savedStates.length > 0 && (
					<div>
						<h3 style={{ marginTop: 0, marginBottom: '10px', color: '#e0e0e0' }}>
							Saved Builds
						</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							{savedStates.map((save, index) => (
								<div
									key={index}
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '10px',
										backgroundColor: '#2a2a2a',
										borderRadius: '4px',
										border: '1px solid #444',
									}}
								>
									<div>
										<div style={{ fontWeight: '600', color: '#e0e0e0' }}>
											{save.name}
										</div>
										<div style={{ fontSize: '12px', color: '#888' }}>
											{new Date(save.timestamp).toLocaleString()}
										</div>
									</div>
									<div style={{ display: 'flex', gap: '8px' }}>
										<button
											onClick={() => loadNamedState(save)}
											style={{
												padding: '6px 16px',
												backgroundColor: '#2196F3',
												color: '#fff',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '13px',
											}}
										>
											Load
										</button>
										<button
											onClick={() => deleteNamedState(index)}
											style={{
												padding: '6px 16px',
												backgroundColor: '#f44336',
												color: '#fff',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '13px',
											}}
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</details>
	);
};

