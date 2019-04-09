export namespace tson {

    type ClassDesc = {
        id: number,
        constructor: Constructor<any>,
        fields: { [fieldName: string]: Options }
    }

    interface Constructor<T> {
        new(): T
    }

    type Options = {
        type: "array" | "map"
        generic?: "string" | "number" | "boolean" | Constructor<any>
        k?: "string" | "number"
        v?: "string" | "number" | "boolean" | Constructor<any>
    }

    let ID = 0
    let classes: { [id: number]: ClassDesc } = {}

    export function field(options: Options) {
        return function (obj: any, fieldName: string) {
            let id: number = obj.__tson_classid
            if (id == null) {
                id = ++ID
                Object.defineProperty(obj, "__tson_classid", { enumerable: false, value: id })
            }
            let desc: ClassDesc = classes[id]
            if (desc == null) {
                desc = {
                    id: id,
                    constructor: obj.constructor,
                    fields: {}
                }
                classes[id] = desc
            }
            desc.fields[fieldName] = options
        }
    }

    export function fieldMapNS() {
        return field({ type: "map", k: "string", v: "number" })
    }

    export function fileStringArray() {
        return field({ type: "array", generic: "string" })
    }

    export function fieldNumberArray() {
        return field({ type: "array", generic: "number" })
    }

    function parseValue(v: any, type: any): any {
        if (type == "string") {
            return v.toString()
        } else if (type == "number") {
            return parseFloat(v) || 0
        } else if (type == "boolean") {
            if (typeof v == "boolean") {
                return v
            } else {
                return v.toString().toLowerCase() == "true"
            }
        } else if (typeof type == "function") {
            return parse(v, type)
        }
    }

    export function parse<T>(data: any, clz: Constructor<T>): T {
        let rtn: any = new clz()
        if (typeof data != "object") {
            return rtn
        }
        let classid = (clz.prototype as any).__tson_classid
        let classDesc: ClassDesc = classes[classid] || { id: null, constructor: null, fields: {} }
        let keys = Object.keys(rtn)
        for (let key of keys) {
            let t = typeof rtn[key]
            let dv = data[key]
            if (dv == null) {
                continue
            }
            if (t == "number" || t == "string" || t == "boolean") {
                rtn[key] = parseValue(dv, t)
            } else if (t == "object") {
                let opts = classDesc.fields[key]
                if (opts == null) {
                    rtn[key] = dv
                } else if (opts.type == "array") {
                    rtn[key] = []
                    let rv = rtn[key]
                    if (dv instanceof Array) {
                        for (let v of dv) {
                            rv.push(parseValue(v, opts.generic))
                        }
                    }
                } else if (opts.type == "map") {
                    rtn[key] = {}
                    let rv = rtn[key]
                    if (typeof dv == "object") {
                        for (let k in dv) {
                            if (opts.k == "number") {
                                let nk = parseInt(k)
                                if (nk != null && !isNaN(nk)) {
                                    rv[nk] = parseValue(dv[k], opts.v)
                                }
                            } else {
                                rv[k] = parseValue(dv[k], opts.v)
                            }
                        }
                    }
                }
            }
        }
        return rtn
    }
}
