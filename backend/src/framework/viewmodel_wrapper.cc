#include "viewmodel_wrapper.h"
#include <climits>
#include <cmath>
#include <iostream>

namespace framework {

Napi::FunctionReference ViewModelWrapper::constructor;

Napi::Object ViewModelWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::Function func = DefineClass(
    env,
    "ViewModel",
    {
      InstanceMethod("getViewId", &ViewModelWrapper::GetViewId),
      InstanceMethod("setProp", &ViewModelWrapper::SetProp),
      InstanceMethod("getProp", &ViewModelWrapper::GetProp),
      InstanceMethod("addPropertyListener", &ViewModelWrapper::AddPropertyListener),
      InstanceMethod("removePropertyListeners", &ViewModelWrapper::RemovePropertyListeners),
      InstanceMethod("action", &ViewModelWrapper::Action),
      InstanceMethod("getState", &ViewModelWrapper::GetState),
    });

  constructor = Napi::Persistent(func);
  exports.Set("ViewModel", func);
  return exports;
}

ViewModelWrapper::ViewModelWrapper(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<ViewModelWrapper>(info) {
  // Constructor - ViewModel will be set later
}

void ViewModelWrapper::SetViewModel(std::shared_ptr<ViewModel> viewModel) {
  viewModel_ = viewModel;
}

Napi::Value ViewModelWrapper::GetViewId(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }
  return Napi::String::New(env, viewModel_->GetViewId());
}

Napi::Value ViewModelWrapper::SetProp(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 2 || !info[0].IsString()) {
    Napi::TypeError::New(env, "propName and value expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string propName = info[0].As<Napi::String>().Utf8Value();
  Napi::Value value = info[1];

  // Set property based on value type
  if (value.IsNumber()) {
    double numValue = value.As<Napi::Number>().DoubleValue();
    if (numValue == std::floor(numValue) && numValue >= INT_MIN && numValue <= INT_MAX) {
      viewModel_->SetProp<int>(propName, static_cast<int>(numValue));
    } else {
      viewModel_->SetProp<double>(propName, numValue);
    }
  } else if (value.IsString()) {
    viewModel_->SetProp<std::string>(propName, value.As<Napi::String>().Utf8Value());
  } else if (value.IsBoolean()) {
    viewModel_->SetProp<bool>(propName, value.As<Napi::Boolean>().Value());
  } else {
    Napi::TypeError::New(env, "Unsupported property type").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  return env.Undefined();
}

Napi::Value ViewModelWrapper::GetProp(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "propName expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string propName = info[0].As<Napi::String>().Utf8Value();

  return viewModel_->ToNapiObject(env).Get(propName);
}

Napi::Value ViewModelWrapper::AddPropertyListener(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
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
  propertyChangedCallback_ = Napi::Persistent(callback);

  // Add listener to ViewModel
  viewModel_->AddPropertyListener(
    propName, [this](const std::string& viewId, const std::string& prop, const std::any& value) {
      if (!propertyChangedCallback_.IsEmpty()) {
        Napi::Env env = propertyChangedCallback_.Env();

        // Create change info object
        Napi::Object changeInfo = Napi::Object::New(env);
        changeInfo.Set("viewId", Napi::String::New(env, viewId));
        changeInfo.Set("propName", Napi::String::New(env, prop));

        // Convert value
        if (value.type() == typeid(int)) {
          changeInfo.Set("value", Napi::Number::New(env, std::any_cast<int>(value)));
        } else if (value.type() == typeid(double)) {
          changeInfo.Set("value", Napi::Number::New(env, std::any_cast<double>(value)));
        } else if (value.type() == typeid(std::string)) {
          changeInfo.Set("value", Napi::String::New(env, std::any_cast<std::string>(value)));
        } else if (value.type() == typeid(bool)) {
          changeInfo.Set("value", Napi::Boolean::New(env, std::any_cast<bool>(value)));
        }

        propertyChangedCallback_.Call({changeInfo});
      }
    });

  return env.Undefined();
}

Napi::Value ViewModelWrapper::RemovePropertyListeners(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "propName expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string propName = info[0].As<Napi::String>().Utf8Value();
  viewModel_->RemovePropertyListeners(propName);

  return env.Undefined();
}

Napi::Value ViewModelWrapper::Action(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "actionName expected").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  std::string actionName = info[0].As<Napi::String>().Utf8Value();
  
  // Debug output
  std::cout << "ViewModelWrapper::Action called with:" << std::endl;
  std::cout << "  actionName: " << actionName << std::endl;
  std::cout << "  total args: " << info.Length() << std::endl;
  for (size_t i = 0; i < info.Length(); ++i) {
    if (info[i].IsString()) {
      std::cout << "  arg[" << i << "]: " << info[i].As<Napi::String>().Utf8Value() << " (string)" << std::endl;
    } else if (info[i].IsNumber()) {
      std::cout << "  arg[" << i << "]: " << info[i].As<Napi::Number>().DoubleValue() << " (number)" << std::endl;
    } else {
      std::cout << "  arg[" << i << "]: (other type)" << std::endl;
    }
  }
  std::cout.flush();  // Force flush output
  
  return viewModel_->Action(actionName, info);
}

Napi::Value ViewModelWrapper::GetState(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (!viewModel_) {
    Napi::Error::New(env, "ViewModel not initialized").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  return viewModel_->GetState(env);
}

}   // namespace framework