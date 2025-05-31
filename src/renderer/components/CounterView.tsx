import React, { useEffect } from 'react'
import { useMVVM } from '../hooks/useMVVM'

const CounterView: React.FC = () => {
  const { isReady, error, properties, viewId, addPropertyListener, executeAction, getProp } =
    useMVVM('counter')

  // Setup property listeners when ViewModel is ready
  useEffect(() => {
    if (isReady) {
      // Listen to all counter properties
      addPropertyListener('count')
      addPropertyListener('message')
      addPropertyListener('isEven')
    }
  }, [isReady, addPropertyListener])

  // Handle actions
  const handleIncrement = (): Promise<unknown> => executeAction('increment')
  const handleDecrement = (): Promise<unknown> => executeAction('decrement')
  const handleReset = (): Promise<unknown> => executeAction('reset')
  const handleSetMessage = (): Promise<unknown> =>
    executeAction('setMessage', 'Hello from new MVVM!')
  const handleAddNumber = (): Promise<unknown> => executeAction('addNumber', 5)

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading ViewModel...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>MVVM Counter Demo</h1>

      {/* ViewModel Info */}
      <div
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3>ViewModel Info</h3>
        <p>
          <strong>View ID:</strong> {viewId}
        </p>
        <p>
          <strong>Status:</strong> Ready ✅
        </p>
      </div>

      {/* Counter Display */}
      <div
        style={{
          background: '#e3f2fd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <h2>Count: {getProp('count') ?? 0}</h2>
        <p>Message: {getProp('message') ?? 'Loading...'}</p>
        <p>Is Even: {getProp('isEven') ? 'Yes' : 'No'}</p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <button
          onClick={handleIncrement}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Increment
        </button>
        <button
          onClick={handleDecrement}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Decrement
        </button>
        <button
          onClick={handleReset}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Reset
        </button>
        <button
          onClick={handleSetMessage}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Set Message
        </button>
        <button
          onClick={handleAddNumber}
          style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}
        >
          Add 5
        </button>
      </div>

      {/* Properties Debug Info */}
      <div
        style={{
          background: '#f9f9f9',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      >
        <h3>Properties (Debug)</h3>
        <pre>{JSON.stringify(properties, null, 2)}</pre>
      </div>
    </div>
  )
}

export default CounterView
