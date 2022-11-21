import {
	double,
	identity,
	max1,
	max2,
	oneAndOneHalf,
	oneFifth,
	oneHalf,
	oneTenth,
	oneThird,
	ModifierFunction,
} from "./utils"

/**
 * Create the definitions of GURPS damage types.
 */
enum DamageType {
	injury = "injury",
	burn = "burning",
	cor = "corrosive",
	cr = "crushing",
	cut = "cutting",
	fat = "fatigue",
	imp = "impaling",
	"pi-" = "small piercing",
	pi = "piercing",
	"pi+" = "large piercing",
	"pi++" = "huge piercing",
	tox = "toxic",
	// TODO Should we include "knockback only" as a damage type?
	kb = "knockback only",
}

const AnyPiercingType: DamageType[] = [DamageType.pi, DamageType["pi-"], DamageType["pi+"], DamageType["pi++"]]

type DamageTypeData = {
	[key in DamageType]: {
		theDefault: ModifierFunction
		unliving: ModifierFunction
		homogenous: ModifierFunction
		diffuse: ModifierFunction
	}
}

const dataTypeMultiplier: DamageTypeData = {
	[DamageType.injury]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.burn]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.cor]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.cr]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.cut]: {
		theDefault: oneAndOneHalf,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.fat]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.imp]: {
		theDefault: double,
		unliving: identity,
		homogenous: oneHalf,
		diffuse: max1,
	},
	[DamageType["pi-"]]: {
		theDefault: oneHalf,
		unliving: oneFifth,
		homogenous: oneTenth,
		diffuse: max1,
	},
	[DamageType.pi]: {
		theDefault: identity,
		unliving: oneThird,
		homogenous: oneFifth,
		diffuse: max1,
	},
	[DamageType["pi+"]]: {
		theDefault: oneAndOneHalf,
		unliving: identity,
		homogenous: oneThird,
		diffuse: max1,
	},
	[DamageType["pi++"]]: {
		theDefault: double,
		unliving: identity,
		homogenous: oneHalf,
		diffuse: max1,
	},
	[DamageType.tox]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
	[DamageType.kb]: {
		theDefault: identity,
		unliving: identity,
		homogenous: identity,
		diffuse: max2,
	},
}

export { DamageType, dataTypeMultiplier, AnyPiercingType }
