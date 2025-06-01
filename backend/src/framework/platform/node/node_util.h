/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 16:27:45
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 16:38:33
 * @FilePath: \life_view\backend\src\framework\platform\node\node_util.h
 */

#include "framework/mvvm/variant.h";
#include <napi.h>

namespace framework {

// Variant转换为Napi::Value
Napi::Value VariantToNValue(const Variant& prop, Napi::Env env);

// Napi::Value转换为Variant
Variant NValueToVariant(const Napi::Value& value);

}   // namespace framework