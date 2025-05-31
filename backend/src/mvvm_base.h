/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 21:19:51
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-05-31 22:29:10
 * @FilePath: \life_view\backend\src\mvvm_base.h
 */
#pragma once

#include <napi.h>

// Exported C++ interface functions
Napi::Object InitMVVM(Napi::Env env, Napi::Object exports);