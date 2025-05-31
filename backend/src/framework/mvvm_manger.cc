/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 19:20:22
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:25:04
 * @FilePath: \life_view\backend\src\framework\mvvm_manger.cc
 */
#include "mvvm_manager.h"
#include <iostream>

void MVVMManager::registerViewModel(const std::string& name,
                                    std::shared_ptr<framework::ViewModel> viewModel) {
  viewModels_[name] = viewModel;

  // 为每个ViewModel添加属性变化监听器
  viewModel->AddPropertyChangedListener(
    [this, name](const std::string& propertyName, const std::any& newValue) {
      this->notifyPropertyChanged(name, propertyName, newValue);
    });
}

std::shared_ptr<framework::ViewModel> MVVMManager::getViewModel(const std::string& name) {
  auto it = viewModels_.find(name);
  if (it != viewModels_.end()) {
    return it->second;
  }
  return nullptr;
}

void MVVMManager::setPropertyChangedCallback(const Napi::CallbackInfo& info) {
  if (info.Length() < 1 || !info[0].IsFunction()) {
    Napi::TypeError::New(info.Env(), "Function expected").ThrowAsJavaScriptException();
    return;
  }

  propeChangedCallback_ = info[0].As<Napi::Function>();
  callbackSet_ = true;
  envSet_ = true;
}

Napi::Value MVVMManager::executeViewModelAction(const Napi::CallbackInfo& info) {
  if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
    Napi::TypeError::New(info.Env(), "viewModelName(string) and actionName(string) expected")
      .ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }

  std::string viewModelName = info[0].As<Napi::String>().Utf8Value();
  std::string actionName = info[1].As<Napi::String>().Utf8Value();

  auto viewModel = getViewModel(viewModelName);
  if (!viewModel) {
    Napi::TypeError::New(info.Env(), "ViewModel not found: " + viewModelName)
      .ThrowAsJavaScriptException();
    return info.Env().Undefined();
  }

  // 创建新的CallbackInfo，去掉前两个参数
  std::vector<napi_value> args;
  for (size_t i = 2; i < info.Length(); ++i) {
    args.push_back(info[i]);
  }

  // 由于N-API限制，我们需要手动构造CallbackInfo
  // 这里简化处理，直接调用executeAction
  return viewModel->Action(actionName, info);
}

Napi::Object MVVMManager::getViewModelState(const Napi::CallbackInfo& info) {
  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(info.Env(), "viewModelName(string) expected").ThrowAsJavaScriptException();
    return Napi::Object::New(info.Env());
  }

  std::string viewModelName = info[0].As<Napi::String>().Utf8Value();
  auto viewModel = getViewModel(viewModelName);

  if (!viewModel) {
    Napi::TypeError::New(info.Env(), "ViewModel not found: " + viewModelName)
      .ThrowAsJavaScriptException();
    return Napi::Object::New(info.Env());
  }

  return viewModel->GetState(info.Env());
}

Napi::Object MVVMManager::getAllViewModels(const Napi::CallbackInfo& info) {
  Napi::Object result = Napi::Object::New(info.Env());

  for (const auto& [name, viewModel] : viewModels_) {
    result.Set(name, viewModel->GetState(info.Env()));
  }

  return result;
}

void MVVMManager::notifyPropertyChanged(const std::string& viewModelName,
                                        const std::string& propertyName, const std::any& newValue) {
  if (!callbackSet_ || !envSet_) {
    return;
  }

  try {
    Napi::Env env = propeChangedCallback_.Env();
    Napi::Object changeInfo = Napi::Object::New(env);
    changeInfo.Set("viewModelName", Napi::String::New(env, viewModelName));
    changeInfo.Set("propertyName", Napi::String::New(env, propertyName));

    // 转换值
    if (newValue.type() == typeid(int)) {
      changeInfo.Set("newValue", Napi::Number::New(env, std::any_cast<int>(newValue)));
    } else if (newValue.type() == typeid(double)) {
      changeInfo.Set("newValue", Napi::Number::New(env, std::any_cast<double>(newValue)));
    } else if (newValue.type() == typeid(std::string)) {
      changeInfo.Set("newValue", Napi::String::New(env, std::any_cast<std::string>(newValue)));
    } else if (newValue.type() == typeid(bool)) {
      changeInfo.Set("newValue", Napi::Boolean::New(env, std::any_cast<bool>(newValue)));
    } else {
      changeInfo.Set("newValue", env.Null());
    }

    propeChangedCallback_.Call({changeInfo});
  } catch (const std::exception& e) {
    std::cout << "Error in property change notification: " << e.what() << std::endl;
  }
}

Napi::Value SetPropertyChangedCallbackWrapper(const Napi::CallbackInfo& info) {
  MVVMManager::getInstance()->setPropertyChangedCallback(info);
  return info.Env().Undefined();
}

Napi::Value ExecuteViewModelActionWrapper(const Napi::CallbackInfo& info) {
  return MVVMManager::getInstance()->executeViewModelAction(info);
}

Napi::Value GetViewModelStateWrapper(const Napi::CallbackInfo& info) {
  return MVVMManager::getInstance()->getViewModelState(info);
}

Napi::Value GetAllViewModelsWrapper(const Napi::CallbackInfo& info) {
  return MVVMManager::getInstance()->getAllViewModels(info);
}

Napi::Object InitMVVM(Napi::Env env, Napi::Object exports) {
  exports.Set("setPropertyChangedCallback",
              Napi::Function::New(env, SetPropertyChangedCallbackWrapper));
  exports.Set("executeAction", Napi::Function::New(env, ExecuteViewModelActionWrapper));
  exports.Set("getViewModelState", Napi::Function::New(env, GetViewModelStateWrapper));
  exports.Set("getAllViewModels", Napi::Function::New(env, GetAllViewModelsWrapper));

  return exports;
}