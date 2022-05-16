const NUMBER_PROPS = ["delay", "speed"];
export function getAttribute(elem, prop, callback) {
    const value = elem.getAttribute(prop);
    if (value) {
        callback(value);
    }
}
function _applyAttribute(obj, elem, prop) {
    const value = elem.getAttribute(prop);
    if (value) {
        obj[prop] = value;
    }
}
/** Copy property values from HTML element to any object */
export function applyAttributes(props, elem, obj) {
    for (let prop of props) {
        _applyAttribute(obj, elem, prop);
    }
}
/** Object specifying how to map strings to specified typs */
const StringParser = {
    // empty bools are interepreted as true (i.e. <... bool /> vs <... bool=true />)
    "bool": str => str == "" || str == "true" ? true : false,
    "json": str => JSON.parse(str),
    "number": str => Number(str),
    "float": str => parseFloat(str)
};
/**
 * @param obj object to apply attributes to
 * @param elem HTML element to extract attributes from
 * @param attributes list of attributes to extract, either in string or tuple form. If tuple, an extra type parameter is passed to parse string to appropriate type
 */
export function apply(obj, elem, ...attributes) {
    for (let attr of attributes) {
        // arg will either be string or tuple.
        // string form ignores type and only specifies name
        let prop, type = "";
        if (typeof attr == "string") {
            prop = attr;
        }
        // tuple form stores both name and type in array format
        else {
            prop = attr[0];
            type = attr[1];
        }
        // pull string value from element
        // if type is provided and valid, use appropriate mapper to map value to correct type
        let value = elem.getAttribute(prop);
        if (type in StringParser) {
            value = StringParser[type](value);
        }
        // now apply the formatted value to object
        obj[prop] = value;
    }
}
/** Parsed attributes from Element into Node */
export function extractAttributes(elem, node) {
    var _a;
    if ((_a = elem.attributes) === null || _a === void 0 ? void 0 : _a.length) {
        for (let i = 0; i < elem.attributes.length; i++) {
            let attr = elem.attributes[i];
            // @ts-ignore
            node[attr.name]
                = NUMBER_PROPS.includes(attr.name) ? Number(attr.value)
                    : attr.value == "" ? true
                        : attr.value;
        }
    }
}
const EXTEND_PROPERTIES = ["SPEED", "VOICE", "FACE"];
/**
 * @param parent parent object to copy properties from
 * @param child child object to copy properties to
 * @param properties optional list of properties to extend
 */
export function extend(parent, child, properties = null) {
    const props = properties !== null && properties !== void 0 ? properties : EXTEND_PROPERTIES;
    for (let prop of props) {
        child[prop] = parent[prop];
    }
}
//# sourceMappingURL=attributes.js.map