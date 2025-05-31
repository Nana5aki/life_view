/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:56:42
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:17:03
 * @FilePath: \life_view\backend\src\framework\viewmodel.h
 */
#pragma once

#include "model.h"
#include <functional>
#include <memory>
#include <string>
#include <vector>

namespace framework {

class ViewModel {
  using PropChangeListener =
    std::function<void(const std::string& prop_name, const std::any& new_value)>;

public:
  ViewModel(std::shared_ptr<Model> model)
    : model_(model) {
    // 监听Model的属性变化
    model_->AddPropListener([this](const std::string& property_name, const std::any& new_value) {
      this->OnModelPropChanged(property_name, new_value);
    });
  }

  virtual ~ViewModel() = default;

public:
  // 注册Action
  void RegisterAction(const std::string& action_name,
                      std::function<Napi::Value(const Napi::CallbackInfo&)> action) {
    actions_[action_name] = action;
  }

  // 执行Action
  Napi::Value Action(const std::string& action_name, const Napi::CallbackInfo& info);

  // 获取Model
  std::shared_ptr<Model> GetModel() const {
    return model_;
  }

  // 属性变化处理
  virtual void OnModelPropChanged(const std::string& property_name, const std::any& new_value) {
    // 通知前端属性变化
    for (auto& listener : prop_change_listeners_) {
      listener(property_name, new_value);
    }
  }

  // 添加属性变化监听器
  void AddPropertyChangedListener(PropChangeListener listener) {
    prop_change_listeners_.push_back(listener);
  }

  // 获取所有Actions
  std::vector<std::string> GetActionNames() const;

  // 获取ViewModel状态（用于前端同步）
  virtual Napi::Object GetState(Napi::Env env) const;

private:
  std::shared_ptr<Model> model_;
  std::map<std::string, std::function<Napi::Value(const Napi::CallbackInfo&)>> actions_;
  std::vector<PropChangeListener> prop_change_listeners_;
};

}   // namespace framework
