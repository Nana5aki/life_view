/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:06:54
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:28:51
 * @FilePath: \life_view\backend\src\framework\mvvm_manager.cc
 */
#include "mvvm_manager.h"
#include <iostream>
#include <sstream>

MVVMManager* MVVMManager::instance_ = nullptr;

std::shared_ptr<framework::ViewModel> MVVMManager::createViewModel(
  const std::string& viewModelType) {
  // Generate unique ViewId
  std::string viewId = generateViewId(viewModelType);

  // Find factory function
  auto factoryIt = viewModelFactories_.find(viewModelType);
  if (factoryIt == viewModelFactories_.end()) {
    std::cerr << "Unknown ViewModel type: " << viewModelType << std::endl;
    return nullptr;
  }

  // Create ViewModel using factory function
  std::shared_ptr<framework::ViewModel> viewModel = factoryIt->second(viewId);
  if (!viewModel) {
    std::cerr << "Failed to create ViewModel: " << viewModelType << std::endl;
    return nullptr;
  }

  std::cout << "ViewModel created successfully: " << viewId << " (" << viewModelType << ")"
            << std::endl;
  return viewModel;
}

void MVVMManager::registerViewModelFactory(
  const std::string& viewModelType,
  std::function<std::shared_ptr<framework::ViewModel>(const std::string&)> factory) {
  viewModelFactories_[viewModelType] = factory;
  std::cout << "ViewModel factory registered: " << viewModelType << std::endl;
}

std::string MVVMManager::generateViewId(const std::string& viewModelType) {
  std::ostringstream oss;
  oss << viewModelType << "_" << nextViewId_++;
  return oss.str();
}