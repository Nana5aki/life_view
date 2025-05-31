#include "counter_example.h"
#include "framework/mvvm_manager.h"
#include "framework/viewmodel_wrapper.h"
#include <napi.h>
#include <iostream>

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

  // Create and return wrapper
  auto wrapper = framework::ViewModelWrapper::constructor.New({});
  framework::ViewModelWrapper* wrapperInstance = framework::ViewModelWrapper::Unwrap(wrapper);
  wrapperInstance->SetViewModel(viewModel);

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