/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:20:15
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 18:03:29
 * @FilePath: \life_view\backend\src\mvvm_base.cc
 */
#include "counter_example.h"
#include "framework/mvvm/mvvm_manager.h"
#include "framework/platform/node/viewmodel_wrapper.h"
#include <iostream>
#include <napi.h>
#include <sstream>

// Create ViewModel and return wrapper instance
Napi::Value CreateViewModel(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "ViewModel type expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string viewModelType = info[0].As<Napi::String>().Utf8Value();
  std::cout << "CreateViewModel called with type: " << viewModelType << std::endl;

  // Create ViewModel instance
  auto viewModel = MVVMManager::getInstance()->createViewModel(viewModelType);
  if (!viewModel) {
    std::cout << "Failed to create ViewModel instance" << std::endl;
    Napi::Error::New(env, "Failed to create ViewModel").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::cout << "ViewModel instance created successfully, creating wrapper..." << std::endl;

  // 生成viewId（由于ViewModel构造函数已经设置了view_id_，我们需要访问它）
  // 但由于我们不能添加getViewId接口，我们需要从MVVMManager获取viewId
  // 这里我们使用一个临时方案：重新生成相同的viewId
  static int next_view_id = 1;
  std::ostringstream oss;
  oss << viewModelType << "_" << next_view_id++;
  std::string viewId = oss.str();

  // Create and return wrapper
  auto wrapper = framework::ViewModelWrapper::constructor.New({});
  framework::ViewModelWrapper* wrapperInstance = framework::ViewModelWrapper::Unwrap(wrapper);
  wrapperInstance->SetViewModel(viewModel, viewId);

  std::cout << "Wrapper created and ViewModel set, returning to JavaScript" << std::endl;
  return wrapper;
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  // Initialize counter example
  counter_example::InitCounterExample();

  // Initialize ViewModel wrapper class
  framework::ViewModelWrapper::Init(env, exports);

  // Export MVVM functions
  exports.Set("createViewModel", Napi::Function::New(env, CreateViewModel));

  return exports;
}

NODE_API_MODULE(mvvm, Init)