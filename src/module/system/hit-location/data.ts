import fields = foundry.data.fields

type HitLocationSchema = {
	id: fields.StringField
	choice_name: fields.StringField
	table_name: fields.StringField
	slots: fields.NumberField<number, number, true, false>
	hit_penalty: fields.NumberField
	dr_bonus: fields.NumberField<number, number, true, false>
	description: fields.StringField<string, string, true, true>
	// sub_table: fields.SchemaField<BodySchema, SourceFromSchema<BodySchema>, ModelPropsFromSchema<BodySchema>, true, true>
	// sub_table: fields.SchemaField<
	// 	BodySchema,
	// 	SourceFromSchema<BodySchema>,
	// 	ModelPropsFromSchema<BodySchema>,
	// 	true, false
	// >
}

type HitLocationSource = Omit<SourceFromSchema<HitLocationSchema>, "sub_table"> & {
	sub_table: BodySource | null
}

type BodySchema = {
	name: fields.StringField<string, string, false, true>
	roll: fields.StringField
	locations: fields.ArrayField<fields.SchemaField<HitLocationSchema>>
}

type BodySource = Omit<SourceFromSchema<BodySchema>, "locations"> & {
	locations: HitLocationSource[]
}

export type { BodySchema, HitLocationSchema, HitLocationSource, BodySource }
