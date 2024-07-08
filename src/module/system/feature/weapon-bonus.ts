import { feature } from "@util/enum/feature.ts"
import { wsel } from "@util/enum/wsel.ts"
import { wswitch } from "@util/enum/wswitch.ts"
import { NumericCompareType, NumericCriteria } from "@util/numeric-criteria.ts"
import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { Int } from "@util/fxp.ts"
import { WeaponLeveledAmount } from "./weapon-leveled-amount.ts"
import { AbstractWeaponGURPS } from "@item"
import { TooltipGURPS } from "@util"
import { WeaponOwner } from "@module/data/types.ts"
import { WeaponBonusSchema } from "./data.ts"

export class WeaponBonus<TType extends feature.WeaponBonusType = feature.WeaponBonusType> {
	type: TType

	private _owner?: WeaponOwner

	private _subOwner?: WeaponOwner

	percent: boolean | null

	switch_type_value: boolean | null

	selection_type: wsel.Type

	switch_type: wswitch.Type | null

	name: StringCriteria | null

	specialization: StringCriteria | null

	level: NumericCriteria | null

	usage: StringCriteria | null

	tags: StringCriteria | null

	leveledAmount: WeaponLeveledAmount

	effective?: boolean // If true, bonus is applied later as part of effect bonuses

	constructor(type: TType) {
		this.type = type
		this.percent = null
		this.switch_type_value = null
		this.switch_type = null
		this.selection_type = wsel.Type.WithRequiredSkill
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.specialization = new StringCriteria({ compare: StringCompareType.AnyString })
		this.level = new NumericCriteria({ compare: NumericCompareType.AtLeastNumber })
		this.usage = new StringCriteria({ compare: StringCompareType.AnyString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
		this.leveledAmount = new WeaponLeveledAmount({ amount: 1 })
	}

	get owner(): WeaponOwner | undefined {
		return this._owner
	}

	set owner(owner: WeaponOwner | undefined) {
		this._owner = owner
	}

	get subOwner(): WeaponOwner | undefined {
		return this._subOwner
	}

	set subOwner(subOwner: WeaponOwner | undefined) {
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

	adjustedAmountForWeapon(wpn: AbstractWeaponGURPS): number {
		if (this.type === feature.Type.WeaponMinSTBonus) {
			this.leveledAmount.dieCount = 1
		} else {
			this.leveledAmount.dieCount = Int.from(wpn.damage.base!.count)
		}
		return this.leveledAmount.adjustedAmount
	}

	addToTooltip(tooltip: TooltipGURPS | null): void {
		if (tooltip === null) return
		const buf = new TooltipGURPS()
		buf.push("\n")
		buf.push(this.parentName)
		buf.push(" [")
		if (this.type === feature.Type.WeaponSwitch) {
			buf.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.weapon_bonus.weapon_switch, {
					type: this.switch_type!,
					value: this.switch_type_value!,
				}),
			)
		} else {
			buf.push(
				LocalizeGURPS.format(
					LocalizeGURPS.translations.gurps.feature.weapon_bonus[this.type as feature.WeaponBonusType],
					{
						level: this.leveledAmount.format(this.percent ?? false),
					},
				),
			)
		}
		buf.push("]")
		tooltip.push(buf)
	}

	get derivedLevel(): number {
		if (this.subOwner) {
			if (this.subOwner.isLeveled) return this.subOwner.currentLevel
		} else if (this.owner) {
			if (this.owner.isLeveled) return this.owner.currentLevel
		}
		return 0
	}

	toObject(): SourceFromSchema<WeaponBonusSchema> {
		return {
			type: this.type,
			percent: this.percent ?? null,
			switch_type_value: this.switch_type_value ?? null,
			selection_type: this.selection_type,
			switch_type: this.switch_type ?? null,
			name: this.name ?? null,
			specialization: this.specialization ?? null,
			level: this.level ?? null,
			usage: this.usage ?? null,
			tags: this.tags ?? null,
			amount: this.amount,
			leveled: this.leveledAmount.leveled,
			per_die: this.leveledAmount.per_die,
			effective: this.effective ?? false,
		}
	}

	static fromObject(data: SourceFromSchema<WeaponBonusSchema>): WeaponBonus {
		const bonus = new WeaponBonus(data.type)
		bonus.percent = data.percent
		if (data.switch_type) bonus.switch_type = data.switch_type
		if (data.switch_type_value) bonus.switch_type_value = data.switch_type_value
		bonus.selection_type = data.selection_type
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.specialization) bonus.specialization = new StringCriteria(data.specialization)
		if (data.level) bonus.level = new NumericCriteria(data.level)
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = WeaponLeveledAmount.fromObject(data)
		return bonus
	}
}
