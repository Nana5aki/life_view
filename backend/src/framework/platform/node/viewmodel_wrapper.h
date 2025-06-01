/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:55:19
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 18:06:15
 * @FilePath: \life_view\backend\src\framework\platform\node\viewmodel_wrapper.h
 */
#pragma once

#include "framework/mvvm/viewmodel.h"
#include <memory>
#include <napi.h>

namespace framework {

// Napi wrapper for ViewModel to expose it to JavaScript
class ViewModelWrapper : public Napi::ObjectWrap<ViewModelWrapper> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static Napi::FunctionReference constructor;

  ViewModelWrapper(const Napi::CallbackInfo& info);

  void SetViewModel(std::shared_ptr<ViewModel> viewModel, const std::string& viewId);

private:
  Napi::Value GetProp(const Napi::CallbackInfo& info);
  Napi::Value AddPropertyListener(const Napi::CallbackInfo& info);
  Napi::Value Action(const Napi::CallbackInfo& info);
  Napi::Value GetViewId(const Napi::CallbackInfo& info);
  Napi::Value GetState(const Napi::CallbackInfo& info);

  std::shared_ptr<ViewModel> viewmodel_;
  std::string view_id_;
  Napi::FunctionReference property_changed_callback_;
};

}   // namespace framework