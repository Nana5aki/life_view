/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:49:53
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 23:27:36
 * @FilePath: \life_view\src\renderer\components\MultiInstanceDemo.tsx
 */
import CounterView from './CounterView'

const MultiInstanceDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px' }}>
        🚀 MVVM多实例演示
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        <CounterView />
        <CounterView />
        <CounterView />
        <CounterView />
      </div>
    </div>
  )
}

export default MultiInstanceDemo
