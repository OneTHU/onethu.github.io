# 许可与致谢

## 1. 自有代码

OneTHU 自有代码以 **MIT** 许可开源，**并附两条限制**：

1. **严禁商业用途**；
2. **严禁用于对清华大学信息服务的攻击性访问**——包括编写或运行抢课、体育场馆或图书馆座位
   等自动预约提交的插件与脚本、高频批量请求，以及任何规避校方风控与身份校验的行为。

违反任一条，授权立即终止。

- 许可全文：[LICENSE](https://github.com/smartThise/OneTHU/blob/dev3/LICENSE)
- 第三方清单：[LICENSES/THIRD-PARTY.md](https://github.com/smartThise/OneTHU/blob/dev3/LICENSES/THIRD-PARTY.md)

## 2. 使用边界

- **体育场馆模块仅提供查询**（场馆 / 场次 / 余量 / 我的预约 / 退订），不提供应用内预约提交。
  依据清华大学体育部场馆中心 2025 年 12 月 3 日公告第七条第 12 款，通过脚本或插件等非正常
  途径预定场地者，将被封禁预订权限 6 个月并函告相关院系或单位。预约请通过应用内按钮前往
  官方网页完成。
- **严禁将本项目源码用于任何形式的自动预约 / 抢场**，该行为既违反场馆中心预约须知，
  也违反本项目开源准则，后果由使用者自行承担。
- OneTHU 是**非官方的个人效率工具**，与清华大学无关；数据均来自学校公开系统的网页接口，
  仅供个人学习与日常使用。

## 3. 第三方组件与来源项目

本项目中使用的开源项目均适用其自带许可证；仅依据其公开实现得出结论的「接口结论来源」
同样列明。**以下第三方许可不受本项目附加限制的扩张或缩减。**

| 来源 | 许可与限制 |
|---|---|
| [THU Info App / thu-info-lib](https://github.com/thu-info-community/thu-info-app) | 上游 BSL 1.1；THU Info 团队邮件授权 OneTHU **非商业用途**二次分发，**截止 2036-12-31** |
| [LearnX](https://github.com/robertying/learnX) | MIT，**附例外**：若您过去或现在任职清华大学信息化技术中心，或您的项目受任何与清华有关的机构资助，则未经授权的使用（含拷贝、修改、再分发，无论是否商用）视为侵权 |
| thu-tok-auto / yuketang-helper-auto | MIT |
| cheerio · iconv-lite · sm-crypto · mammoth · xlsx · katex 等 | 各自自带许可（MIT / Apache-2.0 等） |

上游接口结论分别验证自 [thu-learn-lib](https://github.com/Harry-Chen/thu-learn-lib)、
[thu-info-app](https://github.com/thu-info-community/thu-info-app)、
[learnX](https://github.com/robertying/learnX)、thu-tok-auto、yuketang-helper-auto，
向以上项目的长期维护者致敬。

完整的授权范围、例外条款与邮件授权存档见
[LICENSES/THIRD-PARTY.md](https://github.com/smartThise/OneTHU/blob/dev3/LICENSES/THIRD-PARTY.md)。
