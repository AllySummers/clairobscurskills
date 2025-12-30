import { SkillCalculatorProvider, useSkillCalculator } from './context/SkillCalculatorContext.tsx';
import { defaultCharacters, skillsByCharacter } from './data/skills.ts';
import { EMPTY_SET, EMPTY_ARRAY } from './utils.ts';
import { CharacterCard } from './components/CharacterCard.tsx';
import { SaveLoadManager } from './components/SaveLoadManager.tsx';
import { CharacterVisibilityPopover } from './components/CharacterVisibilityPopover.tsx';

const AppContent = () => {
	const {
		selectedSkills,
		unallocatedSP,
		fieldSkills,
		draggedCharacter,
		visibleCharacters,
		teams,
		characterRows,
		addToTeam,
		handleRowDrop,
		createNewRow,
		deleteRow,
		handleLoad,
	} = useSkillCalculator();

	return (
		<main style={{ padding: '20px', fontFamily: 'Arial, sans-serif', overflowX: 'hidden' }}>
			<h1 style={{ marginBottom: '30px', color: '#e0e0e0' }}>
				Clair Obscur: Expedition 33 - Skill Point Calculator
			</h1>

			<div
				style={{
					display: 'flex',
					gap: '15px',
					marginBottom: '30px',
					flexWrap: 'wrap',
					alignItems: 'flex-start',
				}}
			>
				<details
					style={{
						flex: '2 1 400px',
						minWidth: '300px',
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
						Team Management
					</summary>

					<div style={{ padding: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
							{[1, 2].map((teamNum) => {
								const teamKey = `team${teamNum}` as 'team1' | 'team2';
								const team = teams[teamKey];
								return (
									<div key={teamNum}>
										<div
											style={{
												fontWeight: '600',
												marginBottom: '8px',
												color: '#e0e0e0',
											}}
										>
											Team {teamNum} ({team.length}/3)
										</div>
										<div
											style={{
												display: 'flex',
												flexWrap: 'wrap',
												gap: '6px',
											}}
										>
											{defaultCharacters.map((char) => {
												const isInTeam = team.includes(char);
												const isDisabled = team.length >= 3 && !isInTeam;
												return (
													<button
														key={char}
														onClick={() =>
															addToTeam(teamNum as 1 | 2, char)
														}
														disabled={isDisabled}
														style={{
															padding: '4px 10px',
															backgroundColor: isInTeam
																? '#2196F3'
																: '#3a3a3a',
															color: isInTeam ? '#fff' : '#aaa',
															border: 'none',
															borderRadius: '4px',
															cursor: isDisabled
																? 'not-allowed'
																: 'pointer',
															fontSize: '12px',
															opacity: isDisabled ? 0.5 : 1,
														}}
													>
														{char}
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</details>

				<div style={{ flex: '1 1 250px', minWidth: '200px' }}>
					<SaveLoadManager onLoad={handleLoad} />
				</div>

				<CharacterVisibilityPopover />
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
				{characterRows.map((row, rowIndex) => (
					<div key={rowIndex}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								marginBottom: '10px',
							}}
						>
							<span
								style={{
									fontSize: '12px',
									color: '#888',
									fontWeight: '500',
								}}
							>
								Row {rowIndex + 1}
							</span>
							<div style={{ display: 'flex', gap: '6px' }}>
								{rowIndex === characterRows.length - 1 && (
									<button
										onClick={createNewRow}
										style={{
											padding: '4px 8px',
											backgroundColor: '#3a3a3a',
											color: '#e0e0e0',
											border: '1px solid #555',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '11px',
											fontWeight: '500',
										}}
										title="Add new row"
									>
										+ New Row
									</button>
								)}
								{rowIndex > 0 && (
									<button
										onClick={() => deleteRow(rowIndex)}
										style={{
											padding: '4px 8px',
											backgroundColor: '#3a3a3a',
											color: '#ff6b6b',
											border: '1px solid #555',
											borderRadius: '4px',
											cursor: 'pointer',
											fontSize: '11px',
											fontWeight: '500',
										}}
										title="Delete this row (characters will move to Row 1)"
									>
										× Delete Row
									</button>
								)}
							</div>
						</div>
						<section
							style={{
								display: 'grid',
								gridTemplateColumns:
									'repeat(auto-fit, minmax(min(380px, 100%), 1fr))',
								gap: '30px',
							}}
							onDragOver={(e) => {
								e.preventDefault();
								e.dataTransfer.dropEffect = 'move';
							}}
							onDrop={handleRowDrop(rowIndex)}
						>
							{row.map((character) => {
								if (!visibleCharacters.has(character)) return null;

								const characterSkills = skillsByCharacter[character];
								if (!characterSkills) return null;

								const teamBadge = teams.team1.includes(character)
									? 'Team 1'
									: teams.team2.includes(character)
										? 'Team 2'
										: null;

								return (
									<div key={character} style={{ position: 'relative' }}>
										{teamBadge && (
											<div
												style={{
													position: 'absolute',
													top: '-10px',
													right: '10px',
													padding: '4px 10px',
													backgroundColor: teams.team1.includes(character)
														? '#2196F3'
														: '#9C27B0',
													color: '#fff',
													borderRadius: '12px',
													fontSize: '11px',
													fontWeight: '600',
													zIndex: 10,
												}}
											>
												{teamBadge}
											</div>
										)}
										<CharacterCard
											character={character}
											rowIndex={rowIndex}
											charSelectedSkills={
												selectedSkills[character] || EMPTY_SET
											}
											charUnallocatedSP={unallocatedSP[character] || 0}
											charFieldSkills={fieldSkills[character] || EMPTY_ARRAY}
											isDragging={draggedCharacter === character}
										/>
									</div>
								);
							})}
							{row.length === 0 && (
								<div
									style={{
										padding: '40px',
										border: '2px dashed #444',
										borderRadius: '8px',
										textAlign: 'center',
										color: '#888',
										backgroundColor: '#1a1a1a',
										gridColumn: '1 / -1',
									}}
								>
									Drag characters here to create a new row
								</div>
							)}
						</section>
					</div>
				))}
			</div>
		</main>
	);
};

export const App = () => {
	return (
		<SkillCalculatorProvider>
			<AppContent />
		</SkillCalculatorProvider>
	);
};
