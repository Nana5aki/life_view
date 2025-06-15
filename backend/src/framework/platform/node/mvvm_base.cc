/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:20:15
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 16:53:49
 * @FilePath: \life_view\backend\src\framework\platform\node\mvvm_base.cc
 */
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

  // 检查constructor是否已经初始化
  if (framework::ViewModelWrapper::constructor.IsEmpty()) {
    std::cout << "ViewModelWrapper constructor is not initialized!" << std::endl;
    Napi::Error::New(env, "ViewModelWrapper constructor not initialized")
      .ThrowAsJavaScriptException();
    return env.Undefined();
  }


  std::cout << "Creating wrapper instance with constructor..." << std::endl;
  auto wrapper = framework::ViewModelWrapper::constructor.New({});
  std::cout << "Wrapper instance created, unwrapping..." << std::endl;

  framework::ViewModelWrapper* wrapperInstance = framework::ViewModelWrapper::Unwrap(wrapper);
  if (!wrapperInstance) {
    std::cout << "Failed to unwrap ViewModelWrapper instance!" << std::endl;
    Napi::Error::New(env, "Failed to unwrap ViewModelWrapper instance")
      .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::cout << "Setting ViewModel on wrapper instance..." << std::endl;
  wrapperInstance->SetViewModel(viewModel);

  std::cout << "Wrapper created and ViewModel set, returning to JavaScript" << std::endl;
  return wrapper;
}

// Module initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {

  // Initialize ViewModel wrapper class
  framework::ViewModelWrapper::Init(env, exports);
  // Export MVVM functions
  exports.Set("createViewModel", Napi::Function::New(env, CreateViewModel));

  return exports;
}

NODE_API_MODULE(mvvm, Init)