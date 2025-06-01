/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 12:12:24
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 18:05:30
 * @FilePath: \life_view\backend\src\framework\mvvm\variant.cc
 */

#include "variant.h"
#include <assert.h>
#include <sstream>

namespace framework {

// 构造函数
Variant::Variant(VariantType type)
  : type_(type) {
  switch (type) {
  case VariantType::Null:
    break;
  case VariantType::Bool:
    data_.bool_val = false;
    break;
  case VariantType::Int:
    data_.int_val = 0;
    break;
  case VariantType::Double:
    data_.double_val = 0.0;
    break;
  case VariantType::String:
    data_.string_ptr = new std::string();
    break;
  case VariantType::Array:
    data_.array_ptr = new VariantArray();
    break;
  case VariantType::Map:
    data_.map_ptr = new VariantMap();
    break;
  default:
    assert(false && "Invalid variant type");
    break;
  }
}

Variant::Variant(bool val)
  : type_(VariantType::Bool) {
  data_.bool_val = val;
}

Variant::Variant(int val)
  : type_(VariantType::Int) {
  data_.int_val = val;
}

Variant::Variant(double val)
  : type_(VariantType::Double) {
  data_.double_val = val;
}

Variant::Variant(const std::string& val)
  : type_(VariantType::String) {
  data_.string_ptr = new std::string(val);
}

Variant::Variant(const char* val)
  : type_(VariantType::String) {
  data_.string_ptr = new std::string(val);
}

Variant::Variant(const VariantArray& val)
  : type_(VariantType::Array) {
  data_.array_ptr = new VariantArray(val);
}

Variant::Variant(const VariantMap& val)
  : type_(VariantType::Map) {
  data_.map_ptr = new VariantMap(val);
}

// 拷贝构造
Variant::Variant(const Variant& other)
  : type_(VariantType::Null) {
  CopyFrom(other);
}

Variant& Variant::operator=(const Variant& other) {
  if (this != &other) {
    Clear();
    CopyFrom(other);
  }
  return *this;
}

// 移动构造
Variant::Variant(Variant&& other) noexcept
  : type_(VariantType::Null) {
  MoveFrom(std::move(other));
}

Variant& Variant::operator=(Variant&& other) noexcept {
  if (this != &other) {
    Clear();
    MoveFrom(std::move(other));
  }
  return *this;
}

// 析构函数
Variant::~Variant() {
  Clear();
}

// 类型转换
bool Variant::AsBool() const {
  if (type_ != VariantType::Bool) {
    assert(false && "Not a bool");
    return false;
  }
  return data_.bool_val;
}

int Variant::AsInt() const {
  if (type_ != VariantType::Int) {
    assert(false && "Not an int");
    return 0;
  }
  return data_.int_val;
}

double Variant::AsDouble() const {
  if (type_ != VariantType::Double) {
    assert(false && "Not a double");
    return 0;
  }
  return data_.double_val;
}

const std::string Variant::AsString() const {
  if (type_ != VariantType::String) {
    assert(false && "Not a string");
    return "";
  }
  return *data_.string_ptr;
}

const VariantArray Variant::AsArray() const {
  if (type_ != VariantType::Array) {
    assert(false && "Not an array");
    return VariantArray();
  }
  return *data_.array_ptr;
}

const VariantMap Variant::AsMap() const {
  if (type_ != VariantType::Map) {
    assert(false && "Not a map");
    return VariantMap();
  }
  return *data_.map_ptr;
}

// 获取可修改引用
VariantArray& Variant::GetArray() {
  if (type_ != VariantType::Array) {
    assert(false && "not a array");
    Clear();
    type_ = VariantType::Array;
    data_.array_ptr = new VariantArray();
  }
  return *data_.array_ptr;
}

VariantMap& Variant::GetMap() {
  if (type_ != VariantType::Map) {
    assert(false && "not a map");
    Clear();
    type_ = VariantType::Map;
    data_.map_ptr = new VariantMap();
  }
  return *data_.map_ptr;
}

// 数组操作
void Variant::Push(const Variant& val) {
  GetArray().push_back(val);
}

Variant& Variant::At(size_t index) {
  if (!IsArray()) {
    assert(false && "not a array");
    return Variant(VariantType::Null);
  }
  auto& arr = GetArray();
  if (index >= arr.size()) {
    arr.resize(index + 1);
  }
  return arr[index];
}

size_t Variant::ArraySize() const {
  if (!IsArray()) {
    assert(false && "not a array");
    return 0;
  }
  return IsArray() ? data_.array_ptr->size() : 0;
}

// 对象操作
void Variant::Set(const std::string& key, const Variant& val) {
  GetMap()[key] = val;
}

const Variant& Variant::Get(const std::string& key) {
  return GetMap()[key];
}

bool Variant::Has(const std::string& key) const {
  if (!IsMap()) {
    assert(false && "not a map");
    return false;
  }
  return data_.map_ptr != nullptr && data_.map_ptr->find(key) != data_.map_ptr->end();
}

// 辅助方法
void Variant::Clear() {
  switch (type_) {
  case VariantType::String:
    delete data_.string_ptr;
    break;
  case VariantType::Array:
    delete data_.array_ptr;
    break;
  case VariantType::Map:
    delete data_.map_ptr;
    break;
  default:
    break;
  }
  type_ = VariantType::Null;
  memset(&data_, 0, sizeof(data_));
}

void Variant::CopyFrom(const Variant& other) {
  type_ = other.type_;

  switch (type_) {
  case VariantType::Null:
    break;
  case VariantType::Bool:
    data_.bool_val = other.data_.bool_val;
    break;
  case VariantType::Int:
    data_.int_val = other.data_.int_val;
    break;
  case VariantType::Double:
    data_.double_val = other.data_.double_val;
    break;
  case VariantType::String:
    data_.string_ptr = new std::string(*other.data_.string_ptr);
    break;
  case VariantType::Array:
    data_.array_ptr = new VariantArray(*other.data_.array_ptr);
    break;
  case VariantType::Map:
    data_.map_ptr = new VariantMap(*other.data_.map_ptr);
    break;
  }
}

void Variant::MoveFrom(Variant&& other) {
  type_ = other.type_;
  data_ = other.data_;

  other.type_ = VariantType::Null;
  memset(&other.data_, 0, sizeof(other.data_));
}

}   // namespace framework