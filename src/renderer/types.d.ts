/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 00:42:05
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 15:05:22
 * @FilePath: \life_view\src\renderer\types.d.ts
 */
/// <reference types="react" />
/// <reference types="react-dom" />

/**
 * 计数器ViewModel的属性类型定义
 */
export interface CounterProperties {
  count: number
  message: string
  isEven: boolean
}

/**
 * 计数器ViewModel的操作类型定义
 */
export type CounterActions = 'increment' | 'decrement' | 'reset' | 'addNumber'
