export interface RAGNode {
  id: string;
  name: string;
  type: 'thread' | 'resource';
  x: number;
  y: number;
}

export interface RAGEdge {
  id: string;
  from: string; // node id
  to: string; // node id
  type: 'request' | 'assignment'; // request: thread -> resource; assignment: resource -> thread
}

export interface DeadlockCycleResult {
  hasDeadlock: boolean;
  cycleNodes: string[];
  cycleEdges: string[];
  visitedNodes: string[];
}

export class DeadlockDetector {
  public static detectCycle(nodes: RAGNode[], edges: RAGEdge[]): DeadlockCycleResult {
    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      const list = adj.get(e.from) || [];
      list.push(e.to);
      adj.set(e.from, list);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];
    const allVisitedNodes: string[] = [];
    let cycleNodes: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);
      allVisitedNodes.push(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          if (dfs(next)) return true;
        } else if (recStack.has(next)) {
          // Cycle found! Extract cycle path
          const cycleStartIndex = path.indexOf(next);
          cycleNodes = path.slice(cycleStartIndex);
          cycleNodes.push(next);
          return true;
        }
      }

      recStack.delete(nodeId);
      path.pop();
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          // Identify matching edges
          const cycleEdges: string[] = [];
          for (let i = 0; i < cycleNodes.length - 1; i++) {
            const u = cycleNodes[i];
            const v = cycleNodes[i + 1];
            const matched = edges.find(e => e.from === u && e.to === v);
            if (matched) cycleEdges.push(matched.id);
          }

          return {
            hasDeadlock: true,
            cycleNodes,
            cycleEdges,
            visitedNodes: allVisitedNodes,
          };
        }
      }
    }

    return {
      hasDeadlock: false,
      cycleNodes: [],
      cycleEdges: [],
      visitedNodes: allVisitedNodes,
    };
  }
}
