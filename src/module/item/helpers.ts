import { ActorGURPS } from "@actor"
import { CONTAINER_TYPES, ItemType } from "@module/data/constants.ts"
import { ContainedWeightReduction, Feature } from "@system"
import { Int, Weight, WeightUnits, emcost, emweight, setHasElement } from "@util"
import { AbstractContainerGURPS } from "./abstract-container/document.ts"
import { ItemGURPS } from "./base/document.ts"
import { ItemSourceGURPS } from "./data/index.ts"
import { EquipmentContainerGURPS } from "./equipment-container/document.ts"
import { EquipmentModifierGURPS } from "./equipment-modifier/document.ts"
import { EquipmentGURPS } from "./equipment/document.ts"
import { ItemInstances } from "./types.ts"

type ItemOrSource = PreCreate<ItemSourceGURPS> | ItemGURPS

/** Determine in a type-safe way whether an `ItemGURPS` or `ItemSourceGURPS` is among certain types */
function itemIsOfType<TParent extends ActorGURPS | null, TType extends ItemType>(
	item: ItemOrSource,
	...types: TType[]
): item is ItemInstances<TParent>[TType] | ItemInstances<TParent>[TType]["_source"]
function itemIsOfType<TParent extends ActorGURPS | null, TType extends "container" | ItemType>(
	item: ItemOrSource,
	...types: TType[]
): item is TType extends "container"
	? AbstractContainerGURPS<TParent> | AbstractContainerGURPS<TParent>["_source"]
	: TType extends ItemType
		? ItemInstances<TParent>[TType] | ItemInstances<TParent>[TType]["_source"]
		: never
function itemIsOfType<TParent extends ActorGURPS | null>(
	item: ItemOrSource,
	type: "container",
): item is AbstractContainerGURPS<TParent> | AbstractContainerGURPS["_source"]
function itemIsOfType(item: ItemOrSource, ...types: string[]): boolean {
	return (
		typeof item.name === "string" &&
		types.some(t => (t === "container" ? setHasElement(CONTAINER_TYPES, item.type) : item.type === t))
	)
}

function processMultiplyAddWeightStep(
	type: emweight.Type,
	weight: number,
	units: WeightUnits,
	modifiers: Collection<EquipmentModifierGURPS>,
): number {
	let w = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === type) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(type, mod.system.weight)
			const amt = emweight.Value.extractFraction(t, mod.system.weight)
			if (t === emweight.Value.Addition)
				w += Weight.toPounds(amt.value, Weight.trailingWeightUnitsFromString(mod.system.weight, units))
			else if (t === emweight.Value.PercentageMultiplier)
				weight = (weight * amt.numerator) / (amt.denominator * 100)
			else if (t === emweight.Value.Multiplier) weight = (weight * amt.numerator) / amt.denominator
		}
	})
	return weight + w
}

function weightAdjustedForModifiers(
	weight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	defUnits: WeightUnits,
): number {
	let percentages = 0
	let w = Int.from(weight)

	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.system.weight_type === emweight.Type.Original) {
			const t = emweight.Type.determineModifierWeightValueTypeFromString(
				emweight.Type.Original,
				mod.system.weight,
			)
			const amt = emweight.Value.extractFraction(t, mod.system.weight).value
			if (t === emweight.Value.Addition) {
				w += Weight.toPounds(amt, Weight.trailingWeightUnitsFromString(mod.system.weight, defUnits))
			} else {
				percentages += amt
			}
		}
	})
	if (percentages !== 0) w += Number(weight) * (percentages / 100)

	w = processMultiplyAddWeightStep(emweight.Type.Base, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(emweight.Type.FinalBase, w, defUnits, modifiers)
	w = processMultiplyAddWeightStep(emweight.Type.Final, w, defUnits, modifiers)

	return Math.max(w, 0)
}

function extendedWeightAdjustedForModifiers(
	defUnits: WeightUnits,
	quantity: number,
	baseWeight: number,
	modifiers: Collection<EquipmentModifierGURPS>,
	features: Feature[],
	children: Collection<EquipmentGURPS | EquipmentContainerGURPS>,
	forSkills: boolean,
	weightIgnoredForSkills: boolean,
): number {
	if (quantity <= 0) return 0
	let base = 0
	if (!forSkills || !weightIgnoredForSkills)
		base = Int.from(weightAdjustedForModifiers(baseWeight, modifiers, defUnits))
	if (children.size) {
		let contained = 0
		children.forEach(child => {
			contained += Int.from(child.extendedWeight(forSkills, defUnits))
		})
		let [percentage, reduction] = [0, 0]
		features.forEach(feature => {
			if (feature instanceof ContainedWeightReduction) {
				if (feature.isPercentageReduction) percentage += feature.percentageReduction
				else reduction += Int.from(feature.fixedReduction(defUnits))
			}
		})
		if (percentage >= 100) contained = 0
		else if (percentage > 0) contained -= (contained * percentage) / 100
		base += Math.max(0, contained - reduction)
	}
	return Int.from(base * quantity)
}

function valueAdjustedForModifiers(value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let cost = processNonCFStep(emcost.Type.Original, value, modifiers)

	let cf = 0
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.costType === emcost.Type.Base) {
			const t = emcost.Type.fromString(emcost.Type.Base, mod.costAmount)
			cf += emcost.Value.extractValue(t, mod.costAmount)
			if (t === emcost.Value.Multiplier) {
				cf -= 1
			}
		}
	})
	if (cf !== 0) {
		cf = Math.max(cf, -0.8)
		cost *= Math.max(cf, -0.8) + 1
	}

	cost = processNonCFStep(emcost.Type.FinalBase, cost, modifiers)

	cost = processNonCFStep(emcost.Type.Final, cost, modifiers)

	return Math.max(cost, 0)
}

function processNonCFStep(costType: emcost.Type, value: number, modifiers: Collection<EquipmentModifierGURPS>): number {
	let [percentages, additions] = [0, 0]
	let cost = value
	modifiers.forEach(mod => {
		if (!mod.enabled) return
		if (mod.costType === costType) {
			const t = emcost.Type.fromString(costType, mod.costAmount)
			const amt = emcost.Value.extractValue(t, mod.costAmount)
			switch (t) {
				case emcost.Value.Addition:
					additions += amt
					break
				case emcost.Value.Percentage:
					percentages += amt
					break
				case emcost.Value.Multiplier:
					cost *= amt
			}
		}
	})
	cost += additions
	if (percentages !== 0) cost += value * (percentages / 100)
	return cost
}

function calculateModifierPoints(points: number, modifier: number): number {
	return (points * modifier) / 100
}

function modifyPoints(points: number, modifier: number): number {
	return points + calculateModifierPoints(points, modifier)
}

export {
	calculateModifierPoints,
	extendedWeightAdjustedForModifiers,
	itemIsOfType,
	modifyPoints,
	valueAdjustedForModifiers,
	weightAdjustedForModifiers,
}
