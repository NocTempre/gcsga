import { CharacterFlags, Encumbrance } from "@actor/character/data.ts"
import { AttributeDef, BodyGURPS, MoveBonusType, MoveTypeDef, ResourceTrackerDef } from "@system"
import { progression, stlimit } from "./enum/index.ts"
import { TooltipGURPS } from "./tooltip.ts"
import {
	ConditionGURPS,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	RitualMagicSpellGURPS,
	SkillContainerGURPS,
	SkillGURPS,
	SpellContainerGURPS,
	SpellGURPS,
	TechniqueGURPS,
	TraitContainerGURPS,
	TraitGURPS,
} from "@item"
import { WeightUnits } from "./weight.ts"

interface BodyOwner {
	hitLocationTable: BodyGURPS
	addDRBonusesFor: (
		locationID: string,
		tooltip: TooltipGURPS | null,
		drMap: Map<string, number>,
	) => Map<string, number>
}

interface EquipmentHolder {
	equipment: Collection<EquipmentGURPS | EquipmentContainerGURPS>
	settings: {
		default_weight_units: WeightUnits
	}
}

interface VariableResolver {
	resolveVariable: (variableName: string) => string
}

interface PrereqResolver extends EquipmentHolder, VariableResolver {
	profile: {
		tech_level: string
	}
	traits: Collection<TraitGURPS | TraitContainerGURPS>
	skills: Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
	spells: Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS>
	resolveAttributeCurrent: (attr_id: string) => number
	resolveAttributeName: (attr_id: string) => string
}

interface AttributeResolver extends VariableResolver {
	attributeBonusFor: (
		attributeId: string,
		limitation: stlimit.Option,
		effective?: boolean,
		tooltip?: TooltipGURPS | null,
	) => number
	costReductionFor: (attributeID: string) => number
	settings: {
		attributes: AttributeDef[]
		damage_progression: progression.Option
	}
	effectiveST: (initialST: number) => number
	// TODO: change
	flags: CharacterFlags
	adjustedSizeModifier: number
}

interface MoveTypeResolver extends VariableResolver {
	settings: {
		move_types: MoveTypeDef[]
	}
	traits: Collection<TraitGURPS | TraitContainerGURPS>
	skills: Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS>
	conditions: Collection<ConditionGURPS>
	moveBonusFor: (id: string, limitation: MoveBonusType, effective?: boolean, tooltip?: TooltipGURPS | null) => number
}

interface ResourceTrackerResolver extends VariableResolver {
	settings: {
		resource_trackers: ResourceTrackerDef[]
	}
	moveBonusFor: (id: string, limitation: MoveBonusType, effective?: boolean, tooltip?: TooltipGURPS | null) => number
}

interface SkillDefaultResovler extends VariableResolver {
	resolveAttributeCurrent: (attr_id: string) => number
	resolveAttributeName: (attr_id: string) => string
	skillNamed: (
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	) => Collection<SkillGURPS | TechniqueGURPS>
	dodge: (enc: Encumbrance) => number
	encumbranceLevel: (forSkills: boolean) => {
		level: number
		maximum_carry: number
		penalty: number
		name: string
	}
	parryBonus: number
	blockBonus: number
	dodgeBonus: number
}

export type {
	AttributeResolver,
	BodyOwner,
	MoveTypeResolver,
	ResourceTrackerResolver,
	VariableResolver,
	EquipmentHolder,
	PrereqResolver,
	SkillDefaultResovler,
}
