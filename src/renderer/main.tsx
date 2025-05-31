/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 00:33:38
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:43:04
 * @FilePath: \life_view\src\renderer\main.tsx
 */
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container missing in index.html')
}

const root = createRoot(container)
root.render(<App />) 