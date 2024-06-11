import { prereq } from "@util/enum/prereq.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { BasePrereq } from "./base.ts"
import { PrereqListObj } from "./data.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { PrereqResolver, TooltipGURPS, extractTechLevel } from "@util"
import { CharacterGURPS } from "@actor"

export class PrereqList {
	type: prereq.Type

	all: boolean

	when_tl: NumericCriteria

	prereqs: (BasePrereq | PrereqList)[]

	constructor() {
		this.type = prereq.Type.List
		this.all = true
		this.when_tl = new NumericCriteria({ compare: NumericCompareType.AnyNumber })
		this.prereqs = []
	}

	static fromObject(data: PrereqListObj, actor: PrereqResolver | null): PrereqList {
		const prereq = new PrereqList()
		prereq.all = data.all
		if (data.when_tl) prereq.when_tl = new NumericCriteria(data.when_tl)
		if (data.prereqs?.length)
			prereq.prereqs = (data.prereqs ?? [])
				.filter(e => !!CONFIG.GURPS.Prereq.classes[e.type])
				.map(e => {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					return CONFIG.GURPS.Prereq.classes[e.type].fromObject(e as any, actor)
				})
		return prereq
	}

	satisfied(
		actor: PrereqResolver,
		exclude: unknown,
		tooltip: TooltipGURPS,
		hasEquipmentPenalty: { value: boolean } = { value: false },
	): boolean {
		let actorTechLevel = "0"
		if (actor instanceof CharacterGURPS) {
			actorTechLevel = actor.profile.tech_level
		}
		if (this.when_tl.compare !== NumericCompareType.AnyNumber) {
			let tl = extractTechLevel(actorTechLevel)
			if (tl < 0) tl = 0
			if (!this.when_tl.matches(tl)) return true
		}
		let count = 0
		const local = new TooltipGURPS()
		const eqpPenalty = { value: false }
		for (const one of this.prereqs) {
			if (one.satisfied(actor, exclude, local, eqpPenalty)) count += 1
		}
		const satisfied = count === this.prereqs.length || (!this.all && count > 0)
		if (!satisfied) {
			if (eqpPenalty.value) hasEquipmentPenalty.value = true
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.prefix)
			tooltip.push(LocalizeGURPS.translations.gurps.prereq.list[this.all ? "true" : "false"])
			tooltip.push(local)
		}
		return satisfied
	}
}
