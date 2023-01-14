// 开发环境编译配置

import fs from 'fs';
import { execa } from 'execa';

const dirs = fs.readdirSync('packages').filter((dir) => {
  if (!fs.statSync(`packages/${dir}`).isDirectory()){
      return false
  }
  return true
})

async function build (target) {
  await execa('rollup',['-cw','--environment',`TARGET:${target}`],{stdio:'inherit'})
}
function parallelPack (dirs, build) {
  let tasks = []
  for (let item of dirs) {
    tasks.push(build(item))
  }
  return Promise.all(tasks)
}

parallelPack(dirs, build).then(() => {
  console.log('dev  success');
})