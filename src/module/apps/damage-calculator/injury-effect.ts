import { RollModifier, RollType, gid } from "@module/data/index.ts"

function getFormatFunction() {
	const format = game
		? game.i18n.format?.bind(game.i18n)
		: (stringId: string, data?: Record<string, unknown>) => `${stringId}${data ? `:${JSON.stringify(data)}` : ""}`

	return format
}

const asDisplayString = (n: number) => `${n < 0 ? "–" : ""}${Math.abs(n)}`

/**
 * InjuryEffect represents some effect of sudden injury.
 *
 * Right now, it is just data. At some point in the future, some of them may become Active Effects.
 */
class InjuryEffect {
	/* A unique identifier for the kind of effect. Might be an enum? */
	id: InjuryEffectType

	/* An array of RollModifiers that is a direct consequence of the effect. */
	modifiers: RollModifier[]

	/* An array of EffectChecks. */
	checks: EffectCheck[]

	displayName: string = ""

	description: string = ""

	level: number | undefined

	disabled: boolean = false

	format = getFormatFunction()

	constructor(id: InjuryEffectType, modifiers: RollModifier[] = [], checks: EffectCheck[] = []) {
		this.id = id
		this.modifiers = modifiers
		this.checks = checks
	}
}

export class ShockInjuryEffect extends InjuryEffect {
	constructor(level: number) {
		super(InjuryEffectType.shock)

		this.level = level
		this.displayName = this.format("gurps.dmgcalc.effect_types.shock")
		this.description = this.format("gurps.dmgcalc.effect_descriptions.shock", {
			level: asDisplayString(this.level),
		})
	}
}

// /**
//  * RollModifier represents a generic modifier to some kind of roll.
//  *
//  * modifier - the numeric value used to modify the roll or check.
//  * rollType - the type of the roll/check modified.
//  * id - either the id of an attribute or name of the thing (skill, spell, etc).
//  */
// class RollModifier {
// 	id: string
//
// 	rollType: RollType
//
// 	modifier: number
//
// 	constructor(id: string, rollType: RollType, modifier: number) {
// 		this.id = id
// 		this.rollType = rollType
// 		this.modifier = modifier
// 	}
// }

/**
 * An Effect Check is a conditional injury effect that requires a check of some kind, with consequences if failed.
 */
class EffectCheck {
	/**
	 * An array of modified rolls which, if failed, triggers the failures listed below.
	 * Resolution of the check requires selecting the *best* of the following rolls.
	 */
	checks: RollModifier[]

	/* An array of consequences if the check fails. */
	failures: CheckFailureConsequence[]

	constructor(checks: RollModifier[], failures: CheckFailureConsequence[]) {
		this.checks = checks
		this.failures = failures
	}
}

/**
 * The consequence of failing a check.
 *
 * margin - "margin of failure" at which this effect is applied.
 * id - the identifier of a consequence.
 *
 * The actual effect on an actor is resolved elsewhere.
 */
class CheckFailureConsequence {
	margin: number

	id: ConsequenceId

	constructor(id: ConsequenceId, margin: number) {
		this.id = id
		this.margin = margin
	}
}

type ConsequenceId = "fall prone" | "stun" | "unconscious"

/**
 * TODO I'm kind of torn on this ... maybe it should just be a string, rather than an enum?
 */
enum InjuryEffectType {
	shock = "shock",
	majorWound = "majorWound",
	knockback = "knockback",
	eyeBlinded = "eyeBlinded",
	blinded = "blinded",
	limbCrippled = "limbCrippled",
}

class KnockdownCheck extends EffectCheck {
	constructor(modifier = 0) {
		super(
			[<RollModifier>{ id: gid.Health, rollType: RollType.Attribute, modifier: modifier }],
			[
				new CheckFailureConsequence("stun", 0),
				new CheckFailureConsequence("fall prone", 0),
				new CheckFailureConsequence("unconscious", 5),
			],
		)
	}
}

export { InjuryEffect, InjuryEffectType, CheckFailureConsequence, EffectCheck, KnockdownCheck }
