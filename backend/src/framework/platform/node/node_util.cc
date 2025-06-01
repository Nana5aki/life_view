/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 16:27:51
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 16:40:06
 * @FilePath: \life_view\backend\src\framework\platform\node\node_util.cc
 */
#include "node_util.h"

namespace framework {

Napi::Value VariantToNValue(const Variant& prop, Napi::Env env) {
  switch (prop.GetType()) {
  case VariantType::Null:
    return env.Null();
  case VariantType::Bool:
    return Napi::Boolean::New(env, prop.AsBool());
  case VariantType::Int:
    return Napi::Number::New(env, prop.AsInt());
  case VariantType::Double:
    return Napi::Number::New(env, prop.AsDouble());
  case VariantType::String:
    return Napi::String::New(env, prop.AsString());
  case VariantType::Array: {
    const auto& arr = prop.AsArray();
    Napi::Array napiArray = Napi::Array::New(env, arr.size());
    for (size_t i = 0; i < arr.size(); ++i) {
      napiArray[i] = VariantToNValue(arr[i], env);
    }
    return napiArray;
  }
  case VariantType::Map: {
    const auto& map = prop.AsMap();
    Napi::Object napiObject = Napi::Object::New(env);
    for (const auto& [key, value] : map) {
      napiObject.Set(key, VariantToNValue(value, env));
    }
    return napiObject;
  }
  default:
    return env.Undefined();
  }
}

Variant NValueToVariant(const Napi::Value& value) {
  if (value.IsNull() || value.IsUndefined()) {
    return Variant(VariantType::Null);
  } else if (value.IsBoolean()) {
    return Variant(value.As<Napi::Boolean>().Value());
  } else if (value.IsNumber()) {
    double num = value.As<Napi::Number>().DoubleValue();
    // 检查是否为整数
    if (num == static_cast<int>(num) && num >= INT_MIN && num <= INT_MAX) {
      return Variant(static_cast<int>(num));
    } else {
      return Variant(num);
    }
  } else if (value.IsString()) {
    return Variant(value.As<Napi::String>().Utf8Value());
  } else if (value.IsArray()) {
    Napi::Array napiArray = value.As<Napi::Array>();
    VariantArray variantArray;
    variantArray.reserve(napiArray.Length());

    for (uint32_t i = 0; i < napiArray.Length(); ++i) {
      variantArray.push_back(NValueToVariant(napiArray[i]));
    }
    return Variant(variantArray);
  } else if (value.IsObject()) {
    Napi::Object napiObject = value.As<Napi::Object>();
    Napi::Array propertyNames = napiObject.GetPropertyNames();
    VariantMap variantMap;

    for (uint32_t i = 0; i < propertyNames.Length(); ++i) {
      Napi::Value key = propertyNames[i];
      std::string keyStr = key.As<Napi::String>().Utf8Value();
      variantMap[keyStr] = NValueToVariant(napiObject.Get(key));
    }
    return Variant(variantMap);
  } else {
    // 未知类型，返回null
    return Variant(VariantType::Null);
  }
}

}   // namespace framework
