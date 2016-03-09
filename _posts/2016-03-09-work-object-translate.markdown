# 为什么需要object translate？
后端定义的obj.attrBack与前端渲染需要的obj.attrFront往往不一样。

很多时候后端的字段名在不断变化，我们不可能前端跟着一起全部变掉。

所以，需要字段名的翻译机制！

# npm module与npm package

* module: 可以require，要有index.js
* package: 可以install，要有package.json

# 实现