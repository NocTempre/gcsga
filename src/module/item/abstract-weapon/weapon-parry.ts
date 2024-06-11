import { Int } from "@util/fxp.ts"
import { WeaponField } from "./weapon-field.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { gid } from "@data"
import { feature } from "@util/enum/feature.ts"
import { CharacterGURPS } from "@actor"
import { AbstractWeaponGURPS } from "./document.ts"
import { TooltipGURPS } from "@util"

export class WeaponParry extends WeaponField {
	no = false

	fencing = false

	unbalanced = false

	modifier = 0

	static parse(s: string): WeaponParry {
		const wp = new WeaponParry()
		s = s.toLowerCase()
		wp.no = s.includes("no")
		if (!wp.no) {
			wp.fencing = s.includes("f")
			wp.unbalanced = s.includes("u")
			wp.modifier = Int.fromString(s)
		}
		wp.validate()
		return wp
	}

	resolve(w: AbstractWeaponGURPS, tooltip: TooltipGURPS | null): WeaponParry {
		const result = WeaponParry.parse(this.toString())
		// @ts-expect-error awaiting implementation
		result.no = !w.resolveBoolFlag(wswitch.Type.CanParry, !result.no)
		// @ts-expect-error awaiting implementation
		result.fencing = w.resolveBoolFlag(wswitch.Type.Fencing, result.fencing)
		// @ts-expect-error awaiting implementation
		result.unbalanced = w.resolveBoolFlag(wswitch.Type.Unbalanced, result.unbalanced)
		if (!result.no) {
			const actor = w.actor
			if (actor instanceof CharacterGURPS) {
				let primaryTooltip: TooltipGURPS | null = null
				if (tooltip !== null) primaryTooltip = new TooltipGURPS()
				// @ts-expect-error awaiting implementation
				const preAdj = w.skillLevelBaseAdjustment(actor, primaryTooltip)
				// @ts-expect-error awaiting implementation
				const postAdj = w.skillLevelPostAdjustment(actor, primaryTooltip)
				let best = -Infinity
				// @ts-expect-error awaiting implementation
				for (const def of w.defaults) {
					let level = def.skillLevelFast(actor, false, null, true)
					if (level === -Infinity) continue
					level += preAdj
					if (def.type !== gid.Parry) level = Math.trunc(level / 2)
					level += postAdj
					if (best < level) best = level
				}
				if (best !== -Infinity) {
					if (primaryTooltip !== null) tooltip?.push("\n", primaryTooltip)
					// @ts-expect-error awaiting implementation
					result.modifier += 3 + best + actor.parryBonus
					// @ts-expect-error awaiting implementation
					for (const bonus of w.collectWeaponBonuses(1, tooltip, feature.Type.WeaponParryBonus)) {
						result.modifier += bonus.adjustedAmountForWeapon(w)
					}
					result.modifier = Math.trunc(Math.max(result.modifier, 0))
				} else result.modifier = 0
			}
		}
		result.validate()
		return result
	}

	override toString(): string {
		if (this.no) return "No" // not localized
		if (this.modifier === 0 && !this.fencing && !this.unbalanced) return ""
		let buffer = ""
		buffer += this.modifier.toString()
		if (this.fencing) buffer += "F"
		if (this.unbalanced) buffer += "U"
		return buffer
	}

	validate(): void {
		if (this.no) {
			this.modifier = 0
			this.fencing = false
			this.unbalanced = false
		}
	}
}
