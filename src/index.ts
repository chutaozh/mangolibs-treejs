type AlgorithmType = 'DFS' | 'BFS';

interface FlattenWithPathsResultProps<T> {
    __path: T[];
}

interface TreeOptions<T = any> {
    /** 节点键名 */
    nodeKey: keyof T;
    /** 子节点键名 */
    childNodeKey: keyof T;
};

interface TreeFuncOptionsProps<T> {
    /** DFS：深度优先算法；BFS：广度优先算法 */
    use?: AlgorithmType;
    /** 完成时执行
     * @param res 执行结果
     */
    onComplete?: (res?: T) => void;
}

interface WhichFunctionReturn<T> {
    which: (predicate: PredicateFunction<T>) => T | undefined;
}

interface InsertFunctionReturn<T> {
    before: (predicate: PredicateFunction<T>) => Partial<T> | undefined;
    after: (predicate: PredicateFunction<T>) => Partial<T> | undefined;
}

type PredicateFunction<T> = (node: T) => boolean;
type FlatFunction<T> = (options?: TreeFuncOptionsProps<Array<T>>) => Array<T>;
type FindFunction<T> = (predicate: PredicateFunction<T>, options?: TreeFuncOptionsProps<T>) => T | undefined;
type FindPathFunction<T> = (predicate: PredicateFunction<T>, options?: TreeFuncOptionsProps<Array<T>>) => T[];
type FilterFunction<T> = (predicate: PredicateFunction<T>) => Array<T>;
type ModifyFunction<T> = (node: Partial<T>) => WhichFunctionReturn<T>;
type RemoveFunction<T> = (predicate: PredicateFunction<T>) => T | undefined;
type InsertFunction<T> = (node: Partial<T>) => InsertFunctionReturn<T>;
type AppendChildFunction<T> = ModifyFunction<T>;
type SearchFunction<T> = FilterFunction<T>;
type ParentFunction<T> = (predicate: PredicateFunction<T>) => T | undefined;
type SiblingsFunction<T> = FilterFunction<T>;
type KeyToKeyFunction<T> = (keyMap: Partial<Record<keyof T, string>>, onComplete?: (newTree: Array<any>) => void) => Array<any>;

interface TreeInstance<T = any> {
    /** 扁平化树状对象数组
     * @param options 配置项
     */
    flat: FlatFunction<T>;
    /** 查找节点
     * @param predicate 条件函数
     * @param options 其他选项
     */
    find: FindFunction<T>;
    /** 查找节点链路
     * @param predicate 条件函数
     * @param options 其他选项
     */
    findPath: FindPathFunction<T>;
    /** 筛选树，以平埔格式返回
     * @param predicate 条件函数
     */
    filter: FilterFunction<T>;
    /** 修改节点
     * @param node 节点
     */
    modify: ModifyFunction<T>;
    /** 删除节点
     * @param predicate 条件函数
     */
    remove: RemoveFunction<T>;
    /** 插入节点
     * @param node 节点
     */
    insert: InsertFunction<T>;
    /** 搜索树，以原始树状格式返回
     * @param predicate 条件函数
     */
    search: SearchFunction<T>;
    /** 目标节点的父节点
     * @param predicate 条件函数
     */
    parent: ParentFunction<T>;
    /** 目标节点的兄弟节点
     * @param predicate 条件函数
     */
    siblings: SiblingsFunction<T>;
    /** 添加子节点
     * @param node 节点
     */
    appendChild: AppendChildFunction<T>;
    /** 转换键名
     * @param keyMap 键名映射关系
     * @param onComplete 完成时执行
     */
    keyToKey: KeyToKeyFunction<T>;
}

/** 扁平化树（深度优先/栈）
 * @param root 根节点
 * @param childNodeKey 子节点键名
 */
