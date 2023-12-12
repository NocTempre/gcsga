// Import {
// 	AttributeBonus,
// 	CostReduction,
// 	DRBonus,
// 	SkillBonus,
// 	SkillPointBonus,
// 	SpellBonus,
// 	SpellPointBonus,
// 	WeaponDamageBonus,
// 	WeaponDRDivisorBonus,
// } from "@feature"

/*
 * I had to move SETTINGS here as well, because it fixed the weird error that leads to the code not recognizing standard
 * foundry classes and methods.
 *
 * I propose that the "correct" way to deal with settings is to create our own settings class, where we expose methods
 * to retrieve the settings, and then no one has to know the existence of either SYSTEM_NAME or a SETTINGS value.
 * Something like this:
 *
 * In gurps.ts:
 *   import { SettingsGURPS } from "my/new/module"
 *
 *   window.GURPS.settings = new SettingsGURPS()
 *
 * Wherever you want a setting's value:
 *
 *  const value = GURPS.settings.getDefaultBodyPlan()
 */
export const SYSTEM_NAME = "gcsga"

export enum SETTINGS {
	BASIC_SET_PDF = "basic_set_pdf",
	SERVER_SIDE_FILE_DIALOG = "server_side_file_dialog",
	PORTRAIT_OVERWRITE = "portrait_overwrite",
	COMPENDIUM_BROWSER_PACKS = "compendium_browser_packs",
	COMPENDIUM_SKILL_DEFAULTS = "compendium_skill_defaults",
	SHOW_TOKEN_MODIFIERS = "enable_token_modifier_window",
	IGNORE_IMPORT_NAME = "ignore_import_name",
	STATIC_IMPORT_HP_FP = "import_hp_fp",
	STATIC_IMPORT_BODY_PLAN = "import_bodyplan",
	STATIC_AUTOMATICALLY_SET_IGNOREQTY = "auto-ignore-qty",
	MODIFIER_MODE = "modifier_mode",
	COLORS = "colors",
	SHOW_IMPORT_BUTTON = "show_import_button",
	DEFAULT_ATTRIBUTES = "default_attributes",
	DAMAGE_TYPES = "damage_types",
	DEFAULT_RESOURCE_TRACKERS = "default_resource_trackers",
	DEFAULT_HIT_LOCATIONS = "default_hit_locations",
	DEFAULT_SHEET_SETTINGS = "default_sheet_settings",
	ROLL_MODIFIERS = "roll_modifiers",
	DEFAULT_DAMAGE_LOCATION = "default_damage_location",
	SSRT = "ssrt",
	ROLL_FORMULA = "roll_formula",
	INITIATIVE_FORMULA = "initiative_formula",
	MODIFIER_LIST_COLLAPSE = "modifier_list_collapse",
	BASE_BOOKS = "base_books",
}

export enum SSRT_SETTING {
	STANDARD = "standard",
	SIMPLIFIED = "simplified",
	TENS = "tens",
}

export enum EFFECT_ACTION {
	ADD = "add",
	REMOVE = "remove",
}

export enum SOCKET {
	INITIATIVE_CHANGED = "initiative_changed",
	UPDATE_BUCKET = "update_bucket",
}

export const DEFAULT_INITIATIVE_FORMULA = "$basic_speed+($dx/10000)+(1d6/100000)"

export enum DisplayMode {
	NotShown = "not_shown",
	Inline = "inline",
	Tooltip = "tooltip",
	InlineAndTooltip = "inline_and_tooltip",
}

export enum DamageProgression {
	BasicSet = "basic_set",
	KnowingYourOwnStrength = "knowing_your_own_strength",
	NoSchoolGrognardDamage = "no_school_grognard_damage",
	ThrustEqualsSwingMinus2 = "thrust_equals_swing_minus_2",
	SwingEqualsThrustPlus2 = "swing_equals_thrust_plus_2",
	PhoenixFlameD3 = "phoenix_flame_d3",
	Tbone1 = "tbone_1",
	Tbone1Clean = "tbone_1_clean",
	Tbone2 = "tbone_2",
	Tbone2Clean = "tbone_2_clean",
}

