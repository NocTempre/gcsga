import { BasePrereq, BasePrereqSchema } from "./base-prereq.ts"
import { prereq } from "@util/enum/prereq.ts"
import { LocalizeGURPS, StringComparison, TooltipGURPS } from "@util"
import { ActorType } from "@module/data/constants.ts"
import { ActorInst } from "../actor/helpers.ts"
import { Nameable } from "@module/util/index.ts"
import { StringCriteriaField } from "../item/fields/string-criteria-field.ts"

class EquippedEquipmentPrereq extends BasePrereq<EquippedEquipmentPrereqSchema> {
	static override TYPE = prereq.Type.EquippedEquipment

	static override defineSchema(): EquippedEquipmentPrereqSchema {
		return {
			...super.defineSchema(),
			name: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: { compare: StringComparison.Option.IsString, qualifier: "" },
			}),
			tags: new StringCriteriaField({
				required: true,
				nullable: false,
				initial: { compare: StringComparison.Option.AnyString, qualifier: "" },
			}),
		}
	}

	satisfied(
		actor: ActorInst<ActorType.Character>,
		exclude: unknown,
		tooltip: TooltipGURPS | null,
		hasEquipmentPenalty: { value: boolean },
	): boolean {
		let replacements: Map<string, string> = new Map()
		if (Nameable.isAccesser(exclude)) replacements = exclude.nameableReplacements
		let satisfied = false
		for (const eqp of actor.itemCollections.equipment) {
			satisfied =
				exclude !== eqp &&
				eqp.system.equipped &&
				eqp.system.quantity > 0 &&
				this.name.matches(replacements, eqp.system.nameWithReplacements) &&
				this.tags.matchesList(replacements, ...eqp.system.tags)
			if (satisfied) break
		}
		if (!satisfied) {
			hasEquipmentPenalty.value = true
			if (tooltip !== null) {
				tooltip.push(
					LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.Base, {
						prefix: LocalizeGURPS.translations.GURPS.Tooltip.Prefix,
						name: this.name.toString(replacements),
						tags: this.tags.toStringWithPrefix(
							replacements,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.OneTag,
							LocalizeGURPS.translations.GURPS.Prereq.EquippedEquipment.AllTags,
						),
					}),
				)
			}
		}
		return satisfied
	}

	fillWithNameableKeys(m: Map<string, string>, existing: Map<string, string>): void {
		Nameable.extract(this.name.qualifier, m, existing)
		Nameable.extract(this.tags.qualifier, m, existing)
	}
}

interface EquippedEquipmentPrereq
	extends BasePrereq<EquippedEquipmentPrereqSchema>,
		ModelPropsFromSchema<EquippedEquipmentPrereqSchema> {}

type EquippedEquipmentPrereqSchema = BasePrereqSchema & {
	name: StringCriteriaField<true, false, true>
	tags: StringCriteriaField<true, false, true>
}

export { EquippedEquipmentPrereq, type EquippedEquipmentPrereqSchema }