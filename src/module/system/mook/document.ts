import { ActorFlags, ItemFlags, ItemType, SETTINGS, SYSTEM_NAME, gid } from "@module/data/constants.ts"
import {
	MookData,
	MookEquipment,
	MookMelee,
	MookNote,
	MookProfile,
	MookRanged,
	MookSkill,
	MookSpell,
	MookTrait,
	MookTraitModifier,
} from "./data.ts"
import { AttributeGURPS, AttributeDef, AttributeDefObj, AttributeObj, MoveTypeDef, MoveTypeDefObj } from "@system"
import { damageProgression, progression } from "@util"
import { DiceGURPS } from "@module/dice/index.ts"
import { CharacterSource, Encumbrance } from "@actor/character/data.ts"
import { CharacterGURPS } from "@actor"
import {
	ItemSourceGURPS,
	MeleeWeaponSource,
	NoteSource,
	RangedWeaponSource,
	SkillSource,
	SpellSource,
	TraitModifierSource,
	TraitSource,
} from "@item/data/index.ts"

export class Mook {
	type = "mook"

	flags = {
		[SYSTEM_NAME]: {
			[ActorFlags.TargetModifiers]: [],
			[ActorFlags.SelfModifiers]: [],
			[ActorFlags.Import]: { name: "", path: "", last_import: "" },
			[ActorFlags.MoveType]: gid.Ground,
			[ActorFlags.AutoEncumbrance]: { active: true, manual: 0 },
			[ActorFlags.AutoThreshold]: { active: true, manual: {} },
			[ActorFlags.AutoDamage]: { active: true, thrust: new DiceGURPS(), swing: new DiceGURPS() },
		},
	}

	protected variableResolverExclusions: Map<string, boolean> = new Map()

	settings: {
		attributes: AttributeDef[]
		damage_progression: progression.Option
		move_types: MoveTypeDef[]
	}

	system: {
		settings: {
			attributes: AttributeDefObj[]
			damage_progression: progression.Option
			move_types: MoveTypeDefObj[]
		}
		attributes: AttributeObj[]
	}

	declare attributes: Map<string, AttributeGURPS>

	traits: MookTrait[]

	skills: MookSkill[]

	spells: MookSpell[]

	melee: MookMelee[]

	ranged: MookRanged[]

	equipment: MookEquipment[]

	other_equipment: MookEquipment[]

	notes: MookNote[]

	conditions = []

	profile: MookProfile

	thrust!: DiceGURPS

	swing!: DiceGURPS

	text: {
		traits: string
		skills: string
		spells: string
		melee: string
		ranged: string
		equipment: string
		catchall: string
	}

	update(data: Partial<MookData>): void {
		Object.assign(this, fu.mergeObject(this, data))
		this.refreshAttributes()
	}

	refreshAttributes(): void {
		this.attributes = new Map(
			this.system.attributes
				.map((value, index) => {
					return new AttributeGURPS(this, value, index)
				})
				.map(e => [e.id, e]),
		)
	}

	// TODO: need to parse and store proper active defense values
	dodge(_enc: Encumbrance): number {
		return 0
	}

