export namespace tson {

    type ClassDesc = {
        id: number,
        constructor: Constructor<any>,
        fields: { [fieldName: string]: Options }
    }

    interface Constructor<T> {
        new(): T
    }

    function isConstructor(data: any): data is Constructor<any> {
        return typeof data == "function"
    }

    type Options = {
        type?: "array" | "map" | "any" | Constructor<any>
        generic?: "string" | "number" | "boolean" | Constructor<any>
        k?: "string" | "number"
        v?: "string" | "number" | "boolean" | Constructor<any>
        transformer?: (data: any) => any
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

    export function fieldMapSN() {
        return field({ type: "map", k: "string", v: "number" })
    }

    export function fileStringArray() {
        return field({ type: "array", generic: "string" })
    }

    export function fieldNumberArray() {
        return field({ type: "array", generic: "number" })
    }

    export function dump() {
        console.log(classes)
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

    export function parse<T>(data: any, clz: Constructor<T> | Object): T {
        let classDesc: ClassDesc
        let rtn: any
        if (isConstructor(clz)) {
            rtn = new clz()
            let classid = (clz as any).prototype.__tson_classid || -1
            classDesc = classes[classid] || { id: null, constructor: null, fields: {} }
        } else {
            rtn = clz
            classDesc = { id: null, constructor: null, fields: {} }
        }
        if (typeof data != "object") {
            return rtn
        }
        let keys = Object.keys(rtn)
        for (let key of keys) {
            let t = typeof rtn[key]
            let dv = data[key]
            if (dv == null) {
                continue
            }
            if (t == "number" || t == "string" || t == "boolean") {
                rtn[key] = parseValue(dv, t)
                continue
            }
            let opts = classDesc.fields[key]
            if (opts == null) {
                let proto = rtn[key].__proto__
                if (proto == Object.prototype) {
                    rtn[key] = parse(dv, rtn[key])
                } else {
                    rtn[key] = parse(dv, proto.constructor)
                }
            } else if (opts.transformer != null) {
                rtn[key] = opts.transformer(dv)
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
            } else if (opts.type == "any") {
                rtn[key] = dv
            } else {
                rtn[key] = parseValue(dv, opts.type)
            }
        }
        return rtn
    }

    export function parseArray<T>(data: any[], clz: Constructor<T>): T[] {
        let list: T[] = []
        for (let v of data) {
            list.push(parse(v, clz))
        }
        return list
    }
}
