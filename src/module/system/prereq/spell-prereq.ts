import { prereq } from "@util/enum/prereq.ts"
import { BasePrereq } from "./base.ts"
import { spellcmp } from "@util/enum/spellcmp.ts"
import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { SpellPrereqObj } from "./data.ts"
import { ItemGURPS } from "@item"
import { ActorType, ItemType } from "@data"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"

export class SpellPrereq extends BasePrereq<prereq.Type.Spell> {
	sub_type: spellcmp.Type

	qualifier: StringCriteria

	quantity: NumericCriteria

	constructor() {
		super(prereq.Type.Spell)
		this.sub_type = spellcmp.Type.Name
		this.qualifier = new StringCriteria({ compare: StringCompareType.IsString })
		this.quantity = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber, qualifier: 1 })
	}

	static fromObject(data: SpellPrereqObj): SpellPrereq {
		const prereq = new SpellPrereq()
		prereq.has = data.has
		if (data.sub_type) prereq.sub_type = data.sub_type
		if (data.qualifier) prereq.qualifier = new StringCriteria(data.qualifier)
		if (data.quantity) prereq.quantity = new NumericCriteria(data.quantity)
		return prereq
	}

	satisfied(actor: ActorGURPS, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor.isOfType(ActorType.Loot)) return true
		let count = 0
		const colleges: Set<string> = new Set()
		let techLevel = ""
		if (exclude instanceof ItemGURPS && exclude.isOfType(ItemType.Spell, ItemType.RitualMagicSpell)) {
			techLevel = exclude.techLevel
		}
		for (const sp of actor.itemCollections.spells) {
			if (sp.isOfType(ItemType.SpellContainer)) continue
			if (exclude === sp || sp.points === 0) continue
			if (techLevel !== "" && sp.techLevel !== "" && techLevel !== sp.techLevel) continue
			switch (this.sub_type) {
				case spellcmp.Type.Name:
					if (this.qualifier.matches(sp.name ?? "")) count += 1
					break
				case spellcmp.Type.Tag:
					for (const one of sp.tags) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.College:
					for (const one of sp.college) {
						if (this.qualifier.matches(one ?? "")) {
							count += 1
							break
						}
					}
					break
				case spellcmp.Type.CollegeCount:
					for (const one of sp.college) colleges.add(one)
					break
				case spellcmp.Type.Any:
					count += 1
			}
			if (this.sub_type === spellcmp.Type.CollegeCount) count = colleges.size
		}
		let satisfied = this.quantity.matches(count)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			if (this.sub_type === spellcmp.Type.CollegeCount) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell[this.sub_type], {
						content: this.quantity.describe(),
					}),
				)
			} else {
				tooltip.push(this.quantity.describe())
				if (this.quantity.qualifier === 1)
					tooltip.push(
						LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.singular[this.sub_type], {
							content: this.qualifier.describe(),
						}),
					)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.spell.multiple[this.sub_type], {
						content: this.qualifier.describe(),
					}),
				)
			}
		}
		return satisfied
	}

	override toObject(): SpellPrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			sub_type: this.sub_type,
			qualifier: this.qualifier.toObject(),
			quantity: this.quantity.toObject(),
		}
	}
}
