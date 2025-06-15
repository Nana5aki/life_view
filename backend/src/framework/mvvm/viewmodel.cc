/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 19:16:15
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:24:12
 * @FilePath: \life_view\backend\src\framework\mvvm\viewmodel.cc
 */
#include "viewmodel.h"

namespace framework {

void ViewModel::RegisterCommand(const std::string& command_name,
                                std::function<void(const Variant*)> command) {
  commands_[command_name] = command;
}

// Execute Action
void ViewModel::Command(const std::string& command_name, const Variant* params) {
  auto it = commands_.find(command_name);
  if (it != commands_.end()) {
    it->second(params);
  }
}

// Notify property change to listeners
void ViewModel::NotifyPropChanged(const std::string& prop_name, const Variant& new_value) {
  auto it = property_listeners_.find(prop_name);
  if (it != property_listeners_.end()) {
    for (const auto& listener : it->second) {
      listener.listener_(prop_name, new_value);
    }
  }
}

// Add property listener
void ViewModel::BindProperty(const std::string& prop_name, PropChangeListener listener) {
  PropertyListener pl;
  pl.prop_name_ = prop_name;
  pl.listener_ = listener;
  property_listeners_[prop_name].push_back(pl);
}

}   // namespace framework
