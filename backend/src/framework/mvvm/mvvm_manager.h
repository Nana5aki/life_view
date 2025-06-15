/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:57:27
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-14 16:21:29
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

  void registerViewModelFactory(const std::string& viewmodel_type,
                                std::function<std::shared_ptr<framework::ViewModel>()> factory);

private:
  MVVMManager() = default;

private:
  static MVVMManager* instance_;
  std::map<std::string, std::function<std::shared_ptr<framework::ViewModel>()>>
    viewmodel_factories_;
};