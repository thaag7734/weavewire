export class TreeNode<T> {
	protected value: T;
	protected children: TreeNode<T>[];

	constructor(value: T, children: TreeNode<T>[] = []) {
		this.value = value;
		this.children = children;
	}

	public getChildren(): TreeNode<T>[] {
		return this.children;
	}

	public appendChild(child: T | TreeNode<T>): void {
		if (child instanceof TreeNode) {
			this.children.push(child);
		} else {
			this.children.push(new TreeNode<T>(child));
		}
	}
}

export class Tree<T> {
	protected root!: TreeNode<T>;

	constructor(root: T | TreeNode<T>) {
		this.setRoot(root);
	}

	public setRoot(root: T | TreeNode<T>): void {
		if (root instanceof TreeNode) {
			this.root = root;
		} else {
			this.root = new TreeNode<T>(root);
		}
	}

	/**
	 * Returns the root node of this Tree
	 *
	 * @returns {TreeNode<T>}
	 */
	public getRoot(): TreeNode<T> {
		return this.root;
	}

	/**
	 * Performs a depth-first search to find a {@link TreeNode} `n` which satisfies
	 * the condition `cb(n) === true`, short-circuiting if found.
	 *
	 * @param {(n: TreeNode<T>) => boolean} cb - The callback to check each {@link TreeNode} against
	 * @returns {TreeNode<T> | null} The first matching node, or null if none found
	 */
	public dFind(
		cb: (n: TreeNode<T>) => boolean,
		root: TreeNode<T> = this.root,
	): TreeNode<T> | null {
		const visited: Set<TreeNode<T>> = new Set();
		const queue: TreeNode<T>[] = [root];

		function search(): TreeNode<T> | null {
			if (queue.length === 0) {
				return null;
			}

			const current = queue.shift()!;
			if (cb(current) === true) {
				return current;
			}

			for (const child of current.getChildren()) {
				if (visited.has(child)) continue;

				queue.push(child);
			}

			return search();
		}

		return search();
	}
}
