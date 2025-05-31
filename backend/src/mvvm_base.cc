/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:30:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 18:30:00
 * @FilePath: \life_view\backend\src\mvvm_base.cc
 */
#include "mvvm_base.h"
#include <iostream>

namespace mvvm {

// 静态成员初始化
MVVMManager* MVVMManager::instance_ = nullptr;

// Model实现
Napi::Object Model::getPropertiesAsObject(Napi::Env env) const {
    Napi::Object obj = Napi::Object::New(env);
    
    for (const auto& [key, value] : properties_) {
        try {
            // 尝试转换不同类型的值
            if (value.type() == typeid(int)) {
                obj.Set(key, Napi::Number::New(env, std::any_cast<int>(value)));
            } else if (value.type() == typeid(double)) {
                obj.Set(key, Napi::Number::New(env, std::any_cast<double>(value)));
            } else if (value.type() == typeid(std::string)) {
                obj.Set(key, Napi::String::New(env, std::any_cast<std::string>(value)));
            } else if (value.type() == typeid(bool)) {
                obj.Set(key, Napi::Boolean::New(env, std::any_cast<bool>(value)));
            } else {
                // 其他类型转换为字符串
                obj.Set(key, Napi::String::New(env, "unknown_type"));
            }
        } catch (const std::exception& e) {
            std::cout << "Error converting property " << key << ": " << e.what() << std::endl;
        }
    }
    
    return obj;
}

// ViewModel实现
Napi::Value ViewModel::executeAction(const std::string& actionName, const Napi::CallbackInfo& info) {
    auto it = actions_.find(actionName);
    if (it != actions_.end()) {
        try {
            return it->second(info);
        } catch (const std::exception& e) {
            Napi::TypeError::New(info.Env(), "Action execution failed: " + std::string(e.what()))
                .ThrowAsJavaScriptException();
            return info.Env().Undefined();
        }
    }
    
    Napi::TypeError::New(info.Env(), "Action not found: " + actionName)
        .ThrowAsJavaScriptException();
    return info.Env().Undefined();
}

std::vector<std::string> ViewModel::getActionNames() const {
    std::vector<std::string> names;
    for (const auto& [name, action] : actions_) {
        names.push_back(name);
    }
    return names;
}

Napi::Object ViewModel::getState(Napi::Env env) const {
    Napi::Object state = Napi::Object::New(env);
    
    // 添加Model属性
    state.Set("properties", model_->getPropertiesAsObject(env));
    
    // 添加可用的Actions
    Napi::Array actionsArray = Napi::Array::New(env);
    auto actionNames = getActionNames();
    for (size_t i = 0; i < actionNames.size(); ++i) {
        actionsArray[static_cast<uint32_t>(i)] = Napi::String::New(env, actionNames[i]);
    }
    state.Set("actions", actionsArray);
    
    return state;
}

// MVVMManager实现
void MVVMManager::registerViewModel(const std::string& name, std::shared_ptr<ViewModel> viewModel) {
    viewModels_[name] = viewModel;
    
    // 为每个ViewModel添加属性变化监听器
    viewModel->addPropertyChangedListener([this, name](const std::string& propertyName, const std::any& newValue) {
        this->notifyPropertyChanged(name, propertyName, newValue);
    });
}

std::shared_ptr<ViewModel> MVVMManager::getViewModel(const std::string& name) {
    auto it = viewModels_.find(name);
    if (it != viewModels_.end()) {
        return it->second;
    }
    return nullptr;
}

void MVVMManager::setPropertyChangedCallback(const Napi::CallbackInfo& info) {
    if (info.Length() < 1 || !info[0].IsFunction()) {
        Napi::TypeError::New(info.Env(), "Function expected").ThrowAsJavaScriptException();
        return;
    }
    
    propertyChangedCallback_ = info[0].As<Napi::Function>();
    callbackSet_ = true;
    envSet_ = true;
}

Napi::Value MVVMManager::executeViewModelAction(const Napi::CallbackInfo& info) {
    if (info.Length() < 2 || !info[0].IsString() || !info[1].IsString()) {
        Napi::TypeError::New(info.Env(), "viewModelName(string) and actionName(string) expected")
            .ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    
    std::string viewModelName = info[0].As<Napi::String>().Utf8Value();
    std::string actionName = info[1].As<Napi::String>().Utf8Value();
    
    auto viewModel = getViewModel(viewModelName);
    if (!viewModel) {
        Napi::TypeError::New(info.Env(), "ViewModel not found: " + viewModelName)
            .ThrowAsJavaScriptException();
        return info.Env().Undefined();
    }
    
    // 创建新的CallbackInfo，去掉前两个参数
    std::vector<napi_value> args;
    for (size_t i = 2; i < info.Length(); ++i) {
        args.push_back(info[i]);
    }
    
    // 由于N-API限制，我们需要手动构造CallbackInfo
    // 这里简化处理，直接调用executeAction
    return viewModel->executeAction(actionName, info);
}

Napi::Object MVVMManager::getViewModelState(const Napi::CallbackInfo& info) {
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(info.Env(), "viewModelName(string) expected")
            .ThrowAsJavaScriptException();
        return Napi::Object::New(info.Env());
    }
    
    std::string viewModelName = info[0].As<Napi::String>().Utf8Value();
    auto viewModel = getViewModel(viewModelName);
    
    if (!viewModel) {
        Napi::TypeError::New(info.Env(), "ViewModel not found: " + viewModelName)
            .ThrowAsJavaScriptException();
        return Napi::Object::New(info.Env());
    }
    
    return viewModel->getState(info.Env());
}

Napi::Object MVVMManager::getAllViewModels(const Napi::CallbackInfo& info) {
    Napi::Object result = Napi::Object::New(info.Env());
    
    for (const auto& [name, viewModel] : viewModels_) {
        result.Set(name, viewModel->getState(info.Env()));
    }
    
    return result;
}

void MVVMManager::notifyPropertyChanged(const std::string& viewModelName, 
                                       const std::string& propertyName, 
                                       const std::any& newValue) {
    if (!callbackSet_ || !envSet_) {
        return;
    }
    
    try {
        Napi::Env env = propertyChangedCallback_.Env();
        Napi::Object changeInfo = Napi::Object::New(env);
        changeInfo.Set("viewModelName", Napi::String::New(env, viewModelName));
        changeInfo.Set("propertyName", Napi::String::New(env, propertyName));
        
        // 转换值
        if (newValue.type() == typeid(int)) {
            changeInfo.Set("newValue", Napi::Number::New(env, std::any_cast<int>(newValue)));
        } else if (newValue.type() == typeid(double)) {
            changeInfo.Set("newValue", Napi::Number::New(env, std::any_cast<double>(newValue)));
        } else if (newValue.type() == typeid(std::string)) {
            changeInfo.Set("newValue", Napi::String::New(env, std::any_cast<std::string>(newValue)));
        } else if (newValue.type() == typeid(bool)) {
            changeInfo.Set("newValue", Napi::Boolean::New(env, std::any_cast<bool>(newValue)));
        } else {
            changeInfo.Set("newValue", env.Null());
        }
        
        propertyChangedCallback_.Call({changeInfo});
    } catch (const std::exception& e) {
        std::cout << "Error in property change notification: " << e.what() << std::endl;
    }
}

// 导出函数包装器
Napi::Value SetPropertyChangedCallbackWrapper(const Napi::CallbackInfo& info) {
    MVVMManager::getInstance()->setPropertyChangedCallback(info);
    return info.Env().Undefined();
}

Napi::Value ExecuteViewModelActionWrapper(const Napi::CallbackInfo& info) {
    return MVVMManager::getInstance()->executeViewModelAction(info);
}

Napi::Value GetViewModelStateWrapper(const Napi::CallbackInfo& info) {
    return MVVMManager::getInstance()->getViewModelState(info);
}

Napi::Value GetAllViewModelsWrapper(const Napi::CallbackInfo& info) {
    return MVVMManager::getInstance()->getAllViewModels(info);
}

// 初始化MVVM模块
Napi::Object InitMVVM(Napi::Env env, Napi::Object exports) {
    exports.Set("setPropertyChangedCallback", Napi::Function::New(env, SetPropertyChangedCallbackWrapper));
    exports.Set("executeAction", Napi::Function::New(env, ExecuteViewModelActionWrapper));
    exports.Set("getViewModelState", Napi::Function::New(env, GetViewModelStateWrapper));
    exports.Set("getAllViewModels", Napi::Function::New(env, GetAllViewModelsWrapper));
    
    return exports;
}

} // namespace mvvm 