function _flat<T = any>(root: T, childNodeKey: keyof T) {
    const stack: Array<[T, T[]]> = [[root, [root]]]; // 初始栈，包含根节点和根节点的路径

    const result: Array<T> = []; // 存储扁平化后的树
    const resultWithPath: Array<FlattenWithPathsResultProps<T> & T> = []; // 存储扁平化后的树及其路径

    if (root) {
        while (stack.length > 0) {
            const [node, path] = stack.pop()!; // 弹出栈顶节点和其路径

            // 将当前节点加入遍历结果，并记录其路径
            result.push(node);
            resultWithPath.push({ ...node, __path: path });

            if (node && Array.isArray(node[childNodeKey])) {
                // 将当前节点的子节点入栈，并更新子节点的路径
                for (const child of (node as any)[childNodeKey]) {
                    stack.push([child, [...path, child]]);
                }
            }
        }
    }

    return { result, resultWithPath };
}

/** 扁平化树（深度优先/递归） */
function _flatDFS<T = any>(root: T, childNodeKey: keyof T) {
    function func(node: T, path: T[] = []) {
        const result: Array<T> = [];
        const resultWithPath: Array<FlattenWithPathsResultProps<T> & T> = [];
        const newPath = path.concat(node); // 将当前节点的名称加入路径

        // 将当前节点及其路径保存到结果中
        result.push(node);
        resultWithPath.push({ ...node, __path: newPath });

        if (node && Array.isArray(node[childNodeKey])) {
            // 递归地遍历当前节点的子节点
            for (const child of (node as any)[childNodeKey]) {
                const { result: _result, resultWithPath: _resultWithPath } = func(child, newPath);
                result.push(..._result);
                resultWithPath.push(..._resultWithPath);
            }
        }

        return { result, resultWithPath };
    }

    return func(root, []);
};

/** 扁平化树（广度优先） */
function _flatBFS<T = any>(root: T, childNodeKey: keyof T) {
    const queue = [{ node: root, path: [root] }]; // 初始将根节点加入队列
    const result: Array<T> = []; // 存储扁平化后的树
    const resultWithPath: Array<FlattenWithPathsResultProps<T> & T> = []; // 存储扁平化后的树及其路径

    if (root) {
        while (queue.length > 0) {
            const { node, path } = queue.shift()!;
            result.push(node);
            resultWithPath.push({ ...node, __path: path });

            if (node && Array.isArray(node[childNodeKey])) {
                for (const child of (node as any)[childNodeKey]) {
                    queue.push({ node: child, path: [...path, child] });
                }
            }
        }
    }

    return { result, resultWithPath };
}

/** 查找节点（深度优先/栈）
 * @param node 节点
 * @param childNodeKey 子节点键名
 * @param predicate 条件函数
 */
function _find<T = any>(root: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    if (!root) return void 0;

    const stack = [root];

    while (stack.length > 0) {
        const node: any = stack.pop()!;

        // 检查当前节点是否是目标节点
        if (predicate(node)) {
            return node;
        }

        // 将当前节点的子节点压入栈中
        if (node && Array.isArray(node[childNodeKey])) {
            const _nodeList: any[] = (node as any)[childNodeKey];
            for (let i = _nodeList.length - 1; i >= 0; i--) {
                stack.push(_nodeList[i]);
            }
        }
    }

    // 如果栈为空且仍未找到目标节点，则返回null
    return void 0;
}

/** 查找节点（深度优先/递归） */
function _findDFS<T = any>(node: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    if (!node) {
        return void 0;
    }

    if (predicate(node)) {
        return node;
    }

    if (node && Array.isArray(node[childNodeKey])) {
        // 递归地遍历当前节点的子节点
        for (const child of (node as any)[childNodeKey]) {
            const result: any = _findDFS(child, childNodeKey, predicate);
            // 如果找到目标节点，则返回结果
            if (result) {
                return result;
            }
        }
    }

    return void 0;
}

/** 查找节点（广度优先） */
function _findBFS<T = any>(node: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    const queue: any[] = []; // 使用队列存储待访问的节点
    queue.push(node); // 将根节点加入队列

    while (queue.length > 0) {
        const node = queue.shift(); // 出队列

        if (predicate(node)) {
            return node;
        }

        if (node && Array.isArray(node[childNodeKey])) {
            // 将当前节点的所有子节点加入队列
            for (const child of node[childNodeKey]) {
                queue.push(child);
            }
        }
    }

    // 如果在遍历过程中未找到目标节点，则返回空
    return void 0;
}

