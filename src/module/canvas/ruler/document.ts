import { RollModifierTags, SETTINGS, SSRT_SETTING, SYSTEM_NAME } from "@data"
import { allLengthUnits, Length, LengthSymbols, LengthUnits, LocalizeGURPS } from "@util"

class RulerGURPS extends Ruler {
	override _getSegmentLabel(segment: RulerMeasurementSegment, totalDistance: number): string {
		let units = canvas.scene?.grid.units
		Object.keys(LengthSymbols).forEach(k => {
			if (units && LengthSymbols[k as LengthUnits].includes(units)) units = k as LengthUnits
		})
		if (!allLengthUnits.includes(units as LengthUnits)) units = LengthUnits.Yard

		let label = `${Math.round(segment.distance * 100) / 100} ${units}`
		if (segment.last) label += ` [${Math.round(totalDistance * 100) / 100} ${units}]`

		const yards = Length.fromInches(Length.toInches(totalDistance, units as LengthUnits), LengthUnits.Yard)
		const mod = RulerGURPS.getRangeMod(yards)

		game.gurps.modifierList.setRangeMod({
			id: LocalizeGURPS.format(LocalizeGURPS.translations.gurps.modifier.speed.range, {
				distance: `${Math.round(totalDistance * 100) / 100} ${units}`,
			}),
			modifier: mod,
			tags: [RollModifierTags.Range],
		})

		label += ` (${mod})`
		return label
	}

	protected override _endMeasurement(): void {
		// TODO: fix
		// @ts-expect-error no idea what draggedEntity is
		const addRangeMod = this.draggedEntity
		super._endMeasurement()
		if (addRangeMod) {
			game.gurps.modifierList.addRangeMod()
		}
	}

	static getRangeMod(yards: number): number {
		yards = Math.round(yards * 100) / 100
		const tableChoice = game.settings.get(SYSTEM_NAME, SETTINGS.SSRT)
		switch (tableChoice) {
			case SSRT_SETTING.STANDARD:
				return RulerGURPS._getRangeModStandard(yards)
			case SSRT_SETTING.SIMPLIFIED:
				return RulerGURPS._getRangeModSimplified(yards)
			case SSRT_SETTING.TENS:
				return RulerGURPS._getRangeModTens(yards)
			default:
				return RulerGURPS._getRangeModStandard(yards)
		}
	}

	static _getRangeModStandard(yards: number): number {
		if (yards <= 0) return 0
		const standardTable = [2, 3, 5, 7, 10, 15]
		let logMod = Math.floor(Math.log(yards) / Math.log(10))
		if (yards < 20) logMod = 0
		const yardsReduced = yards / 10 ** logMod
		let index = -1
		for (const e of standardTable) {
			if (yardsReduced <= e) {
				index = standardTable.indexOf(e)
				break
			}
		}
		if (index === -1) index = standardTable.length - 1
		return -6 * logMod - index
	}

	static _getRangeModSimplified(yards: number): number {
		if (yards <= 5) return 0
		else if (yards <= 20) return -3
		else if (yards <= 100) return -7
		else if (yards <= 500) return -11
		else return -15
	}

	static _getRangeModTens(yards: number): number {
		return -Math.floor(yards / 10)
	}
}

export { RulerGURPS }
