import fields = foundry.data.fields
import { ItemDataModel, ItemDataSchema } from "@module/data/abstract.ts"
import { Feature } from "@system"
import { BaseFeature } from "@system/feature/base.ts"
import { feature } from "@util"

class FeatureTemplate extends ItemDataModel<FeatureTemplateSchema> {
	static override defineSchema(): FeatureTemplateSchema {
		const fields = foundry.data.fields
		return {
			...super.defineSchema(),
			features: new fields.ArrayField(new fields.TypedSchemaField(BaseFeature.TYPES)),
		}
	}
}

interface FeatureTemplate extends ItemDataModel<FeatureTemplateSchema>, ModelPropsFromSchema<FeatureTemplateSchema> {}

type FeatureTemplateSchema = ItemDataSchema & {
	features: fields.ArrayField<fields.TypedSchemaField<Record<feature.Type, ConstructorOf<Feature>>>>
}

export { FeatureTemplate, type FeatureTemplateSchema }
