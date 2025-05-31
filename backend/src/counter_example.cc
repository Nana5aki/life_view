/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 01:13:03
 * @FilePath: \life_view\backend\src\counter_example.cc
 */
#include "counter_example.h"
#include <iostream>

namespace counter_example {

std::shared_ptr<framework::ViewModel> CreateCounterViewModel(const std::string& viewId) {
  auto viewModel = std::make_shared<CounterViewModel>(viewId);
  return viewModel;
}

void InitCounterExample() {
  // Register CounterViewModel factory function to MVVMManager
  MVVMManager::getInstance()->registerViewModelFactory("counter", CreateCounterViewModel);

  std::cout << "Counter example initialized successfully" << std::endl;
}

}   // namespace counter_example