/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:56:42
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 16:17:54
 * @FilePath: \life_view\backend\src\framework\mvvm\viewmodel.h
 */
#pragma once

#include "model.h"
#include "variant.h"
#include <functional>
#include <map>
#include <memory>
#include <napi.h>
#include <string>
#include <vector>

namespace framework {

class ViewModel {
  using PropChangeListener =
    std::function<void(const std::string& propName, const Variant& newValue)>;

  struct PropertyListener {
    std::string propName;
    PropChangeListener listener;
  };

public:
  ViewModel(const std::string view_id)
    : view_id_(view_id) {};

  virtual ~ViewModel() = default;

  void SetProp(const std::string& name, const Variant& value) {
    properties_[name] = value;
    NotifyPropChanged(name, value);
  }

  Variant GetProp(const std::string& name) const {
    auto it = properties_.find(name);
    return it != properties_.end() ? it->second : Variant();
  }

  bool HasProp(const std::string& name) const {
    return properties_.find(name) != properties_.end();
  }

  void Action(const std::string& action_name, const Variant* params);

  void AddPropertyListener(const std::string& propName, PropChangeListener listener);

protected:
  void RegisterAction(const std::string& action_name, std::function<void(const Variant*)> action);

private:
  void NotifyPropChanged(const std::string& propName, const Variant& newValue);

private:
  std::string view_id_;
  std::map<std::string, std::function<void(const Variant*)>> actions_;
  std::map<std::string, Variant> properties_;
  std::map<std::string, std::vector<PropertyListener>> property_listeners_;
};

}   // namespace framework
