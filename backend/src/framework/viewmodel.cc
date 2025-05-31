#include "viewmodel.h"

namespace framework {

Napi::Value ViewModel::Action(const std::string& action_name, const Napi::CallbackInfo& info) {
  auto it = actions_.find(action_name);
  if (it != actions_.end()) {
    try {
      return it->second(info);
    } catch (const std::exception& e) {
      Napi::TypeError::New(info.Env(), "Action execution failed: " + std::string(e.what()))
        .ThrowAsJavaScriptException();
      return info.Env().Undefined();
    }
  }

  Napi::TypeError::New(info.Env(), "Action not found: " + action_name).ThrowAsJavaScriptException();
  return info.Env().Undefined();
}

std::vector<std::string> ViewModel::GetActionNames() const {
  std::vector<std::string> names;
  for (const auto& [name, action] : actions_) {
    names.push_back(name);
  }
  return names;
}

Napi::Object ViewModel::GetState(Napi::Env env) const {
  Napi::Object state = Napi::Object::New(env);

  // 添加Model属性
  state.Set("properties", model_->GetPropsAsObject(env));

  // 添加可用的Actions
  Napi::Array actionsArray = Napi::Array::New(env);
  auto actionNames = GetActionNames();
  for (size_t i = 0; i < actionNames.size(); ++i) {
    actionsArray[static_cast<uint32_t>(i)] = Napi::String::New(env, actionNames[i]);
  }
  state.Set("actions", actionsArray);

  return state;
}

}   // namespace framework
