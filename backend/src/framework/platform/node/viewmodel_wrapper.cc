#include "viewmodel_wrapper.h"
#include "node_util.h"
#include <climits>
#include <cmath>
#include <iostream>

namespace framework {

Napi::FunctionReference ViewModelWrapper::constructor;

Napi::Object ViewModelWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func =
    DefineClass(env,
                "ViewModel",
                {
                  InstanceMethod("getProp", &ViewModelWrapper::GetProp),
                  InstanceMethod("addPropertyListener", &ViewModelWrapper::AddPropertyListener),
                  InstanceMethod("action", &ViewModelWrapper::Action),
                });

  constructor = Napi::Persistent(func);
  exports.Set("ViewModel", func);
  return exports;
}

ViewModelWrapper::ViewModelWrapper(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<ViewModelWrapper>(info) {
}

void ViewModelWrapper::SetViewModel(std::shared_ptr<ViewModel> viewmodel,
                                    const std::string& viewId) {
  viewmodel_ = viewmodel;
  std::cout << "ViewModelWrapper set success,viewId: " << viewId << std::endl;
}

Napi::Value ViewModelWrapper::GetProp(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewmodel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "propName expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string prop_name = info[0].As<Napi::String>().Utf8Value();
  return VariantToNValue(viewmodel_->GetProp(prop_name), env);
}

Napi::Value ViewModelWrapper::AddPropertyListener(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewmodel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2 || !info[0].IsString() || !info[1].IsFunction()) {
    Napi::TypeError::New(env, "propName and callback function expected")
      .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string propName = info[0].As<Napi::String>().Utf8Value();
  Napi::Function callback = info[1].As<Napi::Function>();

  property_changed_callbacks_[propName] = Napi::Persistent(callback);
  viewmodel_->AddPropertyListener(
    propName, [this, propName](const std::string& prop, const Variant& value) {
      auto it = property_changed_callbacks_.find(propName);
      if (it != property_changed_callbacks_.end() && !it->second.IsEmpty()) {
        Napi::Env env = it->second.Env();
        Napi::Object change_info = Napi::Object::New(env);
        change_info.Set("propName", Napi::String::New(env, prop));
        change_info.Set("value", VariantToNValue(value, env));
        it->second.Call({change_info});
      }
    });

  return env.Undefined();
}

Napi::Value ViewModelWrapper::Action(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewmodel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "actionName expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  std::string actionName = info[0].As<Napi::String>().Utf8Value();

  // 处理参数
  const Variant* params = nullptr;
  Variant paramVariant;

  if (info.Length() > 1) {
    paramVariant = NValueToVariant(info[1]);
    params = &paramVariant;
  }
  viewmodel_->Action(actionName, params);

  return env.Undefined();
}

}   // namespace framework