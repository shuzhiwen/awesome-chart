import {group} from 'd3'
import {get, max, merge, sum} from 'lodash'
import {Edge, Node, RawRelation, RelationData} from '../types'
import {formatNumber, isRawRelation, tableListToObjects} from '../utils'
import {DataBase} from './base'

export class DataRelation extends DataBase<RawRelation> {
  private nodeMap: Map<Meta, Node> = new Map()

  private edgeMap: Map<Meta, Edge> = new Map()

  private _data: RelationData = {nodes: [], edges: [], roots: []}

  /**
   * Node data in the relationship graph.
   */
  get nodes() {
    return this._data.nodes
  }

  /**
   * Edge data in the relationship graph.
   */
  get edges() {
    return this._data.edges
  }

  /**
   * Start node data in DAG.
   */
  get roots() {
    return this._data.roots
  }

  /**
   * Node groups by level.
   */
  get nodeGroups() {
    return Array.from(group(this.nodes, ({level}) => level).values()).sort(
      (a, b) => (get(a, '0.level') ?? 0) - (get(b, '0.level') ?? 0)
    )
  }

  getNode(id: Meta) {
    return this.nodeMap.get(id)
  }

  getEdge(id: Meta) {
    return this.edgeMap.get(id)
  }

  constructor(source: RawRelation) {
    super(source)
    this.update(source)
  }

  /**
   * Construct discrete node data and edge data into a graph.
   * @param relation
   * Discrete node data and edge data.
   */
  update(relation: RawRelation) {
    if (!isRawRelation(relation)) {
      throw new Error('Illegal data')
    }

    const [nodeData, edgeData] = relation

    this._data.nodes = tableListToObjects(nodeData) as Node[]
    this._data.edges = tableListToObjects(edgeData) as Edge[]
    this.nodes.forEach((node) => merge(node, {children: [], parents: []}))
    this.nodes.forEach((node) => this.nodeMap.set(node.id, node))
    this.edges.forEach((edge) => this.edgeMap.set(edge.id, edge))

    if (!nodeData[0].includes('value') && edgeData[0].includes('value')) {
      this.nodes.forEach((node) => {
        const from = this.edges
          .filter(({from}) => from === node.id)
          .map(({value}) => value)
        const to = this.edges
          .filter(({to}) => to === node.id)
          .map(({value}) => value)
        node.value = Number(formatNumber(max([sum(from), sum(to)])))
      })
    }

    if (!nodeData[0].includes('level')) {
      this.preprocessNodeLevel()
    } else {
      this._data.roots = this.nodes
        .filter(({level}) => level === 0)
        .map(({id}) => id)
    }
  }

  private computeLevel = (
    id: Meta,
    parents: Meta[],
    level: Record<string, number>
  ) => {
    if (level[id] === -1) {
      parents.push(id)
      level[id] = 0
    }

    const nextNodeIds = this.edges
      .filter(({from}) => from === id)
      .map(({to}) => to)

    nextNodeIds.forEach((nextId) => {
      if (level[nextId] === -1) {
        level[nextId] = level[id] + 1
      } else if (level[nextId] - level[id] !== 1) {
        parents.map((prevId) => {
          // backtracking and rebuilding hierarchies
          return (level[prevId] += level[nextId] - level[id] - 1)
        })
      }
      this.computeLevel(nextId, parents, level)
    })
  }

  private preprocessNodeLevel() {
    const level: Record<string, number> = {}
    const completed: Record<string, boolean> = {}

    this.nodes.forEach(({id}) => (completed[id] = false))
    this.nodes.forEach(({id}) => (level[id] = -1))

    const generateLink = (id: Meta) => {
      const current = this.getNode(id),
        prevIds = this.edges.filter(({to}) => to === id).map(({from}) => from),
        parents = prevIds.map((prevId) => this.getNode(prevId)!)

      if (prevIds.length === 0) {
        !completed[id] && this.roots.push(id)
      } else if (current) {
        current.parents?.push(...parents)
        parents.forEach((parent) => parent.children?.push(current))
        prevIds.forEach((prevId) => !completed[prevId] && generateLink(prevId))
      }

      completed[id] = true
    }

    this.edges.forEach(({to}) => generateLink(to))
    this.roots.forEach((root) => this.computeLevel(root, [], level))
    this.nodes.map(
      (node) => (node.level = level[node.id] === -1 ? 0 : level[node.id])
    )
    this.nodes.forEach(({parents, children}, i) => {
      this.nodes[i].parents = Array.from(new Set(parents))
      this.nodes[i].children = Array.from(new Set(children))
    })
  }
}
