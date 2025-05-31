#pragma once

#include "viewmodel.h"
#include <napi.h>
#include <memory>

namespace framework {

// Napi wrapper for ViewModel to expose it to JavaScript
class ViewModelWrapper : public Napi::ObjectWrap<ViewModelWrapper> {
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static Napi::FunctionReference constructor;
  
  ViewModelWrapper(const Napi::CallbackInfo& info);

  // Set ViewModel instance
  void SetViewModel(std::shared_ptr<ViewModel> viewModel);

private:
  // JavaScript exposed methods
  Napi::Value GetViewId(const Napi::CallbackInfo& info);
  Napi::Value SetProp(const Napi::CallbackInfo& info);
  Napi::Value GetProp(const Napi::CallbackInfo& info);
  Napi::Value AddPropertyListener(const Napi::CallbackInfo& info);
  Napi::Value RemovePropertyListeners(const Napi::CallbackInfo& info);
  Napi::Value Action(const Napi::CallbackInfo& info);
  Napi::Value GetState(const Napi::CallbackInfo& info);

  std::shared_ptr<ViewModel> viewModel_;
  Napi::FunctionReference propertyChangedCallback_;
};

}   // namespace framework 