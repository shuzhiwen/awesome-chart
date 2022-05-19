import {DataBase} from './base'
import {merge, max, sum} from 'lodash'
import {isRelation, formatNumber, tableListToObjects} from '../utils'
import {
  RelationDataShape as Shape,
  RelationOptions as Options,
  RawRelation,
  Node,
  Edge,
} from '../types'

export class DataRelation extends DataBase<RawRelation, Options> {
  private _data: Shape = {nodes: [], edges: [], roots: []}

  get nodes() {
    return this._data.nodes
  }

  get edges() {
    return this._data.edges
  }

  get roots() {
    return this._data.roots
  }

  constructor(source: RawRelation, options: Options = {}) {
    super(source, options)
    this.update(source)
  }

  update(relation: RawRelation) {
    if (!isRelation(relation)) {
      this.log.error('Illegal data', relation)
      return
    }

    const [nodeTableList, edgeTableList] = relation
    this._data.nodes = tableListToObjects(nodeTableList) as Node[]
    this._data.edges = tableListToObjects(edgeTableList) as Edge[]
    this.nodes.forEach((node) => merge(node, {children: [], parents: []}))

    if (nodeTableList[0].indexOf('value') === -1 && edgeTableList[0].indexOf('value') !== -1) {
      this.nodes.forEach((node) => {
        const from = this.edges.filter(({from}) => from === node.id).map(({value}) => value),
          to = this.edges.filter(({to}) => to === node.id).map(({value}) => value)
        node.value = Number(formatNumber(max([sum(from), sum(to)])!))
      })
    }

    if (nodeTableList[0].indexOf('level') === -1) {
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

    const findRoot = (id: Meta) => {
      const current = this.nodes.find((node) => node.id === id),
        prevIds = this.edges.filter(({to}) => to === id).map(({from}) => from)
      if (prevIds.length === 0) {
        !completed[id] && this.roots.push(id)
      } else if (current) {
        const parents = prevIds.map((prevId) => this.nodes.find((node) => node.id === prevId))
        current.parents?.push(...prevIds.map((id) => this.getNode(id)!))
        parents.forEach((parent) => parent?.children?.push(this.getNode(id)!))
        prevIds.forEach((prevId) => !completed[prevId] && findRoot(prevId))
      }
      completed[id] = true
    }

    const updateLevel = (id: Meta, parents: Meta[]) => {
      const nextIds = this.edges.filter(({from}) => from === id).map(({to}) => to)
      if (level[id] === -1) {
        parents.push(id)
        level[id] = 0
      }
      nextIds.forEach((nextId) => {
        if (level[nextId] === -1) {
          level[nextId] = level[id] + 1
        } else if (level[nextId] - level[id] !== 1) {
          // update all ancestor nodes of the child node when different
          parents.map((prevId) => (level[prevId] += level[nextId] - level[id] - 1))
        }
        updateLevel(nextId, parents)
      })
    }

    this.edges.forEach(({to}) => findRoot(to))
    this.roots.forEach((root) => updateLevel(root, []))
    this.nodes.map((node) => (node.level = level[node.id]))
    this.nodes.forEach(({parents, children}, i) => {
      this.nodes[i].parents = Array.from(new Set(parents))
      this.nodes[i].children = Array.from(new Set(children))
    })
  }

  getNode(id: Meta) {
    return this.nodes.find(({id: nodeId}) => nodeId === id)
  }

  getEdge(id: Meta) {
    return this.edges.find(({id: edgeId}) => edgeId === id)
  }
}
