import { ActorDataModel } from "../abstract.ts"
import fields = foundry.data.fields
import {
	SheetSettings,
	ResourceTracker,
	MoveType,
	ResourceTrackerSchema,
	MoveTypeSchema,
	AttributeGURPS,
} from "@system"
import { CharacterManeuver } from "@system/maneuver-manager.ts"
import { PointsRecord, PointsRecordSchema } from "./fields/points-record.ts"
import { ItemType, gid } from "../constants.ts"
import { equalFold } from "@module/util/index.ts"
import { ItemGURPS2 } from "@module/document/item.ts"
import {
	FeatureHolderTemplate,
	FeatureHolderTemplateSchema,
	SettingsHolderTemplate,
	SettingsHolderTemplateSchema,
} from "./templates/index.ts"
import { AttributeHolderTemplate, AttributeHolderTemplateSchema } from "./templates/attribute-holder.ts"
import { CharacterBonus, CharacterBonusSchema } from "./fields/bonus.ts"
import { Int, damageProgression, encumbrance, progression, threshold } from "@util"
import { DiceGURPS } from "@module/dice/index.ts"
import { ItemInst } from "../item/helpers.ts"

class CharacterData extends ActorDataModel.mixin(
	FeatureHolderTemplate,
	SettingsHolderTemplate,
	AttributeHolderTemplate,
) {
	cache: CharacterCache = {
		encumbranceLevel: null,
		encumbranceLevelForSkills: null,
		basicLift: null,
	}

	static override defineSchema(): CharacterSchema {
		const fields = foundry.data.fields

		return this.mergeSchema(super.defineSchema(), {
			version: new fields.NumberField({ required: true, nullable: false, initial: 5 }),
			created_date: new fields.StringField(),
			modified_date: new fields.StringField(),
			profile: new fields.SchemaField<CharacterProfileSchema>({
				player_name: new fields.StringField({ initial: game.user?.name }),
				name: new fields.StringField(),
				title: new fields.StringField(),
				organization: new fields.StringField(),
				age: new fields.StringField(),
				birthday: new fields.StringField(),
				eyes: new fields.StringField(),
				hair: new fields.StringField(),
				skin: new fields.StringField(),
				handedness: new fields.StringField(),
				height: new fields.StringField(),
				weight: new fields.StringField(),
				SM: new fields.NumberField({ integer: true, initial: 0 }),
				gender: new fields.StringField(),
				tech_level: new fields.StringField(),
				religion: new fields.StringField(),
				portrait: new fields.StringField(),
			}),
			// attributes: new fields.ArrayField(new fields.SchemaField(AttributeGURPS.defineSchema())),
			resource_trackers: new fields.ArrayField(new fields.SchemaField(ResourceTracker.defineSchema())),
			move_types: new fields.ArrayField(new fields.SchemaField(MoveType.defineSchema())),
			move: new fields.SchemaField({
				// TODO: review
				maneuver: new fields.ObjectField(),
				posture: new fields.StringField(),
				type: new fields.StringField(),
			}),
			total_points: new fields.NumberField(),
			points_record: new fields.ArrayField(new fields.SchemaField(PointsRecord.defineSchema())),
			bonuses: new fields.SchemaField({
				liftingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				strikingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				throwingStrength: new fields.SchemaField(CharacterBonus.defineSchema()),
				dodge: new fields.SchemaField(CharacterBonus.defineSchema()),
				parry: new fields.SchemaField(CharacterBonus.defineSchema()),
				block: new fields.SchemaField(CharacterBonus.defineSchema()),
			}),
		}) as CharacterSchema
	}

	/**
	 * Return the skill with the highest level matching the provided parameters.
	 * @param name - Name of skill/technique to search for
	 * @param specialization - Specialization to search for. Can be blank.
	 * @param requirePoints - Does the skill need to have 1 or more points assigned?
	 * @param excludes - Skills to exclude from the search
	 * @returns Skill or Technique
	 */
	bestSkillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string> = new Set(),
	): ItemInst<ItemType.Skill | ItemType.Technique> | null {
		let best: ItemGURPS2 | null = null
		let level = Number.MIN_SAFE_INTEGER
		for (const sk of this.skillNamed(name, specialization, requirePoints, excludes)) {
			const skillLevel = sk.system.calculateLevel(excludes).level
			if (best === null || level < skillLevel) {
				best = sk
				level = skillLevel
			}
		}
		return best as ItemInst<ItemType.Skill | ItemType.Technique> | null
	}

	/**
	 * Return array of skills matching the provieed parameters.
	 * @param name - Name of skill/technique to search for
	 * @param specialization - Specialization to search for. Can be blank.
	 * @param requirePoints - Does the skill need to have 1 or more points assigned?
	 * @param excludes - Skills to exclude from the search
	 * @returns Array of Skills/Techniques
	 */
	skillNamed(
		name: string,
		specialization: string,
		requirePoints: boolean,
		excludes: Set<string> | null = null,
	): ItemInst<ItemType.Skill | ItemType.Technique>[] {
		const list: ItemGURPS2[] = []
		// this.parent.items.forEach(sk => {
		this.parent.itemCollections.skills.forEach(sk => {
			if (!sk.isOfType(ItemType.Skill, ItemType.Technique)) return
			if (excludes?.has(sk.system.processedName)) return

			if (!requirePoints || sk.type === ItemType.Technique || sk.system.adjustedPoints() > 0) {
				if (equalFold(sk.system.nameWithReplacements, name)) {
					if (specialization === "" || equalFold(sk.system.specializationWithReplacements, specialization)) {
						list.push(sk as any)
					}
				}
			}
		})
		return list as ItemInst<ItemType.Skill | ItemType.Technique>[]
	}

	/**
	 * Encumbrance & Lifting
	 */
	encumbranceLevel(forSkills: boolean): encumbrance.Level {
		if (forSkills) {
			if (this.cache.encumbranceLevelForSkills !== null) return this.cache.encumbranceLevelForSkills
		} else if (this.cache.encumbranceLevel !== null) return this.cache.encumbranceLevel
		const carried = this.weightCarried(forSkills)
		for (const level of encumbrance.Levels) {
			if (carried <= this.maximumCarry(level)) {
				if (forSkills) {
					this.cache.encumbranceLevelForSkills = level
				} else {
					this.cache.encumbranceLevel = level
				}
				return level
			}
		}
		if (forSkills) {
			this.cache.encumbranceLevelForSkills = encumbrance.Level.ExtraHeavy
		} else {
			this.cache.encumbranceLevel = encumbrance.Level.ExtraHeavy
		}
		return encumbrance.Level.ExtraHeavy
	}

	weightCarried(forSkills: boolean): number {
		let total = 0
		for (const equipment of this.parent.itemCollections.carriedEquipment) {
			total += equipment.system.extendedWeight(forSkills, this.settings.default_weight_units)
		}
		return total
	}

	maximumCarry(level: encumbrance.Level): number {
		return Int.from(this.basicLift * encumbrance.Level.weightMultiplier(level))
	}

	get basicLift(): number {
		if (this.cache.basicLift !== null) return this.cache.basicLift
		this.cache.basicLift = this.basicLiftForST(this.liftingStrength)
		return this.cache.basicLift
	}

	basicLiftForST(st: number): number {
		st = Math.trunc(st)
		if (AttributeGURPS.isThresholdOpMet(threshold.Op.HalveST, this.attributes)) {
			st /= 2
			if (st != Math.trunc(st)) {
				st = Math.trunc(st) + 1
			}
		}
		if (st < 1) return 0
		let v = 0
		if (this.settings.damage_progression === progression.Option.KnowingYourOwnStrength) {
			let diff = 0
			if (st > 19) {
				diff = Math.trunc(st / 10) - 1
				st -= diff * 10
			}
			v = Int.from(10 ** (st / 10) * 2)
			if (st <= 6) {
				v = Math.round(v * 10) / 10
			} else {
				v = Math.round(v)
			}
			v = v * Int.from(10 ** diff)
		} else {
			v = st ** 2 / 5
		}
		if (v >= 10) v = Math.round(v)
		return Int.from(Math.trunc(v * 10) / 10)
	}

	/** Strength Types */
	get strikingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.StrikingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.StrikingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.StrikingStrength), 0)
		}
		st += this.bonuses.strikingStrength.value
		return Math.trunc(st)
	}

	get liftingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.LiftingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.LiftingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.LiftingStrength), 0)
		}
		st += this.bonuses.liftingStrength.value
		return Math.trunc(st)
	}

	get throwingStrength(): number {
		let st = 0
		if (this.resolveAttribute(gid.ThrowingStrength) !== null) {
			st = this.resolveAttributeCurrent(gid.ThrowingStrength)
		} else {
			st = Math.max(this.resolveAttributeCurrent(gid.ThrowingStrength), 0)
		}
		st += this.bonuses.throwingStrength.value
		return Math.trunc(st)
	}

	get telekineticStrenght(): number {
		let levels = 0
		this.parent.itemCollections.traits.forEach(e => {
			if (e.system.enabled && e.isOfType(ItemType.Trait) && e.system.isLeveled) {
				if (equalFold(e.system.nameWithReplacements, "telekinesis")) {
					levels += Math.max(e.system.levels, 0)
				}
			}
		})
		return Math.trunc(levels)
	}

	get thrust(): DiceGURPS {
		return this.thrustFor(this.strikingStrength)
	}

	get liftingThrust(): DiceGURPS {
		return this.thrustFor(this.liftingStrength)
	}

	thrustFor(st: number): DiceGURPS {
		return damageProgression.thrustFor(this.settings.damage_progression, st)
	}

	get swing(): DiceGURPS {
		return this.swingFor(this.strikingStrength)
	}

	get liftingSwing(): DiceGURPS {
		return this.swingFor(this.liftingStrength)
	}

	swingFor(st: number): DiceGURPS {
		return damageProgression.swingFor(this.settings.damage_progression, st)
	}
}

