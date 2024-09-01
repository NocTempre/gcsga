import { ItemDataModel } from "@module/data/abstract.ts"
import fields = foundry.data.fields
import { ItemGURPS2 } from "@module/document/item.ts"

class BasicInformationTemplate extends ItemDataModel<BasicInformationTemplateSchema> {
	static override defineSchema(): BasicInformationTemplateSchema {
		const fields = foundry.data.fields
		return {
			container: new fields.ForeignDocumentField(ItemGURPS2, { idOnly: true }),
			name: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
			}),
			reference: new fields.StringField({ required: true, nullable: false, initial: "" }),
			reference_highlight: new fields.StringField({ required: true, nullable: false, initial: "" }),
			notes: new fields.StringField({ required: true, nullable: false, initial: "" }),
			vtt_notes: new fields.StringField({ required: true, nullable: false, initial: "" }),
			tags: new fields.ArrayField(new foundry.data.fields.StringField()),
		}
	}

	hasTag(tag: string): boolean {
		return this.tags.includes(tag)
	}

	get combinedTags(): string {
		return this.tags.join(", ")
	}
}

interface BasicInformationTemplate
	extends ItemDataModel<BasicInformationTemplateSchema>,
		ModelPropsFromSchema<BasicInformationTemplateSchema> {}

type BasicInformationTemplateSchema = {
	container: fields.ForeignDocumentField<ItemGURPS2>
	name: fields.StringField<string, string, true, false, true>
	reference: fields.StringField<string, string, true, false, true>
	reference_highlight: fields.StringField<string, string, true, false, true>
	notes: fields.StringField<string, string, true, false, true>
	vtt_notes: fields.StringField<string, string, true, false, true>
	tags: fields.ArrayField<fields.StringField<string, string, true, false, true>>
}

export { BasicInformationTemplate, type BasicInformationTemplateSchema }
