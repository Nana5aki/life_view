/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:37:22
 * @FilePath: \life_view\backend\src\counter_example.cc
 */
#include "counter_example.h"
#include <iostream>

namespace counter_example {

void InitCounterExample() {
  // 创建CounterViewModel实例
  auto counterViewModel = std::make_shared<CounterViewModel>();

  // 注册到MVVM管理器
  MVVMManager::getInstance()->registerViewModel("counter", counterViewModel);

  std::cout << "Counter example initialized successfully!" << std::endl;
}

}   // namespace counter_example