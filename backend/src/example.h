/*
 * @Author: Nana5aki
 * @Date: 2025-05-30 23:35:06
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 16:48:11
 * @FilePath: \life_view\backend\src\example.h
 */
#include <iostream>
#include <napi.h>

using namespace std;
namespace example {
// add number function
int add(int x, int y);
// add function wrapper
Napi::Number addWrapped(const Napi::CallbackInfo& info);
// Export API
Napi::Object Init(Napi::Env env, Napi::Object exports);
NODE_API_MODULE(addon, Init)
}   // namespace example