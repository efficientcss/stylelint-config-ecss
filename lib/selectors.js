const contentTag_selectorPart = 'p|ul|li|a|button|input|span|h1|h2|h3|h4|h5|h6';
const structureTag_selectorPart = 'div|header|footer|section|aside|article'
const graphical_selectorPart = 'image|img|video|hr|picture|photo|icon|i$|shape|before$|after$|input|figure|hr$|svg|line|logo|frame|button|input|select|textarea';
const prefixed_selectorPart = 'is-|as-|on-|to-|with-|and-|now-|fx-|for-|__';

export const text_selectors = /^(.*((\s|>|\()(p|h1|h2|h3|h4|h5|h6|blockquote)))\)?$/;
export const structureTag_selectors = new RegExp('^('+structureTag_selectorPart+')$');
export const numberedClass_selectors = /\.(?!(h[1-6]|grid-[0-9]+|col-[0-9]+)$)[a-zA-Z-]*[0-9]+/;
export const unprefixedDescendant_selectors = new RegExp('^[\\s?>?\\s?|\\s]\\s[.](?!'+prefixed_selectorPart+').*$');
export const unprefixedCombinedClass_selectors = new RegExp('^(&|[.][a-zA-Z-_]*)[.](?!'+prefixed_selectorPart+').*$');
export const pseudoClass_selectors = /:.*/;
export const childPseudoClass_selectors = /:.*[child]/;
export const typePseudoClass_selectors = /:.*/;
export const prefixedClass_selectors = /.(${prefixed_selectorPart}).*/;
export const notWithClasses_selectors = /(:not\(.*\.)/;
export const component_selectors = new RegExp('^(?!& )(?!.*__)([.]|\\[[a-z0-9-_]*="?)(?!.*(?:'+graphical_selectorPart+'))[a-zA-Z0-9-_]+("?\\])?$');
export const notGraphical_selectors = new RegExp('^(?!.*(?:'+graphical_selectorPart+')).*$');
export const overlyStructuredChildren_selectors = new RegExp('^((.*)[\\s](div|footer|section|aside|article|ul|li).*|body.*)\\b('+contentTag_selectorPart+')\\b$');
export const tagScopedClass_selectors = new RegExp('^(?![.])(('+structureTag_selectorPart+')( |>| > ))+([.]|\\[[a-z-_]*=?"?).*("?\\])?$')
