import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { NumericCriteria } from "@util/numeric-criteria.ts"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { ActorType, ItemType } from "@module/data/constants.ts"
import { TraitPrereqSchema } from "./data.ts"

class TraitPrereq extends BasePrereq<TraitPrereqSchema> {
	// name: StringCriteria
	//
	// level: NumericCriteria
	//
	// notes: StringCriteria

	// constructor(data: ) {
	// 	super(data)
	// this.name = new StringCriteria({ compare: StringCompareType.IsString })
	// this.notes = new StringCriteria({ compare: StringCompareType.AnyString })
	// this.level = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber })
	// }

	// static fromObject(data: TraitPrereqObj): TraitPrereq {
	// 	const prereq = new TraitPrereq()
	// 	prereq.has = data.has
	// 	if (data.name) prereq.name = new StringCriteria(data.name)
	// 	if (data.level) prereq.level = new NumericCriteria(data.level)
	// 	if (data.notes) prereq.notes = new StringCriteria(data.notes)
	// 	return prereq
	// }

	static override defineSchema(): TraitPrereqSchema {
		const fields = foundry.data.fields

		return {
			...super.defineSchema(),
			name: new fields.SchemaField(StringCriteria.defineSchema()),
			notes: new fields.SchemaField(StringCriteria.defineSchema()),
			level: new fields.SchemaField(NumericCriteria.defineSchema())
		}
	}

	satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor.isOfType(ActorType.Loot)) return true
		let satisfied = false
		for (const t of actor.itemTypes[ItemType.Trait]) {
			if (exclude === t || !this.name.matches(t.name ?? "")) continue
			let notes = t.system.notes
			if (t.modifierNotes !== "") notes += `\n${t.modifierNotes}`
			if (!this.notes.matches(notes)) continue
			let levels = 0
			if (t.isLeveled) levels = Math.max(t.levels, 0)
			satisfied = this.level.matches(levels)
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.name, {
					content: this.name.describe(),
				}),
			)
			if (this.notes.compare !== StringCompareType.AnyString) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.notes, {
						content: this.notes.describe(),
					}),
				)
			}
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.trait.level, {
					content: this.level.describe(),
				}),
			)
		}
		return satisfied
	}

	// override toObject(): TraitPrereqObj {
	// 	return {
	// 		...super.toObject(),
	// 		has: this.has,
	// 		name: this.name.toObject(),
	// 		notes: this.notes.toObject(),
	// 		level: this.level.toObject(),
	// 	}
	// }
}

interface TraitPrereq extends BasePrereq<TraitPrereqSchema>, Omit<ModelPropsFromSchema<TraitPrereqSchema>, "name" | "level" | "notes"> {
	name: StringCriteria
	notes: StringCriteria
	level: StringCriteria
}


export { TraitPrereq }
