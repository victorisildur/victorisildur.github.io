---
layout: post
title: "Typescript工具链"
date: 2016-09-26 08:27:00
categories: programming
excerpt: "typescript, vs code, 微软的一整套技术链"
---

## typescript

初看type script，主要提供两个能力：一是强类型变量，二是interface。举个例子：

```javascript
// 变量的类型声明
function greeter(person: Person) {
    return 'Hi, ' + person.firstName + ' ' + person.lastName;
}

// interface
interface Person {
    firstName: string;
    lastName: string;
}
```

这样能解决javascript弱类型出现的很多bug

## vs code的vim模式

vs下的emacs模式插件不太好用，vim插件的还原度要高很多。
使用过程中，为了让所有vim快捷键生效（包括和windows快捷键冲突的那些），应在settings.json中开启如下设置：

```javascript
"vim.useCtrlKeys": true
```

## ts, react下的webpack配置

首先，react+typescript的文件我们特殊命名为`.tsx`文件。

然后loaders里这样配置：

```javascript
loaders: [{
   test: /\.tsx?$/,
   loader: 'babel-loader!ts-loader',
   exclude: [
      'node_modules'
   ]
}],
noParse: Object.keys(externals)
```

所以`.tsx`文件先过babel-loader，再过ts-loader。
但根据我们之前的经验[http://victorisildur.github.io/programming/2016/08/17/react.html](http://victorisildur.github.io/programming/2016/08/17/react.html).
要想使babel-loader认得react的jsx语法，要配置loader的query属性，配置成`presets: ['es2015', 'react']`这样。
但这里没有啊?

这里就牵扯到`.babelrc`的问题了。
在项目的根目录里，有个`.babelrc`文件，里面是个json形如这样：

```javascript
{
   presets,
   plugin,
   env: {
      development: {
          plugins
      }
   }
}
```

这个配置文件指引着babel以何种preset, plugin去编译你的文件。
具体见这里：[https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/user-handbook.md#toc-babelrc](https://github.com/thejameskyle/babel-handbook/blob/master/translations/en/user-handbook.md#toc-babelrc)

## react action的高级抽象

异步操作总是存在pending -> started -> performing -> done类似的状态迁移，这里，
异步操作不只是指ajax等网络操作，ui变化也算哦。

要是我们对每个操作都手工维护这些个state，显然太累了。
所以qcloud团队对此作了WorkflowState和WorkflowAction这两个抽象：

```typescript
export enum OperationState {
    /** indicates an operation is not started yet */
        Pending = "Pending" as any,

    /** indicates an operation is started, under user interactions */
        Started = "Started" as any,

    /** indicates the operation is performing after an user action */
        Performing = "Performing" as any,

    /** indicates the operation is done (success or failed info is in operation result) */
        Done = "Done" as any
}

export type WorkflowState<TTarget extends Identifiable, TParam> = {
    /** current operation state */
        operationState: OperationState;

    /** target is specific when started */
        targets?: TTarget[];

    /** params will be stored after perform */
        params?: TParam;

    /** result is specific when done */
        results?: OperationResult<TTarget>[];
}
```

可以看到，workflowState总是含operationState，总是由pending, started, performing, done这四个状态组成。
至于WorkflowAction，继承自[FSA, flux-standard-action](https://github.com/acdlite/flux-standard-action)，
只不过对payload的类型作了typescript generic限制：

```typescript
export interface ReduxAction<TPayload> {
       /**
         * The action type, the `number` type is to support enum.
            * */
         type: string | number;
         payload?: TPayload;
         error?: boolean;
         meta?: any;
}
```

具体到写代码时，总是用`generateWorkflowReducer({actionType})`来生成一个workflowState和对应的reducer。
用`generateWorkflowActionCreator({actionType})`来生成一个`workflowActionCreator:{start, perform, cancel}`.

`workflowActionCreator.start()`实际发出一个`{type: actionType, trigger: OperationTrigger.Start}`的action。`{type: actionType, trigger: OperationTrigger.Start}`的action。
workflowReducer收到这个action后，workflowState根据trigger做出跃迁，
跃迁图如下：


workflowReducer收到这个action后，workflowState根据trigger做出跃迁，
跃迁图如下：

![workflow state 状态机]({{site.url}}/assets/images/workflowState_workflowAction.png)
