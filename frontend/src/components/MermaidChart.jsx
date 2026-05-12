import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

export default function MermaidChart({ chart }) {

  const ref = useRef(null)

  useEffect(() => {

    if (!chart || !ref.current) return

    const renderChart = async () => {

      try {

        const id = `mermaid-${Date.now()}`

        const { svg } = await mermaid.render(
          id,
          chart
        )

        ref.current.innerHTML = svg

      } catch (err) {

        ref.current.innerHTML =
          '<p>Failed to render diagram</p>'

      }
    }

    renderChart()

  }, [chart])

  return (
    <div
      ref={ref}
      style={{
        background: 'white',
        padding: 20,
        borderRadius: 16,
        overflowX: 'auto',
      }}
    />
  )
}