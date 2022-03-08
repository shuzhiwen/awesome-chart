import {useEffect, useRef} from 'react'
import schema from './schema'
import {createChart} from '..'
import styles from './side-bar.module.css'

export function SideBar({onSelect}) {
  const ref = useRef(null)

  useEffect(() => {
    const refresh = () => {
      createChart({
        container: ref.current,
        layers: [
          {
            type: 'tabMenu',
            options: {
              id: 'tabMenu',
              layout: 'main',
            },
            data: schema,
            style: {
              text: {
                padding: '10px 0',
                height: '30px',
                width: '100%',
              },
              group: {
                width: ['120px', '180px'],
                height: ['auto', 'fit-content'],
                backgroundColor: 'whitesmoke',
                boxSizing: 'border-box',
                border: 'solid lightgray 1px',
              },
            },
            event: {
              'click-tab': (d) => {
                if (d.node.data.code) {
                  onSelect(d.node.data)
                  refresh()
                }
              },
            },
          },
        ],
      })
    }
    refresh()
  }, [])

  return (
    <div className={styles.sideContainer}>
      <div ref={ref} className={styles.menu} />
    </div>
  )
}
