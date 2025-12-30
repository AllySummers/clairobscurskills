import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
	type ReactNode,
} from 'react';
import type { SaveData } from '../types.ts';
import { defaultCharacters } from '../data/skills.ts';

// Split into two contexts: Actions (stable) and State (changes frequently)

interface SkillCalculatorActionsType {
	toggleSkill: (character: string, skillName: string) => void;
	updateUnallocatedSP: (character: string, value: number) => void;
	toggleFieldSkill: (character: string, skillName: string) => void;
	toggleCharacterVisibility: (character: string) => void;
	addToTeam: (teamNum: 1 | 2, character: string) => void;
	handleDragStart: (character: string, rowIndex: number) => (e: React.DragEvent) => void;
	handleDragOver: (character: string, rowIndex: number) => (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	handleDragEnd: () => void;
	handleRowDrop: (rowIndex: number) => (e: React.DragEvent) => void;
	createNewRow: () => void;
	deleteRow: (rowIndex: number) => void;
	handleLoad: (data: SaveData) => void;
	resetCharacter: (character: string, totalSP: number) => void;
}

interface SkillCalculatorStateType {
	selectedSkills: Record<string, Set<string>>;
	unallocatedSP: Record<string, number>;
	visibleCharacters: Set<string>;
	teams: { team1: string[]; team2: string[] };
	fieldSkills: Record<string, string[]>;
	characterRows: string[][];
	draggedCharacter: string | null;
}

// Actions context - stable, never changes after mount
const SkillCalculatorActionsContext = createContext<SkillCalculatorActionsType | null>(null);

// State context - changes when state updates
const SkillCalculatorStateContext = createContext<SkillCalculatorStateType | null>(null);

// Hook for components that need ONLY callbacks (won't re-render on state changes)
export const useSkillCalculatorActions = () => {
	const context = useContext(SkillCalculatorActionsContext);
	if (!context) {
		throw new Error('useSkillCalculatorActions must be used within a SkillCalculatorProvider');
	}
	return context;
};

// Hook for components that need state (will re-render on state changes)
export const useSkillCalculatorState = () => {
	const context = useContext(SkillCalculatorStateContext);
	if (!context) {
		throw new Error('useSkillCalculatorState must be used within a SkillCalculatorProvider');
	}
	return context;
};

// Combined hook for convenience (components using this WILL re-render on state changes)
export const useSkillCalculator = () => {
	const actions = useSkillCalculatorActions();
	const state = useSkillCalculatorState();
	return { ...actions, ...state };
};

export const SkillCalculatorProvider = ({ children }: { children: ReactNode }) => {
	// Load from localStorage or use defaults
	const [selectedSkills, setSelectedSkills] = useState<Record<string, Set<string>>>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			const result: Record<string, Set<string>> = {};
			Object.entries(data.selectedSkills).forEach(([char, skills]) => {
				result[char] = new Set(skills);
			});
			return result;
		}
		return defaultCharacters.reduce((acc, char) => ({ ...acc, [char]: new Set<string>() }), {});
	});

	const [unallocatedSP, setUnallocatedSP] = useState<Record<string, number>>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			return data.unallocatedSP;
		}
		return defaultCharacters.reduce((acc, char) => ({ ...acc, [char]: 0 }), {});
	});

	const [characterOrder, setCharacterOrder] = useState<string[]>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			return data.characterOrder || defaultCharacters;
		}
		return defaultCharacters;
	});

	const [visibleCharacters, setVisibleCharacters] = useState<Set<string>>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			return new Set(data.visibleCharacters || defaultCharacters);
		}
		return new Set(defaultCharacters);
	});

	const [teams, setTeams] = useState<{ team1: string[]; team2: string[] }>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			return data.teams || { team1: [], team2: [] };
		}
		return { team1: [], team2: [] };
	});

	const [fieldSkills, setFieldSkills] = useState<Record<string, string[]>>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			return data.fieldSkills || {};
		}
		return defaultCharacters.reduce((acc, char) => ({ ...acc, [char]: [] }), {});
	});

	const [characterRows, setCharacterRows] = useState<string[][]>(() => {
		const saved = localStorage.getItem('skillCalculatorData');
		if (saved) {
			const data: SaveData = JSON.parse(saved);
			if (data.characterRows && data.characterRows.length > 0) {
				return data.characterRows;
			}
		}
		return [defaultCharacters];
	});

	const [draggedCharacter, setDraggedCharacter] = useState<string | null>(null);
	const [draggedFromRow, setDraggedFromRow] = useState<number | null>(null);

	// Save to localStorage whenever state changes
	useEffect(() => {
		const dataToSave: SaveData = {
			selectedSkills: Object.fromEntries(
				Object.entries(selectedSkills).map(([char, skills]) => [char, Array.from(skills)]),
			),
			unallocatedSP,
			characterOrder,
			visibleCharacters: Array.from(visibleCharacters),
			teams,
			fieldSkills,
			characterRows,
		};
		localStorage.setItem('skillCalculatorData', JSON.stringify(dataToSave));
	}, [
		selectedSkills,
		unallocatedSP,
		characterOrder,
		visibleCharacters,
		teams,
		fieldSkills,
		characterRows,
	]);

	// Use refs to access state without adding as dependencies
	const selectedSkillsRef = useRef(selectedSkills);
	selectedSkillsRef.current = selectedSkills;

	const characterRowsRef = useRef(characterRows);
	characterRowsRef.current = characterRows;

	const draggedCharacterRef = useRef(draggedCharacter);
	draggedCharacterRef.current = draggedCharacter;

	const draggedFromRowRef = useRef(draggedFromRow);
	draggedFromRowRef.current = draggedFromRow;

	const toggleSkill = useCallback((character: string, skillName: string) => {
		const wasSelected = selectedSkillsRef.current[character]?.has(skillName) ?? false;

		setSelectedSkills((prev) => {
			const charSet = new Set(prev[character]);
			if (wasSelected) {
				charSet.delete(skillName);
			} else {
				charSet.add(skillName);
			}
			return { ...prev, [character]: charSet };
		});

		if (wasSelected) {
			setFieldSkills((prevFieldSkills) => {
				const charFieldSkills = prevFieldSkills[character] || [];
				if (charFieldSkills.includes(skillName)) {
					return {
						...prevFieldSkills,
						[character]: charFieldSkills.filter((s) => s !== skillName),
					};
				}
				return prevFieldSkills;
			});
		}
	}, []);

	const updateUnallocatedSP = useCallback((character: string, value: number) => {
		setUnallocatedSP((prev) => ({
			...prev,
			[character]: value,
		}));
	}, []);

	const handleLoad = useCallback((data: SaveData) => {
		const loadedSkills: Record<string, Set<string>> = {};
		Object.entries(data.selectedSkills).forEach(([char, skills]) => {
			loadedSkills[char] = new Set(skills);
		});
		setSelectedSkills(loadedSkills);
		setUnallocatedSP(data.unallocatedSP);
		setCharacterOrder(data.characterOrder || defaultCharacters);
		setVisibleCharacters(new Set(data.visibleCharacters || defaultCharacters));
		setTeams(data.teams || { team1: [], team2: [] });
		setFieldSkills(data.fieldSkills || {});
		setCharacterRows(data.characterRows || [defaultCharacters]);
	}, []);

	const toggleFieldSkill = useCallback((character: string, skillName: string) => {
		setFieldSkills((prev) => {
			const charFieldSkills = prev[character] || [];

			if (charFieldSkills.includes(skillName)) {
				return { ...prev, [character]: charFieldSkills.filter((s) => s !== skillName) };
			} else {
				if (charFieldSkills.length < 6) {
					return { ...prev, [character]: [...charFieldSkills, skillName] };
				}
			}

			return prev;
		});
	}, []);

	const toggleCharacterVisibility = useCallback((character: string) => {
		setVisibleCharacters((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(character)) {
				newSet.delete(character);
			} else {
				newSet.add(character);
			}
			return newSet;
		});
	}, []);

	const resetCharacter = useCallback((character: string, totalSP: number) => {
		// Clear all selected skills for this character
		setSelectedSkills((prev) => ({
			...prev,
			[character]: new Set<string>(),
		}));

		// Clear all field skills for this character
		setFieldSkills((prev) => ({
			...prev,
			[character]: [],
		}));

		// Set unallocated SP to the total
		setUnallocatedSP((prev) => ({
			...prev,
			[character]: totalSP,
		}));
	}, []);

	const addToTeam = useCallback((teamNum: 1 | 2, character: string) => {
		setTeams((prev) => {
			const teamKey = `team${teamNum}` as 'team1' | 'team2';
			const team = prev[teamKey];

			const otherTeamKey = teamNum === 1 ? 'team2' : 'team1';
			const otherTeam = prev[otherTeamKey].filter((c) => c !== character);

			if (team.includes(character)) {
				return {
					...prev,
					[teamKey]: team.filter((c) => c !== character),
					[otherTeamKey]: otherTeam,
				};
			}

			if (team.length >= 3) {
				return prev;
			}

			return {
				...prev,
				[teamKey]: [...team, character],
				[otherTeamKey]: otherTeam,
			};
		});
	}, []);

	const handleDragStart = useCallback(
		(character: string, rowIndex: number) => (e: React.DragEvent) => {
			setDraggedCharacter(character);
			setDraggedFromRow(rowIndex);
			e.dataTransfer.effectAllowed = 'move';
		},
		[],
	);

	const handleDragOver = useCallback(
		(character: string, rowIndex: number) => (e: React.DragEvent) => {
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';

			const currentDraggedCharacter = draggedCharacterRef.current;
			const currentDraggedFromRow = draggedFromRowRef.current;

			if (
				!currentDraggedCharacter ||
				currentDraggedCharacter === character ||
				currentDraggedFromRow === null
			)
				return;

			const currentRows = characterRowsRef.current;
			const newRows = currentRows.map((row) => [...row]);

			const sourceRow = newRows[currentDraggedFromRow];
			if (!sourceRow) return;

			const draggedIndex = sourceRow.indexOf(currentDraggedCharacter);
			if (draggedIndex > -1) {
				sourceRow.splice(draggedIndex, 1);
			}

			const targetRow = newRows[rowIndex];
			if (!targetRow) return;

			const targetIndex = targetRow.indexOf(character);
			if (targetIndex > -1) {
				targetRow.splice(targetIndex, 0, currentDraggedCharacter);
			} else {
				targetRow.push(currentDraggedCharacter);
			}

			const filteredRows = newRows.filter((row) => row.length > 0);

			setCharacterRows(filteredRows.length > 0 ? filteredRows : [[]]);
			setDraggedFromRow(rowIndex);

			const flatOrder = filteredRows.flat();
			setCharacterOrder(flatOrder);
		},
		[],
	);

	const handleRowDrop = useCallback(
		(rowIndex: number) => (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const currentDraggedCharacter = draggedCharacterRef.current;
			const currentDraggedFromRow = draggedFromRowRef.current;

			if (!currentDraggedCharacter || currentDraggedFromRow === null) return;

			const currentRows = characterRowsRef.current;
			const newRows = currentRows.map((row) => [...row]);

			// Remove from source row
			const sourceRow = newRows[currentDraggedFromRow];
			if (sourceRow) {
				const draggedIndex = sourceRow.indexOf(currentDraggedCharacter);
				if (draggedIndex > -1) {
					sourceRow.splice(draggedIndex, 1);
				}
			}

			// Add to target row
			const targetRow = newRows[rowIndex];
			if (targetRow && !targetRow.includes(currentDraggedCharacter)) {
				targetRow.push(currentDraggedCharacter);
			}

			const filteredRows = newRows.filter(
				(row) => row.length > 0 || newRows.indexOf(row) === rowIndex,
			);
			setCharacterRows(filteredRows.length > 0 ? filteredRows : [[]]);

			const flatOrder = filteredRows.flat();
			setCharacterOrder(flatOrder);

			setDraggedCharacter(null);
			setDraggedFromRow(null);
		},
		[],
	);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDraggedCharacter(null);
	}, []);

	const handleDragEnd = useCallback(() => {
		setDraggedCharacter(null);
		setDraggedFromRow(null);
	}, []);

	const createNewRow = useCallback(() => {
		setCharacterRows((prev) => [...prev, []]);
	}, []);

	const deleteRow = useCallback((rowIndex: number) => {
		if (rowIndex === 0) return;

		setCharacterRows((prev) => {
			const newRows = [...prev];
			const deletedRowCharacters = newRows[rowIndex];

			if (deletedRowCharacters && deletedRowCharacters.length > 0) {
				newRows[0] = [...(newRows[0] || []), ...deletedRowCharacters];
			}

			newRows.splice(rowIndex, 1);

			const flatOrder = newRows.flat();
			setCharacterOrder(flatOrder);

			return newRows;
		});
	}, []);

	// Actions are stable - only created once
	const actions = useMemo<SkillCalculatorActionsType>(
		() => ({
			toggleSkill,
			updateUnallocatedSP,
			toggleFieldSkill,
			toggleCharacterVisibility,
			addToTeam,
			handleDragStart,
			handleDragOver,
			handleDrop,
			handleDragEnd,
			handleRowDrop,
			createNewRow,
			deleteRow,
			handleLoad,
			resetCharacter,
		}),
		[
			toggleSkill,
			updateUnallocatedSP,
			toggleFieldSkill,
			toggleCharacterVisibility,
			addToTeam,
			handleDragStart,
			handleDragOver,
			handleDrop,
			handleDragEnd,
			handleRowDrop,
			createNewRow,
			deleteRow,
			handleLoad,
			resetCharacter,
		],
	);

	// State changes when any state value changes
	const state = useMemo<SkillCalculatorStateType>(
		() => ({
			selectedSkills,
			unallocatedSP,
			visibleCharacters,
			teams,
			fieldSkills,
			characterRows,
			draggedCharacter,
		}),
		[
			selectedSkills,
			unallocatedSP,
			visibleCharacters,
			teams,
			fieldSkills,
			characterRows,
			draggedCharacter,
		],
	);

	return (
		<SkillCalculatorActionsContext.Provider value={actions}>
			<SkillCalculatorStateContext.Provider value={state}>
				{children}
			</SkillCalculatorStateContext.Provider>
		</SkillCalculatorActionsContext.Provider>
	);
};
