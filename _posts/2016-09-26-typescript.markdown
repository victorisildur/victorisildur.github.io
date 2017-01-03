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

除了普通workflow，qcloud团队还对fetch(异步取数据), query(查找)动作进行了抽象，fetch状态机如下：

![fetcher state 状态机]({{site.url}}/assets/images/fetcherState_fetcherTrigger.png)

## vim 快捷键

* 代码自动缩进：ggvG=

## Typescript + React下this.context的问题

要使用this.context，要在父元素定义`getChildContext()`方法，除此以外：

1. 在父组件定义`static childContextTypes = {color: React.PropTypes.string}`, 声明自己传给下面的context是什么类型的。
2. 在要使用`this.context`的子组件，定义`static contextTypes = {color: ReactPropTypes.string}`，声明自己要接受的context是什么类型的。
3. 在要使用`this.context`的子组件，定义context: RootProps. 这感觉是typescript的bug, 否则this.context拿不到。

注意，getChildContext方法不能用在@connect组件上，会报`typeof ProductApp is not assignable to parameter of type 'ComponentClass<{}> | StatelessComponent<{}>`，不知道为什么

注意！！不推荐使用context这个特性！！因为context变动时，子元素不一定会去更新！！

## AutoFocus

需求是form加载的瞬间，光标移到form里的input上。给input加autoFocus属性就行了，其他跟自动的一样.

## typescript module

使用react-ace的过程中报错'cannot find module react-ace'.
这里首先要理解当代码中```import B from 'B'```时，typescript是如何去找到B的。

1. typescript使用类似node的策略去找B模块。具体过程就是一层层往上找，找不到就去node_modules目录找
2. 如果递归结束仍没找到B.ts/B.d.ts，去ambient模块找

这里ambient模块防止/ambient目录下，但暂时不清楚这个路径是tsconfig声明的或者怎样。
总之，在这里新建一个```react-ace.d.ts```，里面用shorthand ambient module语法声明```react-act```模块，就可以```import 'react-act'```了。

## TypeError: Super expression must either be null or a function not undefined

有人提过这个issue, 貌似是React不支持PureComponent的问题，但React是框架提供的，我们不能更新，弃用react-ace??

暂时用```brace```这个库，直接操作dom解决了。

## webpack code split

ace这个库太大了，约700kB，非常有必要code split按需加载。

遇到第一个问题是typescript node.d.ts里定义require函数不含ensure()方法，暂时直接改node.d.ts解决了。
问题是require.d.ts放在子目录里，为什么会影响全局的require定义？

第二个问题是按需文件1.1.js引用url相对于特定页面url:`xx.qq.com/iot/products/demo/1.1.js`。
而编译出的`1.1.js`在根目录。
设置了`webpack.output.publicPath`后解决了`1.1.js`url不对的问题.

第三个问题是`ace/mode/json`需加载`json.js`，会报`ace is not defined`.
这里发现是require('brace'), require('brace/mode/json')顺序问题.
`require.ensure()`只保证1.1.js加载了，具体调用时，只有调用了require('brace')，这个模块里的代码才会把ace注册到window对象上。

## Redux Middleware

先看结论，Middleware是两层库里化的函数：

```javascript
const logger = store => next => action => {
    console.log('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    return result;
}
```

这里store作为第一个库里参数，是为了中间件访问store；
next作为第二个库里参数，是为了store.dispatch链式访问。

applyMiddleware如何让中间件生效呢？它应该在用户声明store后做一次`store.dispatch`的初始化操作：

```javascript
function applyMiddleware(store, middlewares) {
    middlewares.reverse();
    let dispatch = store.dispatch;
    middlewares.forEach(middleware => 
        dispatch = middleware(store)(dispatch)
    });

    return Object.assign({}, store, { dispatch });
}
```

可惜最终代码没有这么直观，而是用到了compose, 对象spread这样的语言特性：

```javascript
export default function applyMiddleware(...middlewares) {
    // modifiedCreateStore = applyMiddleware(middlewares)(createStore)(reducer)
    return (createStore) => (reducer, preloadedState, enhancer) => {
        const store = createStore(reducer, preloadedState, enhancer);
        let dispatch = store.dispatch;
        let chain = [];
        const middlewareAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action)
        }
        chain = middlewares.map(middleware => middleware(middlewareAPI)) // 第一次库里化： 传入store.getState
        dispatch = compose(...chain)(store.dispatch); // 第二次库里化： 传入next
        // 最后得到的dispatch是(action) => state
        return {
            ...store,
            dispatch
        };
    }
}
```

这里可能会奇怪了，我调用applyMiddleware用的是`createStore(reducer, applyMiddleware(thunk, createLogger))`这样啊？
这里内部其实还是用了包装`createStore()`的调用方式：

```javascript
export default function createStore(reducer, preloadedState, enhancer) {
    if (typeof enhancer !== 'undefined') {
        return enhancer(createStore)(reducer, preloadedState);
    }
}
```