/** 查找节点链路（深度优先/栈）
 * @param predicate 条件函数
 * @param root 节点
 * @param childNodeKey 子节点键名
 */
function _findPath<T = any>(root: any, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    if (!root) return [];

    const stack: Array<{ node: T, path: Array<T> }> = [{ node: root, path: [] }];

    while (stack.length > 0) {
        const { node, path } = stack.pop()!;

        // 将当前节点加入到路径中
        const currentPath: Array<T> = [...path, node];

        // 检查当前节点是否是目标节点
        if (predicate(node)) {
            return currentPath;
        }

        // 将当前节点的子节点压入栈中，并记录路径
        if (node && Array.isArray(node[childNodeKey])) {
            const _nodeList: any[] = (node as any)[childNodeKey];

            for (let i = _nodeList.length - 1; i >= 0; i--) {
                stack.push({ node: _nodeList[i], path: currentPath });
            }
        }
    }

    // 如果栈为空且仍未找到目标节点，则返回空路径
    return [];
}

/** 查找节点链路（深度优先/递归） */
function _findPathDFS<T = any>(root: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    function func(node: T, path: Array<T> = []) {
        // 如果当前节点为空，则返回空数组
        if (!node) {
            return [];
        }

        // 将当前节点的名称加入路径
        const newPath: Array<T> = [...path, node];

        if (predicate(node)) {
            return newPath;
        }

        if (node && Array.isArray(node[childNodeKey])) {
            // 递归地遍历当前节点的子节点
            for (const child of (node as any)[childNodeKey]) {
                const result: Array<T> = func(child, newPath);
                // 如果在子节点的路径中找到目标节点，则返回结果
                if (result.length > 0) {
                    return result;
                }
            }
        }

        // 如果在当前节点的子节点中未找到目标节点，则返回空数组
        return [];
    }

    return func(root, []);
};

/** 查找节点链路（广度优先） */
function _findPathBFS<T = any>(root: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    const queue = [{ node: root, path: [root] }]; // 初始将根节点加入队列，并将根节点名称加入路径

    while (queue.length > 0) {
        const { node, path }: any = queue.shift() || {}; // 出队列

        if (predicate(node)) {
            return path || [];
        }

        if (node && Array.isArray(node[childNodeKey])) {
            // 将当前节点的所有子节点加入队列，并更新路径
            for (const child of node[childNodeKey]) {
                queue.push({ node: child, path: [...path, child] });
            }
        }
    }

    // 如果在遍历过程中未找到目标节点，则返回空数组
    return [];
}

/** 查找节点并得到父节点
 * @param root 根节点
 * @param childNodeKey 子节点键名
 * @param predicate 条件函数
 */
function _findNodeWithParent<T = any>(root: T, childNodeKey: keyof T, predicate: PredicateFunction<T>) {
    if (!root) return {};

    const stack: Array<{ node: T, parent?: T, index: number; }> = [{ node: root, index: -1 }];

    while (stack.length > 0) {
        const { node, parent, index } = stack.pop()!;

        // 检查当前节点是否是目标节点
        if (predicate(node)) {
            return { node, parent, index };
        }

        // 将当前节点的子节点压入栈中，并记录父节点和兄弟节点索引
        if (node && Array.isArray(node[childNodeKey])) {
            const siblings: any[] = (node as any)[childNodeKey];
            for (let i = siblings.length - 1; i >= 0; i--) {
                stack.push({ node: siblings[i], parent: node, index: i });
            }
        }
    }

    // 如果栈为空且仍未找到目标节点，则返回null
    return {};
};

