import messages from "./messages.js";
import chosenLang from "./chosenLang.js";

export default function printUrl(keywordId) {
	const URL = messages[keywordId][chosenLang()].url;

	return URL;
}
