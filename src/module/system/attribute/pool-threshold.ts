import fields = foundry.data.fields
import type { AttributeDef } from "./definition.ts"
import type { ResourceTrackerDef } from "@system/resource-tracker/definition.ts"
import { threshold } from "@util"
import { VariableResolver, evaluateToNumber } from "@module/util/index.ts"

class PoolThreshold extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema> {
	static override defineSchema(): PoolThresholdSchema {
		const fields = foundry.data.fields
		return {
			state: new fields.StringField({ required: true, nullable: false, initial: "" }),
			explanation: new fields.StringField({ required: true, nullable: false, initial: "" }),
			expression: new fields.StringField({ required: true, nullable: false, initial: "" }),
			ops: new fields.ArrayField(
				new fields.StringField({ required: false, nullable: false, choices: threshold.Ops }),
				{ required: false },
			),
		}
	}

	threshold(actor: VariableResolver): number {
		return evaluateToNumber(this.expression, actor)
	}
}

interface PoolThreshold
	extends foundry.abstract.DataModel<AttributeDef | ResourceTrackerDef, PoolThresholdSchema>,
		ModelPropsFromSchema<PoolThresholdSchema> {}

type PoolThresholdSchema = {
	state: fields.StringField<string, string, true, false, true>
	explanation: fields.StringField<string, string, true, false, true>
	expression: fields.StringField<string, string, true, false, true>
	ops: fields.ArrayField<fields.StringField<threshold.Op, threshold.Op, false, false, false>>
}

export { PoolThreshold, type PoolThresholdSchema }
