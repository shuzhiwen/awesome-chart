import {DataBase} from './base'
import {merge, max, sum} from 'lodash'
import {isRawRelation, formatNumber, tableListToObjects} from '../utils'
import {RelationData, RawRelation, Node, Edge} from '../types'

export class DataRelation extends DataBase<RawRelation> {
  private nodeMap: Map<Meta, Node> = new Map()

  private edgeMap: Map<Meta, Edge> = new Map()

  private _data: RelationData = {nodes: [], edges: [], roots: []}

  get nodes() {
    return this._data.nodes
  }

  get edges() {
    return this._data.edges
  }

  get roots() {
    return this._data.roots
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
        const from = this.edges.filter(({from}) => from === node.id).map(({value}) => value),
          to = this.edges.filter(({to}) => to === node.id).map(({value}) => value)
        node.value = Number(formatNumber(max([sum(from), sum(to)])!))
      })
    }

    if (!nodeData[0].includes('level')) {
      this.computeLevel()
    } else {
      this._data.roots = this.nodes.filter(({level}) => level === 0).map(({id}) => id)
    }
  }

  private computeLevel() {
    const level: Record<string, number> = {},
      completed: Record<string, boolean> = {}

    this.nodes.forEach(({id}) => (completed[id] = false))
    this.nodes.forEach(({id}) => (level[id] = -1))

    const generateLink = (id: Meta) => {
      const current = this.getNode(id)!,
        prevIds = this.edges.filter(({to}) => to === id).map(({from}) => from),
        parents = prevIds.map((prevId) => this.getNode(prevId)!)

      if (prevIds.length === 0) {
        !completed[id] && this.roots.push(id)
      } else if (current) {
        current.parents?.push(...parents)
        parents.forEach((parent) => parent?.children?.push(current))
        prevIds.forEach((prevId) => !completed[prevId] && generateLink(prevId))
      }

      completed[id] = true
    }

    const generateLevel = (id: Meta, parents: Meta[]) => {
      if (level[id] === -1) {
        parents.push(id)
        level[id] = 0
      }

      this.edges
        .filter(({from}) => from === id)
        .forEach(({to: nextId}) => {
          if (level[nextId] === -1) {
            level[nextId] = level[id] + 1
          } else if (level[nextId] - level[id] !== 1) {
            // update all ancestor nodes of the child node when different
            parents.map((prevId) => (level[prevId] += level[nextId] - level[id] - 1))
          }
          generateLevel(nextId, parents)
        })
    }

    this.edges.forEach(({to}) => generateLink(to))
    this.roots.forEach((root) => generateLevel(root, []))
    this.nodes.map((node) => (node.level = level[node.id] === -1 ? 0 : level[node.id]))
    this.nodes.forEach(({parents, children}, i) => {
      this.nodes[i].parents = Array.from(new Set(parents))
      this.nodes[i].children = Array.from(new Set(children))
    })
  }
}
