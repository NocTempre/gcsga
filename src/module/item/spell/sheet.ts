import { ItemSheetGURPS } from "@item/base/sheet"
import { SpellGURPS } from "."

export class SpellSheet extends ItemSheetGURPS {
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["spell"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions> | undefined) {
		const sheetData = {
			...super.getData(options),
			...{
				attributes: {
					...{ 10: "10" },
					...super.getData(options).attributes,
				},
			},
		}
		return sheetData
	}

	protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		const attribute = formData.attribute ?? this.item.attribute
		const difficulty = formData.difficulty ?? this.item.difficulty
		formData["system.difficulty"] = `${attribute}/${difficulty}`
		delete formData.attribute
		delete formData.difficulty
		return super._updateObject(event, formData)
	}
}

export interface SpellSheet extends ItemSheetGURPS {
	object: SpellGURPS
}
