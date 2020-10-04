
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let keys = writable({
      '`': {},
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
      7: {},
      8: {},
      9: {},
      0: {},
      '-': {},
      '=': {},
      del: {},
      // 2nd row
      tab: {},
      q: {},
      w: {},
      e: {},
      r: {},
      t: {},
      y: {},
      u: {},
      i: {},
      o: {},
      p: {},
      '[': {},
      ']': {},
      '\\': {},
      // 3rd row
      caps: {},
      a: {},
      s: {},
      d: {},
      f: {},
      g: {},
      h: {},
      j: {},
      k: {},
      l: {},
      ';': {},
      "'": {},
      enter: {},
      // 4th row
      lshift: {},
      z: {},
      x: {},
      c: {},
      v: {},
      b: {},
      n: {},
      m: {},
      ',': {},
      '.': {},
      '/': {},
      rshift: {},
      // bottom row
      lctrl: {},
      lopt: {},
      lcmd: {},
      space: {},
      rcmd: {},
      ropt: {},
      rctrl: {},
    });

    /* Users/spencer/mountain/somehow-keyboard/src/Keyboard.svelte generated by Svelte v3.24.1 */
    const file = "Users/spencer/mountain/somehow-keyboard/src/Keyboard.svelte";

    function create_fragment(ctx) {
    	let div65;
    	let div14;
    	let div0;
    	let t0_value = (/*$keys*/ ctx[2]["`"].show || "") + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = (/*$keys*/ ctx[2]["1"].show || "") + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = (/*$keys*/ ctx[2]["2"].show || "") + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = (/*$keys*/ ctx[2]["3"].show || "") + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8_value = (/*$keys*/ ctx[2]["4"].show || "") + "";
    	let t8;
    	let t9;
    	let div5;
    	let t10_value = (/*$keys*/ ctx[2]["5"].show || "") + "";
    	let t10;
    	let t11;
    	let div6;
    	let t12_value = (/*$keys*/ ctx[2]["6"].show || "") + "";
    	let t12;
    	let t13;
    	let div7;
    	let t14_value = (/*$keys*/ ctx[2]["7"].show || "") + "";
    	let t14;
    	let t15;
    	let div8;
    	let t16_value = (/*$keys*/ ctx[2]["8"].show || "") + "";
    	let t16;
    	let t17;
    	let div9;
    	let t18_value = (/*$keys*/ ctx[2]["9"].show || "") + "";
    	let t18;
    	let t19;
    	let div10;
    	let t20_value = (/*$keys*/ ctx[2]["0"].show || "") + "";
    	let t20;
    	let t21;
    	let div11;
    	let t22_value = (/*$keys*/ ctx[2]["-"].show || "") + "";
    	let t22;
    	let t23;
    	let div12;
    	let t24_value = (/*$keys*/ ctx[2]["="].show || "") + "";
    	let t24;
    	let t25;
    	let div13;
    	let t26_value = (/*$keys*/ ctx[2]["del"].show || "") + "";
    	let t26;
    	let t27;
    	let div29;
    	let div15;
    	let t28_value = (/*$keys*/ ctx[2]["tab"].show || "") + "";
    	let t28;
    	let t29;
    	let div16;
    	let t30_value = (/*$keys*/ ctx[2]["q"].show || "") + "";
    	let t30;
    	let t31;
    	let div17;
    	let t32_value = (/*$keys*/ ctx[2]["w"].show || "") + "";
    	let t32;
    	let t33;
    	let div18;
    	let t34_value = (/*$keys*/ ctx[2]["e"].show || "") + "";
    	let t34;
    	let t35;
    	let div19;
    	let t36_value = (/*$keys*/ ctx[2]["r"].show || "") + "";
    	let t36;
    	let t37;
    	let div20;
    	let t38_value = (/*$keys*/ ctx[2]["t"].show || "") + "";
    	let t38;
    	let t39;
    	let div21;
    	let t40_value = (/*$keys*/ ctx[2]["y"].show || "") + "";
    	let t40;
    	let t41;
    	let div22;
    	let t42_value = (/*$keys*/ ctx[2]["u"].show || "") + "";
    	let t42;
    	let t43;
    	let div23;
    	let t44_value = (/*$keys*/ ctx[2]["i"].show || "") + "";
    	let t44;
    	let t45;
    	let div24;
    	let t46_value = (/*$keys*/ ctx[2]["o"].show || "") + "";
    	let t46;
    	let t47;
    	let div25;
    	let t48_value = (/*$keys*/ ctx[2]["p"].show || "") + "";
    	let t48;
    	let t49;
    	let div26;
    	let t50_value = (/*$keys*/ ctx[2]["["].show || "") + "";
    	let t50;
    	let t51;
    	let div27;
    	let t52_value = (/*$keys*/ ctx[2]["]"].show || "") + "";
    	let t52;
    	let t53;
    	let div28;
    	let t54_value = (/*$keys*/ ctx[2]["\\"].show || "") + "";
    	let t54;
    	let t55;
    	let div43;
    	let div30;
    	let t56_value = (/*$keys*/ ctx[2]["caps"].show || "") + "";
    	let t56;
    	let t57;
    	let div31;
    	let t58_value = (/*$keys*/ ctx[2]["a"].show || "") + "";
    	let t58;
    	let t59;
    	let div32;
    	let t60_value = (/*$keys*/ ctx[2]["s"].show || "") + "";
    	let t60;
    	let t61;
    	let div33;
    	let t62_value = (/*$keys*/ ctx[2]["d"].show || "") + "";
    	let t62;
    	let t63;
    	let div34;
    	let t64_value = (/*$keys*/ ctx[2]["f"].show || "") + "";
    	let t64;
    	let t65;
    	let div35;
    	let t66_value = (/*$keys*/ ctx[2]["g"].show || "") + "";
    	let t66;
    	let t67;
    	let div36;
    	let t68_value = (/*$keys*/ ctx[2]["h"].show || "") + "";
    	let t68;
    	let t69;
    	let div37;
    	let t70_value = (/*$keys*/ ctx[2]["j"].show || "") + "";
    	let t70;
    	let t71;
    	let div38;
    	let t72_value = (/*$keys*/ ctx[2]["k"].show || "") + "";
    	let t72;
    	let t73;
    	let div39;
    	let t74_value = (/*$keys*/ ctx[2]["l"].show || "") + "";
    	let t74;
    	let t75;
    	let div40;
    	let t76_value = (/*$keys*/ ctx[2][";"].show || "") + "";
    	let t76;
    	let t77;
    	let div41;
    	let t78_value = (/*$keys*/ ctx[2]["'"].show || "") + "";
    	let t78;
    	let t79;
    	let div42;
    	let t80_value = (/*$keys*/ ctx[2]["enter"].show || "") + "";
    	let t80;
    	let t81;
    	let div56;
    	let div44;
    	let t82_value = (/*$keys*/ ctx[2]["lshift"].show || "") + "";
    	let t82;
    	let t83;
    	let div45;
    	let t84_value = (/*$keys*/ ctx[2]["z"].show || "") + "";
    	let t84;
    	let t85;
    	let div46;
    	let t86_value = (/*$keys*/ ctx[2]["x"].show || "") + "";
    	let t86;
    	let t87;
    	let div47;
    	let t88_value = (/*$keys*/ ctx[2]["c"].show || "") + "";
    	let t88;
    	let t89;
    	let div48;
    	let t90_value = (/*$keys*/ ctx[2]["v"].show || "") + "";
    	let t90;
    	let t91;
    	let div49;
    	let t92_value = (/*$keys*/ ctx[2]["b"].show || "") + "";
    	let t92;
    	let t93;
    	let div50;
    	let t94_value = (/*$keys*/ ctx[2]["n"].show || "") + "";
    	let t94;
    	let t95;
    	let div51;
    	let t96_value = (/*$keys*/ ctx[2]["m"].show || "") + "";
    	let t96;
    	let t97;
    	let div52;
    	let t98_value = (/*$keys*/ ctx[2][","].show || "") + "";
    	let t98;
    	let t99;
    	let div53;
    	let t100_value = (/*$keys*/ ctx[2]["."].show || "") + "";
    	let t100;
    	let t101;
    	let div54;
    	let t102_value = (/*$keys*/ ctx[2]["/"].show || "") + "";
    	let t102;
    	let t103;
    	let div55;
    	let t104_value = (/*$keys*/ ctx[2]["rshift"].show || "") + "";
    	let t104;
    	let t105;
    	let div64;
    	let div57;
    	let t106_value = (/*$keys*/ ctx[2]["lctrl"].show || "") + "";
    	let t106;
    	let t107;
    	let div58;
    	let t108_value = (/*$keys*/ ctx[2]["lopt"].show || "") + "";
    	let t108;
    	let t109;
    	let div59;
    	let t110_value = (/*$keys*/ ctx[2]["lcmd"].show || "") + "";
    	let t110;
    	let t111;
    	let div60;
    	let t112_value = (/*$keys*/ ctx[2]["space"].show || "") + "";
    	let t112;
    	let t113;
    	let div61;
    	let t114_value = (/*$keys*/ ctx[2]["rcmd"].show || "") + "";
    	let t114;
    	let t115;
    	let div62;
    	let t116_value = (/*$keys*/ ctx[2]["ropt"].show || "") + "";
    	let t116;
    	let t117;
    	let div63;
    	let t118_value = (/*$keys*/ ctx[2]["rctrl"].show || "") + "";
    	let t118;
    	let div65_resize_listener;
    	let t119;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div65 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			t10 = text(t10_value);
    			t11 = space();
    			div6 = element("div");
    			t12 = text(t12_value);
    			t13 = space();
    			div7 = element("div");
    			t14 = text(t14_value);
    			t15 = space();
    			div8 = element("div");
    			t16 = text(t16_value);
    			t17 = space();
    			div9 = element("div");
    			t18 = text(t18_value);
    			t19 = space();
    			div10 = element("div");
    			t20 = text(t20_value);
    			t21 = space();
    			div11 = element("div");
    			t22 = text(t22_value);
    			t23 = space();
    			div12 = element("div");
    			t24 = text(t24_value);
    			t25 = space();
    			div13 = element("div");
    			t26 = text(t26_value);
    			t27 = space();
    			div29 = element("div");
    			div15 = element("div");
    			t28 = text(t28_value);
    			t29 = space();
    			div16 = element("div");
    			t30 = text(t30_value);
    			t31 = space();
    			div17 = element("div");
    			t32 = text(t32_value);
    			t33 = space();
    			div18 = element("div");
    			t34 = text(t34_value);
    			t35 = space();
    			div19 = element("div");
    			t36 = text(t36_value);
    			t37 = space();
    			div20 = element("div");
    			t38 = text(t38_value);
    			t39 = space();
    			div21 = element("div");
    			t40 = text(t40_value);
    			t41 = space();
    			div22 = element("div");
    			t42 = text(t42_value);
    			t43 = space();
    			div23 = element("div");
    			t44 = text(t44_value);
    			t45 = space();
    			div24 = element("div");
    			t46 = text(t46_value);
    			t47 = space();
    			div25 = element("div");
    			t48 = text(t48_value);
    			t49 = space();
    			div26 = element("div");
    			t50 = text(t50_value);
    			t51 = space();
    			div27 = element("div");
    			t52 = text(t52_value);
    			t53 = space();
    			div28 = element("div");
    			t54 = text(t54_value);
    			t55 = space();
    			div43 = element("div");
    			div30 = element("div");
    			t56 = text(t56_value);
    			t57 = space();
    			div31 = element("div");
    			t58 = text(t58_value);
    			t59 = space();
    			div32 = element("div");
    			t60 = text(t60_value);
    			t61 = space();
    			div33 = element("div");
    			t62 = text(t62_value);
    			t63 = space();
    			div34 = element("div");
    			t64 = text(t64_value);
    			t65 = space();
    			div35 = element("div");
    			t66 = text(t66_value);
    			t67 = space();
    			div36 = element("div");
    			t68 = text(t68_value);
    			t69 = space();
    			div37 = element("div");
    			t70 = text(t70_value);
    			t71 = space();
    			div38 = element("div");
    			t72 = text(t72_value);
    			t73 = space();
    			div39 = element("div");
    			t74 = text(t74_value);
    			t75 = space();
    			div40 = element("div");
    			t76 = text(t76_value);
    			t77 = space();
    			div41 = element("div");
    			t78 = text(t78_value);
    			t79 = space();
    			div42 = element("div");
    			t80 = text(t80_value);
    			t81 = space();
    			div56 = element("div");
    			div44 = element("div");
    			t82 = text(t82_value);
    			t83 = space();
    			div45 = element("div");
    			t84 = text(t84_value);
    			t85 = space();
    			div46 = element("div");
    			t86 = text(t86_value);
    			t87 = space();
    			div47 = element("div");
    			t88 = text(t88_value);
    			t89 = space();
    			div48 = element("div");
    			t90 = text(t90_value);
    			t91 = space();
    			div49 = element("div");
    			t92 = text(t92_value);
    			t93 = space();
    			div50 = element("div");
    			t94 = text(t94_value);
    			t95 = space();
    			div51 = element("div");
    			t96 = text(t96_value);
    			t97 = space();
    			div52 = element("div");
    			t98 = text(t98_value);
    			t99 = space();
    			div53 = element("div");
    			t100 = text(t100_value);
    			t101 = space();
    			div54 = element("div");
    			t102 = text(t102_value);
    			t103 = space();
    			div55 = element("div");
    			t104 = text(t104_value);
    			t105 = space();
    			div64 = element("div");
    			div57 = element("div");
    			t106 = text(t106_value);
    			t107 = space();
    			div58 = element("div");
    			t108 = text(t108_value);
    			t109 = space();
    			div59 = element("div");
    			t110 = text(t110_value);
    			t111 = space();
    			div60 = element("div");
    			t112 = text(t112_value);
    			t113 = space();
    			div61 = element("div");
    			t114 = text(t114_value);
    			t115 = space();
    			div62 = element("div");
    			t116 = text(t116_value);
    			t117 = space();
    			div63 = element("div");
    			t118 = text(t118_value);
    			t119 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "key svelte-s6zq7o");
    			set_style(div0, "background-color", /*$keys*/ ctx[2]["`"].color);
    			set_style(div0, "flex", "0.9");
    			toggle_class(div0, "show", /*$keys*/ ctx[2]["`"].color);
    			add_location(div0, file, 59, 4, 1212);
    			attr_dev(div1, "class", "key svelte-s6zq7o");
    			set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			add_location(div1, file, 62, 4, 1359);
    			attr_dev(div2, "class", "key svelte-s6zq7o");
    			set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			add_location(div2, file, 65, 4, 1497);
    			attr_dev(div3, "class", "key svelte-s6zq7o");
    			set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			add_location(div3, file, 68, 4, 1635);
    			attr_dev(div4, "class", "key svelte-s6zq7o");
    			set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			add_location(div4, file, 71, 4, 1773);
    			attr_dev(div5, "class", "key svelte-s6zq7o");
    			set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			add_location(div5, file, 74, 4, 1911);
    			attr_dev(div6, "class", "key svelte-s6zq7o");
    			set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			add_location(div6, file, 77, 4, 2049);
    			attr_dev(div7, "class", "key svelte-s6zq7o");
    			set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			add_location(div7, file, 80, 4, 2187);
    			attr_dev(div8, "class", "key svelte-s6zq7o");
    			set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			add_location(div8, file, 83, 4, 2325);
    			attr_dev(div9, "class", "key svelte-s6zq7o");
    			set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			add_location(div9, file, 86, 4, 2463);
    			attr_dev(div10, "class", "key svelte-s6zq7o");
    			set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			add_location(div10, file, 89, 4, 2601);
    			attr_dev(div11, "class", "key svelte-s6zq7o");
    			set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			add_location(div11, file, 92, 4, 2739);
    			attr_dev(div12, "class", "key svelte-s6zq7o");
    			set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			toggle_class(div12, "show", /*$keys*/ ctx[2]["="].color);
    			add_location(div12, file, 95, 4, 2877);
    			attr_dev(div13, "class", "key svelte-s6zq7o");
    			set_style(div13, "background-color", /*$keys*/ ctx[2]["del"].color);
    			set_style(div13, "opacity", /*$keys*/ ctx[2]["del"].opacity);
    			set_style(div13, "flex", "1.5");
    			toggle_class(div13, "show", /*$keys*/ ctx[2]["del"].color);
    			add_location(div13, file, 98, 4, 3015);
    			attr_dev(div14, "class", "row svelte-s6zq7o");
    			add_location(div14, file, 58, 2, 1190);
    			attr_dev(div15, "class", "key svelte-s6zq7o");
    			set_style(div15, "background-color", /*$keys*/ ctx[2]["tab"].color);
    			set_style(div15, "opacity", /*$keys*/ ctx[2]["tab"].opacity);
    			toggle_class(div15, "show", /*$keys*/ ctx[2]["tab"].color);
    			add_location(div15, file, 106, 4, 3248);
    			attr_dev(div16, "class", "key svelte-s6zq7o");
    			set_style(div16, "background-color", /*$keys*/ ctx[2]["q"].color);
    			toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			add_location(div16, file, 112, 4, 3442);
    			attr_dev(div17, "class", "key svelte-s6zq7o");
    			set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			add_location(div17, file, 115, 4, 3580);
    			attr_dev(div18, "class", "key svelte-s6zq7o");
    			set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			add_location(div18, file, 118, 4, 3718);
    			attr_dev(div19, "class", "key svelte-s6zq7o");
    			set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			add_location(div19, file, 121, 4, 3856);
    			attr_dev(div20, "class", "key svelte-s6zq7o");
    			set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			add_location(div20, file, 124, 4, 3994);
    			attr_dev(div21, "class", "key svelte-s6zq7o");
    			set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			add_location(div21, file, 127, 4, 4132);
    			attr_dev(div22, "class", "key svelte-s6zq7o");
    			set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			add_location(div22, file, 130, 4, 4270);
    			attr_dev(div23, "class", "key svelte-s6zq7o");
    			set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			add_location(div23, file, 133, 4, 4408);
    			attr_dev(div24, "class", "key svelte-s6zq7o");
    			set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			add_location(div24, file, 136, 4, 4546);
    			attr_dev(div25, "class", "key svelte-s6zq7o");
    			set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			add_location(div25, file, 139, 4, 4684);
    			attr_dev(div26, "class", "key svelte-s6zq7o");
    			set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			add_location(div26, file, 142, 4, 4822);
    			attr_dev(div27, "class", "key svelte-s6zq7o");
    			set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			add_location(div27, file, 145, 4, 4960);
    			attr_dev(div28, "class", "key svelte-s6zq7o");
    			set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			toggle_class(div28, "show", /*$keys*/ ctx[2]["\\"].color);
    			add_location(div28, file, 148, 4, 5098);
    			attr_dev(div29, "class", "row svelte-s6zq7o");
    			add_location(div29, file, 105, 2, 3226);
    			attr_dev(div30, "class", "key svelte-s6zq7o");
    			set_style(div30, "background-color", /*$keys*/ ctx[2]["caps"].color);
    			set_style(div30, "opacity", /*$keys*/ ctx[2]["caps"].opacity);
    			set_style(div30, "flex", "1.6");
    			toggle_class(div30, "show", /*$keys*/ ctx[2]["caps"].color);
    			add_location(div30, file, 153, 4, 5268);
    			attr_dev(div31, "class", "key svelte-s6zq7o");
    			set_style(div31, "background-color", /*$keys*/ ctx[2]["a"].color);
    			toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			add_location(div31, file, 159, 4, 5476);
    			attr_dev(div32, "class", "key svelte-s6zq7o");
    			set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			add_location(div32, file, 162, 4, 5614);
    			attr_dev(div33, "class", "key svelte-s6zq7o");
    			set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			add_location(div33, file, 165, 4, 5752);
    			attr_dev(div34, "class", "key svelte-s6zq7o");
    			set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			add_location(div34, file, 168, 4, 5890);
    			attr_dev(div35, "class", "key svelte-s6zq7o");
    			set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			add_location(div35, file, 171, 4, 6028);
    			attr_dev(div36, "class", "key svelte-s6zq7o");
    			set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			add_location(div36, file, 174, 4, 6166);
    			attr_dev(div37, "class", "key svelte-s6zq7o");
    			set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			add_location(div37, file, 177, 4, 6304);
    			attr_dev(div38, "class", "key svelte-s6zq7o");
    			set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			add_location(div38, file, 180, 4, 6442);
    			attr_dev(div39, "class", "key svelte-s6zq7o");
    			set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			add_location(div39, file, 183, 4, 6580);
    			attr_dev(div40, "class", "key svelte-s6zq7o");
    			set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			add_location(div40, file, 186, 4, 6718);
    			attr_dev(div41, "class", "key svelte-s6zq7o");
    			set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			add_location(div41, file, 189, 4, 6856);
    			attr_dev(div42, "class", "key svelte-s6zq7o");
    			set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			set_style(div42, "flex", "1.6");
    			toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			add_location(div42, file, 192, 4, 6994);
    			attr_dev(div43, "class", "row svelte-s6zq7o");
    			add_location(div43, file, 152, 2, 5246);
    			attr_dev(div44, "class", "key svelte-s6zq7o");
    			set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			set_style(div44, "flex", "2.2");
    			toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			add_location(div44, file, 200, 4, 7235);
    			attr_dev(div45, "class", "key svelte-s6zq7o");
    			set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			add_location(div45, file, 206, 4, 7451);
    			attr_dev(div46, "class", "key svelte-s6zq7o");
    			set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			add_location(div46, file, 209, 4, 7589);
    			attr_dev(div47, "class", "key svelte-s6zq7o");
    			set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			add_location(div47, file, 212, 4, 7727);
    			attr_dev(div48, "class", "key svelte-s6zq7o");
    			set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			add_location(div48, file, 215, 4, 7865);
    			attr_dev(div49, "class", "key svelte-s6zq7o");
    			set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			add_location(div49, file, 218, 4, 8003);
    			attr_dev(div50, "class", "key svelte-s6zq7o");
    			set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			add_location(div50, file, 221, 4, 8141);
    			attr_dev(div51, "class", "key svelte-s6zq7o");
    			set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			add_location(div51, file, 224, 4, 8279);
    			attr_dev(div52, "class", "key svelte-s6zq7o");
    			set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			add_location(div52, file, 227, 4, 8417);
    			attr_dev(div53, "class", "key svelte-s6zq7o");
    			set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			add_location(div53, file, 230, 4, 8555);
    			attr_dev(div54, "class", "key svelte-s6zq7o");
    			set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			add_location(div54, file, 233, 4, 8693);
    			attr_dev(div55, "class", "key svelte-s6zq7o");
    			set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			set_style(div55, "flex", "2.2");
    			toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			add_location(div55, file, 236, 4, 8831);
    			attr_dev(div56, "class", "row svelte-s6zq7o");
    			add_location(div56, file, 199, 2, 7213);
    			attr_dev(div57, "class", "key svelte-s6zq7o");
    			set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			set_style(div57, "flex", "1.4");
    			toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			add_location(div57, file, 244, 4, 9076);
    			attr_dev(div58, "class", "key svelte-s6zq7o");
    			set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			set_style(div58, "flex", "1.4");
    			toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			add_location(div58, file, 250, 4, 9288);
    			attr_dev(div59, "class", "key svelte-s6zq7o");
    			set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			set_style(div59, "flex", "1.4");
    			toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			add_location(div59, file, 256, 4, 9496);
    			attr_dev(div60, "class", "key svelte-s6zq7o");
    			set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			set_style(div60, "flex", "6.8");
    			toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			add_location(div60, file, 262, 4, 9704);
    			attr_dev(div61, "class", "key svelte-s6zq7o");
    			set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			set_style(div61, "flex", "1.4");
    			toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			add_location(div61, file, 268, 4, 9916);
    			attr_dev(div62, "class", "key svelte-s6zq7o");
    			set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			set_style(div62, "flex", "1.4");
    			toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			add_location(div62, file, 274, 4, 10124);
    			attr_dev(div63, "class", "key svelte-s6zq7o");
    			set_style(div63, "background-color", /*$keys*/ ctx[2]["rctrl"].color);
    			set_style(div63, "opacity", /*$keys*/ ctx[2]["rctrl"].opacity);
    			set_style(div63, "flex", "1.4");
    			toggle_class(div63, "show", /*$keys*/ ctx[2]["rctrl"].color);
    			add_location(div63, file, 280, 4, 10332);
    			attr_dev(div64, "class", "row svelte-s6zq7o");
    			add_location(div64, file, 243, 2, 9054);
    			attr_dev(div65, "class", "container svelte-s6zq7o");
    			set_style(div65, "max-height", /*height*/ ctx[1] + "px");
    			add_render_callback(() => /*div65_elementresize_handler*/ ctx[5].call(div65));
    			add_location(div65, file, 57, 0, 1112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div65, anchor);
    			append_dev(div65, div14);
    			append_dev(div14, div0);
    			append_dev(div0, t0);
    			append_dev(div14, t1);
    			append_dev(div14, div1);
    			append_dev(div1, t2);
    			append_dev(div14, t3);
    			append_dev(div14, div2);
    			append_dev(div2, t4);
    			append_dev(div14, t5);
    			append_dev(div14, div3);
    			append_dev(div3, t6);
    			append_dev(div14, t7);
    			append_dev(div14, div4);
    			append_dev(div4, t8);
    			append_dev(div14, t9);
    			append_dev(div14, div5);
    			append_dev(div5, t10);
    			append_dev(div14, t11);
    			append_dev(div14, div6);
    			append_dev(div6, t12);
    			append_dev(div14, t13);
    			append_dev(div14, div7);
    			append_dev(div7, t14);
    			append_dev(div14, t15);
    			append_dev(div14, div8);
    			append_dev(div8, t16);
    			append_dev(div14, t17);
    			append_dev(div14, div9);
    			append_dev(div9, t18);
    			append_dev(div14, t19);
    			append_dev(div14, div10);
    			append_dev(div10, t20);
    			append_dev(div14, t21);
    			append_dev(div14, div11);
    			append_dev(div11, t22);
    			append_dev(div14, t23);
    			append_dev(div14, div12);
    			append_dev(div12, t24);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div13, t26);
    			append_dev(div65, t27);
    			append_dev(div65, div29);
    			append_dev(div29, div15);
    			append_dev(div15, t28);
    			append_dev(div29, t29);
    			append_dev(div29, div16);
    			append_dev(div16, t30);
    			append_dev(div29, t31);
    			append_dev(div29, div17);
    			append_dev(div17, t32);
    			append_dev(div29, t33);
    			append_dev(div29, div18);
    			append_dev(div18, t34);
    			append_dev(div29, t35);
    			append_dev(div29, div19);
    			append_dev(div19, t36);
    			append_dev(div29, t37);
    			append_dev(div29, div20);
    			append_dev(div20, t38);
    			append_dev(div29, t39);
    			append_dev(div29, div21);
    			append_dev(div21, t40);
    			append_dev(div29, t41);
    			append_dev(div29, div22);
    			append_dev(div22, t42);
    			append_dev(div29, t43);
    			append_dev(div29, div23);
    			append_dev(div23, t44);
    			append_dev(div29, t45);
    			append_dev(div29, div24);
    			append_dev(div24, t46);
    			append_dev(div29, t47);
    			append_dev(div29, div25);
    			append_dev(div25, t48);
    			append_dev(div29, t49);
    			append_dev(div29, div26);
    			append_dev(div26, t50);
    			append_dev(div29, t51);
    			append_dev(div29, div27);
    			append_dev(div27, t52);
    			append_dev(div29, t53);
    			append_dev(div29, div28);
    			append_dev(div28, t54);
    			append_dev(div65, t55);
    			append_dev(div65, div43);
    			append_dev(div43, div30);
    			append_dev(div30, t56);
    			append_dev(div43, t57);
    			append_dev(div43, div31);
    			append_dev(div31, t58);
    			append_dev(div43, t59);
    			append_dev(div43, div32);
    			append_dev(div32, t60);
    			append_dev(div43, t61);
    			append_dev(div43, div33);
    			append_dev(div33, t62);
    			append_dev(div43, t63);
    			append_dev(div43, div34);
    			append_dev(div34, t64);
    			append_dev(div43, t65);
    			append_dev(div43, div35);
    			append_dev(div35, t66);
    			append_dev(div43, t67);
    			append_dev(div43, div36);
    			append_dev(div36, t68);
    			append_dev(div43, t69);
    			append_dev(div43, div37);
    			append_dev(div37, t70);
    			append_dev(div43, t71);
    			append_dev(div43, div38);
    			append_dev(div38, t72);
    			append_dev(div43, t73);
    			append_dev(div43, div39);
    			append_dev(div39, t74);
    			append_dev(div43, t75);
    			append_dev(div43, div40);
    			append_dev(div40, t76);
    			append_dev(div43, t77);
    			append_dev(div43, div41);
    			append_dev(div41, t78);
    			append_dev(div43, t79);
    			append_dev(div43, div42);
    			append_dev(div42, t80);
    			append_dev(div65, t81);
    			append_dev(div65, div56);
    			append_dev(div56, div44);
    			append_dev(div44, t82);
    			append_dev(div56, t83);
    			append_dev(div56, div45);
    			append_dev(div45, t84);
    			append_dev(div56, t85);
    			append_dev(div56, div46);
    			append_dev(div46, t86);
    			append_dev(div56, t87);
    			append_dev(div56, div47);
    			append_dev(div47, t88);
    			append_dev(div56, t89);
    			append_dev(div56, div48);
    			append_dev(div48, t90);
    			append_dev(div56, t91);
    			append_dev(div56, div49);
    			append_dev(div49, t92);
    			append_dev(div56, t93);
    			append_dev(div56, div50);
    			append_dev(div50, t94);
    			append_dev(div56, t95);
    			append_dev(div56, div51);
    			append_dev(div51, t96);
    			append_dev(div56, t97);
    			append_dev(div56, div52);
    			append_dev(div52, t98);
    			append_dev(div56, t99);
    			append_dev(div56, div53);
    			append_dev(div53, t100);
    			append_dev(div56, t101);
    			append_dev(div56, div54);
    			append_dev(div54, t102);
    			append_dev(div56, t103);
    			append_dev(div56, div55);
    			append_dev(div55, t104);
    			append_dev(div65, t105);
    			append_dev(div65, div64);
    			append_dev(div64, div57);
    			append_dev(div57, t106);
    			append_dev(div64, t107);
    			append_dev(div64, div58);
    			append_dev(div58, t108);
    			append_dev(div64, t109);
    			append_dev(div64, div59);
    			append_dev(div59, t110);
    			append_dev(div64, t111);
    			append_dev(div64, div60);
    			append_dev(div60, t112);
    			append_dev(div64, t113);
    			append_dev(div64, div61);
    			append_dev(div61, t114);
    			append_dev(div64, t115);
    			append_dev(div64, div62);
    			append_dev(div62, t116);
    			append_dev(div64, t117);
    			append_dev(div64, div63);
    			append_dev(div63, t118);
    			div65_resize_listener = add_resize_listener(div65, /*div65_elementresize_handler*/ ctx[5].bind(div65));
    			insert_dev(target, t119, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$keys*/ 4) && t0_value !== (t0_value = (/*$keys*/ ctx[2]["`"].show || "") + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div0, "background-color", /*$keys*/ ctx[2]["`"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div0, "show", /*$keys*/ ctx[2]["`"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t2_value !== (t2_value = (/*$keys*/ ctx[2]["1"].show || "") + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t4_value !== (t4_value = (/*$keys*/ ctx[2]["2"].show || "") + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t6_value !== (t6_value = (/*$keys*/ ctx[2]["3"].show || "") + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t8_value !== (t8_value = (/*$keys*/ ctx[2]["4"].show || "") + "")) set_data_dev(t8, t8_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t10_value !== (t10_value = (/*$keys*/ ctx[2]["5"].show || "") + "")) set_data_dev(t10, t10_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t12_value !== (t12_value = (/*$keys*/ ctx[2]["6"].show || "") + "")) set_data_dev(t12, t12_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t14_value !== (t14_value = (/*$keys*/ ctx[2]["7"].show || "") + "")) set_data_dev(t14, t14_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t16_value !== (t16_value = (/*$keys*/ ctx[2]["8"].show || "") + "")) set_data_dev(t16, t16_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t18_value !== (t18_value = (/*$keys*/ ctx[2]["9"].show || "") + "")) set_data_dev(t18, t18_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t20_value !== (t20_value = (/*$keys*/ ctx[2]["0"].show || "") + "")) set_data_dev(t20, t20_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t22_value !== (t22_value = (/*$keys*/ ctx[2]["-"].show || "") + "")) set_data_dev(t22, t22_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t24_value !== (t24_value = (/*$keys*/ ctx[2]["="].show || "") + "")) set_data_dev(t24, t24_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div12, "show", /*$keys*/ ctx[2]["="].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t26_value !== (t26_value = (/*$keys*/ ctx[2]["del"].show || "") + "")) set_data_dev(t26, t26_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div13, "background-color", /*$keys*/ ctx[2]["del"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div13, "opacity", /*$keys*/ ctx[2]["del"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div13, "show", /*$keys*/ ctx[2]["del"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t28_value !== (t28_value = (/*$keys*/ ctx[2]["tab"].show || "") + "")) set_data_dev(t28, t28_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div15, "background-color", /*$keys*/ ctx[2]["tab"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div15, "opacity", /*$keys*/ ctx[2]["tab"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div15, "show", /*$keys*/ ctx[2]["tab"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t30_value !== (t30_value = (/*$keys*/ ctx[2]["q"].show || "") + "")) set_data_dev(t30, t30_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div16, "background-color", /*$keys*/ ctx[2]["q"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t32_value !== (t32_value = (/*$keys*/ ctx[2]["w"].show || "") + "")) set_data_dev(t32, t32_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t34_value !== (t34_value = (/*$keys*/ ctx[2]["e"].show || "") + "")) set_data_dev(t34, t34_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t36_value !== (t36_value = (/*$keys*/ ctx[2]["r"].show || "") + "")) set_data_dev(t36, t36_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t38_value !== (t38_value = (/*$keys*/ ctx[2]["t"].show || "") + "")) set_data_dev(t38, t38_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t40_value !== (t40_value = (/*$keys*/ ctx[2]["y"].show || "") + "")) set_data_dev(t40, t40_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t42_value !== (t42_value = (/*$keys*/ ctx[2]["u"].show || "") + "")) set_data_dev(t42, t42_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t44_value !== (t44_value = (/*$keys*/ ctx[2]["i"].show || "") + "")) set_data_dev(t44, t44_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t46_value !== (t46_value = (/*$keys*/ ctx[2]["o"].show || "") + "")) set_data_dev(t46, t46_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t48_value !== (t48_value = (/*$keys*/ ctx[2]["p"].show || "") + "")) set_data_dev(t48, t48_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t50_value !== (t50_value = (/*$keys*/ ctx[2]["["].show || "") + "")) set_data_dev(t50, t50_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t52_value !== (t52_value = (/*$keys*/ ctx[2]["]"].show || "") + "")) set_data_dev(t52, t52_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t54_value !== (t54_value = (/*$keys*/ ctx[2]["\\"].show || "") + "")) set_data_dev(t54, t54_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div28, "show", /*$keys*/ ctx[2]["\\"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t56_value !== (t56_value = (/*$keys*/ ctx[2]["caps"].show || "") + "")) set_data_dev(t56, t56_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div30, "background-color", /*$keys*/ ctx[2]["caps"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div30, "opacity", /*$keys*/ ctx[2]["caps"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div30, "show", /*$keys*/ ctx[2]["caps"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t58_value !== (t58_value = (/*$keys*/ ctx[2]["a"].show || "") + "")) set_data_dev(t58, t58_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div31, "background-color", /*$keys*/ ctx[2]["a"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t60_value !== (t60_value = (/*$keys*/ ctx[2]["s"].show || "") + "")) set_data_dev(t60, t60_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t62_value !== (t62_value = (/*$keys*/ ctx[2]["d"].show || "") + "")) set_data_dev(t62, t62_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t64_value !== (t64_value = (/*$keys*/ ctx[2]["f"].show || "") + "")) set_data_dev(t64, t64_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t66_value !== (t66_value = (/*$keys*/ ctx[2]["g"].show || "") + "")) set_data_dev(t66, t66_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t68_value !== (t68_value = (/*$keys*/ ctx[2]["h"].show || "") + "")) set_data_dev(t68, t68_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t70_value !== (t70_value = (/*$keys*/ ctx[2]["j"].show || "") + "")) set_data_dev(t70, t70_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t72_value !== (t72_value = (/*$keys*/ ctx[2]["k"].show || "") + "")) set_data_dev(t72, t72_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t74_value !== (t74_value = (/*$keys*/ ctx[2]["l"].show || "") + "")) set_data_dev(t74, t74_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t76_value !== (t76_value = (/*$keys*/ ctx[2][";"].show || "") + "")) set_data_dev(t76, t76_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t78_value !== (t78_value = (/*$keys*/ ctx[2]["'"].show || "") + "")) set_data_dev(t78, t78_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t80_value !== (t80_value = (/*$keys*/ ctx[2]["enter"].show || "") + "")) set_data_dev(t80, t80_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t82_value !== (t82_value = (/*$keys*/ ctx[2]["lshift"].show || "") + "")) set_data_dev(t82, t82_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t84_value !== (t84_value = (/*$keys*/ ctx[2]["z"].show || "") + "")) set_data_dev(t84, t84_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t86_value !== (t86_value = (/*$keys*/ ctx[2]["x"].show || "") + "")) set_data_dev(t86, t86_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t88_value !== (t88_value = (/*$keys*/ ctx[2]["c"].show || "") + "")) set_data_dev(t88, t88_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t90_value !== (t90_value = (/*$keys*/ ctx[2]["v"].show || "") + "")) set_data_dev(t90, t90_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t92_value !== (t92_value = (/*$keys*/ ctx[2]["b"].show || "") + "")) set_data_dev(t92, t92_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t94_value !== (t94_value = (/*$keys*/ ctx[2]["n"].show || "") + "")) set_data_dev(t94, t94_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t96_value !== (t96_value = (/*$keys*/ ctx[2]["m"].show || "") + "")) set_data_dev(t96, t96_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t98_value !== (t98_value = (/*$keys*/ ctx[2][","].show || "") + "")) set_data_dev(t98, t98_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t100_value !== (t100_value = (/*$keys*/ ctx[2]["."].show || "") + "")) set_data_dev(t100, t100_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t102_value !== (t102_value = (/*$keys*/ ctx[2]["/"].show || "") + "")) set_data_dev(t102, t102_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t104_value !== (t104_value = (/*$keys*/ ctx[2]["rshift"].show || "") + "")) set_data_dev(t104, t104_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t106_value !== (t106_value = (/*$keys*/ ctx[2]["lctrl"].show || "") + "")) set_data_dev(t106, t106_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t108_value !== (t108_value = (/*$keys*/ ctx[2]["lopt"].show || "") + "")) set_data_dev(t108, t108_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t110_value !== (t110_value = (/*$keys*/ ctx[2]["lcmd"].show || "") + "")) set_data_dev(t110, t110_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t112_value !== (t112_value = (/*$keys*/ ctx[2]["space"].show || "") + "")) set_data_dev(t112, t112_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t114_value !== (t114_value = (/*$keys*/ ctx[2]["rcmd"].show || "") + "")) set_data_dev(t114, t114_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t116_value !== (t116_value = (/*$keys*/ ctx[2]["ropt"].show || "") + "")) set_data_dev(t116, t116_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t118_value !== (t118_value = (/*$keys*/ ctx[2]["rctrl"].show || "") + "")) set_data_dev(t118, t118_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div63, "background-color", /*$keys*/ ctx[2]["rctrl"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div63, "opacity", /*$keys*/ ctx[2]["rctrl"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div63, "show", /*$keys*/ ctx[2]["rctrl"].color);
    			}

    			if (!current || dirty & /*height*/ 2) {
    				set_style(div65, "max-height", /*height*/ ctx[1] + "px");
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div65);
    			div65_resize_listener();
    			if (detaching) detach_dev(t119);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $keys;
    	validate_store(keys, "keys");
    	component_subscribe($$self, keys, $$value => $$invalidate(2, $keys = $$value));
    	let w = 400;

    	onMount(() => {
    		keys.set($keys);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard", $$slots, ['default']);

    	function div65_elementresize_handler() {
    		w = this.clientWidth;
    		$$invalidate(0, w);
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ w, onMount, keys, height, $keys });

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    	};

    	let height;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*w*/ 1) {
    			 $$invalidate(1, height = w * 0.3);
    		}
    	};

    	return [w, height, $keys, $$scope, $$slots, div65_elementresize_handler];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var spencerColor = createCommonjsModule(function (module, exports) {
    !function(e){module.exports=e();}(function(){return function u(i,a,c){function f(r,e){if(!a[r]){if(!i[r]){var o="function"==typeof commonjsRequire&&commonjsRequire;if(!e&&o)return o(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var t=a[r]={exports:{}};i[r][0].call(t.exports,function(e){return f(i[r][1][e]||e)},t,t.exports,u,i,a,c);}return a[r].exports}for(var d="function"==typeof commonjsRequire&&commonjsRequire,e=0;e<c.length;e++)f(c[e]);return f}({1:[function(e,r,o){r.exports={blue:"#6699cc",green:"#6accb2",yellow:"#e1e6b3",red:"#cc7066",pink:"#F2C0BB",brown:"#705E5C",orange:"#cc8a66",purple:"#d8b3e6",navy:"#335799",olive:"#7f9c6c",fuscia:"#735873",beige:"#e6d7b3",slate:"#8C8C88",suede:"#9c896c",burnt:"#603a39",sea:"#50617A",sky:"#2D85A8",night:"#303b50",rouge:"#914045",grey:"#838B91",mud:"#C4ABAB",royal:"#275291",cherry:"#cc6966",tulip:"#e6b3bc",rose:"#D68881",fire:"#AB5850",greyblue:"#72697D",greygreen:"#8BA3A2",greypurple:"#978BA3",burn:"#6D5685",slategrey:"#bfb0b3",light:"#a3a5a5",lighter:"#d7d5d2",fudge:"#4d4d4d",lightgrey:"#949a9e",white:"#fbfbfb",dimgrey:"#606c74",softblack:"#463D4F",dark:"#443d3d",black:"#333333"};},{}],2:[function(e,r,o){var n=e("./colors"),t={juno:["blue","mud","navy","slate","pink","burn"],barrow:["rouge","red","orange","burnt","brown","greygreen"],roma:["#8a849a","#b5b0bf","rose","lighter","greygreen","mud"],palmer:["red","navy","olive","pink","suede","sky"],mark:["#848f9a","#9aa4ac","slate","#b0b8bf","mud","grey"],salmon:["sky","sea","fuscia","slate","mud","fudge"],dupont:["green","brown","orange","red","olive","blue"],bloor:["night","navy","beige","rouge","mud","grey"],yukon:["mud","slate","brown","sky","beige","red"],david:["blue","green","yellow","red","pink","light"],neste:["mud","cherry","royal","rouge","greygreen","greypurple"],ken:["red","sky","#c67a53","greygreen","#dfb59f","mud"]};Object.keys(t).forEach(function(e){t[e]=t[e].map(function(e){return n[e]||e});}),r.exports=t;},{"./colors":1}],3:[function(e,r,o){var n=e("./colors"),t=e("./combos"),u={colors:n,list:Object.keys(n).map(function(e){return n[e]}),combos:t};r.exports=u;},{"./colors":1,"./combos":2}]},{},[3])(3)});
    });

    /* Users/spencer/mountain/somehow-keyboard/src/Key.svelte generated by Svelte v3.24.1 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $keys;
    	validate_store(keys, "keys");
    	component_subscribe($$self, keys, $$value => $$invalidate(5, $keys = $$value));
    	let { key = "" } = $$props;
    	let { fill = "" } = $$props;
    	let { opacity = "1" } = $$props;
    	let { color = fill } = $$props;
    	color = spencerColor.colors[color] || color;
    	let { show = "" } = $$props;

    	if (key) {
    		set_store_value(keys, $keys[key] = { key, show, color, opacity }, $keys);
    	}

    	const writable_props = ["key", "fill", "opacity", "color", "show"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Key> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Key", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
    		if ("opacity" in $$props) $$invalidate(3, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("show" in $$props) $$invalidate(4, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		key,
    		fill,
    		opacity,
    		color,
    		c: spencerColor,
    		show,
    		onMount,
    		keys,
    		$keys
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    		if ("fill" in $$props) $$invalidate(2, fill = $$props.fill);
    		if ("opacity" in $$props) $$invalidate(3, opacity = $$props.opacity);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("show" in $$props) $$invalidate(4, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, key, fill, opacity, show];
    }

    class Key extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			key: 1,
    			fill: 2,
    			opacity: 3,
    			color: 0,
    			show: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Key",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get key() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/01.punctuation/Keyboard.2.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/01.punctuation/Keyboard.2.svelte";

    // (23:4) <Keyboard>
    function create_default_slot(ctx) {
    	let key0;
    	let t0;
    	let key1;
    	let t1;
    	let key2;
    	let t2;
    	let key3;
    	let t3;
    	let key4;
    	let t4;
    	let key5;
    	let t5;
    	let key6;
    	let t6;
    	let key7;
    	let t7;
    	let key8;
    	let t8;
    	let key9;
    	let t9;
    	let key10;
    	let t10;
    	let key11;
    	let t11;
    	let key12;
    	let t12;
    	let key13;
    	let t13;
    	let key14;
    	let t14;
    	let key15;
    	let t15;
    	let key16;
    	let t16;
    	let key17;
    	let t17;
    	let key18;
    	let t18;
    	let key19;
    	let t19;
    	let key20;
    	let t20;
    	let key21;
    	let t21;
    	let key22;
    	let t22;
    	let key23;
    	let t23;
    	let key24;
    	let t24;
    	let key25;
    	let t25;
    	let key26;
    	let t26;
    	let key27;
    	let t27;
    	let key28;
    	let t28;
    	let key29;
    	let t29;
    	let key30;
    	let t30;
    	let key31;
    	let t31;
    	let key32;
    	let t32;
    	let key33;
    	let current;

    	key0 = new Key({
    			props: { key: "`", fill: "rose", show: "~" },
    			$$inline: true
    		});

    	key1 = new Key({
    			props: { key: "1", fill: "rose", show: "!" },
    			$$inline: true
    		});

    	key2 = new Key({
    			props: { key: "2", fill: "rose", show: "@" },
    			$$inline: true
    		});

    	key3 = new Key({
    			props: { key: "3", fill: "rose", show: "#" },
    			$$inline: true
    		});

    	key4 = new Key({
    			props: { key: "4", fill: "rose", show: "$" },
    			$$inline: true
    		});

    	key5 = new Key({
    			props: { key: "5", fill: "rose", show: "%" },
    			$$inline: true
    		});

    	key6 = new Key({
    			props: { key: "6", fill: "rose", show: "^" },
    			$$inline: true
    		});

    	key7 = new Key({
    			props: { key: "7", fill: "rose", show: "&" },
    			$$inline: true
    		});

    	key8 = new Key({
    			props: { key: "8", fill: "rose", show: "*" },
    			$$inline: true
    		});

    	key9 = new Key({
    			props: { key: "9", fill: "rose", show: "(" },
    			$$inline: true
    		});

    	key10 = new Key({
    			props: { key: "0", fill: "rose", show: ")" },
    			$$inline: true
    		});

    	key11 = new Key({
    			props: { key: "-", fill: "rose", show: "_" },
    			$$inline: true
    		});

    	key12 = new Key({
    			props: { key: "=", fill: "rose", show: "+" },
    			$$inline: true
    		});

    	key13 = new Key({
    			props: { key: "[", fill: "rose", show: "[" },
    			$$inline: true
    		});

    	key14 = new Key({
    			props: { key: "]", fill: "rose", show: "]" },
    			$$inline: true
    		});

    	key15 = new Key({
    			props: { key: "\\", fill: "rose", show: "\\" },
    			$$inline: true
    		});

    	key16 = new Key({
    			props: { key: ";", fill: "rose", show: ";" },
    			$$inline: true
    		});

    	key17 = new Key({
    			props: { key: "'", fill: "rose", show: "'" },
    			$$inline: true
    		});

    	key18 = new Key({
    			props: { key: ",", fill: "rose", show: "," },
    			$$inline: true
    		});

    	key19 = new Key({
    			props: { key: ".", fill: "rose", show: "." },
    			$$inline: true
    		});

    	key20 = new Key({
    			props: { key: "/", fill: "rose", show: "/" },
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(key0.$$.fragment);
    			t0 = space();
    			create_component(key1.$$.fragment);
    			t1 = space();
    			create_component(key2.$$.fragment);
    			t2 = space();
    			create_component(key3.$$.fragment);
    			t3 = space();
    			create_component(key4.$$.fragment);
    			t4 = space();
    			create_component(key5.$$.fragment);
    			t5 = space();
    			create_component(key6.$$.fragment);
    			t6 = space();
    			create_component(key7.$$.fragment);
    			t7 = space();
    			create_component(key8.$$.fragment);
    			t8 = space();
    			create_component(key9.$$.fragment);
    			t9 = space();
    			create_component(key10.$$.fragment);
    			t10 = space();
    			create_component(key11.$$.fragment);
    			t11 = space();
    			create_component(key12.$$.fragment);
    			t12 = space();
    			create_component(key13.$$.fragment);
    			t13 = space();
    			create_component(key14.$$.fragment);
    			t14 = space();
    			create_component(key15.$$.fragment);
    			t15 = space();
    			create_component(key16.$$.fragment);
    			t16 = space();
    			create_component(key17.$$.fragment);
    			t17 = space();
    			create_component(key18.$$.fragment);
    			t18 = space();
    			create_component(key19.$$.fragment);
    			t19 = space();
    			create_component(key20.$$.fragment);
    			t20 = space();
    			create_component(key21.$$.fragment);
    			t21 = space();
    			create_component(key22.$$.fragment);
    			t22 = space();
    			create_component(key23.$$.fragment);
    			t23 = space();
    			create_component(key24.$$.fragment);
    			t24 = space();
    			create_component(key25.$$.fragment);
    			t25 = space();
    			create_component(key26.$$.fragment);
    			t26 = space();
    			create_component(key27.$$.fragment);
    			t27 = space();
    			create_component(key28.$$.fragment);
    			t28 = space();
    			create_component(key29.$$.fragment);
    			t29 = space();
    			create_component(key30.$$.fragment);
    			t30 = space();
    			create_component(key31.$$.fragment);
    			t31 = space();
    			create_component(key32.$$.fragment);
    			t32 = space();
    			create_component(key33.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(key1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(key2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(key3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(key4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(key5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(key6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(key7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(key8, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(key9, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(key10, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(key11, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(key12, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(key13, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(key14, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(key15, target, anchor);
    			insert_dev(target, t15, anchor);
    			mount_component(key16, target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(key17, target, anchor);
    			insert_dev(target, t17, anchor);
    			mount_component(key18, target, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(key19, target, anchor);
    			insert_dev(target, t19, anchor);
    			mount_component(key20, target, anchor);
    			insert_dev(target, t20, anchor);
    			mount_component(key21, target, anchor);
    			insert_dev(target, t21, anchor);
    			mount_component(key22, target, anchor);
    			insert_dev(target, t22, anchor);
    			mount_component(key23, target, anchor);
    			insert_dev(target, t23, anchor);
    			mount_component(key24, target, anchor);
    			insert_dev(target, t24, anchor);
    			mount_component(key25, target, anchor);
    			insert_dev(target, t25, anchor);
    			mount_component(key26, target, anchor);
    			insert_dev(target, t26, anchor);
    			mount_component(key27, target, anchor);
    			insert_dev(target, t27, anchor);
    			mount_component(key28, target, anchor);
    			insert_dev(target, t28, anchor);
    			mount_component(key29, target, anchor);
    			insert_dev(target, t29, anchor);
    			mount_component(key30, target, anchor);
    			insert_dev(target, t30, anchor);
    			mount_component(key31, target, anchor);
    			insert_dev(target, t31, anchor);
    			mount_component(key32, target, anchor);
    			insert_dev(target, t32, anchor);
    			mount_component(key33, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key0.$$.fragment, local);
    			transition_in(key1.$$.fragment, local);
    			transition_in(key2.$$.fragment, local);
    			transition_in(key3.$$.fragment, local);
    			transition_in(key4.$$.fragment, local);
    			transition_in(key5.$$.fragment, local);
    			transition_in(key6.$$.fragment, local);
    			transition_in(key7.$$.fragment, local);
    			transition_in(key8.$$.fragment, local);
    			transition_in(key9.$$.fragment, local);
    			transition_in(key10.$$.fragment, local);
    			transition_in(key11.$$.fragment, local);
    			transition_in(key12.$$.fragment, local);
    			transition_in(key13.$$.fragment, local);
    			transition_in(key14.$$.fragment, local);
    			transition_in(key15.$$.fragment, local);
    			transition_in(key16.$$.fragment, local);
    			transition_in(key17.$$.fragment, local);
    			transition_in(key18.$$.fragment, local);
    			transition_in(key19.$$.fragment, local);
    			transition_in(key20.$$.fragment, local);
    			transition_in(key21.$$.fragment, local);
    			transition_in(key22.$$.fragment, local);
    			transition_in(key23.$$.fragment, local);
    			transition_in(key24.$$.fragment, local);
    			transition_in(key25.$$.fragment, local);
    			transition_in(key26.$$.fragment, local);
    			transition_in(key27.$$.fragment, local);
    			transition_in(key28.$$.fragment, local);
    			transition_in(key29.$$.fragment, local);
    			transition_in(key30.$$.fragment, local);
    			transition_in(key31.$$.fragment, local);
    			transition_in(key32.$$.fragment, local);
    			transition_in(key33.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key0.$$.fragment, local);
    			transition_out(key1.$$.fragment, local);
    			transition_out(key2.$$.fragment, local);
    			transition_out(key3.$$.fragment, local);
    			transition_out(key4.$$.fragment, local);
    			transition_out(key5.$$.fragment, local);
    			transition_out(key6.$$.fragment, local);
    			transition_out(key7.$$.fragment, local);
    			transition_out(key8.$$.fragment, local);
    			transition_out(key9.$$.fragment, local);
    			transition_out(key10.$$.fragment, local);
    			transition_out(key11.$$.fragment, local);
    			transition_out(key12.$$.fragment, local);
    			transition_out(key13.$$.fragment, local);
    			transition_out(key14.$$.fragment, local);
    			transition_out(key15.$$.fragment, local);
    			transition_out(key16.$$.fragment, local);
    			transition_out(key17.$$.fragment, local);
    			transition_out(key18.$$.fragment, local);
    			transition_out(key19.$$.fragment, local);
    			transition_out(key20.$$.fragment, local);
    			transition_out(key21.$$.fragment, local);
    			transition_out(key22.$$.fragment, local);
    			transition_out(key23.$$.fragment, local);
    			transition_out(key24.$$.fragment, local);
    			transition_out(key25.$$.fragment, local);
    			transition_out(key26.$$.fragment, local);
    			transition_out(key27.$$.fragment, local);
    			transition_out(key28.$$.fragment, local);
    			transition_out(key29.$$.fragment, local);
    			transition_out(key30.$$.fragment, local);
    			transition_out(key31.$$.fragment, local);
    			transition_out(key32.$$.fragment, local);
    			transition_out(key33.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(key1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(key2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(key3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(key4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(key5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(key6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(key7, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(key8, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(key9, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(key10, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(key11, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(key12, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(key13, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(key14, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(key15, detaching);
    			if (detaching) detach_dev(t15);
    			destroy_component(key16, detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(key17, detaching);
    			if (detaching) detach_dev(t17);
    			destroy_component(key18, detaching);
    			if (detaching) detach_dev(t18);
    			destroy_component(key19, detaching);
    			if (detaching) detach_dev(t19);
    			destroy_component(key20, detaching);
    			if (detaching) detach_dev(t20);
    			destroy_component(key21, detaching);
    			if (detaching) detach_dev(t21);
    			destroy_component(key22, detaching);
    			if (detaching) detach_dev(t22);
    			destroy_component(key23, detaching);
    			if (detaching) detach_dev(t23);
    			destroy_component(key24, detaching);
    			if (detaching) detach_dev(t24);
    			destroy_component(key25, detaching);
    			if (detaching) detach_dev(t25);
    			destroy_component(key26, detaching);
    			if (detaching) detach_dev(t26);
    			destroy_component(key27, detaching);
    			if (detaching) detach_dev(t27);
    			destroy_component(key28, detaching);
    			if (detaching) detach_dev(t28);
    			destroy_component(key29, detaching);
    			if (detaching) detach_dev(t29);
    			destroy_component(key30, detaching);
    			if (detaching) detach_dev(t30);
    			destroy_component(key31, detaching);
    			if (detaching) detach_dev(t31);
    			destroy_component(key32, detaching);
    			if (detaching) detach_dev(t32);
    			destroy_component(key33, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(23:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
    	let t0;
    	let div2;
    	let li;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(keyboard.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			li = element("li");
    			li.textContent = "we're maxed for keys'";
    			attr_dev(div0, "class", "container svelte-1xizha2");
    			add_location(div0, file$1, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$1, 20, 0, 348);
    			add_location(li, file$1, 64, 2, 2048);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$1, 63, 0, 2026);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(keyboard, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const keyboard_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				keyboard_changes.$$scope = { dirty, ctx };
    			}

    			keyboard.$set(keyboard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard_2", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class Keyboard_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_2",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    // import App from './00.intro/Menu.svelte'
    // import App from './02.markup/Newline.svelte'
    // import App from './04.word-wrap/Wrap.svelte'
    // import App from './03.text-editor/Timeline.svelte'
    // import App from './demos/Demo.svelte'

    var app = new Keyboard_2({
      target: document.body,
    });

    // Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
    // Learn more: https://www.snowpack.dev/#hot-module-replacement
    if (undefined) {
      undefined.accept();
      undefined.dispose(() => {
        app.$destroy();
      });
    }

    return app;

}());
