/*
 * @Author: Nana5aki
 * @Date: 2025-05-30 23:34:50
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 00:09:27
 * @FilePath: \life_view\backend\src\example.cc
 */
#include "example.h"

using namespace std;
int example::add(int x, int y) {
  return (x + y);
}
Napi::Number example::addWrapped(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // check if arguments are integer only.
  if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "arg1::Number, arg2::Number expected").ThrowAsJavaScriptException();
  }
  // convert javascripts datatype to c++
  Napi::Number first = info[0].As<Napi::Number>();
  Napi::Number second = info[1].As<Napi::Number>();
  // run c++ function return value and return it in javascript
  Napi::Number returnValue =
    Napi::Number::New(env, example::add(first.Int32Value(), second.Int32Value()));

  return returnValue;
}
Napi::Object example::Init(Napi::Env env, Napi::Object exports) {
  // export Napi function
  exports.Set("add", Napi::Function::New(env, example::addWrapped));
  return exports;
}