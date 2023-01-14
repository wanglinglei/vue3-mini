// rollup 配置

// 解析ts文件
import ts from "rollup-plugin-typescript2"
// 解析json 文件
import json from "@rollup/plugin-json"
// 解析第三方插件
import resolvePlugin from "@rollup/plugin-node-resolve"

import path from "path"

import { fileURLToPath } from "url"

import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取文件路径
let packagesDir = path.resolve(__dirname, "packages")
// 获取需要打包的模块包
let packageDir = path.resolve(packagesDir, process.env.TARGET)
// 获取模块包内的打包配置
function resolve (filename) {
  return path.resolve(packageDir,filename)
}

// @note windows 当前不支持import 引入json 通过fs读取文件
// let pkg_json = await import(resolve('package.json'), { assert: { type: 'json' } })
let pkg_json = fs.readFileSync(resolve('package.json')).toString()
pkg_json=JSON.parse(pkg_json)

// const packOptions = pkg_json.default.buildOptions || {}
const packOptions = pkg_json.buildOptions || {}
const name = path.basename(packageDir)


const outputOptions = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format:'es'
  },
  "cjs": {
    file: resolve(`dist/${name}.cjs.js`),
    format:'cjs'
  },
  "global": {
    file: resolve(`dist/${name}.global.js`),
    format:'iife'
  }
}

function createConfig (format, output) {
  output.name = packOptions.name;
  output.sourcemap = true;
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({
        tsconfig:path.resolve(__dirname,'tsconfig.json')
      }),
      resolvePlugin()
    ]
  }
}

export default packOptions.format.map(format=>createConfig(format,outputOptions[format]))
