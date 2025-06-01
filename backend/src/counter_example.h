/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:35:00
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 23:30:30
 * @FilePath: \life_view\backend\src\counter_example.h
 */
#ifndef COUNTER_EXAMPLE_H
#define COUNTER_EXAMPLE_H

#include "framework/mvvm/model.h"
#include "framework/mvvm/mvvm_manager.h"
#include "framework/mvvm/variant.h"
#include "framework/mvvm/viewmodel.h"
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
    SetProp("isEven", (number_ % 2 == 0));

    std::cout << "CounterViewModel properties initialized" << std::endl;

    registerActions();

    std::cout << "CounterViewModel actions registered" << std::endl;
  }

private:
  void registerActions() {
    // Register increment action
    RegisterAction("increment", [this](const framework::Variant*) {
      ++number_;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
    });

    // Register decrement action
    RegisterAction("decrement", [this](const framework::Variant*) {
      --number_;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
    });

    // Register reset action
    RegisterAction("reset", [this](const framework::Variant*) {
      number_ = 0;
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
    });

    // Register addNumber action (example with parameters)
    RegisterAction("addNumber", [this](const framework::Variant* params) {
      if (!params->IsInt()) {
        return;
      }

      number_ += params->AsInt();
      SetProp("count", number_);
      SetProp("isEven", (number_ % 2 == 0));
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