import { useState } from 'react';
import { defaultCharacters } from '../data/skills.ts';
import { useSkillCalculator } from '../context/SkillCalculatorContext.tsx';
import { FaEye, FaEyeSlash } from './icons.tsx';

export const CharacterVisibilityPopover = () => {
	const { visibleCharacters, toggleCharacterVisibility } = useSkillCalculator();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div style={{ position: 'relative' }}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				style={{
					padding: '12px 15px',
					backgroundColor: '#333',
					color: '#e0e0e0',
					border: '2px solid #444',
					borderRadius: '8px',
					cursor: 'pointer',
					fontSize: '16px',
					fontWeight: '600',
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					whiteSpace: 'nowrap',
				}}
			>
				<span style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
					{isOpen ? <FaEye /> : <FaEyeSlash />}
				</span>
				<span>Characters</span>
			</button>

			{isOpen && (
				<>
					<div
						onClick={() => setIsOpen(false)}
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 999,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: '100%',
							right: 0,
							marginTop: '8px',
							padding: '15px',
							backgroundColor: '#252525',
							border: '2px solid #444',
							borderRadius: '8px',
							zIndex: 1000,
							minWidth: '250px',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
						}}
					>
						<h3 style={{ marginTop: 0, marginBottom: '10px', color: '#e0e0e0' }}>
							Visible Characters
						</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
							{defaultCharacters.map((char) => (
								<button
									key={char}
									onClick={() => toggleCharacterVisibility(char)}
									style={{
										padding: '8px 12px',
										backgroundColor: visibleCharacters.has(char)
											? '#4CAF50'
											: '#3a3a3a',
										color: visibleCharacters.has(char) ? '#1a1a1a' : '#e0e0e0',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '14px',
										fontWeight: '600',
										textAlign: 'left',
									}}
								>
									{visibleCharacters.has(char) ? '✓ ' : ''}
									{char}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};
