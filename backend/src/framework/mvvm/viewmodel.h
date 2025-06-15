/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:56:42
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:28:38
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
    std::string prop_name_;
    PropChangeListener listener_;
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

  void Command(const std::string& command_name, const Variant* params);

  void BindProperty(const std::string& prop_name, PropChangeListener listener);

protected:
  void RegisterCommand(const std::string& command_name,
                       std::function<void(const Variant*)> command);

private:
  void NotifyPropChanged(const std::string& prop_name, const Variant& new_value);

private:
  std::string view_id_;
  std::map<std::string, std::function<void(const Variant*)>> commands_;
  std::map<std::string, Variant> properties_;
  std::map<std::string, std::vector<PropertyListener>> property_listeners_;
};

}   // namespace framework
