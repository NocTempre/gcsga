import { Int } from "@util/fxp.ts"
import { feature } from "@util/enum/feature.ts"
import { stdmg } from "@util/enum/stdmg.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { WeaponDamageObj } from "./data.ts"
import { LocalizeGURPS } from "@util/localize.ts"
import { progression } from "@util/enum/progression.ts"
import { CharacterGURPS } from "@actor"
import { ItemType } from "@data"
import { AbstractWeaponGURPS } from "./document.ts"
import { TooltipGURPS } from "@util"

export class WeaponDamage {
	owner?: AbstractWeaponGURPS

	type: string

	st: stdmg.Option

	base?: DiceGURPS

	armor_divisor?: number

	fragmentation?: DiceGURPS

	fragmentation_armor_divisor?: number

	fragmentation_type?: string

	modifier_per_die?: number

	constructor(data: WeaponDamageObj & { owner?: AbstractWeaponGURPS }) {
		this.owner = data.owner
		this.type = data.type
		this.st = data.st ?? stdmg.Option.None
		this.base = new DiceGURPS(data.base)
		this.armor_divisor = data.armor_divisor
		this.fragmentation = new DiceGURPS(data.fragmentation)
		this.fragmentation_armor_divisor = data.fragmentation_armor_divisor
		this.fragmentation_type = data.fragmentation_type
		this.modifier_per_die = data.modifier_per_die
	}

	toString(): string {
		let buffer = ""
		if (this.st !== stdmg.Option.None) buffer += LocalizeGURPS.translations.gurps.weapon.damage_display[this.st]
		let convertMods = false
		if (this.owner && this.owner.actor instanceof CharacterGURPS)
			// @ts-expect-error awaiting implementation
			convertMods = this.owner.actor.settings.use_modifying_dice_plus_adds
		if (this.base) {
			const base = this.base.stringExtra(convertMods)
			if (base !== "0") {
				if (buffer.length !== 0 && base[0] !== "+" && base[0] !== "-") buffer += "+"
				buffer += base
			}
			if (this.armor_divisor !== 1) buffer += `(${this.armor_divisor})`
			if (this.modifier_per_die !== 0) {
				if (buffer.length !== 0) buffer += " "
				buffer += `(${this.modifier_per_die?.signedString()} ${
					LocalizeGURPS.translations.gurps.feature.per_die
				})`
			}
			const t = this.type.trim()
			if (t !== "") buffer += ` ${t}`
			if (this.fragmentation) {
				const frag = this.fragmentation.stringExtra(convertMods)
				if (frag !== "0") {
					buffer += `[${frag}`
					if (this.fragmentation_armor_divisor !== 1) buffer += `(${this.fragmentation_armor_divisor})`
					buffer += ` ${this.fragmentation_type}]`
				}
			}
		}
		return buffer
	}

	get baseDamageDice(): DiceGURPS {
		if (!this.owner) return new DiceGURPS({ sides: 6, multiplier: 1 })
		const actor = this.owner.actor as CharacterGURPS
		if (!actor) return new DiceGURPS({ sides: 6, multiplier: 1 })
		// @ts-expect-error awaiting implementation
		const maxST = (this.owner.strength.resolve(this.owner, null).min ?? 0) * 3
		let st = 0
		// @ts-expect-error awaiting implementation
		if (this.owner.container instanceof Item)
			// @ts-expect-error awaiting implementation
			st = this.owner.container.ratedStrength
		// @ts-expect-error awaiting implementation
		if (st === 0) st = actor.strikingST
		if (maxST > 0 && maxST < st) st = maxST
		let base = new DiceGURPS({ sides: 6, multiplier: 1 })
		if (this.base) base = this.base
		if (
			// @ts-expect-error awaiting implementation
			!(this.owner.container instanceof CompendiumCollection) &&
			// @ts-expect-error awaiting implementation
			this.owner.container?.type === ItemType.Trait &&
			// @ts-expect-error awaiting implementation
			(this.owner.container as unknown as TraitResolver)?.isLeveled
		)
			// @ts-expect-error awaiting implementation
			multiplyDice(Int.from((this.owner.container as unknown as TraitResolver).levels), base)
		const intST = Int.from(st)
		switch (this.st) {
			case stdmg.Option.Thrust:
				// @ts-expect-error awaiting implementation
				base = addDice(base, actor.thrustFor(intST))
				break
			case stdmg.Option.LeveledThrust: {
				// @ts-expect-error awaiting implementation
				const thrust = actor.thrustFor(intST)
				if (
					// @ts-expect-error awaiting implementation
					!(this.owner.container instanceof CompendiumCollection) &&
					// @ts-expect-error awaiting implementation
					this.owner.container?.type === ItemType.Trait &&
					// @ts-expect-error awaiting implementation
					(this.owner.container as unknown as TraitResolver)?.isLeveled
				)
					// @ts-expect-error awaiting implementation
					multiplyDice(Int.from((this.owner.container as unknown as TraitResolver).levels), base)
				base = addDice(base, thrust)
				break
			}
			case stdmg.Option.Swing:
				// @ts-expect-error awaiting implementation
				base = addDice(base, actor.swingFor(intST))
				break
			case stdmg.Option.LeveledSwing: {
				// @ts-expect-error awaiting implementation
				const swing = actor.swingFor(intST)
				if (
					// @ts-expect-error awaiting implementation
					!(this.owner.container instanceof CompendiumCollection) &&
					// @ts-expect-error awaiting implementation
					this.owner.container?.type === ItemType.Trait &&
					// @ts-expect-error awaiting implementation
					(this.owner.container as unknown as TraitResolver)?.isLeveled
				)
					// @ts-expect-error awaiting implementation
					multiplyDice(Int.from((this.owner.container as unknown as TraitResolver).levels), base)
				base = addDice(base, swing)
				break
			}
		}
		return base
	}

