import {DataBase} from './base'
import {merge, max, sum} from 'lodash'
import {createLog, isRelation, formatNumber, tableListToObjects, createEvent} from '../utils'
import {
  RawRelation as Input,
  RelationDataShape as Shape,
  RelationOptions as Options,
  Node,
  Edge,
  Meta,
  RawRelation,
} from '../types'

export class Relation extends DataBase<RawRelation, Options> {
  readonly log = createLog('data:relation')

  readonly event = createEvent('data:relation')

  private _data: Shape = {nodes: [], edges: [], roots: []}

  get data() {
    return this._data
  }

  constructor(relation: Input, options: Options = {}) {
    super({source: relation, options})
    this.update(relation)
  }

  update(relation: Input) {
    if (!isRelation(relation)) {
      this.log.error('wrong incoming data', relation)
    } else {
      const [nodeTableList, edgeTableList] = relation
      // nodes data
      this.data.nodes = tableListToObjects(nodeTableList) as Node[]
      this.data.edges = tableListToObjects(edgeTableList) as Edge[]
      this.data.nodes.forEach((item) => merge(item, {children: [], parents: []}))
      // if nodes has no data, then find from edges
      if (nodeTableList[0].indexOf('value') === -1 && edgeTableList[0].indexOf('value') !== -1) {
        this.data.nodes.forEach((node) => {
          const from = this.data.edges.filter(({from}) => from === node.id).map(({value}) => value)
          const to = this.data.edges.filter(({to}) => to === node.id).map(({value}) => value)
          node.value = formatNumber(max([sum(from), sum(to)])!)
        })
      }
      // derived data
      if (nodeTableList[0].indexOf('level') === -1) {
        this.computeLevel()
      } else {
        this.data.roots = this.data.nodes.filter(({level}) => level === 0).map(({id}) => id)
      }
    }
  }

  private computeLevel() {
    const level: Record<string, number> = {}
    const completed: Record<string, boolean> = {}
    this.data.nodes.forEach(({id}) => (completed[id] = false))
    this.data.nodes.forEach(({id}) => (level[id] = -1))

    // find the root node of the current node
    const findRoot = (id: Meta) => {
      const current = this.data.nodes.find((node) => node.id === id)
      const prevIds = this.data.edges.filter(({to}) => to === id).map(({from}) => from)
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

    // calculate level of the current node
    const updateLevel = (id: Meta, parents: Meta[]) => {
      const nextIds = this.data.edges.filter(({from}) => from === id).map(({to}) => to)
      // initialize level
      if (level[id] === -1) {
        parents.push(id)
        level[id] = 0
      }
      // update based on edge
      if (nextIds.length) {
        nextIds.forEach((nextId) => {
          if (level[nextId] === -1) {
            level[nextId] = level[id] + 1
          } else if (level[nextId] - level[id] !== 1) {
            // update all ancestor nodes of the child node when different
            parents.map((prevId) => (level[prevId] += level[nextId] - level[id] - 1))
          }
          // recursive calculation
          updateLevel(nextId, parents)
        })
      }
    }

    this.data.edges.forEach(({to}) => findRoot(to))
    this.data.roots.forEach((root) => updateLevel(root, []))
    this.data.nodes.map((node) => (node.level = level[node.id]))
    // clean redundant nodes
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
