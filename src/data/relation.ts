import {DataBase} from './base'
import {merge, max, sum} from 'lodash'
import {createLog, isRelation, formatNumber, tableListToObjects} from '../utils'
import {
  RelationDataShape as Shape,
  RelationOptions as Options,
  RawRelation,
  Node,
  Edge,
  Meta,
} from '../types'

export class DataRelation extends DataBase<RawRelation, Options> {
  private readonly log = createLog('data:relation')

  private _data: Shape = {nodes: [], edges: [], roots: []}

  get data() {
    return this._data
  }

  constructor(source: RawRelation, options: Options = {}) {
    super(source, options)
    this.update(source)
  }

  update(relation: RawRelation) {
    if (!isRelation(relation)) {
      this.log.error('wrong incoming data', relation)
      return
    }

    const [nodeTableList, edgeTableList] = relation
    this.data.nodes = tableListToObjects(nodeTableList) as Node[]
    this.data.edges = tableListToObjects(edgeTableList) as Edge[]
    this.data.nodes.forEach((item) => merge(item, {children: [], parents: []}))

    if (nodeTableList[0].indexOf('value') === -1 && edgeTableList[0].indexOf('value') !== -1) {
      this.data.nodes.forEach((node) => {
        const from = this.data.edges.filter(({from}) => from === node.id).map(({value}) => value),
          to = this.data.edges.filter(({to}) => to === node.id).map(({value}) => value)
        node.value = formatNumber(max([sum(from), sum(to)])!)
      })
    }

    if (nodeTableList[0].indexOf('level') === -1) {
      this.computeLevel()
    } else {
      this.data.roots = this.data.nodes.filter(({level}) => level === 0).map(({id}) => id)
    }
  }

  private computeLevel() {
    const level: Record<string, number> = {},
      completed: Record<string, boolean> = {}

    this.data.nodes.forEach(({id}) => (completed[id] = false))
    this.data.nodes.forEach(({id}) => (level[id] = -1))

    const findRoot = (id: Meta) => {
      const current = this.data.nodes.find((node) => node.id === id),
        prevIds = this.data.edges.filter(({to}) => to === id).map(({from}) => from)
      if (prevIds.length === 0) {
        !completed[id] && this.data.roots.push(id)
      } else if (current) {
        const parents = prevIds.map((prevId) => this.data.nodes.find((node) => node.id === prevId))
        current.parents?.push(...prevIds)
        parents.forEach((parent) => parent?.children?.push(id))
        prevIds.forEach((prevId) => !completed[prevId] && findRoot(prevId))
      }
      completed[id] = true
    }

    const updateLevel = (id: Meta, parents: Meta[]) => {
      const nextIds = this.data.edges.filter(({from}) => from === id).map(({to}) => to)
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

    this.data.edges.forEach(({to}) => findRoot(to))
    this.data.roots.forEach((root) => updateLevel(root, []))
    this.data.nodes.map((node) => (node.level = level[node.id]))
    this.data.nodes.forEach(({parents, children}, i) => {
      this.data.nodes[i].parents = Array.from(new Set(parents))
      this.data.nodes[i].children = Array.from(new Set(children))
    })
  }

  getNode(id: Meta) {
    return this.data.nodes.find(({id: nodeId}) => nodeId === id)
  }

  getEdge(id: Meta) {
    return this.data.edges.find(({id: edgeId}) => edgeId === id)
  }
}
