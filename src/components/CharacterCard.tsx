import { useState, useMemo, useCallback, memo, type ChangeEvent } from 'react';
import type { Skill } from '../types.ts';
import { skillsByCharacter, skillLookupByCharacter } from '../data/skills.ts';
import { normalizeString } from '../utils.ts';
import { useSkillCalculatorActions } from '../context/SkillCalculatorContext.tsx';
import { SkillItem } from './SkillItem.tsx';

interface CharacterCardProps {
	character: string;
	rowIndex: number;
	charSelectedSkills: Set<string>;
	charUnallocatedSP: number;
	charFieldSkills: string[];
	isDragging: boolean;
}

export const CharacterCard = memo(
	({
		character,
		rowIndex,
		charSelectedSkills,
		charUnallocatedSP,
		charFieldSkills,
		isDragging,
	}: CharacterCardProps) => {
		const { updateUnallocatedSP, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
			useSkillCalculatorActions();

		const skills = useMemo(() => skillsByCharacter[character] ?? [], [character]);

		const handleUpdateUnallocatedSP = useCallback(
			(e: ChangeEvent<HTMLInputElement>) => {
				const num = Number(e.target.value);
				updateUnallocatedSP(character, Number.isNaN(num) ? 0 : num);
			},
			[character, updateUnallocatedSP],
		);
		const onDragStart = useMemo(
			() => handleDragStart(character, rowIndex),
			[character, rowIndex, handleDragStart],
		);
		const onDragOver = useMemo(
			() => handleDragOver(character, rowIndex),
			[character, rowIndex, handleDragOver],
		);

		const [searchQuery, setSearchQuery] = useState('');

		const { fieldSkillsList, regularSkills, gradientSkills } = useMemo(() => {
			const field: Skill[] = [];
			const regular: Skill[] = [];
			const gradient: Skill[] = [];

			const skillMap = skillLookupByCharacter[character];

			if (skillMap) {
				charFieldSkills.forEach((skillName) => {
					const skill = skillMap.get(skillName);
					if (skill) {
						field.push(skill);
					}
				});
			}

			skills.forEach((skill) => {
				if (skill.costType === 'GRADIENT') {
					gradient.push(skill);
				} else {
					regular.push(skill);
				}
			});

			return { fieldSkillsList: field, regularSkills: regular, gradientSkills: gradient };
		}, [skills, charFieldSkills, character]);

		const filteredFieldSkills = useMemo(() => {
			if (!searchQuery.trim()) return fieldSkillsList;
			const normalizedQuery = normalizeString(searchQuery);
			return fieldSkillsList.filter((skill) =>
				normalizeString(skill.name).includes(normalizedQuery),
			);
		}, [fieldSkillsList, searchQuery]);

		const filteredRegularSkills = useMemo(() => {
			if (!searchQuery.trim()) return regularSkills;
			const normalizedQuery = normalizeString(searchQuery);
			return regularSkills.filter((skill) =>
				normalizeString(skill.name).includes(normalizedQuery),
			);
		}, [regularSkills, searchQuery]);

		const filteredGradientSkills = useMemo(() => {
			if (!searchQuery.trim()) return gradientSkills;
			const normalizedQuery = normalizeString(searchQuery);
			return gradientSkills.filter((skill) =>
				normalizeString(skill.name).includes(normalizedQuery),
			);
		}, [gradientSkills, searchQuery]);

		const allocatedSP = useMemo(() => {
			let total = 0;
			skills.forEach((skill) => {
				if (charSelectedSkills.has(skill.name)) {
					total += skill.spCost || 0;
				}
			});
			return total;
		}, [charSelectedSkills, skills]);

		const totalSP = allocatedSP + charUnallocatedSP;

		const checkPrerequisitesMet = useCallback(
			(skill: Skill): boolean => {
				if (!skill.prerequisites || skill.prerequisites.length === 0) return true;

				return skill.prerequisites.every((prereq) => {
					if (prereq.type === 'SKILL') {
						return prereq.skills.every((reqSkill) =>
							charSelectedSkills.has(reqSkill.name),
						);
					}
					return true;
				});
			},
			[charSelectedSkills],
		);

		return (
			<article
				draggable
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDrop={handleDrop}
				onDragEnd={handleDragEnd}
				style={{
					border: '2px solid #444',
					padding: '15px',
					borderRadius: '8px',
					backgroundColor: isDragging ? '#1a1a1a' : '#252525',
					display: 'flex',
					flexDirection: 'column',
					opacity: isDragging ? 0.5 : 1,
					cursor: 'move',
					transition: 'opacity 0.2s, background-color 0.2s',
					minWidth: 0,
					overflow: 'hidden',
				}}
			>
				<header
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '15px',
						gap: '10px',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
						<span style={{ cursor: 'grab', fontSize: '18px', flexShrink: 0 }}>⋮⋮</span>
						<h2
							style={{
								margin: 0,
								fontSize: '1.3rem',
								minWidth: 0,
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								color: '#e0e0e0',
							}}
						>
							{character}
						</h2>
					</div>

					{character !== 'Monoco' && (
						<div
							onMouseDown={(e) => e.stopPropagation()}
							style={{
								display: 'flex',
								gap: '6px',
								alignItems: 'center',
								justifyContent: 'flex-end',
								flexShrink: 0,
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '4px',
									fontSize: '12px',
									padding: '3px 8px',
									backgroundColor: '#3a3a3a',
									borderRadius: '12px',
									flexShrink: 0,
								}}
							>
								<label
									htmlFor={`available-${character}`}
									style={{
										whiteSpace: 'nowrap',
										fontWeight: '500',
										color: '#e0e0e0',
									}}
								>
									Available:
								</label>
								<input
									id={`available-${character}`}
									name={`available-${character}`}
									type="number"
									min="0"
									value={charUnallocatedSP}
									onChange={handleUpdateUnallocatedSP}
									style={{
										width: '40px',
										padding: '2px 3px',
										fontSize: '12px',
										borderRadius: '4px',
										border: '1px solid #444',
										textAlign: 'center',
										cursor: 'text',
										backgroundColor: '#2a2a2a',
										color: '#e0e0e0',
									}}
								/>
							</div>

							<div
								style={{
									fontSize: '12px',
									padding: '3px 8px',
									backgroundColor: '#4CAF50',
									color: '#1a1a1a',
									borderRadius: '12px',
									fontWeight: '600',
									whiteSpace: 'nowrap',
									flexShrink: 0,
								}}
							>
								Spent: {allocatedSP}
							</div>

							<div
								style={{
									fontSize: '12px',
									padding: '3px 8px',
									backgroundColor: '#666',
									color: '#e0e0e0',
									borderRadius: '12px',
									fontWeight: '600',
									whiteSpace: 'nowrap',
									flexShrink: 0,
								}}
							>
								Total: {totalSP}
							</div>
						</div>
					)}
				</header>

				<input
					id={`search-${character}`}
					name={`search-${character}`}
					type="text"
					placeholder="Search skills..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onMouseDown={(e) => e.stopPropagation()}
					style={{
						width: '100%',
						padding: '8px',
						marginBottom: '10px',
						fontSize: '14px',
						borderRadius: '4px',
						border: '1px solid #444',
						boxSizing: 'border-box',
						cursor: 'text',
						backgroundColor: '#2a2a2a',
						color: '#e0e0e0',
					}}
				/>

				<section
					draggable={false}
					onDragStart={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()}
					style={{
						maxHeight: '80vh',
						overflowY: 'auto',
						flex: 1,
						cursor: 'default',
						display: 'flex',
						flexDirection: 'column',
						gap: '8px',
					}}
				>
					{/* Field Skills */}
					{filteredFieldSkills.length > 0 && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							<h3
								style={{
									margin: '0',
									padding: '8px',
									backgroundColor: '#2196F3',
									color: '#fff',
									borderRadius: '4px',
									fontSize: '14px',
									fontWeight: '600',
								}}
							>
								Field Skills ({filteredFieldSkills.length}/6)
							</h3>
							{filteredFieldSkills.map((skill) => (
								<SkillItem
									key={`field-${skill.name}`}
									skill={skill}
									character={character}
									isSelected={charSelectedSkills.has(skill.name)}
									prerequisitesMet={checkPrerequisitesMet(skill)}
									isFieldSkill={true}
									showDescriptionInline={true}
								/>
							))}
							<hr
								style={{
									border: 'none',
									borderTop: '2px solid #444',
									margin: '0',
								}}
							/>
						</div>
					)}

					{/* Regular Skills */}
					{filteredRegularSkills.length > 0 ? (
						filteredRegularSkills.map((skill) => (
							<SkillItem
								key={skill.name}
								skill={skill}
								character={character}
								isSelected={charSelectedSkills.has(skill.name)}
								prerequisitesMet={checkPrerequisitesMet(skill)}
								isFieldSkill={charFieldSkills.includes(skill.name)}
								canBeFieldSkill={
									charFieldSkills.length < 6 ||
									charFieldSkills.includes(skill.name)
								}
							/>
						))
					) : searchQuery.trim() && filteredFieldSkills.length === 0 ? (
						<div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
							No regular skills found
						</div>
					) : null}

					{/* Gradient Skills */}
					{filteredGradientSkills.length > 0 && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}
						>
							<h3
								style={{
									margin: '0',
									padding: '8px',
									backgroundColor: '#333',
									color: '#e0e0e0',
									borderRadius: '4px',
									fontSize: '14px',
									fontWeight: '600',
								}}
							>
								Gradient Skills
							</h3>
							{filteredGradientSkills.map((skill) => (
								<SkillItem
									key={skill.name}
									skill={skill}
									character={character}
									isSelected={false}
									prerequisitesMet={true}
									isGradient={true}
								/>
							))}
						</div>
					)}

					{filteredRegularSkills.length === 0 &&
						filteredGradientSkills.length === 0 &&
						filteredFieldSkills.length === 0 && (
							<div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
								No skills found
							</div>
						)}
				</section>
			</article>
		);
	},
);
