import { ResourceTrackerResolver, sanitizeId } from "@util"
import { ResourceTrackerDefObj } from "./data.ts"
import { PoolThreshold, reserved_ids } from "@system"

export class ResourceTrackerDef {
	_id = ""

	name = ""

	full_name = ""

	thresholds: PoolThreshold[] = []

	order = 0

	max = 10

	min = 0

	isMaxEnforced = false

	isMinEnforced = false

	constructor(data?: ResourceTrackerDefObj) {
		if (data) {
			const thr: PoolThreshold[] = []
			if (data.thresholds)
				for (const t of data.thresholds) {
					thr.push(new PoolThreshold(t))
				}
			data.thresholds = thr
			Object.assign(this, data)
		}
	}

	get id(): string {
		return this._id
	}

	set id(v: string) {
		this._id = sanitizeId(v, false, reserved_ids)
	}

	get resolveFullName(): string {
		if (!this.full_name) return this.name
		return this.full_name
	}

	get combinedName(): string {
		if (!this.full_name) return this.name
		if (!this.name || this.name === this.full_name) return this.full_name
		return `${this.full_name} (${this.name})`
	}

	baseValue(_resolver: ResourceTrackerResolver): number {
		return this.max
	}
}
