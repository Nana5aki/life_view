/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:30:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 18:14:06
 * @FilePath: \life_view\backend\src\mvvm_base.h
 */
#ifndef MVVM_BASE_H
#define MVVM_BASE_H

#include <iostream>
#include <map>
#include <string>
#include <functional>
#include <any>
#include <vector>
#include <memory>
#include <napi.h>

namespace mvvm {

// 属性变化监听器类型
using PropertyChangedListener = std::function<void(const std::string& propertyName, const std::any& newValue)>;

// Model基类
class Model {
protected:
    std::map<std::string, std::any> properties_;
    std::vector<PropertyChangedListener> listeners_;

public:
    Model() = default;
    virtual ~Model() = default;

    // 设置属性值
    template<typename T>
    void setProperty(const std::string& name, const T& value) {
        properties_[name] = value;
        notifyPropertyChanged(name, value);
    }

    // 获取属性值
    template<typename T>
    T getProperty(const std::string& name) const {
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
    void addPropertyChangedListener(PropertyChangedListener listener) {
        listeners_.push_back(listener);
    }

    // 通知属性变化
    void notifyPropertyChanged(const std::string& propertyName, const std::any& newValue) {
        for (auto& listener : listeners_) {
            listener(propertyName, newValue);
        }
    }

    // 获取所有属性
    virtual Napi::Object getPropertiesAsObject(Napi::Env env) const;
};

// ViewModel基类
class ViewModel {
protected:
    std::shared_ptr<Model> model_;
    std::map<std::string, std::function<Napi::Value(const Napi::CallbackInfo&)>> actions_;
    std::vector<PropertyChangedListener> propertyChangeListeners_;

public:
    ViewModel(std::shared_ptr<Model> model) : model_(model) {
        // 监听Model的属性变化
        model_->addPropertyChangedListener([this](const std::string& propertyName, const std::any& newValue) {
            this->onModelPropertyChanged(propertyName, newValue);
        });
    }
    
    virtual ~ViewModel() = default;

    // 注册Action
    void registerAction(const std::string& actionName, 
                       std::function<Napi::Value(const Napi::CallbackInfo&)> action) {
        actions_[actionName] = action;
    }

    // 执行Action
    Napi::Value executeAction(const std::string& actionName, const Napi::CallbackInfo& info);

    // 获取Model
    std::shared_ptr<Model> getModel() const { return model_; }

    // 属性变化处理
    virtual void onModelPropertyChanged(const std::string& propertyName, const std::any& newValue) {
        // 通知前端属性变化
        for (auto& listener : propertyChangeListeners_) {
            listener(propertyName, newValue);
        }
    }

    // 添加属性变化监听器
    void addPropertyChangedListener(PropertyChangedListener listener) {
        propertyChangeListeners_.push_back(listener);
    }

    // 获取所有Actions
    std::vector<std::string> getActionNames() const;

    // 获取ViewModel状态（用于前端同步）
    virtual Napi::Object getState(Napi::Env env) const;
};

// MVVM管理器
class MVVMManager {
private:
    static MVVMManager* instance_;
    std::map<std::string, std::shared_ptr<ViewModel>> viewModels_;
    Napi::Function propertyChangedCallback_;
    bool callbackSet_ = false;
    bool envSet_ = false;

public:
    static MVVMManager* getInstance() {
        if (instance_ == nullptr) {
            instance_ = new MVVMManager();
        }
        return instance_;
    }

    // 注册ViewModel
    void registerViewModel(const std::string& name, std::shared_ptr<ViewModel> viewModel);

    // 获取ViewModel
    std::shared_ptr<ViewModel> getViewModel(const std::string& name);

    // 设置属性变化回调（前端JS函数）
    void setPropertyChangedCallback(const Napi::CallbackInfo& info);

    // 执行ViewModel的Action
    Napi::Value executeViewModelAction(const Napi::CallbackInfo& info);

    // 获取ViewModel状态
    Napi::Object getViewModelState(const Napi::CallbackInfo& info);

    // 获取所有ViewModels信息
    Napi::Object getAllViewModels(const Napi::CallbackInfo& info);

private:
    MVVMManager() = default;
    
    // 通知前端属性变化
    void notifyPropertyChanged(const std::string& viewModelName, 
                              const std::string& propertyName, 
                              const std::any& newValue);
};

// 导出的C++接口函数
Napi::Object InitMVVM(Napi::Env env, Napi::Object exports);

} // namespace mvvm

#endif // MVVM_BASE_H 