import { LocalizeGURPS } from "@util/localize.ts"

export namespace stdmg {
	export enum Option {
		None = "none",
		Thrust = "thr",
		LiftingThrust = "lift_thr",
		TelekineticThrust = "tk_thr",
		Swing = "sw",
		LiftingSwing = "lift_sw",
		TelekineticSwing = "tk_sw",
		// OldLeveledThrust = "thr_leveled",
		// OldLeveledSwing = "sw_leveled",
	}

	export namespace Option {
		export function toString(O: Option): string {
			return LocalizeGURPS.translations.GURPS.Enum.stdmg[O]
		}

		export function toStringLeveled(O: Option): string {
			return LocalizeGURPS.format(LocalizeGURPS.translations.GURPS.Enum.stdmg.leveled, { value: toString(O) })
		}
	}

	export const Options: Option[] = [
		Option.None,
		Option.Thrust,
		Option.LiftingThrust,
		Option.TelekineticThrust,
		Option.Swing,
		Option.LiftingSwing,
		Option.TelekineticSwing,
		// Option.LeveledThrust,
		// Option.LeveledSwing,
	]
}
