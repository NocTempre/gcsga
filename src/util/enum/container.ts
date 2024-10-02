import { LocalizeGURPS } from "@util/localize.ts"
import { equalFold } from "@module/data/item/compontents/string-criteria.ts"

export namespace container {
	export enum Type {
		Group = "group",
		AlternativeAbilities = "alternative_abilities",
		Ancestry = "ancestry",
		Attributes = "attributes",
		MetaTrait = "meta_trait",
	}

	export namespace Type {
		export function ensureValid(T: Type): Type {
			if (Types.includes(T)) return T
			return Types[0]
		}

		export function toString(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.container.string[T]
		}

		export function inlineTag(T: Type): string {
			return LocalizeGURPS.translations.gurps.enum.container.tag[T]
		}

		export function extractType(s: string): Type {
			for (const one of Types) {
				if (equalFold(one, s)) return one
			}
			return Types[0]
		}
	}

	export const Types: Type[] = [Type.Group, Type.AlternativeAbilities, Type.Ancestry, Type.Attributes, Type.MetaTrait]
}
