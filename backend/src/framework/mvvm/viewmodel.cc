#include "viewmodel.h"

namespace framework {

void ViewModel::RegisterAction(const std::string& action_name,
                               std::function<void(const Variant*)> action) {
  actions_[action_name] = action;
}

// Execute Action
void ViewModel::Action(const std::string& action_name, const Variant* params) {
  auto it = actions_.find(action_name);
  if (it != actions_.end()) {
    it->second(params);
  }
}

// Notify property change to listeners
void ViewModel::NotifyPropChanged(const std::string& propName, const Variant& newValue) {
  auto it = property_listeners_.find(propName);
  if (it != property_listeners_.end()) {
    for (const auto& listener : it->second) {
      listener.listener(propName, newValue);
    }
  }
}

// Add property listener
void ViewModel::AddPropertyListener(const std::string& propName, PropChangeListener listener) {
  PropertyListener pl;
  pl.propName = propName;
  pl.listener = listener;
  property_listeners_[propName].push_back(pl);
}

}   // namespace framework
