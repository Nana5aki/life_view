/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 12:12:13
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 18:05:42
 * @FilePath: \life_view\backend\src\framework\mvvm\variant.h
 */
#pragma once

#include <cstring>
#include <iostream>
#include <map>
#include <string>
#include <vector>

namespace framework {

// 前声明
class Variant;

// 类型别名
using VariantMap = std::map<std::string, Variant>;
using VariantArray = std::vector<Variant>;

enum class VariantType : char { Null = 0, Bool, Int, Double, String, Array, Map };

class Variant {
public:
  // 构造函数
  Variant(VariantType type = VariantType::Null);
  Variant(bool val);
  Variant(int val);
  Variant(double val);
  Variant(const std::string& val);
  Variant(const char* val);
  Variant(const VariantArray& val);
  Variant(const VariantMap& val);

  // 拷贝构造和赋值
  Variant(const Variant& other);
  Variant& operator=(const Variant& other);

  // 移动构造和赋值
  Variant(Variant&& other) noexcept;
  Variant& operator=(Variant&& other) noexcept;

  // 析构函数
  ~Variant();

  // 类型检查
  VariantType GetType() const {
    return type_;
  }
  bool IsNull() const {
    return type_ == VariantType::Null;
  }
  bool IsBool() const {
    return type_ == VariantType::Bool;
  }
  bool IsInt() const {
    return type_ == VariantType::Int;
  }
  bool IsDouble() const {
    return type_ == VariantType::Double;
  }
  bool IsString() const {
    return type_ == VariantType::String;
  }
  bool IsArray() const {
    return type_ == VariantType::Array;
  }
  bool IsMap() const {
    return type_ == VariantType::Map;
  }

  // 类型转换
  bool AsBool() const;
  int AsInt() const;
  double AsDouble() const;
  const std::string AsString() const;
  const VariantArray AsArray() const;
  const VariantMap AsMap() const;

  // 数组操作
  void Push(const Variant& val);
  Variant& At(size_t index);
  size_t ArraySize() const;

  // 对象操作
  void Set(const std::string& key, const Variant& val);
  const Variant& Get(const std::string& key);
  bool Has(const std::string& key) const;

private:
  // 获取可修改引用
  VariantArray& GetArray();
  VariantMap& GetMap();

  // 辅助方法
  void Clear();
  void CopyFrom(const Variant& other);
  void MoveFrom(Variant&& other);

private:
  VariantType type_;

  // Union存储所有数据类型
  union Data {
    bool bool_val;
    int int_val;
    double double_val;
    std::string* string_ptr;
    VariantArray* array_ptr;
    VariantMap* map_ptr;

    Data() {
      memset(this, 0, sizeof(Data));
    }
  } data_;
};

}   // namespace framework