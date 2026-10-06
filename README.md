<div align="center">

「 简洁易用的哔哩哔哩分享优化 」

</div>

# 简介

劫持Bilibili分享按钮，直接提取分享文本，让分享更加清爽

# 安装

需要浏览器装有 [Tampermonkey](https://tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/) 插件.

| 正式版 (GitHub 源)                                                                                      |
| -------------------------------------------------------------------------------------------------------- |
| [安装](https://raw.githubusercontent.com/doublebobcat/Bilibili-Share-Optimization/master/bilibili-share-optimization.user.js) |

# 设置

脚本启用后, 在插件菜单中有脚本设置面板的入口.

## 设置项

| 分类 | 设置项 | 说明 | 默认值 |
|------|--------|------|--------|
| 显示设置 | 暗色模式 | 设置面板的暗色主题 | 关闭 |
| 简介截断 | 最大字符数 | 简介超过此字符数将被截断 | 70 |
| 简介截断 | 最大行数 | 简介超过此行数将被截断 | 4 |
| 联合投稿 | 展示其它UP主 | 是否在分享文本中显示协作者 | 关闭 |
| 联合投稿 | 最多展示人数 | 协作者最多显示人数，超出部分显示"等X人" | 3 |
| 通知样式 | 背景颜色 | 复制成功通知的背景颜色 | 白色 |
| 通知样式 | 字体颜色 | 复制成功通知的字体颜色 | 黑色 |
| 通知样式 | 字体大小 | 复制成功通知的字体大小 | 16px |

# 使用

脚本启用后, 直接点击B站的分享按钮即可将优化好的分享文本复制到剪切板中.

## 单UP主场景

```text
URL: https://www.bilibili.com/video/BV1TebszMEpW/
UP主: Chubbyemu
标题: 一位母亲对自己的脖子进行了脊椎按摩治疗，这是她的大脑发生的变化
简介: A Mom Did A Chiropractic Maneuver On Her Own Neck.
This Is What Happen......
```

## 联合投稿场景

开启"展示其它UP主"后:

```text
URL: https://www.bilibili.com/video/BV1xxxxxx/
UP主: 第七翼刀
协作者: 雾失楼T
标题: 示例视频标题
简介: 示例简介内容......
```

若协作者超过限制人数，将显示为 `协作者: 成员A、成员B 等5人`
