import { feature } from "@util/enum/feature.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { LeveledAmountObj } from "./data.ts"
import { WeaponLeveledAmount } from "./weapon-leveled-amount.ts"
import { Stringer, WeaponOwner } from "@data"
import { TooltipGURPS } from "@util"

export abstract class BonusOwner {
	type: feature.Type = feature.Type.AttributeBonus

	private _owner?: Stringer | WeaponOwner

	private _subOwner?: Stringer | WeaponOwner

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	leveledAmount: LeveledAmount = new LeveledAmount({ amount: 1 })

	get owner(): Stringer | undefined {
		return this._owner
	}

	set owner(owner: Stringer | undefined) {
		this._owner = owner
	}

	get subOwner(): Stringer | undefined {
		return this._subOwner
	}

	set subOwner(subOwner: Stringer | undefined) {
		this._subOwner = subOwner
	}

	setLevel(level: number): void {
		this.leveledAmount.level = level
	}

	get parentName(): string {
		if (!this.owner) return LocalizeGURPS.translations.gurps.misc.unknown
		const owner = this.owner.formattedName
		if (!this.subOwner) return owner
		return `${owner} (${this.subOwner.formattedName})`
	}

	get adjustedAmount(): number {
		return this.leveledAmount.adjustedAmount
	}

	get amount(): number {
		return this.leveledAmount.amount
	}

	set amount(amt: number) {
		this.leveledAmount.amount = amt
	}

	addToTooltip(tooltip: TooltipGURPS | null): void {
		return this.basicAddToTooltip(this.leveledAmount, tooltip)
	}

	basicAddToTooltip(amt: LeveledAmount | WeaponLeveledAmount, tooltip: TooltipGURPS | null): void {
		if (tooltip !== null) {
			// tooltip.push("\n")
			tooltip.push(this.parentName)
			tooltip.push(" [")
			tooltip.push(amt.format(false))
			tooltip.push("]")
		}
	}

	toObject(): LeveledAmountObj {
		return {
			type: this.type,
			amount: this.amount,
			per_level: this.leveledAmount.per_level,
			effective: this.effective ?? false,
		}
	}
}
