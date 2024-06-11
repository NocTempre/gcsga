import { OptionalCheckParameters, OtFAction, OtFLinkedAction, OtFTestAction, ParsedOtF } from "./base.ts"
import { gspan } from "./utils.ts"

/**
 *
 * @param str
 * @param opts
 */
export function checkForChat(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
	if (str[0] === "/") {
		const action = <OtFAction>{
			quiet: opts.blindroll,
			orig: str,
			type: "chat",
		}
		return <ParsedOtF>{
			text: gspan(opts.overridetxt, str, action),
			action: action,
		}
	}
	return undefined
}

/**
 *
 * @param str
 * @param opts
 */
export function checkForHtml(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
	const m = str.match(/https?:\/\//i)
	if (m) {
		const lbl = opts.overridetxt ? opts.overridetxt : str
		const action = <OtFLinkedAction>{
			orig: str,
			link: lbl,
			type: "href",
		}
		return <ParsedOtF>{
			action: action,
			text: `<a href="${str}">${lbl}</a>`,
		}
	}
	return undefined
}

/** Allow various IF checks:
 /if [@margin]
 /if [@isCritSuccess]
 /if [@IsCritFailure]
 * @param str
 * @param opts
 */
export function checkForIf(str: string, _opts: OptionalCheckParameters): ParsedOtF | undefined {
	const m = str.match(/^@(margin|isCritSuccess|IsCritFailure) *([=<>]+ *[+-]?[\d.]+)?$/i)
	if (m) {
		const action = <OtFTestAction>{
			type: "test-if",
			orig: str,
			desc: m[1],
			formula: m[2],
		}
		return <ParsedOtF>{
			text: str,
			action: action,
		}
	}
	return
}

/**
 *
 * @param str
 * @param opts
 */
export function checkForExists(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
	const m = str.match(/^\?([AMRS][TDPK]?):(.*)/i)
	if (m) {
		let name = m[2]
		const quotes = name.match(/^['"](.*)['"]/)
		if (quotes) name = quotes[1]
		const action = <OtFTestAction>{
			orig: str,
			type: "test-exists",
			formula: m[1].toUpperCase(),
			desc: name,
		}
		return <ParsedOtF>{
			text: gspan(opts.overridetxt, str, action),
			action: action,
		}
	}
	return
}

/**
 *
 * @param str
 * @param opts
 */
export function checkForPDF(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
	// For PDF link
	const pdf = str.replace(/^PDF: */g, "")
	if (pdf !== str) {
		return <ParsedOtF>{
			text: `<span class='pdflink' data-pdf='${pdf}'>${opts.overridetxt || pdf}</span>`,
			action: <OtFLinkedAction>{
				orig: str,
				type: "pdf",
				link: pdf,
			},
		} // Just get rid of the "[PDF:" and allow the pdflink css class to do most of the work
	}
	return undefined
}

// Drag and drop Foundry entries
/**
 *
 * @param str
 * @param opts
 */
export function checkForFoundryDrops(str: string, opts: OptionalCheckParameters): ParsedOtF | undefined {
	const m = str.match(/^(\w+)\[([.\w]+)\]({.*})/)
	if (m) {
		const link = m[1]
		if (["JournalEntry", "JournalEntryPage", "Actor", "RollTable", "Item"].includes(link)) {
			const action = <OtFLinkedAction>{
				type: "dragdrop",
				orig: str,
				link: m[1],
				sourceId: m[2],
			}
			if (m[3]) opts.overridetxt = m[3]
			return <ParsedOtF>{
				text: gspan(opts.overridetxt, str, action),
				action: action,
			}
		}
	}
	return
}
