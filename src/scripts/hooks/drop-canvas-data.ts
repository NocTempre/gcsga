import { TokenUtil } from "@util/token-utils.ts"
import { DropData, DropDataType } from "@module/apps/damage-calculator/damage-chat-message.ts"
import { CanvasUtil } from "@util/canvas.ts"
import { TokenGURPS } from "@module/canvas/index.ts"

export const DropCanvasData = {
	listen: (): void => {
		Hooks.on("dropCanvasData", async (canvas: Canvas, data: DropCanvasData) => {
			const dropTargets = CanvasUtil.getCanvasTokensAtPosition(canvas, { x: data.x, y: data.y }) as TokenGURPS[]

			if (dropTargets.length === 0) return false

			const handleDropEvent = async (token: TokenGURPS | undefined): Promise<boolean> => {
				if (token && token.actor) {
					const actorGurps = token.actor
					const dropData = data as DropData
					switch (dropData.type) {
						case DropDataType.Item:
							actorGurps.sheet.emulateItemDrop(dropData)
							return false
						case DropDataType.Damage:
							actorGurps.handleDamageDrop(dropData.payload)
							return false
					}
				}
				return true
			}

			return dropTargets.length === 1
				? // If only one, use that one.
					await handleDropEvent(dropTargets[0])
				: // Otherwise ask which one.
					await TokenUtil.askWhichToken(dropTargets, handleDropEvent)
		})
	},
}
