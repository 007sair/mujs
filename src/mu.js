/**
 弹层
 --------------
 @描述
  动画效果采用 transition（过渡）实现，非 animation（动画）
 @命名规范
  使用BEM命名规范，b和e直接用单横线（-），e和m之间使用双横线（--）
    B：block块，此处为mu_modal
    E：element元素，此处为一些遮罩层，容器等
    M：modifier修饰符，元素状态，此处为in等过渡状态
 @API
    mu.open({
        type: 'default',            // {string} 弹层类型，default（默认）、slide、toast、alert、loading
        content: '',                // {string/function} 弹层内容，字符串时直接展示，函数时请参考demo
        mask: true,                 // {boolean/string} 是否显示遮罩层，默认显示，字符串时可自定义样式
        maskClose: true,            // {boolean} 点击遮罩层是否可以关闭弹层
        delay: .25,                 // {number} 移除过渡样式后多久销毁弹层
        time: 0,                    // {number} 延迟几秒后弹层消失
        animate: 'scale',           // {string} 弹层弹出时的动画类型，scale（默认）、fade、slide、up
        style: '',                  // {string} 设置main容器的style属性
        className: '',              // {string} 设置main容器的自定义样式
        btn: false,                 // {string/array/boolean} alert类型时的按钮文案

        open: function () {},       // {function} 钩子函数，弹层被插入到dom后触发
        close: function () {},      // {function} 钩子函数，弹层被销毁后触发
        yes: function(index) {},    // {function} alert类型的确定按钮，单个或者多个右侧的按钮
        no: function() {}           // {function} alert类型的取消按钮
    });
 @异步关闭弹层:
    mu.open()会返回一个index，在其他地方mu.close(index)即可
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.mu = factory(root);
    }
}(this, function () {

    var pre = 'mu_modal',
        index = 0,
        _mu = {}; // key为index索引，销毁后删除key

    var q = function (cls, isAll) {
        isAll = isAll || false
        if (!isAll) {
            return document.querySelector(cls)
        }
        return document.querySelectorAll(cls)
    };

    // css命名规范
    var bem = function (e, m) { // block = pre  (b:block  e:element  m:modifier)
        return pre + (e ? ('-' + e) : '') + (m ? ('--' + m) : '')
    };

    // 封装dom 根据index获取对应元素
    var dom = function (index) {
        var _wrap = q('#' + pre + '-' + index);
        if (!_wrap) return false;
        var _mask = _wrap.querySelector('.' + bem('mask'));
        var _main = _wrap.querySelector('.' + bem('container')).children[0];
        return {
            wrap: _wrap,
            mask: _mask,
            main: _main
        }
    };

    function Slider(options) {
        this.opts = extend({
            type: 'default', // 弹层类型，默认为中间弹出 目前支持：slide、toast、alert、loading
            content: '', // 弹层内容
            mask: true, // 是否显示遮罩层，默认显示
            maskClose: true, // 点击遮罩层是否可以关闭弹层
            delay: .25, // 关闭弹层时的过渡动画持续时间
            time: 0, // 延迟几秒后消失
            animate: 'scale', // 弹层弹出时的动画类型，目前支持：scale（默认）、fade、slide、up
            style: '', // 设置main容器的style属性
            className: '', // 设置main容器的自定义样式
            btn: false // alert类型时的按钮文案
        }, options);

        this.init();
    }

    Slider.prototype = {
        constructor: Slider,
        init: function (params) {
            // 暴露信息给全局对象
            _mu[index] = {
                config: this.opts,
                duration: {}, // 存放一堆弹层持续时间的定时器对象
                delay: {} // 存放一堆弹层消失后多久销毁的定时器对象
            };
            this.insert()
        },
        insert: function () {
            var me = this, 
                config = this.opts;

            var _wrap = document.createElement('div');
            _wrap.id = pre + '-' + index; // 定义id
            _wrap.className = bem('wrap');
            _wrap.setAttribute('type', config.type);

            q('.' + bem('wrap'), true).forEach(function (_wrap) {
                var type = _wrap.getAttribute('type');
                var index = _wrap.id.split(pre + '-')[1];
                if (type === config.type) { // 同类型弹层只允许出现一个
                    mu.close(index)
                }
            })

            if (config.type === 'toast') {
                config.mask = false;
            }

            if (config.type === 'alert') {
                config.content = '<div class="' + bem('alert_content') + '">' + config.content + '</div>'
            }

            if (config.type === 'slide') {
                config.animate = 'slide'
            }

            if (config.type === 'loading') {
                config.animate = false;
                config.content = config.content ? '<p>'+config.content+'</p>' : config.content
            }

            //按钮区域
            var getButton = (function () {
                typeof config.btn === 'string' && (config.btn = [config.btn]);
                var btns = (config.btn || []).length,
                    btndom;
                if (btns === 0 || !config.btn) {
                    return '';
                }
                config.btn = config.btn.reverse()
                btndom = '<span yes type="1">' + config.btn[0] + '</span>'
                if (btns === 2) {
                    btndom = '<span no type="0">' + config.btn[1] + '</span>' + btndom
                }
                return '<div class="' + bem('alert_btns') + '">' + btndom + '</div>';
            }());

            var mask_cls = [
                bem('mask'),
                config.animate ? bem('fade') : '' // 遮罩层固定使用fade或false
            ].join(' ');

            var main_cls = [
                bem('main'),
                bem(config.type), // 主类型类名，控制元素的展现形式，slide就定位，toast就半透明居中
                (config.from ? bem(config.type + '_' + config.from) : null), // 元素过渡前的位置，slide中使用
                (config.className ? config.className : null), // 自定义类名
                config.animate ? bem(config.animate) : ''
            ].filter(function (cls) { return cls }).join(' ');

            // async load content
            if (typeof config.content === 'function') {
                config.content = config.content.call(this, function (content) {
                    dom(me.index).main.innerHTML = content
                })
            }

            _wrap.innerHTML = [
                (config.mask ? '<div style="'+ (typeof config.mask === 'string' ? config.mask : '') +'" class="' + mask_cls + '"></div>' : ''),
                '<div class="' + bem('container') + '">',
                    '<div class="' + main_cls + '" style="' + (config.style ? config.style : '') + '">',
                        (config.title ? '<div class="' + bem('title') + '">' + config.title + '</div>' : ''),
                        config.content,
                        config.btn ? getButton : '',
                    '</div>',
                '</div>',
            ].join('');

            q('body').appendChild(_wrap);

            this.index = index++;
            this.emit(config);

            typeof _mu[this.index].config.open === 'function' && _mu[this.index].config.open.call(this)
        },
        emit: function (config) {
            var me = this,
                el = dom(this.index);

            el.wrap.offsetWidth; // 效果等同于 setTimeout 0 不加此语句在添加in时，元素无法产生过渡效果
            config.animate && addClass(el.main, bem(config.animate, 'in'))
            if (config.mask && el.mask) {
                config.animate && addClass(el.mask, bem('fade', 'in')) // 遮罩层固定使用fade或false
                config.maskClose && el.mask.addEventListener('click', function () {
                    mu.close(me.index)
                })
            }

            if (config.btn) {
                var btns = q('.' + bem('alert_btns') + ' ' + 'span', true);
                btns.forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        var type = this.getAttribute('type');
                        if (type == 0) {
                            config.no && config.no();
                            mu.close(me.index);
                        } else {
                            config.yes ? config.yes(me.index) : mu.close(me.index);
                        }
                    })
                })
            }

            if (config.time) {
                _mu[this.index].duration = setTimeout(function () {
                    mu.close(me.index)
                }, config.time * 1000);
            }

        }

    };

    // Tools
    function extend(target, options) {
        for (var n in options) {
            target[n] = options[n];
        }
        return target;
    }

    function hasClass(ele, cls) {
        cls = cls || '';
        if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
        return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
    }

    function addClass(ele, cls) {
        if (!hasClass(ele, cls)) {
            ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
        }
    }

    function removeClass(ele, cls) {
        if (hasClass(ele, cls)) {
            var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
            while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                newClass = newClass.replace(' ' + cls + ' ', ' ');
            }
            ele.className = newClass.replace(/^\s+|\s+$/g, '');
        }
    }

    function removeNode(node, pNode) {
        pNode = pNode || q('body')
        if (node.parentNode === pNode) {
            pNode.removeChild(node)
        }
    }

    return {
        v: '1.0.0',
        open: function (options) {
            var slider = new Slider(options || {});
            return slider.index
        },
        close: function (index) {
            var el = dom(index);
            if (!el) return;

            var config = _mu[index].config;

            el.mask && removeClass(el.mask, bem('fade', 'in'))
            removeClass(el.main, bem(config.animate, 'in'))

            var _delay = config.animate ? config.delay * 1000 : 0;

            clearTimeout(_mu[index].delay)
            _mu[index].delay = setTimeout(function () {
                removeNode(el.wrap)
                typeof _mu[index].config.close === 'function' && _mu[index].config.close()
                delete _mu[index]
            }, _delay);
        },
        closeAll: function () {
            var wraps = q('.' + bem('wrap'), true);
            if (wraps.length) {
                wraps.forEach(function (wrap) {
                    removeNode(_wrap)
                })
            }
        }
    }

}));