// const GURPSFormat = true
//
// const negative = ["-", "–"] // Include the minus sign as well as dash.
// const times = ["x", "×"] // Include the times sign as well as 'x'.
//
// class DiceGURPS {
// 	sides: number
//
// 	count: number
//
// 	modifier: number
//
// 	multiplier: number
//
// 	constructor(data?: string | DiceGURPSDef) {
// 		this.sides = 0
// 		this.count = 0
// 		this.modifier = 0
// 		this.multiplier = 0
// 		if (data) {
// 			if (typeof data === "string") Object.assign(this, DiceGURPS.fromString(data))
// 			else Object.assign(this, data)
// 			this.sides = Math.floor(this.sides)
// 			this.count = Math.floor(this.count)
// 			this.modifier = Math.floor(this.modifier)
// 			this.multiplier = Math.floor(this.multiplier)
// 			DiceGURPS.normalize(this)
// 		}
// 	}
//
// 	static fromString(str: string): DiceGURPSDef {
// 		str = str.trim()
// 		let dice: DiceGURPSDef = {
// 			sides: 0,
// 			count: 0,
// 			modifier: 0,
// 			multiplier: 0,
// 		}
// 		let i = 0
// 		let ch: string
// 		;[dice.count, i] = extractValue(str, 0)
// 		const hadCount = i !== 0
// 		;[ch, i] = nextChar(str, i)
// 		let hadSides = false
// 		let hadD = false
// 		if (ch.toLowerCase() === "d") {
// 			hadD = true
// 			const j = i
// 			;[dice.sides, i] = extractValue(str, i)
// 			hadSides = i !== j
// 			;[ch, i] = nextChar(str, i)
// 		}
// 		if (hadSides && !hadCount) dice.count = 1
// 		else if (hadD && !hadSides && hadCount) dice.sides = 6
//
// 		if (["+", ...negative].includes(ch)) {
// 			const neg = negative.includes(ch)
// 			;[dice.modifier, i] = extractValue(str, i)
// 			if (neg) dice.modifier = -dice.modifier
// 			;[ch, i] = nextChar(str, i)
// 		}
//
// 		if (!hadD) {
// 			dice.modifier ??= 0
// 			dice.modifier += dice.count
// 			dice.count = 0
// 		}
//
// 		if (times.includes(ch.toLowerCase())) [dice.multiplier] = extractValue(str, i)
//
// 		if (dice.multiplier === 0) dice.multiplier = 1
//
// 		dice = DiceGURPS.normalize(dice)
//
// 		return dice
// 	}
//
// 	get string(): string {
// 		return this.toString(false)
// 	}
//
// 	minimum(extraDiceFromModifiers: boolean): number {
// 		// eslint-disable-next-line prefer-const
// 		let [count, result] = this.adjustedCountAndModifier(extraDiceFromModifiers)
// 		if (this.sides > 0) {
// 			result += count
// 		}
// 		return result * this.multiplier
// 	}
//
// 	toString(keepSix: boolean): string {
// 		let str = ""
// 		str += this.count
// 		str += "d"
// 		if (this.sides !== 6 || keepSix) str += this.sides
// 		if (this.modifier) {
// 			str += this.modifier > 0 ? "+" : "-"
// 			str += Math.abs(this.modifier)
// 		}
// 		if (this.multiplier !== 1) str += `×${this.multiplier}`
// 		return str
// 	}
//
// 	stringExtra(extraDiceFromModifiers: boolean): string {
// 		const [count, modifier] = this.adjustedCountAndModifier(extraDiceFromModifiers)
// 		let buffer = ""
// 		if (count > 0) {
// 			if (GURPSFormat || count > 1) buffer += count.toString()
// 			buffer += "d"
// 			if (!GURPSFormat || this.sides !== 6) buffer += this.sides.toString()
// 		}
// 		if (modifier > 0) {
// 			if (count !== 0 && this.sides !== 0) buffer += "+"
// 			buffer += modifier.toString()
// 		} else if (modifier < 0) buffer += modifier.toString()
// 		if (buffer.length === 0) buffer += "0"
// 		if (this.multiplier !== 1) buffer += `×${this.multiplier}`
// 		return buffer
// 	}
//
// 	static normalize(dice: DiceGURPS | DiceGURPSDef): DiceGURPS | DiceGURPSDef {
// 		if (dice.count! < 0) dice.count = 0
// 		if (dice.sides! < 0) dice.sides = 0
// 		if (dice.multiplier! < 1) dice.multiplier = 1
// 		return dice
// 	}
//
// 	adjustedCountAndModifier(applyExtractDiceFromModifiers: boolean): [number, number] {
// 		let [count, modifier] = [0, 0]
// 		DiceGURPS.normalize(this)
// 		if (this.sides === 0) return [this.count, this.modifier]
// 		count = this.count
// 		modifier = this.modifier
// 		if (applyExtractDiceFromModifiers && modifier > 0) {
// 			const average = (this.sides + 1) / 2
// 			if (this.sides % 2 === 1) {
// 				// Odd number of sides, so average is a whole number
// 				count += modifier / average
// 				modifier %= average
// 			} else {
// 				// Even number of sides, so average has an extra half, which means
// 				// we alternate
// 				while (modifier > average) {
// 					if (modifier > 2 * average) {
// 						modifier -= 2 * average + 1
// 						count += 2
// 					} else {
// 						modifier -= average + 1
// 						count += 1
// 					}
// 				}
// 			}
// 		}
// 		if (count < 0) count = 0
// 		// HACK: not sure if this is the actual way to do it, maybe it doesn't work out
// 		// like it should because JS doesn't have an explicit int type but Go does. Oh well.
// 		return [count, Math.round(modifier)]
// 	}
//
// 	roll(extraDiceFromModifiers: boolean): number {
// 		// eslint-disable-next-line prefer-const
// 		let [count, result] = this.adjustedCountAndModifier(extraDiceFromModifiers)
// 		if (this.sides > 1) {
// 			for (let i = 0; i < count; i++) {
// 				result += 1 + Math.floor(Math.random() * this.sides)
// 			}
// 		} else if (this.sides === 1) result = count
// 		return result * this.multiplier
// 	}
// }
//
// interface DiceGURPSDef {
// 	sides?: number
// 	count?: number
// 	modifier?: number
// 	multiplier?: number
// }
//
// function extractValue(str: string, i: number): [number, number] {
// 	let value = 0
// 	while (i < str.length) {
// 		const ch = str[i]
// 		if (!ch.match("[0-9]")) return [value, i]
// 		value *= 10
// 		value += parseInt(ch)
// 		i += 1
// 	}
// 	return [value, i]
// }
//
// function nextChar(str: string, i: number): [string, number] {
// 	if (i < str.length) return [str[i], i + 1]
// 	return ["", i]
// }
//
// export { DiceGURPS }
