---
title: "Midterm 1 Study Guide: Algorithms"
date: "2025-02-23"
excerpt: "Study guide for 4114: Real World Algorithms."
tags: ["graphs", "computation", "sorting", "searching","algorithms"]
---
---
## 1. Data Structures Review
### Fundamental Structures
- **Arrays & Linked Lists**
	- **Arrays:** Contiguous memory structures; constant-time access.
	- **Linked Lists:** Nodes connected by pointers; dynamic size but sequential access.
### Heaps
- **Definition:** A *complete binary tree* satisfying the heap property:
	- **Min-Heap:** Every parent node is ≤ its children.
	- **Max-Heap:** Every parent node is ≥ its children.
- **Key Operations:**
	- **Insertion:** Add at the end then "reheap" (up-heap), in $O(log\space n)$ time.
	- **Deletion (e.g., Delete-Min):** Replace root with the last element and "sift down", also $O(log\space n)$.
### Graph Data Structures
- **Graph Representations** (detailed in Section 6 below):
	- **Adjacency Matrix:** Uses a 2D array; $\Theta(|V|^2)$ space.
	- **Adjacency List:** Uses an array of lists; $\Theta(|V| + |E|)$ space.
	- Where $|V|$ and $|E|$ is the number of Vertices and Edges in the graph.
---
## 2. Math in Algorithms
### Sets and Notation
- **Sets:** A collection of distinguishable elements.
	- Example: $A = \set{1, 4, 7, 2}$; membership denoted by $x\in A$.
	- Operations: Union $A\cup B$, Intersection $A\cap B$, Difference $A-B$.
### Factorials, Permutations, and Combinations
- **Factorial:**  
  $$n! = n \times (n-1) \times \cdots \times 1,\quad 0! = 1.$$
- **Permutations:** Number of arrangements of $n$ items: $P(n) = n!$.
- **Combinations:** Number of unordered arrangements of $n$ items. 
### Logarithms
- **Definition:**  
  $$\log_b y = x \iff b^x = y.$$
- **Properties:**
	- $$\log_a (xy) = \log_a x + \log_a y$$
	- $$\log_a \left(\frac{n}{m}\right) = \log_a n - \log_a m$$
	- $$\log_a (n^r) = r\log_a n$$
### Summations and Recurrences
- **Summations:**  
  $$\sum_{i=1}^n i = \frac{n(n+1)}{2}$$
- **Recurrence Relations:**
	- Example: Fibonacci sequence  
	$$F(n) = F(n-1) + F(n-2), \quad F(1) = F(2) = 1.$$
	- Towers of Hanoi:  
    $$T(n) = 2\,T(n-1) + 1.$$
### Proof Techniques
- **Proof by Contradiction:** Assume the theorem is false and derive a contradiction.
- **Proof by Induction:** Prove a base case and show if the statement holds for n-1, then it holds for n.
---
## 3. Computational Complexity
### Asymptotic Notation
- **Big-O Notation ($O$) (Upper-Bound):**  
  $$T(n) \in O(f(n)) \iff \exists\, c > 0,\ n_0 \text{ such that } T(n) \le c\,f(n) \text{ for all } n > n_0.$$
- **Big-Omega ($\Omega$) (Lower-Bound):**  
  $$T(n) \in \Omega(g(n)) \iff \exists\, c > 0,\ n_0 \text{ such that } T(n) \ge c\,g(n) \text{ for all } n > n_0.$$
- **Big-Theta ($\Theta$) (Exact Growth Rate):**  
  $$T(n) \in \Theta(h(n)) \iff T(n) \text{ is both } O(h(n)) \text{ and } \Omega(h(n)).$$
### Growth Rate Functions
- **Common Orders:** Constant: $O(1)$, Linear: $O(n)$ , Linearithmic: $O(n\space log\space n)$, Quadratic: $O(n²)$, Exponential: $O(2^n)$.
- **Example (Selection Sort):**  
  $$\Theta\left(\frac{n(n-1)}{2}\right) = \Theta(n^2).$$
---

## 4. Sorting Algorithms
### Quadratic Sorting Algorithms
#### Insertion Sort
- **Concept:** Builds a sorted subarray by inserting each element into its proper place.
- **Usually the BEST of the three.**
- **Pseudocode:**
```c
for (i = 1; i < n; i++) {
	v = A[i];
	j = i - 1;
	while (j >= 0 && A[j] > v) {
		A[j+1] = A[j];
		j--;
	}
	A[j+1] = v;
}
```
- **Complexity:**
	- **Best Case:** $O(n)$ (when already sorted).
	- **Worst/Average Case:** $O(n^2)$.
#### Bubble Sort
- **Concept:** Repeatedly swaps adjacent elements to "bubble" the largest element to the end.
- **Pseudocode:**
```c
do {
	swapFlag = false;
	for (i = 1; i < n; i++) {
		if (A[i-1] > A[i]) {
			swap(A[i-1], A[i]);
			swapFlag = true;
		}
	}
} while (swapFlag);
```
- **Complexity:**
	- **Best Case:** $O(n)$ (when already sorted).
	- **Average/Worst Case:** $O(n^2)$.
	- Efficient for nearly sorted arrays.
#### Selection Sort
- **Concept:**  Repeatedly scans the unsorted portion of the array to find the smallest element and swaps it with the first unsorted element. This process progressively builds a sorted subarray from left to right.
- **Pseudocode:**
```c
for (i = 0; i < n - 1; i++) { 
	minIndex = i; 
	for (j = i + 1; j < n; j++) { 
		if (A[j] < A[minIndex]) 
			minIndex = j; 
	} 
	swap(A[i], A[minIndex]); 
}
```
- **Complexity:**
    - **Always:** $\Theta(n^2)$ comparisons, regardless of the input.
    - Although the number of swaps is at most $O(n)$, the dominant cost is in the comparisons, making the overall time complexity $Θ(n^2)$.
