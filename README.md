Englist | <a href="https://github.com/chutao-zhang/mango-libs-treejs/blob/master/README-zh_CN.md" target="_blank">中文</a>

<p>
<img alt="npm" src="https://img.shields.io/npm/v/@mango-libs/treejs?logo=npm&color=%234ac41c">
<img alt="npm" src="https://img.shields.io/npm/dm/@mango-libs/treejs?logo=npm&color=%234ac41c">
<img alt="GitHub forks" src="https://img.shields.io/github/forks/chutao-zhang/mango-libs-treejs">
<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/chutao-zhang/mango-libs-treejs">
</p>

### Install

```bash
npm install @mango-libs/treejs
```

### Usage

```js
// example data
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

// Create an instance
// A tree instance is returned, and the instance method can be called
const tree = createTreeInstance(treeData, {
  nodeKey: "id", // node key
  childNodeKey: "children", // child node key
});
```

### API

- **`find()`**: find the node and return the first matching node object

  ```js
  const result = tree.find((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2'}
  ```

- **`findPath()`**: find the node path, and return the path of the first matching node, returned as a flattened array

  ```js
  const result = tree.findPath((node) => node.id === 4);
  // result: [
  //    {id: 1, name: 'node1', children:[...]},
  //    {id: 2, name: 'node1-1', children:[...]},
  //    {id: 4, name: 'node1-1-2'}
  // ]
  ```

- **`filter()`**: filter nodes, return the filtered array of nodes, and return as a flattened array

  ```js
  const result = tree.filter((node) => node.id > 5);
  // result: [
  //    {id: 7, name: 'node2-2'},
  //    {id: 6, name: 'node2-1'},
  //    {id: 8, name: 'node3'}
  // ]
  ```

- **`search()`**: search for a node, return a matching node, return it in the original tree structure, and keep its parent path

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

- **`flat()`**: flatten the tree, returning the flattened array of nodes

  ```js
  const result = tree.flat();
  // result: [
  //    {id: 1, name: 'node1', children:[...]},
  //    {id: 2, name: 'node1-1', children:[...]},
  //    {...}
  //    {id: 8, name: 'node3'}
  // ]
  ```

- **`parent()`**: finds the parent node of the target node and returns the parent node object (only the parent node of the first matching node is found, the first matching node may also be different depending on the algorithm)

  ```js
  const result = tree.parent((node) => node.id === 4);
  // result: {id: 21, name: 'node1-1', children:[...]}
  ```

- **`siblings()`**: find the sibling of the target node and return an array of sibling nodes (only the sibling of the first matching node is found, the first matching node may also be different depending on the algorithm)

  ```js
  const result = tree.siblings((node) => node.id === 4);
  // result: [
  //    {id: 3, name: 'node1-1-1'},
  //    {id: 4, name: 'node1-1-2'}
  // ]
  ```

- **`remove()`**: remove the target node and return the removed node (only the first matching node is removed, the first matching node may also be different depending on the algorithm)

  ```js
  const result = tree.remove((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2'}
  ```

- **`modify()`**: modify the target node and return the modified node (only the first matching node is modified, the first matching node may also be different depending on the algorithm)

  ```js
  const result = tree
    .modify({ name: "node1-1-2-modify" })
    .which((node) => node.id === 4);
  // result: {id: 4, name: 'node1-1-2-modify'}
  ```

- **`insert()`**: inserta a node, and return the inserted node (only the first matching node is inserted, the first matching node may also be different depending on the algorithm)

  ```js
  // insert the new node before the target node
  const result1 = tree
    .insert({ id: 100, name: "insert node before" })
    .before((m) => m.id === 4);
  // result1: { id: 100, name: 'insert node before' }

  // insert the new node after the target node
  const result2 = tree
    .insert({ id: 101, name: "insert node after" })
    .after((m) => m.id === 4);
  // result2: { id: 101, name: 'insert node after' }

  // the sibling node of the target node: [
  //  { "id": 3, "name": "node1-1-1" },
  //  { "id": 100, "name": "insert node before" },
  //  { "id": 4,  "name": "node1-1-2" },
  //  { "id": 101, "name": "insert node after" }
  // ]
  ```

- **`appendChild()`**: append a child node and return the target node (only append the first matching node, the first matching node may also be different depending on the algorithm)

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

- **`keyToKey()`**: key conversion, replace the specified key with a new key, and return a new tree ...
  ```js
  const result = tree.keyToKey({ id: "key", name: "value" });
  // result: [
  //    {
  //        key:1,  // new key
  //        value: "node1", // new key
  //        children:[{...}],
  //        __rawData:{ id, name, ...}  // the data of the original key
  //    }
  //    {...}
  // ]
  ```

### Others

- **`flat(options)`**
- **`find(predicate, options)`**
- **`findPath(predicate, options)`**

```js
predicate: (node) => boolean;
// optional
options?: {
    use?: 'DFS'|'BFS'; // default：DFS(Stack)， DFS：DFS(Recursive)，BFS：BFS(Queue)
    onComplete?:(res) => void;
}
```