interface CharacterData extends Omit<ModelPropsFromSchema<CharacterSchema>, "settings" | "attributes"> {
	settings: SheetSettings
	attributes: AttributeGURPS[]
}

type CharacterSchema = FeatureHolderTemplateSchema &
	SettingsHolderTemplateSchema &
	AttributeHolderTemplateSchema & {
		version: fields.NumberField<number, number, true, false, true>
		created_date: fields.StringField
		modified_date: fields.StringField
		profile: fields.SchemaField<CharacterProfileSchema>
		resource_trackers: fields.ArrayField<fields.SchemaField<ResourceTrackerSchema>>
		move_types: fields.ArrayField<fields.SchemaField<MoveTypeSchema>>
		move: fields.SchemaField<CharacterMoveSchema>
		total_points: fields.NumberField<number, number, true, false>
		points_record: fields.ArrayField<fields.SchemaField<PointsRecordSchema>>
		bonuses: fields.SchemaField<{
			liftingStrength: fields.SchemaField<CharacterBonusSchema>
			strikingStrength: fields.SchemaField<CharacterBonusSchema>
			throwingStrength: fields.SchemaField<CharacterBonusSchema>
			dodge: fields.SchemaField<CharacterBonusSchema>
			parry: fields.SchemaField<CharacterBonusSchema>
			block: fields.SchemaField<CharacterBonusSchema>
		}>
	}

type CharacterProfileSchema = {
	player_name: fields.StringField
	name: fields.StringField
	title: fields.StringField
	organization: fields.StringField
	age: fields.StringField
	birthday: fields.StringField
	eyes: fields.StringField
	hair: fields.StringField
	skin: fields.StringField
	handedness: fields.StringField
	height: fields.StringField
	weight: fields.StringField
	SM: fields.NumberField
	gender: fields.StringField
	tech_level: fields.StringField
	religion: fields.StringField
	portrait: fields.StringField
}

type CharacterMoveSchema = {
	maneuver: fields.ObjectField<CharacterManeuver, CharacterManeuver, true, true>
	posture: fields.StringField
	type: fields.StringField
}

type CharacterCache = {
	encumbranceLevel: encumbrance.Level | null
	encumbranceLevelForSkills: encumbrance.Level | null
	basicLift: number | null
}
export { CharacterData }