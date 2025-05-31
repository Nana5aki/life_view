#include "viewmodel.h"

namespace framework {

// Constructor implementation
ViewModel::ViewModel(const std::string& viewId)
  : viewId_(viewId) {
}

// Get ViewId
const std::string& ViewModel::GetViewId() const {
  return viewId_;
}

// Register Action
void ViewModel::RegisterAction(const std::string& action_name,
                               std::function<Napi::Value(const Napi::CallbackInfo&)> action) {
  actions_[action_name] = action;
}

// Execute Action
Napi::Value ViewModel::Action(const std::string& action_name, const Napi::CallbackInfo& info) {
  auto it = actions_.find(action_name);
  if (it != actions_.end()) {
    return it->second(info);
  }
  return info.Env().Undefined();
}

// Notify property change to listeners
void ViewModel::NotifyPropChanged(const std::string& propName, const std::any& newValue) {
  auto it = propertyListeners_.find(propName);
  if (it != propertyListeners_.end()) {
    for (const auto& listener : it->second) {
      listener.listener(viewId_, propName, newValue);
    }
  }
}

// Add property listener
void ViewModel::AddPropertyListener(const std::string& propName, PropChangeListener listener) {
  PropertyListener pl;
  pl.propName = propName;
  pl.listener = listener;
  propertyListeners_[propName].push_back(pl);
}

// Remove property listeners
void ViewModel::RemovePropertyListeners(const std::string& propName) {
  auto it = propertyListeners_.find(propName);
  if (it != propertyListeners_.end()) {
    propertyListeners_.erase(it);
  }
}

// Get ViewModel state
Napi::Object ViewModel::GetState(Napi::Env env) const {
  Napi::Object state = Napi::Object::New(env);

  // Add viewId
  state.Set("viewId", Napi::String::New(env, viewId_));

  // Add ViewModel properties
  Napi::Object propsObj = ToNapiObject(env);
  state.Set("properties", propsObj);

  return state;
}

// Get properties as Napi Object
Napi::Object ViewModel::ToNapiObject(Napi::Env env) const {
  Napi::Object obj = Napi::Object::New(env);

  for (const auto& [key, value] : properties_) {
    try {
      // Convert different types of values
      if (value.type() == typeid(int)) {
        obj.Set(key, Napi::Number::New(env, std::any_cast<int>(value)));
      } else if (value.type() == typeid(double)) {
        obj.Set(key, Napi::Number::New(env, std::any_cast<double>(value)));
      } else if (value.type() == typeid(std::string)) {
        obj.Set(key, Napi::String::New(env, std::any_cast<std::string>(value)));
      } else if (value.type() == typeid(bool)) {
        obj.Set(key, Napi::Boolean::New(env, std::any_cast<bool>(value)));
      } else {
        // Convert other types to string
        obj.Set(key, Napi::String::New(env, "unknown_type"));
      }
    } catch (const std::exception& e) {
      // Handle conversion errors silently or log them
    }
  }
  return obj;
}

}   // namespace framework
