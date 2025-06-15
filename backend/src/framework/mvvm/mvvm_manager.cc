/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:06:54
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-14 16:22:31
 * @FilePath: \life_view\backend\src\framework\mvvm\mvvm_manager.cc
 */
#include "mvvm_manager.h"
#include <iostream>
#include <sstream>

MVVMManager* MVVMManager::instance_ = nullptr;

std::shared_ptr<framework::ViewModel> MVVMManager::createViewModel(
  const std::string& viewmodel_type) {

  // Find factory function
  auto factory_it = viewmodel_factories_.find(viewmodel_type);
  if (factory_it == viewmodel_factories_.end()) {
    std::cerr << "Unknown ViewModel type: " << viewmodel_type << std::endl;
    return nullptr;
  }

  // Create ViewModel using factory function
  std::shared_ptr<framework::ViewModel> viewmodel = factory_it->second();
  if (!viewmodel) {
    std::cerr << "Failed to create ViewModel: " << viewmodel_type << std::endl;
    return nullptr;
  }
  return viewmodel;
}

void MVVMManager::registerViewModelFactory(
  const std::string& viewmodel_type,
  std::function<std::shared_ptr<framework::ViewModel>()> factory) {
  viewmodel_factories_[viewmodel_type] = factory;
  std::cout << "ViewModel factory registered: " << viewmodel_type << std::endl;
}