import messages from "./messages.js";
import chosenLang from "./chosenLang.js";

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