export interface StringCompare {
	compare: StringComparison
	qualifier?: string
}

export enum StringComparison {
	None = "none",
	Is = "is",
	IsNot = "is_not",
	Contains = "contains",
	DoesNotContain = "does_not_contain",
	StartsWith = "starts_with",
	DoesNotStartWith = "does_not_start_with",
	EndsWith = "ends_with",
	DoesNotEndWith = "does_not_end_with",
}

export interface NumberCompare {
	compare: NumberComparison
	qualifier: number
}

export interface WeightCompare {
	compare: NumberComparison
	qualifier: string
}

export enum NumberComparison {
	None = "none",
	Is = "is",
	IsNot = "is_not",
	AtLeast = "at_least",
	AtMost = "at_most",
}

// Standard attribute related ids
export enum gid {
	All = "all",
	BasicMove = "basic_move",
	BasicSpeed = "basic_speed",
	Block = "block",
	ConditionalModifier = "conditional_modifier",
	Dexterity = "dx",
	Dodge = "dodge",
	Equipment = "equipment",
	EquipmentModifier = "equipment_modifier",
	FatiguePoints = "fp",
	FrightCheck = "fright_check",
	Health = "ht",
	Hearing = "hearing",
	HitPoints = "hp",
	Intelligence = "iq",
	Note = "note",
	Parry = "parry",
	Perception = "per",
	ReactionModifier = "reaction_modifier",
	RitualMagicSpell = "ritual_magic_spell",
	SizeModifier = "sm",
	Skill = "skill",
	Spell = "spell",
	Strength = "st",
	TasteSmell = "taste_smell",
	Technique = "technique",
	Ten = "10",
	Torso = "torso",
	Touch = "touch",
	Trait = "trait",
	TraitModifier = "trait_modifier",
	Vision = "vision",
	Will = "will",
	Flexible = "flexible",
	Thrust = "thrust",
	Swing = "swing",
}

export const attrPrefix = "attr."

export enum CR {
	None = 0,
	CR6 = 6,
	CR9 = 9,
	CR12 = 12,
	CR15 = 15,
}

export enum CRAdjustment {
	None = "none",
	ActionPenalty = "action_penalty",
	ReactionPenalty = "reaction_penalty",
	FrightCheckPenalty = "fright_check_penalty",
	FrightCheckBonus = "fright_check_bonus",
	MinorCostOfLivingIncrease = "minor_cost_of_living_increase",
	MajorCostOfLivingIncrease = "major_cost_of_living_increase",
}

export enum Difficulty {
	Easy = "e",
	Average = "a",
	Hard = "h",
	VeryHard = "vh",
	Wildcard = "w",
}

export interface Study {
	type: StudyType
	hours: number
	note: string
}

export enum StudyHoursNeeded {
	Standard = "200",
	Level1 = "180",
	Level2 = "160",
	Level3 = "140",
	Level4 = "120",
}

export enum StudyType {
	Self = "self",
	Job = "job",
	Teacher = "teacher",
	Intensive = "intensive",
}

export enum RollType {
	Attribute = "attribute",
	Skill = "skill",
	SkillRelative = "skill_rsl",
	Spell = "spell",
	SpellRelative = "spell_rsl",
	Attack = "attack",
	Parry = "parry",
	Block = "block",
	Damage = "damage",
	Modifier = "modifier",
	ControlRoll = "control_roll",
	Generic = "generic",
}

export type ModifierItem = RollModifier | ModifierHeader

export interface RollModifier {
	name: string
	modifier: number
	max?: number
	tags?: string[]
	cost?: { id: string; value: number }
	reference?: string
	target?: boolean
}

export enum RollModifierTags {
	Range = "range",
}

export interface ModifierHeader {
	name: string
	title: true
}

