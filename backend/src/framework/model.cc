/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 19:07:26
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 19:09:23
 * @FilePath: \life_view\backend\src\framework\model.cc
 */
#include "model.h"
#include <iostream>

namespace framework {

Napi::Object Model::GetPropsAsObject(Napi::Env env) const {
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

}   // namespace framework
