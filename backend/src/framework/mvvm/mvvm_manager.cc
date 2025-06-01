/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:06:54
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 16:20:27
 * @FilePath: \life_view\backend\src\framework\mvvm\mvvm_manager.cc
 */
#include "mvvm_manager.h"
#include <iostream>
#include <sstream>

MVVMManager* MVVMManager::instance_ = nullptr;

std::shared_ptr<framework::ViewModel> MVVMManager::createViewModel(
  const std::string& viewmodel_type) {
  // Generate unique ViewId
  std::string view_id = generateViewId(viewmodel_type);

  // Find factory function
  auto factory_it = viewmodel_factories_.find(viewmodel_type);
  if (factory_it == viewmodel_factories_.end()) {
    std::cerr << "Unknown ViewModel type: " << viewmodel_type << std::endl;
    return nullptr;
  }

  // Create ViewModel using factory function
  std::shared_ptr<framework::ViewModel> viewmodel = factory_it->second(view_id);
  if (!viewmodel) {
    std::cerr << "Failed to create ViewModel: " << viewmodel_type << std::endl;
    return nullptr;
  }

  std::cout << "ViewModel created successfully: " << view_id << " (" << viewmodel_type << ")"
            << std::endl;
  return viewmodel;
}

void MVVMManager::registerViewModelFactory(
  const std::string& viewModelType,
  std::function<std::shared_ptr<framework::ViewModel>(const std::string&)> factory) {
  viewmodel_factories_[viewModelType] = factory;
  std::cout << "ViewModel factory registered: " << viewModelType << std::endl;
}

std::string MVVMManager::generateViewId(const std::string& viewmodel_type) {
  std::ostringstream oss;
  oss << viewmodel_type << "_" << next_view_id_++;
  return oss.str();
}