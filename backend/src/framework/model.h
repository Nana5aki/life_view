/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:56:47
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:12:10
 * @FilePath: \life_view\backend\src\framework\model.h
 */
#pragma once

#include <any>
#include <functional>
#include <map>
#include <napi.h>
#include <string>
#include <vector>

namespace framework {

class Model {
  using PropChangeListener =
    std::function<void(const std::string& prop_name, const std::any& new_value)>;

public:
  Model() = default;
  virtual ~Model() = default;

public:
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

  // 添加属性变化监听器
  void AddPropListener(PropChangeListener listener) {
    listeners_.push_back(listener);
  }

  // 通知属性变化
  void NotifyPropChanged(const std::string& prop_name, const std::any& new_value) {
    for (auto& listener : listeners_) {
      listener(prop_name, new_value);
    }
  }

  virtual Napi::Object GetPropsAsObject(Napi::Env env) const;

private:
  std::map<std::string, std::any> properties_;
  std::vector<PropChangeListener> listeners_;
};

}   // namespace framework
