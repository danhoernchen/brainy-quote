import { request } from "obsidian";

const getQuote = async (options) => {
	function splitRss(rss) {
		const split = rss.split("<item>");
		const item = split[1];
		const titleStart = item.indexOf("<title>");
		const titleEnd = item.indexOf("</title>");
		const title = item.slice(titleStart + 7, titleEnd);
		const quoteStart =
			item.indexOf("<description>") + "<description>".length;
		const quoteEnd = item.indexOf("</description>");
		const quote = item.slice(quoteStart, quoteEnd);
		return { quote, title };
	}
	try {
		const rss = await request(options.url);
		const content = splitRss(rss);
		// const json = xml2js(rss, { compact: true });
		// const author = json.rss.channel.item[0].title._text;
		const author = content.title;
		let quote;
		if (options.removeQuotation) {
			quote = content.quote.replace(/^"+|"+$/g, "");
		} else {
			quote = content.quote;
		}
		let result = options.layout;
		result = result.replace("{quote}", quote);
		result = result.replace("{author}", author);
		return result;
	} catch (error) {
		console.log(error);
		return "error";
	}
};
export default getQuote;
