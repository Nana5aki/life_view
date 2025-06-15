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
                  InstanceMethod("GetProp", &ViewModelWrapper::GetProp),
                  InstanceMethod("BindProperty", &ViewModelWrapper::BindProperty),
                  InstanceMethod("ExcuteCommand", &ViewModelWrapper::ExcuteCommand),
                });

  constructor = Napi::Persistent(func);
  exports.Set("ViewModel", func);
  return exports;
}

ViewModelWrapper::ViewModelWrapper(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<ViewModelWrapper>(info) {
}

void ViewModelWrapper::SetViewModel(std::shared_ptr<ViewModel> viewmodel) {
  viewmodel_ = viewmodel;
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

Napi::Value ViewModelWrapper::BindProperty(const Napi::CallbackInfo& info) {
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

  std::string prop_name = info[0].As<Napi::String>().Utf8Value();
  Napi::Function callback = info[1].As<Napi::Function>();

  property_changed_callbacks_[prop_name] = Napi::Persistent(callback);
  viewmodel_->BindProperty(prop_name,
                           [this, prop_name](const std::string& prop, const Variant& value) {
                             auto it = property_changed_callbacks_.find(prop_name);
                             if (it != property_changed_callbacks_.end() && !it->second.IsEmpty()) {
                               Napi::Env env = it->second.Env();
                               Napi::Object change_info = Napi::Object::New(env);
                               change_info.Set("prop_name", Napi::String::New(env, prop));
                               change_info.Set("value", VariantToNValue(value, env));
                               it->second.Call({change_info});
                             }
                           });

  return env.Undefined();
}

Napi::Value ViewModelWrapper::ExcuteCommand(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewmodel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "command name expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  std::string command_name = info[0].As<Napi::String>().Utf8Value();

  // 处理参数
  const Variant* params = nullptr;
  Variant param_variant;

  if (info.Length() > 1) {
    param_variant = NValueToVariant(info[1]);
    params = &param_variant;
  }
  viewmodel_->Command(command_name, params);

  return env.Undefined();
}

}   // namespace framework