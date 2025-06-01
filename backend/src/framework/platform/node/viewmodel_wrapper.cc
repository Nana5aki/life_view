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
                  InstanceMethod("getViewId", &ViewModelWrapper::GetViewId),
                  InstanceMethod("getState", &ViewModelWrapper::GetState),
                });

  constructor = Napi::Persistent(func);
  exports.Set("ViewModel", func);
  return exports;
}

ViewModelWrapper::ViewModelWrapper(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<ViewModelWrapper>(info) {
}

void ViewModelWrapper::SetViewModel(std::shared_ptr<ViewModel> viewmodel, const std::string& viewId) {
  viewmodel_ = viewmodel;
  view_id_ = viewId;
  std::cout << "ViewModelWrapper设置完成，viewId: " << viewId << std::endl;
}

Napi::Value ViewModelWrapper::GetViewId(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, view_id_);
}

Napi::Value ViewModelWrapper::GetState(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewmodel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Object state = Napi::Object::New(env);
  
  // 创建properties对象
  Napi::Object properties = Napi::Object::New(env);
  
  // 硬编码已知的属性名（因为ViewModel没有提供获取所有属性的接口）
  std::vector<std::string> knownProps = {"count", "message", "isEven"};
  
  for (const std::string& propName : knownProps) {
    if (viewmodel_->HasProp(propName)) {
      properties.Set(propName, VariantToNValue(viewmodel_->GetProp(propName), env));
    }
  }
  
  state.Set("properties", properties);
  
  // 硬编码已知的操作名
  Napi::Array actions = Napi::Array::New(env);
  std::vector<std::string> knownActions = {"increment", "decrement", "reset", "addNumber"};
  for (size_t i = 0; i < knownActions.size(); ++i) {
    actions[i] = Napi::String::New(env, knownActions[i]);
  }
  state.Set("actions", actions);
  
  // 监听的属性列表（暂时为空数组，实际监听在addPropertyListener中处理）
  Napi::Array listenedProperties = Napi::Array::New(env);
  state.Set("listenedProperties", listenedProperties);
  
  return state;
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

  // Store the callback
  property_changed_callback_ = Napi::Persistent(callback);

  std::cout << "添加属性监听器: " << propName << std::endl;

  // Add listener to ViewModel
  viewmodel_->AddPropertyListener(propName, [this, propName](const std::string& prop, const Variant& value) {
    if (!property_changed_callback_.IsEmpty()) {
      Napi::Env env = property_changed_callback_.Env();
      Napi::Object change_info = Napi::Object::New(env);
      change_info.Set("viewId", Napi::String::New(env, view_id_));
      change_info.Set("propName", Napi::String::New(env, prop));
      change_info.Set("value", VariantToNValue(value, env));
      
      std::cout << "属性变化通知: " << prop << " = " << value.AsString() << std::endl;
      
      property_changed_callback_.Call({change_info});
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
  
  std::cout << "执行操作: " << actionName;
  
  // 处理参数
  const Variant* params = nullptr;
  Variant paramVariant;
  
  if (info.Length() > 1) {
    // 转换第二个参数为Variant
    paramVariant = NValueToVariant(info[1]);
    params = &paramVariant;
    std::cout << " 参数: " << paramVariant.AsString();
  }
  
  std::cout << std::endl;
  
  // 调用ViewModel的Action方法
  viewmodel_->Action(actionName, params);
  
  return env.Undefined();
}

}   // namespace framework