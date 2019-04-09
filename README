功能类似于gson


## 注意事项
- 转化后的对象会严格符合class里成员的类型申明，如果数据类型不匹配，则会使用该类型的默认值
- class的成员一定要有初始值，或者在构造方法里直接初始化，否则转化后的对象里此值会为null


## 测试运行
    tsc
    npm start


## 使用
```typescript
class Friend {
    name = ""
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
}


console.log(
    tson.parse({
        name: "zzp",
        age: "18",
        open: "True",
        friends: ["a", { name: "zzp2" }],
        rewards: {
            chips: 10000,
            diamond: "20z",
            score: "a23",
        },
        gifts: {
            0: { item: "chips", val: 120 },
            1: { item: "diamond", val: "20" }
        },
        ids: [1, "4", "a", true]
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
```