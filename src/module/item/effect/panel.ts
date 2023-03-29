import { ManeuverID } from "@item/condition/data"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { EffectGURPS } from "./document"

export class EffectPanel extends Application {
	/**
	 * Debounce and slightly delayed request to re-render this panel. necessary for situations where it is not possible
	 * to properly wait for promises to resolve before refreshing the ui.
	 */
	refresh = foundry.utils.debounce(this.render, 100)

	private get actor(): Actor | null {
		return canvas?.tokens?.controlled[0]?.actor ?? game.user?.character ?? null
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			id: "gurps-effect-panel",
			popOut: false,
			template: `systems/${SYSTEM_NAME}/templates/system/effects-panel.hbs`,
		}
	}

	override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
		const { actor } = this

		if (!actor)
			return {
				conditions: [],
				effects: [],
				actor: null,
				user: { isGM: false },
			}

		const effects = (actor.itemTypes[ItemType.Effect] as any).map((effect: EffectGURPS) => {
			// Const duration = effect.duration.total
			// const { system } = effect
			return effect
		})

		const conditions = (actor as any).conditions.filter((e: any) => !Object.values(ManeuverID).includes(e.cid))

		return {
			...(await super.getData(options)),
			actor,
			effects,
			conditions,
			user: { isGM: game.user?.isGM },
		}
	}
}
