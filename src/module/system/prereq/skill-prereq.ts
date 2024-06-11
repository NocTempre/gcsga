import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { BasePrereq } from "./base.ts"
import { prereq } from "@util/enum/prereq.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { SkillPrereqObj } from "./data.ts"
import { ItemGURPS } from "@item"
import { ActorType, ItemType } from "@data"
import { LocalizeGURPS, TooltipGURPS } from "@util"
import { ActorGURPS } from "@actor"
import { PrereqResolver } from "@module/util/index.ts"

export class SkillPrereq extends BasePrereq<prereq.Type.Skill> {
	name: StringCriteria

	level: NumericCriteria

	specialization: StringCriteria

	constructor() {
		super(prereq.Type.Skill)
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.level = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
	}

	static fromObject(data: SkillPrereqObj): SkillPrereq {
		const prereq = new SkillPrereq()
		prereq.has = data.has
		if (data.name) prereq.name = new StringCriteria(data.name)
		if (data.level) prereq.level = new NumericCriteria(data.level)
		if (data.specialization) prereq.specialization = new StringCriteria(data.specialization)
		return prereq
	}

	satisfied(actor: PrereqResolver, exclude: unknown, tooltip: TooltipGURPS): boolean {
		if (actor instanceof ActorGURPS && actor.isOfType(ActorType.Loot)) return true
		let satisfied = false
		let techLevel = ""
		if (exclude instanceof ItemGURPS && exclude.isOfType(ItemType.Skill, ItemType.Technique)) {
			techLevel = exclude.techLevel
		}
		for (const sk of actor.itemCollections.skills) {
			if (sk.isOfType(ItemType.SkillContainer)) continue

			if (
				exclude === sk ||
				!this.name.matches(sk.name ?? "") ||
				!this.specialization.matches(sk.specialization ?? "")
			)
				continue
			satisfied = this.level.matches(sk.level.level)
			if (satisfied && techLevel !== "") satisfied = sk.techLevel === "" || techLevel === sk.techLevel
		}
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.has[this.has ? "true" : "false"])
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.name, {
					content: this.name.describe(),
				}),
			)
			if (this.specialization.compare !== StringCompareType.AnyString) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.specialization, {
						content: this.specialization.describe(),
					}),
				)
			}
			if (techLevel === "") {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level, {
						content: this.level.describe(),
					}),
				)
			} else if (this.specialization.compare === StringCompareType.AnyString)
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level_alt1, {
						content: this.level.describe(),
					}),
				)
			else
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.gurps.prereq.skill.level_alt2, {
						content: this.level.describe(),
					}),
				)
		}
		return satisfied
	}

	override toObject(): SkillPrereqObj {
		return {
			...super.toObject(),
			has: this.has,
			name: this.name.toObject(),
			specialization: this.specialization.toObject(),
			level: this.level.toObject(),
		}
	}
}
