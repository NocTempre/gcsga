import { gid } from "@data"
import { BonusOwner } from "./bonus-owner.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { stlimit } from "@util/enum/stlimit.ts"
import { feature } from "@util/enum/feature.ts"
import { AttributeBonusObj } from "./data.ts"

export class AttributeBonus extends BonusOwner {
	limitation?: stlimit.Option

	attribute: string

	constructor(attrID: string = gid.Strength) {
		super()
		this.type = feature.Type.AttributeBonus
		this.attribute = attrID
		this.limitation = stlimit.Option.None
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	get actualLimitation(): stlimit.Option {
		if (this.attribute === gid.Strength) return this.limitation ?? stlimit.Option.None
		return stlimit.Option.None
	}

	override toObject(): AttributeBonusObj {
		return {
			...super.toObject(),
			type: this.type,
			attribute: this.attribute,
			limitation: this.limitation,
		}
	}

	static fromObject(data: AttributeBonusObj): AttributeBonus {
		const bonus = new AttributeBonus(data.attribute)
		bonus.limitation = data.limitation || stlimit.Option.None
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}
