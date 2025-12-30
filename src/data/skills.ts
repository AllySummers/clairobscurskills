import skillsUrl from '../../skills.json?url';
import type { Skill } from '../types.ts';

// Will be populated after loading
export let skillsByCharacter: Record<string, Skill[]> = {};
export let skillLookupByCharacter: Record<string, Map<string, Skill>> = {};
export let defaultCharacters: string[] = [];

// Load and parse skills from external JSON file
export async function loadSkills() {
	const response = await fetch(skillsUrl);
	const skillsData = (await response.json()) as Record<string, Skill>;

	skillsByCharacter = {};
	skillLookupByCharacter = {};

	Object.values(skillsData).forEach((skill) => {
		if (!skillsByCharacter[skill.character]) {
			skillsByCharacter[skill.character] = [];
			skillLookupByCharacter[skill.character] = new Map();
		}
		skillsByCharacter[skill.character]!.push(skill);
		skillLookupByCharacter[skill.character]!.set(skill.name, skill);
	});

	// Sort skills by SP cost (ascending)
	Object.keys(skillsByCharacter).forEach((char) => {
		skillsByCharacter[char]!.sort((a, b) => a.spCost - b.spCost);
	});

	defaultCharacters = Object.keys(skillsByCharacter);
}
