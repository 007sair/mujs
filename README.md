
`MUJS`是一套移动端通用弹层库，包含中间弹出(`default`)、滑动弹出(`slide`)、对话框(`alert`)、提示框(`toast`)、加载框(`loading`)、异步加载等。

整套代码采用原生js，不依赖任何库。css采用`BEM`命名规范，具体请查看源代码。

整体构思参考[layui](http://layer.layui.com/mobile/)，但又不完全一样，加入了个人思想，感谢layui作者！

[预览地址](http://007sair.github.io/demo/mujs/index.html)

## 周期

一个弹层从打开到关闭会经历这几个周期：

1. 插入`dom`
2. 添加`in`动画
3. 弹层打开（触发钩子函数`open`）
4. 弹层关闭
5. 移除`in`动画
6. 销毁弹层（触发钩子函数`close`）

`mu.open()`函数包含了前3个阶段，`mu.close()`包含后3个阶段。

## API

### `mu.open(options)`

核心函数，打开弹层。此方法返回当前弹层的`index`(索引值)，参数`options`为对象，其属性和方法如下：

**`options.type`**

类型：`string`，弹层类型，`default(默认)`、`slide`、`toast`、`alert`、`loading`。

**`options.content`**

类型：`string`/`function`，弹层内容，`string`时直接展示内容，`function`时为异步加载，具体查看demo。

**`options.mask`**

类型：`boolean`，是否显示遮罩层，默认`true`，显示。

**`options.maskClose`**

类型：`boolean`，点击遮罩层是否关闭弹层，默认`true`，可以关闭。

**`options.delay`**

类型：`number`，移除过渡样式后延迟几秒销毁弹层，通常与`css`中定义的过渡`duration`时间一致。默认`0.25s`。

**`options.time`**

类型：`number`，弹层打开后延迟几秒自动关闭，默认不关闭。

**`options.animate`**

类型：`string`/`boolean`，弹层打开时的动画效果。效果有：`scale(默认)`、`fade`、`slide`、`up`。如果为`false`，则不使用动画。动画效果可在css中自定义，具体参考[mu.scss](https://github.com/007sair/mujs/blob/9b682a1db3eefaac62a617fc0d0c93287ae27673/src/mu.scss#L185)

**`options.style`**

类型：`string`，弹层内联样式，可自定义弹层样式。

**`options.className`**

类型：`string`，弹层类名，可自定义弹层样式。

**`options.btn`**

类型：`string`/`array`/`boolean`，弹层类型为`alert`时的按钮属性，`string`时为单个按钮，`array`时为左右两个按钮，左侧按钮触发`no`函数，右侧按钮触发`yes`函数，默认为`false`，不使用按钮。

**`options.open`**

类型：`function`，钩子函数，弹层打开时触发。具体时机为插入dom后。

**`options.close`**

类型：`function`，钩子函数，关闭弹层时触发。具体时机为弹层被销毁后触发。

**`options.yes`**

类型：`function`，类型为`alert`时的确定按钮，单个按钮直接触发`or`多个按钮右侧按钮触发

**`options.no`**

类型：`function`，类型为`alert`时的取消按钮。

### `mu.close(index)`

关闭指定弹层，参数`index`为当前弹层的索引值，指定要关闭的弹层。

### `mu.closeAll()`

关闭所有弹层，无参数。