<a href="https://github.com/chutao-zhang/mango-libs-treejs/tree/master#readme" target="_blank">Englist</a> | 中文

<p>
<img alt="npm" src="https://img.shields.io/npm/v/@mango-libs/treejs?logo=npm&color=%234ac41c">
<img alt="npm" src="https://img.shields.io/npm/dm/@mango-libs/treejs?logo=npm&color=%234ac41c">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/chutao-zhang/mango-libs-treejs">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/chutao-zhang/mango-libs-treejs">
</p>

### 安装

```bash
npm install @mango-libs/treejs
```

### 使用

```js
// 示例数据
const treeData = [
  {
    id: 1,
    name: "node1",
    children: [
      {
        id: 2,
        name: "node1-1",
        children: [
          { id: 3, name: "node1-1-1" },
          { id: 4, name: "node1-1-2" },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "node2",
    children: [
      { id: 6, name: "node2-1" },
      { id: 7, name: "node2-2" },
    ],
  },
  { id: 8, name: "node3" },
];
```

```js
import { createTreeInstance } from "@mango-libs/treejs";

// 创建实例
// 返回一个树实例，可以调用实例方法
const tree = createTreeInstance(treeData, {
  nodeKey: "id", // 节点key
  childNodeKey: "children", // 子节点key
});
```

### 方法

- **`find()`**: 查找节点，返回第一个匹配的节点对象

  ```js
  const result = tree.find((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2'}
  ```

- **`findPath()`**: 查找节点路径，返回第一个匹配节点的路径，以平铺数组形式返回

  ```js
  const result = tree.findPath((node) => node.id === 4);
  // result: [
  //    {id: 1, name: 'node1', children:[...]},
  //    {id: 2, name: 'node1-1', children:[...]},
  //    {id: 4, name: 'node1-1-2'}
  // ]
  ```

- **`filter()`**: 过滤节点，返回过滤后的节点数组，以平铺数组形式返回

  ```js
  const result = tree.filter((node) => node.id > 5);
  // result: [
  //    {id: 7, name: 'node2-2'},
  //    {id: 6, name: 'node2-1'},
  //    {id: 8, name: 'node3'}
  // ]
  ```

- **`search()`**: 搜索节点，返回匹配的节点，以原树形结构形式返回，并保留其父级路径

  ```js
  const result = tree.search((node) => node.name === "node2-1");
  // result: [
  //    {
  //        "id": 5,
  //        "name": "node2",
  //        "children": [
  //            {  "id": 6, "name": "node2-1" }
  //        ]
  //    }
  // ]
  ```

- **`flat()`**: 平铺树，返回平铺后的节点数组

  ```js
  const result = tree.flat();
  // result: [
  //    {id: 1, name: 'node1', children:[...]},
  //    {id: 2, name: 'node1-1', children:[...]},
  //    {...}
  //    {id: 8, name: 'node3'}
  // ]
  ```

- **`parent()`**: 查找目标节点的父节点，返回父节点对象（只查找第一个匹配节点的父节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  const result = tree.parent((node) => node.id === 4);
  // result: {id: 21, name: 'node1-1', children:[...]}
  ```

- **`siblings()`**: 查找目标节点的兄弟节点，返回兄弟节点数组（只查找第一个匹配节点的兄弟节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  const result = tree.siblings((node) => node.id === 4);
  // result: [
  //    {id: 3, name: 'node1-1-1'},
  //    {id: 4, name: 'node1-1-2'}
  // ]
  ```

- **`remove()`**: 删除目标节点，并返回该节点（只删除第一个匹配节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  const result = tree.remove((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2'}
  ```

- **`modify()`**: 修改目标节点，并返回修改后的节点（只修改第一个匹配节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  const result = tree
    .modify({ name: "node1-1-2-modify" })
    .which((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2-modify'}
  ```

- **`insert()`**: 插入节点，并返回插入后的节点（只插入第一个匹配节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  // 将新节点插入目标节点前面
  const result1 = tree
    .insert({ id: 100, name: "insert node before" })
    .before((m) => m.id === 4);
  // result1: { id: 100, name: 'insert node before' }

  // 将新节点插入目标节点后面
  const result2 = tree
    .insert({ id: 101, name: "insert node after" })
    .after((m) => m.id === 4);
  // result2: { id: 100, name: 'insert node after' }

  // 目标节点的兄弟节点: [
  //  { "id": 3, "name": "node1-1-1" },
  //  { "id": 100, "name": "insert node before" },
  //  { "id": 4,  "name": "node1-1-2" },
  //  { "id": 101, "name": "insert node after" }
  // ]
  ```

- **`appendChild()`**: 添加子节点，并返回添加后的目标节点（只添加在第一个匹配节点，使用算法不同，第一个匹配节点可能也不同）

  ```js
  const result = tree
    .appendChild({ id: 100, name: "append child" })
    .which((node) => node.id === 4);
  // result: {
  //  "id": 4,
  //  "name": "node1-1-2",
  //  "children": [{ "id": 100, "name": "append child" }]
  // }
  ```

- **`keyToKey()`**: 键名转换，对指定键名替换成新键名，返回新的树
  ```js
  const result = tree.keyToKey({ id: "key", name: "value" });
  // result: [
  //    {
  //        key:1,   // 新键名
  //        value: "node1", // 新键名
  //        children:[{...}],
  //        __rawData:{ id, name, ...}  // 原始键名的数据
  //    }
  //    {...}
  // ]
  ```

### 其他

- **`flat(options)`**
- **`find(predicate, options)`**
- **`findPath(predicate, options)`**

```js
predicate: (node) => boolean; // 节点筛选条件
// 可选参数
options?: {
    use?: 'DFS'|'BFS'; // 默认：深度优先(栈)， DFS：深度优先(递归)，BFS：广度优先(队列)
    onComplete?:(res) => void; // 完成时执行，res: 执行结果
}
```
