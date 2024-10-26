import ecssmessages from "./messages.js";
import configLang from "./configLang.js";

const { lang } = configLang;
const messages = ecssmessages;
const chosenLang = () => {
	let messageLang;
	const osLang = Intl.DateTimeFormat().resolvedOptions().locale;

	if(lang == "auto" && (osLang.includes("en-") || osLang.includes("fr-"))){
		messageLang = osLang
	} else if(lang == "fr" || lang == "en") {
		messageLang = lang;
	} else {
		messageLang = "en";
	}
	return messageLang.split("-")[0];
}

export default function printMessage(keywordId, source, problem, customValue) {
	let results = messages[keywordId][chosenLang()].message;
	if(customValue) {
		results += customValue
	}
	if(source || problem) {
		results += " `"
	}
	if(source) {
		results += source
	}
	if(source && problem) {
		results += "` & `"
	}
	if(problem) {
		results += problem
	}
	if(source || problem) {
		results += "`"
	}
	return results;
}