	constructor(data?: Partial<MookData>) {
		const settings = data?.system?.settings ?? {
			attributes: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`),
			damage_progression: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`)
				.damage_progression,
			move_types: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_MOVE_TYPES}.move_types`),
		}
		this.settings = {
			attributes: settings.attributes.map(e => new AttributeDef(e)),
			damage_progression: settings.damage_progression,
			move_types: settings.move_types.map(e => new MoveTypeDef(e)),
		}
		this.system = data?.system ?? {
			settings,
			attributes: this.generateNewAttributes(settings.attributes.map(def => new AttributeDef(def))),
		}
		this.refreshAttributes()
		this.traits = data?.traits ?? []
		this.skills = data?.skills ?? []
		this.spells = data?.spells ?? []
		this.melee = data?.melee ?? []
		this.ranged = data?.ranged ?? []
		this.equipment = data?.equipment ?? []
		this.other_equipment = data?.other_equipment ?? []
		this.notes = data?.notes ?? []
		this.profile = data?.profile ?? {
			name: "",
			description: "",
			title: "",
			height: "",
			weight: "",
			SM: 0,
			portrait: foundry.CONST.DEFAULT_TOKEN,
			userdesc: "",
		}
		this.text = {
			traits: "",
			skills: "",
			spells: "",
			melee: "",
			ranged: "",
			equipment: "",
			catchall: "",
		}
		if (this.attributes.has(gid.Strength)) {
			this.thrust = damageProgression.thrustFor(this.settings.damage_progression, this.attributes.get("st")!.max)
			this.swing = damageProgression.swingFor(this.settings.damage_progression, this.attributes.get("st")!.max)
		}
	}

	generateNewAttributes<TDef extends AttributeDef>(definitions: TDef[]): AttributeObj[] {
		const values: AttributeObj[] = []
		definitions.forEach(definition => {
			values.push(definition.generateNewAttribute())
		})
		return values
	}

	resolveAttributeCurrent(id: string): number {
		const att = this.attributes?.get(id)?.current
		if (att) return att
		return Number.MIN_SAFE_INTEGER
	}

	skillBonusFor(..._args: unknown[]): number {
		return 0
	}

	skillPointBonusFor(..._args: unknown[]): number {
		return 0
	}

	spellBonusFor(..._args: unknown[]): number {
		return 0
	}

	spellPointBonusFor(..._args: unknown[]): number {
		return 0
	}

	get adjustedSizeModifier(): number {
		return this.profile.SM
	}

	getFlag(..._args: unknown[]): unknown {
		return null
	}

	attributeBonusFor(..._args: unknown[]): number {
		return 0
	}

	moveBonusFor(..._args: unknown[]): number {
		return 0
	}

	costReductionFor(..._args: unknown[]): number {
		return 0
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions?.has(variableName)) {
			console.warn(`Attempt to resolve variable via itself: $${variableName}`)
			return ""
		}
		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map()
		this.variableResolverExclusions.set(variableName, true)
		if (gid.SizeModifier === variableName) return this.profile.SM.signedString()
		const parts = variableName.split(".") // TODO: check
		const attr: AttributeGURPS | undefined = this.attributes.get(parts[0])
		if (!attr) {
			console.warn(`No such variable: $${variableName}`)
			return ""
		}
		let def
		if (attr instanceof AttributeGURPS) {
			def = attr.definition
		}
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`)
			return ""
		}
		this.variableResolverExclusions = new Map()
		return attr?.max.toString()
	}

	isSkillLevelResolutionExcluded(_name: string, _specialization: string): boolean {
		return false
	}

	registerSkillLevelResolutionExclusion(_name: string, _specialization: string): void {
		// do nothing}
	}

	unregisterSkillLevelResolutionExclusion(_name: string, _specialization: string): void {
		// do nothing}
	}

	effectiveST(initialST: number): number {
		return initialST
	}

	get strikingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	get throwingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	get liftingST(): number {
		return this.attributes.get(gid.Strength)?.max ?? 0
	}

	async createActor(): Promise<CharacterGURPS | null> {
		const date = new Date().toISOString()
		const data: DeepPartial<CharacterSource> = {
			system: {
				settings: {
					...game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_SHEET_SETTINGS}.settings`),
					resource_trackers: game.settings.get(
						SYSTEM_NAME,
						`${SETTINGS.DEFAULT_RESOURCE_TRACKERS}.resource_trackers`,
					),
					...this.system.settings,
				},
				attributes: this.system.attributes,
				profile: this.profile,
				created_date: date,
				modified_date: date,
			},
			items: await this._createItemData(),
		}

		const newActor = await CharacterGURPS.create(
			{
				name: this.profile.name,
				img: this.profile.portrait,
			} as PreCreate<CharacterGURPS["_source"]>,
			{ promptImport: false } as DocumentModificationContext<CharacterGURPS["parent"]>,
		)
		if (!newActor) return null
		await newActor?.update(data)
		const updateMap: ({ _id: string } & Record<string, unknown>)[] = []
		newActor.itemTypes[ItemType.Skill].forEach((item, index: number) => {
			updateMap.push({
				_id: item.id!,
				"system.points": item.getPointsForLevel(this.skills[index].level),
			})
		})
		newActor.itemTypes[ItemType.Spell].forEach((item, index: number) => {
			updateMap.push({
				_id: item.id!,
				"system.points": item.getPointsForLevel(this.spells[index].level),
			})
		})
		await newActor.updateEmbeddedDocuments("Item", updateMap)
		newActor.sheet?.render(true)
		return newActor
	}

	private async _createItemData(): Promise<DeepPartial<ItemSourceGURPS>[]> {
		const items: DeepPartial<ItemSourceGURPS>[] = []
		for (const trait of this.traits) items.push(...this._getTraitItemData(trait))
		for (const skill of this.skills) items.push(await this._getSkillItemData(skill))
		for (const spell of this.spells) items.push(await this._getSpellItemData(spell))
		for (const melee of this.melee) items.push(this._getMeleeItemData(melee))
		for (const ranged of this.ranged) items.push(this._getRangedItemData(ranged))
		items.push(this._getNoteItemData(this.text.catchall))

		console.log(items)
		return items
	}

	private _getTraitItemData(trait: MookTrait): DeepPartial<TraitSource | TraitModifierSource>[] {
		const items: DeepPartial<TraitSource | TraitModifierSource>[] = []
		const id = fu.randomID()
		const data: DeepPartial<TraitSource> = {
			name: trait.name,
			type: ItemType.Trait,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: trait.name,
				notes: trait.notes,
				reference: trait.reference,
				base_points: trait.points,
				cr: trait.cr,
				can_level: trait.levels !== 0,
				levels: trait.levels,
			},
		}
		items.push(data)
		items.push(...trait.modifiers.map(m => this._getTraitModifierItemData(m, id)))
		return items
	}

	private _getTraitModifierItemData(
		modifier: MookTraitModifier,
		container_id: string,
	): DeepPartial<TraitModifierSource> {
		const id = fu.randomID()
		console.log(modifier)
		const data: DeepPartial<TraitModifierSource> = {
			name: modifier.name,
			type: ItemType.TraitModifier,
			_id: id,
			flags: {
				[SYSTEM_NAME]: {
					[ItemFlags.Container]: container_id,
				},
			},
			system: {
				name: modifier.name,
				notes: modifier.notes,
				reference: modifier.reference,
				cost: parseInt(modifier.cost) || 0,
			},
		}
		return data
	}

	private async _getSkillItemData(skill: MookSkill): Promise<DeepPartial<SkillSource>> {
		const id = fu.randomID()
		const data: DeepPartial<SkillSource> = {
			name: skill.name,
			type: ItemType.Skill,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: skill.name,
				specialization: skill.specialization,
				notes: skill.notes,
				reference: skill.reference,
				tech_level: skill.tech_level,
				difficulty: `${skill.attribute}/${skill.difficulty}`,
				points: skill.points,
			},
		}
		return data
	}

	private async _getSpellItemData(spell: MookSpell): Promise<DeepPartial<SpellSource>> {
		const id = fu.randomID()
		const data: DeepPartial<SpellSource> = {
			name: spell.name,
			type: ItemType.Spell,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				name: spell.name,
				notes: spell.notes,
				reference: spell.reference,
				tech_level: spell.tech_level,
				difficulty: `${spell.attribute}/${spell.difficulty}`,
				points: spell.points,
				college: spell.college,
			},
		}
		return data
	}

	private _getMeleeItemData(melee: MookMelee): DeepPartial<MeleeWeaponSource> {
		const id = fu.randomID()
		const data: DeepPartial<MeleeWeaponSource> = {
			name: melee.name,
			type: ItemType.MeleeWeapon,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				usage: melee.name,
				usage_notes: melee.notes,
				strength: melee.strength,
				damage: melee.damage,
				reach: melee.reach,
				parry: melee.parry,
				block: melee.block,
				defaults: [
					{
						type: gid.Ten,
						modifier: melee.level - 10,
					},
				],
			},
		}
		return data
	}

	private _getRangedItemData(ranged: MookRanged): DeepPartial<RangedWeaponSource> {
		const id = fu.randomID()
		const data: DeepPartial<RangedWeaponSource> = {
			name: ranged.name,
			type: ItemType.RangedWeapon,
			_id: id,
			flags: { [SYSTEM_NAME]: { [ItemFlags.Container]: null } },
			system: {
				usage: ranged.name,
				usage_notes: ranged.notes,
				strength: ranged.strength,
				damage: ranged.damage,
				accuracy: ranged.accuracy,
				range: ranged.range,
				rate_of_fire: ranged.rate_of_fire,
				shots: ranged.shots,
				bulk: ranged.bulk,
				recoil: ranged.recoil,
				defaults: [
					{
						type: gid.Ten,
						modifier: ranged.level - 10,
					},
				],
			},
		}
		return data
	}

	private _getNoteItemData(note: string): DeepPartial<NoteSource> {
		const id = fu.randomID()
		const data: DeepPartial<NoteSource> = {
			name: "Note",
			type: ItemType.Note,
			_id: id,
			system: {
				text: note,
			},
		}
		return data
	}

	resolveAttributeName(id: string): string {
		const def = this.resolveAttributeDef(id)
		if (def) return def.name
		return "unknown"
	}

	resolveAttributeDef(id: string): AttributeDef | null {
		const a = this.attributes?.get(id)
		if (a) return a.definition
		return null
	}
}
