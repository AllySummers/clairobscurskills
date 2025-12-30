export interface SkillPrerequisite {
    name: string;
    link?: string;
}

export type Prerequisite =
    | {
        type: "RELATIONSHIP";
        level: number;
        character: string;
        link: string;
    }
    | {
        type: "ENEMY";
        name: string;
        link: string;
    }
    | {
        type: "SKILL";
        skills: SkillPrerequisite[];
    };

export interface Skill {
    character: string;
    name: string;
    nameImg?: string;
    description: string;
    cost: number;
    costType: "AP" | "GRADIENT";
    link?: string;
    prerequisites: Prerequisite[];
    prerequisitesHtml?: string;
    spCost: number;
}

export interface SaveData {
    selectedSkills: Record<string, string[]>;
    unallocatedSP: Record<string, number>;
    characterOrder: string[];
    visibleCharacters?: string[];
    teams?: {
        team1: string[];
        team2: string[];
    };
    fieldSkills?: Record<string, string[]>;
    characterRows?: string[][];
}

export interface NamedSave {
    name: string;
    data: SaveData;
    timestamp: number;
}
