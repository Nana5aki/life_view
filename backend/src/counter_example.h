/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 18:35:00
 * @FilePath: \life_view\backend\src\counter_example.h
 */
#ifndef COUNTER_EXAMPLE_H
#define COUNTER_EXAMPLE_H

#include "mvvm_base.h"

namespace counter_example {

// 计数器Model
class CounterModel : public mvvm::Model {
public:
    CounterModel() {
        // 初始化属性
        setProperty<int>("count", 0);
        setProperty<std::string>("message", "Hello MVVM!");
        setProperty<bool>("isEven", true);
    }

    // 业务方法
    void increment() {
        int currentCount = getProperty<int>("count");
        setProperty<int>("count", currentCount + 1);
        updateDerivedProperties();
    }

    void decrement() {
        int currentCount = getProperty<int>("count");
        setProperty<int>("count", currentCount - 1);
        updateDerivedProperties();
    }

    void reset() {
        setProperty<int>("count", 0);
        updateDerivedProperties();
    }

    void setMessage(const std::string& message) {
        setProperty<std::string>("message", message);
    }

private:
    void updateDerivedProperties() {
        int count = getProperty<int>("count");
        setProperty<bool>("isEven", count % 2 == 0);
    }
};

// 计数器ViewModel
class CounterViewModel : public mvvm::ViewModel {
public:
    CounterViewModel() : mvvm::ViewModel(std::make_shared<CounterModel>()) {
        registerActions();
    }

    CounterViewModel(std::shared_ptr<CounterModel> model) : mvvm::ViewModel(model) {
        registerActions();
    }

private:
    void registerActions() {
        // 注册increment action
        registerAction("increment", [this](const Napi::CallbackInfo& info) -> Napi::Value {
            auto model = std::dynamic_pointer_cast<CounterModel>(getModel());
            if (model) {
                model->increment();
            }
            return info.Env().Undefined();
        });

        // 注册decrement action
        registerAction("decrement", [this](const Napi::CallbackInfo& info) -> Napi::Value {
            auto model = std::dynamic_pointer_cast<CounterModel>(getModel());
            if (model) {
                model->decrement();
            }
            return info.Env().Undefined();
        });

        // 注册reset action
        registerAction("reset", [this](const Napi::CallbackInfo& info) -> Napi::Value {
            auto model = std::dynamic_pointer_cast<CounterModel>(getModel());
            if (model) {
                model->reset();
            }
            return info.Env().Undefined();
        });

        // 注册setMessage action
        registerAction("setMessage", [this](const Napi::CallbackInfo& info) -> Napi::Value {
            if (info.Length() < 3 || !info[2].IsString()) {
                Napi::TypeError::New(info.Env(), "Message string expected")
                    .ThrowAsJavaScriptException();
                return info.Env().Undefined();
            }

            std::string message = info[2].As<Napi::String>().Utf8Value();
            auto model = std::dynamic_pointer_cast<CounterModel>(getModel());
            if (model) {
                model->setMessage(message);
            }
            return info.Env().Undefined();
        });

        // 注册addNumber action (带参数的示例)
        registerAction("addNumber", [this](const Napi::CallbackInfo& info) -> Napi::Value {
            if (info.Length() < 3 || !info[2].IsNumber()) {
                Napi::TypeError::New(info.Env(), "Number expected")
                    .ThrowAsJavaScriptException();
                return info.Env().Undefined();
            }

            int number = info[2].As<Napi::Number>().Int32Value();
            auto model = std::dynamic_pointer_cast<CounterModel>(getModel());
            if (model) {
                int currentCount = model->getProperty<int>("count");
                model->setProperty<int>("count", currentCount + number);
                // 手动调用更新派生属性
                int count = model->getProperty<int>("count");
                model->setProperty<bool>("isEven", count % 2 == 0);
            }
            return info.Env().Undefined();
        });
    }
};

// 初始化计数器示例
void InitCounterExample();

} // namespace counter_example

#endif // COUNTER_EXAMPLE_H 