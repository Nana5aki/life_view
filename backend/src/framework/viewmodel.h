/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:56:42
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:04:36
 * @FilePath: \life_view\backend\src\framework\viewmodel.h
 */
#pragma once

#include "model.h"
#include <any>
#include <functional>
#include <map>
#include <memory>
#include <napi.h>
#include <string>
#include <vector>

namespace framework {

// Property change listener for ViewModel
using PropChangeListener = std::function<void(
  const std::string& viewId, const std::string& propName, const std::any& newValue)>;

// Property listener structure
struct PropertyListener {
  std::string propName;
  PropChangeListener listener;
};

class ViewModel {
public:
  // Constructor
  ViewModel(const std::string& viewId);

  // Virtual destructor
  virtual ~ViewModel() = default;

  // Get ViewId
  const std::string& GetViewId() const;

  // ViewModel Property system (View-specific properties)
  template <typename T>
  void SetProp(const std::string& name, const T& value) {
    properties_[name] = value;
    NotifyPropChanged(name, value);
  }

  template <typename T>
  T GetProp(const std::string& name) const {
    auto it = properties_.find(name);
    if (it != properties_.end()) {
      try {
        return std::any_cast<T>(it->second);
      } catch (const std::bad_any_cast& e) {
        throw std::runtime_error("Property type mismatch");
      }
    }
    throw std::runtime_error("Property not found: " + name);
  }

  // Check if property exists
  bool HasProp(const std::string& name) const {
    return properties_.find(name) != properties_.end();
  }

  // Register Action
  void RegisterAction(const std::string& action_name,
                      std::function<Napi::Value(const Napi::CallbackInfo&)> action);

  // Execute Action
  Napi::Value Action(const std::string& action_name, const Napi::CallbackInfo& info);

  // Add property listener for specific property
  void AddPropertyListener(const std::string& propName, PropChangeListener listener);

  // Remove property listeners
  void RemovePropertyListeners(const std::string& propName);

  // Get ViewModel state for frontend sync
  virtual Napi::Object GetState(Napi::Env env) const;

  // Get properties as Napi Object
  virtual Napi::Object ToNapiObject(Napi::Env env) const;

protected:
  // Notify property change to listeners
  void NotifyPropChanged(const std::string& propName, const std::any& newValue);

private:
  std::string viewId_;   // Corresponding ViewId
  std::map<std::string, std::function<Napi::Value(const Napi::CallbackInfo&)>> actions_;

  // ViewModel properties (View-specific)
  std::map<std::string, std::any> properties_;

  // Property listeners for each property
  std::map<std::string, std::vector<PropertyListener>> propertyListeners_;
};

}   // namespace framework
