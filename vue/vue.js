/*!
 * Vue.js v2.4.0
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
/**
 * 立即执行函数
 * @param global   当前上下文
 * @param factory  工厂函数，返回Vue构造函数
 */
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Vue = factory());
}(this, (function() {
    'use strict';

    /*  */

    // these helpers produces better vm code in JS engines due to their
    // explicitness and function inlining
    // 判断一个对象是否是空的
    function isUndef(v) {
        return v === undefined || v === null
    }
    // 判断一个对象是否不为空
    function isDef(v) {
        return v !== undefined && v !== null
    }
    // 判断v是否为true
    function isTrue(v) {
        return v === true
    }
    // 判断v是否为false
    function isFalse(v) {
        return v === false
    }

    /**
     * Check if value is primitive
     * 判断value是否是string类型或者number类型
     */
    function isPrimitive(value) {
        return typeof value === 'string' || typeof value === 'number'
    }

    /**
     * Quick object check - this is primarily used to tell
     * Objects from primitive values when we know the value
     * is a JSON-compliant type.
     * 判断obj是否为一个对象（不是函数）
     * typeof function 为 “function”
     */
    function isObject(obj) {
        return obj !== null && typeof obj === 'object'
    }
    // _toString, Object.prototype.toString方法的别名
    var _toString = Object.prototype.toString;

    /**
     * Strict object type check. Only returns true
     * for plain JavaScript objects.
     * 判断是否是标准的js对象（而不是函数，数组等），只是{a:"***", b : "***"}
     */
    function isPlainObject(obj) {
        return _toString.call(obj) === '[object Object]'
    }
    /**
     * 判断是否是正则表达式对象
     */
    function isRegExp(v) {
        return _toString.call(v) === '[object RegExp]'
    }

    /**
     * Check if val is a valid array index.
     * 判断val是否是合法的数组下标
     */
    function isValidArrayIndex(val) {
        var n = parseFloat(val);
        return n >= 0 && Math.floor(n) === n && isFinite(val)
    }

    /**
     * Convert a value to a string that is actually rendered.
     * 将val转化为字符串
     */
    function toString(val) {
        return val == null
            ? ''
            : typeof val === 'object'
                ? JSON.stringify(val, null, 2)
                : String(val)
    }

    /**
     * Convert a input value to a number for persistence.
     * If the conversion fails, return original string.
     * 将val转化为number，如果转化失败，返回原来的val
     */
    function toNumber(val) {
        var n = parseFloat(val);
        return isNaN(n) ? val : n
    }

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     * 创建一个map
     * makeMap会返回一个函数，然后调用这个函数，检查val值是否已经存在
     */
    function makeMap(str,
                     expectsLowerCase) {
        var map = Object.create(null);
        var list = str.split(',');
        for(var i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase
            ? function(val) {
                return map[val.toLowerCase()];
            }
            : function(val) {
                return map[val];
            }
    }

    /**
     * Check if a tag is a built-in tag.
     * 判断一个标签是否是一个built-in标签， built-in标签包括slot、component
     * isBuiltTag是一个函数，调用isBulitTag，判断输入的参数是否是slot、compoment
     */
    var isBuiltInTag = makeMap('slot,component', true);

    /**
     * Check if a attribute is a reserved attribute.
     * 判断一个属性是否是保留的属性
     * isReservedAttribute是一个函数，调用isReservedAttribute，判断输入的参数是否是key、ref、slot、is
     */
    var isReservedAttribute = makeMap('key,ref,slot,is');

    /**
     * Remove an item from an array
     * 从数组中删除一个值
     */
    function remove(arr, item) {
        if(arr.length) {
            var index = arr.indexOf(item);
            if(index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Check whether the object has the property.
     * hasOwnProperty方法是Object.prototype.hasOwnProperty方法的别名
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * 检查对象obj中是否含有属性key
     * 调用Object.prototype.hasOwnProperty方法， 检查对象obj是否含有属性key
     */
    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    /**
     * Create a cached version of a pure function.
     * 构造一个缓存
     * cached(fn)会返回一个函数returnFn.（利用了闭包的原理，封装了cache）
     * 调用returnFn，读取传入参数str在缓存cache中的结果。如果没有，利用fn方法，返回结果
     */
    function cached(fn) {
        var cache = Object.create(null);
        return (function cachedFn(str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str))
        })
    }

    /**
     * Camelize a hyphen-delimited string.
     */
    var camelizeRE = /-(\w)/g;
    var camelize = cached(function(str) {
        return str.replace(camelizeRE, function(_, c) {
            return c ? c.toUpperCase() : '';
        })
    });

    /**
     * Capitalize a string.
     */
    var capitalize = cached(function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    });

    /**
     * Hyphenate a camelCase string.
     */
    var hyphenateRE = /([^-])([A-Z])/g;
    var hyphenate = cached(function(str) {
        return str
            .replace(hyphenateRE, '$1-$2')
            .replace(hyphenateRE, '$1-$2')
            .toLowerCase()
    });

    /**
     * Simple bind, faster than native
     * 将一个函数和它的执行上下文封装起来，生成一个boundFn函数
     * 以后这个boundFn函数执行的时候，fn函数都是由ctx来调用
     * @param    fn        需要封装的函数
     * @param    ctx       函数执行上下文
     */
    function bind(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length;
            return l
                ? l > 1
                    ? fn.apply(ctx, arguments)
                    : fn.call(ctx, a)
                : fn.call(ctx)
        }

        // record original fn length
        boundFn._length = fn.length;
        return boundFn
    }

    /**
     * Convert an Array-like object to a real Array.
     * 将类数组对象转化为一个真正的数组
     */
    function toArray(list, start) {
        start = start || 0;
        var i = list.length - start;
        var ret = new Array(i);
        while(i--) {
            ret[i] = list[i + start];
        }
        return ret
    }

    /**
     * Mix properties into target object.
     * 扩展， 将from对象的属性添加到to对象中
     */
    function extend(to, _from) {
        for(var key in _from) {
            to[key] = _from[key];
        }
        return to
    }

    /**
     * Merge an Array of Objects into a single Object.
     */
    function toObject(arr) {
        var res = {};
        for(var i = 0; i < arr.length; i++) {
            if(arr[i]) {
                extend(res, arr[i]);
            }
        }
        return res
    }

    /**
     * Perform no operation.
     * Stubbing args to make Flow happy without leaving useless transpiled code
     * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
     */
    function noop(a, b, c) {
    }

    /**
     * Always return false.
     */
    var no = function(a, b, c) {
        return false;
    };

    /**
     * Return same value
     */
    var identity = function(_) {
        return _;
    };

    /**
     * Generate a static keys string from compiler modules.
     */
    function genStaticKeys(modules) {
        return modules.reduce(function(keys, m) {
            return keys.concat(m.staticKeys || [])
        }, []).join(',')
    }

    /**
     * Check if two values are loosely equal - that is,
     * if they are plain objects, do they have the same shape?
     */
    function looseEqual(a, b) {
        var isObjectA = isObject(a);
        var isObjectB = isObject(b);
        if(isObjectA && isObjectB) {
            try {
                return JSON.stringify(a) === JSON.stringify(b)
            } catch(e) {
                // possible circular reference
                return a === b
            }
        } else if(!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for(var i = 0; i < arr.length; i++) {
            if(looseEqual(arr[i], val)) {
                return i
            }
        }
        return -1
    }

    /**
     * Ensure a function is called only once.
     * 确保函数只会被调用一次
     */
    function once(fn) {
        var called = false;
        return function() {
            if(!called) {
                called = true;
                fn.apply(this, arguments);
            }
        }
    }

    var SSR_ATTR = 'data-server-rendered';
    // Vue.js默认提供的资源类型
    var ASSET_TYPES = [
        // 组件
        'component',
        // 指令
        'directive',
        // 过滤器
        'filter'
    ];
    // 生命周期钩子，对应为回调函数
    // 每个Vue实例在被创建之前都要经过一系列的初始化过程。例如要设置数据监听、编译模板
    // 挂载实例到DOM、在数据变化时更新DOM。同时在这个过程也会运行一些叫做生命周期钩子的函数，
    // 给予用户在一些特定的场景下添加用户自己代码的机会
    var LIFECYCLE_HOOKS = [
        // 在实例初始化之后，数据观测（data observer）和 event/watcher事件配置之前调用
        'beforeCreate',
        // 实例已经创建完成之后被调用。在这一步，实例已经完成以下的配置:
        // 数据观测（data observer）、属性和方法的运算、watch/event事件回调。
        // 然后， 挂载阶段还没有开始，$el属性目前不可见
        'created',
        // 在挂载开始之前被调用：相关的 render 函数首次被调用
        // 该钩子在服务器端渲染期间不可被调用
        'beforeMount',
        // el被新创建的 vm.$el替换， 并挂载到实例上去之后调用该钩子。
        // 注意， mounted 不会承诺所有的子组件也都一起被挂载。
        'mounted',
        // 数据更新时调用， 发生在虚拟DOM 重新渲染和打补丁之前。
        // 可以在这个钩子中进一步地更改状态， 这不会触发附加的重渲染过程。
        'beforeUpdate',
        // 由于数据更改， 导致的虚拟DOM 重新渲染和打补丁，在这之后会调用该钩子
        'updated',
        // 实例销毁之前调用。在这一步， 实例仍然完全可用
        'beforeDestroy',
        // Vue实例销毁之后调用。调用之后，Vue实例指示的所有东西都会解除绑定
        // 所有的事件监听器会被移除， 所有的子实例也会被销毁
        'destroyed',
        // keep-alive组件激活时调用
        'activated',
        // keep-alive组件停用时被调用
        'deactivated'
    ];

    /*  */
    // Vue的全局配置对象
    var config = ({
        /**
         * Option merge strategies (used in core/util/options)
         * 自定义合并策略的选项。
         * 合并策略选项分别接受第一个参数作为父实例，第二个参数作为子实例，
         * Vue实例上下文被作为第三个参数传入
         */
        optionMergeStrategies : Object.create(null),

        /**
         * Whether to suppress warnings.
         * 是否取消Vue所有的日志与警告
         */
        silent : false,

        /**
         * Show production mode tip message on boot?
         * 设置为false， 以组织vue在启动时生成生产提示
         */
        productionTip : "development" !== 'production',

        /**
         * Whether to enable devtools
         * 配置是否允许使用vue-devtools检查代码，开发版本默认为true，生产版本默认为false
         */
        devtools : "development" !== 'production',

        /**
         * Whether to record perf
         */
        performance : false,

        /**
         * Error handler for watcher errors
         * 指定组件的渲染和观察期间未捕获错误的处理函数。
         * 这个处理函数被调用的时候， 可获取错误信息和Vue实例。
         */
        errorHandler : null,

        /**
         * Warn handler for watcher warns
         * 为Vue的运行时警告赋予一个自定义句柄。
         * （这个只会在开发者环境下生效，在生产环境下会被忽略掉）
         */
        warnHandler : null,

        /**
         * Ignore certain custom elements
         * 须使Vue忽略在Vue之外的自定义元素。
         * （否则， 它会假设你忘记注册全局组件或者平措了组件名称， 从而抛出一个关于
         *   Unkonwn custom element 的警告）
         */
        ignoredElements : [],

        /**
         * Custom user key aliases for v-on
         * 给v-on自定义键位别名
         */
        keyCodes : Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         * 检查标签是否是保留的。
         * 如果标签是保留的，那就不能不注册为组件
         */
        isReservedTag : no,

        /**
         * Check if an attribute is reserved so that it cannot be used as a component
         * prop. This is platform-dependent and may be overwritten.
         * 检查一个属性是否是保留的。
         * 如果一个属性是保留的，那就不能作为component的prop使用
         */
        isReservedAttr : no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         * 检查一个标签是否是未知的元素
         */
        isUnknownElement : no,

        /**
         * Get the namespace of an element
         * 获取标签的命名空间
         */
        getTagNamespace : noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName : identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp : no,

        /**
         * Exposed for legacy reasons
         */
        _lifecycleHooks : LIFECYCLE_HOOKS
    });

    /*  */
    // 定义一个冻结对象，对象的属性不可添加、不可修改、不可配置
    var emptyObject = Object.freeze({});

    /**
     * Check if a string starts with $ or _
     * 检查一个字符串是否是保留的，即以$开头或者以_开头
     */
    function isReserved(str) {
        var c = (str + '').charCodeAt(0);
        return c === 0x24 || c === 0x5F
    }

    /**
     * Define a property.
     * 给对象定义一个属性,改属性默认可枚举、可配置、可修改
     * def方法是Object.defineProperty()方法的缩写
     */
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value : val,
            enumerable : !!enumerable,
            writable : true,
            configurable : true
        });
    }

    /**
     * Parse simple path.
     */
    var bailRE = /[^\w.$]/;

    /**
     * 返回一个函数。执行这个函数，会返回path在obj中对应的结果
     * 一般是用来生成watcher的getter方法，执行getter方法，返回watcher的value值
     * @param path
     * @return {Function}
     */
    function parsePath(path) {
        if(bailRE.test(path)) {
            return
        }
        var segments = path.split('.');
        return function(obj) {
            for(var i = 0; i < segments.length; i++) {
                if(!obj) {
                    return
                }
                obj = obj[segments[i]];
            }
            return obj
        }
    }

    /*  */

    var warn = noop;
    var tip = noop;
    var formatComponentName = (null); // work around flow check

    {
        var hasConsole = typeof console !== 'undefined';
        var classifyRE = /(?:^|[-_])(\w)/g;
        var classify = function(str) {
            return str
                .replace(classifyRE, function(c) {
                    return c.toUpperCase();
                })
                .replace(/[-_]/g, '');
        };

        warn = function(msg, vm) {
            var trace = vm ? generateComponentTrace(vm) : '';

            if(config.warnHandler) {
                config.warnHandler.call(null, msg, vm, trace);
            } else if(hasConsole && (!config.silent)) {
                console.error(("[Vue warn]: " + msg + trace));
            }
        };

        tip = function(msg, vm) {
            if(hasConsole && (!config.silent)) {
                console.warn("[Vue tip]: " + msg + (
                    vm ? generateComponentTrace(vm) : ''
                ));
            }
        };

        formatComponentName = function(vm, includeFile) {
            if(vm.$root === vm) {
                return '<Root>'
            }
            var name = typeof vm === 'string'
                ? vm
                : typeof vm === 'function' && vm.options
                    ? vm.options.name
                    : vm._isVue
                        ? vm.$options.name || vm.$options._componentTag
                        : vm.name;

            var file = vm._isVue && vm.$options.__file;
            if(!name && file) {
                var match = file.match(/([^/\\]+)\.vue$/);
                name = match && match[1];
            }

            return (
                (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
                (file && includeFile !== false ? (" at " + file) : '')
            )
        };

        var repeat = function(str, n) {
            var res = '';
            while(n) {
                if(n % 2 === 1) {
                    res += str;
                }
                if(n > 1) {
                    str += str;
                }
                n >>= 1;
            }
            return res
        };

        var generateComponentTrace = function(vm) {
            if(vm._isVue && vm.$parent) {
                var tree = [];
                var currentRecursiveSequence = 0;
                while(vm) {
                    if(tree.length > 0) {
                        var last = tree[tree.length - 1];
                        if(last.constructor === vm.constructor) {
                            currentRecursiveSequence++;
                            vm = vm.$parent;
                            continue
                        } else if(currentRecursiveSequence > 0) {
                            tree[tree.length - 1] = [last, currentRecursiveSequence];
                            currentRecursiveSequence = 0;
                        }
                    }
                    tree.push(vm);
                    vm = vm.$parent;
                }
                return '\n\nfound in\n\n' + tree
                    .map(function(vm, i) {
                        return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
                            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
                            : formatComponentName(vm)));
                    })
                    .join('\n')
            } else {
                return ("\n\n(found in " + (formatComponentName(vm)) + ")")
            }
        };
    }

    /*  */

    function handleError(err, vm, info) {
        if(config.errorHandler) {
            config.errorHandler.call(null, err, vm, info);
        } else {
            {
                warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
            }
            /* istanbul ignore else */
            if(inBrowser && typeof console !== 'undefined') {
                console.error(err);
            } else {
                throw err
            }
        }
    }

    /*  */
    /* globals MutationObserver */

    // can we use __proto__?
    // 判断是否可用 _proto_ 属性
    var hasProto = '__proto__' in {};

    // Browser environment sniffing
    // 判断是否是浏览器环境
    var inBrowser = typeof window !== 'undefined';
    // 获取浏览器的参数
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    // 判断是否是IE浏览器
    var isIE = UA && /msie|trident/.test(UA);
    // 判断是否是IE9浏览器
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
    // 判断是否是Edge浏览器
    var isEdge = UA && UA.indexOf('edge/') > 0;
    // 判断是否是Android浏览器
    var isAndroid = UA && UA.indexOf('android') > 0;
    // 判断是否是IOS内核浏览器
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
    // 判断是否是chrome浏览器
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

    // Firefix has a "watch" function on Object.prototype...
    // 原生的js对象属性监听器
    var nativeWatch = ({}).watch;

    var supportsPassive = false;
    if(inBrowser) {
        try {
            var opts = {};
            Object.defineProperty(opts, 'passive', ({
                get : function get() {
                    /* istanbul ignore next */
                    supportsPassive = true;
                }
            })); // https://github.com/facebook/flow/issues/285
            window.addEventListener('test-passive', null, opts);
        } catch(e) {
        }
    }

    // this needs to be lazy-evaled because vue may be required before
    // vue-server-renderer can set VUE_ENV
    var _isServer;
    var isServerRendering = function() {
        if(_isServer === undefined) {
            /* istanbul ignore if */
            if(!inBrowser && typeof global !== 'undefined') {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global['process'].env.VUE_ENV === 'server';
            } else {
                _isServer = false;
            }
        }
        return _isServer
    };

    // detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

    /* istanbul ignore next */
    // 判断构造函数是否是原生的而不是用户定义的，比如Object构造函数就是原生的
    function isNative(Ctor) {
        return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
    }
    // 判断浏览器是否支持Symbol
    var hasSymbol =
        typeof Symbol !== 'undefined' && isNative(Symbol) &&
        typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

    /**
     * Defer a task to execute it asynchronously.延迟任务，使得可以异步执行
     * Vue.js默认异步更新DOM
     * nextTick方法实际上是queueNextTick方法的别名
     * nextTick有异步操作对象，有一个pending状态
     * 当pending为false，表明这个nextTick的promise对象还没有注册resolve的回调函数；
     *   pending为true， 表明这个nextTick的promise对象已经注册了resolve的回调函数；
     */
    var nextTick = (function() {
        // 回调函数集合
        var callbacks = [];
        //  是否是待定，和promise对象的状态一样
        var pending = false;
        var timerFunc;
        // 执行回调函数
        function nextTickHandler() {
            // 设置状态为false，表示已经完成了
            pending = false;
            var copies = callbacks.slice(0);
            callbacks.length = 0;
            for(var i = 0; i < copies.length; i++) {
                copies[i]();
            }
        }

        // the nextTick behavior leverages the microtask queue, which can be accessed
        // via either native Promise.then or MutationObserver.
        // MutationObserver has wider support, however it is seriously bugged in
        // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
        // completely stops working after triggering a few times... so, if native
        // Promise is available, we will use it:
        /* istanbul ignore if */
        // Promise是ES6的一个新特性
        if(typeof Promise !== 'undefined' && isNative(Promise)) {
            // 静态方法Promise.resolve() 可以任务是new Promise()方法的便捷方式
            // like Promise.resolve(42) => new Promise(function(resolve){resolve(42)})
            // 此时p的状态是已解决的
            var p = Promise.resolve();
            var logError = function(err) {
                console.error(err);
            };
            timerFunc = function() {
                // 这一步， 主要是为了异步调用nextTickHandler
                p.then(nextTickHandler).catch(logError);
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if(isIOS) {
                    setTimeout(noop);
                }
            };
        } else if(typeof MutationObserver !== 'undefined' && (
                isNative(MutationObserver) ||
                // PhantomJS and iOS 7.x
                MutationObserver.toString() === '[object MutationObserverConstructor]'
            )) {
            // use MutationObserver where native Promise is not available,
            // e.g. PhantomJS IE11, iOS7, Android 4.4
            var counter = 1;
            var observer = new MutationObserver(nextTickHandler);
            var textNode = document.createTextNode(String(counter));
            observer.observe(textNode, {
                characterData : true
            });
            timerFunc = function() {
                counter = (counter + 1) % 2;
                textNode.data = String(counter);
            };
        } else {
            // fallback to setTimeout
            /* istanbul ignore next */
            timerFunc = function() {
                setTimeout(nextTickHandler, 0);
            };
        }
        // cb代表异步执行的回调函数， ctx代表回调函数执行的上下文环境。
        return function queueNextTick(cb, ctx) {
            var _resolve;
            // 收集回调函数，然后通知
            callbacks.push(function() {
                if(cb) {
                    try {
                        cb.call(ctx);
                    } catch(e) {
                        handleError(e, ctx, 'nextTick');
                    }
                } else if(_resolve) {
                    _resolve(ctx);
                }
            });
            //
            if(!pending) {
                pending = true;
                timerFunc();
            }
            if(!cb && typeof Promise !== 'undefined') {
                return new Promise(function(resolve, reject) {
                    _resolve = resolve;
                })
            }
        }
    })();
    // 定义set， 如果浏览器支持Set， 则使用原生的Set；如果不支持， 则使用自定义的Set方法
    var _Set;
    /* istanbul ignore if */
    if(typeof Set !== 'undefined' && isNative(Set)) {
        // use native Set when available.
        _Set = Set;
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        // 如果浏览器不支持Set， 则构造一个Set，用以创建Set实例
        _Set = (function() {
            // 自定义的Set构造函数
            function Set() {
                this.set = Object.create(null);
            }
            Set.prototype.has = function has(key) {
                return this.set[key] === true
            };
            Set.prototype.add = function add(key) {
                this.set[key] = true;
            };
            Set.prototype.clear = function clear() {
                this.set = Object.create(null);
            };

            return Set;
        }());
    }

    /*  */


    var uid = 0;

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     * 一个依赖是可观察的， 多个指令可订阅他？？
     * Dep类是一个简单的观察者模式的实现？？
     */
    var Dep = function Dep() {
        // this-> Dep对象实例
        this.id = uid++;
        // subs用来存储所有订阅他的Watcher
        this.subs = [];
    };
    /**
     * 将订阅Dep对象实例的Watcher对象实例，添加到Dep对象实例的subs中
     * @param sub  Watcher(监听器)对象实例
     */
    Dep.prototype.addSub = function addSub(sub) {
        // Dep对象实例添加订阅它的Watcher
        this.subs.push(sub);
    };
    /**
     * 从Dep对象实例的subs中，移除Watcher对象实例
     * @param sub  Watcher（监听器）
     */
    Dep.prototype.removeSub = function removeSub(sub) {
        // Dep对象实例移除订阅它的Watcher
        remove(this.subs, sub);
    };
    /**
     * 监听器订阅Dep对象实例，将Dep对象实例添加到监听器的订阅列表中（一个监听器可订阅多个Dep对象实例）
     * 同时将监听器添加到Dep对象实例的监听列表中（一个Dep对象实例可被多个监听器订阅）
     */
    Dep.prototype.depend = function depend() {
        // 把当前Dep对象实例添加到当前正在计算的Watcher的依赖中
        if(Dep.target) {
            Dep.target.addDep(this);
        }
    };
    /**
     * Dep对象实例通知订阅它的watcher实例执行update操作
     */
    Dep.prototype.notify = function notify() {
        // stabilize the subscriber list first
        var subs = this.subs.slice();
        // 遍历所有的订阅Watcher，然后调用他们的update方法
        for(var i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    };

    // the current target watcher being evaluated.
    // this is globally unique because there could be only one
    // watcher being evaluated at any time.
    // Dep.target表示当前正在计算的Watcher（监听器）
    // 这是全局唯一的， 因为任何时候只会有一个Watcher(监听器)在运行
    Dep.target = null;
    var targetStack = [];
    // Dep到底是干啥的？？
    // Dep.target表达当前正在计算的Watcher。如果Dep.target存在，表示需要计算的_target(Warcher)的优先级
    // 比当前正在计算的Dep.target的优先级更高，需要把Dep.target入栈，优先处理_target
    function pushTarget(_target) {
        if(Dep.target) {
            targetStack.push(Dep.target);
        }
        Dep.target = _target;
    }
    function popTarget() {
        Dep.target = targetStack.pop();
    }

    /*
     * not type checking this file because flow doesn't play well with
     * dynamically accessing methods on Array prototype
     */
    // 数组Array原型
    var arrayProto = Array.prototype;
    // 利用数组Array原型对象构造arrayMethods对象
    // 使得arrayMethods对象继承Array原型对象（arrayMethods对象的_prop_属性指向Array原型对象）
    //
    var arrayMethods = Object.create(arrayProto);
    [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
        .forEach(function(method) {
            // cache original method
            // 缓存Array原生的push、pop、shift、unshift、splice、sort、reverse方法
            var original = arrayProto[method];
            // 给对象arrayMethods添加push、pop、shift、unshift、splice、sort、reverse属性， 属性对应的职位mutator
            // 调用arrayMethods.push(), arrayMethods.pop(), arrayMethods.shift(), arrayMethods.unshift(),
            // arrayMethods.splice(), arrayMethods.sort(), arrayMethods.reverse()方法都是调用mutator方法
            def(arrayMethods, method, function mutator() {
                var args = [], len = arguments.length;
                while(len--) args[len] = arguments[len];

                var result = original.apply(this, args);
                var ob = this.__ob__;
                var inserted;
                switch(method) {
                    case 'push':
                    case 'unshift':
                        inserted = args;
                        break
                    case 'splice':
                        inserted = args.slice(2);
                        break
                }
                if(inserted) {
                    ob.observeArray(inserted);
                }
                // notify change
                ob.dep.notify();
                return result
            });
        });

    /*  */
    // 获取arrayMethods对象属性，生成一个数组[push, pop, shift, unshift, splice, sort, reverse]
    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

    /**
     * By default, when a reactive property is set, the new value is
     * also converted to become reactive. However when passing down props,
     * we don't want to force conversion because the value may be a nested value
     * under a frozen data structure. Converting it would defeat the optimization.
     */
    var observerState = {
        shouldConvert : true
    };

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     * observer实例的构造函数
     * observer实例会绑定被观测的对象。 一旦绑定，oberser实例会将被观测的对象的属性
     * 转化为getter/setter类型
     */
    var Observer = function Observer(value) {
        // this->Observer实例
        this.value = value;
        // 创建一个Dep对象实例
        this.dep = new Dep();
        this.vmCount = 0;
        // 把创建的Observer对象实例添加到value对象的_ob属性上
        // value._ob_ -> this
        def(value, '__ob__', this);
        // 如果value是数组的话，遍历数组，递归调用observe方法，最终都会调用walk方法观察单个元素；
        // 如果value单个元素的话， 直接调用walk方法观察
        if(Array.isArray(value)) {
            var augment = hasProto
                ? protoAugment
                : copyAugment;
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            // 遍历value的属性，将value的每一个属性进行转换，让他们拥有getter/setter方法，将属性转化为响应式属性
            this.walk(value);
        }
    };

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     * Observer对象实例的方法。
     *遍历value对象的属性，将value的每一个属性进行转换，让他们拥有getter/setter方法， 将属性转化为响应式属性。
     */
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj);
        for(var i = 0; i < keys.length; i++) {
            // 遍历obj的属性，给obj的每一个属性都赋予getter/setter方法。这样一旦属性被访问或者更新，这样我们就可以追踪到这些变化
            defineReactive$$1(obj, keys[i], obj[keys[i]]);
        }
    };

    /**
     * Observe a list of Array items.
     * 如果观察的对象是数组，遍历这个数组的元素，递归调用observe方法观察数组元素
     */
    Observer.prototype.observeArray = function observeArray(items) {
        for(var i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    };

    // helpers

    /**
     * Augment an target Object or Array by intercepting
     * the prototype chain using __proto__
     * 设置继承， 使得target继承src
     */
    function protoAugment(target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src;
        /* eslint-enable no-proto */
    }

    /**
     * Augment an target Object or Array by defining
     * hidden properties.
     * 复制src对象中keys属性并添加到target对象中
     */

    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for(var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            def(target, key, src[key]);
        }
    }

    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     * 给value创建一个观察者实例，返回新创建的观察者或者已经存在的观察者
     */
    function observe(value, asRootData) {
        // 如果value不是对象， 直接返回
        if(!isObject(value)) {
            return
        }
        var ob;
        // oberver方法首先会判断要监听的对象value，是否已经拥有一个Observer对象实例
        // 如果有，就直接使用，没有的话，需要重新建立一个
        if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            // 如果value对象已经有observer了，直接返回
            ob = value.__ob__;
        } else if(
            observerState.shouldConvert &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            // 如果value是Vue实例对象， 则不需要为Vuel对象实例创建observer对象
            !value._isVue
        ) {
            // 创建value对象的observer，将value的属性转化为响应式属性
            ob = new Observer(value);
        }
        if(asRootData && ob) {
            ob.vmCount++;
        }
        // 返回observer实例
        return ob
    }

    /**
     * Define a reactive property on an Object.
     * 给对象Object定义一个响应式属性,
     * 该方法最核心的部分，就是通过Object.defineProperty 给data的每个属性添加getter、setter方法。
     * 定义一个响应式属性的时候，该属性会有一个Dep对象实例。
     * 在创建Vue实例的过程中，会给Vue实例构建一个监听器。
     * 当读取这个响应式属性的时候，会把响应式属性的Dep对象实例添加到当前监听器的订阅列表中
     *     同时也会把当前监听器添加到响应式属性的Dep对象实例的监听器列表中
     * 当响应属性发生变化的时候，Dep对象实例将会通知变化。遍历监听器列表，让监听器执行update操作
     * @param  obj
     * @param  key   属性名
     * @param  val   属性值
     */
    function defineReactive$$1(obj,
                               key,
                               val,
                               customSetter,
                               shallow) {
        // 每一个响应式属性都会有一个 Dep对象实例， 该对象实例会存储订阅它的Watcher对象实例
        var dep = new Dep();
        // 获取对象属性key的描述对象
        var property = Object.getOwnPropertyDescriptor(obj, key);
        // 如果属性是不可配置的，则直接返回
        if(property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get;
        var setter = property && property.set;

        var childOb = !shallow && observe(val);
        // 重新定义对象obj的属性key
        Object.defineProperty(obj, key, {
            enumerable : true,
            configurable : true,
            get : function reactiveGetter() {
                // 当obj的某个属性被访问的时候，就会调用getter方法。
                var value = getter ? getter.call(obj) : val;
                // 当Dep.target不为空时，调用dep.depend 和 childOb.dep.depend方法做依赖收集
                if(Dep.target) {
                    dep.depend();
                    if(childOb) {
                        childOb.dep.depend();
                    }
                    // 如果访问的是一个数组， 则会遍历这个数组， 收集数组元素的依赖
                    if(Array.isArray(value)) {
                        dependArray(value);
                    }
                }
                return value
            },
            set : function reactiveSetter(newVal) {
                // 当改变obj的属性是，就会调用setter方法。这是就会调用dep.notify方法进行通知
                var value = getter ? getter.call(obj) : val;
                /* eslint-disable no-self-compare */
                if(newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if("development" !== 'production' && customSetter) {
                    customSetter();
                }
                if(setter) {
                    setter.call(obj, newVal);
                } else {
                    val = newVal;
                }
                childOb = !shallow && observe(newVal);
                // Dep对象实例通知订阅他的监听器，执行update操作
                dep.notify();
            }
        });
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     * 设置对象的属性。如果对象是响应式的，确保属性被创建后也是响应式的，同时触发视图更新
     * @param target   set操作的目标对象
     * @param key      set操作的目标属性
     * @param val      set操作的属性值
     */
    function set(target, key, val) {
        if(Array.isArray(target) && isValidArrayIndex(key)) {
            target.length = Math.max(target.length, key);
            target.splice(key, 1, val);
            return val
        }
        if(hasOwn(target, key)) {
            target[key] = val;
            return val
        }
        var ob = (target).__ob__;
        if(target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid adding reactive properties to a Vue instance or its root $data ' +
                'at runtime - declare it upfront in the data option.'
            );
            return val
        }
        if(!ob) {
            target[key] = val;
            return val
        }
        // 如果val是一个对象， 需要将val的属性变为响应式属性
        defineReactive$$1(ob.value, key, val);
        // 通知Watcher对象实例执行update操作
        ob.dep.notify();
        return val
    }

    /**
     * Delete a property and trigger change if necessary.
     * 删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。
     * 这个方法主要用于避开Vue不能检测到属性被删除的限制。
     */
    function del(target, key) {
        if(Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1);
            return
        }
        var ob = (target).__ob__;
        if(target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid deleting properties on a Vue instance or its root $data ' +
                '- just set it to null.'
            );
            return
        }
        if(!hasOwn(target, key)) {
            return
        }
        delete target[key];
        if(!ob) {
            return
        }
        // 如果删除属性的对象有绑定obverser， 则需要通知对应的Watcher对象实例进行更新操作
        ob.dep.notify();
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for(var e = (void 0), i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if(Array.isArray(e)) {
                dependArray(e);
            }
        }
    }

    /*  */

    /**
     * Option overwriting strategies are functions that handle
     * how to merge a parent option value and a child option
     * value into the final value.
     * 合并策略，将父配置项和子配置项合并为一个最终的配置项
     */
    var strats = config.optionMergeStrategies;

    /**
     * Options with restrictions
     */
    {
        /**
         * el, propsData类型的合并策略，执行默认的合并策略
         * @param  parent    父配置项
         * @param  child     子配置项
         * @param  vm        Vue对象实例
         * @param  key       需要合并的项
         * @type {propsData}
         */
        strats.el = strats.propsData = function(parent, child, vm, key) {
            if(!vm) {
                warn(
                    "option \"" + key + "\" can only be used during instance " +
                    'creation with the `new` keyword.'
                );
            }
            // 执行默认的合并策略
            return defaultStrat(parent, child)
        };
    }

    /**
     * Helper that recursively merges two data objects together.
     * 递归的将from子配置项合并到to父配置项中去
     * 遍历子配置项的属性，如果父配置项中不存在属性key，则为父配置项添加属性key；
     *                    如果父配置项中存在属性key，则把属性key对应的属性值合并
     * @param   to     父配置项
     * @param   from   子配置项
     */
    function mergeData(to, from) {
        // 如果子配置项是空的， 直接返回父配置项
        if(!from) {
            return to
        }
        // 属性名
        var key,
            // 父配置项中属性名key对应的属性值
            toVal,
            // 子配置项中属性名key对应的属性值
            fromVal;
        // 子配置项的属性名数组
        var keys = Object.keys(from);
        // 遍历子配置项的属性名数组
        for(var i = 0; i < keys.length; i++) {
            // 获取属性名
            key = keys[i];
            // 父配置项中属性key对应的属性值
            toVal = to[key];
            // 子配置项中属性key对应的属性值
            fromVal = from[key];
            // 如果父配置项中没有属性key，给父配置项添加属性key， 属性值为fromVal
            if(!hasOwn(to, key)) {
                set(to, key, fromVal);
            } else if(isPlainObject(toVal) && isPlainObject(fromVal)) {
                // 如果父配置项、子配置项中都有属性key， 合并属性key对应的属性值
                mergeData(toVal, fromVal);
            }
        }
        // 返回合并后的父配置项
        return to
    }

    /**
     * Data
     */
    function mergeDataOrFn(parentVal,
                           childVal,
                           vm) {
        if(!vm) {
            // in a Vue.extend merge, both should be functions
            if(!childVal) {
                return parentVal
            }
            if(!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn() {
                return mergeData(
                    typeof childVal === 'function' ? childVal.call(this) : childVal,
                    parentVal.call(this)
                )
            }
        } else if(parentVal || childVal) {
            return function mergedInstanceDataFn() {
                // instance merge
                var instanceData = typeof childVal === 'function'
                    ? childVal.call(vm)
                    : childVal;
                var defaultData = typeof parentVal === 'function'
                    ? parentVal.call(vm)
                    : undefined;
                if(instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    }

    /**
     * data类型的合并策略
     * @param parentVal    父配置项
     * @param childVal     子配置项
     * @param vm           上下文环境，即Vue实例对象
     * @return {*}
     */
    strats.data = function(parentVal,
                           childVal,
                           vm) {
        if(!vm) {
            if(childVal && typeof childVal !== 'function') {
                "development" !== 'production' && warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                );

                return parentVal
            }
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    };

    /**
     * Hooks and props are merged as arrays.
     * 回调钩子、props的合并过程，和数组合并一样， 即把两个数组通过concat方法合并起来
     * @param  parentVal 父配置项
     * @param  childVal  子配置项
     */
    function mergeHook(parentVal,
                       childVal) {
        return childVal
            ? parentVal
                ? parentVal.concat(childVal)
                : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
            : parentVal
    }
    // beforeCreate,created,beforeMount,mounted,beforeUpdate,updated,beforeDestroy,activated,deactivated类型的合并策略
    // 合并策略就是，数组的concat方法
    LIFECYCLE_HOOKS.forEach(function(hook) {
        strats[hook] = mergeHook;
    });

    /**
     * Assets
     *
     * When a vm is present (instance creation), we need to do
     * a three-way merge between constructor options, instance
     * options and parent options.
     * components, direvtives, filters类型的合并策略， 就是对象属性合并（浅合并）
     * @param   parentVal    父配置项
     * @param   childVal     子配置项
     */
    function mergeAssets(parentVal, childVal) {
        // res继承父配置项
        var res = Object.create(parentVal || null);
        // 如果子配置项存在，将子配置项的属性添加到父配置项中去；如果子配置项不存在，直接返回父配置项
        return childVal
            ? extend(res, childVal)
            : res
    }
    // components, directives, filters类型的合并策略
    ASSET_TYPES.forEach(function(type) {
        strats[type + 's'] = mergeAssets;
    });

    /**
     * Watchers.
     *
     * Watchers hashes should not overwrite one
     * another, so we merge them as arrays.
     * watch（监听对象属性的变化）类型的合并策略， 数组合并concat
     * @param parentVal    父配置项
     * @param childVal     子配置项
     */
    strats.watch = function(parentVal, childVal) {
        // work around Firefox's Object.prototype.watch...
        // 不能使用js原生的监听
        if(parentVal === nativeWatch) {
            parentVal = undefined;
        }
        if(childVal === nativeWatch) {
            childVal = undefined;
        }
        /* istanbul ignore if */
        // 如果子配置项是空的， 直接返回父配置项
        if(!childVal) {
            return Object.create(parentVal || null)
        }
        // 如果子配置项不为空， 但是父配置项为空， 直接返回子配置项
        if(!parentVal) {
            return childVal
        }
        var ret = {};
        extend(ret, parentVal);
        // 遍历子配置项，利用数组concat方法合并父配置项和子配置项的属性
        for(var key in childVal) {
            var parent = ret[key];
            var child = childVal[key];
            if(parent && !Array.isArray(parent)) {
                parent = [parent];
            }
            ret[key] = parent
                ? parent.concat(child)
                : Array.isArray(child) ? child : [child];
        }
        return ret
    };

    /**
     * Other object hashes.
     * props, methods, inject, computed类型的合并策略
     */
    strats.props =
        strats.methods =
            strats.inject =
                strats.computed = function(parentVal, childVal) {
                    if(!childVal) {
                        return Object.create(parentVal || null)
                    }
                    if(!parentVal) {
                        return childVal
                    }
                    var ret = Object.create(null);
                    extend(ret, parentVal);
                    extend(ret, childVal);
                    return ret
                };
    // provide类型的合并策略
    strats.provide = mergeDataOrFn;

    /**
     * Default strategy.
     * Vue默认的合并策略，如果子配置项不为空， 则返回子配置项；若果子配置项为空， 则返回父配置项
     */
    var defaultStrat = function(parentVal, childVal) {
        return childVal === undefined
            ? parentVal
            : childVal
    };

    /**
     * Validate component names
     * 检查调用Vue构造函数时，传入的data配置项中，components中的属性名是否是合法的
     * @param options   调用Vue构造函数时，传入的用户配置项
     */
    function checkComponents(options) {
        // 遍历用户注册的组件
        for(var key in options.components) {
            // 用户注册的组件的组件名
            var lower = key.toLowerCase();
            // 判断组件名是否是slot、component
            if(isBuiltInTag(lower) || config.isReservedTag(lower)) {
                warn(
                    'Do not use built-in or reserved HTML elements as component ' +
                    'id: ' + key
                );
            }
        }
    }

    /**
     * Ensure all props option syntax are normalized into the
     * Object-based format.
     * 规范化props, 将props对象转化为对象形式即{props1：{}， props2：{}}
     * 注册组件时候，传入的props配置项要么是数组(数组元素为字符串),要么是对象(不能是数组、函数之类的)
     */
    function normalizeProps(options) {
        var props = options.props;
        if(!props) {
            return
        }
        var res = {};
        var i, val, name;
        if(Array.isArray(props)) {
            // 如果注册组件时传入的props是数组
            i = props.length;
            // 遍历数组，将数组元素以对象属性的形式添加到res对象中，属性值为{type:null}
            while(i--) {
                val = props[i];
                if(typeof val === 'string') {
                    name = camelize(val);
                    res[name] = {type : null};
                } else {
                    //props数组中的元素必须是字符串
                    warn('props must be strings when using array syntax.');
                }
            }
        } else if(isPlainObject(props)) {
            // 如果注册组件时传入的props是对象
            for(var key in props) {
                // 遍历对象属性
                val = props[key];
                name = camelize(key);
                res[name] = isPlainObject(val)
                    ? val
                    : {type : val};
            }
        }
        options.props = res;
    }

    /**
     * Normalize all injections into Object-based format
     * 规范化inject配置项，转化为对象形式{inject1:{}, inject2:{}}
     */
    function normalizeInject(options) {
        var inject = options.inject;
        if(Array.isArray(inject)) {
            var normalized = options.inject = {};
            for(var i = 0; i < inject.length; i++) {
                normalized[inject[i]] = inject[i];
            }
        }
    }

    /**
     * Normalize raw function directives into object format.
     * 规范化direvtive配置项,转化为{dir1:{bind, update}}
     */
    function normalizeDirectives(options) {
        var dirs = options.directives;
        if(dirs) {
            for(var key in dirs) {
                var def = dirs[key];
                if(typeof def === 'function') {
                    dirs[key] = {bind : def, update : def};
                }
            }
        }
    }

    /**
     * Merge two option objects into a new one.
     * Core utility used in both instantiation and inheritance.
     * 合并父配置项和子配置项为一个新的配置项
     * @param  parent   父配置项
     * @param  child    子配置项
     * @param  vm       上下文环境，即Vue实例对象
     */
    function mergeOptions(parent,
                          child,
                          vm) {
        {
            // 检查注册组时的组件名是否是合法的， 不能是compoennt、slot
            checkComponents(child);
        }

        if(typeof child === 'function') {
            child = child.options;
        }
        // 规范子配置项的props
        normalizeProps(child);
        // 规范子配置项的inject
        normalizeInject(child);
        // 规范子配置项的directives
        normalizeDirectives(child);
        var extendsFrom = child.extends;
        if(extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm);
        }
        // 检查子配置项中是否有混合对象配置
        if(child.mixins) {
            // 遍历子配置对象的混合对象配置项对象，合并
            for(var i = 0, l = child.mixins.length; i < l; i++) {
                parent = mergeOptions(parent, child.mixins[i], vm);
            }
        }
        var options = {};
        var key;
        // 将父配置项中的属性添加到options中，属性值为空，继承自父配置项中对应属性的属性值
        for(key in parent) {
            mergeField(key);
        }
        // 将子配置项中(父配置项中不存在的属性)，添加到options中
        for(key in child) {
            if(!hasOwn(parent, key)) {
                mergeField(key);
            }
        }

        function mergeField(key) {
            var strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }

        return options
    }

    /**
     * Resolve an asset.
     * 一般可以理解为从Vue实例对象的type类型的配置项中，获取名称为ID对应的对象，如果没有，则从Vue构造函数的对应配置项中获取
     * Vue实例对象的options继承自Vue构造函数的options
     * This function is used because child instances need access
     * to assets defined in its ancestor chain.
     * @param  options   Vue实例对象的配置项
     * @param  type      类型，like directives
     * @param  id        对象的ID
     */
    function resolveAsset(options,
                          type,
                          id,
                          warnMissing) {
        /* istanbul ignore if */
        if(typeof id !== 'string') {
            return
        }
        // Vue实例对象自身的配置项
        var assets = options[type];
        // check local registration variations first
        if(hasOwn(assets, id)) {
            return assets[id]
        }
        // 将"my-component"转化为"myComponent"
        var camelizedId = camelize(id);
        if(hasOwn(assets, camelizedId)) {
            return assets[camelizedId]
        }
        // 将"myComponent"转化为"MyComponent"
        var PascalCaseId = capitalize(camelizedId);
        if(hasOwn(assets, PascalCaseId)) {
            return assets[PascalCaseId]
        }
        // fallback to prototype chain
        // 如果Vue实例对象本身的配置项中没有所需要的属性，那么就去Vue构造函数的配置项中去寻找
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
        if("development" !== 'production' && warnMissing && !res) {
            warn(
                'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
                options
            );
        }
        // 返回指令的钩子函数(组件的构造函数)
        return res
    }

    /*  */
    /**
     * 校验props属性
     * @param key            prop属性
     * @param propOptions    注册组件时的props配置项
     * @param propsData      从组件标签上获取的props属性及其属性值
     * @param vm             组件实例
     * @return {*}
     */
    function validateProp(key,
                          propOptions,
                          propsData,
                          vm) {
        // 获取props配置项中属性key对应的属性值
        var prop = propOptions[key];
        // 判断props数据项中是否存在属性key
        var absent = !hasOwn(propsData, key);
        // 从props数据项中获取属性key对应的属性值
        var value = propsData[key];
        // handle boolean props
        if(isType(Boolean, prop.type)) {
            if(absent && !hasOwn(prop, 'default')) {
                value = false;
            } else if(!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
        // check default value
        if(value === undefined) {
            value = getPropDefaultValue(vm, prop, key);
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert;
            observerState.shouldConvert = true;
            observe(value);
            observerState.shouldConvert = prevShouldConvert;
        }
        {
            assertProp(prop, key, value, vm, absent);
        }
        return value
    }

    /**
     * Get the default value of a prop.
     */
    function getPropDefaultValue(vm, prop, key) {
        // no default, return undefined
        if(!hasOwn(prop, 'default')) {
            return undefined
        }
        var def = prop.default;
        // warn against non-factory defaults for Object & Array
        if("development" !== 'production' && isObject(def)) {
            warn(
                'Invalid default value for prop "' + key + '": ' +
                'Props with type Object/Array must use a factory function ' +
                'to return the default value.',
                vm
            );
        }
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if(vm && vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm._props[key] !== undefined
        ) {
            return vm._props[key]
        }
        // call factory function for non-Function types
        // a value is Function if its prototype is function even across different execution context
        return typeof def === 'function' && getType(prop.type) !== 'Function'
            ? def.call(vm)
            : def
    }

    /**
     * Assert whether a prop is valid.
     * 检查一个prop属性是否合法的
     * @param prop      props配置项中prop属性对应的值
     * @param name      prop属性的名称
     * @param value     props数据项中prop属性对应的值
     * @param vm        上下文环境， 一般为组件实例
     * @param absent    props数据项中是否存在prop属性
     */
    function assertProp(prop,
                        name,
                        value,
                        vm,
                        absent) {
        if(prop.required && absent) {
            warn(
                'Missing required prop: "' + name + '"',
                vm
            );
            return
        }
        if(value == null && !prop.required) {
            return
        }
        var type = prop.type;
        var valid = !type || type === true;
        var expectedTypes = [];
        if(type) {
            if(!Array.isArray(type)) {
                type = [type];
            }
            for(var i = 0; i < type.length && !valid; i++) {
                var assertedType = assertType(value, type[i]);
                expectedTypes.push(assertedType.expectedType || '');
                valid = assertedType.valid;
            }
        }
        if(!valid) {
            warn(
                'Invalid prop: type check failed for prop "' + name + '".' +
                ' Expected ' + expectedTypes.map(capitalize).join(', ') +
                ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
                vm
            );
            return
        }
        var validator = prop.validator;
        if(validator) {
            if(!validator(value)) {
                warn(
                    'Invalid prop: custom validator check failed for prop "' + name + '".',
                    vm
                );
            }
        }
    }

    var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

    function assertType(value, type) {
        var valid;
        var expectedType = getType(type);
        if(simpleCheckRE.test(expectedType)) {
            valid = typeof value === expectedType.toLowerCase();
        } else if(expectedType === 'Object') {
            valid = isPlainObject(value);
        } else if(expectedType === 'Array') {
            valid = Array.isArray(value);
        } else {
            valid = value instanceof type;
        }
        return {
            valid : valid,
            expectedType : expectedType
        }
    }

    /**
     * Use function string name to check built-in types,
     * because a simple equality check will fail when running
     * across different vms / iframes.
     */
    function getType(fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/);
        return match ? match[1] : ''
    }

    function isType(type, fn) {
        if(!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for(var i = 0, len = fn.length; i < len; i++) {
            if(getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }

    /*  */

    var mark;
    var measure;

    {
        var perf = inBrowser && window.performance;
        /* istanbul ignore if */
        if(
            perf &&
            perf.mark &&
            perf.measure &&
            perf.clearMarks &&
            perf.clearMeasures
        ) {
            mark = function(tag) {
                return perf.mark(tag);
            };
            measure = function(name, startTag, endTag) {
                perf.measure(name, startTag, endTag);
                perf.clearMarks(startTag);
                perf.clearMarks(endTag);
                perf.clearMeasures(name);
            };
        }
    }

    /* not type checking this file because flow doesn't play well with Proxy */

    var initProxy;

    {
        // 允许的全局变量
        var allowedGlobals = makeMap(
            'Infinity,undefined,NaN,isFinite,isNaN,' +
            'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
            'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
            'require' // for Webpack/Browserify
        );

        var warnNonPresent = function(target, key) {
            warn(
                "Property or method \"" + key + "\" is not defined on the instance but " +
                "referenced during render. Make sure to declare reactive data " +
                "properties in the data option.",
                target
            );
        };
        // 判断浏览器是不是支持代理。Proxy是ES6的语法，老版本的浏览器不支持
        var hasProxy =
            typeof Proxy !== 'undefined' &&
            Proxy.toString().match(/native code/);

        if(hasProxy) {
            var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
            config.keyCodes = new Proxy(config.keyCodes, {
                set : function set(target, key, value) {
                    if(isBuiltInModifier(key)) {
                        warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
                        return false
                    } else {
                        target[key] = value;
                        return true
                    }
                }
            });
        }

        var hasHandler = {
            // 拦截目标对象 key in target 操作
            // 程序运行时，一般会检查对象中是否有某个方法、某个属性，此时就会触发代理对象的has拦截操作
            has : function has(target, key) {
                var has = key in target;
                var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
                if(!has && !isAllowed) {
                    warnNonPresent(target, key);
                }
                return has || !isAllowed
            }
        };

        var getHandler = {
            // 拦截目标对象属性的读取
            // 读取对象属性的时候，就会触发代理对象的get拦截操作
            get : function get(target, key) {
                if(typeof key === 'string' && !(key in target)) {
                    warnNonPresent(target, key);
                }
                return target[key]
            }
        };

        initProxy = function initProxy(vm) {
            if(hasProxy) {
                // determine which proxy handler to use
                var options = vm.$options;
                var handlers = options.render && options.render._withStripped
                    ? getHandler
                    : hasHandler;
                // Proxy提供了一种机制，可以对外界的访问进行过滤和改写
                // handlers提供了访问vm实例的时候，先进行的操作
                vm._renderProxy = new Proxy(vm, handlers);
            } else {
                vm._renderProxy = vm;
            }
        };
    }

    /*  */
    /**
     *  创建一个Virtual Dom 节点
     * @param tag              虚拟dom节点对应的标签名
     * @param data             虚拟dom节点的数据对象？？
     * @param children         虚拟dom节点的子节点
     * @param text             虚拟dom节点的text值
     * @param elm              虚拟dom节点对应的真实dom节点
     * @param context          虚拟dom节点的编译作用域， 一般为当前创建的Vue对象实例
     * @param componentOptions  创建组件型虚拟dom节点用到的配置项
     * @param asyncFactory      ??
     * @constructor          虚拟dom节点的构造函数
     */
    var VNode = function VNode(tag,
                               data,
                               children,
                               text,
                               elm,
                               context,
                               componentOptions,
                               asyncFactory) {
        // 当前节点的标签名
        this.tag = tag;
        // 当前节点的数据对象
        this.data = data;
        // 数组类型， 包含了当前节点的子节点
        this.children = children;
        // 当前节点的文本， 一般文本节点或者注释节点会有该属性
        this.text = text;
        // 真实dom节点
        this.elm = elm;
        // 节点的命名空间
        this.ns = undefined;
        // 节点的编译作用域
        this.context = context;
        // 函数化组件的作用域？？
        this.functionalContext = undefined;
        // 节点的key属性，用于节点的标识， 有利于patch的优化
        // 虚拟dom节点进行差异对比时，需要对比子虚拟dom节点的差异。如果子虚拟dom节点数组中元素的位置发生了变化， 就可以通过 key 属性来辅助。
        // 简单来说，如果两个 Virtual Node 的位置不同，但是 key 属性相同，那么会将这两个节点视为由相同数据渲染得到的，然后进一步进行差异分析。
        this.key = data && data.key;
        // 创建组件实例时会用到的配置信息
        this.componentOptions = componentOptions;
        // 虚拟dom节点的组件实例， 组件对应的虚拟dom节点刚创建时，对应的组件是空的
        this.componentInstance = undefined;
        // 组件的占位节点？？
        this.parent = undefined;
        this.raw = false;
        // 静态节点的标识
        this.isStatic = false;
        // 是否作为根节点插入，被<transition>包裹的节点，改属性的值为false
        this.isRootInsert = true;
        // 当前节点是否是注释节点
        this.isComment = false;
        // 当前节点是否是克隆节点
        this.isCloned = false;
        // 当前节点是否有v-once指令
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    };

    var prototypeAccessors = {child : {}};

    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    prototypeAccessors.child.get = function() {
        return this.componentInstance
    };

    Object.defineProperties(VNode.prototype, prototypeAccessors);
    //  创建一个没有内容的注释节点（virtual dom节点）
    var createEmptyVNode = function(text) {
        if(text === void 0) text = '';
        // 虚拟dom节点
        var node = new VNode();
        node.text = text;
        node.isComment = true;
        return node
    };
    // 创建一个文本节点（virtual dom节点）
    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

    // optimized shallow clone
    // used for static nodes and slot nodes because they may be reused across
    // multiple renders, cloning them avoids errors when DOM manipulations rely
    // on their elm reference.
    // 创建一个克隆节点，可以是EmptyVNode、TextVNode、ElementVNode、ComponentVNode
    function cloneVNode(vnode) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions,
            vnode.asyncFactory
        );
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        cloned.isComment = vnode.isComment;
        cloned.isCloned = true;
        return cloned
    }
    // 克隆多个Vue节点
    function cloneVNodes(vnodes) {
        var len = vnodes.length;
        var res = new Array(len);
        for(var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i]);
        }
        return res
    }

    /*  */
    var normalizeEvent = cached(function(name) {
        // like &click
        var passive = name.charAt(0) === '&';
        name = passive ? name.slice(1) : name;
        // like ~click, 事件只执行一次
        var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
        name = once$$1 ? name.slice(1) : name;
        // like !click
        var capture = name.charAt(0) === '!';
        name = capture ? name.slice(1) : name;
        return {
            name : name,
            once : once$$1,
            capture : capture,
            passive : passive
        }
    });

    /**
     * 创建回调函数。将多个回调函数合并为一个回调函数
     *
     * @param fns    多个回调函数
     * @return {invoker}
     */
    function createFnInvoker(fns) {
        // 新的回调函数
        function invoker() {
            var arguments$1 = arguments;

            var fns = invoker.fns;
            if(Array.isArray(fns)) {
                var cloned = fns.slice();
                for(var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1);
                }
            } else {
                // return handler return value for single handlers
                return fns.apply(null, arguments)
            }
        }

        invoker.fns = fns;
        // 返回新的回调函数
        return invoker
    }

    /**
     * 更新dom节点上绑定的事件。
     * 该方法会遍历新事件对象的属性
     *      如果新的事件对象中事件类型没有对应的回调函数，则警告；
     *      如果新的事件对象中的事件类型，在旧的事件对象中没有相应记录，则给dom节点绑定新的事件类型对应的方法；
     *      如果新的事件对象和就的事件对象， 都有相同的事件类型， 更新旧的事件类型的回调方法；
     * 遍历旧的事件对象的属性
     *      如果旧的事件类型在新的事件对象中不存在， 则从dom节点上移除绑定的该类型事件
     * @param on        事件对象，包括事件类型和对应的回调函数
     * @param oldOn     旧的事件对象
     * @param add       绑定事件的方法，原生的addEventListener或者自定义事件的$on方法
     * @param remove$$1
     * @param vm        Vue实例对象或者组件实例对象
     */
    function updateListeners(on,
                             oldOn,
                             add,
                             remove$$1,
                             vm) {
        var name, cur, old, event;
        // 遍历事件对象
        for(name in on) {
            // 新的事件对象中，事件类型对应的回调函数
            cur = on[name];
            // 旧的事件对象中， 事件类型对应的回调函数
            old = oldOn[name];
            // 标准化事件名称， 返回{name:"****", once:boolean, passive:boolean, capture:boolean}
            event = normalizeEvent(name);
            if(isUndef(cur)) {
                "development" !== 'production' && warn(
                    "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
                    vm
                );
            } else if(isUndef(old)) {
                // 如果当前事件类型，之前没有回调函数
                if(isUndef(cur.fns)) {
                    cur = on[name] = createFnInvoker(cur);
                }
                add(event.name, cur, event.once, event.capture, event.passive);
            } else if(cur !== old) {
                old.fns = cur;
                on[name] = old;
            }
        }
        // 遍历旧的事件对象， 如果事件类型在新的事件对象中不存在， 直接将该事件从dom节点上移除
        for(name in oldOn) {
            if(isUndef(on[name])) {
                event = normalizeEvent(name);
                remove$$1(event.name, oldOn[name], event.capture);
            }
        }
    }

    /*  */
    /**
     * 合并虚拟dom节点的钩子函数
     * @param def       一般为vnode.data.hook
     * @param hookKey   钩子函数的类型， like inserted
     * @param hook      钩子函数
     */
    function mergeVNodeHook(def, hookKey, hook) {
        var invoker;
        // 旧的钩子函数
        var oldHook = def[hookKey];
        // 包装的钩子函数， 确保hook钩子函数只能执行一次
        function wrappedHook() {
            // 执行钩子函数
            hook.apply(this, arguments);
            // important: remove merged hook to ensure it's called only once
            // and prevent memory leak
            // 移除钩子函数
            remove(invoker.fns, wrappedHook);
        }

        if(isUndef(oldHook)) {
            // no existing hook
            // 如果旧的钩子函数不存在， 创建钩子回调函数
            invoker = createFnInvoker([wrappedHook]);
        } else {
            /* istanbul ignore if */
            if(isDef(oldHook.fns) && isTrue(oldHook.merged)) {
                // already a merged invoker
                // 如果有旧的钩子函数，且已经合并过钩子函数
                invoker = oldHook;
                invoker.fns.push(wrappedHook);
            } else {
                // existing plain hook
                invoker = createFnInvoker([oldHook, wrappedHook]);
            }
        }

        invoker.merged = true;
        def[hookKey] = invoker;
    }

    /*  */
    /**
     * 根据注册组件时配置项中的props配置项中的属性，从虚拟dom节点data中的attrs，props中提取相应的属性
     * @param data      虚拟dom节点的data属性
     * @param Ctor      Vue实例的构造函数
     * @param tag       标签的名称
     * @return {{}}
     */
    function extractPropsFromVNodeData(data,
                                       Ctor,
                                       tag) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        // 从构造函数options配置项中获取props配置项
        var propOptions = Ctor.options.props;
        if(isUndef(propOptions)) {
            return
        }
        var res = {};
        var attrs = data.attrs;
        var props = data.props;
        if(isDef(attrs) || isDef(props)) {
            for(var key in propOptions) {
                var altKey = hyphenate(key);
                {
                    var keyInLowerCase = key.toLowerCase();
                    if(
                        key !== keyInLowerCase &&
                        attrs && hasOwn(attrs, keyInLowerCase)
                    ) {
                        tip(
                            "Prop \"" + keyInLowerCase + "\" is passed to component " +
                            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
                            " \"" + key + "\". " +
                            "Note that HTML attributes are case-insensitive and camelCased " +
                            "props need to use their kebab-case equivalents when using in-DOM " +
                            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
                        );
                    }
                }
                // 检查props中是否存在属性key，如果存在，把key属性添加到res中
                checkProp(res, props, key, altKey, true) ||
                // 检查attrs中是否存在属性key，如果存在，把key属性添加到res中，并把attrs中的key属性删除
                checkProp(res, attrs, key, altKey, false);
            }
        }
        return res
    }

    /**
     * 检查虚拟dom节点的props，attrs属性中是否存在属性key，如果存在，添加到res中
     * @param res
     * @param hash        虚拟dom节点的data中的props，attrs属性
     * @param key         prop属性
     * @param altKey
     * @param preserve    是否保留虚拟dom节点中的对应属性
     * @return {boolean}
     */
    function checkProp(res,
                       hash,
                       key,
                       altKey,
                       preserve) {
        if(isDef(hash)) {
            if(hasOwn(hash, key)) {
                res[key] = hash[key];
                if(!preserve) {
                    delete hash[key];
                }
                return true
            } else if(hasOwn(hash, altKey)) {
                res[key] = hash[altKey];
                if(!preserve) {
                    delete hash[altKey];
                }
                return true
            }
        }
        return false
    }

    /*  */

    // The template compiler attempts to minimize the need for normalization by
    // statically analyzing the template at compile time.
    //
    // For plain HTML markup, normalization can be completely skipped because the
    // generated render function is guaranteed to return Array<VNode>. There are
    // two cases where extra normalization is needed:

    // 1. When the children contains components - because a functional component
    // may return an Array instead of a single root. In this case, just a simple
    // normalization is needed - if any child is an Array, we flatten the whole
    // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
    // because functional components already normalize their own children.
    function simpleNormalizeChildren(children) {
        for(var i = 0; i < children.length; i++) {
            if(Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

    // 2. When the children contains constructs that always generated nested Arrays,
    // e.g. <template>, <slot>, v-for, or when the children is provided by user
    // with hand-written render functions / JSX. In such cases a full normalization
    // is needed to cater to all possible types of children values.
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined
    }
    // 判断虚拟节点是否是文本节点
    function isTextNode(node) {
        return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = [];
        var i, c, last;
        for(i = 0; i < children.length; i++) {
            c = children[i];
            if(isUndef(c) || typeof c === 'boolean') {
                continue
            }
            last = res[res.length - 1];
            //  nested
            if(Array.isArray(c)) {
                res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
            } else if(isPrimitive(c)) {
                if(isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    (last).text += String(c);
                } else if(c !== '') {
                    // convert primitive to vnode
                    res.push(createTextVNode(c));
                }
            } else {
                if(isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[res.length - 1] = createTextVNode(last.text + c.text);
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if(isTrue(children._isVList) &&
                        isDef(c.tag) &&
                        isUndef(c.key) &&
                        isDef(nestedIndex)) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__";
                    }
                    res.push(c);
                }
            }
        }
        return res
    }

    /*  */

    function ensureCtor(comp, base) {
        if(comp.__esModule && comp.default) {
            comp = comp.default;
        }
        return isObject(comp)
            ? base.extend(comp)
            : comp
    }

    function createAsyncPlaceholder(factory,
                                    data,
                                    context,
                                    children,
                                    tag) {
        var node = createEmptyVNode();
        node.asyncFactory = factory;
        node.asyncMeta = {data : data, context : context, children : children, tag : tag};
        return node
    }

    function resolveAsyncComponent(factory,
                                   baseCtor,
                                   context) {
        if(isTrue(factory.error) && isDef(factory.errorComp)) {
            return factory.errorComp
        }

        if(isDef(factory.resolved)) {
            return factory.resolved
        }

        if(isTrue(factory.loading) && isDef(factory.loadingComp)) {
            return factory.loadingComp
        }

        if(isDef(factory.contexts)) {
            // already pending
            factory.contexts.push(context);
        } else {
            var contexts = factory.contexts = [context];
            var sync = true;

            var forceRender = function() {
                for(var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate();
                }
            };

            var resolve = once(function(res) {
                // cache resolved
                factory.resolved = ensureCtor(res, baseCtor);
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if(!sync) {
                    forceRender();
                }
            });

            var reject = once(function(reason) {
                "development" !== 'production' && warn(
                    "Failed to resolve async component: " + (String(factory)) +
                    (reason ? ("\nReason: " + reason) : '')
                );
                if(isDef(factory.errorComp)) {
                    factory.error = true;
                    forceRender();
                }
            });

            var res = factory(resolve, reject);

            if(isObject(res)) {
                if(typeof res.then === 'function') {
                    // () => Promise
                    if(isUndef(factory.resolved)) {
                        res.then(resolve, reject);
                    }
                } else if(isDef(res.component) && typeof res.component.then === 'function') {
                    res.component.then(resolve, reject);

                    if(isDef(res.error)) {
                        factory.errorComp = ensureCtor(res.error, baseCtor);
                    }

                    if(isDef(res.loading)) {
                        factory.loadingComp = ensureCtor(res.loading, baseCtor);
                        if(res.delay === 0) {
                            factory.loading = true;
                        } else {
                            setTimeout(function() {
                                if(isUndef(factory.resolved) && isUndef(factory.error)) {
                                    factory.loading = true;
                                    forceRender();
                                }
                            }, res.delay || 200);
                        }
                    }

                    if(isDef(res.timeout)) {
                        setTimeout(function() {
                            if(isUndef(factory.resolved)) {
                                reject(
                                    "timeout (" + (res.timeout) + "ms)"
                                );
                            }
                        }, res.timeout);
                    }
                }
            }

            sync = false;
            // return in case resolved synchronously
            return factory.loading
                ? factory.loadingComp
                : factory.resolved
        }
    }

    /*  */
    /**
     * 返回第一个子组件虚拟dom节点
     * @param children    虚拟dom节点集合
     * @return {*}
     */
    function getFirstComponentChild(children) {
        if(Array.isArray(children)) {
            for(var i = 0; i < children.length; i++) {
                var c = children[i];
                // 如果是组件虚拟dom节点
                if(isDef(c) && isDef(c.componentOptions)) {
                    return c
                }
            }
        }
    }

    /*  */

    /*  */
    /**
     * 给Vue实例对象绑定事件(如果vm是组件实例，且对应的标签上绑定了自定义事件)
     * @param vm
     */
    function initEvents(vm) {
        vm._events = Object.create(null);
        vm._hasHookEvent = false;
        // init parent attached events
        // 创建组件实例对象的时候，如果组件标签上绑定了自定义事件，那么生成组件实例的时候
        var listeners = vm.$options._parentListeners;
        if(listeners) {
            // 给组件实例绑定事件
            updateComponentListeners(vm, listeners);
        }
    }

    var target;

    /**
     * 给Vue实例对象绑定自定义事件event
     * @param event      绑定的事件类型
     * @param fn         绑定事件对应的回调函数
     * @param once$$1    回调函数是否只触发一次
     */
    function add(event, fn, once$$1) {
        // 如果fn函数只需触发一次，则使用$once方法绑定事件
        if(once$$1) {
            target.$once(event, fn);
        } else {
            target.$on(event, fn);
        }
    }

    /**
     * 解绑target对象event事件
     * @param event    事件类型
     * @param fn       事件对应的回调函数
     */
    function remove$1(event, fn) {
        target.$off(event, fn);
    }

    /**
     *
     * @param vm                   组件实例对象
     * @param listeners            需要绑定的事件
     * @param oldListeners
     */
    function updateComponentListeners(vm,
                                      listeners,
                                      oldListeners) {
        // target-> 组件事例对象
        target = vm;
        updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
    }

    /**
     * 给Vue实例对象添加$on, $once, $off, $emit方法
     * $on方法用于绑定自定义事件，可触发多次；
     * $once方法用于绑定自定义事件， 只可触发一次；
     * $off方法用于解绑事件；
     * $emit方法用于触发绑定的事件
     * @param Vue   Vue构造函数对象
     */
    function eventsMixin(Vue) {
        var hookRE = /^hook:/;
        // 给Vue实例对象绑定自定义事件（将自定义事件对应的回调函数添加到Vue实例对象vm的_events数组中）。
        // 事件可以有vm.$emit触发
        Vue.prototype.$on = function(event, fn) {
            // this$1 -> Vue实例对象vm
            var this$1 = this;

            var vm = this;
            if(Array.isArray(event)) {
                for(var i = 0, l = event.length; i < l; i++) {
                    this$1.$on(event[i], fn);
                }
            } else {
                // 将自定义事件对应的回到函数缓存到Vue实例对象vm的_events数组中
                (vm._events[event] || (vm._events[event] = [])).push(fn);
                // optimize hook:event cost by using a boolean flag marked at registration
                // instead of a hash lookup
                if(hookRE.test(event)) {
                    vm._hasHookEvent = true;
                }
            }
            return vm
        };
        // 给Vue实例对象绑定一个自定义事件，但是只触发一次;在第一次触发之后移除监听器
        Vue.prototype.$once = function(event, fn) {
            var vm = this;

            function on() {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }

            on.fn = fn;
            vm.$on(event, on);
            return vm
        };
        // 移除Vue实例绑定的自定义事件
        Vue.prototype.$off = function(event, fn) {
            var this$1 = this;

            var vm = this;
            // 如果没有传入参数， 即vm.$off(),解绑Vue实例对象所有的自定义事件
            if(!arguments.length) {
                vm._events = Object.create(null);
                return vm
            }
            // array of events
            // 如果event是数组， 解绑对应的自定义事件
            if(Array.isArray(event)) {
                for(var i$1 = 0, l = event.length; i$1 < l; i$1++) {
                    this$1.$off(event[i$1], fn);
                }
                return vm
            }
            // specific event
            // 解绑event对应的自定义事件
            var cbs = vm._events[event];
            if(!cbs) {
                return vm
            }
            if(arguments.length === 1) {
                vm._events[event] = null;
                return vm
            }
            // specific handler
            var cb;
            var i = cbs.length;
            while(i--) {
                cb = cbs[i];
                if(cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1);
                    break
                }
            }
            return vm
        };
        /**
         * 触发Vue实例对象绑定的自定义事件event
         * @param event
         * @return {Vue}
         */
        Vue.prototype.$emit = function(event) {
            var vm = this;
            {
                var lowerCaseEvent = event.toLowerCase();
                if(lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                    tip(
                        "Event \"" + lowerCaseEvent + "\" is emitted in component " +
                        (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
                        "Note that HTML attributes are case-insensitive and you cannot use " +
                        "v-on to listen to camelCase events when using in-DOM templates. " +
                        "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
                    );
                }
            }
            // 自定义事件event对应的回调函数
            var cbs = vm._events[event];
            if(cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs;
                var args = toArray(arguments, 1);
                for(var i = 0, l = cbs.length; i < l; i++) {
                    try {
                        // 执行自定义事件对应的回调函数
                        cbs[i].apply(vm, args);
                    } catch(e) {
                        handleError(e, vm, ("event handler for \"" + event + "\""));
                    }
                }
            }
            return vm
        };
    }

    /*  */

    /**
     * Runtime helper for resolving raw children VNodes into a slot object.
     * 从组件(自定义标签)要分发的内容对应的虚拟dom节点中，提取需要添加到插槽中的内容和对应的嚓擦
     * (我们定义组件自定义标签的时候，标签内部可能会有内容，我们需要从这些内容中找到要放置这些内容的插槽)
     * @param children   自定义标签对应的虚拟dom节点的子虚拟动漫节点
     * @param context    当前上下文环境，一般为Vue实例对象
     */
    function resolveSlots(children,
                          context) {
        // slots用于存储自定义标签中子标签上的slot名称，如果没有的名称的，默认为"default"
        var slots = {};
        if(!children) {
            return slots
        }
        var defaultSlot = [];
        for(var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if((child.context === context || child.functionalContext === context) &&
                child.data && child.data.slot != null
            ) {
                var name = child.data.slot;
                var slot = (slots[name] || (slots[name] = []));
                if(child.tag === 'template') {
                    slot.push.apply(slot, child.children);
                } else {
                    slot.push(child);
                }
            } else {
                defaultSlot.push(child);
            }
        }
        // ignore whitespace
        if(!defaultSlot.every(isWhitespace)) {
            slots.default = defaultSlot;
        }
        return slots
    }

    function isWhitespace(node) {
        return node.isComment || node.text === ' '
    }

    function resolveScopedSlots(fns, // see flow/vnode
                                res) {
        res = res || {};
        for(var i = 0; i < fns.length; i++) {
            if(Array.isArray(fns[i])) {
                resolveScopedSlots(fns[i], res);
            } else {
                res[fns[i].key] = fns[i].fn;
            }
        }
        return res
    }

    /*  */
    // active实例（渲染的vue实例）
    var activeInstance = null;
    var isUpdatingChildComponent = false;

    /**
     * 如果新建的Vue实例对象有父Vue实例对象， 建立子Vue实例对象与父Vue实例之间的关联关系
     * 同时给新建的Vue实例对象添加生命周期属性
     * (可能实例的销毁什么的会用到这个关联关系)
     * @param vm      新建的Vue实例对象
     */
    function initLifecycle(vm) {
            // 当前Vue实例对象的配置项
        var options = vm.$options;

        // locate first non-abstract parent
        // 父Vue实例对象(如果当前Vue实例对象是组件实例对象的话，存在父实例对象)
        var parent = options.parent;
        // 如果组件实例对象不是抽象组件对应的实例对象(keep-alive, transition等)
        if(parent && !options.abstract) {
            while(parent.$options.abstract && parent.$parent) {
                // 如果组件是在keep-alive内部，那么父实例的abstract为true
                // 设置组件的父实例为不是抽象组件对应的Vue实例对象
                parent = parent.$parent;
            }
            // 将子Vue实例对象添加到父Vue实例对象的$children数组中，建立父Vue实例对象和子Vue实例对象之间的关联关系
            parent.$children.push(vm);
        }
        // 子Vue实例对象的$parent -> 父Vue实例对象
        vm.$parent = parent;
        // 当前组件树的根 Vue 实例。如果当前实例没有父实例，此实例将会是其自己。
        // 如果子实例对象有父实例对象，则$root指向父实例的$root(最开始的Vue实例对象)；如果没有的话，则指向自己
        vm.$root = parent ? parent.$root : vm;
        // Vue实例的子实例对象，如果实例对应的dom节点中还有组件，就会继续生成新的子实例对象
        vm.$children = [];
        vm.$refs = {};

        vm._watcher = null;
        vm._inactive = null;
        vm._directInactive = false;
        // 是否已经mounter
        vm._isMounted = false;
        // 是否已经destoryed
        vm._isDestroyed = false;
        // 是否开始destroyed
        vm._isBeingDestroyed = false;
    }
    // 给Vue实例对象添加_update、$forceUpdate、$destroy方法
    function lifecycleMixin(Vue) {
        // Vue实例的更新过程，就是通过新生成的虚拟dom节点， 来更新真实dom节点
        Vue.prototype._update = function(vnode, hydrating) {
            var vm = this;
            if(vm._isMounted) {
                // 触发vm实例的beforeUpdate钩子函数
                callHook(vm, 'beforeUpdate');
            }
            // 更新之前的真实dom节点
            var prevEl = vm.$el;
            // 更新之前的虚拟dom节点
            var prevVnode = vm._vnode;
            // 保存上一次的vue实例对象
            var prevActiveInstance = activeInstance;
            activeInstance = vm;
            // 保存当前Vue实例的虚拟dom节点
            vm._vnode = vnode;
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if(!prevVnode) {
                // 如果Vue实例对象没有之前虚拟dom节点，表明Vue实例是第一次创建
                // initial render
                // 根据虚拟dom节点生成真实dom节点
                // patch将新老VNode节点进行比对，然后将根据两者的比较结果进行最小单位地修改视图，而不是将整个视图根据新的VNode重绘。
                // patch的核心在于diff算法，这套算法可以高效地比较viturl dom的变更，得出变化以修改视图。
                vm.$el = vm.__patch__(
                    vm.$el, vnode, hydrating, false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                );
                // no need for the ref nodes after initial patch
                // this prevents keeping a detached DOM tree in memory (#5851)
                vm.$options._parentElm = vm.$options._refElm = null;
            } else {
                // 表明Vue实例对象已经创建
                // updates
                // 根据新的虚拟dom节点，来跟新之前的真实dom节点
                vm.$el = vm.__patch__(prevVnode, vnode);
            }
            // 将active实例对象设置为上一次的实例对象
            activeInstance = prevActiveInstance;
            // update __vue__ reference
            if(prevEl) {
                prevEl.__vue__ = null;
            }
            if(vm.$el) {
                vm.$el.__vue__ = vm;
            }
            // if parent is an HOC, update its $el as well
            if(vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el;
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        };
        // 迫使Vue实例重新渲染。注意， 它仅仅影响实例本身和插入插槽内容的子组件， 而不是所有子组件
        Vue.prototype.$forceUpdate = function() {
            var vm = this;
            if(vm._watcher) {
                vm._watcher.update();
            }
        };
        /**
         * 完全销毁一个Vue实例对象
         */
        Vue.prototype.$destroy = function() {
            // this->Vue实例对象
            var vm = this;
            if(vm._isBeingDestroyed) {
                return
            }
            // 触发Vue实例对象vm的beforeDestory钩子
            callHook(vm, 'beforeDestroy');
            vm._isBeingDestroyed = true;
            // remove self from parent
            // 父Vue实例对象
            var parent = vm.$parent;
            if(parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                // 从父Vue实例对象的$children中移除当前Vue实例对象
                remove(parent.$children, vm);
            }
            // teardown watchers
            // 解绑监听器
            if(vm._watcher) {
                vm._watcher.teardown();
            }
            var i = vm._watchers.length;
            while(i--) {
                vm._watchers[i].teardown();
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if(vm._data.__ob__) {
                vm._data.__ob__.vmCount--;
            }
            // call the last hook...
            vm._isDestroyed = true;
            // invoke destroy hooks on current rendered tree
            // 执行实例对应的虚拟dom节点的destory钩子函数
            vm.__patch__(vm._vnode, null);
            // fire destroyed hook
            // 触发destoryed钩子
            callHook(vm, 'destroyed');
            // turn off all instance listeners.
            // 解除实例绑定的所有自定义事件
            vm.$off();
            // remove __vue__ reference
            if(vm.$el) {
                vm.$el.__vue__ = null;
            }
        };
    }

    /**
     * 安装组件，将el元素添加界面上
     * @param vm      Vue实例对象
     * @param el      vue实例挂载的dom节点
     * @param hydrating
     * @return {*}
     */
    function mountComponent(vm,
                            el,
                            hydrating) {
        // Vue实例使用的根DOM元素。。如果Vue实例对象是组件类型的，此时dom节点元素是没有的
        vm.$el = el;
        if(!vm.$options.render) {
            // 如果Vue实例vm没有渲染方法，则重新默认一个渲染方法
            vm.$options.render = createEmptyVNode;
            {
                /* istanbul ignore if */
                if((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                    vm.$options.el || el) {
                    warn(
                        'You are using the runtime-only build of Vue where the template ' +
                        'compiler is not available. Either pre-compile the templates into ' +
                        'render functions, or use the compiler-included build.',
                        vm
                    );
                } else {
                    warn(
                        'Failed to mount component: template or render function not defined.',
                        vm
                    );
                }
            }
        }
        // 执行beforeMount钩子回调函数。
        // new Vue({el:"#app1", beforeMount:function(){}}), 此时需要执行配置中beforeMount对应的回调函数
         callHook(vm, 'beforeMount');
        // 更新组件的方法
        var updateComponent;
        /* istanbul ignore if */
        if("development" !== 'production' && config.performance && mark) {
            updateComponent = function() {
                var name = vm._name;
                var id = vm._uid;
                var startTag = "vue-perf-start:" + id;
                var endTag = "vue-perf-end:" + id;

                mark(startTag);
                var vnode = vm._render();
                mark(endTag);
                measure((name + " render"), startTag, endTag);

                mark(startTag);
                vm._update(vnode, hydrating);
                mark(endTag);
                measure((name + " patch"), startTag, endTag);
            };
        } else {
            updateComponent = function() {
                // 先调用Vue实例的_render方法，生成virtural dom 节点，然后调用Vue实例的_update方法
                vm._update(vm._render(), hydrating);
            };
        }
        // 给Vue实例或者是组件实例创建一个监听器， watcher的value通过执行updateComponent方法来获取
        vm._watcher = new Watcher(vm, updateComponent, noop);
        hydrating = false;

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        // $vnode一般用来表示组件的占位虚拟dom节点。
        // 如果$vnode为空，就表示实例对应的真实dom节点已经mounted完毕
        if(vm.$vnode == null) {
            vm._isMounted = true;
            // Vue实例对象mounted安装完毕之后，执行mounted钩子函数
            // Vue实例对象的mounted钩子后于它内部的组件实例对象的mounted钩子函数
            callHook(vm, 'mounted');
        }
        // 返回Vue实例对象
        return vm
    }

    /**
     * 更新子组件
     * @param vm              组件实例对象
     * @param propsData       组件占位节点上的属性
     * @param listeners       组件占位节点上绑定的事件
     * @param parentVnode     组件占位节点对应的虚拟dom节点
     * @param renderChildren  组件中要分发的内容对应的虚拟dom节点
     */
    function updateChildComponent(vm,
                                  propsData,
                                  listeners,
                                  parentVnode,
                                  renderChildren) {
        {
            isUpdatingChildComponent = true;
        }

        // determine whether component has slot children
        // we need to do this before overwriting $options._renderChildren
        var hasChildren = !!(
            // 新的需要分发的内容
            renderChildren ||               // has new static slots
            // 存在就的需要分发的内容
            vm.$options._renderChildren ||  // has old static slots
            // 存在新的作用域slot
            parentVnode.data.scopedSlots || // has new scoped slots
            // 存在旧的作用域slot
            vm.$scopedSlots !== emptyObject // has old scoped slots
        );
        // 更新组件实例对象配置项的占位虚拟dom节点
        vm.$options._parentVnode = parentVnode;
        // 更新组件实例对象的占位虚拟dom节点
        vm.$vnode = parentVnode; // update vm's placeholder node without re-render
        // 组件实例执行render之后的虚拟dom节点
        if(vm._vnode) { // update child tree's parent
            vm._vnode.parent = parentVnode;
        }
        // 更新组件实例配置项中的组件分发内容的虚拟dom节点
        vm.$options._renderChildren = renderChildren;

        // update $attrs and $listensers hash
        // these are also reactive so they may trigger child update if the child
        // used them during render
        vm.$attrs = parentVnode.data && parentVnode.data.attrs;
        vm.$listeners = listeners;

        // update props
        // 更新组件实例上的props属性
        if(propsData && vm.$options.props) {
            observerState.shouldConvert = false;
            // 获取组件实例跟新之前的_props属性._prop对象中包含组件注册时提供的props属性，而且每一个属性都是响应式的
            var props = vm._props;
            var propKeys = vm.$options._propKeys || [];
            for(var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                // 更新变化的prop属性的新的值，这时会触发watcher的update操作
                props[key] = validateProp(key, vm.$options.props, propsData, vm);
            }
            observerState.shouldConvert = true;
            // keep a copy of raw propsData
            vm.$options.propsData = propsData;
        }

        // update listeners
        if(listeners) {
            var oldListeners = vm.$options._parentListeners;
            vm.$options._parentListeners = listeners;
            updateComponentListeners(vm, listeners, oldListeners);
        }
        // resolve slots + force update if has children
        if(hasChildren) {
            vm.$slots = resolveSlots(renderChildren, parentVnode.context);
            vm.$forceUpdate();
        }

        {
            isUpdatingChildComponent = false;
        }
    }

    function isInInactiveTree(vm) {
        while(vm && (vm = vm.$parent)) {
            if(vm._inactive) {
                return true
            }
        }
        return false
    }

    /**
     *
     * @param vm        组件实例对象， keep-alive中的组件对应的Vue实例对象
     * @param direct
     */
    function activateChildComponent(vm, direct) {
        if(direct) {
            vm._directInactive = false;
            if(isInInactiveTree(vm)) {
                return
            }
        } else if(vm._directInactive) {
            return
        }
        if(vm._inactive || vm._inactive === null) {
            vm._inactive = false;
            for(var i = 0; i < vm.$children.length; i++) {
                activateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'activated');
        }
    }

    function deactivateChildComponent(vm, direct) {
        if(direct) {
            vm._directInactive = true;
            if(isInInactiveTree(vm)) {
                return
            }
        }
        if(!vm._inactive) {
            vm._inactive = true;
            for(var i = 0; i < vm.$children.length; i++) {
                deactivateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'deactivated');
        }
    }
    // 每一个Vue实例在都会有一个生命周期，从创建到销毁
    // [beforeCreate、created、beforeMount、mounted、beforeUpdate、updated、beforeDestory、destoryed]
    // 在Vue实例的生命周期的各个阶段，用户可以自定义对应阶段的操作（定义一个钩子即回调函数）
    // 当Vue实例处于某个阶段时，如果用户定义了这个阶段的操作，则执行自定义操作
    // 在创建Vue实例的时候，可以传入自定义生命周期钩子
    // 例 new Vue({el:"#app1", data : {***}, beforeCreate:function() {}, created:function() {}...})
    function callHook(vm, hook) {
        var handlers = vm.$options[hook];
        if(handlers) {
            for(var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm);
                } catch(e) {
                    handleError(e, vm, (hook + " hook"));
                }
            }
        }
        if(vm._hasHookEvent) {
            vm.$emit('hook:' + hook);
        }
    }

    /*  */


    var MAX_UPDATE_COUNT = 100;
    // 存放Watcher实例对象的队列
    var queue = [];
    var activatedChildren = [];
    // 用于判断watcher是否已经添加到queue队列中
    var has = {};
    // 循环？？
    var circular = {};
    //
    var waiting = false;
    // 是否刷新queue
    var flushing = false;
    //
    var index = 0;

    /**
     * Reset the scheduler's state.
     * 重置schedulter的状态
     */
    function resetSchedulerState() {
        index = queue.length = activatedChildren.length = 0;
        has = {};
        {
            circular = {};
        }
        waiting = flushing = false;
    }

    /**
     * Flush both queues and run the watchers.
     * 刷新监听队列，并执行监听
     */
    function flushSchedulerQueue() {
        flushing = true;
        var watcher, id;

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        /*
         *  刷新监听队列之前，要先进行排序
         *  这是为了确保：
         *      1.更新components（从parent到child）；
         *      2.user watchers要放在render watcher之前（??）
         *      3.如果一个component在父component的watcher执行的时候被销毁，那么他的watchers可忽略
         */
        queue.sort(function(a, b) {
            return a.id - b.id;
        });

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for(index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has[id] = null;
            watcher.run();
            // in dev build, check and stop circular updates.
            if("development" !== 'production' && has[id] != null) {
                circular[id] = (circular[id] || 0) + 1;
                if(circular[id] > MAX_UPDATE_COUNT) {
                    warn(
                        'You may have an infinite update loop ' + (
                            watcher.user
                                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                                : "in a component render function."
                        ),
                        watcher.vm
                    );
                    break
                }
            }
        }

        // keep copies of post queues before resetting state
        var activatedQueue = activatedChildren.slice();
        var updatedQueue = queue.slice();

        resetSchedulerState();

        // call component updated and activated hooks
        callActivatedHooks(activatedQueue);
        callUpdatedHooks(updatedQueue);

        // devtool hook
        /* istanbul ignore if */
        if(devtools && config.devtools) {
            devtools.emit('flush');
        }
    }

    /**
     * 调用vm实例updated钩子
     * 在使用new Vue({el:"#app1", updated:function() {}})创建Vue实例
     * 此时就可以调用updated钩子函数
     * @param queue
     */
    function callUpdatedHooks(queue) {
        var i = queue.length;
        while(i--) {
            var watcher = queue[i];
            var vm = watcher.vm;
            if(vm._watcher === watcher && vm._isMounted) {
                callHook(vm, 'updated');
            }
        }
    }

    /**
     * Queue a kept-alive component that was activated during patch.
     * The queue will be processed after the entire tree has been patched.
     */
    function queueActivatedComponent(vm) {
        // setting _inactive to false here so that a render function can
        // rely on checking whether it's in an inactive tree (e.g. router-view)
        vm._inactive = false;
        activatedChildren.push(vm);
    }

    function callActivatedHooks(queue) {
        for(var i = 0; i < queue.length; i++) {
            queue[i]._inactive = true;
            activateChildComponent(queue[i], true /* true */);
        }
    }

    /**
     * Push a watcher into the watcher queue.
     * Jobs with duplicate IDs will be skipped unless it's
     * pushed when the queue is being flushed.
     * 将一个watcher添加到watcher队列中。
     */
    function queueWatcher(watcher) {
        var id = watcher.id;
        // 如果watcher已经被添加到watcher队列中， 则不需要添加
        if(has[id] == null) {
            has[id] = true;
            // 如果队列没有被刷新，则需要把watcher添加到watche队列中
            if(!flushing) {
                queue.push(watcher);
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                // 如果队列被刷新了， 由于watcher队列中的watcher会按照id从小打大排序
                // 需要将当前watcher根据id插入到合适的位置
                var i = queue.length - 1;
                while(i > index && queue[i].id > watcher.id) {
                    i--;
                }
                queue.splice(i + 1, 0, watcher);
            }
            // queue the flush
            if(!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue);
            }
        }
    }

    /*  */

    var uid$2 = 0;

    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     * 监听器负责执行表达式， 收集依赖关系。并且当表达式的值发生变化的时候， 执行对应的回调方法；
     * @param vm       创建监听器的Vue实例
     * @param expOrFn  监听器执行的表达式
     * @param cb       表达式的值发生变化时需要执行的回调函数
     * @param options
     */
    var Watcher = function Watcher(vm,
                                   expOrFn,
                                   cb,
                                   options) {
        // this->创建的监听器
        this.vm = vm;
        // 将创建的监听器添加到Vue实例的监听器列表中
        // 如果创建vm实例的时候，如果传入的配置项中有计算属性，也会为计算属性创建监听watcher，也会插入_watchers列表中
        vm._watchers.push(this);
        // options
        if(options) {
            this.deep = !!options.deep;
            this.user = !!options.user;
            // 延迟？？
            this.lazy = !!options.lazy;
            // 异步？？
            this.sync = !!options.sync;
        } else {
            this.deep = this.user = this.lazy = this.sync = false;
        }
        // 表达式的值发生变化时需要执行的回调函数
        this.cb = cb;
        // watcher对象的id
        this.id = ++uid$2; // uid for batching
        // watcher是否是激活的
        this.active = true;
        this.dirty = this.lazy; // for lazy watchers
        // watcher上次订阅的dep
        this.deps = [];
        // vm实例更新的时候，会使它对应的watcher重新订阅dep
        this.newDeps = [];
        // 存储监听器已经订阅的Dep对象实例的id，防止重复订阅。
        // watcher上次订阅的dep的id
        this.depIds = new _Set();
        // watcher这次订阅的dep的id
        this.newDepIds = new _Set();
        // watcher的表达式， 用于返回watcher的value值
        this.expression = expOrFn.toString();
        // parse expression for getter
        // this.getter,用于返回watcher的value值
        if(typeof expOrFn === 'function') {
            // 如果watcher执行的表达式是一个函数
            this.getter = expOrFn;
        } else {
            // 如果watcher执行的表达式不是一个函数，调用parsePath方法，生成一个getter方法。
            // 执行这个getter方法，实质上是从获取vm[expOrFn]的值。
            // 此时的话，如果expOrFn属性是响应式属性的话，会把watcher添加的expOrFn对应的dep中，建立watcher和dep的关联
            // 这样的话，如果expOrFn属性的值发生变化的时候，就会通知watcher进行更新操作
            this.getter = parsePath(expOrFn);
            if(!this.getter) {
                this.getter = function() {
                };
                "development" !== 'production' && warn(
                    "Failed watching path: \"" + expOrFn + "\" " +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                );
            }
        }
        // 获取监听器的value结果
        this.value = this.lazy
            ? undefined
            : this.get();
    };

    /**
     * Evaluate the getter, and re-collect dependencies.
     * 执行监听器的表达式，收集依赖关系
     */
    Watcher.prototype.get = function get() {
        // 将Dep.target设置为当前Watcher对象实例
        pushTarget(this);
        var value;
        var vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch(e) {
            if(this.user) {
                handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if(this.deep) {
                traverse(value);
            }
            popTarget();
            // watcher清楚依赖关系
            this.cleanupDeps();
        }
        return value
    };

    /**
     * Add a dependency to this directive.
     * 把dep，即Dep对象实例添加到Watcher的依赖中，同时，在将Watcher添加到Dep对象实例的订阅列表中（subs）
     * 响应式属性每次被读取的时候，它对应的dep对象会通知当前watcher来订阅。
     * 如果当前watcher之前没有订阅过dep，则将watcher添加到dep的订阅列表中(subs)
     */
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id;
        // 判断这一次有没有订阅
        if(!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            // 判断上一次有没有订阅
            if(!this.depIds.has(id)) {
                // 如果之前没有订阅过， 那么就把当前watcher添加到dep的订阅列表subs中
                dep.addSub(this);
            }
        }
    };

    /**
     * Clean up for dependency collection.
     * 清楚watcher上一次订阅的dep，并把这一次订阅的dep保存起来
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps() {
        // this-> Watcher实例对象
        var this$1 = this;
        // 上一次订阅的dep的数量
        var i = this.deps.length;
        while(i--) {
            var dep = this$1.deps[i];
            // 如果这一次没有订阅dep，那么就从dep的订阅列表中中将watcher移除
            if(!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1);
            }
        }
        // 将depIds 和 newDepIds的结果替换， 借助tmp
        var tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        // 将上次订阅的depId清空掉
        this.newDepIds.clear();

        // 将deps 和 newDeps的结果替换， 借助tmp
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        // 将上次订阅的dep清除掉
        this.newDeps.length = 0;
    };

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     * 当一个Vue实例的响应式属性发生变化的时候，响应式属性的Dep对象实例会通知vue实例的监听器执行更新操作
     */
    Watcher.prototype.update = function update() {
        /* istanbul ignore else */
        if(this.lazy) {
            this.dirty = true;
        } else if(this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    };

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     * Watcher实例对象的run方法会被调度器调用
     */
    Watcher.prototype.run = function run() {
        if(this.active) {
            // 监听器新的value
            var value = this.get();
            if(
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                isObject(value) ||
                this.deep
            ) {
                // set new value
                var oldValue = this.value;
                this.value = value;
                if(this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue);
                    } catch(e) {
                        handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        }
    };

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     * 执行监听器监听的方法，返回值？？
     */
    Watcher.prototype.evaluate = function evaluate() {
        this.value = this.get();
        this.dirty = false;
    };

    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend() {
        var this$1 = this;

        var i = this.deps.length;
        while(i--) {
            this$1.deps[i].depend();
        }
    };

    /**
     * Remove self from all dependencies' subscriber list.
     * 将watcher从Vue实例对象的_watch列表和他订阅的所有dep的subs列表中移除掉
     */
    Watcher.prototype.teardown = function teardown() {
        var this$1 = this;

        if(this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if(!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this);
            }
            var i = this.deps.length;
            while(i--) {
                this$1.deps[i].removeSub(this$1);
            }
            this.active = false;
        }
    };

    /**
     * Recursively traverse an object to evoke all converted
     * getters, so that every nested property inside the object
     * is collected as a "deep" dependency.
     */
    var seenObjects = new _Set();

    function traverse(val) {
        seenObjects.clear();
        _traverse(val, seenObjects);
    }

    function _traverse(val, seen) {
        var i, keys;
        var isA = Array.isArray(val);
        if((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if(val.__ob__) {
            var depId = val.__ob__.dep.id;
            if(seen.has(depId)) {
                return
            }
            seen.add(depId);
        }
        if(isA) {
            i = val.length;
            while(i--) {
                _traverse(val[i], seen);
            }
        } else {
            keys = Object.keys(val);
            i = keys.length;
            while(i--) {
                _traverse(val[keys[i]], seen);
            }
        }
    }

    /*  */
    // 共享的默认的， 属性描述对象
    var sharedPropertyDefinition = {
        // 可枚举
        enumerable : true,
        // 可配置
        configurable : true,
        // 获取属性值方法
        get : noop,
        // 设置属性值方法
        set : noop
    };
    // 在目标对象target中，定义属性key
    // 将target[sourceKey]对象中的key属性， 代理到Vue实例上
    // 然后我们调用target[key]的时候，就相当于是调用target[sourceKey][key]
    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return this[sourceKey][key]
        };
        sharedPropertyDefinition.set = function proxySetter(val) {
            this[sourceKey][key] = val;
        };
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function initState(vm) {
        // 给Vue实例添加监听器数组， 一个Vue实例会有多个监听器
        vm._watchers = [];
        // Vue实例对象的配置项
        var opts = vm.$options;
        // props对应注册组件时传入的props配置项
        if(opts.props) {
            // 将组件props配置项中的属性添加到组件实例上，赋值，并设置为响应式属性
            initProps(vm, opts.props);
        }
        // opts.methods对应new Vue(el:"", methods:{})中的methods
        // methods中会被混入到Vue实例中。
        // 可以直接通过Vue实例对象直接访问这些方法，或者在指令表达式中使用
        // 方法中的this 自动绑定为Vue实例对象
        // 如果vm是Vue实例对象，则methods属性为Vue实例对象配置项的methods属性
        // 如果vm是组件实例对象， 则methods属性为组件构造函数的methods属性
        if(opts.methods) {
            // 初始化方法属性
            initMethods(vm, opts.methods);
        }

        // 如果vm是Vue实例对象，则data属性为Vue实例对象配置项的data属性
        // 如果vm是组件实例对象， 则data属性为组件构造函数的data属性
        if(opts.data) {
            // opts.data对应new Vue({el:"",data:{}})中的data
            // 如果Vue实例的配置项中有data属性，对data属性进行初始化，将data属性对应的对象中的属性全部转化为响应式属性
            // Vue实例创建之后， 可以通过vm.$data 访问原始数据对象。
            // Vue实例也代理了data对象上所有的属性， 访问vm.a就相当于访问 vm.$data.a
            initData(vm);
        } else {
            observe(vm._data = {}, true /* asRootData */);
        }
        // opts.computed对应new Vue({el:"", computed:{}})中的computed
        // 计算属性将被混入到Vue实例中。
        // 计算属性的结果会被缓存，除非依赖的响应式属性变化才会重新计算
        // 如果vm是Vue实例对象，则computed属性为Vue实例对象配置项的computed属性
        // 如果vm是组件实例对象， 则computed属性为组件构造函数的computed属性
        if(opts.computed) {
            // 初始化计算属性
            initComputed(vm, opts.computed);
        }
        // opts.watch对应new Vue({el:"", watch:{a:fn}})中的watch
        // 其中a是需要观察的表达式， fn是对应的回调函数
        // 如果vm是Vue实例对象，则watch属性为创建Vue实例对象传入的watch配置项
        // 如果vm是组件实例对象， 则watch属性为注册组件时的watch配置项
        if(opts.watch && opts.watch !== nativeWatch) {
            // 初始化监听属性
            initWatch(vm, opts.watch);
        }
    }

    /**
     * 检查name类型的配置项是否是一个标准的js对象
     * @param vm      Vue实例对象
     * @param name    配置项中属性名，like  data，computed，methods等
     */
    function checkOptionType(vm, name) {
        // 获取配置项中name类型的配置项
        var option = vm.$options[name];
        // 如果name对应的配置项不是一个标准的js对象(不能是函数，数组啥的)
        if(!isPlainObject(option)) {
            warn(
                ("component option \"" + name + "\" should be an object."),
                vm
            );
        }
    }

    /**
     * 遍历注册组件时的props配置项中的属性，给这些props属性赋值并且将这些属性设置成响应式属性
     * 在生成组件构造函数的时候，已经把props配置项中的属性添加到组件构造函数的原型对象上
     * 生成的组件实例上，都会包含props配置项中的属性。访问组件实例的props属性，同时也会返回组件实例_props中的props属性
     * @param vm              Vue实例对象， 一般为组件实例对象
     * @param propsOptions    注册组件或者内置组件的props配置项
     */
    function initProps(vm, propsOptions) {
        // 从组件实例的配置项中获取注册组件是的props配置项中的属性和对应的属性值
        var propsData = vm.$options.propsData || {};
        // 给Vue实例添加_props属性
        var props = vm._props = {};
        // cache prop keys so that future props updates can iterate using Array
        // instead of dynamic object key enumeration.
        var keys = vm.$options._propKeys = [];
        var isRoot = !vm.$parent;
        // root instance props should be converted
        observerState.shouldConvert = isRoot;
        var loop = function(key) {
            keys.push(key);
            // 从props数据项中获取key属性对应的属性值
            // propsData为父组件传递给子组件的值
            var value = validateProp(key, propsOptions, propsData, vm);
            /* istanbul ignore else */
            {
                if(isReservedAttribute(key) || config.isReservedAttr(key)) {
                    warn(
                        ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
                        vm
                    );
                }
                // 将组件实例的key属性，_props[key]的值为value， 同时将_props中的属性设置为响应式属性
                defineReactive$$1(props, key, value, function() {
                    if(vm.$parent && !isUpdatingChildComponent) {
                        warn(
                            "Avoid mutating a prop directly since the value will be " +
                            "overwritten whenever the parent component re-renders. " +
                            "Instead, use a data or computed property based on the prop's " +
                            "value. Prop being mutated: \"" + key + "\"",
                            vm
                        );
                    }
                });
            }
            // static props are already proxied on the component's prototype
            // during Vue.extend(). We only need to proxy props defined at
            // instantiation here.
            if(!(key in vm)) {
                // 设置代理，操作vm[key]，就相当于操作vm[_props][key]
                proxy(vm, "_props", key);
            }
        };
        // 遍历注册组件的props属性
        for(var key in propsOptions) loop(key);
        observerState.shouldConvert = true;
    }

    /**
     * 将vue实例配置项中的data属性对应的对象中的属性， 全部转化为响应式属性
     * 同时将配置项种的属性添加到Vue实例对象上
     * @param vm
     */
    function initData(vm) {
        var data = vm.$options.data;
        // 获取Vue实例的data属性值
        data = vm._data = typeof data === 'function'
            ? getData(data, vm)
            : data || {};
        if(!isPlainObject(data)) {
            data = {};
            "development" !== 'production' && warn(
                'data functions should return an object:\n' +
                'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
                vm
            );
        }
        // proxy data on instance
        // data对象的key值
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var methods = vm.$options.methods;
        var i = keys.length;
        while(i--) {
            var key = keys[i];
            {
                if(methods && hasOwn(methods, key)) {
                    warn(
                        ("method \"" + key + "\" has already been defined as a data property."),
                        vm
                    );
                }
            }
            if(props && hasOwn(props, key)) {
                "development" !== 'production' && warn(
                    "The data property \"" + key + "\" is already declared as a prop. " +
                    "Use prop default value instead.",
                    vm
                );
            } else if(!isReserved(key)) {
                // _data中存储的是调用new Vue()构建实例的时候，传入的data属性的值
                // like: new Vue({el:"#app1", data:{"attr1" : "***"}})的时候
                // _data : {"attr1" : ""}
                // 给Vue实例添加attr1属性， 并且Vue实例的attr1属性和_data的属性关联
                // Vue实例中attr1属性的读取，也会触发_data对象中attr1属性的读取,
                // 即我们调用vm[key]，就相当于访问了vm._data[key]
                proxy(vm, "_data", key);
            }
        }
        // observe data, 对data进行监听
        // 如果data对象没有observer，创建observer。
        // 将data的属性，全部转化为响应式属性
        // like: new Vue({el:"#app1", data:{"attr1" :"****"}}), 重新定义data选项中属性attr1的getter/setter，是的属性attr1位响应式属性
        // data的_ob_属性，对应为observer
        observe(data, true /* asRootData */);
    }

    function getData(data, vm) {
        try {
            return data.call(vm)
        } catch(e) {
            handleError(e, vm, "data()");
            return {}
        }
    }
    // 计算属性监听配置项，延迟？？
    var computedWatcherOptions = {lazy : true};

    /**
     * 初始化计算属性，给计算属性添加监听，并且将计算属性添加到Vue对象实例上
     * @param vm            Vue实例对象
     * @param computed      计算属性配置项  new Vue({el : "#app1", data:{...},computed:{...}})中的computed
     */
    function initComputed(vm, computed) {
        "development" !== 'production' && checkOptionType(vm, 'computed');
        // 计算属性观察者
        var watchers = vm._computedWatchers = Object.create(null);
        // 遍历计算属性中的配置项
        for(var key in computed) {
            // 计算属性对应的方法
            var userDef = computed[key];
            var getter = typeof userDef === 'function' ? userDef : userDef.get;
            {
                if(getter === undefined) {
                    warn(
                        ("No getter function has been defined for computed property \"" + key + "\"."),
                        vm
                    );
                    getter = noop;
                }
            }
            // create internal watcher for the computed property.
            watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions);

            // component-defined computed properties are already defined on the
            // component prototype. We only need to define computed properties defined
            // at instantiation here.
            if(!(key in vm)) {
                // 给Vue实例对象添加计算属性
                defineComputed(vm, key, userDef);
            } else {
                if(key in vm.$data) {
                    warn(("The computed property \"" + key + "\" is already defined in data."), vm);
                } else if(vm.$options.props && key in vm.$options.props) {
                    warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
                }
            }
        }
    }

    /**
     * 给Vue实例对象添加计算属性
     * @param target      添加计算属性的目标对象， 一般为Vue对象实例
     * @param key         计算属性名
     * @param userDef     计算属性对应的方法
     */
    function defineComputed(target, key, userDef) {
        if(typeof userDef === 'function') {
            // 定义属性描述对象的get属性
            sharedPropertyDefinition.get = createComputedGetter(key);
            // 定义属性描述对象的set属性
            sharedPropertyDefinition.set = noop;
        } else {
            sharedPropertyDefinition.get = userDef.get
                ? userDef.cache !== false
                    ? createComputedGetter(key)
                    : userDef.get
                : noop;
            sharedPropertyDefinition.set = userDef.set
                ? userDef.set
                : noop;
        }
        // 给target定义key属性
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    /**
     * 创建计算属性的getter？？
     * @param key       计算属性
     * @return {computedGetter}
     */
    function createComputedGetter(key) {
        // 如果使用了计算属性。在创建虚拟dom节点的时候，就会调用计算属性对应的方法，就会执行computedGetter
        return function computedGetter() {
            // 返回计算属性的监听
            var watcher = this._computedWatchers && this._computedWatchers[key];
            if(watcher) {
                // "脏标志位？？"
                if(watcher.dirty) {
                    watcher.evaluate();
                }
                if(Dep.target) {
                    watcher.depend();
                }
                return watcher.value
            }
        }
    }

    /**
     * 将methods配置项中的方法添加到Vue实例对象上
     * @param vm          Vue实例对象
     * @param methods     new Vue({el : "***", methods:{a:function() {}}})中的methods配置项
     */
    function initMethods(vm, methods) {
        "development" !== 'production' && checkOptionType(vm, 'methods');
        var props = vm.$options.props;
        // 遍历配置项中的methods
        for(var key in methods) {
            // 将methods配置项中的方法添加到实例对象上，调用方法时是通过vm.***调用， 这样方法中的this指向Vue实例对象
            vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
            {
                if(methods[key] == null) {
                    warn(
                        "method \"" + key + "\" has an undefined value in the component definition. " +
                        "Did you reference the function correctly?",
                        vm
                    );
                }
                if(props && hasOwn(props, key)) {
                    warn(
                        ("method \"" + key + "\" has already been defined as a prop."),
                        vm
                    );
                }
            }
        }
    }

    /**
     * 给配置项中watcher中的每一个属性，建立监听器
     * @param vm     Vue对象实例vm(包含组件实例对象)
     * @param watch  watch配置项，like new Vue({data:{},methods:{},watch:{}})
     */
    function initWatch(vm, watch) {
        "development" !== 'production' && checkOptionType(vm, 'watch');
        // 遍历监听配置项中的属性
        for(var key in watch) {
            // 监听对应的回调方法
            var handler = watch[key];
            if(Array.isArray(handler)) {
                for(var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                }
            } else {
                createWatcher(vm, key, handler);
            }
        }
    }

    /**
     * 给要监听的对象keyOrFn，建立监听器
     * @param vm         Vue对象实例
     * @param keyOrFn    需要监听的属性
     * @param handler    监听属性发生变化之后的回调函数
     * @param options
     */
    function createWatcher(vm,
                           keyOrFn,
                           handler,
                           options) {
        // 如果handler是标准的js对象(而不是数组、函数什么的)
        if(isPlainObject(handler)) {
            options = handler;
            handler = handler.handler;
        }
        // 如果handler是字符串
        if(typeof handler === 'string') {
            handler = vm[handler];
        }
        return vm.$watch(keyOrFn, handler, options)
    }

    /**
     * 状态混入，给Vue构造函数对象的原型对象prototype添加$data, $prop属性
     * @param Vue  Vue构造函数
     */
    function stateMixin(Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {};
        dataDef.get = function() {
            return this._data
        };
        var propsDef = {};
        propsDef.get = function() {
            return this._props
        };
        {
            dataDef.set = function(newData) {
                warn(
                    'Avoid replacing instance root $data. ' +
                    'Use nested data properties instead.',
                    this
                );
            };
            propsDef.set = function() {
                warn("$props is readonly.", this);
            };
        }
        // 给Vue构造函数的原型对象添加$data属性，这样构建出来的Vue实例的对象也会有这个属性
        // 访问实例的$data属性， 就是访问实例的_data属性
        Object.defineProperty(Vue.prototype, '$data', dataDef);
        // 给Vue构造函数的原型对象添加$props属性，这样构建出来的Vue实例的对象也会有这个属性
        // 访问实例的$props属性， 就是访问实例的_prop属性
        Object.defineProperty(Vue.prototype, '$props', propsDef);
        // 全局 Vue.set的别名
        Vue.prototype.$set = set;
        // 全局 Vue.delete 的别名
        Vue.prototype.$delete = del;
        // 观察Vue实例变化的一个表达式或者计算属性函数。回调函数得到的参数为新值和旧值。
        // 表达式只接受监督的键路劲，对于更复杂的表达式，用一个函数取代
        // expOrFn 监听的对象
        // cb： 监听的对象发生变化后，要执行的回调函数
        /**
         *
         * @param expOrFn
         * @param cb
         * @param options
         * @return {unwatchFn}
         */
        Vue.prototype.$watch = function(expOrFn,
                                        cb,
                                        options) {
            // this-> 当前Vue实例对象vm
            var vm = this;
            if(isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options)
            }
            options = options || {};
            options.user = true;
            // 创建一个监听器，监听expOrFn的变化。监听器会添加到vm实例的_watchers监听器列表中
            var watcher = new Watcher(vm, expOrFn, cb, options);
            if(options.immediate) {
                // 是否直接运行？？
                cb.call(vm, watcher.value);
            }
            return function unwatchFn() {
                watcher.teardown();
            }
        };
    }

    /*  */

    function initProvide(vm) {
        var provide = vm.$options.provide;
        if(provide) {
            vm._provided = typeof provide === 'function'
                ? provide.call(vm)
                : provide;
        }
    }

    function initInjections(vm) {
        var result = resolveInject(vm.$options.inject, vm);
        if(result) {
            observerState.shouldConvert = false;
            Object.keys(result).forEach(function(key) {
                /* istanbul ignore else */
                {
                    defineReactive$$1(vm, key, result[key], function() {
                        warn(
                            "Avoid mutating an injected value directly since the changes will be " +
                            "overwritten whenever the provided component re-renders. " +
                            "injection being mutated: \"" + key + "\"",
                            vm
                        );
                    });
                }
            });
            observerState.shouldConvert = true;
        }
    }

    function resolveInject(inject, vm) {
        if(inject) {
            // inject is :any because flow is not smart enough to figure out cached
            var result = Object.create(null);
            var keys = hasSymbol
                ? Reflect.ownKeys(inject)
                : Object.keys(inject);

            for(var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var provideKey = inject[key];
                var source = vm;
                while(source) {
                    if(source._provided && provideKey in source._provided) {
                        result[key] = source._provided[provideKey];
                        break
                    }
                    source = source.$parent;
                }
                if("development" !== 'production' && !hasOwn(result, key)) {
                    warn(("Injection \"" + key + "\" not found"), vm);
                }
            }
            return result
        }
    }

    /*  */

    function createFunctionalComponent(Ctor,
                                       propsData,
                                       data,
                                       context,
                                       children) {
        var props = {};
        var propOptions = Ctor.options.props;
        if(isDef(propOptions)) {
            for(var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData || {});
            }
        } else {
            if(isDef(data.attrs)) {
                mergeProps(props, data.attrs);
            }
            if(isDef(data.props)) {
                mergeProps(props, data.props);
            }
        }
        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var _context = Object.create(context);
        var h = function(a, b, c, d) {
            return createElement(_context, a, b, c, d, true);
        };
        var vnode = Ctor.options.render.call(null, h, {
            data : data,
            props : props,
            children : children,
            parent : context,
            listeners : data.on || {},
            injections : resolveInject(Ctor.options.inject, context),
            slots : function() {
                return resolveSlots(children, context);
            }
        });
        if(vnode instanceof VNode) {
            vnode.functionalContext = context;
            vnode.functionalOptions = Ctor.options;
            if(data.slot) {
                (vnode.data || (vnode.data = {})).slot = data.slot;
            }
        }
        return vnode
    }

    function mergeProps(to, from) {
        for(var key in from) {
            to[camelize(key)] = from[key];
        }
    }

    /*  */

    // hooks to be invoked on component VNodes during patch
    // patch过程中，组件型虚拟dom节点运行的钩子函数
    var componentVNodeHooks = {
        /**
         * 组件的init钩子，创建组件实例对象，并mounted
         * @param vnode        组件型虚拟dom节点
         * @param hydrating
         * @param parentElm    父真实dom节点
         * @param refElm       相关真实dom节点
         */
        init : function init(vnode,
                             hydrating,
                             parentElm,
                             refElm) {
            // 如果组件型虚拟dom节点对应的组件实例不存在或者已经被销毁
            if(!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
                // 调用组件的构造函数，创建组件实例
                var child = vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance,
                    parentElm,
                    refElm
                );
                // 调用Vue实例的$mount方法，挂载组件实例。
                // mount之后，组件template对应的dom元素已经全部创建完毕，包括添加事件等
                child.$mount(hydrating ? vnode.elm : undefined, hydrating);
            } else if(vnode.data.keepAlive) {
                // kept-alive components, treat as a patch
                var mountedNode = vnode; // work around flow
                componentVNodeHooks.prepatch(mountedNode, mountedNode);
            }
        },
        /**
         * 组件被更新之间，需要执行prepatch钩子函数
         * @param oldVnode    旧的组件对应的占位虚拟dom节点
         * @param vnode       新的组件对应的占位虚拟dom节点
         */
        prepatch : function prepatch(oldVnode, vnode) {
            // 新的占位虚拟dom节点的组件配置项
            var options = vnode.componentOptions;
            // 在次阶段，新的组件虚拟dom节点对应的组件实例还没有构建，需要初始化
            var child = vnode.componentInstance = oldVnode.componentInstance;
            updateChildComponent(
                // 组件实例对象
                child,
                // 占位节点上的数据项，一般为props数据项
                options.propsData, // updated props
                // 占位节点上绑定的自定义事件
                options.listeners, // updated listeners
                // 占位虚拟dom节点
                vnode, // new parent vnode
                // 组件中需要分发的内容的虚拟dom节点
                options.children // new children
            );
        },
        /**
         * 组件的insert钩子
         * @param vnode    组件对应的占位虚拟dom节点
         */
        insert : function insert(vnode) {
            // 上下文环境，为Vue实例对象
            var context = vnode.context;
            // 组件实例对象
            var componentInstance = vnode.componentInstance;
            if(!componentInstance._isMounted) {
                // 设置组件的mounted标志为为true
                componentInstance._isMounted = true;
                // 执行组件的mounted钩子函数
                callHook(componentInstance, 'mounted');
            }
            if(vnode.data.keepAlive) {
                if(context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance);
                } else {
                    activateChildComponent(componentInstance, true /* direct */);
                }
            }
        },
        /**
         * 组件的destory钩子函数
         * @param vnode    虚拟dom节点
         */
        destroy : function destroy(vnode) {
            // 组件实例对象
            var componentInstance = vnode.componentInstance;
            if(!componentInstance._isDestroyed) {
                // 如果组件不是处理keep-alive中， 那么直接销毁组件实例
                if(!vnode.data.keepAlive) {
                    componentInstance.$destroy();
                } else {
                    deactivateChildComponent(componentInstance, true /* direct */);
                }
            }
        }
    };
    // 组件型虚拟dom节点的钩子，包含：init, insert, prepatch, destory
    var hooksToMerge = Object.keys(componentVNodeHooks);

    /**
     * 创建组件，创建组件对应的虚拟dom节点(此时，虚拟dom节点对应的真实dom节点是没有的，对应的组件实例对象也是没有的)
     * @param Ctor       组件构造函数，此时Ctor有可能是函数(全局组件)，也可能是对象(局部组件)。
     * @param data       要创建的虚拟dom节点需要的data配置项(在编译阶段，通过gen***函数生成的)
     * @param context    上下文，一般为Vue实例对象
     * @param children   子虚拟dom节点, 一般为组件内要分发的内容对应的虚拟dom节点
     * @param tag        标签的名称， 一般为自定义标签名称
     * @return {VNode}   返回组件对应的虚拟dom节点
     */
    function createComponent(Ctor,
                             data,
                             context,
                             children,
                             tag) {
        if(isUndef(Ctor)) {
            return
        }
        // 基础构造函数， 一般为Vue构造函数
        var baseCtor = context.$options._base;

        // plain options object: turn it into a constructor
        // 判断构造函数是不是一个函数类型的对象，如果不是的话，需要调用Vue.extend方法，生成一个构造函数
        // 如果使用组件是通过全局注册这种方式，like Vue.component("my-component", {"template" : ""})的形式，
        //     my-component对应的构造函数已经创建好；
        // 如果使用组件的方式是通过components配置项添加，like new Vue({components:{"my-component":{"template":""}}})的形式，
        //     my-component对应的构造函数此时还是一个对象，需要创建对应的构造函数
        if(isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor);
        }

        // if at this stage it's not a constructor or an async component factory,
        // reject.
        if(typeof Ctor !== 'function') {
            {
                warn(("Invalid Component definition: " + (String(Ctor))), context);
            }
            return
        }

        // async component 异步组件？？
        var asyncFactory;
        if(isUndef(Ctor.cid)) {
            asyncFactory = Ctor;
            Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
            if(Ctor === undefined) {
                // return a placeholder node for async component, which is rendered
                // as a comment node but preserves all the raw information for the node.
                // the information will be used for async server-rendering and hydration.
                return createAsyncPlaceholder(
                    asyncFactory,
                    data,
                    context,
                    children,
                    tag
                )
            }
        }
        // 创建虚拟dom节点的数据项
        data = data || {};

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor);

        // transform component v-model data into props & events
        if(isDef(data.model)) {
            transformModel(Ctor.options, data);
        }

        // extract props 提取props
        // 根据注册组件时的props配置项，从组件型虚拟dom节点的data数据项中获取prop属性对应的属性值
        var propsData = extractPropsFromVNodeData(data, Ctor, tag);

        // functional component
        if(isTrue(Ctor.options.functional)) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // keep listeners
        // 组件实例上绑定的自定义事件
        var listeners = data.on;

        if(isTrue(Ctor.options.abstract)) {
            // abstract components do not keep anything
            // other than props & listeners & slot

            // work around flow
            var slot = data.slot;
            data = {};
            if(slot) {
                data.slot = slot;
            }
        }

        // merge component management hooks onto the placeholder node
        // 合并组件的钩子
        mergeHooks(data);

        // return a placeholder vnode
        var name = Ctor.options.name || tag;
        // 创建组件型虚拟dom节点
        var vnode = new VNode(
            ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
            data, undefined, undefined, undefined, context,
            {Ctor : Ctor, propsData : propsData, listeners : listeners, tag : tag, children : children},
            asyncFactory
        );
        // 此时虚拟dom节点对应的真实dom节点是空的
        return vnode
    }

    /**
     * 调用组件构造函数，创建组件实例
     * @param vnode       组件型虚拟dom节点(占位符节点)
     * @param parent      父实例，一般为Vue实例对象
     * @param parentElm   父真实dom节点
     * @param refElm      相关真实dom节点
     * @return {*}
     */
    function createComponentInstanceForVnode(vnode, // we know it's MountedComponentVNode but flow doesn't
                                             parent, // activeInstance in lifecycle state
                                             parentElm,
                                             refElm) {
        // 组件型虚拟dom节点的组件配置项
        var vnodeComponentOptions = vnode.componentOptions;
        // 组件配置项，相当于构造Vue实例时传入的用户配置项
        var options = {
            // 组件标志位
            _isComponent : true,
            // 父作用域， 一般为Vue实例或者组件实例
            parent : parent,
            // 组件绑定的属性，注册组件时props配置项中的prop属性及prop属性对应的属性值
            propsData : vnodeComponentOptions.propsData,
            // 组件名称(自定义标签名称)
            _componentTag : vnodeComponentOptions.tag,
            // 组件对应的模板也会渲染成虚拟dom节点，设置当前虚拟dom节点为模板渲染成的虚拟dom节点的父节点
            // 是为了从父虚拟dom节点上获取数据，比如props
            _parentVnode : vnode,
            // 自定义组件上绑定的事件
            _parentListeners : vnodeComponentOptions.listeners,
            // 组件中要分发的内容对应的虚拟dom节点
            _renderChildren : vnodeComponentOptions.children,
            // 父真实dom节点
            _parentElm : parentElm || null,
            // 相关真实dom节点
            _refElm : refElm || null
        };
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate;
        if(isDef(inlineTemplate)) {
            options.render = inlineTemplate.render;
            options.staticRenderFns = inlineTemplate.staticRenderFns;
        }
        // 调用组件构造函数，执行组件实例_init方法，实际上是执行Vue实例的_init方法
        // 和创建Vue实例对象的过程是一模一样的，实际上组件实例对象就是Vue实例对象
        // 此时仅仅生成一个组件实例，组件实例还没有被挂载，组件实例对应的渲染函数还没有生成
        return new vnodeComponentOptions.Ctor(options)
    }

    /**
     * 合并组件的钩子
     * @param data
     */
    function mergeHooks(data) {
        if(!data.hook) {
            data.hook = {};
        }
        for(var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i];
            var fromParent = data.hook[key];
            var ours = componentVNodeHooks[key];
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
        }
    }

    function mergeHook$1(one, two) {
        return function(a, b, c, d) {
            one(a, b, c, d);
            two(a, b, c, d);
        }
    }

    // transform component v-model info (value and callback) into
    // prop and event handler respectively.
    function transformModel(options, data) {
        var prop = (options.model && options.model.prop) || 'value';
        var event = (options.model && options.model.event) || 'input';
        (data.props || (data.props = {}))[prop] = data.model.value;
        var on = data.on || (data.on = {});
        if(isDef(on[event])) {
            on[event] = [data.model.callback].concat(on[event]);
        } else {
            on[event] = data.model.callback;
        }
    }

    /*  */

    var SIMPLE_NORMALIZE = 1;
    var ALWAYS_NORMALIZE = 2;

    // wrapper function for providing a more flexible interface
    // without getting yelled at by flow
    /**
     * 创建虚拟dom节点
     * @param context    上下文， 一般为Vue实例对象
     * @param tag        虚拟dom节点对应的标签
     * @param data       创建虚拟dom节点的配置项， 一般有domProps, attrs等
     * @param children   子虚拟dom节点（已创建好）,
     * @param normalizationType
     * @param alwaysNormalize
     * @returns {*}
     */
    function createElement(context,
                           tag,
                           data,
                           children,
                           normalizationType,
                           alwaysNormalize) {
        if(Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children;
            children = data;
            data = undefined;
        }
        if(isTrue(alwaysNormalize)) {
            normalizationType = ALWAYS_NORMALIZE;
        }
        // 创建元素类型的虚拟dom节点
        return _createElement(context, tag, data, children, normalizationType)
    }

    /**
     * 创建虚拟dom节点，如果标签的名称是保留的，即创建元素型dom节点，如果标签的名称是自定义的，即创建组件型虚拟dom节点
     * @param context   上下文环境， 一般为Vue实例对象
     * @param tag       标签名称
     * @param data      创建虚拟dom节点需要用到的配置项
     * @param children  子虚拟dom节点（已创建好)。
     *                  如果当前虚拟dom节点对应的是保留的标签(div等)，那么子虚拟dom节点添加到当前虚拟dom节点的children属性中；
     *                  如果当前虚拟dom节点对应的是自定义标签(组件)，那么子虚拟dom节点对应的是组件中要分发的内容，
     *                      应该添加到虚拟dom节点componentOptions配置项的children属性中
     * @param normalizationType
     * @returns {*}
     * @private
     */
    function _createElement(context,
                            tag,
                            data,
                            children,
                            normalizationType) {
        if(isDef(data) && isDef((data).__ob__)) {
            "development" !== 'production' && warn(
                "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
                'Always create fresh vnode data objects in each render!',
                context
            );
            return createEmptyVNode()
        }
        // object syntax in v-bind
        if(isDef(data) && isDef(data.is)) {
            tag = data.is;
        }
        // 如果标签名称为空，返回一个空的虚拟dom节点
        if(!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // warn against non-primitive key
        if("development" !== 'production' &&
            isDef(data) && isDef(data.key) && !isPrimitive(data.key)
        ) {
            warn(
                'Avoid using non-primitive value as key, ' +
                'use string/number value instead.',
                context
            );
        }
        // support single function children as default scoped slot
        if(Array.isArray(children) &&
            typeof children[0] === 'function'
        ) {
            data = data || {};
            data.scopedSlots = {default : children[0]};
            children.length = 0;
        }
        if(normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children);
        } else if(normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children);
        }
        var vnode, ns;
        // 如果标签名称的类型是字符串
        if(typeof tag === 'string') {
            var Ctor;
            // 获取标签的命名空间
            ns = config.getTagNamespace(tag);
            // 如果标签是保留的标签，不是自定义标签，创建标签对应的虚拟dom节点
            if(config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag), data, children,
                    undefined, undefined, context
                );
            } else if(isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
                // 根据tag名，从Vue实例或者Vue构造函数的配置项中获取注册组件时配置项
                // component
                // Ctor有可能是构造函数(全局组件)， 也可能是对象(局部组件或者内置组件)
                // 生成组件标签对应的虚拟dom节点
                vnode = createComponent(Ctor, data, context, children, tag);
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(
                    tag, data, children,
                    undefined, undefined, context
                );
            }
        } else {
            // direct component options / constructor
            // 如果标签名称的配型不是字符串， 则是组件
            vnode = createComponent(tag, data, context, children);
        }
        if(isDef(vnode)) {
            if(ns) {
                applyNS(vnode, ns);
            }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS(vnode, ns) {
        vnode.ns = ns;
        if(vnode.tag === 'foreignObject') {
            // use default namespace inside foreignObject
            return
        }
        if(isDef(vnode.children)) {
            for(var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i];
                if(isDef(child.tag) && isUndef(child.ns)) {
                    applyNS(child, ns);
                }
            }
        }
    }

    /*  */

    /**
     * Runtime helper for rendering v-for lists.
     * 用于渲染v-for列表
     * @param   val     对应items， items每一个属性都是响应式的
     * @param   render  渲染函数
     */
    function renderList(val,
                        render) {
        var ret, i, l, keys, key;
        // 如果val是数组， 则v-for的使用方式为(item, index) in items
        if(Array.isArray(val) || typeof val === 'string') {
            // 如果val是一个数组，那么遍历val，分别调用render（createElement）,来生成虚拟dom节点
            ret = new Array(val.length);
            for(i = 0, l = val.length; i < l; i++) {
                // val    对应(item, index) in items 中的items
                // val[i] 对应(item, index) in items 中的item
                // i      对应(item, index) in items 中的index
                ret[i] = render(val[i], i);
            }
        } else if(typeof val === 'number') {
            ret = new Array(val);
            for(i = 0; i < val; i++) {
                ret[i] = render(i + 1, i);
            }
        } else if(isObject(val)) {
            // 如果val是对象, 则v-for的使用方式为(value, key, index) in items
            keys = Object.keys(val);
            // 将对象的属性转化成一个数组，然后遍历数组，分别执行createElement方法，生成虚拟dom节点
            ret = new Array(keys.length);
            for(i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                // val      对应(value, key, index) in items 中的items
                // val[key] 对应(value, key, index) in items 中的value，对象属性的属性值
                // key      对应(value, key, index) in items 中的key， 对象的属性名
                // i        对应(value, key, index) in items 中的index， 遍历对象属性的索引
                ret[i] = render(val[key], key, i);
            }
        }
        if(isDef(ret)) {
            (ret)._isVList = true;
        }
        return ret
    }

    /*  */

    /**
     * Runtime helper for rendering <slot>
     * 返回组件模板slot标签对应的虚拟dom节点
     * 如果slot是默认插槽，则从组件中获取没有slot属性的分发内容(虚拟dom节点)；
     * 如果slot是具名插槽，则从组件中获取对应slot属性的分发内容(虚拟dom节点)
     * @param   name      组件模板中slot的名称，具名slot或者default slot
     * @param   fallback  组件模板中slot标签中的内容对应的虚拟dom节点
     *                      (如果原组件中没有要分发的内容是，组件模板slot标签中的内容才会显示)
     * @param   props
     * @param   bindObject
     */
    function renderSlot(name,
                        fallback,
                        props,
                        bindObject) {
        // 作用域插槽？？
        var scopedSlotFn = this.$scopedSlots[name];
        if(scopedSlotFn) { // scoped slot
            props = props || {};
            if(bindObject) {
                props = extend(extend({}, bindObject), props);
            }
            return scopedSlotFn(props) || fallback
        } else {
            // 根据组件模板中slot插槽的名称，获取组件中对应的分发内容(虚拟dom节点)
            var slotNodes = this.$slots[name];
            // warn duplicate slot usage
            if(slotNodes && "development" !== 'production') {
                slotNodes._rendered && warn(
                    "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
                    "- this will likely cause render errors.",
                    this
                );
                slotNodes._rendered = true;
            }
            // 返回组件模板中slot标签对应的虚拟dom节点
            // 如果组件中没有对应的分发内容的话，那么返回slot标签中的内容(虚拟dom节点)
            return slotNodes || fallback
        }
    }

    /*  */

    /**
     * Runtime helper for resolving filters
     */
    function resolveFilter(id) {
        return resolveAsset(this.$options, 'filters', id, true) || identity
    }

    /*  */

    /**
     * Runtime helper for checking keyCodes from config.
     * 判断触发事件的eventKeyCode是否是key，如果不是，返回true；如果是，返回false
     * @param eventKeyCode   触发事件的键
     * @param key            事件键值修饰符
     * @builtInAlias         键对应的数字
     */
    function checkKeyCodes(eventKeyCode,
                           key,
                           builtInAlias) {
        // 键对应的编码
        var keyCodes = config.keyCodes[key] || builtInAlias;
        if(Array.isArray(keyCodes)) {
            return keyCodes.indexOf(eventKeyCode) === -1
        } else {
            return keyCodes !== eventKeyCode
        }
    }

    /*  */

    /**
     * Runtime helper for merging v-bind="object" into a VNode's data.
     * 在标签上会出现v-bind指令绑定一个对象的情况，将绑定对象的属性一一添加到data数据项的attrs或者domProps中
     * 其实，就是用来给构造虚拟dom节点时需要的data数据项添加attrs或者domProps添加数据项
     * @param   data       构建虚拟dom节点时需要的data数据项
     * @param   tag        标签名称
     * @param   value      v-bind指令绑定的对象
     * @param   asProp     是否作为prop属性
     * @param   isSync
     */
    function bindObjectProps(data,
                             tag,
                             value,
                             asProp,
                             isSync) {
        if(value) {
            // 首先判断value是不是一个对象， v-bind=“obj”， obj必须是一个对象
            if(!isObject(value)) {
                "development" !== 'production' && warn(
                    'v-bind without argument expects an Object or Array value',
                    this
                );
            } else {
                // 如果value是一个数组，将数组转化为对象形式
                if(Array.isArray(value)) {
                    value = toObject(value);
                }
                var hash;
                var loop = function(key) {
                    if(
                        key === 'class' ||
                        key === 'style' ||
                        isReservedAttribute(key)
                    ) {
                        hash = data;
                    } else {
                        var type = data.attrs && data.attrs.type;
                        hash = asProp || config.mustUseProp(tag, type, key)
                            ? data.domProps || (data.domProps = {})
                            : data.attrs || (data.attrs = {});
                    }
                    if(!(key in hash)) {
                        hash[key] = value[key];

                        if(isSync) {
                            var on = data.on || (data.on = {});
                            on[("update:" + key)] = function($event) {
                                value[key] = $event;
                            };
                        }
                    }
                };

                for(var key in value) loop(key);
            }
        }
        return data
    }
    /*  */

    /**
     * Runtime helper for rendering static trees.
     * 渲染静态节点
     * 如果静态节点是已经渲染且不在v-for指令中，则不需要重新渲染，直接克隆；
     * 否则渲染新的节点
     * @param index    当前节点的静态渲染方法在静态渲染方法数组中的下标
     * @param isInFor  要渲染的节点是否在v-for指令中
     *
     */
    function renderStatic(index,
                          isInFor) {
        // 根据index，在_staticTrees中查找已经生成的静态虚拟dom节点
        var tree = this._staticTrees[index];
        // if has already-rendered static tree and not inside v-for,
        // we can reuse the same tree by doing a shallow clone.
        // 如果存在已经生成的静态dom节点，则克隆已经生成的静态虚拟dom节点
        if(tree && !isInFor) {
            return Array.isArray(tree)
                ? cloneVNodes(tree)
                : cloneVNode(tree)
        }
        // otherwise, render a fresh tree.
        // 调用静态渲染方法，生成静态虚拟dom节点
        tree = this._staticTrees[index] =
            this.$options.staticRenderFns[index].call(this._renderProxy);
        // 将虚拟dom节点标注为静态的，且虚拟dom节点的key值为_static_i
        markStatic(tree, ("__static__" + index), false);
        return tree
    }

    /**
     * Runtime helper for v-once.
     * Effectively it means marking the node as static with a unique key.
     * 标注虚拟dom节点为静态的， 且虚拟dom节点的key值为_once_i + _ + 原来的key
     */
    function markOnce(tree,
                      index,
                      key) {
        markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
        return tree
    }

    /**
     * 标注虚拟dom节点是静态的
     * @param tree     虚拟dom节点
     * @param key      虚拟dom节点的key值，识别虚拟dom节点
     * @param isOnce
     */
    function markStatic(tree,
                        key,
                        isOnce) {
        if(Array.isArray(tree)) {
            // 如果需要标注的虚拟dom节点有多个，循环遍历虚拟dom节点，标注虚拟dom节点是否是静态的
            for(var i = 0; i < tree.length; i++) {
                if(tree[i] && typeof tree[i] !== 'string') {
                    markStaticNode(tree[i], (key + "_" + i), isOnce);
                }
            }
        } else {
            markStaticNode(tree, key, isOnce);
        }
    }

    /**
     * 将虚拟dom节点标注为静态的
     * @param node     虚拟dom节点
     * @param key      虚拟dom节点的key值，用于表示虚拟dom节点
     * @param isOnce
     */
    function markStaticNode(node, key, isOnce) {
        node.isStatic = true;
        node.key = key;
        node.isOnce = isOnce;
    }

    /*  */

    function bindObjectListeners(data, value) {
        if(value) {
            if(!isPlainObject(value)) {
                "development" !== 'production' && warn(
                    'v-on without argument expects an Object value',
                    this
                );
            } else {
                var on = data.on = data.on ? extend({}, data.on) : {};
                for(var key in value) {
                    var existing = on[key];
                    var ours = value[key];
                    on[key] = existing ? [].concat(ours, existing) : ours;
                }
            }
        }
        return data
    }

    /*  */
    /**
     * 给Vue实例对象添加渲染函数
     * @param vm   当前Vue实例对象
     */
    function initRender(vm) {
        vm._vnode = null; // the root of the child tree
        vm._staticTrees = null;
        // 子定义组件标签对应的虚拟dom节点，一般是作为占位节点使用的，当做获取组件标签上的数据的入口
        var parentVnode = vm.$vnode = vm.$options._parentVnode; // the placeholder node in parent tree
        // 渲染上下文环境，为创建虚拟dom节点的上下文，即为Vue实例对象
        var renderContext = parentVnode && parentVnode.context;
        // 从组件中要分发的内容中找到要安放到组件模板插槽中的内容和对应的插槽
        vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
        //
        vm.$scopedSlots = emptyObject;
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, false);
        };
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function(a, b, c, d) {
            return createElement(vm, a, b, c, d, true);
        };

        // $attrs & $listeners are exposed for easier HOC creation.
        // they need to be reactive so that HOCs using them are always updated
        // 虚拟dom节点的data属性
        var parentData = parentVnode && parentVnode.data;
        /* istanbul ignore else */
        {
            // 给Vue实例添加响应式属性 $attrs
            defineReactive$$1(vm, '$attrs', parentData && parentData.attrs, function() {
                !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
            }, true);
            // 给Vue实例添加响应式属性 $listeners
            defineReactive$$1(vm, '$listeners', parentData && parentData.on, function() {
                !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
            }, true);
        }
    }
    // 给Vue实例添加与渲染相关的方法
    // $nextTick、_render、markonce(_o)、toNumber(_n)、toString(_s)、renderList(_l)
    // renderSlot(_t)、looseEqual(_q)等方法
    // createTextVNode(_v):创建一个文本Vnode节点
    function renderMixin(Vue) {
        Vue.prototype.$nextTick = function(fn) {
            return nextTick(fn, this)
        };
        /**
         * Vue实例的渲染方法，生成虚拟dom节点
         * @return {*}
         * @private
         */
        Vue.prototype._render = function() {
            // this->当前Vue实例
            var vm = this;
            // Vue实例对象的配置项
            var ref = vm.$options;
            // 编译生成(或者组件自带)的渲染方法
            var render = ref.render;
            // 编译生成的静态渲染方法组合
            var staticRenderFns = ref.staticRenderFns;
            // 父虚拟dom节点。组件对应的自定义标签，本身会对应一个虚拟dom节点
            var _parentVnode = ref._parentVnode;

            if(vm._isMounted) {
                // clone slot nodes on re-renders
                for(var key in vm.$slots) {
                    vm.$slots[key] = cloneVNodes(vm.$slots[key]);
                }
            }

            vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

            if(staticRenderFns && !vm._staticTrees) {
                vm._staticTrees = [];
            }
            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            // $vode对应的是组件自定义标签的虚拟dom节点，使得渲染函数有了一个访问自定义标签上的数据的入口
            vm.$vnode = _parentVnode;
            // render self
            var vnode;
            try {
                // 调用渲染方法，生成虚拟dom节点
                // render方法的内部逻辑为 with(this){return _c(******)}, this->Vue实例对象的渲染代理，调用_c方法的时候，由于已经创建了
                // Vue实例的代理对象，对Vue实例的操作，都会被拦截。执行this._c操作的时候，首先会检查this Vue实例中是否有_c方法
                // 这样就会触发Vue实例代理对象的has拦截操作
                vnode = render.call(vm._renderProxy, vm.$createElement);
            } catch(e) {
                handleError(e, vm, "render function");
                // return error render result,
                // or previous vnode to prevent render error causing blank component
                /* istanbul ignore else */
                {
                    vnode = vm.$options.renderError
                        ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
                        : vm._vnode;
                }
            }
            // return empty vnode in case the render function errored out
            if(!(vnode instanceof VNode)) {
                if("development" !== 'production' && Array.isArray(vnode)) {
                    warn(
                        'Multiple root nodes returned from render function. Render function ' +
                        'should return a single root node.',
                        vm
                    );
                }
                vnode = createEmptyVNode();
            }
            // set parent
            vnode.parent = _parentVnode;
            // 返回生成的虚拟dom节点
            return vnode
        };
        // internal render helpers.
        // these are exposed on the instance prototype to reduce generated render
        // code size.
        Vue.prototype._o = markOnce;
        // toNumber, parseFloat
        Vue.prototype._n = toNumber;
        // toString, Object.prototype.toString
        Vue.prototype._s = toString;
        // v-for指令对应的渲染方法，循环执行createElement方法
        Vue.prototype._l = renderList;
        Vue.prototype._t = renderSlot;
        Vue.prototype._q = looseEqual;
        Vue.prototype._i = looseIndexOf;
        // 渲染静态节点？？
        Vue.prototype._m = renderStatic;
        Vue.prototype._f = resolveFilter;
        // 判断触发事件的键是否合法的
        Vue.prototype._k = checkKeyCodes;
        // 用来构造生成虚拟dom节点需要的数据项的attrs属性或者domProps属性
        Vue.prototype._b = bindObjectProps;
        // 创建一个文本虚拟dom节点
        Vue.prototype._v = createTextVNode;
        // 创建一个空的虚拟dom节点
        Vue.prototype._e = createEmptyVNode;
        Vue.prototype._u = resolveScopedSlots;
        Vue.prototype._g = bindObjectListeners;
    }

    /*  */

    var uid$1 = 0;

    /**
     * 给Vue构造函数的原型添加_init方法， 用于Vue实例对象的初始化
     * @param Vue    Vue构造函数
     */
    function initMixin(Vue) {
        /**
         * Vue实例对象、组件实例对象的初始化方法，创建Vue实例对象、组件实例对象的时候都会调用这个方法
         * @param options   Vue实例对象创建的时候用到的配置项
         * @private
         */
        Vue.prototype._init = function(options) {
            // vm，根实例对象或者是组件实例对象
            var vm = this;
            // Vue实例的uid
            vm._uid = uid$1++;

            var startTag, endTag;
            /* istanbul ignore if */
            if("development" !== 'production' && config.performance && mark) {
                startTag = "vue-perf-init:" + (vm._uid);
                endTag = "vue-perf-end:" + (vm._uid);
                mark(startTag);
            }

            // a flag to avoid this being observed
            // 标志位。当调用observe方法给对象绑定observer时， 如果对象是Vue对象实例，不需要绑定observer对象
            vm._isVue = true;
            // merge options
            if(options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                // vm->组件实例对象， 初始化组件实例对象的配置项
                initInternalComponent(vm, options);
            } else {
                // 合并Vue构造函数的配置项和构造Vue实例时用户传入配置项，
                // 构造Vue实例对象的配置项$options
                // 一般情况下，用户会传入components，directives，filters等配置项，将这项配置项和Vue构造函数的
                // components， direvtives， filters等配置项合并
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }
            /* istanbul ignore else */
            {
                // 初始化Vue实例的渲染代理
                // 创建Proxy实例对象，用以拦截对Vue实例的操作
                initProxy(vm);
            }
            // expose real self
            vm._self = vm;
            // 如果当前新建的Vue实例对象存在父Vue实例对象， 建立Vue实例对象和父Vue实例对象之间的关联关系，并给Vue对象添加生命周期属性
            initLifecycle(vm);
            // 给实例绑定自定义事件
            initEvents(vm);
            // 给Vue实例添加渲染方法
            initRender(vm);
            // 执行beforeCreate钩子回调函数（如果用户在使用new Vue构建Vue实例的时候， 传入了beforeCreate对应的操作， 则此时执行对应操作）
            callHook(vm, 'beforeCreate');
            initInjections(vm); // resolve injections before data/props
            // 初始化props属性、数据属性、方法属性、计算属性、监听属性
            initState(vm);
            initProvide(vm); // resolve provide after data/props
            // 执行created钩子回调函数
            callHook(vm, 'created');

            /* istanbul ignore if */
            if("development" !== 'production' && config.performance && mark) {
                vm._name = formatComponentName(vm, false);
                mark(endTag);
                measure(((vm._name) + " init"), startTag, endTag);
            }
            // 检查配置项中是否存在el属性，即vue应用挂载的位置
            // 如果是创建组件实例对象，一般el属性是不配置的
            if(vm.$options.el) {
                // 挂载vue应用的根vue实例
                vm.$mount(vm.$options.el);
            }
        };
    }

    /**
     * 初始化组件实例的配置项
     * @param vm         组件实例对象
     * @param options    构建组件实例时传入的配置项， 相当于用户配置项
     */
    function initInternalComponent(vm, options) {
        // 初始化组件实例对象的配置项，组件实例兑现的配置项继承自组件构造函数的option配置项
        var opts = vm.$options = Object.create(vm.constructor.options);
        // doing this because it's faster than dynamic enumeration.
        // 给Vue组件实例对象的配置项options添加属性
        // 父实例对象， 一般情况下 组件实例的parent为Vue实例对象
        opts.parent = options.parent;
        //
        opts.propsData = options.propsData;
        // 组件对应的虚拟dom节点
        opts._parentVnode = options._parentVnode;
        // 需要在组件实例上绑定的自定义事件
        opts._parentListeners = options._parentListeners;
        // 组件上需要分发的内容对应的虚拟dom节点
        opts._renderChildren = options._renderChildren;
        // 组件对应的标签名称
        opts._componentTag = options._componentTag;
        // 组件的父真实dom节点
        opts._parentElm = options._parentElm;
        opts._refElm = options._refElm;
        if(options.render) {
            opts.render = options.render;
            opts.staticRenderFns = options.staticRenderFns;
        }
    }

    /**
     * 返回构造函数的配置项
     * @param Ctor   构造函数，like Vue
     * @return {*}
     */
    function resolveConstructorOptions(Ctor) {
        // 构造函数的配置项options
        var options = Ctor.options;
        // 如果有父类构造函数
        if(Ctor.super) {
            // 父类构造函数的配置项options
            var superOptions = resolveConstructorOptions(Ctor.super);
            // 子类构造函数缓存的父类构造函数的配置项options
            var cachedSuperOptions = Ctor.superOptions;
            // 如果两个父类的配置项不相同
            if(superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                // 用父类构造函数的配置项覆盖子类缓存的父类构造函数的配置项
                Ctor.superOptions = superOptions;
                // check if there are any late-modified/attached options (#4976)
                var modifiedOptions = resolveModifiedOptions(Ctor);
                // update base extend options
                if(modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions);
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
                if(options.name) {
                    options.components[options.name] = Ctor;
                }
            }
        }
        // 返回构造函数的配置项
        return options
    }

    /**
     * 返回修改后的配置项
     * @param Ctor
     * @return {*}
     */
    function resolveModifiedOptions(Ctor) {
        var modified;
        // 构造函数最新的配置项
        var latest = Ctor.options;
        // 构造函数基础配置项
        var extended = Ctor.extendOptions;
        // 构造函数生成时，自己的配置项
        var sealed = Ctor.sealedOptions;
        for(var key in latest) {
            if(latest[key] !== sealed[key]) {
                if(!modified) {
                    modified = {};
                }
                modified[key] = dedupe(latest[key], extended[key], sealed[key]);
            }
        }
        return modified
    }

    /**
     *
     * @param latest       构造函数最新的配置项
     * @param extended     构造函数基础配置项
     * @param sealed       构造函数生成时的自身的配置项
     * @return {*}
     */
    function dedupe(latest, extended, sealed) {
        // compare latest and sealed to ensure lifecycle hooks won't be duplicated
        // between merges
        if(Array.isArray(latest)) {
            var res = [];
            sealed = Array.isArray(sealed) ? sealed : [sealed];
            extended = Array.isArray(extended) ? extended : [extended];
            for(var i = 0; i < latest.length; i++) {
                // push original options and not sealed options to exclude duplicated options
                if(extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i]);
                }
            }
            return res
        } else {
            return latest
        }
    }

    /**
     * Vue实例构造函数， 用于构建Vue实例对象
     * @param options    用户传入的配置项，属性包括el, data, methods, components, watch, computed等
     * @constructor
     */
    function Vue$3(options) {
        if("development" !== 'production' &&
            !(this instanceof Vue$3)
        ) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        // this->vue实例, 执行Vue实例对象的初始化工作
        this._init(options);
    }
    // 给Vue实例添加_init方法
    initMixin(Vue$3);
    // 给Vue实例添加$set, $delete, $watch方法
    stateMixin(Vue$3);
    // 给Vue实例添加$on, $once, $off, $emit方法
    eventsMixin(Vue$3);
    // 给Vue实例添加_update, $forceUpdate, $destory方法
    lifecycleMixin(Vue$3);
    // 给Vue实例添加 $nextTick, _render, _o(markOnce), _n(toNumber), _s(toString), _l(renderList),
    // _t(renderSlot), _q(looseEqual), _i(looseIndexOf), _m(renderStatic), _f(resolveFilter),
    // _k(checkCodes), _b(bindObjectProps), _v(createTextVNode)
    // _e(createEmptyVNode), _u(resolveScopedSlots),_g(bindObjectListeners) 方法
    renderMixin(Vue$3);

    /*  */
    /**
     * 给Vue添加全局方法 use
     * @param Vue   Vue构造函数
     */
    function initUse(Vue) {
        // 安装Vue.js插件。如果插件是一个对象，必须提供install 方法。
        // 如果插件是一个函数，它会被作为install方法。
        // install方法将别作为Vue的参数调用
        Vue.use = function(plugin) {
            var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
            if(installedPlugins.indexOf(plugin) > -1) {
                return this
            }

            // additional parameters
            var args = toArray(arguments, 1);
            args.unshift(this);
            if(typeof plugin.install === 'function') {
                plugin.install.apply(plugin, args);
            } else if(typeof plugin === 'function') {
                plugin.apply(null, args);
            }
            installedPlugins.push(plugin);
            return this
        };
    }

    /*  */
    /**
     * 给Vue添加mixin混合方法
     * @param Vue   Vue构造函数
     */
    function initMixin$1(Vue) {
        /**
         * 全局注册一个混合，影响注册之后所有创建的每个 Vue 实例。
         * @param mixin    混合对象
         * @return {Vue}
         */
        Vue.mixin = function(mixin) {
            // 将混合对象中的属性分别根据对应的合并策略，添加到Vue基础构造函数的配置项options中
            this.options = mergeOptions(this.options, mixin);
            return this
        };
    }

    /*  */
    /**
     * 给Vue添加extend方法
     * @param Vue   Vue构造函数
     */
    function initExtend(Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        // 这个属性有啥用
        Vue.cid = 0;
        var cid = 1;

        /**
         * Class inheritance
         * 使用基础 Vue 构造函数，创建一个“子类”。参数是一个包含组件选项的对象
         * @param extendOptions   注册全局组件时用到的definition，子类的配置项
         */
        Vue.extend = function(extendOptions) {
            extendOptions = extendOptions || {};
            // this->Vue构造函数，继承的类
            var Super = this;
            //
            var SuperId = Super.cid;
            // 构造函数缓存
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});

            if(cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }

            var name = extendOptions.name || Super.options.name;
            {
                if(!/^[a-zA-Z][\w-]*$/.test(name)) {
                    warn(
                        'Invalid component name: "' + name + '". Component names ' +
                        'can only contain alphanumeric characters and the hyphen, ' +
                        'and must start with a letter.'
                    );
                }
            }
            // 子类，用于创建组件？？
            var Sub = function VueComponent(options) {
                this._init(options);
            };
            // 子类的prototype继承自Vue的prototype， 相当于Sub实例可以使用Vue实例的方法
            Sub.prototype = Object.create(Super.prototype);
            // 子类的构造函数
            Sub.prototype.constructor = Sub;
            Sub.cid = cid++;
            // 子类的配置项，合并父类和 extendOptions的配置项
            Sub.options = mergeOptions(
                // Vue构造函数的配置项
                Super.options,
                // 组件注册时的配置项
                extendOptions
            );
            // 子类和父类关联
            Sub['super'] = Super;

            // For props and computed properties, we define the proxy getters on
            // the Vue instances at extension time, on the extended prototype. This
            // avoids Object.defineProperty calls for each instance created.
            // 给子类构造函数的原型对象添加代理属性
            // 用户注册组件的时候，需要定义props来接收父组件的数据；
            // keep-live组件本身定义了include, exclude两个prop属性， 用于接收父组件include，exclude的数据
            if(Sub.options.props) {
                initProps$1(Sub);
            }
            // 初始化子类的计算属性
            if(Sub.options.computed) {
                initComputed$1(Sub);
            }

            // allow further extension/mixin/plugin usage
            // 子类添加extend方法
            Sub.extend = Super.extend;
            // 子类添加mixin方法
            Sub.mixin = Super.mixin;
            // 子类添加use方法
            Sub.use = Super.use;

            // create asset registers, so extended classes
            // can have their private assets too.
            // 子类添加component、filter、directive方法
            ASSET_TYPES.forEach(function(type) {
                Sub[type] = Super[type];
            });
            // enable recursive self-lookup
            if(name) {
                Sub.options.components[name] = Sub;
            }

            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options;
            Sub.extendOptions = extendOptions;
            Sub.sealedOptions = extend({}, Sub.options);

            // cache constructor
            cachedCtors[SuperId] = Sub;
            return Sub
        };
    }

    /**
     * 给组件构造函数的原型添加代理prop属性。这样使用构造函数构造组件实例的时候，组件实例也会有代理的prop属性
     * @param Comp    子构造函数， 一般为组件构造函数
     */
    function initProps$1(Comp) {
        // 组件构造函数的props配置项
        var props = Comp.options.props;
        for(var key in props) {
            // 给组件构造函数添加prop属性， 这个prop属性会代理？？
            // 给组件构造函数的原型对象添加key属性。key属性实际上只能被组件实例来访问
            // 组件实例访问key属性的时候，同时也是访问组件实例_props中的key属性
            proxy(Comp.prototype, "_props", key);
        }
    }

    function initComputed$1(Comp) {
        var computed = Comp.options.computed;
        for(var key in computed) {
            defineComputed(Comp.prototype, key, computed[key]);
        }
    }

    /*  */
    /**
     * 给Vue添加components、filters、directives方法
     * @param Vue   Vue构造函数
     */
    function initAssetRegisters(Vue) {
        /**
         * Create asset registration methods.
         * 遍历ASSET_TYPES, 分别给Vue构造函数添加component、directive、filter方法
         * component: 用于注册或获取全局组件;
         * directive: 用于注册或获取全局指令；
         * filter: 用于注册或获取全局过滤器
         */
        ASSET_TYPES.forEach(function(type) {
            /**
             * 给Vue构造函数添加用于注册全局组件、全局指令、全局过滤器
             * @param id           全局(组件、指令、过滤器)的名称
             * @param definition   全局(组件、指令、过滤器)的定义对象,构造 Vue 实例时传入的各种选项大多数都可以在组件里使用
             *                     注意：传入的data选项必须是函数，否则会报错
             * @return {*}
             */
            Vue[type] = function(id,
                                 definition) {
                // 调用Vue.component(), Vue.directive(), Vue.filter()的时候，如果没有传入参数definition，
                // 相当于读取名称为id的组件(获取指令、过滤器)
                if(!definition) {
                    return this.options[type + 's'][id]
                } else {
                    /* istanbul ignore if */
                    {
                        // 不能使用built-in或者保留的标签名称作为组件的id
                        if(type === 'component' && config.isReservedTag(id)) {
                            warn(
                                'Do not use built-in or reserved HTML elements as component ' +
                                'id: ' + id
                            );
                        }
                    }
                    // 注册全局组件的时候，传入的definition是一个对象，而不是数组、函数
                    if(type === 'component' && isPlainObject(definition)) {
                        definition.name = definition.name || id;
                        // this.options._base-> Vue
                        // 继承Vue构造函数，生成一个子类构造函数，可用于创建组件(实际上任然是一个Vue实例)
                        definition = this.options._base.extend(definition);
                    }
                    // 注册全局指令，如果传入的definition是一个函数，默认这个函数是bind和update的钩子函数
                    if(type === 'directive' && typeof definition === 'function') {
                        definition = {bind : definition, update : definition};
                    }
                    // 将全局组件、全局指令、全局过滤器添加到Vue构造函数的对应配置项中
                    this.options[type + 's'][id] = definition;
                    return definition
                }
            };
        });
    }

    /*  */

    var patternTypes = [String, RegExp, Array];

    /**
     * 获取组件的实际名称
     * @param opts    虚拟dom节点的组件配置项
     * @return {*}
     */
    function getComponentName(opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    /**
     * 判断name是否满足条件
     * @param pattern   匹配模式
     * @param name     需要匹配的name
     * @return {boolean}
     */
    function matches(pattern, name) {
        if(Array.isArray(pattern)) {
            return pattern.indexOf(name) > -1
        } else if(typeof pattern === 'string') {
            return pattern.split(',').indexOf(name) > -1
        } else if(isRegExp(pattern)) {
            return pattern.test(name)
        }
        /* istanbul ignore next */
        return false
    }

    function pruneCache(cache, current, filter) {
        for(var key in cache) {
            var cachedNode = cache[key];
            if(cachedNode) {
                var name = getComponentName(cachedNode.componentOptions);
                if(name && !filter(name)) {
                    if(cachedNode !== current) {
                        pruneCacheEntry(cachedNode);
                    }
                    cache[key] = null;
                }
            }
        }
    }

    function pruneCacheEntry(vnode) {
        if(vnode) {
            vnode.componentInstance.$destroy();
        }
    }
    // keep-alive组件
    // <keep-alive> 包裹动态组件时，会缓存不活动的组件实例，而不是销毁它们。
    // <keep-alive> 是一个抽象组件：它自身不会渲染一个 DOM 元素，也不会出现在父组件链中。
    // 当组件在 <keep-alive> 内被切换，它的 activated 和 deactivated 这两个生命周期钩子函数将会被对应执行。
    var KeepAlive = {
        // keep-alive组件
        name : 'keep-alive',
        // keep-alive组件是一个抽象的组件
        abstract : true,
        // 允许组件有条件的缓存, 用于接收父组件上的include， exclude属性的值
        props : {
            // 字符串或者正则表达式。只有匹配的组件会被缓存
            include : patternTypes,
            // 字符串或者正则表达式。任何匹配的组件都不会缓存
            exclude : patternTypes
        },
        /**
         * keep-live组件对应的组件实例的created钩子函数
         * 创建缓存， 用于缓存需要保留的虚拟dom节点，把这个缓存对象添加到keep-alive组件实例对象上
         * 满足include的组件，将会被保存起来
         */
        created : function created() {
            this.cache = Object.create(null);
        },
        /**
         * keep-live组件对应的组件实例的destory钩子函数，
         */
        destroyed : function destroyed() {
            var this$1 = this;

            for(var key in this$1.cache) {
                pruneCacheEntry(this$1.cache[key]);
            }
        },
        // 用于监听include、exclude属性
        watch : {
            include : function include(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return matches(val, name);
                });
            },
            exclude : function exclude(val) {
                pruneCache(this.cache, this._vnode, function(name) {
                    return !matches(val, name);
                });
            }
        },
        /**
         * 渲染方法， 用于生成虚拟dom节点。该方法实际返回的是keep-live组件中要分发的内容对应的虚拟dom节点
         * 一般组件的渲染方法，返回的是组件的template渲染生成的虚拟dom节点
         * 如果虚拟dom节点对应的标签包含在include中，那么这个虚拟dom节点会一直存在(缓存在keep-alive组件实例对象的cache中)；否则这个虚拟dom节点会被销毁掉
         * @return {*}
         */
        render : function render() {
            // this->kepp-live组件对应的组件实例
            // vnode为keep-alive组件中的第一个组件虚拟dom节点(这是为什么呢？)
            var vnode = getFirstComponentChild(this.$slots.default);
            // 获取组件虚拟dom节点的组件配置项
            var componentOptions = vnode && vnode.componentOptions;
            if(componentOptions) {
                // check pattern 组件的名称
                var name = getComponentName(componentOptions);
                if(name && (
                        (this.include && !matches(this.include, name)) ||
                        (this.exclude && matches(this.exclude, name))
                    )) {
                    // 如果组件名没有在include中， 或者在exclude中， 表明该组件根据if或者is条件切换的时候，不被保留
                    return vnode
                }
                // 设置虚拟dom节点的key值
                var key = vnode.key == null
                    // same constructor may get registered as different local components
                    // so cid alone is not enough (#3269)
                    ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                    : vnode.key;
                if(this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance;
                } else {
                    this.cache[key] = vnode;
                }
                // 表明当前虚拟dom节点是需要一直存在的，切换的时候也不会被销毁
                vnode.data.keepAlive = true;
            }
            // 返回keep-live组件渲染生成虚拟dom节(keep-live组件内要分发的内容)
            return vnode
        }
    };
    // built-in组件？？
    var builtInComponents = {
        KeepAlive : KeepAlive
    };

    /*  */
    /**
     * 给Vue构造函数添加全局API
     * @param Vue   Vue构造函数
     */
    function initGlobalAPI(Vue) {
        // config
        var configDef = {};
        configDef.get = function() {
            return config;
        };
        {
            configDef.set = function() {
                warn(
                    'Do not replace the Vue.config object, set individual fields instead.'
                );
            };
        }
        Object.defineProperty(Vue, 'config', configDef);

        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn : warn,
            extend : extend,
            mergeOptions : mergeOptions,
            defineReactive : defineReactive$$1
        };
        // Vue对象添加set方法，用于设置对象的属性
        Vue.set = set;
        // Vue对象添加delete方法， 用于删除对象的属性
        Vue.delete = del;
        // Vue对象添加nextTick方法
        Vue.nextTick = nextTick;
        // 给Vue构造函数添加配置项
        Vue.options = Object.create(null);
        // 给Vue添加components、directives、filters类型的配置项， 默认为空
        ASSET_TYPES.forEach(function(type) {
            Vue.options[type + 's'] = Object.create(null);
        });

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue;
        // 给Vue构造函数的components配置项添加keepAlive组件
        extend(Vue.options.components, builtInComponents);
        // 给Vue添加全局方法use
        initUse(Vue);
        // 给Vue添加全局方法mixin
        initMixin$1(Vue);
        // 给Vue添加全局方法extend
        initExtend(Vue);
        // 给Vue添加全局方法components、directives、filters
        initAssetRegisters(Vue);
    }
    // 给Vue构造函数添加全局API
    initGlobalAPI(Vue$3);

    Object.defineProperty(Vue$3.prototype, '$isServer', {
        get : isServerRendering
    });

    Object.defineProperty(Vue$3.prototype, '$ssrContext', {
        get : function get() {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    });
    // Vue的安装版本号
    Vue$3.version = '2.4.0';

    /*  */

    // these are reserved for web because they are directly compiled away
    // during template compilation
    var isReservedAttr = makeMap('style,class');

    // attributes that should be using props for binding
    var acceptValue = makeMap('input,textarea,option,select');
    var mustUseProp = function(tag, type, attr) {
        return (
            (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
            (attr === 'selected' && tag === 'option') ||
            (attr === 'checked' && tag === 'input') ||
            (attr === 'muted' && tag === 'video')
        )
    };
    // 是否是枚举属性
    var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');
    // 是否布尔值属性
    var isBooleanAttr = makeMap(
        'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
        'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
        'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
        'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
        'required,reversed,scoped,seamless,selected,sortable,translate,' +
        'truespeed,typemustmatch,visible'
    );

    var xlinkNS = 'http://www.w3.org/1999/xlink';

    var isXlink = function(name) {
        return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
    };

    var getXlinkProp = function(name) {
        return isXlink(name) ? name.slice(6, name.length) : ''
    };
    // 判断是否val为错误属性？
    var isFalsyAttrValue = function(val) {
        return val == null || val === false
    };

    /*  */
    /**
     * 返回虚拟dom节点的class属性值， like classA classB classC...
     * @param vnode
     */
    function genClassForVnode(vnode) {
        var data = vnode.data;
        var parentNode = vnode;
        var childNode = vnode;
        // 如果当前虚拟dom节点有子节点， 需要子dom节点继承当前dom节点的class
        while(isDef(childNode.componentInstance)) {
            childNode = childNode.componentInstance._vnode;
            if(childNode.data) {
                data = mergeClassData(childNode.data, data);
            }
        }
        // 如果当前虚拟dom节点有父节点，需要对当前dom节点继承父dom节点的class
        while(isDef(parentNode = parentNode.parent)) {
            if(parentNode.data) {
                data = mergeClassData(data, parentNode.data);
            }
        }
        // 表明静态class和动态绑定class可以同时存在
        return renderClass(data.staticClass, data.class)
    }

    /**
     * 合并子虚拟dom节点和父虚拟dom节点的class、staticClass属性
     * @param child
     * @param parent
     * @return {{staticClass, class: [null,null]}}
     */
    function mergeClassData(child, parent) {
        return {
            staticClass : concat(child.staticClass, parent.staticClass),
            class : isDef(child.class)
                ? [child.class, parent.class]
                : parent.class
        }
    }

    /**
     * 根据虚拟dom节点staticClass，class对象， 生成 classA classB classC样式的字符串
     * @param staticClass    虚拟dom节点的静态class
     * @param dynamicClass   虚拟dom节点动态绑定的class
     * @return {string}
     */
    function renderClass(staticClass,
                         dynamicClass) {
        if(isDef(staticClass) || isDef(dynamicClass)) {
            return concat(staticClass, stringifyClass(dynamicClass))
        }
        /* istanbul ignore next */
        return ''
    }

    /**
     * 用空格链接a，b
     * @param a
     * @param b
     * @return {*}
     */
    function concat(a, b) {
        return a ? b ? (a + ' ' + b) : a : (b || '')
    }

    /**
     * 将虚拟dom节点的class属性对象转化为字符串形式(classA classB classC 格式)
     * @param value
     * @return {*}
     */
    function stringifyClass(value) {
        // 如果是数组
        if(Array.isArray(value)) {
            return stringifyArray(value)
        }
        if(isObject(value)) {
            return stringifyObject(value)
        }
        if(typeof value === 'string') {
            return value
        }
        /* istanbul ignore next */
        return ''
    }

    /**
     * 将数组转化为字符串
     * @param value
     * @return {string}
     */
    function stringifyArray(value) {
        var res = '';
        var stringified;
        for(var i = 0, l = value.length; i < l; i++) {
            if(isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                if(res) {
                    res += ' ';
                }
                res += stringified;
            }
        }
        return res
    }

    /**
     * 将对象的属性转化为字符串形式
     *  like 将{a:"****", b : "***", c : "***"} 转化为 a b c
     * @param value
     * @return {string}
     */
    function stringifyObject(value) {
        var res = '';
        for(var key in value) {
            if(value[key]) {
                if(res) {
                    res += ' ';
                }
                res += key;
            }
        }
        return res
    }

    /*  */

    var namespaceMap = {
        svg : 'http://www.w3.org/2000/svg',
        math : 'http://www.w3.org/1998/Math/MathML'
    };
    // isHTMLTag是一个函数， 用来判断一个标签是不是HTML标签
    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
    );

    // this map is intentionally selective, only covering SVG elements that may
    // contain child elements.
    // isSVG是一个函数，用来判断一个标签是不是SVG标签
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
        'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );
    /**
     * 判断标签是否是pre标签
     * @param tag    标签名称
     * @returns {boolean}
     */
    var isPreTag = function(tag) {
        return tag === 'pre';
    };
    /**
     * 判断一个标签是不是保留的标签
     * 如果标签是HTML标签或者是SVG标签， 则这个标签是保留的标签
     * @param tag      标签名称
     * @returns {*}
     */
    var isReservedTag = function(tag) {
        return isHTMLTag(tag) || isSVG(tag)
    };

    /**
     * 获取标签的命名空间
     * @param tag   标签名称
     * @returns {*}
     */
    function getTagNamespace(tag) {
        // 如果一个标签是SVG类型的标签， 返回命名空间“svg”
        if(isSVG(tag)) {
            return 'svg'
        }
        // basic support for MathML
        // note it doesn't support other MathML elements being component roots
        // 如果标签的名字是math， 返回命名空间“math”
        if(tag === 'math') {
            return 'math'
        }
    }

    var unknownElementCache = Object.create(null);

    function isUnknownElement(tag) {
        /* istanbul ignore if */
        if(!inBrowser) {
            return true
        }
        if(isReservedTag(tag)) {
            return false
        }
        tag = tag.toLowerCase();
        /* istanbul ignore if */
        if(unknownElementCache[tag] != null) {
            return unknownElementCache[tag]
        }
        var el = document.createElement(tag);
        if(tag.indexOf('-') > -1) {
            // http://stackoverflow.com/a/28210364/1070244
            return (unknownElementCache[tag] = (
                el.constructor === window.HTMLUnknownElement ||
                el.constructor === window.HTMLElement
            ))
        } else {
            return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
        }
    }

    /*  */

    /**
     * Query an element selector if it's not an element already.
     * 调用原生的document.querySelector寻找满足选择器条件的dom元素
     */
    function query(el) {
        if(typeof el === 'string') {
            var selected = document.querySelector(el);
            if(!selected) {
                "development" !== 'production' && warn(
                    'Cannot find element: ' + el
                );
                return document.createElement('div')
            }
            return selected
        } else {
            return el
        }
    }

    /*  */
    // 根据虚拟节点创建真实节点
    function createElement$1(tagName, vnode) {
        var elm = document.createElement(tagName);
        if(tagName !== 'select') {
            return elm
        }
        // false or null will remove the attribute but undefined will not
        if(vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
            elm.setAttribute('multiple', 'multiple');
        }
        return elm
    }
    // 创建dom节点命名空间
    function createElementNS(namespace, tagName) {
        return document.createElementNS(namespaceMap[namespace], tagName)
    }
    // 创建真实文本节点
    function createTextNode(text) {
        return document.createTextNode(text)
    }
    // 创建真实注释节点
    function createComment(text) {
        return document.createComment(text)
    }
    // 在referenceNode节点之前插入newNode
    function insertBefore(parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }
    // 移除node节点的子元素
    function removeChild(node, child) {
        node.removeChild(child);
    }
    // 给node节点添加子节点
    function appendChild(node, child) {
        node.appendChild(child);
    }
    // 返回node节点的父节点
    function parentNode(node) {
        return node.parentNode
    }
    // 返回node节点的兄弟节点
    function nextSibling(node) {
        return node.nextSibling
    }
    // 返回node节点的标签名称
    function tagName(node) {
        return node.tagName
    }
    // 设置节点的文本内容
    function setTextContent(node, text) {
        node.textContent = text;
    }
    // 设置节点的属性
    function setAttribute(node, key, val) {
        node.setAttribute(key, val);
    }
    // 节点操作方法
    var nodeOps = Object.freeze({
        // 创建真实dom节点
        createElement : createElement$1,
        // 创建节点的命名空间
        createElementNS : createElementNS,
        // 创建真实文本节点
        createTextNode : createTextNode,
        // 创建真实文本节点
        createComment : createComment,
        // 在节点之前插入节点
        insertBefore : insertBefore,
        // 移除子节点
        removeChild : removeChild,
        // 添加子节点
        appendChild : appendChild,
        // 返回父节点
        parentNode : parentNode,
        // 返回兄弟节点
        nextSibling : nextSibling,
        // 返回节点的标签名称
        tagName : tagName,
        // 设置节点的文本内容
        setTextContent : setTextContent,
        // 设置节点的属性
        setAttribute : setAttribute
    });

    /*  */
    // ref钩子。dom节点在create、update、destory是进行的操作
    var ref = {
        create : function create(_, vnode) {
            registerRef(vnode);
        },
        update : function update(oldVnode, vnode) {
            if(oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true);
                registerRef(vnode);
            }
        },
        destroy : function destroy(vnode) {
            registerRef(vnode, true);
        }
    };

    function registerRef(vnode, isRemoval) {
        var key = vnode.data.ref;
        if(!key) {
            return
        }

        var vm = vnode.context;
        var ref = vnode.componentInstance || vnode.elm;
        var refs = vm.$refs;
        if(isRemoval) {
            if(Array.isArray(refs[key])) {
                remove(refs[key], ref);
            } else if(refs[key] === ref) {
                refs[key] = undefined;
            }
        } else {
            if(vnode.data.refInFor) {
                if(!Array.isArray(refs[key])) {
                    refs[key] = [ref];
                } else if(refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref);
                }
            } else {
                refs[key] = ref;
            }
        }
    }

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/paldepind/snabbdom/blob/master/LICENSE
     *
     * modified by Evan You (@yyx990803)
     *

     /*
     * Not type-checking this because this file is perf-critical and the cost
     * of making flow understand it is not worth it.
     */

    var emptyNode = new VNode('', {}, []);
    // patch提供了5个生命周期钩子，分别是：
    // create:  创建patch时；
    // activate: 激活组件时；
    // update： 更新节点时（节点是什么， 虚拟dom节点还是真实dom节点）
    // remove： 移除节点时
    // destory：销毁节点时
    var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

    /**
     * 判断两个虚拟dom节点是否相同
     * @param a           旧的的虚拟dom节点
     * @param b           新的虚拟dom节点
     *  当两个VNode的tag、key、isComment都相同，并且同时定义或未定义data的时候，且如果标签为input则type必须相同。
     *  这时候这两个VNode则算sameVnode，可以直接进行patchVnode操作
     *  或者。。。
     * @return {boolean}
     */
                function sameVnode(a, b) {
                    return (
                        a.key === b.key && (
                            (
                                // 标签相等
                                a.tag === b.tag &&
                                // 都不是注释节点或者都是注释节点
                                a.isComment === b.isComment &&
                                // data属性要么为空要么不为空
                                isDef(a.data) === isDef(b.data) &&
                                // 相同的input类型
                                sameInputType(a, b)
                            ) || (
                                isTrue(a.isAsyncPlaceholder) &&
                                a.asyncFactory === b.asyncFactory &&
                                isUndef(b.asyncFactory.error)
                            )
                        )
                    )
                }

    // Some browsers do not support dynamically changing type for <input>
    // so they need to be treated as different nodes
    /**
     * 判断两个input是否是相同的， 如果两个input的type是相同的，那就是相同的
     * @param a        input a 对应的虚拟dom节点
     * @param b        input b 对应的虚拟dom节点
     * @return {boolean}
     */
    function sameInputType(a, b) {
        if(a.tag !== 'input') {
            return true
        }
        var i;
        // input a 的type类型(text, checkbox, radio等)
        var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
        // input b 的type类型
        var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
        return typeA === typeB
    }

    /**
     * 遍历虚拟dom节点数组，建立一个map，保存虚拟dom节点key值和虚拟节点数组下标index的对应关系
     * @param children  旧的虚拟dom节点数组
     * @param beginIdx  遍历开始的位置
     * @param endIdx    遍历结束的位置
     * @return {{}}
     */
    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var i, key;
        var map = {};
        for(i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key;
            if(isDef(key)) {
                map[key] = i;
            }
        }
        return map
    }
    // 创建patch函数？？
    function createPatchFunction(backend) {
        var i, j;
        var cbs = {};

        var modules = backend.modules;
        var nodeOps = backend.nodeOps;
        // hooks， patch生命周期钩子
        // var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
        // hooks代表了patch过程中dom节点的各个阶段：创建、激活、更新、移除、销毁
        // cbs中包含了各个阶段中，应该对dom节点进行的操作
        // create：updateAttrs， updateClass，updateDOMListeners，updateDOMProps，updateStyle，_enter（？？）
        // active：_enter（？？）
        // update：updateAttrs，updateClass，updateDOMListeners，updateDOMProps，updateStyle
        // remove： remove
        // destory：
        for(i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = [];
            for(j = 0; j < modules.length; ++j) {
                if(isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]]);
                }
            }
        }

        /**
         * 根据真实dom节点， 创建一个空的虚拟dom节点
         * @param elm   真实dom节点
         * @returns {VNode}
         */
        function emptyNodeAt(elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb(childElm, listeners) {
            function remove$$1() {
                if(--remove$$1.listeners === 0) {
                    removeNode(childElm);
                }
            }

            remove$$1.listeners = listeners;
            return remove$$1
        }

        /**
         * 从el的父dom节点中，移除el元素
         * @param el  需要移除的el元素
         */
        function removeNode(el) {
            // 获取el元素的父节点
            var parent = nodeOps.parentNode(el);
            // element may have already been removed due to v-html / v-text
            // 如果父节点不为空，移除el元素
            if(isDef(parent)) {
                nodeOps.removeChild(parent, el);
            }
        }

        var inPre = 0;

        /**
         * 创建虚拟dom节点对应的真实dom节点
         * @param vnode                 虚拟dom节点
         * @param insertedVnodeQueue    记录子节点创建顺序的队列。每创建一个DOM元素， 就会往这个队列中插入当前的VNode。
         *                                  当整个VNode对象全部转化为真实的DOM树是，会一次调用这个队列中的VNode hook的insert方法
         * @param parentElm             创建的真实dom节点的父节点
         * @param refElm
         * @param nested
         */
        function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested; // for transition enter check
            // 通过判断虚拟dom节点data数据项中的hook钩子集合中，是否有init钩子函数。如果有的话，就表明此时创建的是组件
            if(createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }
            // 虚拟节点的数据
            var data = vnode.data;
            // 虚拟节点的子节点(如果是组件型虚拟dom节点, 则children为空)
            var children = vnode.children;
            // 虚拟dom节点的对应的标签
            var tag = vnode.tag;
            // 如果标签不为空
            if(isDef(tag)) {
                {
                    if(data && data.pre) {
                        inPre++;
                    }
                    if(
                        !inPre &&
                        !vnode.ns &&
                        !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
                        config.isUnknownElement(tag)
                    ) {
                        warn(
                            'Unknown custom element: <' + tag + '> - did you ' +
                            'register the component correctly? For recursive components, ' +
                            'make sure to provide the "name" option.',
                            vnode.context
                        );
                    }
                }
                // 创建虚拟节点对应的真实dom节点
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode);
                setScope(vnode);

                /* istanbul ignore if */
                {
                    // 创建子虚拟dom节点对应的真实dom节点
                    createChildren(vnode, children, insertedVnodeQueue);
                    // 真实节点创建之后，要执行create钩子对应的函数，更新真实节点的属性、绑定事件等
                    if(isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                    }
                    // 将创建的真实dom节点添加到父真实dom节点中
                    insert(parentElm, vnode.elm, refElm);
                }

                if("development" !== 'production' && data && data.pre) {
                    inPre--;
                }
            } else if(isTrue(vnode.isComment)) {
                vnode.elm = nodeOps.createComment(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            }
        }

        /**
         * 根据组件型虚拟dom节点创建组件实例和对应的真实dom节点
         * （和另一个createComponet方法不一样，另一个createComponent方法是用来创建组件对应的虚拟dom节点的）
         * @param vnode                组件型虚拟dom节点
         * @param insertedVnodeQueue
         * @param parentElm            父真实dom节点
         * @param refElm               相关真实dom节点
         * @return {boolean}
         */
        function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            // 虚拟dom节点的数据项
            var i = vnode.data;
            if(isDef(i)) {
                // 如果组件虚拟dom节点的实例已经创建且组件位于keep-alive组件内部， 那么当前组件是响应式的？
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                if(isDef(i = i.hook) && isDef(i = i.init)) {
                    // 执行组件的init钩子, 创建组件型虚拟dom节点对应的组件实例
                    i(vnode, false /* hydrating */, parentElm, refElm);
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if(isDef(vnode.componentInstance)) {
                    // 初始化组件虚拟dom节点对应的真实dom节点，并执行dom节点对应的created钩子函数
                    initComponent(vnode, insertedVnodeQueue);
                    if(isTrue(isReactivated)) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                    }
                    return true
                }
            }
        }

        /**
         * 初始化组件虚拟dom节点对应的真实dom节点，并执行组件虚拟dom节点的create钩子函数
         * @param vnode               组件型虚拟dom节点
         * @param insertedVnodeQueue
         */
        function initComponent(vnode, insertedVnodeQueue) {
            if(isDef(vnode.data.pendingInsert)) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
                vnode.data.pendingInsert = null;
            }
            // 初始化组件虚拟dom节点对应的真实dom节点(即组件template生成的dom元素)
            vnode.elm = vnode.componentInstance.$el;
            if(isPatchable(vnode)) {
                // 如果组件是可打补丁的，需要执行虚拟dom节点的create钩子函数
                // 组件对应的dom节点创建并且mounted之后，需要把组件占位节点上绑定的原生事件、属性、样式啥的全部添加到组件对应的dom节点上
                invokeCreateHooks(vnode, insertedVnodeQueue);
                setScope(vnode);
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode);
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode);
            }
        }

        function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i;
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode;
            while(innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode;
                if(isDef(i = innerNode.data) && isDef(i = i.transition)) {
                    for(i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode);
                    }
                    insertedVnodeQueue.push(innerNode);
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm);
        }

        /**
         * 将dom元素elm添加到父dom元素parent中
         * 如果ref$$1不为空， 把elm添加到ref$$1 前面；
         * 如果ref$$1为空，   把elm添加到parent的末尾
         * @param parent     父dom元素
         * @param elm        需要添加的dom元素
         * @param ref$$1     把元素添加到ref$$之前
         */
        function insert(parent, elm, ref$$1) {
            if(isDef(parent)) {
                if(isDef(ref$$1)) {
                    if(ref$$1.parentNode === parent) {
                        nodeOps.insertBefore(parent, elm, ref$$1);
                    }
                } else {
                    nodeOps.appendChild(parent, elm);
                }
            }
        }
        /**
         * 遍历父虚拟dom节点的children， 递归调用createElm方法，创建子虚拟dom节点对应的真实dom节点
         * @param vnode                父虚拟dom节点
         * @param children             子虚拟dom节点集合
         * @param insertedVnodeQueue   记录子节点创建顺序的队列
         */
        function createChildren(vnode, children, insertedVnodeQueue) {
            if(Array.isArray(children)) {
                for(var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
                }
            } else if(isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
            }
        }

        /**
         * 判断虚拟dom节点是不是可以用来patch(打补丁)
         * 如果虚拟dom节点对应的标签不存在， 则不可以用来打补丁
         * @param vnode
         */
        function isPatchable(vnode) {
            while(vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode;
            }
            return isDef(vnode.tag)
        }

        /**
         * patch过程中，dom节点经历create、active、update、destory、remove节点
         * 当dom节点创建之后，需要执行create钩子
         * 执行 updateAttrs、updateClass、updateDOMListeners、updateDOMProps、updateStyle、
         *      updateDirectives、enter、create
         * @param vnode
         * @param insertedVnodeQueue
         */
        function invokeCreateHooks(vnode, insertedVnodeQueue) {
            for(var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode);
            }
            // 虚拟dom节点的钩子函数对象
            i = vnode.data.hook; // Reuse variable
            if(isDef(i)) {
                // 如果存在create钩子函数
                if(isDef(i.create)) {
                    i.create(emptyNode, vnode);
                }
                // 如果存在insert钩子函数
                if(isDef(i.insert)) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope(vnode) {
            var i;
            var ancestor = vnode;
            while(ancestor) {
                if(isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                    nodeOps.setAttribute(vnode.elm, i, '');
                }
                ancestor = ancestor.parent;
            }
            // for slot content they should also get the scopeId from the host instance.
            if(isDef(i = activeInstance) &&
                i !== vnode.context &&
                isDef(i = i.$options._scopeId)
            ) {
                nodeOps.setAttribute(vnode.elm, i, '');
            }
        }

        /**
         * 遍历虚拟dom节点，把虚拟dom节点对应的真实dom节点添加到refElm真实dom节点之前
         * @param parentElm   父真实dom节点
         * @param refElm      相关真实dom节点， 用于定位
         * @param vnodes      虚拟dom节点数组
         * @param startIdx    遍历开始位置
         * @param endIdx      遍历结束位置
         * @param insertedVnodeQueue
         */
        function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for(; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
            }
        }

        /**
         * 调用destory钩子
         * patch过程中，虚拟dom节点会经历5个阶段，create、active、update、destory、remove
         * 当dom节点被销毁（前or后），要执行销毁的钩子回调函数
         * @param vnode
         */
        function invokeDestroyHook(vnode) {
            var i, j;
            var data = vnode.data;
            if(isDef(data)) {
                if(isDef(i = data.hook) && isDef(i = i.destroy)) {
                    i(vnode);
                }
                for(i = 0; i < cbs.destroy.length; ++i) {
                    cbs.destroy[i](vnode);
                }
            }
            if(isDef(i = vnode.children)) {
                for(j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j]);
                }
            }
        }

        /**
         * 遍历子虚拟dom节点数组， 从父dom节点中移除虚拟dom节点对应的真实dom节点
         * @param parentElm  父真实dom元素
         * @param vnodes     子虚拟dom节点数组
         * @param startIdx   遍历开始位置
         * @param endIdx     遍历结束位置
         */
        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for(; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if(isDef(ch)) {
                    if(isDef(ch.tag)) {
                        // 移除，并且执行移除hook钩子
                        removeAndInvokeRemoveHook(ch);
                        // 执行destoryhook钩子
                        invokeDestroyHook(ch);
                    } else { // Text node
                        // 移除dom节点
                        removeNode(ch.elm);
                    }
                }
            }
        }

        /**
         * 移除，并且执行移除hook钩子函数
         * @param vnode 虚拟dom节点
         * @param rm
         */
        function removeAndInvokeRemoveHook(vnode, rm) {
            if(isDef(rm) || isDef(vnode.data)) {
                var i;
                var listeners = cbs.remove.length + 1;
                if(isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners;
                } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners);
                }
                // recursively invoke hooks on child component root node
                if(isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                    removeAndInvokeRemoveHook(i, rm);
                }
                for(i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm);
                }
                if(isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                    i(vnode, rm);
                } else {
                    rm();
                }
            } else {
                removeNode(vnode.elm);
            }
        }

        /**
         * 更新子虚拟dom节点
         * @param parentElm    子虚拟dom节点的父真实dom节点
         * @param oldCh        旧的子虚拟dom节点
         * @param newCh        新的子虚拟dom节点
         * @param insertedVnodeQueue
         * @param removeOnly
         */
        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            // 旧的子虚拟dom节点的起始位置
            var oldStartIdx = 0;
            // 新的子虚拟dom节点的起始位置
            var newStartIdx = 0;
            // 旧的子虚拟dom节点的结束位置
            var oldEndIdx = oldCh.length - 1;
            // 旧的第一个子虚拟dom节点
            var oldStartVnode = oldCh[0];
            // 旧的最后一个子虚拟dom节点
            var oldEndVnode = oldCh[oldEndIdx];
            // 新的子虚拟节点的结束位置
            var newEndIdx = newCh.length - 1;
            // 新的第一个子虚拟dom节点
            var newStartVnode = newCh[0];
            // 新的最后一个子虚拟dom节点
            var newEndVnode = newCh[newEndIdx];
            // 一个map对象，缓存虚拟dom节点的key值和数组下标index的对应关系
            var oldKeyToIdx,
                // 新的虚拟dom节点在旧的虚拟dom节点数组中的位置
                idxInOld,
                // 需要移动的旧的虚拟dom节点
                elmToMove,
                // 相关真实dom节点， 用于定位dom节点
                refElm;

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly;
            // 从开始位置遍历新旧子虚拟dom节点。遍历的时候，如果oldStartIdx > oldEndIdx 或者 newStartIdx > newEndIdx, 停止遍历
            while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if(isUndef(oldStartVnode)) {
                    // 如果老的开始虚拟dom节点是空的，老的虚拟节点向后遍历（表示已经被移走了？？）
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                } else if(isUndef(oldEndVnode)) {
                    // 如果老的结束虚拟dom节点是空的，老的虚拟dom节点想前遍历（表示已经被移走了？？）
                    oldEndVnode = oldCh[--oldEndIdx];
                } else if(sameVnode(oldStartVnode, newStartVnode)) {
                    // 如果新老开始虚拟dom节点是same的，即对应的真实dom节点没有进行移动操作
                    // （起始位置的真实dom节点没有移动）
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    // 继续向后遍历
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else if(sameVnode(oldEndVnode, newEndVnode)) {
                    // 如果新老结束虚拟dom节点是same的，即真实dom节点没有移动，直接更新
                    // （起始位置的真实dom节点发生移动，结束位置的真实dom节点没有移动）
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    // 继续向前遍历
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if(sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                    // 如果老的开始虚拟dom节点和新的结束虚拟dom节点是same的，即真实dom节点有移动， 需要将对应的真实dom节点向右移动
                    // （起始、结束位置的dom节点都发生了移动， 起始dom节点移动到了结束位置）
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    // 移动oldStartVnode对应的真实dom节点，移动到oldEndVnode对应的真实节点的后面
                    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                    // 老的虚拟dom节点向后遍历
                    oldStartVnode = oldCh[++oldStartIdx];
                    // 新的虚拟dom节点向前遍历
                    newEndVnode = newCh[--newEndIdx];
                } else if(sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    // 如果老的结束虚拟dom节点和新的开始虚拟dom节点是same的，即真实dom节点有移动，需要将对应的真实dom节点向左移动
                    //（起始、结束位置的dom节点都发生了移动，起始dom节点移动到了其他位置，结束dom节点移动到了开始位置）
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    // 将oldEndVnode对应的真实dom节点移动到oldStartVnode对应的真实dom节点之前
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    // 旧的虚拟dom节点向后遍历
                    oldEndVnode = oldCh[--oldEndIdx];
                    // 新的虚拟dom节点向前遍历
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    // 如果新旧起始、结束虚拟dom节点都发生了移动，且移动到了其他位置
                    if(isUndef(oldKeyToIdx)) {
                        // 返回一个map，缓存旧的虚拟dom节点key值和数组index的对应关系
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    // 新的虚拟dom节点在旧的虚拟dom节点数组中的位置
                    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
                    if(isUndef(idxInOld)) { // New element
                        // 如果找不到，表示是一个新的元素。创建一个新的dom元素，并添加到oldStartVnode对应的真实dom节点之前
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                        // 新的虚拟dom节点向后遍历
                        newStartVnode = newCh[++newStartIdx];
                    } else {
                        // 需要移动的旧的虚拟dom节点
                        elmToMove = oldCh[idxInOld];
                        /* istanbul ignore if */
                        if("development" !== 'production' && !elmToMove) {
                            warn(
                                'It seems there are duplicate keys that is causing an update error. ' +
                                'Make sure each v-for item has a unique key.'
                            );
                        }
                        if(sameVnode(elmToMove, newStartVnode)) {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            canMove && nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        } else {
                            // same key but different element. treat as new element
                            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        }
                    }
                }
            }
            if(oldStartIdx > oldEndIdx) {
                // 表示新的虚拟dom节点还没有遍历完
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                // 添加新的虚拟dom节点
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else if(newStartIdx > newEndIdx) {
                // 表示旧的虚拟dom节点还没有遍历完，去掉剩余的dom节点对应的真实dom节点
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }

        /**
         * 使用打补丁的方式， 更新dom树
         * 该方法会通过比较新旧VNode节点， 根据不同的状态对DOM做合理的更新操作(添加、移动、删除等)
         * 执行这一步的前提是，两个虚拟dom节点是same的
         * 先更新父节点， 在更新子节点
         * 整个过程中还会一次调用prepatch、update、postpatch等钩子行数
         * @param oldVnode           旧的虚拟dom节点
         * @param vnode              新的虚拟dom节点
         * @param insertedVnodeQueue
         * @param removeOnly
         */
        function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            // 如果新、就虚拟dom节点完全相同，则直接返回
            if(oldVnode === vnode) {
                return
            }
            // 获取旧的虚拟dom节点对应的真实dom节点。
            // 如果新的虚拟dom节点对应的是组件，那么组件虚拟dom节点会出现还没有真实dom节点的情况
            // 此时，由于新旧虚拟dom节点是same的，因此赋值新的虚拟dom节点对应的真实dom节点
            var elm = vnode.elm = oldVnode.elm;

            if(isTrue(oldVnode.isAsyncPlaceholder)) {
                if(isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
                } else {
                    vnode.isAsyncPlaceholder = true;
                }
                return
            }

            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            /* 如果新旧VNode都是静态的，同时它们的key相同（代表同一节点），
             并且新的VNode是clone或者是标记了once（标记v-once属性，只渲染一次），
             那么只需要替换elm以及componentInstance即可。*/
            if(isTrue(vnode.isStatic) &&
                isTrue(oldVnode.isStatic) &&
                vnode.key === oldVnode.key &&
                (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
            ) {
                vnode.componentInstance = oldVnode.componentInstance;
                return
            }

            var i;

            var data = vnode.data;
            // 更新组件的时候，需要先执行prepatch钩子，将组件的子元素先更新了
            if(isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
                i(oldVnode, vnode);
            }
            // 旧的虚拟dom节点的子虚拟节点(如果子虚拟dom节点是组件型虚拟dom节点，那么是占位型虚拟dom节点)
            var oldCh = oldVnode.children;
            // 新的虚拟dom节点的子虚拟节点
            var ch = vnode.children;
            // 先更新父dom节点
            if(isDef(data) && isPatchable(vnode)) {
                // 遍历新的虚拟dom节点的update钩子函数，执行update动作
                for(i = 0; i < cbs.update.length; ++i) {
                    // updateAttrs，updateClass，updateDOMListeners，updateDOMProps，updateStyle, updateDirectives, update
                    cbs.update[i](oldVnode, vnode);
                }
                if(isDef(i = data.hook) && isDef(i = i.update)) {
                    i(oldVnode, vnode);
                }
            }
            // 如果这个VNode节点没有text文本时
            if(isUndef(vnode.text)) {
                // 新老虚拟dom节点均有children子节点，则对子节点进行diff操作，调用updateChildren
                // 这个updateChildren也是diff的核心
                if(isDef(oldCh) && isDef(ch)) {
                    if(oldCh !== ch) {
                        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
                    }
                } else if(isDef(ch)) {
                    // 如果老节点没有子节点而新节点存在子节点，先清空老节点DOM的文本内容，然后为当前DOM节点加入子节点
                    if(isDef(oldVnode.text)) {
                        nodeOps.setTextContent(elm, '');
                    }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                } else if(isDef(oldCh)) {
                    // 当新节点没有子节点而老节点有子节点的时候，则移除DOM节点的所有子节点
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                } else if(isDef(oldVnode.text)) {
                    // 当新老节点都无子节点的时候，只是文本的替换。
                    nodeOps.setTextContent(elm, '');
                }
            } else if(oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text);
            }
            if(isDef(data)) {
                if(isDef(i = data.hook) && isDef(i = i.postpatch)) {
                    i(oldVnode, vnode);
                }
            }
        }

        /**
         * 调用insert钩子
         * patch过程中，虚拟dom节点会经历5个阶段，create、active、update、remove、destory阶段
         * 当dom节点需要insert（前or后）的时候，执行insert钩子
         * @param vnode
         * @param queue
         * @param initial
         */
        function invokeInsertHook(vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if(isTrue(initial) && isDef(vnode.parent)) {
                vnode.parent.data.pendingInsert = queue;
            } else {
                for(var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i]);
                }
            }
        }

        var bailed = false;
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate(elm, vnode, insertedVnodeQueue) {
            if(isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                vnode.elm = elm;
                vnode.isAsyncPlaceholder = true;
                return true
            }
            {
                if(!assertNodeMatch(elm, vnode)) {
                    return false
                }
            }
            vnode.elm = elm;
            var tag = vnode.tag;
            var data = vnode.data;
            var children = vnode.children;
            if(isDef(data)) {
                if(isDef(i = data.hook) && isDef(i = i.init)) {
                    i(vnode, true /* hydrating */);
                }
                if(isDef(i = vnode.componentInstance)) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue);
                    return true
                }
            }
            if(isDef(tag)) {
                if(isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if(!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue);
                    } else {
                        var childrenMatch = true;
                        var childNode = elm.firstChild;
                        for(var i$1 = 0; i$1 < children.length; i$1++) {
                            if(!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
                                childrenMatch = false;
                                break
                            }
                            childNode = childNode.nextSibling;
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if(!childrenMatch || childNode) {
                            if("development" !== 'production' &&
                                typeof console !== 'undefined' &&
                                !bailed
                            ) {
                                bailed = true;
                                console.warn('Parent: ', elm);
                                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                            }
                            return false
                        }
                    }
                }
                if(isDef(data)) {
                    for(var key in data) {
                        if(!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue);
                            break
                        }
                    }
                }
            } else if(elm.data !== vnode.text) {
                elm.data = vnode.text;
            }
            return true
        }

        function assertNodeMatch(node, vnode) {
            if(isDef(vnode.tag)) {
                return (
                    vnode.tag.indexOf('vue-component') === 0 ||
                    vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
                )
            } else {
                return node.nodeType === (vnode.isComment ? 8 : 3)
            }
        }

                /**
                 * @param oldVnode     旧的虚拟dom节点
                 *                      (如果为虚拟dom节点，则此时处于更新状态； 如果是真实dom节点，则处于新建状态；
                 *                       如果什么都没有，一般对应的是㢟，连真实dom节点后还不知道)
                 * @param vnode        新的虚拟节点
                 * @param hydrating    bool类型，表示是否直接使用服务端渲染的dom元素
                 * @param removeOnly   特殊flag，用于<transition-group>组件？？
                 * @param parentElm    父节点
                 * @param refElm       新节点将插入到refElm之前？？
                 */
        return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            // 如果新的虚拟节点不存在，但是就的虚拟节点存在存在，说明意图是要销毁老节点
            if(isUndef(vnode)) {
                if(isDef(oldVnode)) {
                    invokeDestroyHook(oldVnode);
                }
                return
            }

            var isInitialPatch = false;
            // 用于记录子节点创建顺序的队列？？
            var insertedVnodeQueue = [];
            // 如果旧的虚拟dom节点不存在，但是新的虚拟dom节点存在，说明要根据虚拟dom节点创建新的节点
            // 就调用createElm(document.createElement) 创建新的dom节点
            if(isUndef(oldVnode)) {
                // empty mount (likely as component), create new root element
                // 此时对应的是组件， 没有根元素， 需要创建一个根元素
                isInitialPatch = true;
                createElm(vnode, insertedVnodeQueue, parentElm, refElm);
            } else {
                // 如果vnode和oldVnode都存在
                // 判断真实节点和虚拟节点的方法：nodeType属性。真实节点有nodeType属性， 虚拟节点没有nodeType属性
                var isRealElement = isDef(oldVnode.nodeType);
                if(!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    // 如果旧的虚拟dom节点和新的虚拟dom节点是相同的，且oldVnode不是真实dom节点
                    // 则调用patchVnode方法
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
                } else {
                    if(isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        // 如果oldVnode是真实dom节点
                        if(oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                            // SSR-ATTR:data-server-rendered
                            oldVnode.removeAttribute(SSR_ATTR);
                            hydrating = true;
                        }
                        // 判断是否是服务器渲染的dom元素
                        if(isTrue(hydrating)) {
                            // 如果oldVnode是真实节点， 且hydrating设置为true，则需要将虚拟dom和真实dom进行映射
                            // 然后将 oldVnode 设置为对应的虚拟dom，找到 oldVnode.elm 的父节点，根据vnode创建一个真实dom节点并插入到该父
                            // 节点中 oldVnode.elm 的位置
                            if(hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true);
                                return oldVnode
                            } else {
                                warn(
                                    'The client-side rendered virtual DOM tree is not matching ' +
                                    'server-rendered content. This is likely caused by incorrect ' +
                                    'HTML markup, for example nesting block-level elements inside ' +
                                    '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                    'full client-side render.'
                                );
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        // 如果不是服务器渲染或者不需要和真实的dom混合？？
                        // 创建一个空的节点，替换真实dom节点
                        // 如果oldVnode是一个真实的dom节点，根据它创建一个空的虚拟dom节点
                        // patch方法，处理的是旧的虚拟dom节点和新的虚拟节点
                        // 如果oldVnode不是虚拟节点，就需要根据oldVnode创建一个空的虚拟节点
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    // replacing existing element
                    // 旧的虚拟dom节点对应的真实dom节点
                    var oldElm = oldVnode.elm;
                    // 返回真实dom节点的父dom节点
                    var parentElm$1 = nodeOps.parentNode(oldElm);
                    // 根据新的虚拟dom节点， 创建对应的真实dom节点
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    );

                    if(isDef(vnode.parent)) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent;
                        while(ancestor) {
                            ancestor.elm = vnode.elm;
                            ancestor = ancestor.parent;
                        }
                        if(isPatchable(vnode)) {
                            for(var i = 0; i < cbs.create.length; ++i) {
                                cbs.create[i](emptyNode, vnode.parent);
                            }
                        }
                    }

                    if(isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0);
                    } else if(isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode);
                    }
                }
            }
            // 执行insert钩子函数
            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
            return vnode.elm
        }
    }

    /*  */
    // 指令钩子，dom元素在crate、update、destory阶段，需要做的关于指令的操作
    var directives = {
        create : updateDirectives,
        update : updateDirectives,
        destroy : function unbindDirectives(vnode) {
            updateDirectives(vnode, emptyNode);
        }
    };

    /**
     * 对比新旧虚拟节点的指令，更新dom元素
     * @param oldVnode   旧的虚拟dom节点
     * @param vnode      新的虚拟dom节点
     */
    function updateDirectives(oldVnode, vnode) {
        // 如果旧的虚拟节点或者新的虚拟节点有指令集合，则更新指令
        if(oldVnode.data.directives || vnode.data.directives) {
            _update(oldVnode, vnode);
        }
    }

    /**
     * 对比新旧虚拟节点的指令，更新dom元素
     * @param oldVnode   旧的虚拟dom节点
     * @param vnode      新的虚拟dom节点
     * @private
     */
    function _update(oldVnode, vnode) {
        // 如果不存在旧的虚拟节点，则表示是新建一个真实dom节点
        var isCreate = oldVnode === emptyNode;
        // 如果不存在新的虚拟节点，则表示要销毁一个真实dom节点
        var isDestroy = vnode === emptyNode;
        // 规范指令
        var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
        // 规范指令？如果指令是v-show、v-model， 给指令对象添加def属性（内有指令对应的钩子函数？？）
        var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

        var dirsWithInsert = [];
        var dirsWithPostpatch = [];

        var key, oldDir, dir;
        // 遍历新的虚拟dom节点上的指令集合
        for(key in newDirs) {
            // 旧的指令对象
            oldDir = oldDirs[key];
            // 新的指令对象
            dir = newDirs[key];
            if(!oldDir) {
                // new directive, bind
                // 如果dom节点是新建，且指令有bind钩子函数， 则执行指令的bind钩子函数
                callHook$1(dir, 'bind', vnode, oldVnode);
                // 如果指令有inserted钩子函数，将inserted钩子函数添加到dirsWithInsert数组中
                if(dir.def && dir.def.inserted) {
                    dirsWithInsert.push(dir);
                }
            } else {
                // existing directive, update
                dir.oldValue = oldDir.value;
                // 如果dom节点是更新， 则执行指令的update钩子函数
                callHook$1(dir, 'update', vnode, oldVnode);
                if(dir.def && dir.def.componentUpdated) {
                    dirsWithPostpatch.push(dir);
                }
            }
        }

        if(dirsWithInsert.length) {
            // 执行insert钩子回调函数
            var callInsert = function() {
                for(var i = 0; i < dirsWithInsert.length; i++) {
                    callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                }
            };
            // 如果v-model对应的节点是新建的
            if(isCreate) {
                mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
            } else {
                callInsert();
            }
        }

        if(dirsWithPostpatch.length) {
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function() {
                for(var i = 0; i < dirsWithPostpatch.length; i++) {
                    callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                }
            });
        }

        if(!isCreate) {
            // 如果真实dom节点不是新建，将新的虚拟dom节点上不存在的指令解除绑定
            for(key in oldDirs) {
                if(!newDirs[key]) {
                    // no longer present, unbind
                    callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                }
            }
        }
    }
    // 创建一个空的对象
    var emptyModifiers = Object.create(null);

    /**
     * 标准化指令， 如果指令有钩子函数，给指令对象添加指令对应的钩子函数
     * @param dirs        虚拟dom节点上的directives数组
     * @param vm          当前上下文环境，即Vue实例对象
     * @return {Object}
     */
    function normalizeDirectives$1(dirs,
                                   vm) {
        var res = Object.create(null);
        // 如果虚拟dom节点上没有指令， 直接返回
        if(!dirs) {
            return res
        }
        var i, dir;
        // 遍历虚拟dom节点上的指令
        for(i = 0; i < dirs.length; i++) {
            dir = dirs[i];
            if(!dir.modifiers) {
                dir.modifiers = emptyModifiers;
            }
            res[getRawDirName(dir)] = dir;
            // 返回指令对应的钩子函数
            // v-show指令对应的钩子函数有bind，update，unbind
            // v-model指令对应的钩子函数有componentUpdated， inserted
            dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
        }
        // 返回虚拟dom节点的指令对象数组
        return res
    }

    /**
     * 获取指令的合法名字（标准名称）
     * @param dir   指令对应的指令对象
     * @returns {*|string|string}
     */
    function getRawDirName(dir) {
        return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
    }

    /**
     * 执行钩子回调函数
     * 指令v-show， v-model会有钩子函数，根据指令更新dom节点的时候，需要执行指令的钩子函数
     * @param dir          指令对象
     * @param hook         钩子类型， like：bind
     * @param vnode        新的虚拟dom节点
     * @param oldVnode     旧的虚拟dom节点
     * @param isDestroy    是否销毁
     */
    function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
        // 获取对应类型的指令钩子函数
        var fn = dir.def && dir.def[hook];
        if(fn) {
            try {
                fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
            } catch(e) {
                handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
            }
        }
    }

    var baseModules = [
        ref,
        directives
    ];

    /*  */
    /**
     * 比较新旧虚拟节点的属性集合
     *     遍历新的属性集合，如果属性值和旧属性集合中的对应属性值不一样，修改dom节点的属性
     *     遍历旧的属性集合，如果属性在新的属性集合中不存在且不可枚举，则移除dom节点上的该属性
     * @param oldVnode
     * @param vnode
     */
    function updateAttrs(oldVnode, vnode) {
        // 组件占位虚拟dom节点的组件配置项
        var opts = vnode.componentOptions;
        if(isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
            return
        }
        // 如果oldVnode和vnode节点的data属性中，都没有attrs属性，则直接返回
        if(isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
            return
        }
        var key, cur, old;
        // 真实dom节点
        var elm = vnode.elm;
        // 旧的节点的属性集合
        var oldAttrs = oldVnode.data.attrs || {};
        // 新的节点的属性集合
        var attrs = vnode.data.attrs || {};
        // clone observed objects, as the user probably wants to mutate it
        // 如果属性有观察者，表明用户可能hi操作他，需要将属性克隆？？
        if(isDef(attrs.__ob__)) {
            attrs = vnode.data.attrs = extend({}, attrs);
        }
        // 遍历新的节点的属性集合
        for(key in attrs) {
            // 新的属性值
            cur = attrs[key];
            // 旧的属性值
            old = oldAttrs[key];
            // 如果新旧属性值不一样，修改元素的属性
            if(old !== cur) {
                setAttr(elm, key, cur);
            }
        }
        // #4391: in IE9, setting type can reset value for input[type=radio]
        /* istanbul ignore if */
        if(isIE9 && attrs.value !== oldAttrs.value) {
            setAttr(elm, 'value', attrs.value);
        }
        // 遍历就的属性集合中的属性， 如果新的属性集合中不存在，且是不可枚举的属性，则移除掉
        for(key in oldAttrs) {
            if(isUndef(attrs[key])) {
                if(isXlink(key)) {
                    elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                } else if(!isEnumeratedAttr(key)) {
                    elm.removeAttribute(key);
                }
            }
        }
    }

    /**
     * 设置dom元素的属性
     * @param el     真实dom节点
     * @param key    dom节点属性名
     * @param value  dom节点属性值
     */
    function setAttr(el, key, value) {
        if(isBooleanAttr(key)) {
            // set attribute for blank value
            // e.g. <option disabled>Select one</option>
            // 如果属性是boolean类型属性
            if(isFalsyAttrValue(value)) {
                // 如果value值为false或者none，移除元素上的key属性？/**/
                // 比如，disabled属性，元素只要有这个属性，属性就会生效。如果想把属性的值设置为false或者null，就把这个属性给移除掉
                el.removeAttribute(key);
            } else {
                // like，disabled="disabled"
                el.setAttribute(key, key);
            }
        } else if(isEnumeratedAttr(key)) {
            // 如果属性是可枚举的属性
            el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
        } else if(isXlink(key)) {
            // 如果是Xlink属性
            if(isFalsyAttrValue(value)) {
                el.removeAttributeNS(xlinkNS, getXlinkProp(key));
            } else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        } else {
            // 如果是普通属性，如果属性值value是false、null，则移除元素上的这个属性；否则设置属性ke的值为value
            if(isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, value);
            }
        }
    }
    // 属性钩子，dom节点在craete、update阶段， 对属性进行的进行的操作
    var attrs = {
        create : updateAttrs,
        update : updateAttrs
    };

    /*  */
    /**
     * 比较新旧虚拟dom节点上的class属性，更新对应真实dom节点的class属性
     * @param oldVnode
     * @param vnode
     */
    function updateClass(oldVnode, vnode) {
        var el = vnode.elm;
        var data = vnode.data;
        var oldData = oldVnode.data;
        // 如果新旧虚拟dom节点上都没有staticClass， class属性， 直接返回
        if(
            isUndef(data.staticClass) &&
            isUndef(data.class) && (
                isUndef(oldData) || (
                    isUndef(oldData.staticClass) &&
                    isUndef(oldData.class)
                )
            )
        ) {
            return
        }
        // 生成dom元素的class， like classA classB classC...
        var cls = genClassForVnode(vnode);

        // handle transition classes
        var transitionClass = el._transitionClasses;
        if(isDef(transitionClass)) {
            cls = concat(cls, stringifyClass(transitionClass));
        }

        // set the class
        // 设置dom元素的class
        if(cls !== el._prevClass) {
            el.setAttribute('class', cls);
            el._prevClass = cls;
        }
    }
    // class钩子，dom节点在create、update阶段，对class进行的操作
    var klass = {
        create : updateClass,
        update : updateClass
    };

    /*  */

    var validDivisionCharRE = /[\w).+\-_$\]]/;

    /**
     * 解析文本插值中的过滤器
     * @param exp
     * @return {*}
     */
    function parseFilters(exp) {
        var inSingle = false;
        var inDouble = false;
        var inTemplateString = false;
        var inRegex = false;
        var curly = 0;
        var square = 0;
        var paren = 0;
        var lastFilterIndex = 0;
        var c, prev, i, expression, filters;

        for(i = 0; i < exp.length; i++) {
            prev = c;
            // 字符串中字符编码
            c = exp.charCodeAt(i);
            if(inSingle) {
                if(c === 0x27 && prev !== 0x5C) {
                    inSingle = false;
                }
            } else if(inDouble) {
                if(c === 0x22 && prev !== 0x5C) {
                    inDouble = false;
                }
            } else if(inTemplateString) {
                if(c === 0x60 && prev !== 0x5C) {
                    inTemplateString = false;
                }
            } else if(inRegex) {
                if(c === 0x2f && prev !== 0x5C) {
                    inRegex = false;
                }
            } else if(
                c === 0x7C && // pipe
                exp.charCodeAt(i + 1) !== 0x7C &&
                exp.charCodeAt(i - 1) !== 0x7C &&
                !curly && !square && !paren
            ) {
                if(expression === undefined) {
                    // first filter, end of expression
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim();
                } else {
                    pushFilter();
                }
            } else {
                switch(c) {
                    case 0x22:
                        inDouble = true;
                        break         // "
                    case 0x27:
                        inSingle = true;
                        break         // '
                    case 0x60:
                        inTemplateString = true;
                        break // `
                    case 0x28:
                        paren++;
                        break                 // (
                    case 0x29:
                        paren--;
                        break                 // )
                    case 0x5B:
                        square++;
                        break                // [
                    case 0x5D:
                        square--;
                        break                // ]
                    case 0x7B:
                        curly++;
                        break                 // {
                    case 0x7D:
                        curly--;
                        break                 // }
                }
                if(c === 0x2f) { // /
                    var j = i - 1;
                    var p = (void 0);
                    // find first non-whitespace prev char
                    for(; j >= 0; j--) {
                        p = exp.charAt(j);
                        if(p !== ' ') {
                            break
                        }
                    }
                    if(!p || !validDivisionCharRE.test(p)) {
                        inRegex = true;
                    }
                }
            }
        }

        if(expression === undefined) {
            expression = exp.slice(0, i).trim();
        } else if(lastFilterIndex !== 0) {
            pushFilter();
        }

        function pushFilter() {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1;
        }

        if(filters) {
            for(i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i]);
            }
        }

        return expression
    }

    function wrapFilter(exp, filter) {
        var i = filter.indexOf('(');
        if(i < 0) {
            // _f: resolveFilter， resolveFilter方法的别名
            return ("_f(\"" + filter + "\")(" + exp + ")")
        } else {
            var name = filter.slice(0, i);
            var args = filter.slice(i + 1);
            // _f, resolveFilter方法的别名
            return ("_f(\"" + name + "\")(" + exp + "," + args)
        }
    }

    /*  */

    function baseWarn(msg) {
        console.error(("[Vue compiler]: " + msg));
    }

    function pluckModuleFunction(modules,
                                 key) {
        return modules
            ? modules.map(function(m) {
                return m[key];
            }).filter(function(_) {
                return _;
            })
            : []
    }

    /**
     * 将prop属性转化为prop对象，添加到AST树节点对象的props数组中
     * @param el      AST树节点对象
     * @param name    prop属性名
     * @param value   prop属性值
     */
    function addProp(el, name, value) {
        (el.props || (el.props = [])).push({name : name, value : value});
    }

    /**
     * 将attr属性转化为attr对象， 添加到AST树节点对象的attrs数组中
     * @param el        AST树节点对象
     * @param name      attr属性名
     * @param value     attr属性值
     */
    function addAttr(el, name, value) {
        (el.attrs || (el.attrs = [])).push({name : name, value : value});
    }

    /**
     * 将指令属性转化为指令对象，并添加到标签对应的AST树节点对象的directives数组中
     * @param el            标签对应的解析对象
     * @param name          指令名称的缩写，like text(v-text), model(v-model), html(v-html), show(v-show), cloak(v-cloak)
     * @param rawName       指令的标准名称，v-text, v-model, v-html, v-show, v-cloak
     * @param value         标签是指令属性对应的属性值
     * @param arg
     * @param modifiers
     */
    function addDirective(el,
                          name,
                          rawName,
                          value,
                          arg,
                          modifiers) {
        // 如果AST树节点对象没有directives属性， 则添加directives属性
        (el.directives || (el.directives = [])).push({
            name : name,
            rawName : rawName,
            value : value,
            arg : arg,
            modifiers : modifiers
        });
    }

    /**
     * 给v-on指令所在的元素添加事件的处理方式
     * 将name类型的处理对象添加到AST树节点对象的events对象中
     * 一种类型的事件，对应一个hndler对象？？
     * @param el          AST树节点对象
     * @param name        事件的类型click，mouseout等，或者是自定义事件类型
     * @param value       v-on:click="****"中的****
     * @param modifiers   事件的绑定修饰符，比如left、stop、prevent、once、self、native等
     * @param important
     * @param warn
     */
    function addHandler(el,
                        name,
                        value,
                        modifiers,
                        important,
                        warn) {
        // warn prevent and passive modifier
        /* istanbul ignore if */
        if(
            "development" !== 'production' && warn &&
            modifiers && modifiers.prevent && modifiers.passive
        ) {
            warn(
                'passive and prevent can\'t be used together. ' +
                'Passive handler can\'t prevent default event.'
            );
        }
        // check capture modifier ，使用事件捕获模式？？
        // 添加事件处理hander是，使用capture模式
        if(modifiers && modifiers.capture) {
            delete modifiers.capture;
            name = '!' + name; // mark the event as captured
        }
        // 只触发一次回调函数
        if(modifiers && modifiers.once) {
            delete modifiers.once;
            // 标注name类型的事件只触发一次
            name = '~' + name; // mark the event as once
        }
        /* istanbul ignore if */
        // 以{passive:true}模式添加handler 滑动事件？？
        if(modifiers && modifiers.passive) {
            delete modifiers.passive;
            name = '&' + name; // mark the event as passive
        }
        var events;
        // 监听组件根元素的原生事件
        // (比如如果给自定义组件标签绑定click事件，如果不使用native标识符，则会把click事件绑定到组件实例上，而不会绑定到dom元素上)
        if(modifiers && modifiers.native) {
            delete modifiers.native;
            events = el.nativeEvents || (el.nativeEvents = {});
        } else {
            events = el.events || (el.events = {});
        }
        var newHandler = {value : value, modifiers : modifiers};
        var handlers = events[name];
        /* istanbul ignore if */
        if(Array.isArray(handlers)) {
            important ? handlers.unshift(newHandler) : handlers.push(newHandler);
        } else if(handlers) {
            events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
        } else {
            events[name] = newHandler;
        }
    }

    /**
     * 判断标签上是否有被绑定的属性name
     * @param el      标签对应的AST树节点
     * @param name    属性名
     * @param getStatic
     * @return {*}
     */
    function getBindingAttr(el,
                            name,
                            getStatic) {
        // 动态Value， v-bind的属性的值为动态value
        var dynamicValue =
            getAndRemoveAttr(el, ':' + name) ||
            getAndRemoveAttr(el, 'v-bind:' + name);
        if(dynamicValue != null) {
            return parseFilters(dynamicValue)
        } else if(getStatic !== false) {
            // 静态value
            var staticValue = getAndRemoveAttr(el, name);
            if(staticValue != null) {
                return JSON.stringify(staticValue)
            }
        }
    }

    /**
     * 从el的属性attrsMap中获取属性名为name的属性值，并将该属性值从el的attrsList中移除
     * 判断标签上是否有属性name。
     * 如果有的话，从标签对应的对象el的attrsList中移除并返回属性name
     * @param el       标签对应的解析对象el
     * @param name     属性名
     * @returns {*}
     */
    function getAndRemoveAttr(el, name) {
        var val;
        if((val = el.attrsMap[name]) != null) {
            var list = el.attrsList;
            for(var i = 0, l = list.length; i < l; i++) {
                if(list[i].name === name) {
                    list.splice(i, 1);
                    break
                }
            }
        }
        return val
    }

    /*  */

    /**
     * Cross-platform code generation for component v-model
     */
    function genComponentModel(el,
                               value,
                               modifiers) {
        var ref = modifiers || {};
        var number = ref.number;
        var trim = ref.trim;

        var baseValueExpression = '$$v';
        var valueExpression = baseValueExpression;
        if(trim) {
            valueExpression =
                "(typeof " + baseValueExpression + " === 'string'" +
                "? " + baseValueExpression + ".trim()" +
                ": " + baseValueExpression + ")";
        }
        if(number) {
            // _n, toNumber方法的别名
            valueExpression = "_n(" + valueExpression + ")";
        }
        var assignment = genAssignmentCode(value, valueExpression);

        el.model = {
            value : ("(" + value + ")"),
            expression : ("\"" + value + "\""),
            callback : ("function (" + baseValueExpression + ") {" + assignment + "}")
        };
    }

    /**
     * Cross-platform codegen helper for generating v-model value assignment code.
     */
    function genAssignmentCode(value,
                               assignment) {
        var modelRs = parseModel(value);
        if(modelRs.idx === null) {
            return (value + "=" + assignment)
        } else {
            return ("$set(" + (modelRs.exp) + ", " + (modelRs.idx) + ", " + assignment + ")")
        }
    }

    /**
     * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
     *
     * for loop possible cases:
     *
     * - test
     * - test[idx]
     * - test[test1[idx]]
     * - test["a"][idx]
     * - xxx.test[a[a].test1[idx]]
     * - test.xxx.a["asa"][test1[idx]]
     *
     */

    var len;
    var str;
    var chr;
    var index$1;
    var expressionPos;
    var expressionEndPos;

    function parseModel(val) {
        str = val;
        len = str.length;
        index$1 = expressionPos = expressionEndPos = 0;

        if(val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
            return {
                exp : val,
                idx : null
            }
        }

        while(!eof()) {
            chr = next();
            /* istanbul ignore if */
            if(isStringStart(chr)) {
                parseString(chr);
            } else if(chr === 0x5B) {
                parseBracket(chr);
            }
        }

        return {
            exp : val.substring(0, expressionPos),
            idx : val.substring(expressionPos + 1, expressionEndPos)
        }
    }

    function next() {
        return str.charCodeAt(++index$1)
    }

    function eof() {
        return index$1 >= len
    }

    function isStringStart(chr) {
        return chr === 0x22 || chr === 0x27
    }

    function parseBracket(chr) {
        var inBracket = 1;
        expressionPos = index$1;
        while(!eof()) {
            chr = next();
            if(isStringStart(chr)) {
                parseString(chr);
                continue
            }
            if(chr === 0x5B) {
                inBracket++;
            }
            if(chr === 0x5D) {
                inBracket--;
            }
            if(inBracket === 0) {
                expressionEndPos = index$1;
                break
            }
        }
    }

    function parseString(chr) {
        var stringQuote = chr;
        while(!eof()) {
            chr = next();
            if(chr === stringQuote) {
                break
            }
        }
    }

    /*  */

    var warn$1;

    // in some cases, the event used has to be determined at runtime
    // so we used some reserved tokens during compile.
    var RANGE_TOKEN = '__r';
    var CHECKBOX_RADIO_TOKEN = '__c';

    /**
     * v-model指令属性的处理方法，执行生成v-mode指令对应的代码
     * @param el      v-model指令所在的标签对应的AST树节点对象
     * @param dir     v-model对应的指令对象
     * @param _warn
     * @return {boolean}
     */
    function model(el,
                   dir,
                   _warn) {
        warn$1 = _warn;
        // v-model指令绑定的属性
        var value = dir.value;
        // v-model指令的修饰符？
        var modifiers = dir.modifiers;
        // v-model指令所在元素的标签
        var tag = el.tag;
        var type = el.attrsMap.type;

        {
            // Vue不支持动态修改input的type类型
            var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
            if(tag === 'input' && dynamicType) {
                warn$1(
                    "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
                    "v-model does not support dynamic input types. Use v-if branches instead."
                );
            }
            // inputs with type="file" are read only and setting the input's
            // value will throw an error.
            if(tag === 'input' && type === 'file') {
                warn$1(
                    "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
                    "File inputs are read only. Use a v-on:change listener instead."
                );
            }
        }

        if(el.component) {
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else if(tag === 'select') {
            // 如果v-model指令绑定的标签是select
            genSelect(el, value, modifiers);
        } else if(tag === 'input' && type === 'checkbox') {
            // 如果v-model指令绑定的标签是checkbox类型的input
            genCheckboxModel(el, value, modifiers);
        } else if(tag === 'input' && type === 'radio') {
            // 如果v-model指令绑定的标签是radio类型的input
            genRadioModel(el, value, modifiers);
        } else if(tag === 'input' || tag === 'textarea') {
            // 如果v-model指令绑定的标签是textarea、text类型的标签
            genDefaultModel(el, value, modifiers);
        } else if(!config.isReservedTag(tag)) {
            // 如果标签名称不是保留标签，一般为自定义标签
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else {
            warn$1(
                "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                "v-model is not supported on this element type. " +
                'If you are working with contenteditable, it\'s recommended to ' +
                'wrap a library dedicated for that purpose inside a custom component.'
            );
        }

        // ensure runtime directive metadata
        return true
    }

    /**
     * 如果v-model指令绑定的是checkbox类型的input标签，生成对应的代码
     * @param el         input对应的AST树节点
     * @param value      v-model指令绑定的属性
     * @param modifiers  指令修饰符
     */
    function genCheckboxModel(el,
                              value,
                              modifiers) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
        var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
        addProp(el, 'checked',
            "Array.isArray(" + value + ")" +
            //_i, looseIndexOf方法的别名
            "?_i(" + value + "," + valueBinding + ")>-1" + (
                trueValueBinding === 'true'
                    ? (":(" + value + ")")
                    // _q, looseEqual方法的别名
                    : (":_q(" + value + "," + trueValueBinding + ")")
            )
        );
        addHandler(el, CHECKBOX_RADIO_TOKEN,
            "var $$a=" + value + "," +
            '$$el=$event.target,' +
            "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
            'if(Array.isArray($$a)){' +
            // _n, toNumber方法的别名
            "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            // _i, looseIndexOf方法的别名
            '$$i=_i($$a,$$v);' +
            "if($$c){$$i<0&&(" + value + "=$$a.concat($$v))}" +
            "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
            "}else{" + (genAssignmentCode(value, '$$c')) + "}",
            null, true
        );
    }
    /**
     * 如果v-model指令绑定的是radio类型的input标签，生成对应的代码
     * @param el         input对应的AST树节点
     * @param value      v-model指令绑定的属性
     * @param modifiers  指令修饰符
     */
    function genRadioModel(el,
                           value,
                           modifiers) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        // _n, toNumber方法的别名
        valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
        // _q, looseEqual方法的别名
        addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
        addHandler(el, CHECKBOX_RADIO_TOKEN, genAssignmentCode(value, valueBinding), null, true);
    }
    /**
     * 如果v-model指令绑定的是select标签，生成对应的代码
     * @param el         input对应的AST树节点
     * @param value      v-model指令绑定的属性
     * @param modifiers  指令修饰符
     */
    function genSelect(el,
                       value,
                       modifiers) {
        var number = modifiers && modifiers.number;
        var selectedVal = "Array.prototype.filter" +
            ".call($event.target.options,function(o){return o.selected})" +
            ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
            // _n, toNumber方法的别名
            "return " + (number ? '_n(val)' : 'val') + "})";

        var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
        var code = "var $$selectedVal = " + selectedVal + ";";
        code = code + " " + (genAssignmentCode(value, assignment));
        // 添加事件对象AST树节点的handlers数组中，用于帮助select绑定change事件
        addHandler(el, 'change', code, null, true);
    }

    /**
     * 默认为<input v-model="****".>, 将v-model指令属性默认编译为：
     * @param el          v-model指令所在的标签对应的AST树节点对象
     * @param value       v-model指令绑定的属性
     * @param modifiers   指令修饰符 lazy, number, trim
     */
    function genDefaultModel(el,
                             value,
                             modifiers) {
        var type = el.attrsMap.type;
        // v-model指令修饰符
        var ref = modifiers || {};
        // 默认情况下，在input事件中，同步输入框的值与数据；如果lazy为true，则在change事件中同步
        var lazy = ref.lazy;
        // 将用户输入转化为number类型
        var number = ref.number;
        // 去除输入结果的前后空格
        var trim = ref.trim;
        var needCompositionGuard = !lazy && type !== 'range';
        // lazy为ture， 为input绑定change事件；lazy为false， 为input绑定input事件
        var event = lazy
            ? 'change'
            : type === 'range'
                ? RANGE_TOKEN
                : 'input';
        // 可以理解为e.target.value, 即触发input绑定的事件时，获取input输入框中的值
        var valueExpression = '$event.target.value';
        if(trim) {
            // 去除input输入框中的值的前后空格
            valueExpression = "$event.target.value.trim()";
        }
        // 类似 <input v-model.number="age" type="number">
        if(number) {
            // _n, toNumber方法的别名
            // 将输入框中的值转化为number类型
            valueExpression = "_n(" + valueExpression + ")";
        }
        // 生成触发input绑定的change或者input操作时候的操作，一般为 message(v-model绑定的属性)=$event.target.value
        var code = genAssignmentCode(value, valueExpression);
        if(needCompositionGuard) {
            code = "if($event.target.composing)return;" + code;
        }
        // 给AST树节点对象添加prop对象
        addProp(el, 'value', ("(" + value + ")"));
        // 给AST树节点对象添加event对象，帮助input节点绑定input或者change事件
        addHandler(el, event, code, null, true);
        if(trim || number) {
            addHandler(el, 'blur', '$forceUpdate()');
        }
    }

    /*  */

    // normalize v-model event tokens that can only be determined at runtime.
    // it's important to place the event as the first in the array because
    // the whole point is ensuring the v-model callback gets called before
    // user-attached handlers.
    function normalizeEvents(on) {
        var event;
        /* istanbul ignore if */
        if(isDef(on[RANGE_TOKEN])) {
            // IE input[type=range] only supports `change` event
            event = isIE ? 'change' : 'input';
            on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
            delete on[RANGE_TOKEN];
        }
        if(isDef(on[CHECKBOX_RADIO_TOKEN])) {
            // Chrome fires microtasks in between click/change, leads to #4521
            event = isChrome ? 'click' : 'change';
            on[event] = [].concat(on[CHECKBOX_RADIO_TOKEN], on[event] || []);
            delete on[CHECKBOX_RADIO_TOKEN];
        }
    }

    var target$1;

    /**
     * 调用原生的给addEventListener方法，给dom节点绑定事件
     * @param event     事件类型
     * @param handler   事件回调函数
     * @param once$$1
     * @param capture
     * @param passive
     */
    function add$1(event,
                   handler,
                   once$$1,
                   capture,
                   passive) {
        // 事件是否只执行一次
        if(once$$1) {
            var oldHandler = handler;
            var _target = target$1; // save current target element in closure
            handler = function(ev) {
                var res = arguments.length === 1
                    ? oldHandler(ev)
                    : oldHandler.apply(null, arguments);
                if(res !== null) {
                    remove$2(event, handler, capture, _target);
                }
            };
        }
        // 调用addEventListener方法绑定事件
        target$1.addEventListener(
            event,
            handler,
            supportsPassive
                ? {capture : capture, passive : passive}
                : capture
        );
    }

    /**
     * 调用原生的removeEentListener移除绑定的事件
     * @param event     事件类型
     * @param handler   事件对应的回调方法
     * @param capture
     * @param _target
     */
    function remove$2(event,
                      handler,
                      capture,
                      _target) {
        (_target || target$1).removeEventListener(event, handler, capture);
    }

    /**
     * 更新虚拟dom节点绑定的事件
     * @param oldVnode  旧的虚拟dom节点
     * @param vnode     新的虚拟dom节点
     */
    function updateDOMListeners(oldVnode, vnode) {
        // 新的虚拟dom节点是否是组件的占位虚拟dom接单
        var isComponentRoot = isDef(vnode.componentOptions);
        // 旧的虚拟节点绑定的事件
        var oldOn = isComponentRoot ? oldVnode.data.nativeOn : oldVnode.data.on;
        // 新的虚拟节点绑定的事件
        // 如果vnode是组件的占位虚拟dom节点，得从nativeOn中查找有没有需要绑定在dom元素上的事件
        var on = isComponentRoot ? vnode.data.nativeOn : vnode.data.on;
        // 如果旧的虚拟节点和新的虚拟节点都没有绑定事件，直接返回
        if(isUndef(oldOn) && isUndef(on)) {
            return
        }
        // 新的绑定事件
        on = on || {};
        // 旧的绑定事件
        oldOn = oldOn || {};
        // 事件需要绑定的目标dom节点， 这是一个全局变量
        target$1 = vnode.elm;
        // 规范化事件
        normalizeEvents(on);
        // 更新target$1上绑定的事件。先根据on，新增或者更新事件；然后更具oldOn，移除on中没有的事件类型
        updateListeners(on, oldOn, add$1, remove$2, vnode.context);
    }
    // event钩子，dom节点在create、update过程中， 对dom节点上的事件进行的操作
    var events = {
        create : updateDOMListeners,
        update : updateDOMListeners
    };

    /*  */
    /**
     * 更新绑定的dom属性
     * @param oldVnode   旧的虚拟dom节点
     * @param vnode      新的虚拟dom节点
     */
    function updateDOMProps(oldVnode, vnode) {
        // 如果旧的虚拟dom节点和新的虚拟dom节点有没有domProps属性，直接返回
        if(isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
            return
        }
        var key, cur;
        // 虚拟dom节点对应的真实dom节点
        var elm = vnode.elm;
        // 旧的虚拟dom节点中绑定的dom属性
        var oldProps = oldVnode.data.domProps || {};
        // 新的虚拟dom节点中绑定的dom属性
        var props = vnode.data.domProps || {};
        // clone observed objects, as the user probably wants to mutate it
        if(isDef(props.__ob__)) {
            props = vnode.data.domProps = extend({}, props);
        }
        // 遍历旧的绑定属性，如果就的绑定属性对应的新的绑定属性没有值，则将dom元素对应的属性的属性值设置为空
        for(key in oldProps) {
            if(isUndef(props[key])) {
                elm[key] = '';
            }
        }
        // 遍历新的绑定属性
        for(key in props) {
            cur = props[key];
            // ignore children if the node has textContent or innerHTML,
            // as these will throw away existing DOM nodes and cause removal errors
            // on subsequent patches (#3360)
            // 如果属性名为textContent或者innerHtml，表明元素绑定v-text、v-htm指令属性，即修改元素的文本内容或者innerHtml
            // 需要将子虚拟dom元素清楚
            if(key === 'textContent' || key === 'innerHTML') {
                if(vnode.children) {
                    vnode.children.length = 0;
                }
                if(cur === oldProps[key]) {
                    continue
                }
            }
            // 如果key值为value，？？
            if(key === 'value') {
                // store value as _value as well since
                // non-string values will be stringified
                elm._value = cur;
                // avoid resetting cursor position when value is the same
                var strCur = isUndef(cur) ? '' : String(cur);
                if(shouldUpdateValue(elm, vnode, strCur)) {
                    elm.value = strCur;
                }
            } else {
                elm[key] = cur;
            }
        }
    }

    // check platforms/web/util/attrs.js acceptValue


    function shouldUpdateValue(elm,
                               vnode,
                               checkVal) {
        return (!elm.composing && (
            vnode.tag === 'option' ||
            isDirty(elm, checkVal) ||
            isInputChanged(elm, checkVal)
        ))
    }

    function isDirty(elm, checkVal) {
        // return true when textbox (.number and .trim) loses focus and its value is
        // not equal to the updated value
        return document.activeElement !== elm && elm.value !== checkVal
    }

    function isInputChanged(elm, newVal) {
        var value = elm.value;
        var modifiers = elm._vModifiers; // injected by v-model runtime
        if(isDef(modifiers) && modifiers.number) {
            return toNumber(value) !== toNumber(newVal)
        }
        if(isDef(modifiers) && modifiers.trim) {
            return value.trim() !== newVal.trim()
        }
        return value !== newVal
    }
    // domProps钩子，在dom节点create、update阶段对props进行的操作
    var domProps = {
        create : updateDOMProps,
        update : updateDOMProps
    };

    /*  */

    var parseStyleText = cached(function(cssText) {
        var res = {};
        var listDelimiter = /;(?![^(]*\))/g;
        var propertyDelimiter = /:(.+)/;
        cssText.split(listDelimiter).forEach(function(item) {
            if(item) {
                var tmp = item.split(propertyDelimiter);
                tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return res
    });

    // merge static and dynamic style data on the same vnode
    function normalizeStyleData(data) {
        var style = normalizeStyleBinding(data.style);
        // static style is pre-processed into an object during compilation
        // and is always a fresh object, so it's safe to merge into it
        return data.staticStyle
            ? extend(data.staticStyle, style)
            : style
    }

    // normalize possible array / string values into Object
    /**
     * 格式化style属性
     * @param bindingStyle
     * @return {*}
     */
    function normalizeStyleBinding(bindingStyle) {
        // 如果动态绑定的style是数组，将数组转化为对象
        if(Array.isArray(bindingStyle)) {
            return toObject(bindingStyle)
        }
        if(typeof bindingStyle === 'string') {
            return parseStyleText(bindingStyle)
        }
        return bindingStyle
    }

    /**
     * parent component style should be after child's
     * so that parent component's style could override it
     */
    function getStyle(vnode, checkChild) {
        var res = {};
        var styleData;

        if(checkChild) {
            var childNode = vnode;
            while(childNode.componentInstance) {
                childNode = childNode.componentInstance._vnode;
                if(childNode.data && (styleData = normalizeStyleData(childNode.data))) {
                    extend(res, styleData);
                }
            }
        }

        if((styleData = normalizeStyleData(vnode.data))) {
            extend(res, styleData);
        }

        var parentNode = vnode;
        while((parentNode = parentNode.parent)) {
            if(parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
                extend(res, styleData);
            }
        }
        return res
    }

    /*  */

    var cssVarRE = /^--/;
    var importantRE = /\s*!important$/;
    var setProp = function(el, name, val) {
        /* istanbul ignore if */
        if(cssVarRE.test(name)) {
            el.style.setProperty(name, val);
        } else if(importantRE.test(val)) {
            el.style.setProperty(name, val.replace(importantRE, ''), 'important');
        } else {
            var normalizedName = normalize(name);
            if(Array.isArray(val)) {
                // Support values array created by autoprefixer, e.g.
                // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
                // Set them one by one, and the browser will only set those it can recognize
                for(var i = 0, len = val.length; i < len; i++) {
                    el.style[normalizedName] = val[i];
                }
            } else {
                el.style[normalizedName] = val;
            }
        }
    };

    var vendorNames = ['Webkit', 'Moz', 'ms'];

    var emptyStyle;
    var normalize = cached(function(prop) {
        emptyStyle = emptyStyle || document.createElement('div').style;
        prop = camelize(prop);
        if(prop !== 'filter' && (prop in emptyStyle)) {
            return prop
        }
        var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
        for(var i = 0; i < vendorNames.length; i++) {
            var name = vendorNames[i] + capName;
            if(name in emptyStyle) {
                return name
            }
        }
    });

    /**
     * 比较新旧虚拟dom节点上的style，static属性， 更新真实dom节点的style属性
     * @param oldVnode
     * @param vnode
     */
    function updateStyle(oldVnode, vnode) {
        var data = vnode.data;
        var oldData = oldVnode.data;

        if(isUndef(data.staticStyle) && isUndef(data.style) &&
            isUndef(oldData.staticStyle) && isUndef(oldData.style)
        ) {
            return
        }

        var cur, name;
        var el = vnode.elm;
        // 旧的虚拟dom节点的静态style属性
        var oldStaticStyle = oldData.staticStyle;
        // 旧的虚拟dom节点的动态绑定的style属性
        var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

        // if static style exists, stylebinding already merged into it when doing normalizeStyleData
        var oldStyle = oldStaticStyle || oldStyleBinding;
        // 格式化动态绑定的style
        var style = normalizeStyleBinding(vnode.data.style) || {};

        // store normalized style under a different key for next diff
        // make sure to clone it if it's reactive, since the user likley wants
        // to mutate it.
        vnode.data.normalizedStyle = isDef(style.__ob__)
            ? extend({}, style)
            : style;

        var newStyle = getStyle(vnode, true);

        for(name in oldStyle) {
            if(isUndef(newStyle[name])) {
                setProp(el, name, '');
            }
        }
        for(name in newStyle) {
            cur = newStyle[name];
            if(cur !== oldStyle[name]) {
                // ie9 setting to null has no effect, must use empty string
                setProp(el, name, cur == null ? '' : cur);
            }
        }
    }
    // style钩子， 在dom节点create、update阶段，对dom节点的样式属性的操作
    var style = {
        create : updateStyle,
        update : updateStyle
    };

    /*  */

    /**
     * Add class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function addClass(el, cls) {
        /* istanbul ignore if */
        if(!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if(el.classList) {
            if(cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function(c) {
                    return el.classList.add(c);
                });
            } else {
                el.classList.add(cls);
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            if(cur.indexOf(' ' + cls + ' ') < 0) {
                el.setAttribute('class', (cur + cls).trim());
            }
        }
    }

    /**
     * Remove class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function removeClass(el, cls) {
        /* istanbul ignore if */
        if(!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if(el.classList) {
            if(cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function(c) {
                    return el.classList.remove(c);
                });
            } else {
                el.classList.remove(cls);
            }
            if(!el.classList.length) {
                el.removeAttribute('class');
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            var tar = ' ' + cls + ' ';
            while(cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ');
            }
            cur = cur.trim();
            if(cur) {
                el.setAttribute('class', cur);
            } else {
                el.removeAttribute('class');
            }
        }
    }

    /*  */
    /**
     * 根据transition属性，获取过渡效果的css类名
     * like： ***-enterClass, ***-enterToClass, ****-enterActiveClass
     *        ***-leaveClass， ***-leaveToClass， ***-leaveActiveClass
     * @param def$$1   虚拟dom节点data中transition属性对应的属性值
     * @return {{}}
     */
    function resolveTransition(def$$1) {
        if(!def$$1) {
            return
        }
        /* istanbul ignore else */
        if(typeof def$$1 === 'object') {
            var res = {};
            if(def$$1.css !== false) {
                // 给res添加name属性值对应的transition过渡css类名,like“***-enter”等
                // 如果name属性为空，默认name=“v”
                extend(res, autoCssTransition(def$$1.name || 'v'));
            }
            extend(res, def$$1);
            return res
        } else if(typeof def$$1 === 'string') {
            return autoCssTransition(def$$1)
        }
    }
    // autoCssTransition是一个函数，根据传入的name参数， 返回对应的transition过渡css类名。
    var autoCssTransition = cached(function(name) {
        return {
            // 定义进入过渡的开始状态。
            enterClass : (name + "-enter"),
            //  定义进入过渡的结束状态。
            enterToClass : (name + "-enter-to"),
            // 定义进入过渡的状态。
            enterActiveClass : (name + "-enter-active"),
            // 定义离开过渡的开始状态
            leaveClass : (name + "-leave"),
            // 定义离开过渡的结束状态
            leaveToClass : (name + "-leave-to"),
            // 定义离开过渡的状态
            leaveActiveClass : (name + "-leave-active")
        }
    });

    var hasTransition = inBrowser && !isIE9;
    var TRANSITION = 'transition';
    var ANIMATION = 'animation';

    // Transition property/event sniffing
    var transitionProp = 'transition';
    var transitionEndEvent = 'transitionend';
    var animationProp = 'animation';
    var animationEndEvent = 'animationend';
    if(hasTransition) {
        /* istanbul ignore if */
        if(window.ontransitionend === undefined &&
            window.onwebkittransitionend !== undefined
        ) {
            transitionProp = 'WebkitTransition';
            transitionEndEvent = 'webkitTransitionEnd';
        }
        if(window.onanimationend === undefined &&
            window.onwebkitanimationend !== undefined
        ) {
            animationProp = 'WebkitAnimation';
            animationEndEvent = 'webkitAnimationEnd';
        }
    }

    // binding to window is necessary to make hot reload work in IE in strict mode
    var raf = inBrowser && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout;

    function nextFrame(fn) {
        raf(function() {
            raf(fn);
        });
    }

    /**
     * 给dom元素添加class类
     * @param el
     * @param cls
     */
    function addTransitionClass(el, cls) {
        var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
        if(transitionClasses.indexOf(cls) < 0) {
            transitionClasses.push(cls);
            addClass(el, cls);
        }
    }

    function removeTransitionClass(el, cls) {
        if(el._transitionClasses) {
            remove(el._transitionClasses, cls);
        }
        removeClass(el, cls);
    }

    function whenTransitionEnds(el,
                                expectedType,
                                cb) {
        var ref = getTransitionInfo(el, expectedType);
        var type = ref.type;
        var timeout = ref.timeout;
        var propCount = ref.propCount;
        if(!type) {
            return cb()
        }
        var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
        var ended = 0;
        var end = function() {
            el.removeEventListener(event, onEnd);
            cb();
        };
        var onEnd = function(e) {
            if(e.target === el) {
                if(++ended >= propCount) {
                    end();
                }
            }
        };
        setTimeout(function() {
            if(ended < propCount) {
                end();
            }
        }, timeout + 1);
        el.addEventListener(event, onEnd);
    }

    var transformRE = /\b(transform|all)(,|$)/;

    function getTransitionInfo(el, expectedType) {
        var styles = window.getComputedStyle(el);
        var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
        var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
        var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
        var animationDelays = styles[animationProp + 'Delay'].split(', ');
        var animationDurations = styles[animationProp + 'Duration'].split(', ');
        var animationTimeout = getTimeout(animationDelays, animationDurations);

        var type;
        var timeout = 0;
        var propCount = 0;
        /* istanbul ignore if */
        if(expectedType === TRANSITION) {
            if(transitionTimeout > 0) {
                type = TRANSITION;
                timeout = transitionTimeout;
                propCount = transitionDurations.length;
            }
        } else if(expectedType === ANIMATION) {
            if(animationTimeout > 0) {
                type = ANIMATION;
                timeout = animationTimeout;
                propCount = animationDurations.length;
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout);
            type = timeout > 0
                ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                : null;
            propCount = type
                ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                : 0;
        }
        var hasTransform =
            type === TRANSITION &&
            transformRE.test(styles[transitionProp + 'Property']);
        return {
            type : type,
            timeout : timeout,
            propCount : propCount,
            hasTransform : hasTransform
        }
    }

    function getTimeout(delays, durations) {
        /* istanbul ignore next */
        while(delays.length < durations.length) {
            delays = delays.concat(delays);
        }

        return Math.max.apply(null, durations.map(function(d, i) {
            return toMs(d) + toMs(delays[i])
        }))
    }

    function toMs(s) {
        return Number(s.slice(0, -1)) * 1000
    }

    /*  */
    /**
     * transition组件中的子节点创建时需要执行的created钩子函数
     * @param vnode              虚拟dom节点
     * @param toggleDisplay
     */
    function enter(vnode, toggleDisplay) {
        // 需要添加过渡效果的真实dom节点
        var el = vnode.elm;

        // call leave callback now
        // 是否有level回调函数， 有的话，执行
        if(isDef(el._leaveCb)) {
            el._leaveCb.cancelled = true;
            el._leaveCb();
        }
        // data中含有过渡效果的class类
        var data = resolveTransition(vnode.data.transition);
        if(isUndef(data)) {
            return
        }

        /* istanbul ignore if */
        if(isDef(el._enterCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var enterClass = data.enterClass;
        var enterToClass = data.enterToClass;
        var enterActiveClass = data.enterActiveClass;
        var appearClass = data.appearClass;
        var appearToClass = data.appearToClass;
        var appearActiveClass = data.appearActiveClass;
        var beforeEnter = data.beforeEnter;
        var enter = data.enter;
        var afterEnter = data.afterEnter;
        var enterCancelled = data.enterCancelled;
        var beforeAppear = data.beforeAppear;
        var appear = data.appear;
        var afterAppear = data.afterAppear;
        var appearCancelled = data.appearCancelled;
        var duration = data.duration;

        // activeInstance will always be the <transition> component managing this
        // transition. One edge case to check is when the <transition> is placed
        // as the root node of a child component. In that case we need to check
        // <transition>'s parent for appear check.
        var context = activeInstance;
        var transitionNode = activeInstance.$vnode;
        while(transitionNode && transitionNode.parent) {
            transitionNode = transitionNode.parent;
            context = transitionNode.context;
        }

        var isAppear = !context._isMounted || !vnode.isRootInsert;

        if(isAppear && !appear && appear !== '') {
            return
        }

        var startClass = isAppear && appearClass
            ? appearClass
            : enterClass;
        var activeClass = isAppear && appearActiveClass
            ? appearActiveClass
            : enterActiveClass;
        var toClass = isAppear && appearToClass
            ? appearToClass
            : enterToClass;

        var beforeEnterHook = isAppear
            ? (beforeAppear || beforeEnter)
            : beforeEnter;
        var enterHook = isAppear
            ? (typeof appear === 'function' ? appear : enter)
            : enter;
        var afterEnterHook = isAppear
            ? (afterAppear || afterEnter)
            : afterEnter;
        var enterCancelledHook = isAppear
            ? (appearCancelled || enterCancelled)
            : enterCancelled;

        var explicitEnterDuration = toNumber(
            isObject(duration)
                ? duration.enter
                : duration
        );

        if("development" !== 'production' && explicitEnterDuration != null) {
            checkDuration(explicitEnterDuration, 'enter', vnode);
        }

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(enterHook);

        var cb = el._enterCb = once(function() {
            if(expectsCSS) {
                removeTransitionClass(el, toClass);
                removeTransitionClass(el, activeClass);
            }
            if(cb.cancelled) {
                if(expectsCSS) {
                    removeTransitionClass(el, startClass);
                }
                enterCancelledHook && enterCancelledHook(el);
            } else {
                afterEnterHook && afterEnterHook(el);
            }
            el._enterCb = null;
        });

        if(!vnode.data.show) {
            // remove pending leave element on enter by injecting an insert hook
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function() {
                var parent = el.parentNode;
                var pendingNode = parent && parent._pending && parent._pending[vnode.key];
                if(pendingNode &&
                    pendingNode.tag === vnode.tag &&
                    pendingNode.elm._leaveCb
                ) {
                    pendingNode.elm._leaveCb();
                }
                enterHook && enterHook(el, cb);
            });
        }

        // start enter transition
        beforeEnterHook && beforeEnterHook(el);
        if(expectsCSS) {
            // 给dom节点添加class类
            addTransitionClass(el, startClass);
            addTransitionClass(el, activeClass);
            nextFrame(function() {
                addTransitionClass(el, toClass);
                removeTransitionClass(el, startClass);
                if(!cb.cancelled && !userWantsControl) {
                    if(isValidDuration(explicitEnterDuration)) {
                        setTimeout(cb, explicitEnterDuration);
                    } else {
                        whenTransitionEnds(el, type, cb);
                    }
                }
            });
        }

        if(vnode.data.show) {
            toggleDisplay && toggleDisplay();
            enterHook && enterHook(el, cb);
        }

        if(!expectsCSS && !userWantsControl) {
            cb();
        }
    }

    function leave(vnode, rm) {
        var el = vnode.elm;

        // call enter callback now
        if(isDef(el._enterCb)) {
            el._enterCb.cancelled = true;
            el._enterCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if(isUndef(data)) {
            return rm()
        }

        /* istanbul ignore if */
        if(isDef(el._leaveCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var leaveClass = data.leaveClass;
        var leaveToClass = data.leaveToClass;
        var leaveActiveClass = data.leaveActiveClass;
        var beforeLeave = data.beforeLeave;
        var leave = data.leave;
        var afterLeave = data.afterLeave;
        var leaveCancelled = data.leaveCancelled;
        var delayLeave = data.delayLeave;
        var duration = data.duration;

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(leave);

        var explicitLeaveDuration = toNumber(
            isObject(duration)
                ? duration.leave
                : duration
        );

        if("development" !== 'production' && isDef(explicitLeaveDuration)) {
            checkDuration(explicitLeaveDuration, 'leave', vnode);
        }

        var cb = el._leaveCb = once(function() {
            if(el.parentNode && el.parentNode._pending) {
                el.parentNode._pending[vnode.key] = null;
            }
            if(expectsCSS) {
                removeTransitionClass(el, leaveToClass);
                removeTransitionClass(el, leaveActiveClass);
            }
            if(cb.cancelled) {
                if(expectsCSS) {
                    removeTransitionClass(el, leaveClass);
                }
                leaveCancelled && leaveCancelled(el);
            } else {
                rm();
                afterLeave && afterLeave(el);
            }
            el._leaveCb = null;
        });

        if(delayLeave) {
            delayLeave(performLeave);
        } else {
            performLeave();
        }

        function performLeave() {
            // the delayed leave may have already been cancelled
            if(cb.cancelled) {
                return
            }
            // record leaving element
            if(!vnode.data.show) {
                (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
            }
            beforeLeave && beforeLeave(el);
            if(expectsCSS) {
                addTransitionClass(el, leaveClass);
                addTransitionClass(el, leaveActiveClass);
                nextFrame(function() {
                    addTransitionClass(el, leaveToClass);
                    removeTransitionClass(el, leaveClass);
                    if(!cb.cancelled && !userWantsControl) {
                        if(isValidDuration(explicitLeaveDuration)) {
                            setTimeout(cb, explicitLeaveDuration);
                        } else {
                            whenTransitionEnds(el, type, cb);
                        }
                    }
                });
            }
            leave && leave(el, cb);
            if(!expectsCSS && !userWantsControl) {
                cb();
            }
        }
    }

    // only used in dev mode
    function checkDuration(val, name, vnode) {
        if(typeof val !== 'number') {
            warn(
                "<transition> explicit " + name + " duration is not a valid number - " +
                "got " + (JSON.stringify(val)) + ".",
                vnode.context
            );
        } else if(isNaN(val)) {
            warn(
                "<transition> explicit " + name + " duration is NaN - " +
                'the duration expression might be incorrect.',
                vnode.context
            );
        }
    }

    function isValidDuration(val) {
        return typeof val === 'number' && !isNaN(val)
    }

    /**
     * Normalize a transition hook's argument length. The hook may be:
     * - a merged hook (invoker) with the original in .fns
     * - a wrapped component method (check ._length)
     * - a plain function (.length)
     */
    function getHookArgumentsLength(fn) {
        if(isUndef(fn)) {
            return false
        }
        var invokerFns = fn.fns;
        if(isDef(invokerFns)) {
            // invoker
            return getHookArgumentsLength(
                Array.isArray(invokerFns)
                    ? invokerFns[0]
                    : invokerFns
            )
        } else {
            return (fn._length || fn.length) > 1
        }
    }

    /**
     * transition组件中的子节点创建时需要执行的created钩子函数
     * @param _
     * @param vnode   虚拟dom节点
     * @private
     */
    function _enter(_, vnode) {
        if(vnode.data.show !== true) {
            enter(vnode);
        }
    }
    // transition钩子，在dom节点 create、active、remove阶段，对dom节点的操作（？？）
    var transition = inBrowser ? {
        create : _enter,
        activate : _enter,
        remove : function remove$$1(vnode, rm) {
            /* istanbul ignore else */
            if(vnode.data.show !== true) {
                leave(vnode, rm);
            } else {
                rm();
            }
        }
    } : {};
    //
    var platformModules = [
        // attrs = {create : updateAttrs,update : updateAttrs};
        attrs,
        // klass = {create：updateClass, update:updateClass}
        klass,
        // events={create : updateDOMListeners,update : updateDOMListeners}
        events,
        // domProps={create:updateDOMProps, update:updateDOMProps}
        domProps,
        // style={create:updateStyle, update:updateStyle}
        style,
        // transtion={create:function(){}, active:function(){}, remover:function(){}}
        transition
    ];

    /*  */

    // the directive module should be applied last, after all
    // built-in modules have been applied.
    var modules = platformModules.concat(baseModules);
    // 创建patch函数
    var patch = createPatchFunction({nodeOps : nodeOps, modules : modules});

    /**
     * Not type checking this file because flow doesn't like attaching
     * properties to Elements.
     */

    var isTextInputType = makeMap('text,number,password,search,email,tel,url');

    /* istanbul ignore if */
    if(isIE9) {
        // http://www.matts411.com/post/internet-explorer-9-oninput/
        document.addEventListener('selectionchange', function() {
            var el = document.activeElement;
            if(el && el.vmodel) {
                trigger(el, 'input');
            }
        });
    }
    // v-model指令的钩子函数
    // vue指令和自定义指令会有钩子函数，钩子函数会在指令绑定的元素处于对应阶段时执行
    // 钩子函数：
    //         bind: 只调用一次，指令第一次绑定到元素时调用，用这个钩子函数可以定义一个在绑定时执行一次的初始化动作。
    //         inserted: 被绑定元素插入父节点时调用
    //         update: 所在组件的 VNode 更新时调用，但是可能发生在其孩子的 VNode 更新之前。
    //                 指令的值可能发生了改变也可能没有。
    //                 但是你可以通过比较更新前后的值来忽略不必要的模板更新 (详细的钩子函数参数见下)。
    //         componentUpdated: 所在组件的 VNode 及其孩子的 VNode 全部更新时调用。
    //         unbind: 只调用一次。指令和元素解除绑定时候调用
    var model$1 = {
        /**
         * v-model指令的inserted钩子函数
         * @param el       指令绑定的真实dom节点奖
         * @param binding
         * @param vnode    指令绑定的节点对应的虚拟dom节点
         */
        inserted : function inserted(el, binding, vnode) {
            if(vnode.tag === 'select') {
                var cb = function() {
                    setSelected(el, binding, vnode.context);
                };
                cb();
                /* istanbul ignore if */
                if(isIE || isEdge) {
                    setTimeout(cb, 0);
                }
            } else if(vnode.tag === 'textarea' || isTextInputType(el.type)) {
                el._vModifiers = binding.modifiers;
                if(!binding.modifiers.lazy) {
                    // Safari < 10.2 & UIWebView doesn't fire compositionend when
                    // switching focus before confirming composition choice
                    // this also fixes the issue where some browsers e.g. iOS Chrome
                    // fires "change" instead of "input" on autocomplete.
                    el.addEventListener('change', onCompositionEnd);
                    if(!isAndroid) {
                        el.addEventListener('compositionstart', onCompositionStart);
                        el.addEventListener('compositionend', onCompositionEnd);
                    }
                    /* istanbul ignore if */
                    if(isIE9) {
                        el.vmodel = true;
                    }
                }
            }
        },
        /**
         * v-model指令的compontUpdated钩子函数？？
         * @param el
         * @param binding
         * @param vnode
         */
        componentUpdated : function componentUpdated(el, binding, vnode) {
            if(vnode.tag === 'select') {
                setSelected(el, binding, vnode.context);
                // in case the options rendered by v-for have changed,
                // it's possible that the value is out-of-sync with the rendered options.
                // detect such cases and filter out values that no longer has a matching
                // option in the DOM.
                var needReset = el.multiple
                    ? binding.value.some(function(v) {
                        return hasNoMatchingOption(v, el.options);
                    })
                    : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
                if(needReset) {
                    trigger(el, 'change');
                }
            }
        }
    };

    function setSelected(el, binding, vm) {
        var value = binding.value;
        var isMultiple = el.multiple;
        if(isMultiple && !Array.isArray(value)) {
            "development" !== 'production' && warn(
                "<select multiple v-model=\"" + (binding.expression) + "\"> " +
                "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
                vm
            );
            return
        }
        var selected, option;
        for(var i = 0, l = el.options.length; i < l; i++) {
            option = el.options[i];
            if(isMultiple) {
                selected = looseIndexOf(value, getValue(option)) > -1;
                if(option.selected !== selected) {
                    option.selected = selected;
                }
            } else {
                if(looseEqual(getValue(option), value)) {
                    if(el.selectedIndex !== i) {
                        el.selectedIndex = i;
                    }
                    return
                }
            }
        }
        if(!isMultiple) {
            el.selectedIndex = -1;
        }
    }

    function hasNoMatchingOption(value, options) {
        for(var i = 0, l = options.length; i < l; i++) {
            if(looseEqual(getValue(options[i]), value)) {
                return false
            }
        }
        return true
    }

    function getValue(option) {
        return '_value' in option
            ? option._value
            : option.value
    }

    function onCompositionStart(e) {
        e.target.composing = true;
    }

    function onCompositionEnd(e) {
        // prevent triggering an input event for no reason
        if(!e.target.composing) {
            return
        }
        e.target.composing = false;
        trigger(e.target, 'input');
    }

    function trigger(el, type) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, true, true);
        el.dispatchEvent(e);
    }

    /*  */

    // recursively search for possible transition defined inside the component root
    /**
     * 定位虚拟dom节点
     * @param vnode    虚拟dom节点
     * @return {*}
     */
    function locateNode(vnode) {
        return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
            ? locateNode(vnode.componentInstance._vnode)
            : vnode
    }
    // v-show指令的钩子函数
    var show = {
        /**
         * bind钩子函数
         * @param el       v-show指令对应的dom元素
         * @param ref      v-show指令的指令对象
         * @param vnode    v-show指令所在dom元素的虚拟dom节点
         */
        bind : function bind(el, ref, vnode) {
            // v-show指令的值， true or false
            var value = ref.value;
            // 定位虚拟dom节点？？
            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            // 获取dom元素的display类型（block、inline-block等）
            var originalDisplay = el.__vOriginalDisplay =
                el.style.display === 'none' ? '' : el.style.display;
            if(value && transition$$1 && !isIE9) {
                vnode.data.show = true;
                enter(vnode, function() {
                    el.style.display = originalDisplay;
                });
            } else {
                // 如果value为false，则dom元素的display为none；否则元素的display为本身原来的属性
                el.style.display = value ? originalDisplay : 'none';
            }
        },
        /**
         * update钩子函数
         * @param el
         * @param ref
         * @param vnode
         */
        update : function update(el, ref, vnode) {
            var value = ref.value;
            var oldValue = ref.oldValue;

            /* istanbul ignore if */
            if(value === oldValue) {
                return
            }
            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            if(transition$$1 && !isIE9) {
                vnode.data.show = true;
                if(value) {
                    enter(vnode, function() {
                        el.style.display = el.__vOriginalDisplay;
                    });
                } else {
                    leave(vnode, function() {
                        el.style.display = 'none';
                    });
                }
            } else {
                el.style.display = value ? el.__vOriginalDisplay : 'none';
            }
        },
        /**
         * unbind钩子函数
         * @param el
         * @param binding
         * @param vnode
         * @param oldVnode
         * @param isDestroy
         */
        unbind : function unbind(el,
                                 binding,
                                 vnode,
                                 oldVnode,
                                 isDestroy) {
            if(!isDestroy) {
                el.style.display = el.__vOriginalDisplay;
            }
        }
    };
    // 平台的指令定义对象
    var platformDirectives = {
        // v-model指令的定义对象
        model : model$1,
        // v-show指令的定义对象
        show : show
    };

    /*  */

    // Provides transition support for a single element/component.
    // supports transition mode (out-in / in-out)
    // 过度组件的props属性
    var transitionProps = {
        name : String,
        appear : Boolean,
        css : Boolean,
        mode : String,
        type : String,
        enterClass : String,
        leaveClass : String,
        enterToClass : String,
        leaveToClass : String,
        enterActiveClass : String,
        leaveActiveClass : String,
        appearClass : String,
        appearActiveClass : String,
        appearToClass : String,
        duration : [Number, String, Object]
    };

    // in case the child is also an abstract component, e.g. <keep-alive>
    // we want to recursively retrieve the real component to be rendered
    /**
     * 获取transition真正作用的子元素， 防止作用在抽象组件like keep-alive上
     * @param vnode    transition组件中子节点对应的虚拟dom节点
     * @return {*}
     */
    function getRealChild(vnode) {
        var compOptions = vnode && vnode.componentOptions;
        // 判断子节点是否是抽象组件
        if(compOptions && compOptions.Ctor.options.abstract) {
            return getRealChild(getFirstComponentChild(compOptions.children))
        } else {
            return vnode
        }
    }

    /**
     * 将transition组件上的props属性和绑定的自定义事件，添加到transition子节点的虚拟dom节点的data属性中
     * @param comp     transition组件对应的实例对象
     * @return {{}}
     */
    function extractTransitionData(comp) {
        var data = {};
        // transition组件实例对象的配置项
        var options = comp.$options;
        // props transition组件实例上的props属性
        for(var key in options.propsData) {
            data[key] = comp[key];
        }
        // events.
        // extract listeners and pass them directly to the transition methods
        // transition组件实例绑定的事件
        var listeners = options._parentListeners;
        for(var key$1 in listeners) {
            data[camelize(key$1)] = listeners[key$1];
        }
        return data
    }

    function placeholder(h, rawChild) {
        if(/\d-keep-alive$/.test(rawChild.tag)) {
            return h('keep-alive', {
                props : rawChild.componentOptions.propsData
            })
        }
    }

    /**
     *
     * @param vnode
     * @return {boolean}
     */
    function hasParentTransition(vnode) {
        while((vnode = vnode.parent)) {
            if(vnode.data.transition) {
                return true
            }
        }
    }

    /**
     * 判断两个虚拟dom节点是否是相同的， 需要虚拟dom节点对应的tag 和 key相同
     * @param child        transition组件中需要过渡效果的新的子虚拟dom节点
     * @param oldChild     transition组件中旧的有过渡效果的子虚拟dom节点
     * @return {boolean}
     */
    function isSameChild(child, oldChild) {
        return oldChild.key === child.key && oldChild.tag === child.tag
    }

    function isAsyncPlaceholder(node) {
        return node.isComment && node.asyncFactory
    }
    // transition组件
    var Transition = {
        name : 'transition',
        props : transitionProps,
        abstract : true,
        /**
         * transition 组件的渲染方法， 用于生成虚拟dom节点
         * @param h
         * @return {*}
         */
        render : function render(h) {
            // this-> transition组件实例对象的代理
            var this$1 = this;
            // transition组件内的分发内容
            var children = this.$options._renderChildren;
            if(!children) {
                // 如果没有分发内容的话， 过渡效果什么的也没有意义，直接返回
                return
            }

            // filter out text nodes (possible whitespaces)
            // 过滤掉文本节点
            children = children.filter(function(c) {
                return c.tag || isAsyncPlaceholder(c);
            });
            /* istanbul ignore if */
            if(!children.length) {
                return
            }

            // warn multiple elements
            // 即transition组件下的节点只能有一个，否则会给警告
            if("development" !== 'production' && children.length > 1) {
                warn(
                    '<transition> can only be used on a single element. Use ' +
                    '<transition-group> for lists.',
                    this.$parent
                );
            }
            // mode？ 对应props属性中的mode？
            var mode = this.mode;

            // warn invalid mode
            if("development" !== 'production' &&
                mode && mode !== 'in-out' && mode !== 'out-in'
            ) {
                warn(
                    'invalid <transition> mode: ' + mode,
                    this.$parent
                );
            }
            // 如果transition组件中有多个子节点， 只处理第一个
            var rawChild = children[0];

            // if this is a component root node and the component's
            // parent container node also has transition, skip.
            if(hasParentTransition(this.$vnode)) {
                return rawChild
            }

            // apply transition data to child
            // use getRealChild() to ignore abstract components e.g. keep-alive
            // 防止transition过渡作用在抽象组件上，like keep-alive
            var child = getRealChild(rawChild);
            /* istanbul ignore if */
            if(!child) {
                return rawChild
            }

            if(this._leaving) {
                return placeholder(h, rawChild)
            }

            // ensure a key that is unique to the vnode type and to this transition
            // component instance. This key will be used to remove pending leaving nodes
            // during entering.
            var id = "__transition-" + (this._uid) + "-";
            child.key = child.key == null
                ? child.isComment
                    ? id + 'comment'
                    : id + child.tag
                : isPrimitive(child.key)
                    ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
                    : child.key;
            // 从transition组件上提取props属性和绑定的自定义事件，添加到虚拟dom节点data的transition属性中去
            var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
            // 旧的transition组件对应的虚拟dom节点
            var oldRawChild = this._vnode;
            // 旧的有过渡效果的虚拟dom节点
            var oldChild = getRealChild(oldRawChild);

            // mark v-show
            // so that the transition module can hand over the control to the directive
            if(child.data.directives && child.data.directives.some(function(d) {
                    return d.name === 'show';
                })) {
                child.data.show = true;
            }

            if(
                oldChild &&
                oldChild.data &&
                !isSameChild(child, oldChild) &&
                !isAsyncPlaceholder(oldChild)
            ) {
                // replace old child transition data with fresh one
                // important for dynamic transitions!
                var oldData = oldChild && (oldChild.data.transition = extend({}, data));
                // handle transition mode
                if(mode === 'out-in') {
                    // return placeholder node and queue update when leave finishes
                    this._leaving = true;
                    mergeVNodeHook(oldData, 'afterLeave', function() {
                        this$1._leaving = false;
                        this$1.$forceUpdate();
                    });
                    return placeholder(h, rawChild)
                } else if(mode === 'in-out') {
                    if(isAsyncPlaceholder(child)) {
                        return oldRawChild
                    }
                    var delayedLeave;
                    var performLeave = function() {
                        delayedLeave();
                    };
                    mergeVNodeHook(data, 'afterEnter', performLeave);
                    mergeVNodeHook(data, 'enterCancelled', performLeave);
                    mergeVNodeHook(oldData, 'delayLeave', function(leave) {
                        delayedLeave = leave;
                    });
                }
            }

            return rawChild
        }
    };

    /*  */

    // Provides transition support for list items.
    // supports move transitions using the FLIP technique.

    // Because the vdom's children update algorithm is "unstable" - i.e.
    // it doesn't guarantee the relative positioning of removed elements,
    // we force transition-group to update its children into two passes:
    // in the first pass, we remove all nodes that need to be removed,
    // triggering their leaving transition; in the second pass, we insert/move
    // into the final desired state. This way in the second pass removed
    // nodes will remain where they should be.

    var props = extend({
        tag : String,
        moveClass : String
    }, transitionProps);

    delete props.mode;

    var TransitionGroup = {
        props : props,

        render : function render(h) {
            var tag = this.tag || this.$vnode.data.tag || 'span';
            var map = Object.create(null);
            var prevChildren = this.prevChildren = this.children;
            var rawChildren = this.$slots.default || [];
            var children = this.children = [];
            var transitionData = extractTransitionData(this);

            for(var i = 0; i < rawChildren.length; i++) {
                var c = rawChildren[i];
                if(c.tag) {
                    if(c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                        children.push(c);
                        map[c.key] = c
                        ;(c.data || (c.data = {})).transition = transitionData;
                    } else {
                        var opts = c.componentOptions;
                        var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
                        warn(("<transition-group> children must be keyed: <" + name + ">"));
                    }
                }
            }

            if(prevChildren) {
                var kept = [];
                var removed = [];
                for(var i$1 = 0; i$1 < prevChildren.length; i$1++) {
                    var c$1 = prevChildren[i$1];
                    c$1.data.transition = transitionData;
                    c$1.data.pos = c$1.elm.getBoundingClientRect();
                    if(map[c$1.key]) {
                        kept.push(c$1);
                    } else {
                        removed.push(c$1);
                    }
                }
                this.kept = h(tag, null, kept);
                this.removed = removed;
            }

            return h(tag, null, children)
        },

        beforeUpdate : function beforeUpdate() {
            // force removing pass
            this.__patch__(
                this._vnode,
                this.kept,
                false, // hydrating
                true // removeOnly (!important, avoids unnecessary moves)
            );
            this._vnode = this.kept;
        },

        updated : function updated() {
            var children = this.prevChildren;
            var moveClass = this.moveClass || ((this.name || 'v') + '-move');
            if(!children.length || !this.hasMove(children[0].elm, moveClass)) {
                return
            }

            // we divide the work into three loops to avoid mixing DOM reads and writes
            // in each iteration - which helps prevent layout thrashing.
            children.forEach(callPendingCbs);
            children.forEach(recordPosition);
            children.forEach(applyTranslation);

            // force reflow to put everything in position
            var body = document.body;
            var f = body.offsetHeight; // eslint-disable-line

            children.forEach(function(c) {
                if(c.data.moved) {
                    var el = c.elm;
                    var s = el.style;
                    addTransitionClass(el, moveClass);
                    s.transform = s.WebkitTransform = s.transitionDuration = '';
                    el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
                        if(!e || /transform$/.test(e.propertyName)) {
                            el.removeEventListener(transitionEndEvent, cb);
                            el._moveCb = null;
                            removeTransitionClass(el, moveClass);
                        }
                    });
                }
            });
        },

        methods : {
            hasMove : function hasMove(el, moveClass) {
                /* istanbul ignore if */
                if(!hasTransition) {
                    return false
                }
                /* istanbul ignore if */
                if(this._hasMove) {
                    return this._hasMove
                }
                // Detect whether an element with the move class applied has
                // CSS transitions. Since the element may be inside an entering
                // transition at this very moment, we make a clone of it and remove
                // all other transition classes applied to ensure only the move class
                // is applied.
                var clone = el.cloneNode();
                if(el._transitionClasses) {
                    el._transitionClasses.forEach(function(cls) {
                        removeClass(clone, cls);
                    });
                }
                addClass(clone, moveClass);
                clone.style.display = 'none';
                this.$el.appendChild(clone);
                var info = getTransitionInfo(clone);
                this.$el.removeChild(clone);
                return (this._hasMove = info.hasTransform)
            }
        }
    };

    function callPendingCbs(c) {
        /* istanbul ignore if */
        if(c.elm._moveCb) {
            c.elm._moveCb();
        }
        /* istanbul ignore if */
        if(c.elm._enterCb) {
            c.elm._enterCb();
        }
    }

    function recordPosition(c) {
        c.data.newPos = c.elm.getBoundingClientRect();
    }

    function applyTranslation(c) {
        var oldPos = c.data.pos;
        var newPos = c.data.newPos;
        var dx = oldPos.left - newPos.left;
        var dy = oldPos.top - newPos.top;
        if(dx || dy) {
            c.data.moved = true;
            var s = c.elm.style;
            s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
            s.transitionDuration = '0s';
        }
    }

    var platformComponents = {
        Transition : Transition,
        TransitionGroup : TransitionGroup
    };

    /*  */

    // install platform specific utils
    Vue$3.config.mustUseProp = mustUseProp;
    Vue$3.config.isReservedTag = isReservedTag;
    Vue$3.config.isReservedAttr = isReservedAttr;
    Vue$3.config.getTagNamespace = getTagNamespace;
    Vue$3.config.isUnknownElement = isUnknownElement;

    // install platform runtime directives & components
    // 给Vue构造函数的配置项中添加指令及其对应的钩子函数
    extend(Vue$3.options.directives, platformDirectives);
    // 给Vue构造函数的配置项中添加components（Transition，TransitionGroup）
    extend(Vue$3.options.components, platformComponents);

    // install platform patch function
    // 给Vue实例添加_patch_方法
    Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

    // public mount method
    // 给Vue实例添加$mount方法
    // 将vue实例挂载到el对应的dom节点上，即把vue实例对应的dom节点替换el对应的dom节点上
    Vue$3.prototype.$mount = function(el,
                                      hydrating) {
        el = el && inBrowser ? query(el) : undefined;
        // this->Vue实例， el：未重绘的dom元素， 根据Vue实例的配置项中的渲染函数等属性，重绘dom元素
        // 将重绘的dom元素替换el对应的dom元素
        return mountComponent(this, el, hydrating)
    };

    // devtools global hook
    /* istanbul ignore next */
    setTimeout(function() {
        if(config.devtools) {
            if(devtools) {
                devtools.emit('init', Vue$3);
            } else if("development" !== 'production' && isChrome) {
                console[console.info ? 'info' : 'log'](
                    'Download the Vue Devtools extension for a better development experience:\n' +
                    'https://github.com/vuejs/vue-devtools'
                );
            }
        }
        if("development" !== 'production' &&
            config.productionTip !== false &&
            inBrowser && typeof console !== 'undefined'
        ) {
            console[console.info ? 'info' : 'log'](
                "You are running Vue in development mode.\n" +
                "Make sure to turn on production mode when deploying for production.\n" +
                "See more tips at https://vuejs.org/guide/deployment.html"
            );
        }
    }, 0);

    /*  */

    // check whether current browser encodes a char inside attribute values
    function shouldDecode(content, encoded) {
        var div = document.createElement('div');
        div.innerHTML = "<div a=\"" + content + "\"/>";
        return div.innerHTML.indexOf(encoded) > 0
    }

    // #3663
    // IE encodes newlines inside attribute values while other browsers don't
    var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

    /*  */
    // 正则表达式， 用来解析{{****}}的
    var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

    var buildRegex = cached(function(delimiters) {
        var open = delimiters[0].replace(regexEscapeRE, '\\$&');
        var close = delimiters[1].replace(regexEscapeRE, '\\$&');
        return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
    });

    /**
     * 解析文本插值内容{{*****}}, 在界面展示的时候是作为一个nodeType=3的dom节点，对应的虚拟dom节点也是文本类型的虚拟dom节点
     * 需要通过createTextVNode(toString(****)), 来创建一个文本虚拟动漫节点
     * @param text       {{****}}
     * @param delimiters
     * @return {string}
     */
    function parseText(text,
                       delimiters) {
        // defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g, 正则表达式，用于判断是否是{{****}}样式的
        var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
        if(!tagRE.test(text)) {
            return
        }
        var tokens = [];
        var lastIndex = tagRE.lastIndex = 0;
        var match, index;
        while((match = tagRE.exec(text))) {
            index = match.index;
            // push text token
            if(index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // tag token
            var exp = parseFilters(match[1].trim());
            // _s, toString方法的别名,Object.prototype.toString
            tokens.push(("_s(" + exp + ")"));
            lastIndex = index + match[0].length;
        }
        if(lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return tokens.join('+')
    }

    /*  */
    /**
     * 判断AST树节点对应的标签上是否存在静态class和动态绑定的style
     *  如果存在静态style， 给AST树节点对象添加staticClass属性；
     *  如果存在动态绑定style， 给AST树节点对象添加classBinding属性；
     * @param el         AST树节点对象
     * @param options    配置项
     */
    function transformNode(el, options) {
        var warn = options.warn || baseWarn;
        // 判断el对应的标签上的class是否是静态的
        var staticClass = getAndRemoveAttr(el, 'class');
        if("development" !== 'production' && staticClass) {
            var expression = parseText(staticClass, options.delimiters);
            if(expression) {
                warn(
                    "class=\"" + staticClass + "\": " +
                    'Interpolation inside attributes has been removed. ' +
                    'Use v-bind or the colon shorthand instead. For example, ' +
                    'instead of <div class="{{ val }}">, use <div :class="val">.'
                );
            }
        }
        if(staticClass) {
            // 如果是静态的class， 给AST树节点添加static属性
            el.staticClass = JSON.stringify(staticClass);
        }
        // 判断AST树节点对应的标签上有没有使用v-bind绑定的class属性
        var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
        if(classBinding) {
            // 如果标签上有"v-bind:class='*****'" 的属性，给AST树节点对象添加classBinding属性， 属性值为***
            el.classBinding = classBinding;
        }
    }

    /**
     * 相当于genClass方法， 将AST树节点对象的staticClass、classBinding属性解析为代码json串
     * 注意，标签上的静态class和动态绑定的class是可以同时存在的
     * @param el         AST树节点对象
     * @return {string}
     */
    function genData(el) {
        var data = '';
        // 如果AST树节点对应的标签上的class属性是静态的
        if(el.staticClass) {
            data += "staticClass:" + (el.staticClass) + ",";
        }
        // 如果AST树节点对应的标签上的class属性是动态绑定的
        if(el.classBinding) {
            data += "class:" + (el.classBinding) + ",";
        }
        return data
    }

    var klass$1 = {
        // staticClass，AST树节点的一个属性
        staticKeys : ['staticClass'],
        // 可以理解为processClass， like processIf
        transformNode : transformNode,
        // 可以理解为genClass， like genIf
        genData : genData
    };

    /*  */
    /**
     * 判断AST树节点对应的标签上是否存在静态style和动态绑定的style
     *     如果存在静态的style， 给AST树节点对象添加staticStyle属性；
     *     如果存在动态绑定的style， 给AST树节点对象添加styleBinding属性；
     * @param el
     * @param options
     */
    function transformNode$1(el, options) {
        var warn = options.warn || baseWarn;
        var staticStyle = getAndRemoveAttr(el, 'style');
        if(staticStyle) {
            /* istanbul ignore if */
            {
                var expression = parseText(staticStyle, options.delimiters);
                if(expression) {
                    warn(
                        "style=\"" + staticStyle + "\": " +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div style="{{ val }}">, use <div :style="val">.'
                    );
                }
            }
            // 如果AST树节点对应的标签上的style属性是静态的，则给AST树节点对象添加staticStyle属性
            el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
        }

        var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
        // 如果AST树节点对应的标签上的style属性是动态绑定的，则给AST树节点对象添加styleBinding属性
        if(styleBinding) {
            el.styleBinding = styleBinding;
        }
    }

    /**
     * 相当于genStyle方法， 将AST树节点对象的staticStyle或者styleBinding属性解析为json串
     * @param el        AST树节点对象
     * @return {string}
     */
    function genData$1(el) {
        var data = '';
        if(el.staticStyle) {
            data += "staticStyle:" + (el.staticStyle) + ",";
        }
        if(el.styleBinding) {
            data += "style:(" + (el.styleBinding) + "),";
        }
        return data
    }

    var style$1 = {
        staticKeys : ['staticStyle'],
        // 可以理解为processStyle， like processIf
        transformNode : transformNode$1,
        // 可以理解为genStyle， like genIf
        genData : genData$1
    };

    var modules$1 = [
        klass$1,
        style$1
    ];

    /*  */
    /**
     * v-text指令， 会被解析成{name : "textContent", value : "_s(*****)"},
     * 然后添加到v-text指令属性所在的标签对应的AST树节点的props数组中。
     * 在patch过程中，会将dom元素的textContent属性更新为dir.value对应的字符串
     * @param el        标签对应的AST树节点对象
     * @param dir       指令对象
     */
    function text(el, dir) {
        if(dir.value) {
            // _s, toString方法的别名
            addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
        }
    }

    /*  */
    /**
     * v-html指令, 会被解析成{name : "innerHTML", value : "_s(******)"},
     * 然后添加到v-html指令属性所在的标签对应的AST树节点的props数组中。
     * 在patch过程中，会更新dom元素的innerHTML属性为dir.value对应的字符串
     * @param el
     * @param dir
     */
    function html(el, dir) {
        if(dir.value) {
            // _s， toString方法的别名
            addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
        }
    }

    var directives$1 = {
        // 对应v-model处理函数
        model : model,
        // 对应v-text处理函数
        text : text,
        // 对应v-html的处理函数
        html : html
    };

    /*  */
    // 判断是否是一元标签
    var isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    );

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    // 判断是否是左闭合标签（无需写右闭合标签，会自动闭合）
    var canBeLeftOpenTag = makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    );

    // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
    // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
    var isNonPhrasingTag = makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track'
    );

    /*  */

    var baseOptions = {
        expectHTML : true,
        modules : modules$1,
        directives : directives$1,
        // 是否位于pre标签中
        isPreTag : isPreTag,
        // 是否是一元标签
        isUnaryTag : isUnaryTag,
        mustUseProp : mustUseProp,
        // 是否是左闭合标签（无需写明右闭合标签，）
        canBeLeftOpenTag : canBeLeftOpenTag,
        // 是否是保留的标签
        isReservedTag : isReservedTag,
        // 获取标签命名空间
        getTagNamespace : getTagNamespace,
        staticKeys : genStaticKeys(modules$1)
    };

    /*  */

    var decoder;

    var he = {
        // 解析html标签的文本内容
        decode : function decode(html) {
            decoder = decoder || document.createElement('div');
            decoder.innerHTML = html;
            return decoder.textContent
        }
    };

    /**
     * Not type-checking this file because it's mostly vendor code.
     */

    /*!
     * HTML Parser By John Resig (ejohn.org)
     * Modified by Juriy "kangax" Zaytsev
     * Original code by Erik Arvidsson, Mozilla Public License
     * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
     */

    // Regular Expressions for parsing tags and attributes
    var singleAttrIdentifier = /([^\s"'<>/=]+)/;
    var singleAttrAssign = /(?:=)/;
    var singleAttrValues = [
        // attr value double quotes
        /"([^"]*)"+/.source,
        // attr value, single quotes
        /'([^']*)'+/.source,
        // attr value, no quotes
        /([^\s"'=<>`]+)/.source
    ];
    var attribute = new RegExp(
        '^\\s*' + singleAttrIdentifier.source +
        '(?:\\s*(' + singleAttrAssign.source + ')' +
        '\\s*(?:' + singleAttrValues.join('|') + '))?'
    );

    // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
    // but for Vue templates we can enforce a simple charset
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
    // 正则表达式， 开始标签
    var startTagOpen = new RegExp('^<' + qnameCapture);
    // 正则表达式， 开始标签的结束位置，like “<div>中的>”, "<input/> 中的/>"
    var startTagClose = /^\s*(\/?)>/;
    // 正则表达式，结束标签， like"</div>"
    var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
    // 正则表达式， 判断是否是 doctype
    var doctype = /^<!DOCTYPE [^>]+>/i;
    // 正则表达式， 判断是否是注释
    var comment = /^<!--/;
    // 正则表达式， html中的条件注释
    var conditionalComment = /^<!\[/;

    var IS_REGEX_CAPTURING_BROKEN = false;
    'x'.replace(/x(.)?/g, function(m, g) {
        IS_REGEX_CAPTURING_BROKEN = g === '';
    });

    // Special Elements (can contain anything)
    var isPlainTextElement = makeMap('script,style,textarea', true);
    var reCache = {};
    // 转义字符
    var decodingMap = {
        '&lt;' : '<',
        '&gt;' : '>',
        '&quot;' : '"',
        '&amp;' : '&',
        '&#10;' : '\n'
    };
    var encodedAttr = /&(?:lt|gt|quot|amp);/g;
    var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

    // #5992
    // 是否是忽略忽略换行符的标签， pre、textarea标签不会忽略开始的换行符
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    /**
     * 是否应该忽略开始的换行符， 如果是标签是pre、textarea，且html模板字符串以“\n”开始， 则不能忽略换行符
     * @param tag              标签名称
     * @param html             标签tag的innerHtml
     * @returns {*|boolean}
     */
    var shouldIgnoreFirstNewline = function(tag, html) {
        return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
    };

    function decodeAttr(value, shouldDecodeNewlines) {
        var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, function(match) {
            return decodingMap[match];
        })
    }

    /**
     * 解析html字符串，返回生成的AST树结构类型的对象
     * @param html
     * @param options
     */
    function parseHTML(html, options) {
        // 临时栈，存储的是标签的描述对象, like{tag : tagName, lowerCasedTag : tagName.toLowerCase(), attrs : [...]}
        var stack = [];
        var expectHTML = options.expectHTML;
        // 是否为一元标签
        var isUnaryTag$$1 = options.isUnaryTag || no;
        // 是否为自动闭合标签
        var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
        // html模板字符串下标
        var index = 0;
        // 剩余的html模板字符串
        var last,
            // 上一个标签
            lastTag;

        // 遍历html模板字符串，解析字符串的标签、文本内容
        while(html) {
            // 需要解析的剩余html字符串
            last = html;
            // Make sure we're not in a plaintext content element like script/style
            if(!lastTag || !isPlainTextElement(lastTag)) {
                if(shouldIgnoreFirstNewline(lastTag, html)) {
                    // 解析html模板字符串的时候， 如果lastTag标签是pre、textarea，且标签中的内容以换行符“\n”开始，则跳过换行符
                    advance(1);
                }
                // 标签内，文本结束的位置123</div>, textEnd为2
                var textEnd = html.indexOf('<');
                if(textEnd === 0) {
                    // Comment:
                    // 判断html模板字符串是否是注释
                    if(comment.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if(commentEnd >= 0) {
                            if(options.shouldKeepComment) {
                                options.comment(html.substring(4, commentEnd));
                            }
                            advance(commentEnd + 3);
                            continue
                        }
                    }

                    // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                    // 判断待解析的html模板字符串是否以条件注释
                    if(conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if(conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }

                    // Doctype:
                    var doctypeMatch = html.match(doctype);
                    if(doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }

                    // End tag:
                    // 判断待解析的html模板字符串是否结束标签开始，like</div>****
                    var endTagMatch = html.match(endTag);
                    // 如果待解析的html模板字符串是以结束标签开始？？
                    if(endTagMatch) {
                        var curIndex = index;
                        advance(endTagMatch[0].length);
                        // 解析右闭合标签
                        parseEndTag(endTagMatch[1], curIndex, index);
                        continue
                    }

                    // Start tag:
                    // 解析开始标签， 返回开始标签的对象，包含标签的名称、属性、开始位置、结束位置以及是否是一元标签
                    var startTagMatch = parseStartTag();
                    if(startTagMatch) {
                        // 处理开始标签的解析对象
                        handleStartTag(startTagMatch);
                        continue
                    }
                }

                var text = (void 0), rest = (void 0), next = (void 0);
                // 如果标签内部存在文本内容， 获取文本内容
                if(textEnd >= 0) {
                    rest = html.slice(textEnd);
                    // ??
                    while(
                        !endTag.test(rest) &&
                        !startTagOpen.test(rest) &&
                        !comment.test(rest) &&
                        !conditionalComment.test(rest)
                        ) {
                        // < in plain text, be forgiving and treat it as text
                        next = rest.indexOf('<', 1);
                        if(next < 0) {
                            break
                        }
                        textEnd += next;
                        rest = html.slice(textEnd);
                    }
                    // 获取标签内部文本内容 ，like <div>123</div>, 文本内容为123
                    text = html.substring(0, textEnd);
                    advance(textEnd);
                }

                if(textEnd < 0) {
                    text = html;
                    html = '';
                }
                // 处理文本内容
                if(options.chars && text) {
                    options.chars(text);
                }
            } else {
                var endTagLength = 0;
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                var rest$1 = html.replace(reStackedTag, function(all, text, endTag) {
                    endTagLength = endTag.length;
                    if(!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                        text = text
                            .replace(/<!--([\s\S]*?)-->/g, '$1')
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }
                    if(shouldIgnoreFirstNewline(stackedTag, text)) {
                        text = text.slice(1);
                    }
                    if(options.chars) {
                        options.chars(text);
                    }
                    return ''
                });
                index += html.length - rest$1.length;
                html = rest$1;
                parseEndTag(stackedTag, index - endTagLength, index);
            }

            if(html === last) {
                options.chars && options.chars(html);
                if("development" !== 'production' && !stack.length && options.warn) {
                    options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
                }
                break
            }
        }

        // Clean up any remaining tags
        parseEndTag();
        // 前进， 向后定位， 重新截取剩余html模板字符串
        function advance(n) {
            index += n;
            html = html.substring(n);
        }

        /**
         * 解析开始标签， 解析html模板字符中的开始标签，like “<div id='app1'>”
         * 返回一个开始标签的描述对象{"tagName" : "div",
         *                           attrs:[](属性数组),
         *                           unarySlash : ""(判断是否是一元标签,<input/>),
         *                           start:0(html模板字符串中的开始位置),
         *                           end:***(html模板字符串中的结束位置)}
         * @returns {{tagName: *, attrs: Array, start: number}}
         */
        function parseStartTag() {
            var start = html.match(startTagOpen);
            if(start) {
                var match = {
                    tagName : start[1],
                    attrs : [],
                    start : index
                };
                advance(start[0].length);
                var end, attr;
                while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr);
                }
                if(end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }

        /**
         * 处理开始标签解析生成的对象
         * @param match 开始标签字符串解析生成的对象， like {{tagName: *, attrs: Array, start: number}}
         */
        function handleStartTag(match) {
            // 开始标签的名称，比如div
            var tagName = match.tagName;
            // 开始标签是否是一元标签， 比如 <input />
            var unarySlash = match.unarySlash;

            if(expectHTML) {
                if(lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    // 如果上一个标签是p，由于p是可自动闭合标签， 解析p标签的结束部分
                    parseEndTag(lastTag);
                }
                if(canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                    // 如果当前标签是自动闭合标签，且上一个标签和当前处理的标签是一样的， 解析当前标签的结束部分？？
                    parseEndTag(tagName);
                }
            }
            // 判断当前标签是否是一元标签
            var unary = isUnaryTag$$1(tagName) || !!unarySlash;

            var l = match.attrs.length;
            var attrs = new Array(l);
            for(var i = 0; i < l; i++) {
                var args = match.attrs[i];
                // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
                if(IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if(args[3] === '') {
                        delete args[3];
                    }
                    if(args[4] === '') {
                        delete args[4];
                    }
                    if(args[5] === '') {
                        delete args[5];
                    }
                }
                var value = args[3] || args[4] || args[5] || '';
                attrs[i] = {
                    name : args[1],
                    value : decodeAttr(
                        value,
                        options.shouldDecodeNewlines
                    )
                };
            }
            // 如果当前标签不是一元标签，需要将当前标签进栈
            if(!unary) {
                stack.push({tag : tagName, lowerCasedTag : tagName.toLowerCase(), attrs : attrs});
                // 缓存当前标签
                lastTag = tagName;
            }

            if(options.start) {
                // 解析标签，生成AST树节点，用于构造Vue 虚拟dom节点
                options.start(tagName, attrs, unary, match.start, match.end);
            }
        }

        /**
         * 解析右闭合标签
         * @param tagName    闭合标签的名称
         * @param start      闭合标签在html模板字符串中的开始位置
         * @param end        闭合标签在html模板字符串中的结束位置
         */
        function parseEndTag(tagName, start, end) {
            var pos, lowerCasedTagName;
            if(start == null) {
                start = index;
            }
            if(end == null) {
                end = index;
            }

            if(tagName) {
                lowerCasedTagName = tagName.toLowerCase();
            }

            // Find the closest opened tag of the same type
            // 找到当前标签对应的左标签
            if(tagName) {
                for(pos = stack.length - 1; pos >= 0; pos--) {
                    // 定位当前闭合标签对应的左开始标签在stack中的位置
                    if(stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            } else {
                // If no tag name is provided, clean shop
                pos = 0;
            }

            if(pos >= 0) {
                // Close all the open elements, up the stack
                for(var i = stack.length - 1; i >= pos; i--) {
                    if("development" !== 'production' &&
                        (i > pos || !tagName) &&
                        options.warn
                    ) {
                        options.warn(
                            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
                        );
                    }
                    if(options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            } else if(lowerCasedTagName === 'br') {
                if(options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if(lowerCasedTagName === 'p') {
                if(options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if(options.end) {
                    options.end(tagName, start, end);
                }
            }
        }
    }

    /*  */
    // 正则表达式， 匹配@ 或者 v-on：
    var onRE = /^@|^v-on:/;
    // 正则表达式， 匹配"v-"、"@(v-on)"、":(v-bind)"
    var dirRE = /^v-|^@|^:/;
    // 正则表达式， 匹配 *** in ***， 或者 *** of ***
    var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
    // 判断v-for指令的值 item in items 中item 是不是 (item, index)格式
    var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

    var argRE = /:(.*)$/;
    // 正则表达式，匹配 ":"或者"v-bind:"
    var bindRE = /^:|^v-bind:/;
    // 正则表达式， 匹配“.***”
    var modifierRE = /\.[^.]+/g;

    var decodeHTMLCached = cached(he.decode);

    // configurable state
    var warn$2;
    var delimiters;
    var transforms;
    var preTransforms;
    var postTransforms;
    var platformIsPreTag;
    var platformMustUseProp;
    var platformGetTagNamespace;

    /**
     * Convert HTML string to AST.
     * 将html模板字符串解析为AST对象
     */
    function parse(template,
                   options) {
        warn$2 = options.warn || baseWarn;
        // 判断是否是“pre”标签的方法
        platformIsPreTag = options.isPreTag || no;
        // 判断是否必须使用prop属性的方法
        platformMustUseProp = options.mustUseProp || no;
        // 获取标签命名空间的方法
        platformGetTagNamespace = options.getTagNamespace || no;
        // transfroms为klass$1,style$1对象中tragsformNode方法组成的数组
        transforms = pluckModuleFunction(options.modules, 'transformNode');
        // preTransforms为preTransformNode方法组成的数组
        preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
        // postTransforms为postTransformNode方法组成数组
        postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

        delimiters = options.delimiters;
        // 堆栈， 存储的是标签解析生成的AST树节点对象，对象类型为{tag:"div", attrs:[...], childrend:[...], parent:{}....}
        var stack = [];
        var preserveWhitespace = options.preserveWhitespace !== false;
        // html模板字符串最后会解析成为一个树形结构对象， 需要有一个根节点
        var root;
        var currentParent;
        // 是否位于有v-pre指令的标签内。如果一个标签上有v-pre指令，表示这个节点和它的子节点不需要编译。
        // 默认将要解析的标签的父标签没有v-pre指令
        var inVPre = false;
        // 是否位于pre标签内
        var inPre = false;
        var warned = false;

        function warnOnce(msg) {
            if(!warned) {
                warned = true;
                warn$2(msg);
            }
        }

        /**
         * pre状态处理。当解析右闭合标签的时候，需要更新inVPre、inPre状态
         * @param element
         */
        function endPre(element) {
            // check pre state
            // 如果当前标签上有v-pre指令，则inVPre为true。但是如果标签结束了，则inVPre为false
            if(element.pre) {
                inVPre = false;
            }
            // 如果当前标签是pre标签，若结束， 则inPre为false
            if(platformIsPreTag(element.tag)) {
                inPre = false;
            }
        }
        // 解析html模板字符串
        parseHTML(template, {
            warn : warn$2,
            expectHTML : options.expectHTML,
            // 方法， 用于判断标签是否是一元标签
            isUnaryTag : options.isUnaryTag,
            // 方法， 用于判断标签是否是自动闭合标签
            canBeLeftOpenTag : options.canBeLeftOpenTag,
            // 方法，判断是否忽略换行符
            shouldDecodeNewlines : options.shouldDecodeNewlines,
            shouldKeepComment : options.comments,
            /**
             * 解析开始标签，生成一个AST树节点对象，用于之后生成虚拟dom节点
             * @param tag    标签的名称
             * @param attrs  当前标签的属性
             * @param unary  是否为一元标签，like<input/>
             */
            start : function start(tag, attrs, unary) {
                // check namespace.
                // inherit parent ns if there is one
                // 检测命名空间？？
                var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

                // handle IE svg bug
                /* istanbul ignore if */
                if(isIE && ns === 'svg') {
                    attrs = guardIESVGBug(attrs);
                }
                // 标签对应的AST树节点对象
                var element = {
                    // 节点类型
                    type : 1,
                    // 标签名称
                    tag : tag,
                    // 标签属性list
                    attrsList : attrs,
                    // 标签属性map
                    attrsMap : makeAttrsMap(attrs),
                    // 父节点
                    parent : currentParent,
                    // 子节点
                    children : []
                };
                if(ns) {
                    element.ns = ns;
                }

                if(isForbiddenTag(element) && !isServerRendering()) {
                    element.forbidden = true;
                    "development" !== 'production' && warn$2(
                        'Templates should only be responsible for mapping the state to the ' +
                        'UI. Avoid placing tags with side-effects in your templates, such as ' +
                        "<" + tag + ">" + ', as they will not be parsed.'
                    );
                }

                // apply pre-transforms
                for(var i = 0; i < preTransforms.length; i++) {
                    preTransforms[i](element, options);
                }
                // 如果当前标签的父标签没有v-pre指令，表明当前标签以及子标签需要编译，就有必要处理当前标签上的v-pre指令
                if(!inVPre) {
                    // 判断当前开始标签上上否有v-pre指令。
                    processPre(element);
                    if(element.pre) {
                        // 表明当前开始标签中的子标签不需要再进行编译了
                        inVPre = true;
                    }
                }
                // 判断当前标签是否是pre标签， 如果是，表示接下来解析的html内容位于pre标签内部
                if(platformIsPreTag(element.tag)) {
                    inPre = true;
                }
                // 如果当前标签上有v-pre指令
                if(inVPre) {
                    // 处理当前标签上的标准属性
                    processRawAttrs(element);
                } else {
                    // 处理的先后顺序代表了指令的优先级？？
                    // 判断标签上是否有v-for指令， 如果有，给element添加属性for标志属性
                    processFor(element);
                    // 判断标签上是否有v-if指令。如果有，给element添加if标志属性及ifConditons数组
                    processIf(element);
                    // 判断标签上是否有v-once指令。如果有，给element添加once标志属性
                    processOnce(element);
                    // 判断标签上是由有:key指令，如果有，给AST树节点添加key标志属性，值为:key指令属性对应的值
                    processKey(element);

                    // determine whether this is a plain element after
                    // removing structural attributes
                    element.plain = !element.key && !attrs.length;
                    // 处理标签上的ref指令
                    processRef(element);
                    // 处理组件模板中的slot标签或者标签上的slot属性
                    processSlot(element);
                    // 处理标签上的is指令
                    processComponent(element);
                    // 分别判断标签上是否有使用v-bind指令绑定的class，style属性
                    for(var i$1 = 0; i$1 < transforms.length; i$1++) {
                        transforms[i$1](element, options);
                    }
                    // 处理标签上的v-text, v-html, v-on, v-bind, v-cloak, v-model指令
                    processAttrs(element);
                }

                /**
                 * 校验根节点。 根节点对应的标签不能是slot、template，标签上也不能有v-for指令
                 * @param el
                 */
                function checkRootConstraints(el) {
                    {
                        if(el.tag === 'slot' || el.tag === 'template') {
                            warnOnce(
                                "Cannot use <" + (el.tag) + "> as component root element because it may " +
                                'contain multiple nodes.'
                            );
                        }
                        if(el.attrsMap.hasOwnProperty('v-for')) {
                            warnOnce(
                                'Cannot use v-for on stateful component root element because ' +
                                'it renders multiple elements.'
                            );
                        }
                    }
                }

                // tree management
                // html字符串最后会编译成一个树形结构的对象，需要确定根节点
                if(!root) {
                    // 如果还没有根节点， 确定根节点
                    root = element;
                    checkRootConstraints(root);
                } else if(!stack.length) {
                    // allow root elements with v-if, v-else-if and v-else
                    if(root.if && (element.elseif || element.else)) {
                        checkRootConstraints(element);
                        addIfCondition(root, {
                            exp : element.elseif,
                            block : element
                        });
                    } else {
                        warnOnce(
                            "Component template should contain exactly one root element. " +
                            "If you are using v-if on multiple elements, " +
                            "use v-else-if to chain them instead."
                        );
                    }
                }
                if(currentParent && !element.forbidden) {
                    // 如果标签上有指令v-else，v-else-if
                    if(element.elseif || element.else) {
                        processIfConditions(element, currentParent);
                    } else if(element.slotScope) { // scoped slot
                        currentParent.plain = false;
                        var name = element.slotTarget || '"default"';
                        (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
                    } else {
                        // 父标签对象和子标签对象之间建立关联
                        currentParent.children.push(element);
                        element.parent = currentParent;
                    }
                }
                // 解析标签的时候，如果标签是一元标签， 那么该标签内部不会有子标签，也就不需要进栈；
                // 如果标签不是一元标签的话，该标签内容可能会有子标签，需要先将改标签进栈
                if(!unary) {
                    // 如果当前标签不是一元标签，将当前标签作为父元素
                    currentParent = element;
                    stack.push(element);
                } else {
                    endPre(element);
                }
                // apply post-transforms
                for(var i$2 = 0; i$2 < postTransforms.length; i$2++) {
                    postTransforms[i$2](element, options);
                }
            },
            /**
             * 解析右闭合标签
             * 遇到右闭合标签的时候，表明当前标签中没有子节点。将stack中当前标签对应的节点出栈，为下一个元素添加子节点
             */
            end : function end() {
                // remove trailing whitespace
                // 当前右闭合标签对应的树节点类型对象
                var element = stack[stack.length - 1];
                // 当前闭合标签对应的树节点类型对象的最后一个子节点
                var lastNode = element.children[element.children.length - 1];
                if(lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
                    element.children.pop();
                }
                // pop stack
                // 当前标签没有子节点，标签对应的树节点不需要再次添加子节点， 可以出栈
                stack.length -= 1;
                currentParent = stack[stack.length - 1];
                endPre(element);
            },
            // 处理标签中的文本内容
            chars : function chars(text) {
                // 注意：标签内的文本内容， 前提是文本内容处于标签内， 如果此时文本没有父标签，则没有任何意义
                if(!currentParent) {
                    {
                        if(text === template) {
                            warnOnce(
                                'Component template requires a root element, rather than just text.'
                            );
                        } else if((text = text.trim())) {
                            warnOnce(
                                ("text \"" + text + "\" outside root element will be ignored.")
                            );
                        }
                    }
                    return
                }
                // IE textarea placeholder bug
                /* istanbul ignore if */
                if(isIE &&
                    currentParent.tag === 'textarea' &&
                    currentParent.attrsMap.placeholder === text
                ) {
                    return
                }
                // currentParent为父标签对应的AST树节点对象
                var children = currentParent.children;
                // 如果text不为空，需要将text解析为标准的文本内容（转义字符啥的吗？）
                text = inPre || text.trim()
                    ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
                    // only preserve whitespace if its not right after a starting tag
                    : preserveWhitespace && children.length ? ' ' : '';
                if(text) {
                    var expression;
                    if(!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
                        children.push({
                            type : 2,
                            expression : expression,
                            text : text
                        });
                    } else if(text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        children.push({
                            type : 3,
                            text : text
                        });
                    }
                }
            },
            comment : function comment(text) {
                currentParent.children.push({
                    type : 3,
                    text : text,
                    isComment : true
                });
            }
        });
        // 解析html模板字符串，返回生成的AST树根节点
        return root
    }

    /**
     * 判断html标签上是否有v-pre指令
     * @param el  html标签对应的对象
     */
    function processPre(el) {
        if(getAndRemoveAttr(el, 'v-pre') != null) {
            // 设置一个标志位，表明当前标签上有v-pre指令
            el.pre = true;
        }
    }

    /**
     * 处理标签上的合法属性，like id， name， title等dom元素自带的属性
     * @param el
     */
    function processRawAttrs(el) {
        var l = el.attrsList.length;
        if(l) {
            var attrs = el.attrs = new Array(l);
            for(var i = 0; i < l; i++) {
                attrs[i] = {
                    name : el.attrsList[i].name,
                    value : JSON.stringify(el.attrsList[i].value)
                };
            }
        } else if(!el.pre) {
            // non root node in pre blocks with no attributes
            el.plain = true;
        }
    }

    /**
     * 处理标签上的 :key 指令， like <ul> <li v-for="item in items" :key="item.id">...</li> </ul>
     * @param el
     */
    function processKey(el) {
        var exp = getBindingAttr(el, 'key');
        if(exp) {
            if("development" !== 'production' && el.tag === 'template') {
                warn$2("<template> cannot be keyed. Place the key on real elements instead.");
            }
            el.key = exp;
        }
    }

    /**
     * 处理标签上的 ref 指令， like <p ref="p">hello</p>
     * @param el
     */
    function processRef(el) {
        var ref = getBindingAttr(el, 'ref');
        if(ref) {
            el.ref = ref;
            el.refInFor = checkInFor(el);
        }
    }

    /**
     * 处理标签上的v-for指令， 根据v-for执行属性的属性值 （item in items） 或者 （item of items），
     * 分别给v-for指令所在标签对应的AST树节点对象添加 {for ： “items”， alias : "item"}
     * @param el  标签对应的AST树节点对象
     */
    function processFor(el) {
        // v-for执行属性的属性值， 一般为 item in items
        var exp;
        if((exp = getAndRemoveAttr(el, 'v-for'))) {
            // 判断exp是否是 *** in ***（数组）, 或者 *** of ***（对象）类型， 如果不是的话，给出警告
            var inMatch = exp.match(forAliasRE);
            if(!inMatch) {
                "development" !== 'production' && warn$2(
                    ("Invalid v-for expression: " + exp)
                );
                return
            }
            // 对应items
            el.for = inMatch[2].trim();
            // 对应item
            var alias = inMatch[1].trim();
            // 判断item中是否有iterator，即(item, index)
            var iteratorMatch = alias.match(forIteratorRE);
            if(iteratorMatch) {
                // (item, index) in items中的item
                el.alias = iteratorMatch[1].trim();
                // (item, index)中的index
                el.iterator1 = iteratorMatch[2].trim();
                if(iteratorMatch[3]) {
                    el.iterator2 = iteratorMatch[3].trim();
                }
            } else {
                el.alias = alias;
            }
        }
    }

    /**
     * 处理标签上的v-if、v-else、v-else-if指令
     * 如果标签上有v-if指令，添加ifCondition对象到标签对应的AST节点的ifConditions数组中，同时设置if标志；
     * 如果标签上有v-else指令，设置else标志；
     * 如果标签上有v-else-if指令， 设置v-else-if标志
     * @param el    标签对应的AST树节点
     */
    function processIf(el) {
        // 标签上v-if指令属性的属性值,为字符串表达式，like“123”， “type === ‘a’”
        var exp = getAndRemoveAttr(el, 'v-if');
        // 如果v-if指令属性对应的属性值不为空，给v-if指令所在的标签对应的AST树节点添加if属性
        if(exp) {
            el.if = exp;
            addIfCondition(el, {
                exp : exp,
                // 表示满足if条件后要显示的节点
                block : el
            });
        } else {
            if(getAndRemoveAttr(el, 'v-else') != null) {
                el.else = true;
            }
            var elseif = getAndRemoveAttr(el, 'v-else-if');
            if(elseif) {
                el.elseif = elseif;
            }
        }
    }

    /**
     *
     * @param el
     * @param parent
     */
    function processIfConditions(el, parent) {
        // 找到离el最近的的元素节点prev
        var prev = findPrevElement(parent.children);
        // 如果prev元素节点上有if指令，表明v-else、v-else-if有效， 添加ifCondition对象到v-if指令所在的元素对应的AST节点的ifConditions数组中
        if(prev && prev.if) {
            addIfCondition(prev, {
                exp : el.elseif,
                // 满足elseif添加要显示的节点
                block : el
            });
        } else {
            warn$2(
                "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
                "used on element <" + (el.tag) + "> without corresponding v-if."
            );
        }
    }

    /**
     * 找到当前父节点的最后一个元素节点
     * @param children   父元素的子元素
     * @return {*}
     */
    function findPrevElement(children) {
        var i = children.length;
        // 倒序遍历父节点的子节点，返回第一个元素节点
        while(i--) {
            if(children[i].type === 1) {
                return children[i]
            } else {
                if("development" !== 'production' && children[i].text !== ' ') {
                    warn$2(
                        "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
                        "will be ignored."
                    );
                }
                children.pop();
            }
        }
    }

    /**
     * 将v-if指令解析后成ifCondition对象，添加到AST树节点的ifConditions数组中
     * ifConditions对应v-if，v-else-if， v-else解析后的ifCondition对象，ifCondition中的block表明满足当前添加下要显示的元素
     * @param el          v-if指令所在的标签对应的AST树节点
     * @param condition   v-if指令解析后的ifCondition对象{exp : "***"(v-if属性值),block : el}
     */
    function addIfCondition(el, condition) {
        if(!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push(condition);
    }

    /**
     * 判断标签上是否有v-once指令，如果有，给标签对应的AST树对象设置once标志位
     * @param el      v-once指令所在标签对应的AST树节点对象
     */
    function processOnce(el) {
        var once$$1 = getAndRemoveAttr(el, 'v-once');
        if(once$$1 != null) {
            el.once = true;
        }
    }

    /**
     * 处理组件模板中的slot标签(插槽)或者处理标签上的slot属性
     * @param el    标签对应的AST树节点对象
     */
    function processSlot(el) {
        // 处理组件模板中的slot标签
        if(el.tag === 'slot') {
            // 获取slot插槽的名字（判断slot是否是具名插槽还是默认插槽）
            el.slotName = getBindingAttr(el, 'name');
            if("development" !== 'production' && el.key) {
                warn$2(
                    "`key` does not work on <slot> because slots are abstract outlets " +
                    "and can possibly expand into multiple elements. " +
                    "Use the key on a wrapping element instead."
                );
            }
        } else {
            // 处理标签上的slot属性
            // slotTarget对应标签上的slot属性的属性值
            var slotTarget = getBindingAttr(el, 'slot');
            if(slotTarget) {
                // 找到当前元素的插槽目标
                el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
            }
            if(el.tag === 'template') {
                el.slotScope = getAndRemoveAttr(el, 'scope');
            }
        }
    }

    /**
     * 处理标签上的 is 指令， like <tr is="my-row"></tr>              tr对应的组件名为my-row
     *                   <component is="component1"></component>     component对应的组件名实际为component1
     * @param el      标签对应的AST树节点对象
     */
    function processComponent(el) {
        var binding;
        // 判断标签上是否有被绑定的is指令
        if((binding = getBindingAttr(el, 'is'))) {
            // 获取标签对应的组件名称，binding
            el.component = binding;
        }
        if(getAndRemoveAttr(el, 'inline-template') != null) {
            el.inlineTemplate = true;
        }
    }

    /**
     * 处理元素上的属性
     * 如果属性是vue指令类型的，like（v-text，v-on等）：
     *     如果属性是v-bind：
     *     如果属性是v-on：
     *     如果属性是v-text、v-html、v-model、v-cloak、v-show等：
     *          需要将指令属性转化为对应的指令对象，将指令对象添加到AST树节点的directives数组中
     * 如果属性不是绑定的属性， 则查看属性值是否是表达式还是只是普通值
     * @param el
     */
    function processAttrs(el) {
        // list代表元素的属性列表， 像 v-if、v-for、v-pre等指令属性已经被移除掉
        var list = el.attrsList;
        var i, l, name, rawName, value, modifiers, isProp;
        for(i = 0, l = list.length; i < l; i++) {
            // 属性名
            name = rawName = list[i].name;
            // 属性值
            value = list[i].value;
            // 判断属性是否是v-***、@(v-on)、:(v-bind)格式的
            if(dirRE.test(name)) {
                // mark element as dynamic
                // 标注元素是动态的，被绑定的
                el.hasBindings = true;
                // 解析绑定修饰符,like v-on:click.stop.prevent.self.once.left
                //               like v-bind:title.prop = "****"
                modifiers = parseModifiers(name);
                // 如果有绑定修饰符，去除绑定修饰符
                if(modifiers) {
                    name = name.replace(modifierRE, '');
                }
                // 判断是否是v-bind绑定
                if(bindRE.test(name)) { // v-bind
                    // v-bind绑定的属性
                    name = name.replace(bindRE, '');
                    // v-bind绑定的属性对应的表达式
                    value = parseFilters(value);
                    // 判断v-bind绑定的属性是否是prop属性？？
                    isProp = false;
                    if(modifiers) {
                        if(modifiers.prop) {
                            // 如果v-bind指令有修饰符prop
                            isProp = true;
                            name = camelize(name);
                            if(name === 'innerHtml') {
                                name = 'innerHTML';
                            }
                        }
                        // 如果v-bind指令有修饰符camel，将 kebab-case 特性名转换为 camelCase
                        if(modifiers.camel) {
                            name = camelize(name);
                        }
                        // 如果v-bind指令有修饰符sync
                        if(modifiers.sync) {
                            addHandler(
                                el,
                                ("update:" + (camelize(name))),
                                genAssignmentCode(value, "$event")
                            );
                        }
                    }
                    if(!el.component && (
                            isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)
                        )) {
                        addProp(el, name, value);
                    } else {
                        addAttr(el, name, value);
                    }
                } else if(onRE.test(name)) { // v-on 判断是否是v-on绑定
                    // 获取绑定事件的类型
                    name = name.replace(onRE, '');
                    // 添加事件的处理方式
                    addHandler(el, name, value, modifiers, false, warn$2);
                } else { // normal directives 如果是普通的指令，like v-text、v-html、v-model、v-clock、v-show等
                    //
                    name = name.replace(dirRE, '');
                    // parse arg
                    var argMatch = name.match(argRE);
                    var arg = argMatch && argMatch[1];
                    if(arg) {
                        name = name.slice(0, -(arg.length + 1));
                    }
                    // 将标签上的指令属性编译为指令对象，并添加到标签对应的AST树节点对象的directives数组中
                    addDirective(el, name, rawName, value, arg, modifiers);
                    if("development" !== 'production' && name === 'model') {
                        checkForAliasModel(el, value);
                    }
                }
            } else {
                // literal attribute
                // 如果属实不是绑定的属性
                {
                    var expression = parseText(value, delimiters);
                    if(expression) {
                        warn$2(
                            name + "=\"" + value + "\": " +
                            'Interpolation inside attributes has been removed. ' +
                            'Use v-bind or the colon shorthand instead. For example, ' +
                            'instead of <div id="{{ val }}">, use <div :id="val">.'
                        );
                    }
                }
                addAttr(el, name, JSON.stringify(value));
            }
        }
    }

    /**
     * 检查AST树节点是否位于v-for指令内
     * @param el    AST树节点对象
     * @return {boolean}
     */
    function checkInFor(el) {
        var parent = el;
        while(parent) {
            if(parent.for !== undefined) {
                return true
            }
            parent = parent.parent;
        }
        return false
    }

    /**
     * 解析绑定修饰符，like v-on:click.stop.prevent.once.self.right
     * @param name
     * @return {{}}
     */
    function parseModifiers(name) {
        var match = name.match(modifierRE);
        if(match) {
            var ret = {};
            match.forEach(function(m) {
                ret[m.slice(1)] = true;
            });
            return ret
        }
    }

    function makeAttrsMap(attrs) {
        var map = {};
        for(var i = 0, l = attrs.length; i < l; i++) {
            if(
                "development" !== 'production' &&
                map[attrs[i].name] && !isIE && !isEdge
            ) {
                warn$2('duplicate attribute: ' + attrs[i].name);
            }
            map[attrs[i].name] = attrs[i].value;
        }
        return map
    }

    // for script (e.g. type="x/template") or style, do not decode content
    /**
     * 判断AST树节点对应的标签是否是文本标签？？
     * @param el      AST树节点
     * @returns {boolean}
     */
    function isTextTag(el) {
        return el.tag === 'script' || el.tag === 'style'
    }

    /**
     * 判断AST树节点对应的标签是否是被禁止的？？
     * @param el     AST树节点
     * @returns {boolean}
     */
    function isForbiddenTag(el) {
        return (
            el.tag === 'style' ||
            (el.tag === 'script' && (
                !el.attrsMap.type ||
                el.attrsMap.type === 'text/javascript'
            ))
        )
    }

    var ieNSBug = /^xmlns:NS\d+/;
    var ieNSPrefix = /^NS\d+:/;

    /* istanbul ignore next */
    function guardIESVGBug(attrs) {
        var res = [];
        for(var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if(!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr);
            }
        }
        return res
    }

    function checkForAliasModel(el, value) {
        var _el = el;
        while(_el) {
            if(_el.for && _el.alias === value) {
                warn$2(
                    "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                    "You are binding v-model directly to a v-for iteration alias. " +
                    "This will not be able to modify the v-for source array because " +
                    "writing to the alias is like modifying a function local variable. " +
                    "Consider using an array of objects and use v-model on an object property instead."
                );
            }
            _el = _el.parent;
        }
    }

    /*  */
    // 一个方法， 用于检测一个key是不是staticKey
    var isStaticKey;
    var isPlatformReservedTag;
    //  一个方法，调用，返回缓存中对应参数key的属性值
    var genStaticKeysCached = cached(genStaticKeys$1);

    /**
     * Goal of the optimizer: walk the generated template AST tree
     * and detect sub-trees that are purely static, i.e. parts of
     * the DOM that never needs to change.
     *
     * Once we detect these sub-trees, we can:
     *
     * 1. Hoist them into constants, so that we no longer need to
     *    create fresh nodes for them on each re-render;
     * 2. Completely skip them in the patching process.
     * 优化器的目标：遍历 解析html模板字符串生成的AST树， 检测静态子树（从来不会变动的DOM节点）
     * 当我们检测出静态子树，我们可以：
     *  1）把他们变为常量，这样我们就不需要再渲染时重新生成新的节点；
     *  2）在patch（修补）过程中跳过他们
     */
    // 优化解析html模板字符串生成的AST树对象
    function optimize(root, options) {
        if(!root) {
            return
        }
        // 返回一个方法， 检测一个key是不是staticKey，
        // staticKey：[attrs, attrsList, attrsMap, children, parent, plain, staticClass, staticStyle, tag, type]
        isStaticKey = genStaticKeysCached(options.staticKeys || '');
        isPlatformReservedTag = options.isReservedTag || no;
        // first pass: mark all non-static nodes.
        // 判断AST节点是否为静态节点，并且标注
        markStatic$1(root);
        // second pass: mark static roots.
        // 判断AST节点是否为静态根节点，并且标注
        markStaticRoots(root, false);
    }

    /**
     * 返回staticKey检测方法， 检验一个key值是不是staticKey
     * @param keys   attrs, attrsList, attrsMap, children, parent, plain, staticClass, staticStyle, tag, type
     */
    function genStaticKeys$1(keys) {
        return makeMap(
            'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
            (keys ? ',' + keys : '')
        )
    }

    /**
     * 判断AST树节点是否是静态节点。
     * 给AST树中的节点添加static属性，true为静态节点， false为非静态节点
     * @param node   AST树节点
     */
    function markStatic$1(node) {
        // 标签节点是否是静态的
        node.static = isStatic(node);
        if(node.type === 1) {
            // do not make component slot content static. this avoids
            // 1. components not able to mutate slot nodes
            // 2. static slot content fails for hot-reloading
            // 不要将组件slot内容标记为静态
            if(
                !isPlatformReservedTag(node.tag) &&
                node.tag !== 'slot' &&
                node.attrsMap['inline-template'] == null
            ) {
                return
            }
            // 递归遍历子节点，标记子节点是否为静态的， 如果有一个子节点是非静态的，那么当前节点就是非静态的
            for(var i = 0, l = node.children.length; i < l; i++) {
                var child = node.children[i];
                markStatic$1(child);
                if(!child.static) {
                    node.static = false;
                }
            }
            // 如果节点有ifConditions切不为空，则表明有v-if，v-if-else，v-else条件，需要把这些条件对应的节点也标注是否为静态节点
            // 如果符合if条件的节点中有一个是非静态的，那么 当前节点是非静态的
            if(node.ifConditions) {
                for(var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    var block = node.ifConditions[i$1].block;
                    markStatic$1(block);
                    if(!block.static) {
                        node.static = false;
                    }
                }
            }
        }
    }

    /**
     * 判断AST树节点是否是静态根节点。
     * 如果AST输节点是静态根节点，则staticRoot为true， 否则staticRoot为false
     * @param node       AST树节点
     * @param isInFor    isInFor,是处于v-for中的意思吗？
     */
    function markStaticRoots(node, isInFor) {
        if(node.type === 1) {
            if(node.static || node.once) {
                node.staticInFor = isInFor;
            }
            // For a node to qualify as a static root, it should have children that
            // are not just static text. Otherwise the cost of hoisting out will
            // outweigh the benefits and it's better off to just always render it fresh.
            if(node.static && node.children.length && !(
                    node.children.length === 1 &&
                    node.children[0].type === 3
                )) {
                // 如果一个节点是静态的，并且它有多个子节点，或者只有一个子节点（这个子节点不是文本类型）
                // 那么这个节点可以成为静态根节点，
                // 即如果一个节点不是static的，那它就不可能是静态根节点；
                //   如果一个节点是static，但是它没有子节点，那么这个节点不是静态根节点；
                //   如果一个节点是static，且有子节点，如果子节点的个数只有一个，而且这个节点是文本节点，那么这个节点不是静态根节点
                node.staticRoot = true;
                return
            } else {
                node.staticRoot = false;
            }
            if(node.children) {
                // 遍历子节点，判断子节点是否是静态根节点
                for(var i = 0, l = node.children.length; i < l; i++) {
                    markStaticRoots(node.children[i], isInFor || !!node.for);
                }
            }
            if(node.ifConditions) {
                // 根据if条件，判断if条件中的节点是否是静态根节点
                for(var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    markStaticRoots(node.ifConditions[i$1].block, isInFor);
                }
            }
        }
    }
    //检测节点是否是静态的
    function isStatic(node) {
        // 如果节点的类型为2，表明是表达式， 比如{{****}}生成的节点，type为2， 则节点不是静态的，返回false
        if(node.type === 2) { // expression
            return false
        }
        // 如果节点的类型为3， 表明是文本， 是静态的
        if(node.type === 3) { // text
            return true
        }
        // 如果节点的类型不为2/3， 一般为1
        return !!(node.pre || (
            // 如果节点是绑定的（标签上有v-bind,v-on,v-text, v-html, v-cloak, v-model,v-show指令）， 则不是静态节点
            !node.hasBindings && // no dynamic bindings
            // 如果节点对应的标签有v-if、v-for指令， 则不是静态节点
            !node.if && !node.for && // not v-if or v-for or v-else
            // 如果节点对应的标签是component、slot， 则不是静态节点
            !isBuiltInTag(node.tag) && // not a built-in
            // 如果节点对应的标签不是保留的， 则不是静态节点
            isPlatformReservedTag(node.tag) && // not a component
            // 如果节点是template（有v-for指令？？）的子节点， 则不是静态节点
            !isDirectChildOfTemplateFor(node) &&
            // 如果节点对象中的属性，有一个不是静态类型的属性， 则节点不是静态节点
            // static: attrs attrsList attrsMap children parent plain staticClass staticStyle tag type
            Object.keys(node).every(isStaticKey)
        ))
    }

    function isDirectChildOfTemplateFor(node) {
        while(node.parent) {
            node = node.parent;
            if(node.tag !== 'template') {
                return false
            }
            if(node.for) {
                return true
            }
        }
        return false
    }

    /*  */

    var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
    var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

    // keyCode aliases
    var keyCodes = {
        esc : 27,
        tab : 9,
        enter : 13,
        space : 32,
        up : 38,
        left : 37,
        right : 39,
        down : 40,
        'delete' : [8, 46]
    };

    // #4868: modifiers that prevent the execution of the listener
    // need to explicitly return null so that we can determine whether to remove
    // the listener for .once
    var genGuard = function(condition) {
        return ("if(" + condition + ")return null;");
    };

    var modifierCode = {
        // 相当于e.stopPropagation(),阻止冒泡
        stop : '$event.stopPropagation();',
        /// 相当于e.preventDefault(),阻止事件的默认操作
        prevent : '$event.preventDefault();',
        // 只当事件是从侦听器绑定的元素本身触发时才触发回调
        // 相当于if($event.target !== $event.currentTarget) return null;
        self : genGuard("$event.target !== $event.currentTarget"),
        //  点击ctrl，触发回调, if(!$event.ctrlKey) return null;
        ctrl : genGuard("!$event.ctrlKey"),
        // 点击shift键，触发回调, if(!event.shiftKey) return null
        shift : genGuard("!$event.shiftKey"),
        // 点击alt键， 触发回调, if(!$event.altKey) return null
        alt : genGuard("!$event.altKey"),
        // 点击meta键(相当于window键), 触发回调 if(!$event.metaKey) return null
        meta : genGuard("!$event.metaKey"),
        // 点击鼠标左键， 触发回调 if("button" in $event $$ $event.button !== "0")
        left : genGuard("'button' in $event && $event.button !== 0"),
        // 点击鼠标滚轮， 触发回调 if("button" in $event $$ $event.button !== "1")
        middle : genGuard("'button' in $event && $event.button !== 1"),
        // 点击鼠标右键， 触发回调 if("button" in $event $$ $event.button !== "2")
        right : genGuard("'button' in $event && $event.button !== 2")
    };

    /**
     * 将AST树节点对象的events对象解析为字符串， like on:{"click":function($event){*****}, "mouseout":"......"
     *                                          或者on:{"click":[function(e){}, function(e) {}], "mouseout":".............."}
     * @param events      AST树节对象的events对象
     * @param isNative    是否是原生的事件。绑定在自定义组件上的事件，由native标识符。如果为false，则事件上绑定在组件实例上
     *                     如果为true，则事件是绑定在组件实例对应的dom节点的根元素上
     * @param warn
     * @return {string}
     */
    function genHandlers(events,
                         isNative,
                         warn) {
        var res = isNative ? 'nativeOn:{' : 'on:{';
        // 遍历events对象中的事件对象
        for(var name in events) {
            // 事件对应的回调hanlder
            var handler = events[name];
            // #5330: warn click.right, since right clicks do not actually fire click events.
            if("development" !== 'production' &&
                name === 'click' &&
                handler && handler.modifiers && handler.modifiers.right
            ) {
                warn(
                    "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
                    "do not actually fire \"click\" events."
                );
            }
            res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
        }
        return res.slice(0, -1) + '}'
    }

    /**
     * 将事件对应的回调方法转化为代码字符串
     * @param name        事件类型
     * @param handler     事件对应的回调方法
     * @return {*}
     */
    function genHandler(name,
                        handler) {
        if(!handler) {
            return 'function(){}'
        }
        // 如果事件对应的handler是数组，则遍历所用的handler，调用genHandler
        if(Array.isArray(handler)) {
            return ("[" + (handler.map(function(handler) {
                return genHandler(name, handler);
            }).join(',')) + "]")
        }
        // 判断是不是回调是不是一个方法名？？
        var isMethodPath = simplePathRE.test(handler.value);
        // 判断handler是不是函数表达式？？function(){***}
        var isFunctionExpression = fnExpRE.test(handler.value);

        if(!handler.modifiers) {
            // 如果是方法或者函数表达式，直接返回；如果不应是，生成函数表达式function($event){****}
            return isMethodPath || isFunctionExpression
                ? handler.value
                : ("function($event){" + (handler.value) + "}") // inline statement
        } else {
            // 如果事件有修饰符
            var code = '';
            var genModifierCode = '';
            var keys = [];
            // 遍历事件修饰符
            for(var key in handler.modifiers) {
                if(modifierCode[key]) {
                    // 添加各个修饰符对应的条件语句
                    genModifierCode += modifierCode[key];
                    // left/right
                    if(keyCodes[key]) {
                        keys.push(key);
                    }
                } else {
                    keys.push(key);
                }
            }
            // 添加事件key修饰符对应的条件语句
            if(keys.length) {
                code += genKeyFilter(keys);
            }
            // Make sure modifiers like prevent and stop get executed after key filtering
            if(genModifierCode) {
                code += genModifierCode;
            }
            var handlerCode = isMethodPath
                ? handler.value + '($event)'
                : isFunctionExpression
                    ? ("(" + (handler.value) + ")($event)")
                    : handler.value;
            return ("function($event){" + code + handlerCode + "}")
        }
    }

    /**
     * 解析事件key修饰符
     * @param keys   事件key修饰符
     * @return {string}
     */
    function genKeyFilter(keys) {
        return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
    }

    /**
     * 将事件key修饰符解析为 if(!('button' in $event)&&_k($event.keyCode,"right",39))return null;
     * @param key   事件key修饰符
     * @return {string}
     */
    function genFilterCode(key) {
        var keyVal = parseInt(key, 10);
        if(keyVal) {
            return ("$event.keyCode!==" + keyVal)
        }
        var alias = keyCodes[key];
        // _k, checkKeyCodes方法的别名
        return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
    }

    /*  */
    /**
     * v-on指令？？
     * @param el
     * @param dir
     */
    function on(el, dir) {
        if("development" !== 'production' && dir.modifiers) {
            warn("v-on without argument does not support modifiers.");
        }
        el.wrapListeners = function(code) {
            // _g， bindObjectListeners方法的别名
            return ("_g(" + code + "," + (dir.value) + ")");
        };
    }

    /*  */
    /**
     * 将标签上的v-bind指令解析成代码串，此时v-bind绑定的是一个对象，而不是一个属性
     * @param el      标签对应的AST树节点对象
     * @param dir     v-bind指令对象
     */
    function bind$1(el, dir) {
        el.wrapData = function(code) {
            // _b， bindObjectProps方法的别名
            return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
        };
    }

    /*  */

    var baseDirectives = {
        on : on,
        bind : bind$1,
        cloak : noop
    };

    /*  */

    var CodegenState = function CodegenState(options) {
        this.options = options;
        this.warn = options.warn || baseWarn;
        this.transforms = pluckModuleFunction(options.modules, 'transformCode');
        // 相当于[genClass, genStyle]
        this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
        this.directives = extend(extend({}, baseDirectives), options.directives);
        var isReservedTag = options.isReservedTag || no;
        this.maybeComponent = function(el) {
            return !isReservedTag(el.tag);
        };
        this.onceId = 0;
        this.staticRenderFns = [];
    };

    // 根据HTML模板字符串编译为的AST树，生成渲染代码
    function generate(ast,
                      options) {
        var state = new CodegenState(options);
        //将AST树结构转化为渲染代码字符串，用于生成虚拟dom节点(_c, createElement方法的别名)
        // 返回结果为_c(tag, data, children)
        var code = ast ? genElement(ast, state) : '_c("div")';
        return {
            render : ("with(this){return " + code + "}"),
            staticRenderFns : state.staticRenderFns
        }
    }

    /**
     * 根据AST树结构对象， 生成渲染代码串。执行渲染代码串，会生成虚拟dom节点，然后更新真实dom节点
     * @param el      AST树根节点
     * @param state   ？？
     * @returns {*}   _c(......)
     */
    function genElement(el, state) {
        if(el.staticRoot && !el.staticProcessed) {
            return genStatic(el, state)
        } else if(el.once && !el.onceProcessed) {
            // 如果AST输节点对应的标签上有v-once指令，且AST树节点还没有进行once处理
            return genOnce(el, state)
        } else if(el.for && !el.forProcessed) {
            // 如果AST树节点对应的标签上有v-for指令， 且AST树节点还没有进行for处理
            return genFor(el, state)
        } else if(el.if && !el.ifProcessed) {
            // 如果AST树节点对应的标签上有v-if指令，且AST树节点还没有进行给if处理？？
            return genIf(el, state)
        } else if(el.tag === 'template' && !el.slotTarget) {
            return genChildren(el, state) || 'void 0'
        } else if(el.tag === 'slot') {
            // 组件中有slot标签
            return genSlot(el, state)
        } else {
            // component or element
            var code;
            // 判断elAST树节点对象对应的标签上是否有is属性，component为el对应的组件名称
            if(el.component) {
                code = genComponent(el.component, el, state);
            } else {
                // 生成用于构造虚拟domg节点的配置项data(createElement(context, tag, data......)中的data)
                var data = el.plain ? undefined : genData$2(el, state);
                // children 为 生成子虚拟dom节点的代码串，执行的话生成子虚拟dom节点
                var children = el.inlineTemplate ? null : genChildren(el, state, true);
                // _c, createElement方法的别名
                // 对应createElement(tag, data, children...)
                code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
            }
            // module transforms
            for(var i = 0; i < state.transforms.length; i++) {
                code = state.transforms[i](el, code);
            }
            return code
        }
    }

    // hoist static sub-trees out 将静态子树提取出来
    /**
     *
     * @param el
     * @param state
     * @return {string}
     */
    function genStatic(el, state) {
        // 标注AST树节点已经处理过？
        el.staticProcessed = true;
        // 添加静态渲染方法
        state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
        //_m， renderStatic方法的别名
        return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }

    // v-once
    /**
     * 将v-once指令转化为代码
     * @param el      v-once指令所在标签对应的AST树节点对象
     * @param state
     * @return {*}
     */
    function genOnce(el, state) {
        // v-once指令已经处理过了
        el.onceProcessed = true;
        if(el.if && !el.ifProcessed) {
            // 如果标签上有v-if指令，而且v-if指令还没有被处理，那么优先处理v-if指令
            return genIf(el, state)
        } else if(el.staticInFor) {
            // 如果v-once指令是位于v-for指令内？？
            var key = '';
            var parent = el.parent;
            while(parent) {
                if(parent.for) {
                    key = parent.key;
                    break
                }
                parent = parent.parent;
            }
            if(!key) {
                "development" !== 'production' && state.warn(
                    "v-once can only be used inside v-for that is keyed. "
                );
                return genElement(el, state)
            }
            // _o, markOnce方法的别名
            return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + (key ? ("," + key) : "") + ")")
        } else {
            // 将v-once指令转化为静态代码？？
            return genStatic(el, state)
        }
    }

    /**
     * 根据AST树节点上的ifConditions数组中各个ifCondition的exp值， 返回最后需要展示那个元素对应的渲染代码
     * @param el       AST树节点对象
     * @param state
     * @param altGen
     * @param altEmpty
     */
    function genIf(el,
                   state,
                   altGen,
                   altEmpty) {
        // 表明AST树节点已经被处理过
        el.ifProcessed = true; // avoid recursion
        return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
    }

    /**
     * 遍历ifConditons数组中的ifCondition， 生成 a ? b : (c ?d :e)..类型的渲染代码，最后展示在界面上的是ifCondition中exp为真对应的元素
     * 处理v-if指令解析成的ifConditions数组中的ifCondition对象，
     * @param conditions    AST树节点的isConditions数组属性
     * @param state
     * @param altGen
     * @param altEmpty
     * @return {*}
     */
    function genIfConditions(conditions,
                             state,
                             altGen,
                             altEmpty) {
        if(!conditions.length) {
            // _e, createEmptyVNode方法的别名
            return altEmpty || '_e()'
        }

        var condition = conditions.shift();
        if(condition.exp) {
            return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
        } else {
            return ("" + (genTernaryExp(condition.block)))
        }

        // v-if with v-once should generate code like (a)?_m(0):_m(1)
        function genTernaryExp(el) {
            return altGen
                ? altGen(el, state)
                : el.once
                    ? genOnce(el, state)
                    : genElement(el, state)
        }
    }

    /**
     * 将v-for指令，
     * @param el       v-for指令所在的标签对应的AST树节点
     * @param state
     * @param altGen
     * @param altHelper
     * @return {string}
     */
    function genFor(el,
                    state,
                    altGen,
                    altHelper) {
        // item in items 中的items
        var exp = el.for;
        // item in items 中的item, 或者(value, key, index) in items 中的value
        var alias = el.alias;
        // (item, index) 中的index, 或者(value, key, index) in items 中的key
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        //(value, key, index) in items 中的index
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

        if("development" !== 'production' &&
            state.maybeComponent(el) &&
            el.tag !== 'slot' &&
            el.tag !== 'template' &&
            !el.key
        ) {
            state.warn(
                "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
                "v-for should have explicit keys. " +
                "See https://vuejs.org/guide/list.html#key for more info.",
                true /* tip */
            );
        }

        el.forProcessed = true; // avoid recursion
        //_l， renderList方法的别名
        return (altHelper || '_l') + "((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + ((altGen || genElement)(el, state)) +
            '})'
    }

    /**
     * 调用_c(createElement)的时候，需要传入元素的data配置项。通过genData$2方，构造配置项data
     *  data : {
     *            directives:[{name:"model",rawName:"v-model",value:(message),expression:"message"}]
     *                  根据虚拟dom节点更新真实dom节点的时候，会调用updateDirectives方法，遍历指令集合，执行指令对应的操作
     *            attrs:{name1:value1, name2:value2...},
     *                  对应调用updateAttrs
     *            domProps : {name1:value1, name2:value2...},
     *                  对应调用updateDOMProps
     *            key:{},
     *            ref:{},
     *            refInFor:boolean,
     *            tag: ***,
     *            pre:boolean,
     *            slot:***,
     *            model:***,
     *            on:{"eventType":function(e){...}}
     *                  对应调用updateDOMListeners，绑定事件
     *         }
     * @param el
     * @param state
     * @returns {string}
     */
    function genData$2(el, state) {
        var data = '{';

        // directives first.
        // directives may mutate the el's other properties before they are generated.
        // 生成指令代码（只有v-text, v-html, v-show, v-model, v-cloak会生成指令代码）
        var dirs = genDirectives(el, state);
        if(dirs) {
            data += dirs + ',';
        }

        // key用于标识一个虚拟dom节点
        // 将AST树节点的key属性转化为json串
        if(el.key) {
            data += "key:" + (el.key) + ",";
        }
        // ref
        // 将AST树节点的ref属性转化为json串
        if(el.ref) {
            data += "ref:" + (el.ref) + ",";
        }
        // 将AST树节点的refInFor属性转化为json串
        if(el.refInFor) {
            data += "refInFor:true,";
        }
        // pre
        // 将AST树节点的pre属性转化为json串
        if(el.pre) {
            data += "pre:true,";
        }
        // record original tag name for components using "is" attribute
        // 将AST树节点的component属性转为json串
        if(el.component) {
            data += "tag:\"" + (el.tag) + "\",";
        }
        // module data generation functions
        // 调用genClass、genStyle方法，
        // 将AST节点的staticClass、classBinding、staticStyle、styleBinding属性转化为json串
        for(var i = 0; i < state.dataGenFns.length; i++) {
            data += state.dataGenFns[i](el);
        }
        // attrs, 一般对应为dom节点的固有属性， 将AST树节点对象的attrs属性转化为json串
        if(el.attrs) {
            data += "attrs:{" + (genProps(el.attrs)) + "},";
        }
        // DOM props， 一般可以理解为动态绑定的属性
        // 将AST树节点对象的props属性转化为json串
        if(el.props) {
            data += "domProps:{" + (genProps(el.props)) + "},";
        }
        // event handlers
        // 将AST树节点对象的events属性转化为json串
        if(el.events) {
            data += (genHandlers(el.events, false, state.warn)) + ",";
        }
        if(el.nativeEvents) {
            data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
        }
        // slot target
        // 将AST树节点对象的slotTarget属性转化为json串
        if(el.slotTarget) {
            data += "slot:" + (el.slotTarget) + ",";
        }
        // scoped slots
        if(el.scopedSlots) {
            data += (genScopedSlots(el.scopedSlots, state)) + ",";
        }
        // component v-model
        if(el.model) {
            data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
        }
        // inline-template
        if(el.inlineTemplate) {
            var inlineTemplate = genInlineTemplate(el, state);
            if(inlineTemplate) {
                data += inlineTemplate + ",";
            }
        }
        data = data.replace(/,$/, '') + '}';
        // v-bind data wrap
        // 表明标签上v-bind指令绑定的是一个对象
        if(el.wrapData) {
            data = el.wrapData(data);
        }
        // v-on data wrap
        if(el.wrapListeners) {
            data = el.wrapListeners(data);
        }
        return data
    }

    /**
     * 解析AST树节点的指令对象
     * 将指令对象解析成 directives:[{name:"show",rawName:"v-show",value:(***),expression:"***"}]格式
     * 如果是特殊指令是v-text, v-model, v-html, v-cloak, v-on,v-bind, 执行对应的特殊解析函数
     *     like v-text，调用text方法， 添加{name:"textContent", vaule:"****"}到el.props中
     *          v-html, 调用html方法， 添加{name:"innerHTML", value:"****"}到el.prop中
     *          v-model
     * @param el
     * @param state
     * @return {string}
     */
    function genDirectives(el, state) {
        var dirs = el.directives;
        if(!dirs) {
            return
        }
        var res = 'directives:[';
        var hasRuntime = false;
        var i, l, dir, needRuntime;
        // 遍历指令，获取指令对应的代码gen方法，然后执行指令代码gen方法
        for(i = 0, l = dirs.length; i < l; i++) {
            dir = dirs[i];
            needRuntime = true;
            var gen = state.directives[dir.name];
            if(gen) {
                // compile-time directive that manipulates AST.
                // returns true if it also needs a runtime counterpart.
                needRuntime = !!gen(el, dir, state.warn);
            }
            if(needRuntime) {
                hasRuntime = true;
                res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
            }
        }
        if(hasRuntime) {
            // 去除字符串最后的","
            return res.slice(0, -1) + ']'
        }
    }

    function genInlineTemplate(el, state) {
        var ast = el.children[0];
        if("development" !== 'production' && (
                el.children.length > 1 || ast.type !== 1
            )) {
            state.warn('Inline-template components must have exactly one child element.');
        }
        if(ast.type === 1) {
            var inlineRenderFns = generate(ast, state.options);
            return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function(code) {
                return ("function(){" + code + "}");
            }).join(',')) + "]}")
        }
    }

    function genScopedSlots(slots,
                            state) {
        // _u, resolveScopedSlots方法的别名
        return ("scopedSlots:_u([" + (Object.keys(slots).map(function(key) {
            return genScopedSlot(key, slots[key], state)
        }).join(',')) + "])")
    }

    /**
     * 作用域slot？？
     * @param key
     * @param el
     * @param state
     * @return {string}
     */
    function genScopedSlot(key,
                           el,
                           state) {
        if(el.for && !el.forProcessed) {
            return genForScopedSlot(key, el, state)
        }
        return "{key:" + key + ",fn:function(" + (String(el.attrsMap.scope)) + "){" +
            "return " + (el.tag === 'template'
                ? genChildren(el, state) || 'void 0'
                : genElement(el, state)) + "}}"
    }

    function genForScopedSlot(key,
                              el,
                              state) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
        el.forProcessed = true; // avoid recursion
        // _l，renderList方法的别名
        return "_l((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + (genScopedSlot(key, el, state)) +
            '})'
    }

    /**
     * 将AST树节点的子节点转化为一段代码字符串。执行该代码串，可生成子虚拟dom节点
     * @param el        AST树节点， 一般为父节点
     * @param state
     * @param checkSkip
     * @param altGenElement
     * @param altGenNode
     * @returns {*}
     */
    function genChildren(el,
                         state,
                         checkSkip,
                         altGenElement,
                         altGenNode) {
        // AST树节点的子节点
        var children = el.children;
        if(children.length) {
            var el$1 = children[0];
            // optimize single v-for
            // 处理v-for
            if(children.length === 1 &&
                el$1.for &&
                el$1.tag !== 'template' &&
                el$1.tag !== 'slot'
            ) {
                return (altGenElement || genElement)(el$1, state)
            }
            var normalizationType = checkSkip
                ? getNormalizationType(children, state.maybeComponent)
                : 0;
            var gen = altGenNode || genNode;
            // 遍历AST节点的子节点， 将子节点全部转化为渲染代码串
            return ("[" + (children.map(function(c) {
                return gen(c, state);
            }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
        }
    }

    // determine the normalization needed for the children array.
    // 0: no normalization needed
    // 1: simple normalization needed (possible 1-level deep nested array)
    // 2: full normalization needed
    function getNormalizationType(children,
                                  maybeComponent) {
        var res = 0;
        for(var i = 0; i < children.length; i++) {
            var el = children[i];
            if(el.type !== 1) {
                continue
            }
            if(needsNormalization(el) ||
                (el.ifConditions && el.ifConditions.some(function(c) {
                    return needsNormalization(c.block);
                }))) {
                res = 2;
                break
            }
            if(maybeComponent(el) ||
                (el.ifConditions && el.ifConditions.some(function(c) {
                    return maybeComponent(c.block);
                }))) {
                res = 1;
            }
        }
        return res
    }

    function needsNormalization(el) {
        return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }

    /**
     * 根据AST树节点的类型，生成对应的代码字符串
     * 如果节点类型为元素类型， 则返回的结果为_c(.....), _c->createElement，创建元素类型的虚拟dom节点
     * 如果节点类型为注释类型， 则返回的结果为_e(.....), -e->createEmptyVNode， 创建一个空的虚拟dom节点
     * 如果节点类型为文本类型， 则返回的结果为_v(......), -v->createTextVNode， 创建一个文本类型的虚拟dom节点
     * @param node      AST树节点
     * @param state
     * @returns {*}
     */
    function genNode(node, state) {
        if(node.type === 1) {
            // 返回 _c(......)
            return genElement(node, state)
        }
        if(node.type === 3 && node.isComment) {
            // 返回_e(.......)
            return genComment(node)
        } else {
            // 返回 _v(.....)
            return genText(node)
        }
    }

    /**
     * 将文本类型的AST树节点转化为 渲染代码串
     * @param text        文本类型的AST树节点
     * @returns {string}  _v(.....)
     */
    function genText(text) {
        // _v, createTextVNode方法的别名
        return ("_v(" + (text.type === 2
            ? text.expression // no need for () because already wrapped in _s()
            : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }

    /**
     * 将注释类型的AST树节点转化为 渲染代码串
     * @param comment     注释类型的AST树节点
     * @returns {string}  _e(......)
     */
    function genComment(comment) {
        // _e, createEmptyVNode方法的别名
        return ("_e('" + (comment.text) + "')")
    }

    /**
     * 将组件模板中的插槽标签转化为生成虚拟dom节点的代码串
     * @param el      slot标签对应的AST树节点对象
     * @param state
     * @return {string}
     */
    function genSlot(el, state) {
        // slot插槽的名字，判断插槽是具名插槽还是默认插槽
        var slotName = el.slotName || '"default"';
        var children = genChildren(el, state);
        // _t, renderSlot方法的别名
        var res = "_t(" + slotName + (children ? ("," + children) : '');
        var attrs = el.attrs && ("{" + (el.attrs.map(function(a) {
            return ((camelize(a.name)) + ":" + (a.value));
        }).join(',')) + "}");
        var bind$$1 = el.attrsMap['v-bind'];
        if((attrs || bind$$1) && !children) {
            res += ",null";
        }
        if(attrs) {
            res += "," + attrs;
        }
        if(bind$$1) {
            res += (attrs ? '' : ',null') + "," + bind$$1;
        }
        return res + ')'
    }

    // componentName is el.component, take it as argument to shun flow's pessimistic refinement
    /**
     *
     * @param componentName       el对应的组件的名称
     * @param el                  AST树节点对象
     * @param state
     * @return {string}
     */
    function genComponent(componentName,
                          el,
                          state) {
        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        // _c, createElement方法的别名
        return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
    }

    /**
     * 生成元素绑定属性对应的代码
     * 遍历属性数组，将[{name:"attr1",value:"123"}, {name:"attr2",value:"456"}] 转化为"'attr1':'123', 'attr2':'456''"的格式
     * @param props  属性数组
     * @returns {string}
     */
    function genProps(props) {
        var res = '';
        for(var i = 0; i < props.length; i++) {
            var prop = props[i];
            res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
        }
        // 去掉res字符串末尾多余的逗号
        return res.slice(0, -1)
    }

    // #3895, #4268
    function transformSpecialNewlines(text) {
        return text
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
    }

    /*  */

    // these keywords should not appear inside expressions, but operators like
    // typeof, instanceof and in are allowed
    var prohibitedKeywordRE = new RegExp('\\b' + (
        'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
        'super,throw,while,yield,delete,export,import,return,switch,default,' +
        'extends,finally,continue,debugger,function,arguments'
    ).split(',').join('\\b|\\b') + '\\b');

    // these unary operators should not be used as property/method names
    var unaryOperatorsRE = new RegExp('\\b' + (
        'delete,typeof,void'
    ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

    // check valid identifier for v-for
    var identRE = /[A-Za-z_$][\w$]*/;

    // strip strings in expressions
    var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

    // detect problematic expressions in a template
    function detectErrors(ast) {
        var errors = [];
        if(ast) {
            checkNode(ast, errors);
        }
        return errors
    }

    /**
     * 检查AST树节点对象
     * @param node    AST树节点对象
     * @param errors
     */
    function checkNode(node, errors) {
        if(node.type === 1) {
            for(var name in node.attrsMap) {
                if(dirRE.test(name)) {
                    var value = node.attrsMap[name];
                    if(value) {
                        if(name === 'v-for') {
                            checkFor(node, ("v-for=\"" + value + "\""), errors);
                        } else if(onRE.test(name)) {
                            checkEvent(value, (name + "=\"" + value + "\""), errors);
                        } else {
                            checkExpression(value, (name + "=\"" + value + "\""), errors);
                        }
                    }
                }
            }
            if(node.children) {
                for(var i = 0; i < node.children.length; i++) {
                    checkNode(node.children[i], errors);
                }
            }
        } else if(node.type === 2) {
            checkExpression(node.expression, node.text, errors);
        }
    }

    function checkEvent(exp, text, errors) {
        var stipped = exp.replace(stripStringRE, '');
        var keywordMatch = stipped.match(unaryOperatorsRE);
        if(keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
            errors.push(
                "avoid using JavaScript unary operator as property name: " +
                "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
            );
        }
        checkExpression(exp, text, errors);
    }

    function checkFor(node, text, errors) {
        checkExpression(node.for || '', text, errors);
        checkIdentifier(node.alias, 'v-for alias', text, errors);
        checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
        checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
    }

    function checkIdentifier(ident, type, text, errors) {
        if(typeof ident === 'string' && !identRE.test(ident)) {
            errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
        }
    }

    function checkExpression(exp, text, errors) {
        try {
            new Function(("return " + exp));
        } catch(e) {
            var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
            if(keywordMatch) {
                errors.push(
                    "avoid using JavaScript keyword as property name: " +
                    "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
                );
            } else {
                errors.push(("invalid expression: " + (text.trim())));
            }
        }
    }

    /*  */
    // 将字符串代码转换为函数，例如 new Function("1") => (function() {1})
    function createFunction(code, errors) {
        try {
            return new Function(code)
        } catch(err) {
            errors.push({err : err, code : code});
            return noop
        }
    }
    // 执行该方法， 返回编译函数
    function createCompileToFunctionFn(compile) {
        var cache = Object.create(null);
        // 编译函数，template：html模板字符创， vm:Vue实例, options：配置项
        // 执行编译函数，返回渲染函数
        return function compileToFunctions(template,
                                           options,
                                           vm) {
            options = options || {};

            /* istanbul ignore if */
            {
                // detect possible CSP restriction
                try {
                    new Function('return 1');
                } catch(e) {
                    if(e.toString().match(/unsafe-eval|CSP/)) {
                        warn(
                            'It seems you are using the standalone build of Vue.js in an ' +
                            'environment with Content Security Policy that prohibits unsafe-eval. ' +
                            'The template compiler cannot work in this environment. Consider ' +
                            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                            'templates into render functions.'
                        );
                    }
                }
            }

            // check cache
            var key = options.delimiters
                ? String(options.delimiters) + template
                : template;
            // 检查html模板字符串是否已经被编译过，如果已经被编译过，直接返回之前编译后的结果
            if(cache[key]) {
                return cache[key]
            }

            // compile 编译html模板字符串，返回一个对象，
            // {ast:obj(AST树对象),render：str(渲染代码),staticRenderFns:str(静态渲染代码)}
            var compiled = compile(template, options);

            // check compilation errors/tips
            {
                if(compiled.errors && compiled.errors.length) {
                    warn(
                        "Error compiling template:\n\n" + template + "\n\n" +
                        compiled.errors.map(function(e) {
                            return ("- " + e);
                        }).join('\n') + '\n',
                        vm
                    );
                }
                if(compiled.tips && compiled.tips.length) {
                    compiled.tips.forEach(function(msg) {
                        return tip(msg, vm);
                    });
                }
            }

            // turn code into functions
            var res = {};
            var fnGenErrors = [];
            // 根据渲染代码， 生成渲染函数
            res.render = createFunction(compiled.render, fnGenErrors);
            // 根据静态渲染代码， 生成静态渲染函数， 静态渲染函数是一个数组
            res.staticRenderFns = compiled.staticRenderFns.map(function(code) {
                return createFunction(code, fnGenErrors)
            });

            // check function generation errors.
            // this should only happen if there is a bug in the compiler itself.
            // mostly for codegen development use
            /* istanbul ignore if */
            {
                if((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
                    warn(
                        "Failed to generate render function:\n\n" +
                        fnGenErrors.map(function(ref) {
                            var err = ref.err;
                            var code = ref.code;

                            return ((err.toString()) + " in\n\n" + code + "\n");
                        }).join('\n'),
                        vm
                    );
                }
            }
            // key为html模板字符串， 将html模板字符串对应的编译对象缓存，以供下次使用
            return (cache[key] = res)
        }
    }

    /*  */
    /**
     * 编译器工厂函数， 用于返回编译器工人函数
     * @param baseCompile         Vue内置的编译方法，也可以有用户指定编译方法
     * @return {createCompiler}
     */
    function createCompilerCreator(baseCompile) {
        /**
         * 编译器工人函数， 返回
         */
        return function createCompiler(baseOptions) {
            function compile(template,
                             options) {
                // 原型继承， finalOptions的_prop_属性， 指向baseOptions
                var finalOptions = Object.create(baseOptions);
                var errors = [];
                var tips = [];
                finalOptions.warn = function(msg, tip) {
                    (tip ? tips : errors).push(msg);
                };

                if(options) {
                    // merge custom modules
                    // 如果options有modules， 则合并baseOptions、options的modules属性，作为finalOptions中modules属性值
                    if(options.modules) {
                        finalOptions.modules =
                            (baseOptions.modules || []).concat(options.modules);
                    }
                    // merge custom directives
                    // 如果options有directives， 则合并baseOptions、options的directives属性， 作为finalOptions中的directives属性值
                    if(options.directives) {
                        finalOptions.directives = extend(
                            Object.create(baseOptions.directives),
                            options.directives
                        );
                    }
                    // copy other options
                    for(var key in options) {
                        if(key !== 'modules' && key !== 'directives') {
                            finalOptions[key] = options[key];
                        }
                    }
                }
                // 生成的编译对象，包含 ast（编译出的AST树对象）render（渲染代码）staticRenderFns（静态渲染代码）
                var compiled = baseCompile(template, finalOptions);
                {
                    errors.push.apply(errors, detectErrors(compiled.ast));
                }
                compiled.errors = errors;
                compiled.tips = tips;
                return compiled
            }

            return {
                compile : compile,
                compileToFunctions : createCompileToFunctionFn(compile)
            }
        }
    }

    /*  */

    // `createCompilerCreator` allows creating compilers that use alternative
    // parser/optimizer/codegen, e.g the SSR optimizing compiler.
    // Here we just export a default compiler using the default parts.
    var createCompiler = createCompilerCreator(function baseCompile(template,
                                                                    options) {
        // 解析html模板字符串，解析为AST（抽象语法树）树的对象
        // AST树节点的类型有三种，type:1, 对应为dom元素; type:2, 表达式？？; type:3, ??
        // ast对象的格式为{tag : "div", parent : undefined, attrList : [****], childrend:[tag ："", parent : "", children:[]]}
        var ast = parse(template.trim(), options);
        // 优化AST树， 给AST树的节点添加static，staticRoot属性（这两个属性有啥用）
        optimize(ast, options);
        // 将AST树根节点转化为渲染代码字符串， with(this){return _c(tag, data, children..)}
        var code = generate(ast, options);
        return {
            ast : ast,
            render : code.render,
            staticRenderFns : code.staticRenderFns
        }
    });

    /*  */

    var ref$1 = createCompiler(baseOptions);
    var compileToFunctions = ref$1.compileToFunctions;

    /*  */

    var idToTemplate = cached(function(id) {
        var el = query(id);
        return el && el.innerHTML
    });

    var mount = Vue$3.prototype.$mount;
    // 重写的$mount方法
    // 将vue实例挂载到el对应的dom节点上，即把vue实例对应的dom节点替换el对应的dom节点上
    // 如果Vue实例在实例化时没有收到el选项， 则它处于“未挂载”状态，没有关联的dom元素
    Vue$3.prototype.$mount = function(el,
                                      hydrating) {
        // el为dom元素对应的选择器表达式，根据选择器表达式，获取dom元素
        el = el && query(el);

        /* istanbul ignore if */
        // 注意，使用构建Vue实例的时候，new Vue({el : "#app1"}), app1对应的元素不能为html、body
        if(el === document.body || el === document.documentElement) {
            "development" !== 'production' && warn(
                "Do not mount Vue to <html> or <body> - mount to normal elements instead."
            );
            return this
        }
        // 返回Vue实例对象的配置项
        var options = this.$options;
        // resolve template/el and convert to render function
        // 如果Vue实例对象的配置项中没有render渲染函数的时候，需要解析对应模板，将模板转换为render渲染函数
        // keep-live组件对应的Vue实例对象的配置项有render方法
        if(!options.render) {
            // 一般是组件实例的构造函数的options中会直接有template这个属性
            var template = options.template;
            if(template) {
                if(typeof template === 'string') {
                    if(template.charAt(0) === '#') {
                        template = idToTemplate(template);
                        /* istanbul ignore if */
                        if("development" !== 'production' && !template) {
                            warn(
                                ("Template element not found or is empty: " + (options.template)),
                                this
                            );
                        }
                    }
                } else if(template.nodeType) {
                    template = template.innerHTML;
                } else {
                    {
                        warn('invalid template option:' + template, this);
                    }
                    return this
                }
            } else if(el) {
                // 获取dom节点的outerHTML
                template = getOuterHTML(el);
            }
            // template，模板字符串
            if(template) {
                /* istanbul ignore if */
                if("development" !== 'production' && config.performance && mark) {
                    mark('compile');
                }
                // 将html模板字符串编译为渲染函数，用于生成虚拟dom节点
                var ref = compileToFunctions(template, {
                    // 换行符
                    shouldDecodeNewlines : shouldDecodeNewlines,
                    // 分割符
                    delimiters : options.delimiters,
                    // 注释
                    comments : options.comments
                }, this);
                // 获取渲染函数
                var render = ref.render;
                // 获取静态渲染函数
                var staticRenderFns = ref.staticRenderFns;
                // 将渲染函数添加到Vue实例对象的配置项options中
                options.render = render;
                // 将静态渲染函数添加到Vue实例对象的配置项options中
                options.staticRenderFns = staticRenderFns;

                /* istanbul ignore if */
                if("development" !== 'production' && config.performance && mark) {
                    mark('compile end');
                    measure(((this._name) + " compile"), 'compile', 'compile end');
                }
            }
        }
        return mount.call(this, el, hydrating)
    };

    /**
     * Get outerHTML of elements, taking care
     * of SVG elements in IE as well.
     * 返回元素的outerHTML字符串
     */
    function getOuterHTML(el) {
        if(el.outerHTML) {
            return el.outerHTML
        } else {
            var container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML
        }
    }

    Vue$3.compile = compileToFunctions;
    // 返回Vue构造函数， like：new Vue(); 中使用Vue函数
    return Vue$3;

})));
