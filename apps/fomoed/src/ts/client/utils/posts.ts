/**
 * There is also a system section, where the widgets will be placed by default.
 * The system section has the following format:
 * <system>
 *      <wg data-path='/embeds/detailed-cfgi?symbol=BTC'></wg>
 * </system>
 */

import { PUBLIC_DASHBOARD_URL } from '$env/static/public';

export function embedWidgets(content: string): string {
	const wgTags = content.match(/<wg[^>]*>(.*?)<\/wg>/g);

	for (const wgTag of wgTags || []) {
		const dataPathAttrMatch = wgTag.match(/data-path="([^"]+)"/);

		if (!dataPathAttrMatch) {
			continue;
		}

		const dataPathAttr = dataPathAttrMatch[1];

		const url = new URL(dataPathAttr, PUBLIC_DASHBOARD_URL);

		const iframeTag = `<iframe src="${url}" width="100%" height="400px" frameborder="0" scrolling="no"></iframe>`;

		content = content.replace(wgTag, iframeTag);
	}

	return content;
}
