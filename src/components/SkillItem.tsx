import { memo, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
	useFloating,
	offset,
	flip,
	shift,
	autoUpdate,
	useHover,
	useFocus,
	useDismiss,
	useInteractions,
	FloatingPortal,
} from '@floating-ui/react';
import type { Skill } from '../types.ts';
import { FaLock, FaLockOpen, FaPlus, FaMinus } from './icons.tsx';
import { useSkillCalculatorActions } from '../context/SkillCalculatorContext.tsx';

interface SkillItemProps {
	skill: Skill;
	character: string;
	isSelected: boolean;
	isGradient?: boolean;
	prerequisitesMet?: boolean;
	isFieldSkill?: boolean;
	canBeFieldSkill?: boolean;
	showDescriptionInline?: boolean;
}

export const SkillItem = memo(
	({
		skill,
		character,
		isSelected,
		isGradient = false,
		prerequisitesMet = true,
		isFieldSkill = false,
		canBeFieldSkill = true,
		showDescriptionInline = false,
	}: SkillItemProps) => {
		const { toggleSkill, toggleFieldSkill } = useSkillCalculatorActions();
		// Format prerequisite HTML for display with clickable skill links
	const prerequisiteHTML = useMemo(() => {
		if (!skill.prerequisites || skill.prerequisites.length === 0) return null;

		const parts: string[] = [];
		skill.prerequisites.forEach((prereq) => {
			if (prereq.type === 'SKILL' && prereq.skills.length > 0) {
				const skillLinks = prereq.skills
					.map(
						(s) =>
							`<span class="prereq-skill" data-skill-name="${s.name}" style="color: #4CAF50; cursor: pointer; text-decoration: underline;">${s.name}</span>`,
					)
					.join(' or ');
				parts.push(`Skills: ${skillLinks}`);
			} else if (prereq.type === 'RELATIONSHIP') {
				parts.push(`Relationship: ${prereq.character} (Lvl ${prereq.level})`);
			} else if (prereq.type === 'ENEMY') {
				parts.push(`Enemy: ${prereq.name}`);
			}
		});

		return parts.length > 0 ? parts.join(' | ') : null;
	}, [skill.prerequisites]);

		const isDisabled = isGradient || (!isSelected && !prerequisitesMet);
		const containerRef = useRef<HTMLDivElement>(null);
		const [isFocused, setIsFocused] = useState(false);
		const focusTimeoutRef = useRef<number | null>(null);

		// Show inline only when explicitly requested (for field skills section at top)
		const showInline = showDescriptionInline && skill.description;

		// Determine if we should show popover (when not showing inline)
		const hasPopoverContent =
			!showDescriptionInline && !!(skill.description || prerequisiteHTML);

		// Floating UI for tooltip positioning
		const [isTooltipOpen, setIsTooltipOpen] = useState(false);

		const { refs, floatingStyles, context } = useFloating({
			open: isTooltipOpen,
			onOpenChange: setIsTooltipOpen,
			placement: 'top-start',
			middleware: [offset(8), flip(), shift({ padding: 8 })],
			whileElementsMounted: autoUpdate,
		});

		const hover = useHover(context, {
			delay: { open: 300, close: 100 },
			enabled: hasPopoverContent,
		});
		const focus = useFocus(context, { enabled: hasPopoverContent });
		const dismiss = useDismiss(context, { ancestorScroll: true });

		const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss]);

		const handlePrereqClick = (e: React.MouseEvent) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('prereq-skill')) {
				const skillName = target.getAttribute('data-skill-name');
				if (skillName) {
					// Find and scroll to the skill
					const skillElement = document.querySelector(
						`[data-skill-id="${skill.character}-${skillName.replace(/\s+/g, '-')}"]`,
					) as HTMLElement;
					if (skillElement) {
						skillElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

						// Trigger focus effect on target skill
						skillElement.dispatchEvent(new CustomEvent('skill-focus'));
					}
				}
			}
		};

		// Listen for focus events
		useEffect(() => {
			const handleFocus = () => {
				setIsFocused(true);

				// Clear any existing timeout
				if (focusTimeoutRef.current !== null) {
					clearTimeout(focusTimeoutRef.current);
				}

				// Remove focus after 2 seconds
				focusTimeoutRef.current = window.setTimeout(() => {
					setIsFocused(false);
					focusTimeoutRef.current = null;
				}, 2000);
			};

			const element = containerRef.current;
			if (element) {
				element.addEventListener('skill-focus', handleFocus);
				return () => {
					element.removeEventListener('skill-focus', handleFocus);
					if (focusTimeoutRef.current !== null) {
						clearTimeout(focusTimeoutRef.current);
					}
				};
			}
		}, []);

		// Merge refs for floating-ui and internal use
		const setRefs = useCallback(
			(node: HTMLDivElement | null) => {
				containerRef.current = node;
				refs.setReference(node);
			},
			[refs],
		);

		return (
			<>
				<div
					ref={setRefs}
					id={`skill-${skill.character}-${skill.name.replace(/\s+/g, '-')}`}
					data-skill-id={`${skill.character}-${skill.name.replace(/\s+/g, '-')}`}
					style={{
						display: 'flex',
						flexDirection: 'column',
						padding: '8px',
						backgroundColor: isGradient ? '#1a1a1a' : '#2a2a2a',
						borderRadius: '4px',
						border: '2px solid',
						borderColor: isSelected ? '#4CAF50' : isDisabled ? '#333' : '#444',
						opacity: isDisabled ? 0.4 : 1,
						cursor: isDisabled ? 'not-allowed' : 'pointer',
						position: 'relative',
						boxShadow: isFocused
							? '0 0 0 3px #2196F3'
							: isSelected
								? 'inset -4px 0 0 0 #4CAF50'
								: undefined,
						transition: 'box-shadow 0.2s ease',
					}}
					{...getReferenceProps()}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div
							onClick={(e) => {
								e.stopPropagation();
								if (!isDisabled) {
									toggleSkill(character, skill.name);
								}
							}}
							style={{
								width: '20px',
								height: '20px',
								marginRight: '10px',
								flexShrink: 0,
								fill: isSelected ? '#4CAF50' : isDisabled ? '#555' : '#888',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: isDisabled ? 'not-allowed' : 'pointer',
							}}
						>
							{isSelected ? <FaLockOpen /> : <FaLock />}
						</div>
						{skill.nameImg && (
							<img
								src={skill.nameImg}
								alt={skill.name}
								style={{
									width: '32px',
									height: '32px',
									marginRight: '10px',
									borderRadius: '4px',
									objectFit: 'cover',
									filter: isSelected ? 'none' : 'grayscale(100%) brightness(0.6)',
									opacity: isSelected ? 1 : 0.7,
									transition: 'filter 0.2s, opacity 0.2s',
								}}
							/>
						)}
						<div
							style={{
								flex: 1,
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								gap: '10px',
							}}
						>
							<span style={{ flex: 1 }}>{skill.name}</span>
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								{character !== 'Monoco' && (
									<span
										style={{
											fontWeight: 'bold',
											color: '#aaa',
											fontSize: '14px',
											textDecoration: isSelected ? 'line-through' : 'none',
											whiteSpace: 'nowrap',
										}}
									>
										{skill.spCost !== undefined ? `${skill.spCost} SP` : ''}
									</span>
								)}
								{!isGradient && (
									<div
										onClick={(e) => {
											e.stopPropagation();
											if (isSelected || isFieldSkill) {
												toggleFieldSkill(character, skill.name);
											}
										}}
										style={{
											width: '20px',
											height: '20px',
											marginLeft: '10px',
											flexShrink: 0,
											fill: isFieldSkill ? '#2196F3' : '#555',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor:
												isSelected || isFieldSkill
													? canBeFieldSkill || isFieldSkill
														? 'pointer'
														: 'not-allowed'
													: 'not-allowed',
											opacity: !isSelected && !isFieldSkill ? 0.3 : 1,
										}}
										title={
											!isSelected && !isFieldSkill
												? 'Unlock skill first to use as field skill'
												: !canBeFieldSkill && !isFieldSkill
													? 'Maximum 6 field skills reached'
													: isFieldSkill
														? 'Remove from field skills'
														: 'Add to field skills'
										}
									>
										{isFieldSkill ? <FaMinus /> : <FaPlus />}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Show description inline (only in field skills section at top) */}
					{showInline && (
						<div
							className="skill-description"
							style={{
								marginTop: '8px',
								padding: '8px',
								backgroundColor: '#1a1a1a',
								borderRadius: '4px',
								fontSize: '13px',
								color: '#ccc',
								borderLeft: '3px solid #2196F3',
							}}
							dangerouslySetInnerHTML={{ __html: skill.description }}
						/>
					)}

					{/* Show prerequisites inline when showing description inline */}
					{showDescriptionInline && prerequisiteHTML && (
						<div
							className="skill-prerequisite"
							style={{
								marginTop: '4px',
								padding: '6px 8px',
								backgroundColor: '#2a1a1a',
								borderRadius: '4px',
								fontSize: '12px',
								color: '#ffb74d',
								borderLeft: '3px solid #ff9800',
								fontStyle: 'italic',
							}}
							onClick={handlePrereqClick}
						>
							<strong>Prerequisites:</strong>{' '}
							<span dangerouslySetInnerHTML={{ __html: prerequisiteHTML || '' }} />
						</div>
					)}
				</div>
				{/* Floating UI Tooltip */}
				{isTooltipOpen && hasPopoverContent && (
					<FloatingPortal>
						<div
							ref={refs.setFloating}
							style={{
								...floatingStyles,
								backgroundColor: '#1e1e1e',
								border: '1px solid #444',
								borderRadius: '6px',
								padding: '10px 12px',
								maxWidth: '350px',
								zIndex: 1000,
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
								userSelect: 'text',
								cursor: 'auto',
							}}
							{...getFloatingProps()}
							onClick={handlePrereqClick}
						>
							{skill.description && (
								<div
									className="skill-description"
									style={{
										fontSize: '13px',
										color: '#ccc',
										marginBottom: prerequisiteHTML ? '12px' : '0',
										borderLeft: '3px solid #2196F3',
										paddingLeft: '8px',
									}}
									dangerouslySetInnerHTML={{ __html: skill.description }}
								/>
							)}
							{prerequisiteHTML && (
								<div
									className="skill-prerequisite"
									style={{
										fontSize: '12px',
										color: '#ffb74d',
										borderLeft: '3px solid #ff9800',
										paddingLeft: '8px',
										fontStyle: 'italic',
									}}
								>
									<strong>Prerequisites:</strong>{' '}
									<span
										dangerouslySetInnerHTML={{ __html: prerequisiteHTML || '' }}
									/>
								</div>
							)}
						</div>
					</FloatingPortal>
				)}
			</>
		);
	},
);
SkillItem.displayName = 'SkillItem';
