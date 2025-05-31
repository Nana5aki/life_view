/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:57:27
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 23:58:45
 * @FilePath: \life_view\backend\src\framework\mvvm_manager.h
 */
#pragma once

#include "viewmodel.h"
#include <functional>
#include <map>
#include <memory>
#include <napi.h>

class MVVMManager {
public:
  static MVVMManager* getInstance() {
    if (instance_ == nullptr) {
      instance_ = new MVVMManager();
    }
    return instance_;
  }

  // Create new ViewModel instance and return it directly
  std::shared_ptr<framework::ViewModel> createViewModel(const std::string& viewModelType);

  // Register ViewModel factory function
  void registerViewModelFactory(
    const std::string& viewModelType,
    std::function<std::shared_ptr<framework::ViewModel>(const std::string&)> factory);

private:
  MVVMManager() = default;

  // Generate unique ViewId
  std::string generateViewId(const std::string& viewModelType);

private:
  static MVVMManager* instance_;
  // ViewModel factory function mapping
  std::map<std::string, std::function<std::shared_ptr<framework::ViewModel>(const std::string&)>>
    viewModelFactories_;
  int nextViewId_ = 1;   // For generating unique ViewId
};