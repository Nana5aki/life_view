/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:36:42
 * @FilePath: \life_view\backend\src\counter_example.h
 */
#ifndef COUNTER_EXAMPLE_H
#define COUNTER_EXAMPLE_H

#include "framework/model.h"
#include "framework/mvvm_manager.h"
#include "framework/viewmodel.h"

namespace counter_example {

// 计数器Model
class CounterModel : public framework::Model {
public:
  CounterModel() {
    // 初始化属性
    SetProp<int>("count", 0);
    SetProp<std::string>("message", "Hello MVVM!");
    SetProp<bool>("isEven", true);
  }

  // 业务方法
  void increment() {
    int currentCount = GetProp<int>("count");
    SetProp<int>("count", currentCount + 1);
    updateDerivedProperties();
  }

  void decrement() {
    int currentCount = GetProp<int>("count");
    SetProp<int>("count", currentCount - 1);
    updateDerivedProperties();
  }

  void reset() {
    SetProp<int>("count", 0);
    updateDerivedProperties();
  }

  void setMessage(const std::string& message) {
    SetProp<std::string>("message", message);
  }

private:
  void updateDerivedProperties() {
    int count = GetProp<int>("count");
    SetProp<bool>("isEven", count % 2 == 0);
  }
};

// 计数器ViewModel
class CounterViewModel : public framework::ViewModel {
public:
  CounterViewModel()
    : framework::ViewModel(std::make_shared<CounterModel>()) {
    registerActions();
  }

  CounterViewModel(std::shared_ptr<CounterModel> model)
    : framework::ViewModel(model) {
    registerActions();
  }

private:
  void registerActions() {
    // 注册increment action
    RegisterAction("increment", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      auto model = std::dynamic_pointer_cast<CounterModel>(GetModel());
      if (model) {
        model->increment();
      }
      return info.Env().Undefined();
    });

    // 注册decrement action
    RegisterAction("decrement", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      auto model = std::dynamic_pointer_cast<CounterModel>(GetModel());
      if (model) {
        model->decrement();
      }
      return info.Env().Undefined();
    });

    // 注册reset action
    RegisterAction("reset", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      auto model = std::dynamic_pointer_cast<CounterModel>(GetModel());
      if (model) {
        model->reset();
      }
      return info.Env().Undefined();
    });

    // 注册setMessage action
    RegisterAction("setMessage", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      if (info.Length() < 3 || !info[2].IsString()) {
        Napi::TypeError::New(info.Env(), "Message string expected").ThrowAsJavaScriptException();
        return info.Env().Undefined();
      }

      std::string message = info[2].As<Napi::String>().Utf8Value();
      auto model = std::dynamic_pointer_cast<CounterModel>(GetModel());
      if (model) {
        model->setMessage(message);
      }
      return info.Env().Undefined();
    });

    // 注册addNumber action (带参数的示例)
    RegisterAction("addNumber", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      if (info.Length() < 3 || !info[2].IsNumber()) {
        Napi::TypeError::New(info.Env(), "Number expected").ThrowAsJavaScriptException();
        return info.Env().Undefined();
      }

      int number = info[2].As<Napi::Number>().Int32Value();
      auto model = std::dynamic_pointer_cast<CounterModel>(GetModel());
      if (model) {
        int currentCount = model->GetProp<int>("count");
        model->SetProp<int>("count", currentCount + number);
        // 手动调用更新派生属性
        int count = model->GetProp<int>("count");
        model->SetProp<bool>("isEven", count % 2 == 0);
      }
      return info.Env().Undefined();
    });
  }
};

// 初始化计数器示例
void InitCounterExample();

}   // namespace counter_example

#endif   // COUNTER_EXAMPLE_H