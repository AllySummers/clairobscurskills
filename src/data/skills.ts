import skillsUrl from '../../skills.json?url';
import type { Skill } from '../types.ts';

// Will be populated after loading
export let skillsByCharacter: Record<string, Skill[]> = {};
export let skillLookupByCharacter: Record<string, Map<string, Skill>> = {};
export let defaultCharacters: string[] = [];

// Load and parse skills from external JSON file
export async function loadSkills() {
	const response = await fetch(skillsUrl);
	const skillsData = (await response.json()) as Record<string, Omit<Skill, 'key'>>;

	skillsByCharacter = {};
	skillLookupByCharacter = {};

	Object.entries(skillsData).forEach(([key, skillData]) => {
		// Add the key to the skill object
		const skill: Skill = { ...skillData, key };
		
		if (!skillsByCharacter[skill.character]) {
			skillsByCharacter[skill.character] = [];
			skillLookupByCharacter[skill.character] = new Map();
		}
		skillsByCharacter[skill.character]!.push(skill);
		// Store by both key (for prerequisite lookups) and name (for backward compatibility)
		skillLookupByCharacter[skill.character]!.set(skill.name, skill);
		skillLookupByCharacter[skill.character]!.set(skill.key, skill);
	});

	// Sort skills by SP cost (ascending)
	Object.keys(skillsByCharacter).forEach((char) => {
		skillsByCharacter[char]!.sort((a, b) => a.spCost - b.spCost);
	});

	defaultCharacters = Object.keys(skillsByCharacter);
}
