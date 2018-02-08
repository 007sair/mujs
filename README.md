
`MUJS`是一套移动端通用弹层库，包含中间弹出(`default`)、滑动弹出(`slide`)、对话框(`alert`)、提示框(`toast`)、加载框(`loading`)、异步加载等。

整套代码采用原生js，不依赖任何库。css采用`BEM`命名规范，具体请查看源代码。

整体构思参考[layui](http://layer.layui.com/mobile/)，但又不完全一样，加入了个人思想，感谢layui作者！

[预览地址](http://007sair.github.io/demo/mujs/index.html)

## API

### `mu.open(options)`

核心函数，此方法返回当前弹层的`index`(索引值)，参数`options`为对象，其属性和方法如下：

**`options.type`**

类型：`string`，弹层类型，`default(默认)`、`slide`、`toast`、`alert`、`loading`。

**`options.content`**

类型：`string`/`function`，弹层内容，`string`时直接展示内容，`function`时为异步加载，具体查看demo。

**`options.mask`**

类型：`boolean`，是否显示遮罩层，默认`true`，显示。

**`options.maskClose`**

类型：`boolean`，点击遮罩层是否关闭弹层，默认`true`，可以关闭。

**`options.delay`**

类型：`number`，移除过渡样式后多久销毁弹层，通常与`css`中定义的过渡`duration`时间一致。默认`0.25s`，注意单位是秒级。

**`options.time`**

类型：`number`，延迟`time(s)`后弹层消失，默认不消失

**`options.animate`**

类型：`string`/`boolean`，弹层弹出时的动画效果。类型有：`scale(默认)`、`fade`、`slide`、`up`。如果为`false`，则不使用动画。

**`options.style`**

类型：`string`，弹层内联样式，可自定义弹层样式

**`options.className`**

类型：`string`，弹层类名，可自定义弹层样式

**`options.type`**

类型：`string`，弹层类名，可自定义弹层样式

**`options.btn`**

类型：`string`/`array`/`boolean`，`alert`类型时的按钮，字符串时为单个按钮，数组时为双按钮，右侧按钮触发`yes`函数，默认不使用

**`options.open`**

类型：`function`，钩子函数，弹层被插入到dom后触发

**`options.close`**

类型：`function`，钩子函数，弹层被销毁后触发

**`options.yes`**

类型：`function`，`alert`类型的确定按钮，单个或者多个右侧的按钮

**`options.no`**

类型：`function`，`alert`类型的取消按钮

### `mu.close(index)`

关闭指定弹层，参数`index`为当前弹层的索引值，指定要关闭的弹层。

### `mu.closeAll()`

关闭所有弹层，无参数。