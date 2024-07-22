/* eslint-disable jest/no-disabled-tests */

import { DamageAttacker, DamageRoll, DefaultHitLocations, Vulnerability } from "@module/apps/damage-calculator/index.ts"
import {
	DamageHitLocation,
	DamageShock,
	Knockdown,
	_Attacker,
	_DamageRoll,
	_Target,
	_TargetTrait,
	_TargetTraitModifier,
	_create,
} from "./common.ts"
import { AnyPiercingType, DamageTypes } from "@module/apps/damage-calculator/damage-type.ts"
import { DiceGURPS } from "@module/dice/index.ts"
import { RollType } from "@module/data/index.ts"
import { InjuryEffectType, ShockInjuryEffect } from "@module/apps/damage-calculator/injury-effect.ts"

const Head = ["Skull", "Eye", "Face"]
const Limb = ["Arm", "Leg"]
const Extremity = ["Hand", "Foot"]
// const Torso = "Torso"

// Add real tests here.
describe("Damage calculator", () => {
	let _attacker: DamageAttacker
	let _target: _Target
	let _roll: DamageRoll

	let _torso: DamageHitLocation
	let _vitals: DamageHitLocation
	let _skull: DamageHitLocation
	let _eye: DamageHitLocation
	let _face: DamageHitLocation
	let _neck: DamageHitLocation
	let _groin: DamageHitLocation
	let _arm: DamageHitLocation
	let _leg: DamageHitLocation
	let _hand: DamageHitLocation
	let _foot: DamageHitLocation
	const locations = ["Groin", "Vitals", "Neck", ...Head, ...Limb, ...Extremity]

	beforeEach(() => {
		_attacker = new _Attacker()
		_target = new _Target()
		_roll = new _DamageRoll()
		_roll.attacker = _attacker
		_roll.armorDivisor = 1
		_roll.damageType = DamageTypes.cr
		_roll.dice = new DiceGURPS("2d")
		_roll.hits[0] = { basicDamage: 8, locationId: "Torso" }

		_torso = new DamageHitLocation(
			{
				choice_name: "Torso",
				description: "",
				dr_bonus: 0,
				table_name: "Torso",
				hit_penalty: 0,
				id: "torso",
				slots: 2,
			},
			{ parent: _target },
		)

		_vitals = new DamageHitLocation(
			{
				choice_name: "Vitals",
				description: "",
				dr_bonus: 0,
				table_name: "Vitals",
				hit_penalty: -3,
				id: "vitals",
				slots: 0,
			},
			{ parent: _target },
		)

		_skull = new DamageHitLocation(
			{
				choice_name: "Skull",
				description: "",
				dr_bonus: 2,
				table_name: "Skull",
				hit_penalty: -7,
				id: "skull",
				slots: 0,
			},
			{ parent: _target },
		)

		_eye = new DamageHitLocation(
			{
				choice_name: "Eye",
				description: "",
				dr_bonus: 0,
				table_name: "Eye",
				hit_penalty: -9,
				id: "eye",
				slots: 0,
			},
			{ parent: _target },
		)

		_face = new DamageHitLocation(
			{
				choice_name: "Face",
				description: "",
				dr_bonus: 0,
				table_name: "Face",
				hit_penalty: -5,
				id: "face",
				slots: 1,
			},
			{ parent: _target },
		)

		_neck = new DamageHitLocation(
			{
				choice_name: "Neck",
				description: "",
				dr_bonus: 0,
				table_name: "Neck",
				hit_penalty: -5,
				id: "neck",
				slots: 1,
			},
			{ parent: _target },
		)

		_groin = new DamageHitLocation(
			{
				choice_name: "Groin",
				description: "",
				dr_bonus: 0,
				table_name: "Groin",
				hit_penalty: -5,
				id: "groin",
				slots: 1,
			},
			{ parent: _target },
		)

		_arm = new DamageHitLocation(
			{
				choice_name: "Arm",
				description: "",
				dr_bonus: 0,
				table_name: "Arm",
				hit_penalty: -2,
				id: "arm",
				slots: 1,
			},
			{ parent: _target },
		)

		_leg = new DamageHitLocation(
			{
				choice_name: "Leg",
				description: "",
				dr_bonus: 0,
				table_name: "Leg",
				hit_penalty: -2,
				id: "leg",
				slots: 2,
			},
			{ parent: _target },
		)

		_hand = new DamageHitLocation(
			{
				choice_name: "Hand",
				description: "",
				dr_bonus: 0,
				table_name: "Hand",
				hit_penalty: -4,
				id: "hand",
				slots: 1,
			},
			{ parent: _target },
		)

		_foot = new DamageHitLocation(
			{
				choice_name: "Foot",
				description: "",
				dr_bonus: 0,
				table_name: "Foot",
				hit_penalty: -4,
				id: "foot",
				slots: 1,
			},
			{ parent: _target },
		)

		_target.hitLocationTable.locations.push(_torso)
		_target.hitLocationTable.locations.push(_vitals)
		_target.hitLocationTable.locations.push(_skull)
		_target.hitLocationTable.locations.push(_eye)
		_target.hitLocationTable.locations.push(_face)
		_target.hitLocationTable.locations.push(_neck)
		_target.hitLocationTable.locations.push(_groin)
		_target.hitLocationTable.locations.push(_arm)
		_target.hitLocationTable.locations.push(_leg)
		_target.hitLocationTable.locations.push(_hand)
		_target.hitLocationTable.locations.push(_foot)
		_roll.hits[0].basicDamage = 10
	})

	describe("B378: Damage Roll.", () => {
		it("The result of the damage roll is the hit’s “basic damage.”", () => {
			_roll.hits[0].basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(8)

			_roll.hits[0].basicDamage = 4
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(4)
		})

		it("(Knockback Only does no damage.)", () => {
			_roll.hits[0].basicDamage = 8
			_roll.damageType = DamageTypes.kb
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(0)
		})
	})

	describe("B378: Damage Resistance and Penetration. Subtract DR from basic damage. The result is the “penetrating damage”", () => {
		it("If your foe has no DR, the entire damage roll is penetrating damage.", () => {
			_roll.hits[0].basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(8)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)

			_roll.hits[0].basicDamage = 15
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(15)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)
		})

		it("If your target has any Damage Resistance (DR) he subtracts this from your damage roll.", () => {
			_roll.hits[0].basicDamage = 8
			_torso._map.set("all", 2)

			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(6)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)

			_roll.hits[0].basicDamage = 11
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(9)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)
		})

		it("If your damage roll is less than or equal to your target’s effective DR, your attack failed to penetrate.", () => {
			_roll.hits[0].basicDamage = 5
			_torso._map.set("all", 9)

			let calc = _create(_roll, _target)

			expect(calc.hits[0].results.injury!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)

			_roll.hits[0].basicDamage = 9
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)
		})

		it("(Direct Injury ignores DR.)", () => {
			_roll.damageType = DamageTypes.injury
			_torso._map.set("all", 9)

			_roll.hits[0].basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(8)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)

			_roll.hits[0].basicDamage = 11
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(11)
			expect(calc.hits[0].results.injury!.value).toBe(calc.hits[0].results.penetratingDamage!.value)
		})
	})

	describe("B378: Armor Divisors and Penetration Modifiers.", () => {
		beforeEach(() => {
			_roll.hits[0].basicDamage = 20
		})

		describe("A divisor of (2) or more means that DR protects at reduced value against the attack.", () => {
			it("Divide the target’s DR by the number in parentheses before subtracting it from basic damage; e.g., (2) means DR protects at half value.", () => {
				_torso._map.set("all", 20)

				const divisors = [2, 5, 10]
				const expected = [10, 16, 18]
				for (let i = 0; i < divisors.length; i++) {
					_roll.armorDivisor = divisors[i]
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBe(expected[i])
				}
			})

			it("Round DR down. Minimum DR is 0.", () => {
				_torso._map.set("all", 5)

				const divisors = [2, 3, 5, 10]
				const expected = [18, 19, 19, 20]
				for (let i = 0; i < divisors.length; i++) {
					_roll.armorDivisor = divisors[i]
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBe(expected[i])
				}
			})

			it("(Ignores DR.)", () => {
				_torso._map.set("all", 20)
				_roll.armorDivisor = 0
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(20)
			})
		})

		describe("Some divisors are fractions, such as (0.5), (0.2), or (0.1). DR is increased against such attacks:", () => {
			it("... multiply DR by 2 for (0.5),", () => {
				_torso._map.set("all", 5)

				_roll.armorDivisor = 0.5
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(10)
			})

			it("... by 5 for (0.2),", () => {
				_torso._map.set("all", 3)

				_roll.armorDivisor = 0.2
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(5)
			})

			it("... and by 10 for (0.1).", () => {
				_torso._map.set("all", 2)
				_roll.hits[0].basicDamage = 21

				_roll.armorDivisor = 0.1
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(1)
			})

			it("In addition, if you have any level of this limitation, targets that have DR 0 get DR 1 against your attack.", () => {
				_torso._map.set("all", 0)
				_roll.armorDivisor = 0.5
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(19)
			})
		})
	})

	describe("B379: Wounding Modifiers and Injury. If there is any penetrating damage, multiply it by the attack’s “wounding modifier.”", () => {
		beforeEach(() => {
			_torso._map.set("all", 5)
			_roll.hits[0].basicDamage = 11
		})

		it("Small piercing (pi-): ×0.5.", () => {
			_roll.damageType = DamageTypes["pi-"]
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
			expect(calc.hits[0].results.injury!.value).toBe(3)
		})

		it("Burning (burn), corrosion (cor), crushing (cr), fatigue (fat), piercing (pi), and toxic (tox): ×1.", () => {
			const types = [
				DamageTypes.burn,
				DamageTypes.cor,
				DamageTypes.cr,
				DamageTypes.fat,
				DamageTypes.pi,
				DamageTypes.tox,
			]
			for (const type of types) {
				_roll.damageType = type
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
				expect(calc.hits[0].results.injury!.value).toBe(6)
			}
		})

		it("Cutting (cut) and large piercing (pi+): ×1.5.", () => {
			const types = [DamageTypes.cut, DamageTypes["pi+"]]
			for (const type of types) {
				_roll.damageType = type
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
				expect(calc.hits[0].results.injury!.value).toBe(9)
			}
		})

		it("Impaling (imp) and huge piercing (pi++): ×2.", () => {
			const types = [DamageTypes.imp, DamageTypes["pi++"]]
			for (const type of types) {
				_roll.damageType = type
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
				expect(calc.hits[0].results.injury!.value).toBe(12)
			}
		})

		it("Round fractions down...", () => {
			_roll.damageType = DamageTypes["pi-"]
			_roll.hits[0].basicDamage = 12
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(3)
		})

		it("...but the minimum injury is 1 HP for any attack that penetrates DR at all.", () => {
			_roll.damageType = DamageTypes["pi-"]
			_torso._map.set("all", 11)

			_roll.hits[0].basicDamage = 12
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(1)
		})
	})

	describe("B379: Flexible Armor and Blunt Trauma. An attack that does crushing, cutting, impaling, or piercing damage may inflict “blunt trauma” if it fails to penetrate flexible DR.", () => {
		beforeEach(() => {
			_torso._map.set("all", 20)
		})

		it("For every full 10 points of cutting, impaling, or piercing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			for (const type of [DamageTypes.cut, DamageTypes.imp, ...AnyPiercingType]) {
				_roll.damageType = type

				_roll.hits[0].basicDamage = 9
				let calc = _create(_roll, _target)
				calc.hits[0].flexibleArmorOverride = true
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
				expect(calc.hits[0].results.injury!.value).toBe(0)

				_roll.hits[0].basicDamage = 10
				calc = _create(_roll, _target)
				calc.hits[0].flexibleArmorOverride = true
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
				expect(calc.hits[0].results.injury!.value).toBe(1)

				_roll.hits[0].basicDamage = 19
				calc = _create(_roll, _target)
				calc.hits[0].flexibleArmorOverride = true
				expect(calc.hits[0].results.injury!.value).toBe(1)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)

				_roll.hits[0].basicDamage = 20
				calc = _create(_roll, _target)
				calc.hits[0].flexibleArmorOverride = true
				expect(calc.hits[0].results.injury!.value).toBe(2)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
			}
		})

		it("For every full 5 points of crushing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			_roll.damageType = DamageTypes.cr

			_roll.hits[0].basicDamage = 4
			let calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(0)

			_roll.hits[0].basicDamage = 5
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(1)

			_roll.hits[0].basicDamage = 19
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(3)

			_roll.hits[0].basicDamage = 20
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.penetratingDamage!.value).toBe(0)
			expect(calc.hits[0].results.injury!.value).toBe(4)
		})

		it("If even one point of damage penetrates your flexible DR, however, you do not suffer blunt trauma.", () => {
			_roll.damageType = DamageTypes.cr
			_roll.hits[0].basicDamage = 21
			let calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.injury!.value).toBe(1)

			_roll.damageType = DamageTypes["pi-"]
			_roll.hits[0].basicDamage = 21
			calc = _create(_roll, _target)
			calc.hits[0].flexibleArmorOverride = true
			expect(calc.hits[0].results.injury!.value).toBe(1)
		})

		it("(Burning, Corrosive, Fatigue, Toxic, and Knockback don't do blunt trauma.)", () => {
			for (const type of [DamageTypes.burn, DamageTypes.cor, DamageTypes.fat, DamageTypes.tox, DamageTypes.kb]) {
				_roll.damageType = type
				_roll.hits[0].basicDamage = 20
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(0)
			}
		})
	})

	describe("B381: Shock: Any injury that causes a loss of HP also causes “shock.”", () => {
		beforeEach(() => {
			_torso._map.set("all", 2)
		})

		const verify = function (hp: number, noShockValues: number[], shockValues: DamageShock[]) {
			_target.hitPoints.value = hp

			for (const damage of noShockValues) {
				_roll.hits[0].basicDamage = damage
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.shockEffects).toHaveLength(0)
			}

			for (const entry of shockValues) {
				_roll.hits[0].basicDamage = entry.damage
				const calc = _create(_roll, _target)

				const injuryEffects = calc.hits[0].results.shockEffects
				// /help  how to check for objects of a certain type
				expect(injuryEffects).toHaveLength(1)
				const containsShockInjuryEffect = injuryEffects.some(effect => effect instanceof ShockInjuryEffect)
				expect(containsShockInjuryEffect).toBe(true)

				// expect(injuryEffects).toContainEqual(
				// 	expect.objectContaining({
				// 		id: InjuryEffectType.shock,
				// 	})
				// )

				// let modifiers = calc.hits[0].results.shockEffects.find(it => it.id === InjuryEffectType.shock)
				// 	?.modifiers
				// expect(modifiers).toContainEqual(
				// 	expect.objectContaining({
				// 		id: "dx",
				// 		rollType: RollType.Attribute,
				// 		modifier: entry.shock,
				// 	})
				// )
				// expect(modifiers).toContainEqual(
				// 	expect.objectContaining({
				// 		id: "iq",
				// 		rollType: RollType.Attribute,
				// 		modifier: entry.shock,
				// 	})
				// )
			}
		}

		// eslint-disable-next-line jest/expect-expect
		it("This is -1 per HP lost...", () => {
			const hp = 19
			const noShockValues = [1, 2]
			const shockValues = [
				{ damage: 3, shock: -1 },
				{ damage: 4, shock: -2 },
				{ damage: 5, shock: -3 },
				{ damage: 6, shock: -4 },
			]
			verify(hp, noShockValues, shockValues)
		})

		// eslint-disable-next-line jest/expect-expect
		it("...unless you have 20 or more HP, in which case it is -1 per (HP/10) lost, rounded down.", () => {
			for (const hp of [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]) {
				const noShockValues = [1, 2, 3]
				const shockValues = [
					{ damage: 4, shock: -1 },
					{ damage: 5, shock: -1 },
					{ damage: 6, shock: -2 },
					{ damage: 7, shock: -2 },
					{ damage: 8, shock: -3 },
					{ damage: 9, shock: -3 },
					{ damage: 10, shock: -4 },
					{ damage: 11, shock: -4 },
				]

				verify(hp, noShockValues, shockValues)
			}

			for (const hp of [30, 31, 32, 33, 34, 35, 36, 37, 38, 39]) {
				const noShockValues = [1, 2, 3, 4]
				const shockValues = [
					{ damage: 5, shock: -1 },
					{ damage: 6, shock: -1 },
					{ damage: 7, shock: -1 },
					{ damage: 8, shock: -2 },
					{ damage: 9, shock: -2 },
					{ damage: 10, shock: -2 },
					{ damage: 11, shock: -3 },
					{ damage: 12, shock: -3 },
					{ damage: 13, shock: -3 },
					{ damage: 14, shock: -4 },
					{ damage: 15, shock: -4 },
					{ damage: 16, shock: -4 },
				]

				verify(hp, noShockValues, shockValues)
			}
		})

		// eslint-disable-next-line jest/expect-expect
		it("The shock penalty cannot exceed -4, no matter how much injury you suffer.", () => {
			const hp = 12
			const noShockValues: never[] = [] // We're not testing this here.
			const shockValues = [
				{ damage: 7, shock: -4 },
				{ damage: 17, shock: -4 },
				{ damage: 57, shock: -4 },
			]

			verify(hp, noShockValues, shockValues)
		})
	})

	describe("B381: Major Wounds.", () => {
		it.skip("Any single injury that inflicts a wound in excess of 1/2 your HP is a major wound.", () => {
			_target.hitPoints.value = 12
			_roll.hits[0].locationId = "any location"

			_roll.hits[0].basicDamage = 6
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.effects).not.toContainEqual(expect.objectContaining({ id: "majorWound" }))
			expect(calc.hits[0].results.majorWoundEffects).toHaveLength(0)

			_roll.hits[0].basicDamage = 7
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.effects).toContainEqual(expect.objectContaining({ id: "majorWound" }))
			const wound = calc.hits[0].results.effects.find(it => it.id === "majorWound")
			expect(wound?.modifiers.length).toBe(0)
		})

		it.skip("For a major wound to the torso, you must make a HT roll. Failure means you’re stunned and knocked down; failure by 5+ means you pass out.", () => {
			_target.hitPoints.value = 12
			_roll.hits[0].locationId = "Torso"
			_roll.hits[0].basicDamage = 7

			const calc = _create(_roll, _target)

			const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
					failures: Knockdown,
				}),
			)
		})
	})

	describe("B378: Knockback. Knockback depends on basic damage rolled before subtracting DR.", () => {
		beforeEach(() => {
			_target.ST = 12
		})

		it.skip("Only crushing and cutting (and knockback only) attacks can cause knockback.", () => {
			_torso._map.set("all", 16)
			_target.ST = 10
			_roll.hits[0].basicDamage = 16

			const testKeys = Object.keys(DamageTypes).filter(k => !["cr", "cut", "kb"].includes(k))
			for (const type of testKeys as (keyof typeof DamageTypes)[]) {
				_roll.damageType = DamageTypes[type]

				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.knockback).toBe(0)
			}
		})

		it.skip("A crushing (or knockback only) attack can cause knockback regardless of whether it penetrates DR.", () => {
			expect(_roll.damageType).toBe(DamageTypes.cr)

			_roll.hits[0].basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(0)

			_roll.hits[0].basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(2)

			_roll.damageType = DamageTypes.kb

			_roll.hits[0].basicDamage = 9
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(0)

			_roll.hits[0].basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(2)
		})

		it.skip("A cutting attack can cause knockback only if it fails to penetrate DR.", () => {
			_roll.damageType = DamageTypes.cut
			_torso._map.set("all", 15)

			_roll.hits[0].basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(0)

			_roll.hits[0].basicDamage = 15
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 16
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(0)
		})

		it.skip("For every full multiple of the target’s ST-2 rolled, move the target one yard away from the attacker.", () => {
			_roll.damageType = DamageTypes.cr

			_roll.hits[0].basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(0)

			_roll.hits[0].basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			_roll.hits[0].basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(2)
		})

		it.skip("Anyone who suffers knockback must attempt a roll against the highest of DX, Acrobatics, or Judo. On a failure, he falls down.", () => {
			expect(_roll.damageType).toBe(DamageTypes.cr)

			_roll.hits[0].basicDamage = 10
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			const injuryEffects = calc.hits[0].results.effects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				}),
			)

			const checks = calc.hits[0].results.effects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 0 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 0 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 0 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				}),
			)
		})

		it.skip("... at -1 per yard after the first.", () => {
			expect(_roll.damageType).toBe(DamageTypes.cr)

			_roll.hits[0].basicDamage = 20
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(2)

			const injuryEffects = calc.hits[0].results.effects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				}),
			)

			let checks = calc.hits[0].results.effects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: -1 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: -1 },
						{ id: "Judo", rollType: RollType.Skill, modifier: -1 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				}),
			)

			_roll.hits[0].basicDamage = 50
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(5)

			checks = calc.hits[0].results.effects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: -4 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: -4 },
						{ id: "Judo", rollType: RollType.Skill, modifier: -4 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				}),
			)
		})

		it.skip("Perfect Balance gives +4 to this roll.", () => {
			expect(_roll.damageType).toBe(DamageTypes.cr)

			_target._traits.push(new _TargetTrait("Perfect Balance", 0))

			_roll.hits[0].basicDamage = 10
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(1)

			const injuryEffects = calc.hits[0].results.effects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				}),
			)

			let checks = calc.hits[0].results.effects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 4 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 4 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 4 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				}),
			)

			_roll.hits[0].basicDamage = 30
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.knockback).toBe(3)

			checks = calc.hits[0].results.effects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 2 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 2 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 2 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				}),
			)
		})
	})

	describe("B398: Hit Location", () => {
		describe("Vitals.", () => {
			beforeEach(() => {
				_roll.hits[0].locationId = "Vitals"
			})

			it("Increase the wounding modifier for an impaling or any piercing attack to ×3.", () => {
				const types = [DamageTypes.imp, ...AnyPiercingType]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(30)
				}
			})

			it("Increase the wounding modifier for a tight-beam burning attack to ×2.", () => {
				_roll.damageType = DamageTypes.burn
				_roll.damageModifier = "tbb"
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(20)
			})

			it.skip("B420: Whenever you are struck in the vitals for enough injury to cause a shock penalty, you must make an immediate HT roll to avoid knockdown.", () => {
				_roll.hits[0].basicDamage = 1
				_roll.damageType = DamageTypes.cr
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(1)
				expect(calc.hits[0].results.injury!.value).toBe(1)

				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.shock }),
				)

				const checks = calc.hits[0].results.effects.find(it => it.id === InjuryEffectType.majorWound)?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					}),
				)
			})
		})

		describe("Skull or Eye. (For eye, treat as a skull hit without the extra DR 2!)", () => {
			it("The wounding modifier for all attacks increases to ×4.", () => {
				for (const location of ["Skull", "Eye"]) {
					_roll.hits[0].locationId = location

					const types = [
						DamageTypes.imp,
						...AnyPiercingType,
						DamageTypes.burn,
						DamageTypes.cor,
						DamageTypes.cr,
						DamageTypes.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
						expect(calc.hits[0].results.injury!.value).toBe(40)
					}
				}
			})

			it.skip("Knockdown (stun) rolls are at -10.", () => {
				for (const location of ["Skull", "Eye"]) {
					_roll.hits[0].locationId = location

					const types = [
						DamageTypes.imp,
						...AnyPiercingType,
						DamageTypes.burn,
						DamageTypes.cor,
						DamageTypes.cr,
						DamageTypes.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						const calc = _create(_roll, _target)

						const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
						expect(checks).toContainEqual(
							expect.objectContaining({
								checks: [{ id: "ht", modifier: -10, rollType: RollType.Attribute }],
								failures: Knockdown,
							}),
						)
					}
				}
			})

			it.skip("B420: Whenever you are struck in the head for enough injury to cause a shock penalty, you must make an immediate HT roll to avoid knockdown.", () => {
				for (const location of ["Skull", "Eye"]) {
					_roll.hits[0].locationId = location

					_roll.hits[0].basicDamage = 1
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(1)
					expect(calc.hits[0].results.injury!.value).toBe(4)

					expect(calc.hits[0].results.effects).toContainEqual(expect.objectContaining({ id: "shock" }))

					const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: -10, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)
				}
			})

			it.skip("None of these effects apply to toxic damage.", () => {
				for (const location of ["Skull", "Eye"]) {
					_roll.hits[0].locationId = location

					_roll.hits[0].basicDamage = 8
					_roll.damageType = DamageTypes.tox
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(8)
					expect(calc.hits[0].results.injury!.value).toBe(8)

					expect(calc.hits[0].results.effects).toContainEqual(expect.objectContaining({ id: "majorWound" }))
				}
			})

			it("Fatigue damage always ignores hit location.", () => {
				for (const location of ["Skull", "Eye"]) {
					_roll.hits[0].locationId = location

					_roll.damageType = DamageTypes.fat
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(10)
				}
			})

			it.skip("Injury over HP/10 blinds the eye.", () => {
				_target.hitPoints.value = 50
				_roll.hits[0].locationId = "Eye"

				_roll.hits[0].basicDamage = 1
				_roll.damageType = DamageTypes.cr
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(1)
				expect(calc.hits[0].results.injury!.value).toBe(4)

				expect(calc.hits[0].results.effects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.hits[0].basicDamage = 2
				_roll.damageType = DamageTypes.cr
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(2)
				expect(calc.hits[0].results.injury!.value).toBe(8)

				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.eyeBlinded }),
				)
			})
		})

		describe("Face.", () => {
			beforeEach(() => {
				_roll.hits[0].locationId = "Face"
			})

			it("Corrosion damage (only) gets a ×1.5 wounding modifier.", () => {
				_roll.damageType = DamageTypes.cor
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(15)

				_roll.damageType = DamageTypes.imp
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(20)

				_roll.damageType = DamageTypes["pi++"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(20)

				_roll.damageType = DamageTypes["pi-"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(5)

				_roll.damageType = DamageTypes["pi+"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(15)

				_roll.damageType = DamageTypes.cut
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(15)

				const types = [DamageTypes.pi, DamageTypes.burn, DamageTypes.cr]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(10)
				}
			})

			it.skip("Knockdown (stun) rolls are at -5.", () => {
				const calc = _create(_roll, _target)

				const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					}),
				)
			})

			it.skip("If (Corrosive damage) inflicts a major wound, it also blinds one eye...", () => {
				_roll.hits[0].locationId = "Face"
				_roll.hits[0].basicDamage = 8
				_roll.damageType = DamageTypes.cor
				const calc = _create(_roll, _target)

				expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 2)
				expect(calc.hits[0].results.injury!.value).toBeLessThan(_target.hitPoints.value)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.majorWound }),
				)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.eyeBlinded }),
				)
			})

			it.skip("...(both eyes on damage greater than full HP).", () => {
				_roll.hits[0].locationId = "Face"
				_roll.hits[0].basicDamage = 15
				_roll.damageType = DamageTypes.cor
				const calc = _create(_roll, _target)

				expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.majorWound }),
				)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.blinded }),
				)
			})
		})

		describe("Neck.", () => {
			beforeEach(() => {
				_roll.hits[0].locationId = "Neck"
			})

			it("Increase the wounding multiplier of crushing and corrosion attacks to ×1.5", () => {
				const types = [DamageTypes.cr, DamageTypes.cor]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(15)
				}
			})

			it("...and that of cutting damage to ×2.", () => {
				_roll.damageType = DamageTypes.cut
				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(20)
			})

			it("(Other damage types are unchanged.)", () => {
				_roll.damageType = DamageTypes["pi-"]
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(5)

				for (const type of [DamageTypes.burn, DamageTypes.fat, DamageTypes.pi, DamageTypes.tox]) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(10)
				}

				_roll.damageType = DamageTypes["pi+"]
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(15)

				for (const type of [DamageTypes.imp, DamageTypes["pi++"]]) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(20)
				}
			})
		})

		describe("Groin.", () => {
			beforeEach(() => {
				_roll.hits[0].locationId = "Groin"
			})

			it("Treat as a torso hit...", () => {
				_roll.damageType = DamageTypes["pi-"]
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
				expect(calc.hits[0].results.injury!.value).toBe(5)

				for (const type of [
					DamageTypes.burn,
					DamageTypes.fat,
					DamageTypes.pi,
					DamageTypes.tox,
					DamageTypes.cr,
					DamageTypes.cor,
				]) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(10)
				}

				for (const type of [DamageTypes.cut, DamageTypes["pi+"]]) {
					_roll.damageType = type
					calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(15)
				}

				for (const type of [DamageTypes.imp, DamageTypes["pi++"]]) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(20)
				}
			})

			it.skip("except that human males suffer double the usual shock from crushing damage (to a maximum of -8).", () => {
				_roll.damageType = DamageTypes.cr

				for (const damage of [1, 2, 3, 4]) {
					_roll.hits[0].basicDamage = damage
					const calc = _create(_roll, _target)
					// Const injuryEffects = calc.injuryEffects

					const modifiers = calc.hits[0].results.effects.find(
						it => it.id === InjuryEffectType.shock,
					)?.modifiers
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "dx",
							rollType: RollType.Attribute,
							modifier: damage * -2,
						}),
					)
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "iq",
							rollType: RollType.Attribute,
							modifier: damage * -2,
						}),
					)
				}
			})

			it.skip("...and get -5 to knockdown rolls.", () => {
				_roll.damageType = DamageTypes.cr
				const calc = _create(_roll, _target)

				const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					}),
				)
			})
		})

		describe("Arm or Leg.", () => {
			beforeEach(() => {
				_roll.hits[0].basicDamage = 6
			})

			it("Reduce the wounding multiplier of large piercing, huge piercing, and impaling damage to ×1.", () => {
				for (const id of ["Arm", "Leg"]) {
					_roll.hits[0].locationId = id
					_roll.damageType = DamageTypes["pi-"]
					// Let calc = _create(_roll, _target)
					for (const type of [DamageTypes.imp, DamageTypes["pi++"], DamageTypes["pi+"]]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}
				}
			})

			it("(Other damage types are unchanged.)", () => {
				for (const id of ["Arm", "Leg"]) {
					_roll.hits[0].locationId = id
					_roll.hits[0].basicDamage = 6

					_roll.damageType = DamageTypes["pi-"]
					let calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(3)

					for (const type of [
						DamageTypes.burn,
						DamageTypes.fat,
						DamageTypes.pi,
						DamageTypes.tox,
						DamageTypes.cr,
						DamageTypes.cor,
					]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}

					for (const type of [DamageTypes.cut]) {
						_roll.hits[0].basicDamage = 4
						_roll.damageType = type
						calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(4)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}
				}
			})

			it.skip("Any major wound (loss of over 1/2 HP from one blow) cripples the limb...", () => {
				for (const id of ["Arm", "Leg"]) {
					_roll.hits[0].locationId = id

					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 2)

					const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)

					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})

			it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
				for (const id of ["Arm", "Leg"]) {
					_roll.hits[0].locationId = id

					_target.hitPoints.value = 15
					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(8)
				}
			})
		})

		describe("Hand or Foot.", () => {
			beforeEach(() => {
				_roll.hits[0].basicDamage = 6
				_target.hitPoints.value = 21
			})

			it("Reduce the wounding multiplier of large piercing, huge piercing, and impaling damage to ×1.", () => {
				for (const id of ["Hand", "Foot"]) {
					_roll.hits[0].locationId = id
					for (const type of [DamageTypes.imp, DamageTypes["pi++"], DamageTypes["pi+"]]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}
				}
			})

			it("(Other damage types are unchanged.)", () => {
				for (const id of ["Hand", "Foot"]) {
					_roll.hits[0].locationId = id
					_roll.hits[0].basicDamage = 6

					_roll.damageType = DamageTypes["pi-"]
					let calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(3)

					for (const type of [
						DamageTypes.burn,
						DamageTypes.fat,
						DamageTypes.pi,
						DamageTypes.tox,
						DamageTypes.cr,
						DamageTypes.cor,
					]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}

					for (const type of [DamageTypes.cut]) {
						_roll.hits[0].basicDamage = 4
						_roll.damageType = type
						calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(4)
						expect(calc.hits[0].results.injury!.value).toBe(6)
					}
				}
			})

			it.skip("damage over 1/3 HP in one blow inflicts a crippling major wound...", () => {
				for (const id of ["Hand", "Foot"]) {
					_roll.hits[0].locationId = id

					_roll.hits[0].basicDamage = 8
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 3)

					const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)

					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})

			it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
				for (const id of ["Hand", "Foot"]) {
					_roll.hits[0].locationId = id

					_target.hitPoints.value = 15
					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					// Math.floor(_target.hitPoints.value / 3) + 1
					expect(calc.hits[0].results.injury!.value).toBe(6)
				}
			})
		})
	})

	describe("B380: Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Unliving"
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1; ...", () => {
				const types = [DamageTypes.imp, DamageTypes["pi++"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(6)
				}
			})

			it("... large piercing, ×1/2;", () => {
				const types = [DamageTypes["pi+"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(3)
				}
			})

			it("... piercing, ×1/3;", () => {
				const types = [DamageTypes.pi]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})

			it("... and small piercing, ×1/5.", () => {
				const types = [DamageTypes["pi-"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 15
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Homogenous"
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1/2; ...", () => {
				const types = [DamageTypes.imp, DamageTypes["pi++"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(3)
				}
			})

			it("... large piercing, ×1/3;", () => {
				const types = [DamageTypes["pi+"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 11
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(6)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})

			it("... piercing, ×1/5;", () => {
				const types = [DamageTypes.pi]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 15
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})

			it("... and small piercing, ×1/10.", () => {
				const types = [DamageTypes["pi-"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.hits[0].basicDamage = 15
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(1)
				}
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Diffuse"
				_roll.hits[0].basicDamage = 100
			})

			it("Impaling and piercing attacks (of any size) never do more than 1 HP of injury.", () => {
				const types = [
					DamageTypes.imp,
					DamageTypes["pi++"],
					DamageTypes["pi+"],
					DamageTypes.pi,
					DamageTypes["pi-"],
				]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(95)
					expect(calc.hits[0].results.injury!.value).toBe(1)
				}
			})

			it("Other attacks can never do more than 2 HP of injury.", () => {
				const types = [
					DamageTypes.burn,
					DamageTypes.cor,
					DamageTypes.cr,
					DamageTypes.cut,
					DamageTypes.fat,
					DamageTypes.injury,
					DamageTypes.tox,
				]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})
		})
	})

	describe("B400: Injury Tolerance and Hit Location.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Unliving"
			})

			it("Piercing and impaling damage to any location other than eye, skull, or vitals uses wounding modifiers from Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
				_roll.hits[0].locationId = "Skull"
				const types = [DamageTypes.imp, ...AnyPiercingType]
				for (const type of types) {
					_roll.damageType = type
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(40)
				}
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Homogenous"
			})

			it.skip("Ignore all wounding modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.hits[0].locationId = location

					for (const type of [DamageTypes.imp, DamageTypes["pi++"]]) {
						_roll.damageType = type
						_roll.hits[0].basicDamage = 11
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(11)
						expect(calc.hits[0].results.injury!.value).toBe(5)
					}

					_roll.damageType = DamageTypes["pi+"]
					_roll.hits[0].basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(11)
					expect(calc.hits[0].results.injury!.value).toBe(3)

					_roll.damageType = DamageTypes.pi
					_roll.hits[0].basicDamage = 15
					calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(15)
					expect(calc.hits[0].results.injury!.value).toBe(3)

					_roll.damageType = DamageTypes["pi-"]
					_roll.hits[0].basicDamage = 20
					calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(20)
					expect(calc.hits[0].results.injury!.value).toBe(2)
				}
			})

			it.skip("Ignore all knockdown modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.hits[0].locationId = location
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)

					const checks = calc.hits[0].results.effects.find(
						it => it.id === InjuryEffectType.majorWound,
					)?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)
				}
			})

			it.skip("(Eyes can still be crippled.)", () => {
				_target.hitPoints.value = 50
				_roll.hits[0].locationId = "Eye"

				_roll.hits[0].basicDamage = 5
				_roll.damageType = DamageTypes.cr
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBeLessThanOrEqual(_target.hitPoints.value / 10)
				expect(calc.hits[0].results.effects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.hits[0].basicDamage = 6
				_roll.damageType = DamageTypes.cr
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 10)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.eyeBlinded }),
				)
			})

			it.skip("(Limbs can still be crippled.)", () => {
				for (const id of Limb) {
					_roll.hits[0].locationId = id

					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 2)
					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})

			it.skip("(Assume that hands and feet can still be crippled.)", () => {
				for (const id of Extremity) {
					_roll.hits[0].locationId = id

					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 3)
					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Diffuse"
				_roll.hits[0].basicDamage = 100
			})

			it("Ignore all wounding modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.hits[0].locationId = location

					for (const type of [DamageTypes.imp, ...AnyPiercingType]) {
						_roll.damageType = type
						_roll.hits[0].basicDamage = 11
						const calc = _create(_roll, _target)
						if (calc.hits[0].results.injury!.value === 8) console.debug(`${type.id}:${location}`)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(11)
						expect(calc.hits[0].results.injury!.value).toBe(1)
					}

					const types = [
						DamageTypes.burn,
						DamageTypes.cor,
						DamageTypes.cr,
						DamageTypes.cut,
						DamageTypes.fat,
						DamageTypes.injury,
						DamageTypes.tox,
					]
					for (const type of types) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.injury!.value).toBe(2)
					}
				}
			})

			it.skip("Ignore all knockdown modifiers for hit location.", () => {
				_target.hitPoints.value = 3
				for (const location of locations) {
					_roll.hits[0].locationId = location
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)

					const checks = calc.hits[0].results.effects.find(
						it => it.id === InjuryEffectType.majorWound,
					)?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)
				}
			})

			it.skip("(Eyes can still be crippled.)", () => {
				_target.hitPoints.value = 10
				_roll.hits[0].locationId = "Eye"

				_roll.hits[0].basicDamage = 5
				_roll.damageType = DamageTypes.imp
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBeLessThanOrEqual(_target.hitPoints.value / 10)
				expect(calc.hits[0].results.effects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.hits[0].basicDamage = 6
				_roll.damageType = DamageTypes.cr
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 10)
				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.eyeBlinded }),
				)
			})

			it.skip("(Limbs can still be crippled.)", () => {
				for (const id of Limb) {
					_roll.hits[0].locationId = id
					_target.hitPoints.value = 2
					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 2)
					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})

			it.skip("(Assume that hands and feet can still be crippled.)", () => {
				for (const id of Extremity) {
					_roll.hits[0].locationId = id
					_target.hitPoints.value = 2
					_roll.hits[0].basicDamage = 10
					_roll.damageType = DamageTypes.cr
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.injury!.value).toBeGreaterThan(_target.hitPoints.value / 3)
					expect(calc.hits[0].results.effects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled }),
					)
				}
			})
		})

		describe("No Brain.", () => {
			const theLocations = ["Skull", "Eye"]
			beforeEach(() => {
				_target._traits.push(new _TargetTrait("No Brain", 0))
			})

			it.skip("Hits to the skull (or eye) get no extra knockdown modifier.", () => {
				for (const location of theLocations) {
					_roll.hits[0].locationId = location

					const types = [
						DamageTypes.imp,
						...AnyPiercingType,
						DamageTypes.burn,
						DamageTypes.cor,
						DamageTypes.cr,
						DamageTypes.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						const calc = _create(_roll, _target)

						const checks = calc.hits[0].results.effects.find(it => it.id === "majorWound")?.checks
						expect(checks).toContainEqual(
							expect.objectContaining({
								checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
								failures: Knockdown,
							}),
						)
					}
				}
			})

			it("Hits to the skull (or eye) get no extra wounding modifier.", () => {
				for (const location of theLocations) {
					_roll.hits[0].locationId = location

					for (const type of [
						DamageTypes.burn,
						DamageTypes.cor,
						DamageTypes.cr,
						DamageTypes.pi,
						DamageTypes.tox,
					]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
						expect(calc.hits[0].results.injury!.value).toBe(10)
					}

					for (const type of [DamageTypes.cut, DamageTypes["pi+"]]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
						expect(calc.hits[0].results.injury!.value).toBe(15)
					}

					for (const type of [DamageTypes.imp, DamageTypes["pi++"]]) {
						_roll.damageType = type
						const calc = _create(_roll, _target)
						expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
						expect(calc.hits[0].results.injury!.value).toBe(20)
					}

					_roll.damageType = DamageTypes["pi-"]
					const calc = _create(_roll, _target)
					expect(calc.hits[0].results.penetratingDamage!.value).toBe(10)
					expect(calc.hits[0].results.injury!.value).toBe(5)
				}
			})

			it.skip("Hits to the eye can cripple the eye.", () => {
				_target.hitPoints.value = 20
				_roll.hits[0].locationId = "Eye"

				_roll.hits[0].basicDamage = 1
				_roll.damageType = DamageTypes.cr
				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(1)
				expect(calc.hits[0].results.injury!.value).toBe(1)

				expect(calc.hits[0].results.effects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.hits[0].basicDamage = 3
				_roll.damageType = DamageTypes.cr
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(3)
				expect(calc.hits[0].results.injury!.value).toBe(3)

				expect(calc.hits[0].results.effects).toContainEqual(
					expect.objectContaining({ id: InjuryEffectType.eyeBlinded }),
				)
			})
		})

		describe("No Vitals.", () => {
			const theLocations = ["Vitals", "Groin"]
			beforeEach(() => {
				_target._traits.push(new _TargetTrait("No Vitals", 0))
			})

			it.skip("Hits to the vitals or groin have the same effect as torso hits.", () => {
				for (const location of theLocations) {
					_roll.hits[0].locationId = location
					_target.hitPoints.value = 12
					_roll.hits[0].basicDamage = 7

					const calc = _create(_roll, _target)
					const injuryEffects = calc.hits[0].results.effects

					expect(calc.hits[0].results.injury!.value).toBe(7)

					const checks = injuryEffects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						}),
					)

					const modifiers = injuryEffects.find(it => it.id === InjuryEffectType.shock)?.modifiers
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "dx",
							rollType: RollType.Attribute,
							modifier: -4,
						}),
					)

					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "iq",
							rollType: RollType.Attribute,
							modifier: -4,
						}),
					)
				}
			})
		})

		describe("P53: Injury Tolerance (Damage Reduction).", () => {
			it("You divide the injury you suffer by 2, 3, or 4 after subtracting DR from damage and applying wounding modifiers.", () => {
				_torso._map.set("all", 4)
				_roll.damageType = DamageTypes.imp
				_roll.hits[0].basicDamage = 16

				let calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(24)

				const damageReduction = new _TargetTrait("Damage Reduction", 2)
				_target._traits.push(damageReduction)
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(12)

				damageReduction.levels = 3
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(8)

				damageReduction.levels = 4
				calc = _create(_roll, _target)
				expect(calc.hits[0].results.injury!.value).toBe(6)
			})

			it("(Ensure that max damage for a limb is still applied with a Damage Reduction value.)", () => {
				_target.hitPoints.value = 18
				_arm._map.set("all", 3)

				_roll.hits[0].locationId = "Arm"
				_roll.hits[0].basicDamage = 20
				_roll.damageType = DamageTypes.cr

				const calc = _create(_roll, _target)
				expect(calc.hits[0].results.penetratingDamage!.value).toBe(17)

				// Maximum damage for a limb is 1/2 HP + 1, or 10 for this character.
				expect(calc.hits[0].results.injury!.value).toBe(10)

				const damageReduction = new _TargetTrait("Damage Reduction", 2)
				_target._traits.push(damageReduction)

				// New damage should be 17 / 2 = 8.5, rounded up to 9.
				// This is below the max damage for a limb, so it should be 9.
				expect(calc.hits[0].results.injury!.value).toBe(9)

				calc.damageReductionOverride = 1.6
				// New damage should be 17 / 1.6 = 10.625, rounded up to 11.
				// But maximum damage for a limb for this character is 10.
				expect(calc.hits[0].results.injury!.value).toBe(10)
			})

			it("Damage Reduction applies to Blunt Trauma.", () => {
				_roll.hits[0].basicDamage = 20
				_roll.damageType = DamageTypes.cr

				_torso._map.set("all", 20)
				const damageReduction = new _TargetTrait("Damage Reduction", 2)
				_target._traits.push(damageReduction)

				const calc = _create(_roll, _target)
				calc.hits[0].flexibleArmorOverride = true
				expect(calc.hits[0].results.injury!.value).toBe(2)
			})
		})
	})

	describe("B400: Large-Area Injury.", () => {
		beforeEach(() => {
			_torso._map.set("all", 5)
		})

		it("Your “effective DR” is the average of your torso DR and the DR of the least protected hit location exposed to the attack, rounding up.", () => {
			_torso._map.set("all", 12)
			_vitals._map.set("all", 6)
			_skull._map.set("all", 6)
			_eye._map.set("all", 2)
			_face._map.set("all", 6)
			_neck._map.set("all", 6)
			_groin._map.set("all", 6)
			_arm._map.set("all", 6)
			_leg._map.set("all", 6)
			_hand._map.set("all", 6)
			_foot._map.set("all", 6)

			_roll.hits[0].locationId = DefaultHitLocations.LargeArea
			_roll.hits[0].basicDamage = 10
			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(3)
		})
	})

	describe("B378: Half Damage (1/2D) for Ranged Weapons.", () => {
		it("If the target is at or beyond 1/2D range, divide basic damage by 2, rounding down.", () => {
			_roll.damageType = DamageTypes.imp
			_roll.hits[0].basicDamage = 16
			_torso._map.set("all", 5)

			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(22)

			_roll.isHalfDamage = true
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(6)
		})
	})

	describe("B161: Vulnerability.", () => {
		it("Applies a special wounding multiplier to damage that penetrates your DR. Regular wounding multipliers further multiply the damage.", () => {
			_roll.hits[0].basicDamage = 10
			_roll.damageType = DamageTypes.cr
			_torso._map.set("all", 5)

			const calc = _create(_roll, _target)
			calc.vulnerabilities = [<Vulnerability>{ name: "Wounding", value: 3, apply: true }]
			expect(calc.hits[0].results.injury!.value).toBe(15)

			calc.vulnerabilities = [<Vulnerability>{ name: "Wounding", value: 2, apply: true }]
			expect(calc.hits[0].results.injury!.value).toBe(10)
		})
	})

	describe("B47: Damage Resistance (Hardened).", () => {
		it("Each level of Hardened reduces the armor divisor of an attack by one step.", () => {
			// These steps are, in order: “ignores DR,” 100, 10, 5, 3, 2, and 1 (no divisor).
			_torso._map.set("all", 20)
			_roll.hits[0].basicDamage = 20
			_roll.armorDivisor = 10
			let calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(18)

			const trait = new _TargetTrait("Damage Resistance", 0)
			trait.modifiers.push(new _TargetTraitModifier("Hardened", 2))
			_target._traits.push(trait)
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(14)

			_roll.armorDivisor = 2
			calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(0)
		})
	})

	describe("B409: Shotguns and Multiple Projectiles.", () => {
		it("At ranges <10% of 1/2D, don’t apply the RoF multiplier to RoF. Instead, multiply both basic damage dice and the target’s DR by half that value (round down).", () => {
			// Example: shotgun with 3x9 RoF and 1d+1 damage. Half of x9 is 4 (round down).
			// The new basic damage is 1d+1 x 4 (4d+4); the target's DR is also multiplied by 4.

			_torso._map.set("all", 6)

			// TODO: It may be possible to derive this info if we had a reference to the weapon used (to find the RoF
			// multiple and 10% of 1/2D range) and the distance between target and attacker.
			//
			// TODO: Maybe the correct approach is to determine damage BEFORE passing to the calculator, and setting
			// the "isShotgunExtremeRange" flag in the DamageRoll object?
			_roll.isShotgunCloseRange = true
			_roll.rofMultiplier = 9

			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.injury!.value).toBe(16)
		})
	})

	describe("B414: Explosions.", () => {
		beforeEach(() => {
			_roll.dice = new DiceGURPS("3d")
			_roll.damageModifier = "ex"
		})

		it("An explosion inflicts “collateral damage” on everything within (2 × dice of damage) yards.", () => {
			_roll.dice = new DiceGURPS("1d+3")
			_roll.hits[0].basicDamage = 9

			const calc = _create(_roll, _target)
			calc.rangeOverride = 3
			// It would be 9 ÷ (3 × 3) = 1; except the range is too far.
			expect(calc.hits[0].results.injury!.value).toBe(0)

			calc.rangeOverride = 2
			// It should be 9 ÷ (3 × 2) = 1.
			expect(calc.hits[0].results.injury!.value).toBe(1)
		})

		it("Roll this damage but divide it by (3 × yards from the center of the blast), rounding down.", () => {
			_roll.hits[0].basicDamage = 13
			_torso._map.set("all", 1)

			const calc = _create(_roll, _target)
			calc.rangeOverride = 2
			expect(calc.hits[0].results.basicDamage!.value).toBe(2) // 13 ÷ (3 × 2) = 2
			expect(calc.hits[0].results.injury!.value).toBe(1)

			calc.rangeOverride = 1
			expect(calc.hits[0].results.basicDamage!.value).toBe(4) // 13 ÷ (3 × 1) = 4
			expect(calc.hits[0].results.injury!.value).toBe(3)

			calc.rangeOverride = 3
			expect(calc.hits[0].results.basicDamage!.value).toBe(1) // 13 ÷ (3 × 3) = 1
			expect(calc.hits[0].results.injury!.value).toBe(0)
		})

		it("If an explosive attack has an armor divisor, it does not apply to the collateral damage.", () => {
			_roll.dice = new DiceGURPS("6d")
			_roll.hits[0].basicDamage = 24
			_roll.armorDivisor = 3
			_torso._map.set("all", 3)

			const calc = _create(_roll, _target)
			calc.rangeOverride = 2
			expect(calc.hits[0].results.basicDamage!.value).toBe(4) // 24 ÷ (3 × 2) = 4
			expect(calc.hits[0].results.injury!.value).toBe(1)

			calc.rangeOverride = 1
			expect(calc.hits[0].results.basicDamage!.value).toBe(8) // 24 ÷ (3 × 1) = 8
			expect(calc.hits[0].results.injury!.value).toBe(5)

			calc.rangeOverride = 3
			expect(calc.hits[0].results.basicDamage!.value).toBe(2) // 24 ÷ (3 × 3) = 2
			expect(calc.hits[0].results.injury!.value).toBe(0)
		})

		describe.skip("Contact Explosions. A person can throw himself on a grenade, etc.", () => {
			it("They take maximum possible damage; their DR protects them normally.", () => {
				expect(false).toBeTruthy()
			})

			it("Everyone else gets his torso’s DR + HP as “cover DR.”", () => {
				expect(false).toBeTruthy()
			})
		})

		it("Internal Explosions: DR has no effect! In addition, treat the blast as an attack on the vitals, with a ×3 wounding modifier.", () => {
			_roll.dice = new DiceGURPS("6d")
			_roll.hits[0].basicDamage = 24
			_roll.internalExplosion = true
			_torso._map.set("all", 3)

			const calc = _create(_roll, _target)
			expect(calc.hits[0].results.basicDamage!.value).toBe(24)
			expect(calc.hits[0].results.injury!.value).toBe(72) // 24 × 3 = 72
		})
	})

	describe.skip("B552: Non-Humanoid Hit Location Tables", () => {
		it("Wing: Treat a wing as a limb (arm, leg) for crippling purposes. A flyer with a crippled wing cannot fly.", () => {
			expect(false).toBeTruthy()
		})
		it("Fin: Treat a fin as an extremity (hand, foot) for crippling purposes. A crippled fin affects balance: -3 DX.", () => {
			expect(false).toBeTruthy()
		})
		it("Tail: If an Extra Arm or a Striker, or is a fish tail, treat it as a limb for crippling purposes; otherwise, treat it as an extremity. A crippled tail affects balance. For a ground creature, this gives -1 DX. For a swimmer or flyer, this gives -2 DX and halves Move.", () => {
			expect(false).toBeTruthy()
		})
	})

	describe.skip("B554: Vehicle Hit Location Table", () => {
		it("Body", () => {
			expect(false).toBeTruthy()
		})

		it("Caterpillar Track", () => {
			expect(false).toBeTruthy()
		})

		it("Exposed Weapon Mount", () => {
			expect(false).toBeTruthy()
		})

		it("Helicopter Rotor", () => {
			expect(false).toBeTruthy()
		})

		it("Large Glass Window", () => {
			expect(false).toBeTruthy()
		})

		it("Small Glass Window", () => {
			expect(false).toBeTruthy()
		})

		it("Large Superstructure or Gondola", () => {
			expect(false).toBeTruthy()
		})

		it("Main Turret", () => {
			expect(false).toBeTruthy()
		})

		it("Mast", () => {
			expect(false).toBeTruthy()
		})

		it("Runner or Skids", () => {
			expect(false).toBeTruthy()
		})

		it("Small Superstructure or Independent Turret", () => {
			expect(false).toBeTruthy()
		})

		it("Vital Area", () => {
			expect(false).toBeTruthy()
		})

		it("Wheel", () => {
			expect(false).toBeTruthy()
		})

		it("Wings", () => {
			expect(false).toBeTruthy()
		})
	})

	describe("Calculator Overrides.", () => {
		it("... can override injury.", () => {
			_roll.hits[0].basicDamage = 8
			const calc = _create(_roll, _target)
			expect(calc.injury).toBe(8)
			expect(calc.isOverridden).toBeFalsy()
			expect(calc.injuryOverride).toBeUndefined()

			calc.injuryOverride = 4
			expect(calc.injury).toBe(4)
			expect(calc.isOverridden).toBeTruthy()
			expect(calc.injuryOverride).toBe(4)

			calc.resetOverrides()
			expect(calc.isOverridden).toBeFalsy()
			expect(calc.injuryOverride).toBeUndefined()
		})

		it("... can override damagePool.", () => {
			_roll.hits[0].basicDamage = 8
			const calc = _create(_roll, _target)
			expect(calc.damagePoolID).toBe("hp")

			calc.damagePoolOverride = "fp"
			expect(calc.damagePoolID).toBe("fp")
			expect(calc.damagePoolOverride).toBe("fp")
		})
	})
})
