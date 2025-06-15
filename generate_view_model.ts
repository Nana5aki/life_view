import fs from 'fs'
import path from 'path'

interface ViewModelFile {
  baseName: string
  fullPath: string
  relativePath: string
}

function findViewModelFiles(dir: string): ViewModelFile[] {
  const viewModelFiles: ViewModelFile[] = []

  function walkDir(currentDir: string): void {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (item.endsWith('view_model.h')) {
        const baseName = path.basename(item, path.extname(item))
        if (!viewModelFiles.some((f) => f.baseName === baseName)) {
          viewModelFiles.push({
            baseName: baseName,
            fullPath: fullPath,
            relativePath: path.relative(dir, fullPath)
          })
        }
      }
    }
  }

  if (fs.existsSync(dir)) {
    walkDir(dir)
  }

  return viewModelFiles
}

function fileNameToEnumName(fileName: string): string {
  // 移除view_model后缀
  const withoutSuffix = fileName.replace(/_view_model$/, '')

  // 转换为大写枚举格式
  return withoutSuffix
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * 生成C++枚举文件
 * @param {Array} viewModelFiles - view_model文件列表
 * @param {string} outputPath - 输出路径
 */
function generateCppEnum(viewModelFiles: ViewModelFile[], outputPath: string): void {
  const enumItems = viewModelFiles.map((file, index) => {
    const enumName = fileNameToEnumName(file.baseName)
    return `    ${enumName} = ${index}`
  })

  const cppContent = `/*
 * 自动生成的枚举文件
 * 基于backend/src/viewmodel目录下的view_model文件
 */
#pragma once

namespace LifeV {

enum class ViewModelType {
${enumItems.join(',\n')}
};

}  // namespace LifeV
`

  fs.writeFileSync(outputPath, cppContent, 'utf8')
  console.log(`生成C++枚举文件: ${outputPath}`)
}

/**
 * 生成TypeScript枚举文件
 * @param {Array} viewModelFiles - view_model文件列表
 * @param {string} outputPath - 输出路径
 */
function generateTsEnum(viewModelFiles: ViewModelFile[], outputPath: string): void {
  const enumItems = viewModelFiles.map((file, index) => {
    const enumName = fileNameToEnumName(file.baseName)
    return `  ${enumName} = ${index}`
  })

  const tsContent = `/**
 * 自动生成的枚举文件
 * 基于backend/src/viewmodel目录下的view_model文件
 */

export enum ViewModelType {
${enumItems.join(',\n')}
}

// 枚举值到字符串的映射
export const ViewModelTypeNames: Record<ViewModelType, string> = {
${viewModelFiles
  .map((file, index) => {
    const enumName = fileNameToEnumName(file.baseName)
    return `  [ViewModelType.${enumName}]: '${file.baseName}'`
  })
  .join(',\n')}
};
`

  fs.writeFileSync(outputPath, tsContent, 'utf8')
  console.log(`生成TypeScript枚举文件: ${outputPath}`)
}

/**
 * 主函数
 */
function main(): void {
  const viewModelDir = 'backend/src/viewmodel'
  const cppOutputPath = 'backend/src/viewmodel/view_model_type_define.h'
  const tsOutputPath = 'src/types/view-model-type-define.ts'

  const viewModelFiles = findViewModelFiles(viewModelDir)

  if (viewModelFiles.length === 0) {
    return
  }

  // 确保输出目录存在
  const cppDir = path.dirname(cppOutputPath)
  const tsDir = path.dirname(tsOutputPath)

  if (!fs.existsSync(cppDir)) {
    fs.mkdirSync(cppDir, { recursive: true })
  }
  if (!fs.existsSync(tsDir)) {
    fs.mkdirSync(tsDir, { recursive: true })
  }

  // 生成C++和TypeScript枚举文件
  generateCppEnum(viewModelFiles, cppOutputPath)
  generateTsEnum(viewModelFiles, tsOutputPath)

  console.log('\n枚举文件生成完成！')
  console.log('\n生成的枚举值:')
  viewModelFiles.forEach((file, index) => {
    const enumName = fileNameToEnumName(file.baseName)
    console.log(`  ${enumName} = ${index} (${file.baseName})`)
  })
}

// 运行脚本
if (require.main === module) {
  main()
}
