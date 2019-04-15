import { tson } from "./tson";

function convertFruits(s: string): string[] {
    return s.split(",")
}

class Friend {
    name = ""

    @tson.fieldNumberArray()
    luckyNumbers: number[] = []

    @tson.field({ transformer: convertFruits })
    fruits: string[] = []
}

class Reward {
    item = ""
    val = 0
    home: string
    hobby: string
    constructor() {
        this.hobby = "games"
    }
}

class Parent {
    name = ""
    age = 0
    open = true

    @tson.field({ type: "array", generic: Friend })
    friends: Friend[] = []

    @tson.field({ type: "map", k: "string", v: "number" })
    rewards: { [key: string]: number } = {}

    @tson.field({ type: "map", k: "number", v: Reward })
    gifts: { [index: number]: Reward } = {}

    @tson.fieldNumberArray()
    ids: number[] = []

    reward = new Reward()
    friend = new Friend()

    @tson.field({ type: Friend })
    friend2 = {}

    @tson.field({ type: "any" })
    others = {}

    innerObj = {
        id: 0,
        name: "",
        box: {
            weight: 0,
            color: "none",
        },
        friend: new Friend()
    }
}


tson.dump()

console.log(
    tson.parse({
        name: "zzp",
        age: "18",
        open: "True",
        friends: ["a", { name: "zzp2", luckyNumbers: [6, 8, 9] }],
        rewards: {
            chips: 10000,
            diamond: "20z",
            score: "a23",
        },
        gifts: {
            0: { item: "chips", val: 120 },
            1: { item: "diamond", val: "20" }
        },
        ids: [1, "4", "a", true],
        reward: { item: "diamond", val: 123 },
        friend: { name: "zzp", luckyNumbers: [99, "88"], fruits: "apple,orange" },
        friend2: { name: "zzp", luckyNumbers: [99, "88"] },
        others: { s: "str", n: 1, b: true, ns: [1, 2, 3] },
        innerObj: {
            id: 10,
            name: "obj",
            box: {
                weight: "100",
                color: "red",
                none: "not"
            },
            friend: { name: "zzp" }
        }
    }, Parent)
)

console.log(
    tson.parse({
        item: "chips",
        val: 100,
        home: "China",
        hobby: "study",
    }, Reward)
)

console.log(
    tson.parseArray([
        { item: "chips", val: 100 },
        { item: "diamond", val: 2 },
    ], Reward)
)
