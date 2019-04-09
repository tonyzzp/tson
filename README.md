功能类似于gson

## 测试运行
    tsc
    npm start


## 使用
```typescript
class Friend {
    name = ""
    age = 0
    rich = true
}
let v = tson.parse({
    name: "zzp",
    age: 18,
    rich: false,
}, Friend)
console.log(v)
console.log(v instanceof Friend)

//详细用法见 test.ts
```


## 注意事项
- 转化后的对象会严格符合class里成员的类型申明，如果数据类型不匹配，则会使用该类型的默认值
- class的成员一定要有初始值，或者在构造方法里直接初始化，否则转化后的对象里此值会为null