// Export const rollModifiers: RollModifier[] = [
// 	{
// 		name: "Eye",
// 		modifier: -9,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Skull",
// 		modifier: -7,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Face",
// 		modifier: -5,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Right Leg",
// 		modifier: -2,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Right Leg",
// 		modifier: -2,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Torso",
// 		modifier: 0,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Groin",
// 		modifier: -3,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Left Arm",
// 		modifier: -2,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Left Leg",
// 		modifier: -2,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Hand",
// 		modifier: -4,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Foot",
// 		modifier: -4,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Neck",
// 		modifier: -5,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Vitals",
// 		modifier: -3,
// 		tags: ["Hit Location"],
// 	},
// 	{
// 		name: "Shooting through light cover",
// 		modifier: -2,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Target behind someone else (per intervening figure)",
// 		modifier: -4,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Target crouching, kneeling, sitting, or lying down",
// 		modifier: -2,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Target only partly exposed",
// 		modifier: -2,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Laser sight",
// 		modifier: +1,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Scope (per second of Aim, Max: Scope Acc)",
// 		modifier: +1,
// 		tags: ["Ranged Combat"],
// 	},
// 	{
// 		name: "Unfamiliar weapon or targeting system",
// 		modifier: -2,
// 		tags: ["Ranged Combat"],
// 	},
// ]

export type ImagePath = `${string}.${ImageFileExtension}`
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp"

export enum UserFlags {
	Init = "init",
	LastStack = "lastStack",
	LastTotal = "lastTotal",
	ModifierStack = "modifierStack",
	ModifierTotal = "modifierTotal",
	ModifierSticky = "modifierSticky",
	ModifierPinned = "pinnedMods",
	LastActor = "lastActor",
	LastToken = "lastToken",
}

export enum PrereqType {
	List = "prereq_list",
	Trait = "trait_prereq",
	Attribute = "attribute_prereq",
	ContainedQuantity = "contained_quantity_prereq",
	ContainedWeight = "contained_weight_prereq",
	Skill = "skill_prereq",
	Spell = "spell_prereq",
	Equipment = "equipped_equipment_prereq",
}

// Export type featureMap = {
// 	attributeBonuses: AttributeBonus[]
// 	costReductions: CostReduction[]
// 	drBonuses: DRBonus[]
// 	skillBonuses: SkillBonus[]
// 	skillPointBonuses: SkillPointBonus[]
// 	spellBonuses: SpellBonus[]
// 	spellPointBonuses: SpellPointBonus[]
// 	weaponBonuses: Array<WeaponDamageBonus | WeaponDRDivisorBonus>
// }
export enum ItemType {
	Trait = "trait",
	TraitContainer = "trait_container",
	TraitModifier = "modifier",
	TraitModifierContainer = "modifier_container",
	Skill = "skill",
	Technique = "technique",
	SkillContainer = "skill_container",
	Spell = "spell",
	RitualMagicSpell = "ritual_magic_spell",
	SpellContainer = "spell_container",
	Equipment = "equipment_gcs",
	EquipmentContainer = "equipment_container",
	EquipmentModifier = "eqp_modifier",
	EquipmentModifierContainer = "eqp_modifier_container",
	Note = "note",
	NoteContainer = "note_container",
	LegacyEquipment = "equipment",
	Effect = "effect",
	Condition = "condition",
	MeleeWeapon = "melee_weapon",
	RangedWeapon = "ranged_weapon",
}

export enum ActorType {
	Character = "character_gcs",
	LegacyCharacter = "character",
	LegacyEnemy = "enemy",
	Loot = "loot",
	// MassCombatElement = "element",
	// Vehicle = "vehicle",
	// Merchant = "merchant",
}

export enum MoveType {
	Ground = "ground",
	Air = "air",
	Water = "water",
	Space = "space",
}

export enum SpellSubType {
	NAME = "name",
	TAG = "tag",
	COLLEGE = "college",
	COLLEGE_COUNT = "college_count",
	ANY = "any",
}

export const GURPS_COMMANDS = (() => {
	// const dice = "([^#]+)(?:#(.*))?";       // Dice expression with appended flavor text
	const any = "([^]*)" // Any character, including new lines
	return {
		mook: new RegExp(`^\\/mook ?${any}`, "i"),
	}
})()
