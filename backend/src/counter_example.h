/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 01:04:28
 * @FilePath: \life_view\backend\src\counter_example.h
 */
#ifndef COUNTER_EXAMPLE_H
#define COUNTER_EXAMPLE_H

#include "framework/model.h"
#include "framework/mvvm_manager.h"
#include "framework/viewmodel.h"
#include <iostream>

namespace counter_example {
// Counter ViewModel - View-specific properties and logic
class CounterViewModel : public framework::ViewModel {
public:
  CounterViewModel(const std::string& viewId)
    : framework::ViewModel(viewId) {
    std::cout << "CounterViewModel constructor called with viewId: " << viewId << std::endl;
    
    // Initialize properties
    SetProp("count", number_);
    SetProp("message", std::string("Hello MVVM"));
    SetProp("isEven", (number_ % 2 == 0));
    
    std::cout << "CounterViewModel properties initialized" << std::endl;
    
    registerActions();
    
    std::cout << "CounterViewModel actions registered" << std::endl;
  }

private:
  void registerActions() {
    // Register increment action
    RegisterAction("increment", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      ++number_;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
      std::cout << "increment: " << number_ << std::endl;
      return info.Env().Undefined();
    });

    // Register decrement action
    RegisterAction("decrement", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      --number_;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
      std::cout << "decrement: " << number_ << std::endl;
      return info.Env().Undefined();
    });

    // Register reset action
    RegisterAction("reset", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      number_ = 0;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
      std::cout << "reset: " << number_ << std::endl;
      return info.Env().Undefined();
    });

    // Register setMessage action
    RegisterAction("setMessage", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      if (info.Length() < 2 || !info[1].IsString()) {
        Napi::TypeError::New(info.Env(), "String expected").ThrowAsJavaScriptException();
        return info.Env().Undefined();
      }

      std::string message = info[1].As<Napi::String>().Utf8Value();
      SetProp("message", message);
      std::cout << "setMessage: " << message << std::endl;
      return info.Env().Undefined();
    });

    // Register addNumber action (example with parameters)
    RegisterAction("addNumber", [this](const Napi::CallbackInfo& info) -> Napi::Value {
      if (info.Length() < 2 || !info[1].IsNumber()) {
        Napi::TypeError::New(info.Env(), "Number expected").ThrowAsJavaScriptException();
        return info.Env().Undefined();
      }

      int number = info[1].As<Napi::Number>().Int32Value();
      number_ += number;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
      std::cout << "addNumber: " << number << ", new total: " << number_ << std::endl;
      return info.Env().Undefined();
    });
  }

private:
  int number_ = 0;
};

// CounterViewModel factory function
std::shared_ptr<framework::ViewModel> CreateCounterViewModel(const std::string& viewId);

// Initialize counter example
void InitCounterExample();

}   // namespace counter_example

#endif   // COUNTER_EXAMPLE_H