	resolvedDamage(tooltip: TooltipGURPS | null): string {
		// TODO: change
		if (!this.owner) return ""
		let base = this.baseDamageDice
		if (base.count === 0 && base.modifier === 0) return this.toString()
		const actor = this.owner.actor as CharacterGURPS
		const adjustForPhoenixFlame =
			// @ts-expect-error awaiting implementation
			actor?.settings.damage_progression === progression.Option.PhoenixFlameD3 && base.sides === 3
		let [percentDamageBonus, percentDRDivisorBonus] = [0, 0]
		let armorDivisor = this.armor_divisor ?? 1
		// @ts-expect-error awaiting implementation
		for (const bonus of this.owner.collectWeaponBonuses(
			base.count,
			tooltip,
			feature.Type.WeaponBonus,
			feature.Type.WeaponDRDivisorBonus,
		)) {
			if (bonus.type === feature.Type.WeaponBonus) {
				bonus.leveledAmount.dieCount = Int.from(base.count)
				let amt = bonus.adjustedAmountForWeapon(this.owner)
				if (bonus.percent) percentDamageBonus += amt
				else {
					if (adjustForPhoenixFlame) {
						if (bonus.leveledAmount.leveled) amt /= 2
						if (bonus.leveledAmount.per_die) amt /= 2
					}
					base.modifier += Int.from(amt)
				}
			} else if (bonus.type === feature.Type.WeaponDRDivisorBonus) {
				const amt = bonus.adjustedAmountForWeapon(this.owner)
				if (bonus.percent) percentDRDivisorBonus += amt
				else armorDivisor += amt
			}
		}
		if (this.modifier_per_die && this.modifier_per_die !== 0) {
			let amt = this.modifier_per_die * Int.from(base.count)
			if (adjustForPhoenixFlame) amt /= 2
			base.modifier += Int.from(amt)
		}
		if (percentDamageBonus !== 0) base = adjustDiceForPercentBonus(base, percentDamageBonus)
		if (percentDRDivisorBonus !== 0) armorDivisor = (armorDivisor * percentDRDivisorBonus) / 100
		let buffer = ""
		if (base.count !== 0 || base.modifier !== 0)
			// @ts-expect-error awaiting implementation
			buffer += base.stringExtra(actor?.settings.use_modifying_dice_plus_adds ?? false)
		if (armorDivisor !== 1) buffer += `(${armorDivisor})`
		if (this.type.trim() !== "") {
			if (buffer.length !== 0) buffer += " "
			buffer += this.type
		}
		if (this.fragmentation) {
			// @ts-expect-error awaiting implementation
			const frag = this.fragmentation.stringExtra(actor?.settings.use_modifying_dice_plus_adds ?? false)
			if (frag !== "0") {
				if (buffer.length !== 0) buffer += " "
				buffer += "[]"
				buffer += frag
				if (this.fragmentation_armor_divisor !== 1) buffer += `(${this.fragmentation_armor_divisor})`
				buffer += ` ${this.fragmentation_type}]`
			}
		}
		return buffer
	}
}

function multiplyDice(multiplier: number, d: DiceGURPS) {
	d.count *= multiplier
	d.modifier *= multiplier
	if (d.multiplier !== 1) d.multiplier *= multiplier
}

function addDice(left: DiceGURPS, right: DiceGURPS): DiceGURPS {
	if (left.sides > 1 && right.sides > 1 && left.sides !== right.sides) {
		const sides = Math.min(left.sides, right.sides)
		const average = Int.from(sides + 1) / 2
		const averageLeft = Int.from(((left.count * (left.sides + 1)) / 2) * Int.from(left.multiplier))
		const averageRight = Int.from(((right.count * (right.sides + 1)) / 2) * Int.from(right.multiplier))
		const averageBoth = averageLeft + averageRight
		return new DiceGURPS({
			count: Int.from(averageBoth / average),
			sides: sides,
			modifier: Int.from(Math.round(averageBoth % average)) + left.modifier + right.modifier,
			multiplier: 1,
		})
	}
	return new DiceGURPS({
		count: left.count + right.count,
		sides: Math.max(left.sides, right.sides),
		modifier: left.modifier + right.modifier,
		multiplier: left.multiplier + right.multiplier - 1,
	})
}

function adjustDiceForPercentBonus(d: DiceGURPS, percent: number): DiceGURPS {
	let count = d.count
	let modifier = d.modifier
	const averagePerDie = (d.sides + 1) / 2
	let average = averagePerDie * count + modifier
	modifier = (modifier * (100 + percent)) / 100
	if (average < 0) count = Math.max((count * (100 + percent)) / 100, 0)
	else {
		average = (average * (100 + percent)) / 100 - modifier
		count = Math.max(Math.trunc(average / averagePerDie), 0)
		modifier += Math.round(average - count * averagePerDie)
	}
	return new DiceGURPS({
		count: count,
		sides: d.sides,
		modifier: modifier,
		multiplier: d.multiplier,
	})
}
