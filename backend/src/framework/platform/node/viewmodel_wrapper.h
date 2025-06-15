/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:55:19
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:30:00
 * @FilePath: \life_view\backend\src\framework\platform\node\viewmodel_wrapper.h
 */
#pragma once

#include "framework/mvvm/viewmodel.h"
#include <map>
#include <memory>
#include <napi.h>
#include <string>

namespace framework {

// Napi wrapper for ViewModel to expose it to JavaScript
class ViewModelWrapper : public Napi::ObjectWrap<ViewModelWrapper> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static Napi::FunctionReference constructor;

  ViewModelWrapper(const Napi::CallbackInfo& info);

  void SetViewModel(std::shared_ptr<ViewModel> viewmodel);

private:
  Napi::Value GetProp(const Napi::CallbackInfo& info);
  Napi::Value BindProperty(const Napi::CallbackInfo& info);
  Napi::Value ExcuteCommand(const Napi::CallbackInfo& info);

  std::shared_ptr<ViewModel> viewmodel_;
  std::map<std::string, Napi::FunctionReference> property_changed_callbacks_;
};

}   // namespace framework