function createTreeInstance<T = any>(treeData: Array<T>, optoins: TreeOptions<T>) {
    const { nodeKey, childNodeKey } = optoins;
    const flattenResult: Array<T> = [];
    const flattenWithPathsResult: Array<FlattenWithPathsResultProps<T> & T> = [];

    function flat(options?: TreeFuncOptionsProps<Array<T>>) {
        flattenResult.splice(0, flattenResult.length);
        flattenWithPathsResult.splice(0, flattenWithPathsResult.length);

        for (const node of treeData) {
            let func = _flat;
            switch (options?.use) {
                case 'DFS':
                    func = _flatDFS;
                    break;
                case 'BFS':
                    func = _flatBFS;
                    break;
                default: break;
            }

            const { result, resultWithPath } = func<T>(node, childNodeKey);
            flattenResult.push(...result);
            flattenWithPathsResult.push(...resultWithPath);
        }
        options?.onComplete?.(flattenResult);
        return [...flattenResult];
    }

    function find(predicate: PredicateFunction<T>, options?: TreeFuncOptionsProps<T>) {
        let result = !options?.use ? flattenResult.find(predicate) : undefined;

        if (!result) {
            for (const node of treeData) {
                switch (options?.use) {
                    case 'DFS':
                        result = _findDFS(node, childNodeKey, predicate);
                        break;
                    case 'BFS':
                        result = _findBFS(node, childNodeKey, predicate);
                        break;
                    default:
                        result = _find(node, childNodeKey, predicate);
                        break;
                }

                if (result) {
                    break;
                }
            }
        }

        options?.onComplete?.(result);
        return result;
    };

    function findPath(predicate: PredicateFunction<T>, options?: TreeFuncOptionsProps<Array<T>>) {
        let result = !options?.use ? flattenWithPathsResult.find(predicate)?.__path || [] : [];

        if (result.length === 0) {
            for (const node of treeData) {
                switch (options?.use) {
                    case 'DFS':
                        result = _findPathDFS(node, childNodeKey, predicate);
                        break;
                    case 'BFS':
                        result = _findPathBFS(node, childNodeKey, predicate);
                        break;
                    default:
                        result = _findPath(node, childNodeKey, predicate);
                        break;
                }

                if (result?.length) {
                    break;
                }
            }

        }

        options?.onComplete?.(result);
        return result;
    }

    function modify(node: Partial<T>) {
        return {
            which: (predicate: PredicateFunction<T>) => {
                const _node: any = find(predicate);

                if (_node) {
                    Object.keys(_node).forEach(key => {
                        if (node.hasOwnProperty(key)) {
                            _node[key] = (node as any)[key];
                        }
                    })
                }

                return _node;
            }
        };
    };

    function remove(predicate: PredicateFunction<T>) {
        for (let i = 0; i < treeData.length; i++) {
            const node = treeData[i];

            if (predicate(node)) {
                treeData.splice(i, 1);
                flat();
                return node;
            }

            const { index: targetIndex, node: target, parent } = _findNodeWithParent(node, childNodeKey, predicate) || {};

            if (target && targetIndex !== undefined && targetIndex > -1) {
                (parent?.[childNodeKey] as any)?.splice(targetIndex, 1);
                flat();
                return target;
            }
        }

        return void 0;
    }

    function insert(node: Partial<T>) {
        function func(predicate: PredicateFunction<T>, position: 'before' | 'after') {
            for (let i = 0; i < treeData.length; i++) {
                const _node = treeData[i];

                if (predicate(_node)) {
                    const idx = position === 'before' ? i : i + 1;
                    treeData.splice(idx, 0, (node as any));
                    flat();
                    return node;
                }

                const { index: targetIndex, node: target, parent } = _findNodeWithParent(_node, childNodeKey, predicate) || {};

                if (target && targetIndex !== undefined && targetIndex > -1) {
                    const idx = position === 'before' ? targetIndex : targetIndex + 1;
                    (parent?.[childNodeKey] as any)?.splice(idx, 0, node);
                    flat();
                    return node;
                }
            }

            return void 0;
        };

        return {
            before: (predicate: PredicateFunction<T>) => {
                return func(predicate, 'before');
            },
            after: (predicate: PredicateFunction<T>) => {
                return func(predicate, 'after');
            }
        }
    }

    function appendChild(node: Partial<T>) {
        return {
            which: (predicate: PredicateFunction<T>) => {
                const _node: any = find(predicate);

                if (_node) {
                    if (!_node[childNodeKey]) {
                        _node[childNodeKey] = [];
                    }
                    _node[childNodeKey].push(node);
                    flat();
                }

                return _node;
            }
        };
    }

    function filter(predicate: PredicateFunction<T>) {
        if (flattenWithPathsResult.length === 0) {
            flat();
        }
        const result = flattenWithPathsResult.filter(predicate).map(({ __path, ...rest }) => ({ ...rest } as T));
        return result;
    }

    function search(predicate: PredicateFunction<T>) {
        if (flattenWithPathsResult.length === 0) {
            flat();
        }

        const parentKey = `__parent_${String(nodeKey)}`;
        const result = flattenWithPathsResult.filter(predicate).map(item => item.__path.map(path => ({ ...path })));
        const flatResult = result.map((arr) => {
            let parentKeyVal: any;
            arr.forEach((item: any) => {
                item[parentKey] = parentKeyVal;
                item[childNodeKey] = [];
                parentKeyVal = item[nodeKey];
            });
            return arr;
        }).flat().filter((item, index, arr) => {
            return arr.findIndex(t => t[nodeKey] === item[nodeKey]) === index;
        });

        // 用于存储每个节点的引用
        const nodeMap: any = {};

        // 将节点添加到节点映射中
        flatResult.forEach((node: any) => {
            node[childNodeKey] = []; // 添加 children 属性
            nodeMap[node[nodeKey]] = { ...node, [childNodeKey]: node[childNodeKey] }; // 将节点添加到映射中
        });

        // 查找根节点
        const roots = flatResult.filter((node: any) => node[parentKey] === null || node[parentKey] === undefined);

        // 递归构建树
        function buildTree(node: any) {
            const children = flatResult.filter((child: any) => child[parentKey] === node[nodeKey]);
            children.forEach((child: any) => {
                delete child[parentKey]; // 删除父节点引用
                node[childNodeKey].push(child);
                buildTree(child);
            });
        }

        // 遍历根节点并构建树
        roots.forEach(root => buildTree(root));
        return roots.map((root: any) => {
            delete root[parentKey];
            return root as T;
        });
    }

    function parent(predicate: PredicateFunction<T>) {
        for (let i = 0; i < treeData.length; i++) {
            const node = treeData[i];

            if (predicate(node)) {
                return void 0;
            }

            const { parent } = _findNodeWithParent(node, childNodeKey, predicate) || {};

            if (parent) {
                return parent;
            }
        }

        return void 0;
    };

    function siblings(predicate: PredicateFunction<T>) {
        return (parent(predicate) as any)?.[childNodeKey] || [];
    }

    function keyToKey(keyMap: Partial<Record<keyof T, string>>, onComplete?: (newTree: Array<any>) => void) {
        function func(node: any) {
            const newNode: any = {}; // 新节点对象
            const _keyMap: any[] = Object.keys(node).map(key => [key, (keyMap as any)[key] || key]);

            // 遍历原始键和新键的映射关系
            for (const [oldKey, newKey] of _keyMap) {
                newNode[newKey] = node[oldKey];
            }

            //如果节点具有子节点，则递归转换子节点的键
            if (node && node.hasOwnProperty(childNodeKey) && Array.isArray(node[childNodeKey])) {
                newNode[(keyMap as any)[childNodeKey] || childNodeKey] = node[childNodeKey].map((child: any) => func(child));
            }

            return { ...newNode, __rawData: { ...node } };

        }

        const result: Array<any> = [];

        for (const node of treeData) {
            result.push(func(node));
        }

        onComplete?.(result);
        return result;
    }

    const methods: TreeInstance<T> = {
        flat,
        find,
        findPath,
        filter,
        insert,
        remove,
        modify,
        search,
        parent,
        siblings,
        keyToKey,
        appendChild
    };

    return methods;
};

export { createTreeInstance };