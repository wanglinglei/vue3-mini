// 打包配置

import fs from 'fs'
import { execa } from 'execa'

const dirs = fs.readdirSync('packages').filter((dir) => {
  if (!fs.statSync(`packages/${dir}`).isDirectory()){
      return false
  }
  return true
})

// 多进程并行打包
async function build (target) {
  await execa('rollup',['-c','--environment',`TARGET:${target}`],{stdio:'inherit'})
}

function parallelPack (dirs, build) {
  let tasks = []
  for (let item of dirs) {
    tasks.push(build(item))
  }
  return Promise.all(tasks)
}

parallelPack(dirs, build).then(() => {
  console.log('pack success');
})