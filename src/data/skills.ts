import skillsData from "../../skills.json" with { type: "json" };
import type { Skill } from "../types.ts";

// Parse skills and group by character (include all characters including Monoco)
export const skillsByCharacter: Record<string, Skill[]> = {};
export const skillLookupByCharacter: Record<string, Map<string, Skill>> = {};

Object.values(skillsData as Record<string, Skill>).forEach((skill) => {
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

export const defaultCharacters = Object.keys(skillsByCharacter);
