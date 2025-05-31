/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 19:20:15
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:24:52
 * @FilePath: \life_view\backend\src\framework\mvvm_manager.h
 */
#pragma once

#include "viewmodel.h"
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

  // 注册ViewModel
  void registerViewModel(const std::string& name, std::shared_ptr<framework::ViewModel> viewModel);

  // 获取ViewModel
  std::shared_ptr<framework::ViewModel> getViewModel(const std::string& name);

  // 设置属性变化回调（前端JS函数）
  void setPropertyChangedCallback(const Napi::CallbackInfo& info);

  // 执行ViewModel的Action
  Napi::Value executeViewModelAction(const Napi::CallbackInfo& info);

  // 获取ViewModel状态
  Napi::Object getViewModelState(const Napi::CallbackInfo& info);

  // 获取所有ViewModels信息
  Napi::Object getAllViewModels(const Napi::CallbackInfo& info);

private:
  MVVMManager() = default;

  // 通知前端属性变化
  void notifyPropertyChanged(const std::string& viewModelName, const std::string& propertyName,
                             const std::any& newValue);

private:
  static MVVMManager* instance_;
  std::map<std::string, std::shared_ptr<framework::ViewModel>> viewModels_;
  Napi::Function propeChangedCallback_;
  bool callbackSet_ = false;
  bool envSet_ = false;
};

// 导出的C++接口函数
Napi::Object InitMVVM(Napi::Env env, Napi::Object exports);