---
## 5. Divide and Conquer: Master Theorem, Merge Sort, Quick Sort
### Master Theorem
- **General Form:**  
  $$T(n) = a\,T\left(\frac{n}{b}\right) + f(n)$$
- **Cases:**
	- **Case 1:** If $$f(n) \in \Theta(n^d)$$ with $$a < b^d$$, then  
	$$T(n) \in \Theta(n^d).$$
	- **Case 2:** If $$a = b^d$$, then  
	$$T(n) \in \Theta(n^d \log n).$$
	- **Case 3:** If $$a > b^d$$, then  
	$$T(n) \in \Theta\left(n^{\log_b a}\right).$$

*Example (Merge Sort):*
Here, $a = 2, b = 2, d = 1$ so that $2 = 2^1$, hence  
$$T(n) = 2T\left(\frac{n}{2}\right) + n \in \Theta(n \log n).$$
### Merge Sort
- **Concept:** Divide the array into two halves, recursively sort each half, then merge.
- **Recurrence:**  
  $$T(n) = 2T\left(\frac{n}{2}\right) + n$$
- **Complexity:** $\Theta(n\space log\space n)$.
- **Pseudocode:**
```c
void mergeSort(int A[], int n) {
	if (n > 1) {
		int mid = n / 2;
		// Copy A[0...mid-1] to B, and A[mid...n-1] to C
		mergeSort(B, mid);
		mergeSort(C, n - mid);
		merge(B, C, A);
	}
}
```
### Quick Sort
- **Concept:** Choose a pivot element, partition the array so that elements less than the pivot come before it and those greater come after, then recursively sort the partitions.
- **Partitioning:** Rearranges elements based on a pivot, ensuring left side elements are less than the pivot and right side elements are greater.
- **Complexity:**
	- **Best Case:** $\Theta(n\space log\space n)$.
	- **Worst Case:** $O(n²)$ (mitigated by a good pivot choice such as median-of-three).
- **Pseudocode:**
```c
void quickSort(int A[], int l, int r) {
	if (l < r) {
		int s = hoarePartition(A, l, r);
		quickSort(A, l, s - 1);
		quickSort(A, s + 1, r);
	}
}
```
---
## 6. Graph Basics
### Definitions
- **Graph:** A structure $$G = (V, E)$$ with:
  - **V (Vertices):** Nodes of the graph.
  - **E (Edges):** Connections between nodes.
- **Types:**
	- **Directed Graph (Digraph):** Edges have a direction.
	- **Undirected Graph:** Edges have no direction.
	- **Weighted Graph:** Edges carry weights (e.g., cost, distance).
- **Key Concepts:**
	- **Path:** A sequence of vertices where each consecutive pair is connected by an edge.
	- **Cycle:** A path that begins and ends at the same vertex.
	- **Connected Graph:** There is a path between every pair of vertices.
	- **DAG:** Directed Acyclic Graph (no cycles).

### Representations
- **Adjacency Matrix:**
	- Uses a $|V| \times |V|$ matrix.
	- **Space Complexity:** $\Theta(|V|^2)$.
	- **Edge Lookup:** $O(1)$ per query.
- **Adjacency List:**
	- An array (or list) where each entry contains a list of adjacent vertices.
	- **Space Complexity:** $\Theta(|V| + |E|)$.
	- Efficient for sparse graphs.
---
## 7. Graph Traversals
### Depth-First Search (DFS)
- **Concept:** Explore as deep as possible along each branch before backtracking.
- **Algorithm (Recursive Approach):**
```c
void DFS(Vertex v) {
	mark v as visited;
	for (each neighbor w of v) {
		if (w is not visited)
			DFS(w);
	}
}
```
- **Properties:**
	- Uses recursion or an explicit stack.
	- **Time Complexity:** $O(|V| + |E|)$ using an adjacency list; $O(V^2)$ with an adjacency matrix.
	- **Applications:** Identifying connected components, cycle detection.
### Breadth-First Search (BFS)
- **Concept:** Visit vertices level by level starting from a source vertex.
- **Algorithm (Iterative Approach):**
```c
void BFS(Vertex start) {
	initialize queue Q;
	mark start as visited;
	enqueue start into Q;
	while (Q is not empty) {
		Vertex v = dequeue(Q);
		for (each neighbor w of v) {
			if (w is not visited) {
				mark w as visited;
				enqueue w;
			}
		}
	}
}
```
- **Properties:**
	- Uses a queue for level-order traversal.
	- **Time Complexity:** $O(|V| + |E|)$ using an adjacency list; $O(V^2)$ with an adjacency matrix.
	- **Applications:** Finding the shortest path in unweighted graphs.
---
## Summary
- **Data Structures:** Fundamental structures (arrays, linked lists, heaps) and graph representations underpin efficient algorithm design.
- **Math in Algorithms:** Sets, factorials, logarithms, summations, and recurrences provide the language for algorithm analysis.
- **Computational Complexity:** Big-O, Big-Omega, and Big-Theta notations quantify performance.
- **Sorting Algorithms:** Quadratic sorts (insertion, bubble) are simple, while divide-and-conquer sorts (merge, quick) offer improved efficiency via the Master Theorem.
- **Graphs:** Understanding definitions, representations, and traversal strategies (DFS/BFS) is crucial for solving real-world problems.