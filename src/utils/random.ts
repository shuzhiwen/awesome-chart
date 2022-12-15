import {sample} from 'lodash'
import {range, sum, randomNormal, randomPoisson, group} from 'd3'
import {
  RawTable,
  RandomTableListOptions,
  RawTableList,
  RawRelation,
  RandomRelationOptions,
  RandomNumberOptions,
  Node,
  Edge,
} from '../types'

const mapping = {
  normal: ({mu, sigma}: RandomNumberOptions) => randomNormal(mu, sigma),
  poisson: ({lambda = 1}: RandomNumberOptions) => randomPoisson(lambda),
}

const toFixed = (number: number, decimals: number) => {
  return Math.round(number / 10 ** -decimals) / 10 ** decimals
}

const createNumberGenerator = (options: RandomNumberOptions) => () =>
  toFixed(mapping[options.mode](options)(), options.decimals || 0)

export const randomTableList = (options: RandomTableListOptions): RawTableList => {
  const {row, column, sort} = options
  const createNumber = createNumberGenerator(options)
  const numbers = range(row * column).map(createNumber)
  sort && numbers.sort((a, b) => (sort === 'asc' ? a - b : b - a))
  const headers = ['dimension'].concat(range(column).map((i) => `Class${i + 1}`))
  const lists = range(row).map((_, i) => [
    `Item${i + 1}`,
    ...numbers.slice(i * column, (i + 1) * column),
  ])
  return [headers, ...lists]
}

export const randomTable = (options: RandomTableListOptions): RawTable => {
  const {row, column, sort} = options
  const createNumber = createNumberGenerator(options)
  const numbers = range(row).map(() => {
    const groupNumbers = range(column).map(createNumber)
    sort && groupNumbers.sort((a, b) => (sort === 'asc' ? a - b : b - a))
    return groupNumbers
  })
  sort && numbers.sort((a, b) => (sort === 'asc' ? sum(a) - sum(b) : sum(b) - sum(a)))
  const rows = range(row).map((_, i) => `Row${i + 1}`)
  const columns = range(column).map((_, i) => `Column${i + 1}`)
  return [rows, columns, numbers]
}

export const randomRelation = (options: RandomRelationOptions): RawRelation => {
  const {node, density, level} = options
  const createNumber = createNumberGenerator(options)
  const nodeIds = range(0, node).map(() => uuid())
  const nodes: Node[] = nodeIds
    .map((id) => ({id, value: createNumber(), level: Math.floor(Math.random() * level)}))
    .sort((a, b) => a.level! - b.level!)
    .map((node, i) => ({...node, name: `Node${i + 1}`}))
  const groupedNodes = group(nodes, ({level}) => level)
  const edges: Edge[] = []
  range(0, level).reduce((prev, next) => {
    const prevNodes = groupedNodes.get(prev) ?? []
    const nextNodes = groupedNodes.get(next) ?? []
    prevNodes.forEach(({id: from}) => {
      nextNodes.forEach(({id: to}) => {
        if (Math.random() < density) {
          edges.push({id: uuid(), from, to, value: createNumber() / 5})
        }
      })
    })
    return next
  }, -1)
  return [
    [['id', 'name', 'value', 'level'] as Meta[]].concat(
      nodes.map(({id, name, value, level}) => [id, name, value!, level!])
    ),
    [['id', 'from', 'to', 'value'] as Meta[]].concat(
      edges.map(({id, from, to, value}) => [id, from, to, value!])
    ),
  ]
}

export function uuid(
  length = 16,
  collection = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789'
) {
  let string = ''
  for (let i = 0; i < length; i++) string += sample(collection)
  return string
}
