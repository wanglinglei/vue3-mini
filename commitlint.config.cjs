module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix",  // 修复问题
        "refactor", // 重构
        "test",   // 新增测试用例
        "docs",   // 文档修改
        "style",  // 代码格式调整 不涉及功能变化
        "revert", // 回退
        "chore",  // 其他改动
        "ci",     // 集成修改
        "build",  //  编译打包修改
      ],
    ],
    "subject-full-stop": [0, "never"],
    "subject-case": [0, "never"],
  },
};
