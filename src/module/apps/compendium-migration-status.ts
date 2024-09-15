// import type { ActorGURPS } from "@actor"
// import type { ItemGURPS } from "@item"
// import { MigrationList, MigrationRunner } from "@module/migration/index.ts"
// import { htmlQuery } from "@util"
// import * as R from "remeda"
//
// /** Dialog used to view compendium data and migrate them. */
// class CompendiumMigrationStatus extends Application {
// 	compendium: CompendiumCollection<ActorGURPS<null> | ItemGURPS<null>>
//
// 	static override get defaultOptions(): ApplicationOptions {
// 		const options = super.defaultOptions
// 		options.template = "systems/gcsga/templates/system/compendium-migration-status.hbs"
// 		options.classes = ["compendium-migration-status"]
// 		options.height = "auto"
// 		options.title = game.i18n.localize("GURPS.CompendiumMigrationStatus.Title")
// 		return options
// 	}
//
// 	constructor(compendium: CompendiumCollection<ActorGURPS<null> | ItemGURPS<null>>) {
// 		super()
// 		this.compendium = compendium
// 	}
//
// 	override get id(): string {
// 		return `compendium-info-${this.compendium.metadata.id}`
// 	}
//
// 	override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<object> {
// 		// Attempt to get the raw schema version from source data.
// 		// We pass a random string as a field to work around a stale index bug (as of 11.309)
// 		// https://github.com/foundryvtt/foundryvtt/issues/9984
// 		const index = await this.compendium.getIndex({
// 			fields: [fu.randomID(), "system._migration", "system.schema", "data.schema"],
// 		})
// 		const schemaVersion = Math.min(
// 			...index.map(d => {
// 				const system = d.system ?? d.data
// 				return Number(system?._migration?.version ?? system?.schema?.version)
// 			}),
// 		)
//
// 		// Compute foundry version. Javascript does not preserve insertion order for the structure, so we sort
// 		const foundryVersion =
// 			R.pipe(
// 				Object.entries(MigrationRunner.FOUNDRY_SCHEMA_VERSIONS),
// 				R.sortBy(([_, schema]) => schema),
// 				R.findLast(([_, schema]) => schemaVersion >= schema),
// 			)?.[0] ?? game.i18n.localize("GURPS.CompendiumMigrationStatus.FoundryOld")
//
// 		return {
// 			...(await super.getData(options)),
// 			compendium: this.compendium,
// 			schemaVersion: Number.isNaN(schemaVersion)
// 				? game.i18n.localize("GURPS.CompendiumMigrationStatus.Invalid")
// 				: schemaVersion,
// 			foundryVersion,
// 			module: game.modules.get(this.compendium.metadata.packageName ?? ""),
// 			updated: schemaVersion >= MigrationRunner.LATEST_SCHEMA_VERSION,
// 			size: index.contents.length,
// 		}
// 	}
//
// 	override activateListeners($html: JQuery<HTMLElement>): void {
// 		super.activateListeners($html)
// 		const html = $html[0]
//
// 		htmlQuery(html, "[data-action=migrate]")?.addEventListener("click", async () => {
// 			const runner = new MigrationRunner(MigrationList.constructFromVersion(null))
// 			await runner.runCompendiumMigration(this.compendium)
// 			this.render(true)
// 		})
// 	}
// }
//
// export { CompendiumMigrationStatus }
