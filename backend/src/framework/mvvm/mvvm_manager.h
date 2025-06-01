/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:57:27
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 16:18:31
 * @FilePath: \life_view\backend\src\framework\mvvm\mvvm_manager.h
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

  std::shared_ptr<framework::ViewModel> createViewModel(const std::string& viewmodel_type);

  void registerViewModelFactory(
    const std::string& viewmodel_type,
    std::function<std::shared_ptr<framework::ViewModel>(const std::string&)> factory);

private:
  MVVMManager() = default;

  std::string generateViewId(const std::string& viewmodel_type);

private:
  static MVVMManager* instance_;
  std::map<std::string, std::function<std::shared_ptr<framework::ViewModel>(const std::string&)>>
    viewmodel_factories_;
  int next_view_id_ = 1;
};