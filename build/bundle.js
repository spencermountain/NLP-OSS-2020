
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/Start.svelte generated by Svelte v3.24.1 */

    const file = "src/Start.svelte";

    function create_fragment(ctx) {
    	let t0;
    	let div8;
    	let div7;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let div6;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t3;
    	let div5;
    	let t4;
    	let div4;
    	let t5;
    	let span;
    	let t7;
    	let div9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t2 = space();
    			div6 = element("div");
    			div3 = element("div");
    			img2 = element("img");
    			t3 = space();
    			div5 = element("div");
    			t4 = text("On typing\n        ");
    			div4 = element("div");
    			t5 = text("NLP-OSS 2020\n          ");
    			span = element("span");
    			span.textContent = "@spencermountain";
    			t7 = space();
    			div9 = element("div");
    			set_style(img0, "width", "450px");
    			if (img0.src !== (img0_src_value = "./src/01.keyboards/assets/wolfram-desk.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file, 30, 8, 503);
    			attr_dev(div0, "class", "square svelte-153lcxt");
    			add_location(div0, file, 29, 6, 474);
    			set_style(img1, "height", "320px");
    			if (img1.src !== (img1_src_value = "./src/02.markup/assets/injection.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file, 36, 8, 666);
    			attr_dev(div1, "class", "square svelte-153lcxt");
    			add_location(div1, file, 35, 6, 637);
    			attr_dev(div2, "class", "row svelte-153lcxt");
    			add_location(div2, file, 28, 4, 450);
    			set_style(img2, "width", "450px");
    			if (img2.src !== (img2_src_value = "./src/00.intro/assets/splash.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file, 45, 8, 858);
    			attr_dev(div3, "class", "square svelte-153lcxt");
    			add_location(div3, file, 44, 6, 829);
    			attr_dev(span, "class", "blue ");
    			add_location(span, file, 54, 10, 1082);
    			attr_dev(div4, "class", "f1");
    			add_location(div4, file, 52, 8, 1032);
    			attr_dev(div5, "class", "square f4 svelte-153lcxt");
    			add_location(div5, file, 50, 6, 982);
    			attr_dev(div6, "class", "row svelte-153lcxt");
    			add_location(div6, file, 43, 4, 805);
    			attr_dev(div7, "class", "container svelte-153lcxt");
    			add_location(div7, file, 27, 2, 422);
    			attr_dev(div8, "class", "box");
    			add_location(div8, file, 26, 0, 402);
    			attr_dev(div9, "class", "notes");
    			add_location(div9, file, 60, 0, 1181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div7, t2);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, img2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, t5);
    			append_dev(div4, span);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div9, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						document.body,
    						"keydown",
    						function () {
    							if (is_function(/*done*/ ctx[0])) /*done*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						document.body,
    						"click",
    						function () {
    							if (is_function(/*done*/ ctx[0])) /*done*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div9);
    			mounted = false;
    			run_all(dispose);
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
    	let { done = () => {
    		
    	} } = $$props;

    	let { doEnd } = $$props;
    	let { prev } = $$props;
    	const writable_props = ["done", "doEnd", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Start> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Start", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(0, done = $$props.done);
    		if ("doEnd" in $$props) $$invalidate(1, doEnd = $$props.doEnd);
    		if ("prev" in $$props) $$invalidate(2, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({ done, doEnd, prev });

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(0, done = $$props.done);
    		if ("doEnd" in $$props) $$invalidate(1, doEnd = $$props.doEnd);
    		if ("prev" in $$props) $$invalidate(2, prev = $$props.prev);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [done, doEnd, prev];
    }

    class Start extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { done: 0, doEnd: 1, prev: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Start",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*doEnd*/ ctx[1] === undefined && !("doEnd" in props)) {
    			console.warn("<Start> was created without expected prop 'doEnd'");
    		}

    		if (/*prev*/ ctx[2] === undefined && !("prev" in props)) {
    			console.warn("<Start> was created without expected prop 'prev'");
    		}
    	}

    	get done() {
    		throw new Error("<Start>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<Start>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<Start>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<Start>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<Start>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<Start>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const keypress = function (e, i) {
      if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 40) {
        e.preventDefault();
        return i + 1
      }
      if (e.keyCode === 37 || e.keyCode === 38) {
        e.preventDefault();
        i = i - 1;
        i = i < 0 ? 0 : i; // dont go under 0
        return i
      }
      return i
    };

    /* src/Components/Image.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/Components/Image.svelte";

    // (51:0) {#if title}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*sub*/ ctx[2]);
    			attr_dev(div0, "class", "title svelte-1kxjpgs");
    			add_location(div0, file$1, 52, 4, 972);
    			attr_dev(div1, "class", "sub svelte-1kxjpgs");
    			add_location(div1, file$1, 53, 4, 1009);
    			attr_dev(div2, "class", "caption svelte-1kxjpgs");
    			add_location(div2, file$1, 51, 2, 946);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);
    			if (dirty & /*sub*/ 4) set_data_dev(t2, /*sub*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let img;
    	let img_src_value;
    	let if_block = /*title*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			attr_dev(img, "class", "img svelte-1kxjpgs");
    			set_style(img, "margin-bottom", "0px");
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 56, 0, 1053);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*src*/ 1 && img.src !== (img_src_value = /*src*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
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
    	let { src = "" } = $$props;
    	let { title = "" } = $$props;
    	let { sub = "" } = $$props;
    	const writable_props = ["src", "title", "sub"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Image", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("sub" in $$props) $$invalidate(2, sub = $$props.sub);
    	};

    	$$self.$capture_state = () => ({ src, title, sub });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("sub" in $$props) $$invalidate(2, sub = $$props.sub);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, title, sub];
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { src: 0, title: 1, sub: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get src() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/00.intro/Compromise.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/00.intro/Compromise.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			li0 = element("li");
    			li0.textContent = "8 years - compromise";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "chatbots, question-answering, classification";
    			attr_dev(img, "class", "img");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/compromise.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 19, 4, 400);
    			attr_dev(div0, "class", "row svelte-1mnnj7d");
    			add_location(div0, file$2, 17, 2, 288);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$2, 16, 0, 268);
    			add_location(li0, file$2, 23, 2, 508);
    			add_location(li1, file$2, 24, 2, 540);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$2, 22, 0, 486);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compromise> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Compromise", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Compromise extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compromise",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/00.intro/Compromise-history.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/00.intro/Compromise-history.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			li0 = element("li");
    			li0.textContent = "200 releases over 6 years";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "100 contributors";
    			attr_dev(img, "class", "img svelte-1oc9eez");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/compromise-history.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 21, 4, 345);
    			attr_dev(div0, "class", "row svelte-1oc9eez");
    			add_location(div0, file$3, 20, 2, 323);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$3, 19, 0, 303);
    			add_location(li0, file$3, 28, 2, 479);
    			add_location(li1, file$3, 29, 2, 516);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$3, 27, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compromise_history> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Compromise_history", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Compromise_history extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compromise_history",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/00.intro/Compromise-size.svelte generated by Svelte v3.24.1 */
    const file$4 = "src/00.intro/Compromise-size.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let li;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			li = element("li");
    			li.textContent = "170kb";
    			attr_dev(img, "class", "img svelte-1oc9eez");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/compromise-size.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 21, 4, 345);
    			attr_dev(div0, "class", "row svelte-1oc9eez");
    			add_location(div0, file$4, 20, 2, 323);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$4, 19, 0, 303);
    			add_location(li, file$4, 25, 2, 458);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$4, 24, 0, 436);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compromise_size> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Compromise_size", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Compromise_size extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compromise_size",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/00.intro/Compromise-latency.svelte generated by Svelte v3.24.1 */
    const file$5 = "src/00.intro/Compromise-latency.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			li0 = element("li");
    			li0.textContent = "fast-enough to run on keypress";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "i wanna talk about this -";
    			attr_dev(img, "class", "img svelte-1oc9eez");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/compromise-latency.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 21, 4, 345);
    			attr_dev(div0, "class", "row svelte-1oc9eez");
    			add_location(div0, file$5, 20, 2, 323);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$5, 19, 0, 303);
    			add_location(li0, file$5, 28, 2, 479);
    			add_location(li1, file$5, 29, 2, 521);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$5, 27, 0, 457);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compromise_latency> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Compromise_latency", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Compromise_latency extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compromise_latency",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/00.intro/Compromise-accuracy.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/00.intro/Compromise-accuracy.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let li;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			li = element("li");
    			li.textContent = "170kb";
    			attr_dev(img, "class", "img svelte-1oc9eez");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/compromise-accuracy.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 21, 4, 345);
    			attr_dev(div0, "class", "row svelte-1oc9eez");
    			add_location(div0, file$6, 20, 2, 323);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$6, 19, 0, 303);
    			add_location(li, file$6, 28, 2, 480);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$6, 27, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compromise_accuracy> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Compromise_accuracy", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Compromise_accuracy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compromise_accuracy",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/00.intro/Resolution-1.svelte generated by Svelte v3.24.1 */

    const file$7 = "src/00.intro/Resolution-1.svelte";

    function create_fragment$7(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div8;
    	let li;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "◻️ - go to germany";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "◻️ - start swimming at the Ymca";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "◻️ - hang-out at the reference library";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "◻️ - describe my ideal computer";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "◻️ - play badminton";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "◻️ - go to the symphony";
    			t11 = space();
    			div8 = element("div");
    			li = element("li");
    			li.textContent = "believer in new years resolutions";
    			attr_dev(div0, "class", "todo svelte-tvmeqn");
    			add_location(div0, file$7, 23, 4, 323);
    			attr_dev(div1, "class", "todo svelte-tvmeqn");
    			add_location(div1, file$7, 24, 4, 370);
    			attr_dev(div2, "class", "todo svelte-tvmeqn");
    			add_location(div2, file$7, 25, 4, 430);
    			attr_dev(div3, "class", "todo svelte-tvmeqn");
    			add_location(div3, file$7, 26, 4, 497);
    			attr_dev(div4, "class", "todo svelte-tvmeqn");
    			add_location(div4, file$7, 27, 4, 557);
    			attr_dev(div5, "class", "todo svelte-tvmeqn");
    			add_location(div5, file$7, 28, 4, 605);
    			attr_dev(div6, "class", "main svelte-tvmeqn");
    			add_location(div6, file$7, 22, 2, 300);
    			attr_dev(div7, "class", "box dark svelte-tvmeqn");
    			add_location(div7, file$7, 21, 0, 275);
    			add_location(li, file$7, 33, 2, 692);
    			attr_dev(div8, "class", "notes");
    			add_location(div8, file$7, 32, 0, 670);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resolution_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Resolution_1", $$slots, []);
    	return [];
    }

    class Resolution_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_1",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/00.intro/Resolution-2.svelte generated by Svelte v3.24.1 */

    const file$8 = "src/00.intro/Resolution-2.svelte";

    function create_fragment$8(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div8;
    	let li;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "◻️ - go to germany";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "◻️ - start swimming at the Ymca";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "◻️ - hang-out at the reference library";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "◻️ - describe my ideal computer";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "◻️ - play badminton";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "◻️ - go to the symphony";
    			t11 = space();
    			div8 = element("div");
    			li = element("li");
    			li.textContent = "covid";
    			attr_dev(div0, "class", "todo nope svelte-1opvdga");
    			add_location(div0, file$8, 28, 4, 414);
    			attr_dev(div1, "class", "todo nope svelte-1opvdga");
    			add_location(div1, file$8, 29, 4, 466);
    			attr_dev(div2, "class", "todo nope svelte-1opvdga");
    			add_location(div2, file$8, 30, 4, 531);
    			attr_dev(div3, "class", "todo svelte-1opvdga");
    			add_location(div3, file$8, 31, 4, 603);
    			attr_dev(div4, "class", "todo nope svelte-1opvdga");
    			add_location(div4, file$8, 32, 4, 663);
    			attr_dev(div5, "class", "todo nope svelte-1opvdga");
    			add_location(div5, file$8, 33, 4, 716);
    			attr_dev(div6, "class", "main svelte-1opvdga");
    			add_location(div6, file$8, 27, 2, 391);
    			attr_dev(div7, "class", "box dark svelte-1opvdga");
    			add_location(div7, file$8, 26, 0, 366);
    			add_location(li, file$8, 38, 2, 808);
    			attr_dev(div8, "class", "notes");
    			add_location(div8, file$8, 37, 0, 786);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Resolution_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Resolution_2", $$slots, []);
    	return [];
    }

    class Resolution_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_2",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Components/Video.svelte generated by Svelte v3.24.1 */

    const file$9 = "src/Components/Video.svelte";

    // (45:0) {#if title}
    function create_if_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*sub*/ ctx[2]);
    			attr_dev(div0, "class", "title svelte-4aow99");
    			add_location(div0, file$9, 46, 4, 801);
    			attr_dev(div1, "class", "sub svelte-4aow99");
    			add_location(div1, file$9, 47, 4, 838);
    			attr_dev(div2, "class", "caption svelte-4aow99");
    			add_location(div2, file$9, 45, 2, 775);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);
    			if (dirty & /*sub*/ 4) set_data_dev(t2, /*sub*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(45:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let div;
    	let video;
    	let track;
    	let video_src_value;
    	let if_block = /*title*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			video = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$9, 52, 4, 953);
    			attr_dev(video, "class", "vid svelte-4aow99");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.loop = /*loop*/ ctx[3];
    			video.autoplay = true;
    			video.muted = true;
    			add_location(video, file$9, 51, 2, 901);
    			attr_dev(div, "class", "m3");
    			add_location(div, file$9, 50, 0, 882);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, video);
    			append_dev(video, track);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*title*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*src*/ 1 && video.src !== (video_src_value = /*src*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*loop*/ 8) {
    				prop_dev(video, "loop", /*loop*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { src = "" } = $$props;
    	let { title = "" } = $$props;
    	let { sub = "" } = $$props;
    	let { loop = false } = $$props;
    	const writable_props = ["src", "title", "sub", "loop"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Video", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("sub" in $$props) $$invalidate(2, sub = $$props.sub);
    		if ("loop" in $$props) $$invalidate(3, loop = $$props.loop);
    	};

    	$$self.$capture_state = () => ({ src, title, sub, loop });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("sub" in $$props) $$invalidate(2, sub = $$props.sub);
    		if ("loop" in $$props) $$invalidate(3, loop = $$props.loop);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, title, sub, loop];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { src: 0, title: 1, sub: 2, loop: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get src() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const wait = async function (time = 1.2, fn) {
      return new Promise((resolve) =>
        setTimeout(() => {
          fn();
          resolve();
        }, time * 1000)
      )
    };

    /* src/00.intro/Concept.1.svelte generated by Svelte v3.24.1 */
    const file$a = "src/00.intro/Concept.1.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$a, 24, 0, 497);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/00.intro/assets/mercury-os.mp4",
    		title: "MercuryOs",
    		sub: "by Jason Yuan"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Concept_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Concept_1", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Concept_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Concept_1",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/00.intro/Concept.2.svelte generated by Svelte v3.24.1 */
    const file$b = "src/00.intro/Concept.2.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$b, 19, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/00.intro/assets/desktop-neo.mp4",
    		title: "Desktop Neo",
    		sub: "by Lennart Ziburski"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Concept_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Concept_2", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Concept_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Concept_2",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/00.intro/Concept.3.svelte generated by Svelte v3.24.1 */
    const file$c = "src/00.intro/Concept.3.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$c, 14, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/00.intro/assets/vr-os.mp4",
    		title: "VR-OS",
    		sub: "by Matthaeus Krenn"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Concept_3> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Concept_3", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Concept_3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Concept_3",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/00.intro/Shoulders.svelte generated by Svelte v3.24.1 */
    const file$d = "src/00.intro/Shoulders.svelte";

    function create_fragment$d(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let image;
    	let t1;
    	let div3;
    	let li0;
    	let t3;
    	let li1;
    	let t5;
    	let li2;
    	let current;
    	const image_spread_levels = [/*commits*/ ctx[0]];
    	let image_props = {};

    	for (let i = 0; i < image_spread_levels.length; i += 1) {
    		image_props = assign(image_props, image_spread_levels[i]);
    	}

    	image = new Image({ props: image_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			create_component(image.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			li0 = element("li");
    			li0.textContent = "thinking abt my posture";
    			t3 = space();
    			li1 = element("li");
    			li1.textContent = "what would it mean to be good at a computer?";
    			t5 = space();
    			li2 = element("li");
    			li2.textContent = "even if I had a good O/s, still have problems";
    			attr_dev(img, "class", "img svelte-4kxeno");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/arms.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$d, 28, 4, 470);
    			attr_dev(div0, "class", "background svelte-4kxeno");
    			add_location(div0, file$d, 27, 2, 441);
    			attr_dev(div1, "class", "mid svelte-4kxeno");
    			add_location(div1, file$d, 30, 2, 545);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$d, 26, 0, 421);
    			add_location(li0, file$d, 36, 2, 629);
    			add_location(li1, file$d, 37, 2, 664);
    			add_location(li2, file$d, 38, 2, 720);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$d, 35, 0, 607);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(image, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li0);
    			append_dev(div3, t3);
    			append_dev(div3, li1);
    			append_dev(div3, t5);
    			append_dev(div3, li2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_changes = (dirty & /*commits*/ 1)
    			? get_spread_update(image_spread_levels, [get_spread_object(/*commits*/ ctx[0])])
    			: {};

    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(image);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let commits = {
    		src: "./src/00.intro/assets/commit-graph.png"
    	};

    	let arms = { src: "./src/00.intro/assets/arms.png" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Shoulders> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Shoulders", $$slots, []);
    	$$self.$capture_state = () => ({ Image, commits, arms });

    	$$self.$inject_state = $$props => {
    		if ("commits" in $$props) $$invalidate(0, commits = $$props.commits);
    		if ("arms" in $$props) arms = $$props.arms;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [commits];
    }

    class Shoulders extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shoulders",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/00.intro/Bear.svelte generated by Svelte v3.24.1 */
    const file$e = "src/00.intro/Bear.svelte";

    function create_fragment$e(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "product manager used it";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "mesmerizing to watch";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$e, 9, 0, 180);
    			add_location(li0, file$e, 13, 2, 250);
    			add_location(li1, file$e, 14, 2, 285);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$e, 12, 0, 228);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/00.intro/assets/bear.png",
    		title: "Bear App",
    		sub: "by Shiny Frog"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Bear> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Bear", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Bear extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bear",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/00.intro/FigureSkating.svelte generated by Svelte v3.24.1 */
    const file$f = "src/00.intro/FigureSkating.svelte";

    function create_fragment$f(ctx) {
    	let div1;
    	let div0;
    	let video_1;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(video_1.$$.fragment);
    			t0 = space();
    			div2 = element("div");
    			li0 = element("li");
    			li0.textContent = "bicyle for the mind";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "smooth and comfortable fig skating routine";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "how much of this is the keyboard?";
    			attr_dev(div0, "class", "m3");
    			add_location(div0, file$f, 14, 2, 231);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$f, 13, 0, 211);
    			add_location(li0, file$f, 19, 2, 311);
    			add_location(li1, file$f, 20, 2, 342);
    			add_location(li2, file$f, 21, 2, 396);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$f, 18, 0, 289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(video_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    			append_dev(div2, t4);
    			append_dev(div2, li2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(video_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/00.intro/assets/kurt-1994.mp4",
    		loop: true
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FigureSkating> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("FigureSkating", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class FigureSkating extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FigureSkating",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/00.intro/Question.svelte generated by Svelte v3.24.1 */

    const file$g = "src/00.intro/Question.svelte";

    function create_fragment$g(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let span;
    	let t4;
    	let div2;
    	let t6;
    	let div5;
    	let li;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "what if a computer";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("was just a\n      ");
    			span = element("span");
    			span.textContent = "really good";
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "text editor?";
    			t6 = space();
    			div5 = element("div");
    			li = element("li");
    			li.textContent = "no interface is ever gonna beat it";
    			add_location(div0, file$g, 23, 4, 296);
    			attr_dev(span, "class", "red i");
    			add_location(span, file$g, 26, 6, 371);
    			attr_dev(div1, "class", "med svelte-10y1wyx");
    			add_location(div1, file$g, 24, 4, 330);
    			attr_dev(div2, "class", "blue med goright svelte-10y1wyx");
    			add_location(div2, file$g, 28, 4, 425);
    			add_location(div3, file$g, 22, 2, 286);
    			attr_dev(div4, "class", "box big svelte-10y1wyx");
    			add_location(div4, file$g, 21, 0, 262);
    			add_location(li, file$g, 32, 2, 512);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$g, 31, 0, 490);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div1, span);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Question", $$slots, []);
    	return [];
    }

    class Question extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/00.intro/Menu.svelte generated by Svelte v3.24.1 */
    const file$h = "src/00.intro/Menu.svelte";

    function create_fragment$h(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div6;
    	let div5;
    	let div1;
    	let span0;
    	let t2;
    	let t3;
    	let div2;
    	let span1;
    	let t5;
    	let t6;
    	let div3;
    	let span2;
    	let t8;
    	let t9;
    	let div4;
    	let span3;
    	let t11;
    	let t12;
    	let div9;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "1)";
    			t2 = text("\n          Keyboards");
    			t3 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "2)";
    			t5 = text("\n          Markup languages");
    			t6 = space();
    			div3 = element("div");
    			span2 = element("span");
    			span2.textContent = "3)";
    			t8 = text("\n          Text-editors");
    			t9 = space();
    			div4 = element("div");
    			span3 = element("span");
    			span3.textContent = "4)";
    			t11 = text("\n          Novel interactions");
    			t12 = space();
    			div9 = element("div");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/cn-tower-jump.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$h, 30, 6, 533);
    			set_style(div0, "width", "450px");
    			add_location(div0, file$h, 29, 4, 500);
    			attr_dev(span0, "class", "num red svelte-1spno7j");
    			add_location(span0, file$h, 35, 10, 699);
    			attr_dev(div1, "class", "f2 svelte-1spno7j");
    			add_location(div1, file$h, 34, 8, 672);
    			attr_dev(span1, "class", "num pink svelte-1spno7j");
    			add_location(span1, file$h, 39, 10, 801);
    			attr_dev(div2, "class", "f2 svelte-1spno7j");
    			add_location(div2, file$h, 38, 8, 774);
    			attr_dev(span2, "class", "num rose svelte-1spno7j");
    			add_location(span2, file$h, 43, 10, 911);
    			attr_dev(div3, "class", "f2 svelte-1spno7j");
    			add_location(div3, file$h, 42, 8, 884);
    			attr_dev(span3, "class", "num svelte-1spno7j");
    			add_location(span3, file$h, 48, 10, 1080);
    			attr_dev(div4, "class", "f2 rouge svelte-1spno7j");
    			add_location(div4, file$h, 47, 8, 1047);
    			set_style(div5, "text-align", "left");
    			attr_dev(div5, "class", "ml3");
    			add_location(div5, file$h, 33, 6, 621);
    			add_location(div6, file$h, 32, 4, 609);
    			attr_dev(div7, "class", "row svelte-1spno7j");
    			add_location(div7, file$h, 28, 2, 478);
    			attr_dev(div8, "class", "box");
    			add_location(div8, file$h, 27, 0, 458);
    			attr_dev(div9, "class", "notes");
    			add_location(div9, file$h, 55, 0, 1192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, img);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, span1);
    			append_dev(div2, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			append_dev(div3, span2);
    			append_dev(div3, t8);
    			append_dev(div5, t9);
    			append_dev(div5, div4);
    			append_dev(div4, span3);
    			append_dev(div4, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div9, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Menu", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/00.intro/2020.svelte generated by Svelte v3.24.1 */

    const file$i = "src/00.intro/2020.svelte";

    function create_fragment$i(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let span;
    	let t2;
    	let div3;
    	let li;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text("ok\n      ");
    			span = element("span");
    			span.textContent = "2020";
    			t2 = space();
    			div3 = element("div");
    			li = element("li");
    			li.textContent = "i'm a believer in new-years resolutions";
    			attr_dev(span, "class", "red i");
    			add_location(span, file$i, 25, 6, 329);
    			attr_dev(div0, "class", "med svelte-10y1wyx");
    			add_location(div0, file$i, 23, 4, 296);
    			add_location(div1, file$i, 22, 2, 286);
    			attr_dev(div2, "class", "box big svelte-10y1wyx");
    			add_location(div2, file$i, 21, 0, 262);
    			add_location(li, file$i, 30, 2, 410);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$i, 29, 0, 388);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_2020> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_2020", $$slots, []);
    	return [];
    }

    class _2020 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_2020",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/00.intro/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$j(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;

    	let steps = [
    		// Splash,
    		Compromise,
    		Compromise_history,
    		Compromise_accuracy,
    		Compromise_size,
    		Compromise_latency,
    		_2020,
    		Resolution_1,
    		Resolution_2,
    		Concept_1,
    		Concept_2,
    		Concept_3,
    		Shoulders,
    		Bear,
    		FigureSkating,
    		Question,
    		// LoveTyping,
    		Menu
    	];

    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_00_intro> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_00_intro", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Compromise,
    		History: Compromise_history,
    		Size: Compromise_size,
    		Latency: Compromise_latency,
    		Accuracy: Compromise_accuracy,
    		Resolution1: Resolution_1,
    		Resolution2: Resolution_2,
    		Concept1: Concept_1,
    		Concept2: Concept_2,
    		Concept3: Concept_3,
    		Shoulders,
    		Bear,
    		FigureSkating,
    		Question,
    		Menu,
    		So2020: _2020,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _00_intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_00_intro",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get done() {
    		throw new Error("<_00_intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_00_intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_00_intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_00_intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_00_intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_00_intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/01.keyboards/OscarsTalk.svelte generated by Svelte v3.24.1 */
    const file$j = "src/01.keyboards/OscarsTalk.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$j, 14, 0, 277);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/01.keyboards/assets/oscars-talk.mp4",
    		title: "Taika Waititi",
    		sub: "at the 2020 Oscars",
    		mute: false
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OscarsTalk> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("OscarsTalk", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class OscarsTalk extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OscarsTalk",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/01.keyboards/Mjackson.svelte generated by Svelte v3.24.1 */
    const file$k = "src/01.keyboards/Mjackson.svelte";

    function create_fragment$l(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li = element("li");
    			li.textContent = "2019";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$k, 7, 0, 139);
    			add_location(li, file$k, 11, 2, 209);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$k, 10, 0, 187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.keyboards/assets/mjackson.png"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Mjackson> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Mjackson", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Mjackson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mjackson",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/01.keyboards/Desks.svelte generated by Svelte v3.24.1 */

    const file$l = "src/01.keyboards/Desks.svelte";

    function create_fragment$m(ctx) {
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let div1;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let img4;
    	let img4_src_value;
    	let t4;
    	let img5;
    	let img5_src_value;
    	let t5;
    	let div3;
    	let li0;
    	let t7;
    	let li1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			img2 = element("img");
    			t2 = space();
    			div1 = element("div");
    			img3 = element("img");
    			t3 = space();
    			img4 = element("img");
    			t4 = space();
    			img5 = element("img");
    			t5 = space();
    			div3 = element("div");
    			li0 = element("li");
    			li0.textContent = "most important developers";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "wobbling aruond on pizza cartons";
    			if (img0.src !== (img0_src_value = "./src/01.keyboards/assets/desks/one.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$l, 10, 4, 82);
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/desks/two.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$l, 11, 4, 147);
    			if (img2.src !== (img2_src_value = "./src/01.keyboards/assets/desks/three.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$l, 12, 4, 212);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$l, 9, 2, 60);
    			if (img3.src !== (img3_src_value = "./src/01.keyboards/assets/desks/four.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$l, 15, 4, 308);
    			if (img4.src !== (img4_src_value = "./src/01.keyboards/assets/desks/five.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$l, 16, 4, 374);
    			if (img5.src !== (img5_src_value = "./src/01.keyboards/assets/desks/six.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$l, 17, 4, 440);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$l, 14, 2, 286);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$l, 8, 0, 40);
    			add_location(li0, file$l, 22, 2, 540);
    			add_location(li1, file$l, 23, 2, 577);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$l, 21, 0, 518);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div0, t1);
    			append_dev(div0, img2);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, img3);
    			append_dev(div1, t3);
    			append_dev(div1, img4);
    			append_dev(div1, t4);
    			append_dev(div1, img5);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li0);
    			append_dev(div3, t7);
    			append_dev(div3, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Desks> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Desks", $$slots, []);
    	return [];
    }

    class Desks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Desks",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/01.keyboards/ISSKeyboard.svelte generated by Svelte v3.24.1 */
    const file$m = "src/01.keyboards/ISSKeyboard.svelte";

    function create_fragment$n(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "Nikolai Budarin";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "our workbench!";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "depending on how you do the math, costs 1-7 million $ / day";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$m, 14, 0, 228);
    			add_location(li0, file$m, 19, 2, 299);
    			add_location(li1, file$m, 20, 2, 326);
    			add_location(li2, file$m, 21, 2, 352);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$m, 18, 0, 277);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			append_dev(div1, t4);
    			append_dev(div1, li2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.keyboards/assets/iss-laptop.jpg",
    		title: "",
    		sub: ""
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ISSKeyboard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ISSKeyboard", $$slots, []);
    	$$self.$capture_state = () => ({ Image, wait, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class ISSKeyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ISSKeyboard",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/01.keyboards/TonyAbra.svelte generated by Svelte v3.24.1 */

    const file$n = "src/01.keyboards/TonyAbra.svelte";

    function create_fragment$o(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div3;
    	let t2;
    	let div2;
    	let t4;
    	let div5;
    	let li;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div3 = element("div");
    			t2 = text("Tony Abraham\n    ");
    			div2 = element("div");
    			div2.textContent = "Advanced Ergonomic Desk Concepts";
    			t4 = space();
    			div5 = element("div");
    			li = element("li");
    			li.textContent = "Tony Abraham - portland";
    			set_style(img0, "height", "350px");
    			if (img0.src !== (img0_src_value = "./src/01.keyboards/assets/tony-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$n, 28, 6, 472);
    			set_style(img1, "height", "350px");
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/tony-3.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$n, 32, 6, 582);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$n, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$n, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$n, 40, 4, 746);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$n, 38, 2, 708);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$n, 25, 0, 406);
    			add_location(li, file$n, 45, 2, 844);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$n, 44, 0, 822);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TonyAbra> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TonyAbra", $$slots, []);
    	return [];
    }

    class TonyAbra extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TonyAbra",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/01.keyboards/ZoeSmith.svelte generated by Svelte v3.24.1 */

    const file$o = "src/01.keyboards/ZoeSmith.svelte";

    function create_fragment$p(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div3;
    	let t2;
    	let div2;
    	let t4;
    	let div5;
    	let li;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div3 = element("div");
    			t2 = text("Zoë Smith\n    ");
    			div2 = element("div");
    			div2.textContent = "w/ Varier balans rocker";
    			t4 = space();
    			div5 = element("div");
    			li = element("li");
    			li.textContent = "Zoë Smith - ios engineer";
    			set_style(img0, "height", "500px");
    			if (img0.src !== (img0_src_value = "./src/01.keyboards/assets/zoe-smith.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$o, 28, 6, 472);
    			set_style(img1, "height", "450px");
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/zoe-2.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$o, 32, 6, 585);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$o, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$o, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$o, 40, 4, 746);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$o, 38, 2, 711);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$o, 25, 0, 406);
    			add_location(li, file$o, 45, 2, 835);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$o, 44, 0, 813);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, img1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ZoeSmith> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ZoeSmith", $$slots, []);
    	return [];
    }

    class ZoeSmith extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoeSmith",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/01.keyboards/HandKeyboards.svelte generated by Svelte v3.24.1 */

    const file$p = "src/01.keyboards/HandKeyboards.svelte";

    function create_fragment$q(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let video;
    	let track;
    	let video_src_value;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div3;
    	let t2;
    	let div2;
    	let t4;
    	let div5;
    	let li0;
    	let t6;
    	let li1;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div3 = element("div");
    			t2 = text("Steve Mann\n    ");
    			div2 = element("div");
    			div2.textContent = "'septambic keyer'";
    			t4 = space();
    			div5 = element("div");
    			li0 = element("li");
    			li0.textContent = "Left: Children of men";
    			t6 = space();
    			li1 = element("li");
    			li1.textContent = "Right: Septambic keyer";
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$p, 34, 8, 633);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = "./src/01.keyboards/assets/hand-computer.mp4")) attr_dev(video, "src", video_src_value);
    			video.loop = "true";
    			video.autoplay = true;
    			video.muted = true;
    			add_location(video, file$p, 28, 6, 472);
    			set_style(img, "height", "300px");
    			if (img.src !== (img_src_value = "./src/01.keyboards/assets/septambic.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$p, 36, 6, 680);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$p, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$p, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$p, 44, 4, 845);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$p, 42, 2, 809);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$p, 25, 0, 406);
    			add_location(li0, file$p, 49, 2, 928);
    			add_location(li1, file$p, 50, 2, 961);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$p, 48, 0, 906);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, video);
    			append_dev(video, track);
    			append_dev(div0, t0);
    			append_dev(div0, img);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li0);
    			append_dev(div5, t6);
    			append_dev(div5, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HandKeyboards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HandKeyboards", $$slots, []);
    	return [];
    }

    class HandKeyboards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HandKeyboards",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/01.keyboards/Wolfram.svelte generated by Svelte v3.24.1 */

    const file$q = "src/01.keyboards/Wolfram.svelte";

    function create_fragment$r(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t1;
    	let br0;
    	let t2;
    	let br1;
    	let t3;
    	let br2;
    	let t4;
    	let br3;
    	let t5;
    	let t6;
    	let div4;
    	let li0;
    	let t8;
    	let li1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			t1 = text("“after minor modifications,\n      ");
    			br0 = element("br");
    			t2 = text("\n      I discovered that I could\n      ");
    			br1 = element("br");
    			t3 = text("\n      walk and type\n      ");
    			br2 = element("br");
    			t4 = text("\n      perfectly well with it,\n      ");
    			br3 = element("br");
    			t5 = text("\n      even for a couple of hours.”");
    			t6 = space();
    			div4 = element("div");
    			li0 = element("li");
    			li0.textContent = "Wolfram";
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = "there are now several $1T computer manufacturers";
    			if (img.src !== (img_src_value = "./src/01.keyboards/assets/wolfram-desk.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "500px;");
    			add_location(img, file$q, 19, 6, 309);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$q, 18, 4, 288);
    			add_location(br0, file$q, 26, 6, 521);
    			add_location(br1, file$q, 28, 6, 566);
    			add_location(br2, file$q, 30, 6, 599);
    			add_location(br3, file$q, 32, 6, 642);
    			set_style(div1, "width", "300px");
    			set_style(div1, "font-size", "1.4rem");
    			attr_dev(div1, "class", "");
    			add_location(div1, file$q, 24, 4, 427);
    			attr_dev(div2, "class", "row svelte-ssqihk");
    			add_location(div2, file$q, 17, 2, 266);
    			attr_dev(div3, "class", "box");
    			add_location(div3, file$q, 16, 0, 246);
    			add_location(li0, file$q, 38, 2, 733);
    			add_location(li1, file$q, 39, 2, 752);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$q, 37, 0, 711);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div1, br0);
    			append_dev(div1, t2);
    			append_dev(div1, br1);
    			append_dev(div1, t3);
    			append_dev(div1, br2);
    			append_dev(div1, t4);
    			append_dev(div1, br3);
    			append_dev(div1, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, li0);
    			append_dev(div4, t8);
    			append_dev(div4, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wolfram> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wolfram", $$slots, []);
    	return [];
    }

    class Wolfram extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wolfram",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/01.keyboards/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$s(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;

    	let steps = [
    		OscarsTalk,
    		Mjackson,
    		Desks,
    		ISSKeyboard,
    		TonyAbra,
    		ZoeSmith,
    		HandKeyboards,
    		Wolfram
    	];

    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_01_keyboards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_01_keyboards", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		OscarsTalk,
    		Mjackson,
    		Desks,
    		ISSKeyboard,
    		TonyAbra,
    		ZoeSmith,
    		HandKeyboards,
    		Wolfram,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _01_keyboards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_keyboards",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get done() {
    		throw new Error("<_01_keyboards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_01_keyboards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_01_keyboards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_01_keyboards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_01_keyboards>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_01_keyboards>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/01.typing/LoveTyping.svelte generated by Svelte v3.24.1 */
    const file$r = "src/01.typing/LoveTyping.svelte";

    function create_fragment$t(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "people hate keyboards";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "people love typing";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "now that we have grammar, what could the interface look-like?";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$r, 7, 0, 139);
    			add_location(li0, file$r, 12, 2, 210);
    			add_location(li1, file$r, 13, 2, 243);
    			add_location(li2, file$r, 14, 2, 273);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$r, 11, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			append_dev(div1, t4);
    			append_dev(div1, li2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.typing/assets/kids-typing.jpg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoveTyping> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoveTyping", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class LoveTyping extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoveTyping",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/01.typing/NowCLI.svelte generated by Svelte v3.24.1 */
    const file$s = "src/01.typing/NowCLI.svelte";

    function create_fragment$u(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$s, 14, 0, 247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/01.typing/assets/now-cli.mp4",
    		title: "Now CLI",
    		sub: "by Guillermo Rauch"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NowCLI> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NowCLI", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class NowCLI extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NowCLI",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/01.typing/Typewriter.svelte generated by Svelte v3.24.1 */
    const file$t = "src/01.typing/Typewriter.svelte";

    function create_fragment$v(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "we romanticize them, but hellish";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "undiagnosed domestic pain - defines modern working conditions";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "professionalism";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$t, 7, 0, 138);
    			add_location(li0, file$t, 12, 2, 209);
    			add_location(li1, file$t, 13, 2, 253);
    			add_location(li2, file$t, 14, 2, 326);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$t, 11, 0, 187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			append_dev(div1, t4);
    			append_dev(div1, li2);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.typing/assets/typewriter.jpg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typewriter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typewriter", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Typewriter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src/01.typing/TypewriterMag.svelte generated by Svelte v3.24.1 */

    const file$u = "src/01.typing/TypewriterMag.svelte";

    function create_fragment$w(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let div4;
    	let li0;
    	let t4;
    	let li1;
    	let t6;
    	let li2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "“i used to get nervous at the end of the page”";
    			t2 = space();
    			div4 = element("div");
    			li0 = element("li");
    			li0.textContent = "IBM Selectric Magnetic tape";
    			t4 = space();
    			li1 = element("li");
    			li1.textContent = "almost 'word processing'";
    			t6 = space();
    			li2 = element("li");
    			li2.textContent = "re-played a page like a player-piano";
    			if (img.src !== (img_src_value = "./src/01.typing/assets/mag-type.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "300px;");
    			add_location(img, file$u, 19, 6, 309);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$u, 18, 4, 288);
    			set_style(div1, "width", "300px");
    			set_style(div1, "font-size", "1.4rem");
    			attr_dev(div1, "class", "");
    			add_location(div1, file$u, 21, 4, 396);
    			attr_dev(div2, "class", "row svelte-ssqihk");
    			add_location(div2, file$u, 17, 2, 266);
    			attr_dev(div3, "class", "box");
    			add_location(div3, file$u, 16, 0, 246);
    			add_location(li0, file$u, 27, 2, 552);
    			add_location(li1, file$u, 28, 2, 591);
    			add_location(li2, file$u, 29, 2, 627);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$u, 26, 0, 530);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, li0);
    			append_dev(div4, t4);
    			append_dev(div4, li1);
    			append_dev(div4, t6);
    			append_dev(div4, li2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TypewriterMag> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TypewriterMag", $$slots, []);
    	return [];
    }

    class TypewriterMag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TypewriterMag",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/01.typing/Engelbart.svelte generated by Svelte v3.24.1 */

    const file$v = "src/01.typing/Engelbart.svelte";

    function create_fragment$x(ctx) {
    	let div7;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div6;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let div5;
    	let t3;
    	let div4;
    	let t5;
    	let div8;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			div6 = element("div");
    			div3 = element("div");
    			img2 = element("img");
    			t2 = space();
    			div5 = element("div");
    			t3 = text("Mother of all Demos\n      ");
    			div4 = element("div");
    			div4.textContent = "1968";
    			t5 = space();
    			div8 = element("div");
    			li0 = element("li");
    			li0.textContent = "douglas engelbart - 1968";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "invented the cursor";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "herman miller";
    			if (img0.src !== (img0_src_value = "./src/01.typing/assets/engelbart/engelbart-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "width", "450px");
    			attr_dev(img0, "class", "svelte-1pozqn");
    			add_location(img0, file$v, 28, 6, 393);
    			attr_dev(div0, "class", "square svelte-1pozqn");
    			add_location(div0, file$v, 27, 4, 366);
    			if (img1.src !== (img1_src_value = "./src/01.typing/assets/engelbart/engelbart-2.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "width", "450px");
    			attr_dev(img1, "class", "svelte-1pozqn");
    			add_location(img1, file$v, 34, 6, 549);
    			attr_dev(div1, "class", "square svelte-1pozqn");
    			add_location(div1, file$v, 33, 4, 522);
    			attr_dev(div2, "class", "row svelte-1pozqn");
    			add_location(div2, file$v, 26, 2, 344);
    			if (img2.src !== (img2_src_value = "./src/01.typing/assets/engelbart/engelbart-3.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			set_style(img2, "width", "450px");
    			attr_dev(img2, "class", "svelte-1pozqn");
    			add_location(img2, file$v, 43, 6, 735);
    			attr_dev(div3, "class", "square svelte-1pozqn");
    			add_location(div3, file$v, 42, 4, 708);
    			attr_dev(div4, "class", "f1 grey");
    			add_location(div4, file$v, 50, 6, 920);
    			attr_dev(div5, "class", "square f2 svelte-1pozqn");
    			add_location(div5, file$v, 48, 4, 864);
    			attr_dev(div6, "class", "row svelte-1pozqn");
    			add_location(div6, file$v, 41, 2, 686);
    			attr_dev(div7, "class", "box m2 svelte-1pozqn");
    			add_location(div7, file$v, 25, 0, 321);
    			add_location(li0, file$v, 55, 2, 1001);
    			add_location(li1, file$v, 56, 2, 1037);
    			add_location(li2, file$v, 57, 2, 1068);
    			attr_dev(div8, "class", "notes");
    			add_location(div8, file$v, 54, 0, 979);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div3);
    			append_dev(div3, img2);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, li0);
    			append_dev(div8, t7);
    			append_dev(div8, li1);
    			append_dev(div8, t9);
    			append_dev(div8, li2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Engelbart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Engelbart", $$slots, []);
    	return [];
    }

    class Engelbart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Engelbart",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src/01.typing/Apollo8.svelte generated by Svelte v3.24.1 */

    const file$w = "src/01.typing/Apollo8.svelte";

    function create_fragment$y(ctx) {
    	let div6;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div5;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let div4;
    	let img3;
    	let img3_src_value;
    	let t3;
    	let div7;
    	let li0;
    	let t5;
    	let li1;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			div5 = element("div");
    			div3 = element("div");
    			img2 = element("img");
    			t2 = space();
    			div4 = element("div");
    			img3 = element("img");
    			t3 = space();
    			div7 = element("div");
    			li0 = element("li");
    			li0.textContent = "December 9, 1968";
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "debates about the greatest machine ever built";
    			if (img0.src !== (img0_src_value = "./src/01.typing/assets/engelbart/engelbart-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "width", "450px");
    			attr_dev(img0, "class", "svelte-1pozqn");
    			add_location(img0, file$w, 28, 6, 393);
    			attr_dev(div0, "class", "square svelte-1pozqn");
    			add_location(div0, file$w, 27, 4, 366);
    			if (img1.src !== (img1_src_value = "./src/01.typing/assets/engelbart/engelbart-2.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "width", "450px");
    			attr_dev(img1, "class", "svelte-1pozqn");
    			add_location(img1, file$w, 34, 6, 549);
    			attr_dev(div1, "class", "square svelte-1pozqn");
    			add_location(div1, file$w, 33, 4, 522);
    			attr_dev(div2, "class", "row svelte-1pozqn");
    			add_location(div2, file$w, 26, 2, 344);
    			if (img2.src !== (img2_src_value = "./src/01.typing/assets/engelbart/engelbart-3.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			set_style(img2, "width", "450px");
    			attr_dev(img2, "class", "svelte-1pozqn");
    			add_location(img2, file$w, 43, 6, 735);
    			attr_dev(div3, "class", "square svelte-1pozqn");
    			add_location(div3, file$w, 42, 4, 708);
    			if (img3.src !== (img3_src_value = "./src/01.typing/assets/apollo8.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			set_style(img3, "width", "440px");
    			attr_dev(img3, "class", "svelte-1pozqn");
    			add_location(img3, file$w, 49, 6, 891);
    			attr_dev(div4, "class", "square svelte-1pozqn");
    			add_location(div4, file$w, 48, 4, 864);
    			attr_dev(div5, "class", "row svelte-1pozqn");
    			add_location(div5, file$w, 41, 2, 686);
    			attr_dev(div6, "class", "box m2 svelte-1pozqn");
    			add_location(div6, file$w, 25, 0, 321);
    			add_location(li0, file$w, 57, 2, 1040);
    			add_location(li1, file$w, 58, 2, 1068);
    			attr_dev(div7, "class", "notes");
    			add_location(div7, file$w, 56, 0, 1018);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, img1);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img2);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, img3);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, li0);
    			append_dev(div7, t5);
    			append_dev(div7, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Apollo8> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Apollo8", $$slots, []);
    	return [];
    }

    class Apollo8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Apollo8",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src/01.typing/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$z(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [LoveTyping, NowCLI, Typewriter, TypewriterMag, Engelbart, Apollo8];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_01_typing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_01_typing", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		LoveTyping,
    		NowCLI,
    		Typewriter,
    		TypewriterMag,
    		Engelbart,
    		Apollo8,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _01_typing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_typing",
    			options,
    			id: create_fragment$z.name
    		});
    	}

    	get done() {
    		throw new Error("<_01_typing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_01_typing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_01_typing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_01_typing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_01_typing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_01_typing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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
    const file$x = "Users/spencer/mountain/somehow-keyboard/src/Keyboard.svelte";

    function create_fragment$A(ctx) {
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
    	let t72;
    	let div38;
    	let t73_value = (/*$keys*/ ctx[2]["k"].show || "") + "";
    	let t73;
    	let t74;
    	let div39;
    	let t75_value = (/*$keys*/ ctx[2]["l"].show || "") + "";
    	let t75;
    	let t76;
    	let div40;
    	let t77_value = (/*$keys*/ ctx[2][";"].show || "") + "";
    	let t77;
    	let t78;
    	let div41;
    	let t79_value = (/*$keys*/ ctx[2]["'"].show || "") + "";
    	let t79;
    	let t80;
    	let div42;
    	let t81_value = (/*$keys*/ ctx[2]["enter"].show || "") + "";
    	let t81;
    	let t82;
    	let div56;
    	let div44;
    	let t83_value = (/*$keys*/ ctx[2]["lshift"].show || "") + "";
    	let t83;
    	let t84;
    	let div45;
    	let t85_value = (/*$keys*/ ctx[2]["z"].show || "") + "";
    	let t85;
    	let t86;
    	let div46;
    	let t87_value = (/*$keys*/ ctx[2]["x"].show || "") + "";
    	let t87;
    	let t88;
    	let div47;
    	let t89_value = (/*$keys*/ ctx[2]["c"].show || "") + "";
    	let t89;
    	let t90;
    	let div48;
    	let t91_value = (/*$keys*/ ctx[2]["v"].show || "") + "";
    	let t91;
    	let t92;
    	let div49;
    	let t93_value = (/*$keys*/ ctx[2]["b"].show || "") + "";
    	let t93;
    	let t94;
    	let div50;
    	let t95_value = (/*$keys*/ ctx[2]["n"].show || "") + "";
    	let t95;
    	let t96;
    	let div51;
    	let t97_value = (/*$keys*/ ctx[2]["m"].show || "") + "";
    	let t97;
    	let t98;
    	let div52;
    	let t99_value = (/*$keys*/ ctx[2][","].show || "") + "";
    	let t99;
    	let t100;
    	let div53;
    	let t101_value = (/*$keys*/ ctx[2]["."].show || "") + "";
    	let t101;
    	let t102;
    	let div54;
    	let t103_value = (/*$keys*/ ctx[2]["/"].show || "") + "";
    	let t103;
    	let t104;
    	let div55;
    	let t105_value = (/*$keys*/ ctx[2]["rshift"].show || "") + "";
    	let t105;
    	let t106;
    	let div64;
    	let div57;
    	let t107_value = (/*$keys*/ ctx[2]["lctrl"].show || "") + "";
    	let t107;
    	let t108;
    	let div58;
    	let t109_value = (/*$keys*/ ctx[2]["lopt"].show || "") + "";
    	let t109;
    	let t110;
    	let div59;
    	let t111_value = (/*$keys*/ ctx[2]["lcmd"].show || "") + "";
    	let t111;
    	let t112;
    	let div60;
    	let t113_value = (/*$keys*/ ctx[2]["space"].show || "") + "";
    	let t113;
    	let t114;
    	let div61;
    	let t115_value = (/*$keys*/ ctx[2]["rcmd"].show || "") + "";
    	let t115;
    	let t116;
    	let div62;
    	let t117_value = (/*$keys*/ ctx[2]["ropt"].show || "") + "";
    	let t117;
    	let t118;
    	let div63;
    	let t119_value = (/*$keys*/ ctx[2]["rctrl"].show || "") + "";
    	let t119;
    	let div65_resize_listener;
    	let t120;
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
    			t71 = text("j");
    			t72 = space();
    			div38 = element("div");
    			t73 = text(t73_value);
    			t74 = space();
    			div39 = element("div");
    			t75 = text(t75_value);
    			t76 = space();
    			div40 = element("div");
    			t77 = text(t77_value);
    			t78 = space();
    			div41 = element("div");
    			t79 = text(t79_value);
    			t80 = space();
    			div42 = element("div");
    			t81 = text(t81_value);
    			t82 = space();
    			div56 = element("div");
    			div44 = element("div");
    			t83 = text(t83_value);
    			t84 = space();
    			div45 = element("div");
    			t85 = text(t85_value);
    			t86 = space();
    			div46 = element("div");
    			t87 = text(t87_value);
    			t88 = space();
    			div47 = element("div");
    			t89 = text(t89_value);
    			t90 = space();
    			div48 = element("div");
    			t91 = text(t91_value);
    			t92 = space();
    			div49 = element("div");
    			t93 = text(t93_value);
    			t94 = space();
    			div50 = element("div");
    			t95 = text(t95_value);
    			t96 = space();
    			div51 = element("div");
    			t97 = text(t97_value);
    			t98 = space();
    			div52 = element("div");
    			t99 = text(t99_value);
    			t100 = space();
    			div53 = element("div");
    			t101 = text(t101_value);
    			t102 = space();
    			div54 = element("div");
    			t103 = text(t103_value);
    			t104 = space();
    			div55 = element("div");
    			t105 = text(t105_value);
    			t106 = space();
    			div64 = element("div");
    			div57 = element("div");
    			t107 = text(t107_value);
    			t108 = space();
    			div58 = element("div");
    			t109 = text(t109_value);
    			t110 = space();
    			div59 = element("div");
    			t111 = text(t111_value);
    			t112 = space();
    			div60 = element("div");
    			t113 = text(t113_value);
    			t114 = space();
    			div61 = element("div");
    			t115 = text(t115_value);
    			t116 = space();
    			div62 = element("div");
    			t117 = text(t117_value);
    			t118 = space();
    			div63 = element("div");
    			t119 = text(t119_value);
    			t120 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "key svelte-s6zq7o");
    			set_style(div0, "background-color", /*$keys*/ ctx[2]["`"].color);
    			set_style(div0, "opacity", /*$keys*/ ctx[2]["`"].opacity);
    			set_style(div0, "flex", "0.9");
    			toggle_class(div0, "show", /*$keys*/ ctx[2]["`"].color);
    			add_location(div0, file$x, 59, 4, 1212);
    			attr_dev(div1, "class", "key svelte-s6zq7o");
    			set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			set_style(div1, "opacity", /*$keys*/ ctx[2]["1"].opacity);
    			toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			add_location(div1, file$x, 65, 4, 1407);
    			attr_dev(div2, "class", "key svelte-s6zq7o");
    			set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			set_style(div2, "opacity", /*$keys*/ ctx[2]["2"].opacity);
    			toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			add_location(div2, file$x, 71, 4, 1593);
    			attr_dev(div3, "class", "key svelte-s6zq7o");
    			set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			set_style(div3, "opacity", /*$keys*/ ctx[2]["3"].opacity);
    			toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			add_location(div3, file$x, 77, 4, 1779);
    			attr_dev(div4, "class", "key svelte-s6zq7o");
    			set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			set_style(div4, "opacity", /*$keys*/ ctx[2]["4"].opacity);
    			toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			add_location(div4, file$x, 83, 4, 1965);
    			attr_dev(div5, "class", "key svelte-s6zq7o");
    			set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			set_style(div5, "opacity", /*$keys*/ ctx[2]["5"].opacity);
    			toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			add_location(div5, file$x, 89, 4, 2151);
    			attr_dev(div6, "class", "key svelte-s6zq7o");
    			set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			set_style(div6, "opacity", /*$keys*/ ctx[2]["6"].opacity);
    			toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			add_location(div6, file$x, 95, 4, 2337);
    			attr_dev(div7, "class", "key svelte-s6zq7o");
    			set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			set_style(div7, "opacity", /*$keys*/ ctx[2]["7"].opacity);
    			toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			add_location(div7, file$x, 101, 4, 2523);
    			attr_dev(div8, "class", "key svelte-s6zq7o");
    			set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			set_style(div8, "opacity", /*$keys*/ ctx[2]["8"].opacity);
    			toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			add_location(div8, file$x, 107, 4, 2709);
    			attr_dev(div9, "class", "key svelte-s6zq7o");
    			set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			set_style(div9, "opacity", /*$keys*/ ctx[2]["9"].opacity);
    			toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			add_location(div9, file$x, 113, 4, 2895);
    			attr_dev(div10, "class", "key svelte-s6zq7o");
    			set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			set_style(div10, "opacity", /*$keys*/ ctx[2]["0"].opacity);
    			toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			add_location(div10, file$x, 119, 4, 3081);
    			attr_dev(div11, "class", "key svelte-s6zq7o");
    			set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			set_style(div11, "opacity", /*$keys*/ ctx[2]["-"].opacity);
    			toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			add_location(div11, file$x, 125, 4, 3267);
    			attr_dev(div12, "class", "key svelte-s6zq7o");
    			set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			set_style(div12, "opacity", /*$keys*/ ctx[2]["="].opacity);
    			toggle_class(div12, "show", /*$keys*/ ctx[2]["="].color);
    			add_location(div12, file$x, 131, 4, 3453);
    			attr_dev(div13, "class", "key svelte-s6zq7o");
    			set_style(div13, "background-color", /*$keys*/ ctx[2]["del"].color);
    			set_style(div13, "opacity", /*$keys*/ ctx[2]["del"].opacity);
    			set_style(div13, "flex", "1.5");
    			toggle_class(div13, "show", /*$keys*/ ctx[2]["del"].color);
    			add_location(div13, file$x, 137, 4, 3639);
    			attr_dev(div14, "class", "row svelte-s6zq7o");
    			add_location(div14, file$x, 58, 2, 1190);
    			attr_dev(div15, "class", "key svelte-s6zq7o");
    			set_style(div15, "background-color", /*$keys*/ ctx[2]["tab"].color);
    			set_style(div15, "opacity", /*$keys*/ ctx[2]["tab"].opacity);
    			toggle_class(div15, "show", /*$keys*/ ctx[2]["tab"].color);
    			add_location(div15, file$x, 145, 4, 3872);
    			attr_dev(div16, "class", "key svelte-s6zq7o");
    			set_style(div16, "background-color", /*$keys*/ ctx[2]["q"].color);
    			set_style(div16, "opacity", /*$keys*/ ctx[2]["q"].opacity);
    			toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			add_location(div16, file$x, 151, 4, 4066);
    			attr_dev(div17, "class", "key svelte-s6zq7o");
    			set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			set_style(div17, "opacity", /*$keys*/ ctx[2]["w"].opacity);
    			toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			add_location(div17, file$x, 157, 4, 4252);
    			attr_dev(div18, "class", "key svelte-s6zq7o");
    			set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			set_style(div18, "opacity", /*$keys*/ ctx[2]["e"].opacity);
    			toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			add_location(div18, file$x, 163, 4, 4438);
    			attr_dev(div19, "class", "key svelte-s6zq7o");
    			set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			set_style(div19, "opacity", /*$keys*/ ctx[2]["r"].opacity);
    			toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			add_location(div19, file$x, 169, 4, 4624);
    			attr_dev(div20, "class", "key svelte-s6zq7o");
    			set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			set_style(div20, "opacity", /*$keys*/ ctx[2]["t"].opacity);
    			toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			add_location(div20, file$x, 175, 4, 4810);
    			attr_dev(div21, "class", "key svelte-s6zq7o");
    			set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			set_style(div21, "opacity", /*$keys*/ ctx[2]["y"].opacity);
    			toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			add_location(div21, file$x, 181, 4, 4996);
    			attr_dev(div22, "class", "key svelte-s6zq7o");
    			set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			set_style(div22, "opacity", /*$keys*/ ctx[2]["u"].opacity);
    			toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			add_location(div22, file$x, 187, 4, 5182);
    			attr_dev(div23, "class", "key svelte-s6zq7o");
    			set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			set_style(div23, "opacity", /*$keys*/ ctx[2]["i"].opacity);
    			toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			add_location(div23, file$x, 193, 4, 5368);
    			attr_dev(div24, "class", "key svelte-s6zq7o");
    			set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			set_style(div24, "opacity", /*$keys*/ ctx[2]["o"].opacity);
    			toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			add_location(div24, file$x, 199, 4, 5554);
    			attr_dev(div25, "class", "key svelte-s6zq7o");
    			set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			set_style(div25, "opacity", /*$keys*/ ctx[2]["p"].opacity);
    			toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			add_location(div25, file$x, 205, 4, 5740);
    			attr_dev(div26, "class", "key svelte-s6zq7o");
    			set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			set_style(div26, "opacity", /*$keys*/ ctx[2]["["].opacity);
    			toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			add_location(div26, file$x, 211, 4, 5926);
    			attr_dev(div27, "class", "key svelte-s6zq7o");
    			set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			set_style(div27, "opacity", /*$keys*/ ctx[2]["]"].opacity);
    			toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			add_location(div27, file$x, 217, 4, 6112);
    			attr_dev(div28, "class", "key svelte-s6zq7o");
    			set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			set_style(div28, "opacity", /*$keys*/ ctx[2]["\\"].opacity);
    			toggle_class(div28, "show", /*$keys*/ ctx[2]["\\"].color);
    			add_location(div28, file$x, 223, 4, 6298);
    			attr_dev(div29, "class", "row svelte-s6zq7o");
    			add_location(div29, file$x, 144, 2, 3850);
    			attr_dev(div30, "class", "key svelte-s6zq7o");
    			set_style(div30, "background-color", /*$keys*/ ctx[2]["caps"].color);
    			set_style(div30, "opacity", /*$keys*/ ctx[2]["caps"].opacity);
    			set_style(div30, "flex", "1.6");
    			toggle_class(div30, "show", /*$keys*/ ctx[2]["caps"].color);
    			add_location(div30, file$x, 231, 4, 6517);
    			attr_dev(div31, "class", "key svelte-s6zq7o");
    			set_style(div31, "background-color", /*$keys*/ ctx[2]["a"].color);
    			set_style(div31, "opacity", /*$keys*/ ctx[2]["a"].opacity);
    			toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			add_location(div31, file$x, 237, 4, 6725);
    			attr_dev(div32, "class", "key svelte-s6zq7o");
    			set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			set_style(div32, "opacity", /*$keys*/ ctx[2]["s"].opacity);
    			toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			add_location(div32, file$x, 243, 4, 6911);
    			attr_dev(div33, "class", "key svelte-s6zq7o");
    			set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			set_style(div33, "opacity", /*$keys*/ ctx[2]["d"].opacity);
    			toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			add_location(div33, file$x, 249, 4, 7097);
    			attr_dev(div34, "class", "key svelte-s6zq7o");
    			set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			set_style(div34, "opacity", /*$keys*/ ctx[2]["f"].opacity);
    			toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			add_location(div34, file$x, 255, 4, 7283);
    			attr_dev(div35, "class", "key svelte-s6zq7o");
    			set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			set_style(div35, "opacity", /*$keys*/ ctx[2]["g"].opacity);
    			toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			add_location(div35, file$x, 261, 4, 7469);
    			attr_dev(div36, "class", "key svelte-s6zq7o");
    			set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			set_style(div36, "opacity", /*$keys*/ ctx[2]["h"].opacity);
    			toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			add_location(div36, file$x, 267, 4, 7655);
    			attr_dev(div37, "class", "key svelte-s6zq7o");
    			set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			set_style(div37, "opacity", /*$keys*/ ctx[2]["j"].opacity);
    			toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			add_location(div37, file$x, 273, 4, 7841);
    			attr_dev(div38, "class", "key svelte-s6zq7o");
    			set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			set_style(div38, "opacity", /*$keys*/ ctx[2]["k"].opacity);
    			toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			add_location(div38, file$x, 279, 4, 8028);
    			attr_dev(div39, "class", "key svelte-s6zq7o");
    			set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			set_style(div39, "opacity", /*$keys*/ ctx[2]["l"].opacity);
    			toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			add_location(div39, file$x, 285, 4, 8214);
    			attr_dev(div40, "class", "key svelte-s6zq7o");
    			set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			set_style(div40, "opacity", /*$keys*/ ctx[2][";"].opacity);
    			toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			add_location(div40, file$x, 291, 4, 8400);
    			attr_dev(div41, "class", "key svelte-s6zq7o");
    			set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			set_style(div41, "opacity", /*$keys*/ ctx[2]["'"].opacity);
    			toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			add_location(div41, file$x, 297, 4, 8586);
    			attr_dev(div42, "class", "key svelte-s6zq7o");
    			set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			set_style(div42, "flex", "1.6");
    			toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			add_location(div42, file$x, 303, 4, 8772);
    			attr_dev(div43, "class", "row svelte-s6zq7o");
    			add_location(div43, file$x, 230, 2, 6495);
    			attr_dev(div44, "class", "key svelte-s6zq7o");
    			set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			set_style(div44, "flex", "2.2");
    			toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			add_location(div44, file$x, 311, 4, 9013);
    			attr_dev(div45, "class", "key svelte-s6zq7o");
    			set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			set_style(div45, "opacity", /*$keys*/ ctx[2]["z"].opacity);
    			toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			add_location(div45, file$x, 317, 4, 9229);
    			attr_dev(div46, "class", "key svelte-s6zq7o");
    			set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			set_style(div46, "opacity", /*$keys*/ ctx[2]["x"].opacity);
    			toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			add_location(div46, file$x, 323, 4, 9414);
    			attr_dev(div47, "class", "key svelte-s6zq7o");
    			set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			set_style(div47, "opacity", /*$keys*/ ctx[2]["c"].opacity);
    			toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			add_location(div47, file$x, 329, 4, 9599);
    			attr_dev(div48, "class", "key svelte-s6zq7o");
    			set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			set_style(div48, "opacity", /*$keys*/ ctx[2]["v"].opacity);
    			toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			add_location(div48, file$x, 335, 4, 9784);
    			attr_dev(div49, "class", "key svelte-s6zq7o");
    			set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			set_style(div49, "opacity", /*$keys*/ ctx[2]["b"].opacity);
    			toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			add_location(div49, file$x, 341, 4, 9969);
    			attr_dev(div50, "class", "key svelte-s6zq7o");
    			set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			set_style(div50, "opacity", /*$keys*/ ctx[2]["n"].opacity);
    			toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			add_location(div50, file$x, 347, 4, 10154);
    			attr_dev(div51, "class", "key svelte-s6zq7o");
    			set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			set_style(div51, "opacity", /*$keys*/ ctx[2]["m"].opacity);
    			toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			add_location(div51, file$x, 353, 4, 10339);
    			attr_dev(div52, "class", "key svelte-s6zq7o");
    			set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			set_style(div52, "opacity", /*$keys*/ ctx[2][","].opacity);
    			toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			add_location(div52, file$x, 359, 4, 10524);
    			attr_dev(div53, "class", "key svelte-s6zq7o");
    			set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			set_style(div53, "opacity", /*$keys*/ ctx[2]["."].opacity);
    			toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			add_location(div53, file$x, 365, 4, 10709);
    			attr_dev(div54, "class", "key svelte-s6zq7o");
    			set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			set_style(div54, "opacity", /*$keys*/ ctx[2]["/"].opacity);
    			toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			add_location(div54, file$x, 371, 4, 10894);
    			attr_dev(div55, "class", "key svelte-s6zq7o");
    			set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			set_style(div55, "flex", "2.2");
    			toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			add_location(div55, file$x, 377, 4, 11079);
    			attr_dev(div56, "class", "row svelte-s6zq7o");
    			add_location(div56, file$x, 310, 2, 8991);
    			attr_dev(div57, "class", "key svelte-s6zq7o");
    			set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			set_style(div57, "flex", "1.4");
    			toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			add_location(div57, file$x, 385, 4, 11324);
    			attr_dev(div58, "class", "key svelte-s6zq7o");
    			set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			set_style(div58, "flex", "1.4");
    			toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			add_location(div58, file$x, 391, 4, 11536);
    			attr_dev(div59, "class", "key svelte-s6zq7o");
    			set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			set_style(div59, "flex", "1.4");
    			toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			add_location(div59, file$x, 397, 4, 11744);
    			attr_dev(div60, "class", "key svelte-s6zq7o");
    			set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			set_style(div60, "flex", "6.8");
    			toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			add_location(div60, file$x, 403, 4, 11952);
    			attr_dev(div61, "class", "key svelte-s6zq7o");
    			set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			set_style(div61, "flex", "1.4");
    			toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			add_location(div61, file$x, 409, 4, 12164);
    			attr_dev(div62, "class", "key svelte-s6zq7o");
    			set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			set_style(div62, "flex", "1.4");
    			toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			add_location(div62, file$x, 415, 4, 12372);
    			attr_dev(div63, "class", "key svelte-s6zq7o");
    			set_style(div63, "background-color", /*$keys*/ ctx[2]["rctrl"].color);
    			set_style(div63, "opacity", /*$keys*/ ctx[2]["rctrl"].opacity);
    			set_style(div63, "flex", "1.4");
    			toggle_class(div63, "show", /*$keys*/ ctx[2]["rctrl"].color);
    			add_location(div63, file$x, 421, 4, 12580);
    			attr_dev(div64, "class", "row svelte-s6zq7o");
    			add_location(div64, file$x, 384, 2, 11302);
    			attr_dev(div65, "class", "container svelte-s6zq7o");
    			set_style(div65, "max-height", /*height*/ ctx[1] + "px");
    			add_render_callback(() => /*div65_elementresize_handler*/ ctx[5].call(div65));
    			add_location(div65, file$x, 57, 0, 1112);
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
    			append_dev(div37, t71);
    			append_dev(div43, t72);
    			append_dev(div43, div38);
    			append_dev(div38, t73);
    			append_dev(div43, t74);
    			append_dev(div43, div39);
    			append_dev(div39, t75);
    			append_dev(div43, t76);
    			append_dev(div43, div40);
    			append_dev(div40, t77);
    			append_dev(div43, t78);
    			append_dev(div43, div41);
    			append_dev(div41, t79);
    			append_dev(div43, t80);
    			append_dev(div43, div42);
    			append_dev(div42, t81);
    			append_dev(div65, t82);
    			append_dev(div65, div56);
    			append_dev(div56, div44);
    			append_dev(div44, t83);
    			append_dev(div56, t84);
    			append_dev(div56, div45);
    			append_dev(div45, t85);
    			append_dev(div56, t86);
    			append_dev(div56, div46);
    			append_dev(div46, t87);
    			append_dev(div56, t88);
    			append_dev(div56, div47);
    			append_dev(div47, t89);
    			append_dev(div56, t90);
    			append_dev(div56, div48);
    			append_dev(div48, t91);
    			append_dev(div56, t92);
    			append_dev(div56, div49);
    			append_dev(div49, t93);
    			append_dev(div56, t94);
    			append_dev(div56, div50);
    			append_dev(div50, t95);
    			append_dev(div56, t96);
    			append_dev(div56, div51);
    			append_dev(div51, t97);
    			append_dev(div56, t98);
    			append_dev(div56, div52);
    			append_dev(div52, t99);
    			append_dev(div56, t100);
    			append_dev(div56, div53);
    			append_dev(div53, t101);
    			append_dev(div56, t102);
    			append_dev(div56, div54);
    			append_dev(div54, t103);
    			append_dev(div56, t104);
    			append_dev(div56, div55);
    			append_dev(div55, t105);
    			append_dev(div65, t106);
    			append_dev(div65, div64);
    			append_dev(div64, div57);
    			append_dev(div57, t107);
    			append_dev(div64, t108);
    			append_dev(div64, div58);
    			append_dev(div58, t109);
    			append_dev(div64, t110);
    			append_dev(div64, div59);
    			append_dev(div59, t111);
    			append_dev(div64, t112);
    			append_dev(div64, div60);
    			append_dev(div60, t113);
    			append_dev(div64, t114);
    			append_dev(div64, div61);
    			append_dev(div61, t115);
    			append_dev(div64, t116);
    			append_dev(div64, div62);
    			append_dev(div62, t117);
    			append_dev(div64, t118);
    			append_dev(div64, div63);
    			append_dev(div63, t119);
    			div65_resize_listener = add_resize_listener(div65, /*div65_elementresize_handler*/ ctx[5].bind(div65));
    			insert_dev(target, t120, anchor);

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

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div0, "opacity", /*$keys*/ ctx[2]["`"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div0, "show", /*$keys*/ ctx[2]["`"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t2_value !== (t2_value = (/*$keys*/ ctx[2]["1"].show || "") + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div1, "opacity", /*$keys*/ ctx[2]["1"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t4_value !== (t4_value = (/*$keys*/ ctx[2]["2"].show || "") + "")) set_data_dev(t4, t4_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div2, "opacity", /*$keys*/ ctx[2]["2"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t6_value !== (t6_value = (/*$keys*/ ctx[2]["3"].show || "") + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div3, "opacity", /*$keys*/ ctx[2]["3"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t8_value !== (t8_value = (/*$keys*/ ctx[2]["4"].show || "") + "")) set_data_dev(t8, t8_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div4, "opacity", /*$keys*/ ctx[2]["4"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t10_value !== (t10_value = (/*$keys*/ ctx[2]["5"].show || "") + "")) set_data_dev(t10, t10_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div5, "opacity", /*$keys*/ ctx[2]["5"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t12_value !== (t12_value = (/*$keys*/ ctx[2]["6"].show || "") + "")) set_data_dev(t12, t12_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div6, "opacity", /*$keys*/ ctx[2]["6"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t14_value !== (t14_value = (/*$keys*/ ctx[2]["7"].show || "") + "")) set_data_dev(t14, t14_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div7, "opacity", /*$keys*/ ctx[2]["7"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t16_value !== (t16_value = (/*$keys*/ ctx[2]["8"].show || "") + "")) set_data_dev(t16, t16_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div8, "opacity", /*$keys*/ ctx[2]["8"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t18_value !== (t18_value = (/*$keys*/ ctx[2]["9"].show || "") + "")) set_data_dev(t18, t18_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div9, "opacity", /*$keys*/ ctx[2]["9"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t20_value !== (t20_value = (/*$keys*/ ctx[2]["0"].show || "") + "")) set_data_dev(t20, t20_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div10, "opacity", /*$keys*/ ctx[2]["0"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t22_value !== (t22_value = (/*$keys*/ ctx[2]["-"].show || "") + "")) set_data_dev(t22, t22_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div11, "opacity", /*$keys*/ ctx[2]["-"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t24_value !== (t24_value = (/*$keys*/ ctx[2]["="].show || "") + "")) set_data_dev(t24, t24_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div12, "opacity", /*$keys*/ ctx[2]["="].opacity);
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

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div16, "opacity", /*$keys*/ ctx[2]["q"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t32_value !== (t32_value = (/*$keys*/ ctx[2]["w"].show || "") + "")) set_data_dev(t32, t32_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div17, "opacity", /*$keys*/ ctx[2]["w"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t34_value !== (t34_value = (/*$keys*/ ctx[2]["e"].show || "") + "")) set_data_dev(t34, t34_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div18, "opacity", /*$keys*/ ctx[2]["e"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t36_value !== (t36_value = (/*$keys*/ ctx[2]["r"].show || "") + "")) set_data_dev(t36, t36_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div19, "opacity", /*$keys*/ ctx[2]["r"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t38_value !== (t38_value = (/*$keys*/ ctx[2]["t"].show || "") + "")) set_data_dev(t38, t38_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div20, "opacity", /*$keys*/ ctx[2]["t"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t40_value !== (t40_value = (/*$keys*/ ctx[2]["y"].show || "") + "")) set_data_dev(t40, t40_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div21, "opacity", /*$keys*/ ctx[2]["y"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t42_value !== (t42_value = (/*$keys*/ ctx[2]["u"].show || "") + "")) set_data_dev(t42, t42_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div22, "opacity", /*$keys*/ ctx[2]["u"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t44_value !== (t44_value = (/*$keys*/ ctx[2]["i"].show || "") + "")) set_data_dev(t44, t44_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div23, "opacity", /*$keys*/ ctx[2]["i"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t46_value !== (t46_value = (/*$keys*/ ctx[2]["o"].show || "") + "")) set_data_dev(t46, t46_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div24, "opacity", /*$keys*/ ctx[2]["o"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t48_value !== (t48_value = (/*$keys*/ ctx[2]["p"].show || "") + "")) set_data_dev(t48, t48_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div25, "opacity", /*$keys*/ ctx[2]["p"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t50_value !== (t50_value = (/*$keys*/ ctx[2]["["].show || "") + "")) set_data_dev(t50, t50_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div26, "opacity", /*$keys*/ ctx[2]["["].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t52_value !== (t52_value = (/*$keys*/ ctx[2]["]"].show || "") + "")) set_data_dev(t52, t52_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div27, "opacity", /*$keys*/ ctx[2]["]"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t54_value !== (t54_value = (/*$keys*/ ctx[2]["\\"].show || "") + "")) set_data_dev(t54, t54_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div28, "opacity", /*$keys*/ ctx[2]["\\"].opacity);
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

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div31, "opacity", /*$keys*/ ctx[2]["a"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t60_value !== (t60_value = (/*$keys*/ ctx[2]["s"].show || "") + "")) set_data_dev(t60, t60_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div32, "opacity", /*$keys*/ ctx[2]["s"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t62_value !== (t62_value = (/*$keys*/ ctx[2]["d"].show || "") + "")) set_data_dev(t62, t62_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div33, "opacity", /*$keys*/ ctx[2]["d"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t64_value !== (t64_value = (/*$keys*/ ctx[2]["f"].show || "") + "")) set_data_dev(t64, t64_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div34, "opacity", /*$keys*/ ctx[2]["f"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t66_value !== (t66_value = (/*$keys*/ ctx[2]["g"].show || "") + "")) set_data_dev(t66, t66_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div35, "opacity", /*$keys*/ ctx[2]["g"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t68_value !== (t68_value = (/*$keys*/ ctx[2]["h"].show || "") + "")) set_data_dev(t68, t68_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div36, "opacity", /*$keys*/ ctx[2]["h"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t70_value !== (t70_value = (/*$keys*/ ctx[2]["j"].show || "") + "")) set_data_dev(t70, t70_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div37, "opacity", /*$keys*/ ctx[2]["j"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t73_value !== (t73_value = (/*$keys*/ ctx[2]["k"].show || "") + "")) set_data_dev(t73, t73_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div38, "opacity", /*$keys*/ ctx[2]["k"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t75_value !== (t75_value = (/*$keys*/ ctx[2]["l"].show || "") + "")) set_data_dev(t75, t75_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div39, "opacity", /*$keys*/ ctx[2]["l"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t77_value !== (t77_value = (/*$keys*/ ctx[2][";"].show || "") + "")) set_data_dev(t77, t77_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div40, "opacity", /*$keys*/ ctx[2][";"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t79_value !== (t79_value = (/*$keys*/ ctx[2]["'"].show || "") + "")) set_data_dev(t79, t79_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div41, "opacity", /*$keys*/ ctx[2]["'"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t81_value !== (t81_value = (/*$keys*/ ctx[2]["enter"].show || "") + "")) set_data_dev(t81, t81_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t83_value !== (t83_value = (/*$keys*/ ctx[2]["lshift"].show || "") + "")) set_data_dev(t83, t83_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t85_value !== (t85_value = (/*$keys*/ ctx[2]["z"].show || "") + "")) set_data_dev(t85, t85_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div45, "opacity", /*$keys*/ ctx[2]["z"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t87_value !== (t87_value = (/*$keys*/ ctx[2]["x"].show || "") + "")) set_data_dev(t87, t87_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div46, "opacity", /*$keys*/ ctx[2]["x"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t89_value !== (t89_value = (/*$keys*/ ctx[2]["c"].show || "") + "")) set_data_dev(t89, t89_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div47, "opacity", /*$keys*/ ctx[2]["c"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t91_value !== (t91_value = (/*$keys*/ ctx[2]["v"].show || "") + "")) set_data_dev(t91, t91_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div48, "opacity", /*$keys*/ ctx[2]["v"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t93_value !== (t93_value = (/*$keys*/ ctx[2]["b"].show || "") + "")) set_data_dev(t93, t93_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div49, "opacity", /*$keys*/ ctx[2]["b"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t95_value !== (t95_value = (/*$keys*/ ctx[2]["n"].show || "") + "")) set_data_dev(t95, t95_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div50, "opacity", /*$keys*/ ctx[2]["n"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t97_value !== (t97_value = (/*$keys*/ ctx[2]["m"].show || "") + "")) set_data_dev(t97, t97_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div51, "opacity", /*$keys*/ ctx[2]["m"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t99_value !== (t99_value = (/*$keys*/ ctx[2][","].show || "") + "")) set_data_dev(t99, t99_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div52, "opacity", /*$keys*/ ctx[2][","].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t101_value !== (t101_value = (/*$keys*/ ctx[2]["."].show || "") + "")) set_data_dev(t101, t101_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div53, "opacity", /*$keys*/ ctx[2]["."].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t103_value !== (t103_value = (/*$keys*/ ctx[2]["/"].show || "") + "")) set_data_dev(t103, t103_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div54, "opacity", /*$keys*/ ctx[2]["/"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t105_value !== (t105_value = (/*$keys*/ ctx[2]["rshift"].show || "") + "")) set_data_dev(t105, t105_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t107_value !== (t107_value = (/*$keys*/ ctx[2]["lctrl"].show || "") + "")) set_data_dev(t107, t107_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t109_value !== (t109_value = (/*$keys*/ ctx[2]["lopt"].show || "") + "")) set_data_dev(t109, t109_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t111_value !== (t111_value = (/*$keys*/ ctx[2]["lcmd"].show || "") + "")) set_data_dev(t111, t111_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t113_value !== (t113_value = (/*$keys*/ ctx[2]["space"].show || "") + "")) set_data_dev(t113, t113_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t115_value !== (t115_value = (/*$keys*/ ctx[2]["rcmd"].show || "") + "")) set_data_dev(t115, t115_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t117_value !== (t117_value = (/*$keys*/ ctx[2]["ropt"].show || "") + "")) set_data_dev(t117, t117_value);

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			}

    			if (!current || dirty & /*$keys*/ 4) {
    				set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			}

    			if (dirty & /*$keys*/ 4) {
    				toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			}

    			if ((!current || dirty & /*$keys*/ 4) && t119_value !== (t119_value = (/*$keys*/ ctx[2]["rctrl"].show || "") + "")) set_data_dev(t119, t119_value);

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
    			if (detaching) detach_dev(t120);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$A.name
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

    function create_fragment$B(ctx) {
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
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {
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
    			id: create_fragment$B.name
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

    /* src/01.punctuation/Keyboard.1.svelte generated by Svelte v3.24.1 */

    const file$y = "src/01.punctuation/Keyboard.1.svelte";

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
    	let current;

    	key0 = new Key({
    			props: { key: "rshift", fill: "pink" },
    			$$inline: true
    		});

    	key1 = new Key({
    			props: { key: "lshift", fill: "pink" },
    			$$inline: true
    		});

    	key2 = new Key({
    			props: { key: "rctrl", fill: "pink" },
    			$$inline: true
    		});

    	key3 = new Key({
    			props: { key: "ropt", fill: "pink" },
    			$$inline: true
    		});

    	key4 = new Key({
    			props: { key: "rcmd", fill: "pink" },
    			$$inline: true
    		});

    	key5 = new Key({
    			props: { key: "lctrl", fill: "pink" },
    			$$inline: true
    		});

    	key6 = new Key({
    			props: { key: "lopt", fill: "pink" },
    			$$inline: true
    		});

    	key7 = new Key({
    			props: { key: "lcmd", fill: "pink" },
    			$$inline: true
    		});

    	key8 = new Key({
    			props: { key: "caps", fill: "pink" },
    			$$inline: true
    		});

    	key9 = new Key({
    			props: { key: "space", fill: "#a9bdd1" },
    			$$inline: true
    		});

    	key10 = new Key({
    			props: { key: "enter", fill: "#a9bdd1" },
    			$$inline: true
    		});

    	key11 = new Key({
    			props: { key: "tab", fill: "#a9bdd1" },
    			$$inline: true
    		});

    	key12 = new Key({
    			props: { key: "del", fill: "#a9bdd1" },
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

    function create_fragment$C(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
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
    			li0 = element("li");
    			li0.textContent = "we're stuck with this";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "we're maxed for keys (dexterity of hands)";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "english is lucky";
    			attr_dev(div0, "class", "container svelte-1xizha2");
    			add_location(div0, file$y, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$y, 20, 0, 348);
    			add_location(li0, file$y, 41, 2, 961);
    			add_location(li1, file$y, 42, 2, 994);
    			add_location(li2, file$y, 43, 2, 1047);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$y, 40, 0, 939);
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
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    			append_dev(div2, t4);
    			append_dev(div2, li2);
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
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard_1", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class Keyboard_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_1",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src/01.punctuation/Keyboard.2.svelte generated by Svelte v3.24.1 */

    const file$z = "src/01.punctuation/Keyboard.2.svelte";

    // (23:4) <Keyboard>
    function create_default_slot$1(ctx) {
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(23:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$D(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
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
    			li0 = element("li");
    			li0.textContent = "want to talk about punctuation";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "there's 10k misc unicode characters";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "tension between cultural-use and control-characters";
    			attr_dev(div0, "class", "container svelte-1xizha2");
    			add_location(div0, file$z, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$z, 20, 0, 348);
    			add_location(li0, file$z, 64, 2, 2048);
    			add_location(li1, file$z, 65, 2, 2090);
    			add_location(li2, file$z, 66, 2, 2137);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$z, 63, 0, 2026);
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
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
    			append_dev(div2, t4);
    			append_dev(div2, li2);
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
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_2",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/01.punctuation/Keyboard.3.svelte generated by Svelte v3.24.1 */

    const file$A = "src/01.punctuation/Keyboard.3.svelte";

    // (23:4) <Keyboard>
    function create_default_slot$2(ctx) {
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
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "!",
    				opacity: "0.3"
    			},
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
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "$",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "%",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: { key: "6", fill: "rose", show: "^" },
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "&",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: { key: "8", fill: "rose", show: "*" },
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "(",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: ")",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: { key: "-", fill: "rose", show: "_" },
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "+",
    				opacity: "0.3"
    			},
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
    			props: {
    				key: ";",
    				fill: "rose",
    				show: ";",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "'",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: { key: ",", fill: "rose", show: "<" },
    			$$inline: true
    		});

    	key19 = new Key({
    			props: { key: ".", fill: "rose", show: ">" },
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "/",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(23:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$E(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
    	let t0;
    	let div2;
    	let li;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
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
    			li.textContent = "9 control-characters";
    			attr_dev(div0, "class", "container svelte-1xizha2");
    			add_location(div0, file$A, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$A, 20, 0, 348);
    			add_location(li, file$A, 64, 2, 2188);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$A, 63, 0, 2166);
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
    		id: create_fragment$E.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$E($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard_3> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard_3", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class Keyboard_3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_3",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src/01.punctuation/KeyTilde.svelte generated by Svelte v3.24.1 */

    const file$B = "src/01.punctuation/KeyTilde.svelte";

    // (64:4) <Keyboard>
    function create_default_slot$3(ctx) {
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
    			props: { key: "`", fill: "blue", show: "~" },
    			$$inline: true
    		});

    	key1 = new Key({
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key2 = new Key({
    			props: {
    				key: "2",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key3 = new Key({
    			props: {
    				key: "3",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key4 = new Key({
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: {
    				key: "6",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: {
    				key: "8",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: {
    				key: "-",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key13 = new Key({
    			props: {
    				key: "[",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key14 = new Key({
    			props: {
    				key: "]",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key15 = new Key({
    			props: {
    				key: "\\",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key16 = new Key({
    			props: {
    				key: ";",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: {
    				key: ",",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key19 = new Key({
    			props: {
    				key: ".",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(64:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$F(ctx) {
    	let div11;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div3;
    	let keyboard;
    	let t4;
    	let div10;
    	let div6;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div9;
    	let div7;
    	let t10;
    	let div8;
    	let t12;
    	let div12;
    	let li0;
    	let t14;
    	let li1;
    	let t16;
    	let li2;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "El Niño";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "original";
    			t3 = space();
    			div3 = element("div");
    			create_component(keyboard.$$.fragment);
    			t4 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "~/desktop";
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "engineering";
    			t8 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "~$250";
    			t10 = space();
    			div8 = element("div");
    			div8.textContent = "adopted";
    			t12 = space();
    			div12 = element("div");
    			li0 = element("li");
    			li0.textContent = "overstriking for spanish/portuguese";
    			t14 = space();
    			li1 = element("li");
    			li1.textContent = "approx from `≈`";
    			t16 = space();
    			li2 = element("li");
    			li2.textContent = "home dir";
    			add_location(div0, file$B, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-gvw6fu");
    			add_location(div1, file$B, 60, 4, 1073);
    			attr_dev(div2, "class", "topWord svelte-gvw6fu");
    			add_location(div2, file$B, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-gvw6fu");
    			add_location(div3, file$B, 62, 2, 1117);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$B, 104, 6, 3066);
    			attr_dev(div5, "class", "desc svelte-gvw6fu");
    			add_location(div5, file$B, 105, 6, 3108);
    			add_location(div6, file$B, 103, 4, 3054);
    			attr_dev(div7, "class", "mud svelte-gvw6fu");
    			add_location(div7, file$B, 108, 6, 3171);
    			attr_dev(div8, "class", "desc svelte-gvw6fu");
    			add_location(div8, file$B, 109, 6, 3206);
    			add_location(div9, file$B, 107, 4, 3159);
    			attr_dev(div10, "class", "bottom svelte-gvw6fu");
    			add_location(div10, file$B, 102, 2, 3029);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$B, 57, 0, 1004);
    			add_location(li0, file$B, 115, 2, 3288);
    			add_location(li1, file$B, 116, 2, 3335);
    			add_location(li2, file$B, 117, 2, 3362);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$B, 114, 0, 3266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div11, t3);
    			append_dev(div11, div3);
    			mount_component(keyboard, div3, null);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, li0);
    			append_dev(div12, t14);
    			append_dev(div12, li1);
    			append_dev(div12, t16);
    			append_dev(div12, li2);
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
    			if (detaching) detach_dev(div11);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyTilde> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyTilde", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class KeyTilde extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyTilde",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src/01.punctuation/Tilde.svelte generated by Svelte v3.24.1 */
    const file$C = "src/01.punctuation/Tilde.svelte";

    function create_fragment$G(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li = element("li");
    			li.textContent = "Siegler ADM-3A";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$C, 14, 0, 225);
    			add_location(li, file$C, 19, 2, 296);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$C, 18, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.punctuation/assets/tilde.png",
    		title: "",
    		sub: ""
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tilde> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tilde", $$slots, []);
    	$$self.$capture_state = () => ({ Image, wait, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Tilde extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tilde",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src/01.punctuation/KeyHash.svelte generated by Svelte v3.24.1 */

    const file$D = "src/01.punctuation/KeyHash.svelte";

    // (64:4) <Keyboard>
    function create_default_slot$4(ctx) {
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
    			props: {
    				key: "`",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key1 = new Key({
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key2 = new Key({
    			props: {
    				key: "2",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key3 = new Key({
    			props: { key: "3", fill: "blue", show: "#" },
    			$$inline: true
    		});

    	key4 = new Key({
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: {
    				key: "6",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: {
    				key: "8",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: {
    				key: "-",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key13 = new Key({
    			props: {
    				key: "[",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key14 = new Key({
    			props: {
    				key: "]",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key15 = new Key({
    			props: {
    				key: "\\",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key16 = new Key({
    			props: {
    				key: ";",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: {
    				key: ",",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key19 = new Key({
    			props: {
    				key: ".",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(64:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$H(ctx) {
    	let div11;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div3;
    	let keyboard;
    	let t4;
    	let div10;
    	let div6;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div9;
    	let div7;
    	let t10;
    	let div8;
    	let t12;
    	let div12;
    	let li0;
    	let t14;
    	let li1;
    	let t16;
    	let li2;
    	let t18;
    	let li3;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "D# Maj";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "original";
    			t3 = space();
    			div3 = element("div");
    			create_component(keyboard.$$.fragment);
    			t4 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "#fixme";
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "engineering";
    			t8 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "#blessed";
    			t10 = space();
    			div8 = element("div");
    			div8.textContent = "adopted";
    			t12 = space();
    			div12 = element("div");
    			li0 = element("li");
    			li0.textContent = "sharp in music";
    			t14 = space();
    			li1 = element("li");
    			li1.textContent = "pound (british pound?) or stylized 'lbs'";
    			t16 = space();
    			li2 = element("li");
    			li2.textContent = "code-comment";
    			t18 = space();
    			li3 = element("li");
    			li3.textContent = "hashtags 2007";
    			add_location(div0, file$D, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-gvw6fu");
    			add_location(div1, file$D, 60, 4, 1072);
    			attr_dev(div2, "class", "topWord svelte-gvw6fu");
    			add_location(div2, file$D, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-gvw6fu");
    			add_location(div3, file$D, 62, 2, 1116);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$D, 104, 6, 3065);
    			attr_dev(div5, "class", "desc svelte-gvw6fu");
    			add_location(div5, file$D, 105, 6, 3104);
    			add_location(div6, file$D, 103, 4, 3053);
    			attr_dev(div7, "class", "mud svelte-gvw6fu");
    			add_location(div7, file$D, 108, 6, 3167);
    			attr_dev(div8, "class", "desc svelte-gvw6fu");
    			add_location(div8, file$D, 109, 6, 3205);
    			add_location(div9, file$D, 107, 4, 3155);
    			attr_dev(div10, "class", "bottom svelte-gvw6fu");
    			add_location(div10, file$D, 102, 2, 3028);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$D, 57, 0, 1004);
    			add_location(li0, file$D, 115, 2, 3287);
    			add_location(li1, file$D, 116, 2, 3313);
    			add_location(li2, file$D, 117, 2, 3365);
    			add_location(li3, file$D, 118, 2, 3389);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$D, 114, 0, 3265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div11, t3);
    			append_dev(div11, div3);
    			mount_component(keyboard, div3, null);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, li0);
    			append_dev(div12, t14);
    			append_dev(div12, li1);
    			append_dev(div12, t16);
    			append_dev(div12, li2);
    			append_dev(div12, t18);
    			append_dev(div12, li3);
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
    			if (detaching) detach_dev(div11);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyHash> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyHash", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class KeyHash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyHash",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src/01.punctuation/KeyAt.svelte generated by Svelte v3.24.1 */

    const file$E = "src/01.punctuation/KeyAt.svelte";

    // (64:4) <Keyboard>
    function create_default_slot$5(ctx) {
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
    			props: {
    				key: "`",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key1 = new Key({
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key2 = new Key({
    			props: { key: "2", fill: "blue", show: "@" },
    			$$inline: true
    		});

    	key3 = new Key({
    			props: {
    				key: "3",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key4 = new Key({
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: {
    				key: "6",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: {
    				key: "8",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: {
    				key: "-",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key13 = new Key({
    			props: {
    				key: "[",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key14 = new Key({
    			props: {
    				key: "]",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key15 = new Key({
    			props: {
    				key: "\\",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key16 = new Key({
    			props: {
    				key: ";",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: {
    				key: ",",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key19 = new Key({
    			props: {
    				key: ".",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(64:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$I(ctx) {
    	let div11;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div3;
    	let keyboard;
    	let t4;
    	let div10;
    	let div6;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div9;
    	let div7;
    	let t10;
    	let div8;
    	let t12;
    	let div12;
    	let li0;
    	let t14;
    	let li1;
    	let t16;
    	let li2;
    	let t18;
    	let li3;
    	let t20;
    	let li4;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "5 shares @ $3";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "original";
    			t3 = space();
    			div3 = element("div");
    			create_component(keyboard.$$.fragment);
    			t4 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "ray@arpa.net";
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "engineering";
    			t8 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "@mention";
    			t10 = space();
    			div8 = element("div");
    			div8.textContent = "adopted";
    			t12 = space();
    			div12 = element("div");
    			li0 = element("li");
    			li0.textContent = "commercial 'at the rate of'";
    			t14 = space();
    			li1 = element("li");
    			li1.textContent = "email - Ray Tomlinson";
    			t16 = space();
    			li2 = element("li");
    			li2.textContent = "atmentions";
    			t18 = space();
    			li3 = element("li");
    			li3.textContent = "not originally on typewriters - obscure teletype keyboard";
    			t20 = space();
    			li4 = element("li");
    			li4.textContent = "would have used exclamation point";
    			add_location(div0, file$E, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-1gvmhr9");
    			add_location(div1, file$E, 60, 4, 1079);
    			attr_dev(div2, "class", "topWord svelte-1gvmhr9");
    			add_location(div2, file$E, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-1gvmhr9");
    			add_location(div3, file$E, 62, 2, 1123);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$E, 104, 6, 3072);
    			attr_dev(div5, "class", "desc svelte-1gvmhr9");
    			add_location(div5, file$E, 105, 6, 3117);
    			add_location(div6, file$E, 103, 4, 3060);
    			attr_dev(div7, "class", "mud svelte-1gvmhr9");
    			add_location(div7, file$E, 108, 6, 3180);
    			attr_dev(div8, "class", "desc svelte-1gvmhr9");
    			add_location(div8, file$E, 109, 6, 3218);
    			add_location(div9, file$E, 107, 4, 3168);
    			attr_dev(div10, "class", "bottom svelte-1gvmhr9");
    			add_location(div10, file$E, 102, 2, 3035);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$E, 57, 0, 1004);
    			add_location(li0, file$E, 115, 2, 3300);
    			add_location(li1, file$E, 116, 2, 3339);
    			add_location(li2, file$E, 117, 2, 3372);
    			add_location(li3, file$E, 118, 2, 3394);
    			add_location(li4, file$E, 119, 2, 3463);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$E, 114, 0, 3278);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div11, t3);
    			append_dev(div11, div3);
    			mount_component(keyboard, div3, null);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, li0);
    			append_dev(div12, t14);
    			append_dev(div12, li1);
    			append_dev(div12, t16);
    			append_dev(div12, li2);
    			append_dev(div12, t18);
    			append_dev(div12, li3);
    			append_dev(div12, t20);
    			append_dev(div12, li4);
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
    			if (detaching) detach_dev(div11);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyAt> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyAt", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class KeyAt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyAt",
    			options,
    			id: create_fragment$I.name
    		});
    	}
    }

    /* src/01.punctuation/KeyAsterix.svelte generated by Svelte v3.24.1 */

    const file$F = "src/01.punctuation/KeyAsterix.svelte";

    // (64:4) <Keyboard>
    function create_default_slot$6(ctx) {
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
    			props: {
    				key: "`",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key1 = new Key({
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key2 = new Key({
    			props: {
    				key: "2",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key3 = new Key({
    			props: {
    				key: "3",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key4 = new Key({
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: {
    				key: "6",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: { key: "8", fill: "blue", show: "*" },
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: {
    				key: "-",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key13 = new Key({
    			props: {
    				key: "[",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key14 = new Key({
    			props: {
    				key: "]",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key15 = new Key({
    			props: {
    				key: "\\",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key16 = new Key({
    			props: {
    				key: ";",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: {
    				key: ",",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key19 = new Key({
    			props: {
    				key: ".",
    				fill: "rose",
    				show: "",
    				opacity: "0.5"
    			},
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(64:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$J(ctx) {
    	let div11;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div3;
    	let keyboard;
    	let t4;
    	let div10;
    	let div6;
    	let div4;
    	let t6;
    	let div5;
    	let t8;
    	let div9;
    	let div7;
    	let t10;
    	let div8;
    	let t12;
    	let div12;
    	let li0;
    	let t14;
    	let li1;
    	let t16;
    	let li2;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "*1949";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "original";
    			t3 = space();
    			div3 = element("div");
    			create_component(keyboard.$$.fragment);
    			t4 = space();
    			div10 = element("div");
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "x = y * 2";
    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "engineering";
    			t8 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "*gulp*";
    			t10 = space();
    			div8 = element("div");
    			div8.textContent = "adopted";
    			t12 = space();
    			div12 = element("div");
    			li0 = element("li");
    			li0.textContent = "denoted date of birth";
    			t14 = space();
    			li1 = element("li");
    			li1.textContent = "multiplication";
    			t16 = space();
    			li2 = element("li");
    			li2.textContent = "stage-direction";
    			add_location(div0, file$F, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-1gvmhr9");
    			add_location(div1, file$F, 60, 4, 1071);
    			attr_dev(div2, "class", "topWord svelte-1gvmhr9");
    			add_location(div2, file$F, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-1gvmhr9");
    			add_location(div3, file$F, 62, 2, 1115);
    			attr_dev(div4, "class", "orange");
    			set_style(div4, "font-family", "monospace");
    			add_location(div4, file$F, 104, 6, 3064);
    			attr_dev(div5, "class", "desc svelte-1gvmhr9");
    			add_location(div5, file$F, 105, 6, 3138);
    			add_location(div6, file$F, 103, 4, 3052);
    			attr_dev(div7, "class", "mud svelte-1gvmhr9");
    			add_location(div7, file$F, 108, 6, 3201);
    			attr_dev(div8, "class", "desc svelte-1gvmhr9");
    			add_location(div8, file$F, 109, 6, 3237);
    			add_location(div9, file$F, 107, 4, 3189);
    			attr_dev(div10, "class", "bottom svelte-1gvmhr9");
    			add_location(div10, file$F, 102, 2, 3027);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$F, 57, 0, 1004);
    			add_location(li0, file$F, 115, 2, 3319);
    			add_location(li1, file$F, 116, 2, 3352);
    			add_location(li2, file$F, 117, 2, 3378);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$F, 114, 0, 3297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div11, t3);
    			append_dev(div11, div3);
    			mount_component(keyboard, div3, null);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div10, t8);
    			append_dev(div10, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t10);
    			append_dev(div9, div8);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, li0);
    			append_dev(div12, t14);
    			append_dev(div12, li1);
    			append_dev(div12, t16);
    			append_dev(div12, li2);
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
    			if (detaching) detach_dev(div11);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyAsterix> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyAsterix", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class KeyAsterix extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyAsterix",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src/01.punctuation/KeyBrackets.svelte generated by Svelte v3.24.1 */

    const file$G = "src/01.punctuation/KeyBrackets.svelte";

    // (23:4) <Keyboard>
    function create_default_slot$7(ctx) {
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
    			props: {
    				key: "`",
    				fill: "rose",
    				show: "~",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key1 = new Key({
    			props: {
    				key: "1",
    				fill: "rose",
    				show: "!",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key2 = new Key({
    			props: {
    				key: "2",
    				fill: "rose",
    				show: "@",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key3 = new Key({
    			props: {
    				key: "3",
    				fill: "rose",
    				show: "#",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key4 = new Key({
    			props: {
    				key: "4",
    				fill: "rose",
    				show: "$",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key5 = new Key({
    			props: {
    				key: "5",
    				fill: "rose",
    				show: "%",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key6 = new Key({
    			props: {
    				key: "6",
    				fill: "rose",
    				show: "^",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key7 = new Key({
    			props: {
    				key: "7",
    				fill: "rose",
    				show: "&",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key8 = new Key({
    			props: {
    				key: "8",
    				fill: "rose",
    				show: "*",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key9 = new Key({
    			props: {
    				key: "9",
    				fill: "rose",
    				show: "(",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key10 = new Key({
    			props: {
    				key: "0",
    				fill: "rose",
    				show: ")",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key11 = new Key({
    			props: {
    				key: "-",
    				fill: "rose",
    				show: "_",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key12 = new Key({
    			props: {
    				key: "=",
    				fill: "rose",
    				show: "+",
    				opacity: "0.3"
    			},
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
    			props: {
    				key: ";",
    				fill: "rose",
    				show: ";",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key17 = new Key({
    			props: {
    				key: "'",
    				fill: "rose",
    				show: "'",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key18 = new Key({
    			props: { key: ",", fill: "rose", show: "<" },
    			$$inline: true
    		});

    	key19 = new Key({
    			props: { key: ".", fill: "rose", show: ">" },
    			$$inline: true
    		});

    	key20 = new Key({
    			props: {
    				key: "/",
    				fill: "rose",
    				show: "/",
    				opacity: "0.3"
    			},
    			$$inline: true
    		});

    	key21 = new Key({
    			props: {
    				key: "rshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key22 = new Key({
    			props: {
    				key: "lshift",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key23 = new Key({
    			props: {
    				key: "rctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key24 = new Key({
    			props: {
    				key: "ropt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key25 = new Key({
    			props: {
    				key: "rcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key26 = new Key({
    			props: {
    				key: "lctrl",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key27 = new Key({
    			props: {
    				key: "lopt",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key28 = new Key({
    			props: {
    				key: "lcmd",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key29 = new Key({
    			props: {
    				key: "caps",
    				fill: "pink",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key30 = new Key({
    			props: {
    				key: "space",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key31 = new Key({
    			props: {
    				key: "enter",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key32 = new Key({
    			props: {
    				key: "tab",
    				fill: "#a9bdd1",
    				opacity: "0.4"
    			},
    			$$inline: true
    		});

    	key33 = new Key({
    			props: {
    				key: "del",
    				fill: "#a9bdd1",
    				opacity: "0.4"
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
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(23:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$K(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
    	let t0;
    	let div2;
    	let li0;
    	let t2;
    	let li1;
    	let current;

    	keyboard = new Keyboard({
    			props: {
    				$$slots: { default: [create_default_slot$7] },
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
    			li0 = element("li");
    			li0.textContent = "interface to a computer";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "back-slash in particular!";
    			attr_dev(div0, "class", "container svelte-1xizha2");
    			add_location(div0, file$G, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$G, 20, 0, 348);
    			add_location(li0, file$G, 64, 2, 2272);
    			add_location(li1, file$G, 65, 2, 2307);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$G, 63, 0, 2250);
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
    			append_dev(div2, li0);
    			append_dev(div2, t2);
    			append_dev(div2, li1);
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
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$K($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<KeyBrackets> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("KeyBrackets", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class KeyBrackets extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyBrackets",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    /* src/01.punctuation/Tomlinson.svelte generated by Svelte v3.24.1 */

    const file$H = "src/01.punctuation/Tomlinson.svelte";

    function create_fragment$L(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let div4;
    	let li0;
    	let t4;
    	let li1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "“I was mostly looking for a symbol that wasn’t used much”";
    			t2 = space();
    			div4 = element("div");
    			li0 = element("li");
    			li0.textContent = "ray tomlinson";
    			t4 = space();
    			li1 = element("li");
    			li1.textContent = "maybe email would not have been so popular";
    			if (img.src !== (img_src_value = "./src/01.punctuation/assets/ray-tomlinson.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "300px;");
    			add_location(img, file$H, 19, 6, 309);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$H, 18, 4, 288);
    			set_style(div1, "width", "300px");
    			set_style(div1, "font-size", "1.4rem");
    			attr_dev(div1, "class", "");
    			add_location(div1, file$H, 24, 4, 430);
    			attr_dev(div2, "class", "row svelte-ssqihk");
    			add_location(div2, file$H, 17, 2, 266);
    			attr_dev(div3, "class", "box");
    			add_location(div3, file$H, 16, 0, 246);
    			add_location(li0, file$H, 30, 2, 597);
    			add_location(li1, file$H, 31, 2, 622);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$H, 29, 0, 575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, li0);
    			append_dev(div4, t4);
    			append_dev(div4, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$L($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tomlinson> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Tomlinson", $$slots, []);
    	return [];
    }

    class Tomlinson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tomlinson",
    			options,
    			id: create_fragment$L.name
    		});
    	}
    }

    /* spencermountain/spacetime 6.6.3 Apache 2.0 */
    function createCommonjsModule$1(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var fns = createCommonjsModule$1(function (module, exports) {
      //git:blame @JuliasCaesar https://www.timeanddate.com/date/leapyear.html
      exports.isLeapYear = function (year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }; // unsurprisingly-nasty `typeof date` call


      exports.isDate = function (d) {
        return Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.valueOf());
      };

      exports.isArray = function (input) {
        return Object.prototype.toString.call(input) === '[object Array]';
      };

      exports.isObject = function (input) {
        return Object.prototype.toString.call(input) === '[object Object]';
      };

      exports.zeroPad = function (str) {
        var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
        var pad = '0';
        str = str + '';
        return str.length >= len ? str : new Array(len - str.length + 1).join(pad) + str;
      };

      exports.titleCase = function (str) {
        if (!str) {
          return '';
        }

        return str[0].toUpperCase() + str.substr(1);
      };

      exports.ordinal = function (i) {
        var j = i % 10;
        var k = i % 100;

        if (j === 1 && k !== 11) {
          return i + 'st';
        }

        if (j === 2 && k !== 12) {
          return i + 'nd';
        }

        if (j === 3 && k !== 13) {
          return i + 'rd';
        }

        return i + 'th';
      }; //strip 'st' off '1st'..


      exports.toCardinal = function (str) {
        str = String(str);
        str = str.replace(/([0-9])(st|nd|rd|th)$/i, '$1');
        return parseInt(str, 10);
      }; //used mostly for cleanup of unit names, like 'months'


      exports.normalize = function () {
        var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        str = str.toLowerCase().trim();
        str = str.replace(/ies$/, 'y'); //'centuries'

        str = str.replace(/s$/, '');
        str = str.replace(/-/g, '');

        if (str === 'day') {
          return 'date';
        }

        return str;
      };

      exports.getEpoch = function (tmp) {
        //support epoch
        if (typeof tmp === 'number') {
          return tmp;
        } //suport date objects


        if (exports.isDate(tmp)) {
          return tmp.getTime();
        }

        if (tmp.epoch) {
          return tmp.epoch;
        }

        return null;
      }; //make sure this input is a spacetime obj


      exports.beADate = function (d, s) {
        if (exports.isObject(d) === false) {
          return s.clone().set(d);
        }

        return d;
      };

      exports.formatTimezone = function (offset) {
        var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var absOffset = Math.abs(offset);
        var sign = offset > 0 ? '+' : '-';
        return "".concat(sign).concat(exports.zeroPad(absOffset)).concat(delimiter, "00");
      };
    });
    var fns_1 = fns.isLeapYear;
    var fns_2 = fns.isDate;
    var fns_3 = fns.isArray;
    var fns_4 = fns.isObject;
    var fns_5 = fns.zeroPad;
    var fns_6 = fns.titleCase;
    var fns_7 = fns.ordinal;
    var fns_8 = fns.toCardinal;
    var fns_9 = fns.normalize;
    var fns_10 = fns.getEpoch;
    var fns_11 = fns.beADate;
    var fns_12 = fns.formatTimezone;

    var zeroPad = fns.zeroPad;

    var serialize = function serialize(d) {
      return zeroPad(d.getMonth() + 1) + '/' + zeroPad(d.getDate()) + ':' + zeroPad(d.getHours());
    }; // a timezone will begin with a specific offset in january
    // then some will switch to something else between november-march


    var shouldChange = function shouldChange(epoch, start, end, defaultOffset) {
      //note: this has a cray order-of-operations issue
      //we can't get the date, without knowing the timezone, and vice-versa
      //it's possible that we can miss a dst-change by a few hours.
      var d = new Date(epoch); //(try to mediate this a little?)

      var bias = d.getTimezoneOffset() || 0;
      var shift = bias + defaultOffset * 60; //in minutes

      shift = shift * 60 * 1000; //in ms

      d = new Date(epoch + shift);
      var current = serialize(d); //eg. is it after ~november?

      if (current >= start) {
        //eg. is it before ~march~ too?
        if (current < end) {
          return true;
        }
      }

      return false;
    };

    var summerTime = shouldChange;

    // it reproduces some things in ./index.js, but speeds up spacetime considerably

    var quickOffset = function quickOffset(s) {
      var zones = s.timezones;
      var obj = zones[s.tz];

      if (obj === undefined) {
        console.warn("Warning: couldn't find timezone " + s.tz);
        return 0;
      }

      if (obj.dst === undefined) {
        return obj.offset;
      } //get our two possible offsets


      var jul = obj.offset;
      var dec = obj.offset + 1; // assume it's the same for now

      if (obj.hem === 'n') {
        dec = jul - 1;
      }

      var split = obj.dst.split('->');
      var inSummer = summerTime(s.epoch, split[0], split[1], jul);

      if (inSummer === true) {
        return jul;
      }

      return dec;
    };

    var quick = quickOffset;

    var _build = {
    	"9|s": "2/dili,2/jayapura",
    	"9|n": "2/chita,2/khandyga,2/pyongyang,2/seoul,2/tokyo,11/palau",
    	"9.5|s|04/05:03->10/04:02": "4/adelaide,4/broken_hill,4/south,4/yancowinna",
    	"9.5|s": "4/darwin,4/north",
    	"8|s": "12/casey,2/kuala_lumpur,2/makassar,2/singapore,4/perth,4/west",
    	"8|n|03/25:03->09/29:23": "2/ulan_bator",
    	"8|n": "2/brunei,2/choibalsan,2/chongqing,2/chungking,2/harbin,2/hong_kong,2/irkutsk,2/kuching,2/macao,2/macau,2/manila,2/shanghai,2/taipei,2/ujung_pandang,2/ulaanbaatar",
    	"8.75|s": "4/eucla",
    	"7|s": "12/davis,2/jakarta,9/christmas",
    	"7|n": "2/bangkok,2/barnaul,2/ho_chi_minh,2/hovd,2/krasnoyarsk,2/novokuznetsk,2/novosibirsk,2/phnom_penh,2/pontianak,2/saigon,2/tomsk,2/vientiane",
    	"6|s": "12/vostok",
    	"6|n": "2/almaty,2/bishkek,2/dacca,2/dhaka,2/kashgar,2/omsk,2/qyzylorda,2/thimbu,2/thimphu,2/urumqi,9/chagos",
    	"6.5|n": "2/rangoon,2/yangon,9/cocos",
    	"5|s": "12/mawson,9/kerguelen",
    	"5|n": "2/aqtau,2/aqtobe,2/ashgabat,2/ashkhabad,2/atyrau,2/baku,2/dushanbe,2/karachi,2/oral,2/samarkand,2/tashkent,2/yekaterinburg,9/maldives",
    	"5.75|n": "2/kathmandu,2/katmandu",
    	"5.5|n": "2/calcutta,2/colombo,2/kolkata",
    	"4|s": "9/reunion",
    	"4|n": "2/dubai,2/muscat,2/tbilisi,2/yerevan,8/astrakhan,8/samara,8/saratov,8/ulyanovsk,8/volgograd,2/volgograd,9/mahe,9/mauritius",
    	"4.5|n|03/21:00->09/20:24": "2/tehran",
    	"4.5|n": "2/kabul",
    	"3|s": "12/syowa,9/antananarivo",
    	"3|n|03/29:03->10/25:04": "2/famagusta,2/nicosia,8/athens,8/bucharest,8/helsinki,8/kiev,8/mariehamn,8/nicosia,8/riga,8/sofia,8/tallinn,8/uzhgorod,8/vilnius,8/zaporozhye",
    	"3|n|03/29:02->10/25:03": "8/chisinau,8/tiraspol",
    	"3|n|03/29:00->10/24:24": "2/beirut",
    	"3|n|03/27:02->10/25:02": "2/jerusalem,2/tel_aviv",
    	"3|n|03/27:00->10/31:01": "2/gaza,2/hebron",
    	"3|n|03/27:00->10/30:01": "2/amman",
    	"3|n|03/27:00->10/29:24": "2/damascus",
    	"3|n": "0/addis_ababa,0/asmara,0/asmera,0/dar_es_salaam,0/djibouti,0/juba,0/kampala,0/mogadishu,0/nairobi,2/aden,2/baghdad,2/bahrain,2/istanbul,2/kuwait,2/qatar,2/riyadh,8/istanbul,8/kirov,8/minsk,8/moscow,8/simferopol,9/comoro,9/mayotte",
    	"2|s|03/29:02->10/25:02": "12/troll",
    	"2|s": "0/gaborone,0/harare,0/johannesburg,0/lubumbashi,0/lusaka,0/maputo,0/maseru,0/mbabane",
    	"2|n|03/29:02->10/25:03": "0/ceuta,arctic/longyearbyen,3/jan_mayen,8/amsterdam,8/andorra,8/belgrade,8/berlin,8/bratislava,8/brussels,8/budapest,8/busingen,8/copenhagen,8/gibraltar,8/ljubljana,8/luxembourg,8/madrid,8/malta,8/monaco,8/oslo,8/paris,8/podgorica,8/prague,8/rome,8/san_marino,8/sarajevo,8/skopje,8/stockholm,8/tirane,8/vaduz,8/vatican,8/vienna,8/warsaw,8/zagreb,8/zurich",
    	"2|n": "0/blantyre,0/bujumbura,0/cairo,0/khartoum,0/kigali,0/tripoli,8/kaliningrad",
    	"1|s|04/02:01->09/03:03": "0/windhoek",
    	"1|s": "0/kinshasa,0/luanda",
    	"1|n|04/19:03->05/31:02": "0/casablanca,0/el_aaiun",
    	"1|n|03/29:01->10/25:02": "3/canary,3/faeroe,3/faroe,3/madeira,8/belfast,8/dublin,8/guernsey,8/isle_of_man,8/jersey,8/lisbon,8/london",
    	"1|n": "0/algiers,0/bangui,0/brazzaville,0/douala,0/lagos,0/libreville,0/malabo,0/ndjamena,0/niamey,0/porto-novo,0/tunis",
    	"14|n": "11/kiritimati",
    	"13|s|04/05:04->09/27:03": "11/apia",
    	"13|s|01/15:02->11/05:03": "11/tongatapu",
    	"13|n": "11/enderbury,11/fakaofo",
    	"12|s|04/05:03->09/27:02": "12/mcmurdo,12/south_pole,11/auckland",
    	"12|s|01/12:03->11/08:02": "11/fiji",
    	"12|n": "2/anadyr,2/kamchatka,2/srednekolymsk,11/funafuti,11/kwajalein,11/majuro,11/nauru,11/tarawa,11/wake,11/wallis",
    	"12.75|s|04/05:03->04/05:02": "11/chatham",
    	"11|s": "12/macquarie,11/bougainville",
    	"11|n": "2/magadan,2/sakhalin,11/efate,11/guadalcanal,11/kosrae,11/noumea,11/pohnpei,11/ponape",
    	"11.5|n|04/05:03->10/04:02": "11/norfolk",
    	"10|s|04/05:03->10/04:02": "4/act,4/canberra,4/currie,4/hobart,4/melbourne,4/nsw,4/sydney,4/tasmania,4/victoria",
    	"10|s": "12/dumontdurville,4/brisbane,4/lindeman,4/queensland",
    	"10|n": "2/ust-nera,2/vladivostok,2/yakutsk,11/chuuk,11/guam,11/port_moresby,11/saipan,11/truk,11/yap",
    	"10.5|s|04/05:01->10/04:02": "4/lhi,4/lord_howe",
    	"0|n|03/29:00->10/25:01": "1/scoresbysund,3/azores",
    	"0|n": "0/abidjan,0/accra,0/bamako,0/banjul,0/bissau,0/conakry,0/dakar,0/freetown,0/lome,0/monrovia,0/nouakchott,0/ouagadougou,0/sao_tome,0/timbuktu,1/danmarkshavn,3/reykjavik,3/st_helena,13/gmt,13/gmt+0,13/gmt-0,13/gmt0,13/greenwich,13/utc,13/universal,13/zulu",
    	"-9|n|03/08:02->11/01:02": "1/adak,1/atka",
    	"-9|n": "11/gambier",
    	"-9.5|n": "11/marquesas",
    	"-8|n|03/08:02->11/01:02": "1/anchorage,1/juneau,1/metlakatla,1/nome,1/sitka,1/yakutat",
    	"-8|n": "11/pitcairn",
    	"-7|n|03/08:02->11/01:02": "1/dawson,1/ensenada,1/los_angeles,1/santa_isabel,1/tijuana,1/vancouver,1/whitehorse,6/pacific,6/yukon,10/bajanorte",
    	"-7|n": "1/creston,1/dawson_creek,1/hermosillo,1/phoenix",
    	"-6|s|04/04:22->09/05:22": "7/easterisland,11/easter",
    	"-6|n|04/05:02->10/25:02": "1/chihuahua,1/mazatlan,10/bajasur",
    	"-6|n|03/08:02->11/01:02": "1/boise,1/cambridge_bay,1/denver,1/edmonton,1/inuvik,1/ojinaga,1/shiprock,1/yellowknife,6/mountain",
    	"-6|n": "1/belize,1/costa_rica,1/el_salvador,1/guatemala,1/managua,1/regina,1/swift_current,1/tegucigalpa,6/east-saskatchewan,6/saskatchewan,11/galapagos",
    	"-5|s": "1/lima,1/rio_branco,5/acre",
    	"-5|n|04/05:02->10/25:02": "1/bahia_banderas,1/merida,1/mexico_city,1/monterrey,10/general",
    	"-5|n|03/12:03->11/05:01": "1/north_dakota",
    	"-5|n|03/08:02->11/01:02": "1/chicago,1/knox_in,1/matamoros,1/menominee,1/rainy_river,1/rankin_inlet,1/resolute,1/winnipeg,6/central",
    	"-5|n": "1/atikokan,1/bogota,1/cancun,1/cayman,1/coral_harbour,1/eirunepe,1/guayaquil,1/jamaica,1/panama,1/porto_acre",
    	"-4|s|05/13:23->08/13:01": "12/palmer",
    	"-4|s|04/04:24->09/06:00": "1/santiago,7/continental",
    	"-4|s|03/21:24->10/04:00": "1/asuncion",
    	"-4|s|02/16:24->11/03:00": "1/campo_grande,1/cuiaba",
    	"-4|s": "1/la_paz,1/manaus,5/west",
    	"-4|n|03/12:03->11/05:01": "1/indiana,1/kentucky",
    	"-4|n|03/08:02->11/01:02": "1/detroit,1/fort_wayne,1/grand_turk,1/indianapolis,1/iqaluit,1/louisville,1/montreal,1/nassau,1/new_york,1/nipigon,1/pangnirtung,1/port-au-prince,1/thunder_bay,1/toronto,6/eastern",
    	"-4|n|03/08:00->11/01:01": "1/havana",
    	"-4|n": "1/anguilla,1/antigua,1/aruba,1/barbados,1/blanc-sablon,1/boa_vista,1/caracas,1/curacao,1/dominica,1/grenada,1/guadeloupe,1/guyana,1/kralendijk,1/lower_princes,1/marigot,1/martinique,1/montserrat,1/port_of_spain,1/porto_velho,1/puerto_rico,1/santo_domingo,1/st_barthelemy,1/st_kitts,1/st_lucia,1/st_thomas,1/st_vincent,1/tortola,1/virgin",
    	"-3|s": "1/argentina,1/buenos_aires,1/cordoba,1/fortaleza,1/montevideo,1/punta_arenas,1/sao_paulo,12/rothera,3/stanley,5/east",
    	"-3|n|03/08:02->11/01:02": "1/glace_bay,1/goose_bay,1/halifax,1/moncton,1/thule,3/bermuda,6/atlantic",
    	"-3|n": "1/araguaina,1/bahia,1/belem,1/catamarca,1/cayenne,1/jujuy,1/maceio,1/mendoza,1/paramaribo,1/recife,1/rosario,1/santarem",
    	"-2|s": "5/denoronha",
    	"-2|n|03/28:22->10/24:23": "1/godthab",
    	"-2|n|03/08:02->11/01:02": "1/miquelon",
    	"-2|n": "1/noronha,3/south_georgia",
    	"-2.5|n|03/08:02->11/01:02": "1/st_johns,6/newfoundland",
    	"-1|n": "3/cape_verde",
    	"-11|n": "11/midway,11/niue,11/pago_pago,11/samoa",
    	"-10|n": "11/honolulu,11/johnston,11/rarotonga,11/tahiti"
    };

    var _build$1 = /*#__PURE__*/Object.freeze({
    	__proto__: null,
    	'default': _build
    });

    //prefixes for iana names..
    var _prefixes = ['africa', 'america', 'asia', 'atlantic', 'australia', 'brazil', 'canada', 'chile', 'europe', 'indian', 'mexico', 'pacific', 'antarctica', 'etc'];

    var data = getCjsExportFromNamespace(_build$1);

    var all = {};
    Object.keys(data).forEach(function (k) {
      var split = k.split('|');
      var obj = {
        offset: Number(split[0]),
        hem: split[1]
      };

      if (split[2]) {
        obj.dst = split[2];
      }

      var names = data[k].split(',');
      names.forEach(function (str) {
        str = str.replace(/(^[0-9]+)\//, function (before, num) {
          num = Number(num);
          return _prefixes[num] + '/';
        });
        all[str] = obj;
      });
    });
    all['utc'] = {
      offset: 0,
      hem: 'n' //(sorry)

    }; //add etc/gmt+n

    for (var i = -14; i <= 14; i += 0.5) {
      var num = i;

      if (num > 0) {
        num = '+' + num;
      }

      var name = 'etc/gmt' + num;
      all[name] = {
        offset: i * -1,
        //they're negative!
        hem: 'n' //(sorry)

      };
      name = 'utc/gmt' + num; //this one too, why not.

      all[name] = {
        offset: i * -1,
        hem: 'n'
      };
    } // console.log(all)
    // console.log(Object.keys(all).length)


    var unpack = all;

    //find the implicit iana code for this machine.
    //safely query the Intl object
    //based on - https://bitbucket.org/pellepim/jstimezonedetect/src
    var fallbackTZ = 'utc'; //
    //this Intl object is not supported often, yet

    var safeIntl = function safeIntl() {
      if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat === 'undefined') {
        return null;
      }

      var format = Intl.DateTimeFormat();

      if (typeof format === 'undefined' || typeof format.resolvedOptions === 'undefined') {
        return null;
      }

      var timezone = format.resolvedOptions().timeZone;

      if (!timezone) {
        return null;
      }

      return timezone.toLowerCase();
    };

    var guessTz = function guessTz() {
      var timezone = safeIntl();

      if (timezone === null) {
        return fallbackTZ;
      }

      return timezone;
    }; //do it once per computer


    var guessTz_1 = guessTz;

    var isOffset = /(\-?[0-9]+)h(rs)?/i;
    var isNumber = /(\-?[0-9]+)/;
    var utcOffset = /utc([\-+]?[0-9]+)/i;
    var gmtOffset = /gmt([\-+]?[0-9]+)/i;

    var toIana = function toIana(num) {
      num = Number(num);

      if (num > -13 && num < 13) {
        num = num * -1; //it's opposite!

        num = (num > 0 ? '+' : '') + num; //add plus sign

        return 'etc/gmt' + num;
      }

      return null;
    };

    var parseOffset = function parseOffset(tz) {
      // '+5hrs'
      var m = tz.match(isOffset);

      if (m !== null) {
        return toIana(m[1]);
      } // 'utc+5'


      m = tz.match(utcOffset);

      if (m !== null) {
        return toIana(m[1]);
      } // 'GMT-5' (not opposite)


      m = tz.match(gmtOffset);

      if (m !== null) {
        var num = Number(m[1]) * -1;
        return toIana(num);
      } // '+5'


      m = tz.match(isNumber);

      if (m !== null) {
        return toIana(m[1]);
      }

      return null;
    };

    var parseOffset_1 = parseOffset;

    var local = guessTz_1(); //add all the city names by themselves

    var cities = Object.keys(unpack).reduce(function (h, k) {
      var city = k.split('/')[1] || '';
      city = city.replace(/_/g, ' ');
      h[city] = k;
      return h;
    }, {}); //try to match these against iana form

    var normalize = function normalize(tz) {
      tz = tz.replace(/ time/g, '');
      tz = tz.replace(/ (standard|daylight|summer)/g, '');
      tz = tz.replace(/\b(east|west|north|south)ern/g, '$1');
      tz = tz.replace(/\b(africa|america|australia)n/g, '$1');
      tz = tz.replace(/\beuropean/g, 'europe');
      tz = tz.replace(/\islands/g, 'island');
      return tz;
    }; // try our best to reconcile the timzone to this given string


    var lookupTz = function lookupTz(str, zones) {
      if (!str) {
        return local;
      }

      var tz = str.trim();
      var split = str.split('/'); //support long timezones like 'America/Argentina/Rio_Gallegos'

      if (split.length > 2 && zones.hasOwnProperty(tz) === false) {
        tz = split[0] + '/' + split[1];
      }

      tz = tz.toLowerCase();

      if (zones.hasOwnProperty(tz) === true) {
        return tz;
      } //lookup more loosely..


      tz = normalize(tz);

      if (zones.hasOwnProperty(tz) === true) {
        return tz;
      } //try city-names


      if (cities.hasOwnProperty(tz) === true) {
        return cities[tz];
      } // //try to parse '-5h'


      if (/[0-9]/.test(tz) === true) {
        var id = parseOffset_1(tz);

        if (id) {
          return id;
        }
      }

      throw new Error("Spacetime: Cannot find timezone named: '" + str + "'. Please enter an IANA timezone id.");
    };

    var find = lookupTz;

    var o = {
      millisecond: 1
    };
    o.second = 1000;
    o.minute = 60000;
    o.hour = 3.6e6; // dst is supported post-hoc

    o.day = 8.64e7; //

    o.date = o.day;
    o.month = 8.64e7 * 29.5; //(average)

    o.week = 6.048e8;
    o.year = 3.154e10; // leap-years are supported post-hoc
    //add plurals

    Object.keys(o).forEach(function (k) {
      o[k + 's'] = o[k];
    });
    var milliseconds = o;

    var walk = function walk(s, n, fn, unit, previous) {
      var current = s.d[fn]();

      if (current === n) {
        return; //already there
      }

      var startUnit = previous === null ? null : s.d[previous]();
      var original = s.epoch; //try to get it as close as we can

      var diff = n - current;
      s.epoch += milliseconds[unit] * diff; //DST edge-case: if we are going many days, be a little conservative
      // console.log(unit, diff)

      if (unit === 'day') {
        // s.epoch -= ms.minute
        //but don't push it over a month
        if (Math.abs(diff) > 28 && n < 28) {
          s.epoch += milliseconds.hour;
        }
      } // 1st time: oops, did we change previous unit? revert it.


      if (previous !== null && startUnit !== s.d[previous]()) {
        // console.warn('spacetime warning: missed setting ' + unit)
        s.epoch = original; // s.epoch += ms[unit] * diff * 0.89 // maybe try and make it close...?
      } //repair it if we've gone too far or something
      //(go by half-steps, just in case)


      var halfStep = milliseconds[unit] / 2;

      while (s.d[fn]() < n) {
        s.epoch += halfStep;
      }

      while (s.d[fn]() > n) {
        s.epoch -= halfStep;
      } // 2nd time: did we change previous unit? revert it.


      if (previous !== null && startUnit !== s.d[previous]()) {
        // console.warn('spacetime warning: missed setting ' + unit)
        s.epoch = original;
      }
    }; //find the desired date by a increment/check while loop


    var units = {
      year: {
        valid: function valid(n) {
          return n > -4000 && n < 4000;
        },
        walkTo: function walkTo(s, n) {
          return walk(s, n, 'getFullYear', 'year', null);
        }
      },
      month: {
        valid: function valid(n) {
          return n >= 0 && n <= 11;
        },
        walkTo: function walkTo(s, n) {
          var d = s.d;
          var current = d.getMonth();
          var original = s.epoch;
          var startUnit = d.getFullYear();

          if (current === n) {
            return;
          } //try to get it as close as we can..


          var diff = n - current;
          s.epoch += milliseconds.day * (diff * 28); //special case
          //oops, did we change the year? revert it.

          if (startUnit !== s.d.getFullYear()) {
            s.epoch = original;
          } //incriment by day


          while (s.d.getMonth() < n) {
            s.epoch += milliseconds.day;
          }

          while (s.d.getMonth() > n) {
            s.epoch -= milliseconds.day;
          }
        }
      },
      date: {
        valid: function valid(n) {
          return n > 0 && n <= 31;
        },
        walkTo: function walkTo(s, n) {
          return walk(s, n, 'getDate', 'day', 'getMonth');
        }
      },
      hour: {
        valid: function valid(n) {
          return n >= 0 && n < 24;
        },
        walkTo: function walkTo(s, n) {
          return walk(s, n, 'getHours', 'hour', 'getDate');
        }
      },
      minute: {
        valid: function valid(n) {
          return n >= 0 && n < 60;
        },
        walkTo: function walkTo(s, n) {
          return walk(s, n, 'getMinutes', 'minute', 'getHours');
        }
      },
      second: {
        valid: function valid(n) {
          return n >= 0 && n < 60;
        },
        walkTo: function walkTo(s, n) {
          //do this one directly
          s.epoch = s.seconds(n).epoch;
        }
      },
      millisecond: {
        valid: function valid(n) {
          return n >= 0 && n < 1000;
        },
        walkTo: function walkTo(s, n) {
          //do this one directly
          s.epoch = s.milliseconds(n).epoch;
        }
      }
    };

    var walkTo = function walkTo(s, wants) {
      var keys = Object.keys(units);
      var old = s.clone();

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var n = wants[k];

        if (n === undefined) {
          n = old[k]();
        }

        if (typeof n === 'string') {
          n = parseInt(n, 10);
        } //make-sure it's valid


        if (!units[k].valid(n)) {
          s.epoch = null;

          if (s.silent === false) {
            console.warn('invalid ' + k + ': ' + n);
          }

          return;
        }

        units[k].walkTo(s, n);
      }

      return;
    };

    var walk_1 = walkTo;

    var shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
    var longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    function buildMapping() {
      var obj = {
        sep: 8 //support this format

      };

      for (var i = 0; i < shortMonths.length; i++) {
        obj[shortMonths[i]] = i;
      }

      for (var _i = 0; _i < longMonths.length; _i++) {
        obj[longMonths[_i]] = _i;
      }

      return obj;
    }

    var months = {
      "short": function short() {
        return shortMonths;
      },
      "long": function long() {
        return longMonths;
      },
      mapping: function mapping() {
        return buildMapping();
      },
      set: function set(i18n) {
        shortMonths = i18n["short"] || shortMonths;
        longMonths = i18n["long"] || longMonths;
      }
    };

    //pull-apart ISO offsets, like "+0100"
    var parseOffset$1 = function parseOffset(s, offset) {
      if (!offset) {
        return s;
      } //this is a fancy-move


      if (offset === 'Z') {
        offset = '+0000';
      } // according to ISO8601, tz could be hh:mm, hhmm or hh
      // so need few more steps before the calculation.


      var num = 0; // for (+-)hh:mm

      if (/^[\+-]?[0-9]{2}:[0-9]{2}$/.test(offset)) {
        //support "+01:00"
        if (/:00/.test(offset) === true) {
          offset = offset.replace(/:00/, '');
        } //support "+01:30"


        if (/:30/.test(offset) === true) {
          offset = offset.replace(/:30/, '.5');
        }
      } // for (+-)hhmm


      if (/^[\+-]?[0-9]{4}$/.test(offset)) {
        offset = offset.replace(/30$/, '.5');
      }

      num = parseFloat(offset); //divide by 100 or 10 - , "+0100", "+01"

      if (Math.abs(num) > 100) {
        num = num / 100;
      } //okay, try to match it to a utc timezone
      //remember - this is opposite! a -5 offset maps to Etc/GMT+5  ¯\_(:/)_/¯
      //https://askubuntu.com/questions/519550/why-is-the-8-timezone-called-gmt-8-in-the-filesystem


      num *= -1;

      if (num >= 0) {
        num = '+' + num;
      }

      var tz = 'etc/gmt' + num;
      var zones = s.timezones;

      if (zones[tz]) {
        // log a warning if we're over-writing a given timezone?
        // console.log('changing timezone to: ' + tz)
        s.tz = tz;
      }

      return s;
    };

    var parseOffset_1$1 = parseOffset$1;

    var parseTime = function parseTime(s) {
      var str = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      str = str.replace(/^\s+/, '').toLowerCase(); //trim
      //formal time formats - 04:30.23

      var arr = str.match(/([0-9]{1,2}):([0-9]{1,2}):?([0-9]{1,2})?[:\.]?([0-9]{1,4})?/);

      if (arr !== null) {
        //validate it a little
        var h = Number(arr[1]);

        if (h < 0 || h > 24) {
          return s.startOf('day');
        }

        var m = Number(arr[2]); //don't accept '5:3pm'

        if (arr[2].length < 2 || m < 0 || m > 59) {
          return s.startOf('day');
        }

        s = s.hour(h);
        s = s.minute(m);
        s = s.seconds(arr[3] || 0);
        s = s.millisecond(arr[4] || 0); //parse-out am/pm

        var ampm = str.match(/[\b0-9](am|pm)\b/);

        if (ampm !== null && ampm[1]) {
          s = s.ampm(ampm[1]);
        }

        return s;
      } //try an informal form - 5pm (no minutes)


      arr = str.match(/([0-9]+) ?(am|pm)/);

      if (arr !== null && arr[1]) {
        var _h = Number(arr[1]); //validate it a little..


        if (_h > 12 || _h < 1) {
          return s.startOf('day');
        }

        s = s.hour(arr[1] || 0);
        s = s.ampm(arr[2]);
        s = s.startOf('hour');
        return s;
      } //no time info found, use start-of-day


      s = s.startOf('day');
      return s;
    };

    var parseTime_1 = parseTime;

    var monthLengths = [31, // January - 31 days
    28, // February - 28 days in a common year and 29 days in leap years
    31, // March - 31 days
    30, // April - 30 days
    31, // May - 31 days
    30, // June - 30 days
    31, // July - 31 days
    31, // August - 31 days
    30, // September - 30 days
    31, // October - 31 days
    30, // November - 30 days
    31 // December - 31 days
    ];
    var monthLengths_1 = monthLengths; // 28 - feb

    var isLeapYear = fns.isLeapYear; //given a month, return whether day number exists in it

    var hasDate = function hasDate(obj) {
      //invalid values
      if (monthLengths_1.hasOwnProperty(obj.month) !== true) {
        return false;
      } //support leap-year in february


      if (obj.month === 1) {
        if (isLeapYear(obj.year) && obj.date <= 29) {
          return true;
        } else {
          return obj.date <= 28;
        }
      } //is this date too-big for this month?


      var max = monthLengths_1[obj.month] || 0;

      if (obj.date <= max) {
        return true;
      }

      return false;
    };

    var hasDate_1 = hasDate;

    var months$1 = months.mapping();

    var parseYear = function parseYear() {
      var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var today = arguments.length > 1 ? arguments[1] : undefined;
      var year = parseInt(str.trim(), 10); // use a given year from options.today

      if (!year && today) {
        year = today.year;
      } // fallback to this year


      year = year || new Date().getFullYear();
      return year;
    };

    var strFmt = [//iso-this 1998-05-30T22:00:00:000Z, iso-that 2017-04-03T08:00:00-0700
    {
      reg: /^(\-?0?0?[0-9]{3,4})-([0-9]{1,2})-([0-9]{1,2})[T| ]([0-9.:]+)(Z|[0-9\-\+:]+)?$/,
      parse: function parse(s, arr, givenTz, options) {
        var month = parseInt(arr[2], 10) - 1;
        var obj = {
          year: arr[1],
          month: month,
          date: arr[3]
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        parseOffset_1$1(s, arr[5]);
        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //iso "2015-03-25" or "2015/03/25" or "2015/03/25 12:26:14 PM"
    {
      reg: /^([0-9]{4})[\-\/]([0-9]{1,2})[\-\/]([0-9]{1,2}),?( [0-9]{1,2}:[0-9]{2}:?[0-9]{0,2}? ?(am|pm|gmt))?$/i,
      parse: function parse(s, arr) {
        var obj = {
          year: arr[1],
          month: parseInt(arr[2], 10) - 1,
          date: parseInt(arr[3], 10)
        };

        if (obj.month >= 12) {
          //support yyyy/dd/mm (weird, but ok)
          obj.date = parseInt(arr[2], 10);
          obj.month = parseInt(arr[3], 10) - 1;
        }

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //mm/dd/yyyy - uk/canada "6/28/2019, 12:26:14 PM"
    {
      reg: /^([0-9]{1,2})[\-\/]([0-9]{1,2})[\-\/]?([0-9]{4})?,?( [0-9]{1,2}:[0-9]{2}:?[0-9]{0,2}? ?(am|pm|gmt))?$/i,
      parse: function parse(s, arr) {
        var month = parseInt(arr[1], 10) - 1;
        var date = parseInt(arr[2], 10); //support dd/mm/yyy

        if (s.british || month >= 12) {
          date = parseInt(arr[1], 10);
          month = parseInt(arr[2], 10) - 1;
        }

        var year = arr[3] || new Date().getFullYear();
        var obj = {
          year: year,
          month: month,
          date: date
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //common british format - "25-feb-2015"
    {
      reg: /^([0-9]{1,2})[\-\/]([a-z]+)[\-\/]?([0-9]{4})?$/i,
      parse: function parse(s, arr) {
        var month = months$1[arr[2].toLowerCase()];
        var year = parseYear(arr[3], s._today);
        var obj = {
          year: year,
          month: month,
          date: fns.toCardinal(arr[1] || '')
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //Long "Mar 25 2015"
    //February 22, 2017 15:30:00
    {
      reg: /^([a-z]+) ([0-9]{1,2}(?:st|nd|rd|th)?),?( [0-9]{4})?( ([0-9:]+( ?am| ?pm| ?gmt)?))?$/i,
      parse: function parse(s, arr) {
        var month = months$1[arr[1].toLowerCase()];
        var year = parseYear(arr[3], s._today);
        var obj = {
          year: year,
          month: month,
          date: fns.toCardinal(arr[2] || '')
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //February 2017 (implied date)
    {
      reg: /^([a-z]+) ([0-9]{4})$/i,
      parse: function parse(s, arr) {
        var month = months$1[arr[1].toLowerCase()];
        var year = parseYear(arr[2], s._today);
        var obj = {
          year: year,
          month: month,
          date: s._today.date || 1
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, //Long "25 Mar 2015"
    {
      reg: /^([0-9]{1,2}(?:st|nd|rd|th)?) ([a-z]+),?( [0-9]{4})?,? ?([0-9]{1,2}:[0-9]{2}:?[0-9]{0,2}? ?(am|pm|gmt))?$/i,
      parse: function parse(s, arr) {
        var month = months$1[arr[2].toLowerCase()];

        if (!month) {
          return null;
        }

        var year = parseYear(arr[3], s._today);
        var obj = {
          year: year,
          month: month,
          date: fns.toCardinal(arr[1])
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s, arr[4]);
        return s;
      }
    }, {
      // '200bc'
      reg: /^[0-9,]+ ?b\.?c\.?$/i,
      parse: function parse(s, arr) {
        var str = arr[0] || ''; //make negative-year

        str = str.replace(/^([0-9,]+) ?b\.?c\.?$/i, '-$1'); //remove commas

        str = str.replace(/,/g, '');
        var year = parseInt(str.trim(), 10);
        var d = new Date();
        var obj = {
          year: year,
          month: d.getMonth(),
          date: d.getDate()
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s);
        return s;
      }
    }, {
      // '200ad'
      reg: /^[0-9,]+ ?(a\.?d\.?|c\.?e\.?)$/i,
      parse: function parse(s, arr) {
        var str = arr[0] || ''; //remove commas

        str = str.replace(/,/g, '');
        var year = parseInt(str.trim(), 10);
        var d = new Date();
        var obj = {
          year: year,
          month: d.getMonth(),
          date: d.getDate()
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s);
        return s;
      }
    }, {
      // '1992'
      reg: /^[0-9]{4}( ?a\.?d\.?)?$/i,
      parse: function parse(s, arr) {
        var today = s._today;
        var year = parseYear(arr[0], today);
        var d = new Date(); // using today's date, but a new month is awkward.

        if (today.month && !today.date) {
          today.date = 1;
        }

        var obj = {
          year: year,
          month: today.month || d.getMonth(),
          date: today.date || d.getDate()
        };

        if (hasDate_1(obj) === false) {
          s.epoch = null;
          return s;
        }

        walk_1(s, obj);
        s = parseTime_1(s);
        return s;
      }
    }];
    var strParse = strFmt;

    // pull in 'today' data for the baseline moment
    var getNow = function getNow(s) {
      s.epoch = Date.now();
      Object.keys(s._today || {}).forEach(function (k) {
        if (typeof s[k] === 'function') {
          s = s[k](s._today[k]);
        }
      });
      return s;
    };

    var dates = {
      now: function now(s) {
        return getNow(s);
      },
      today: function today(s) {
        return getNow(s);
      },
      tonight: function tonight(s) {
        s = getNow(s);
        s = s.hour(18); //6pm

        return s;
      },
      tomorrow: function tomorrow(s) {
        s = getNow(s);
        s = s.add(1, 'day');
        s = s.startOf('day');
        return s;
      },
      yesterday: function yesterday(s) {
        s = getNow(s);
        s = s.subtract(1, 'day');
        s = s.startOf('day');
        return s;
      },
      christmas: function christmas(s) {
        var year = getNow(s).year();
        s = s.set([year, 11, 25, 18, 0, 0]); // Dec 25

        return s;
      },
      'new years': function newYears(s) {
        var year = getNow(s).year();
        s = s.set([year, 11, 31, 18, 0, 0]); // Dec 31

        return s;
      }
    };
    dates['new years eve'] = dates['new years'];
    var namedDates = dates;

    //  -  can't use built-in js parser ;(
    //=========================================
    // ISO Date	  "2015-03-25"
    // Short Date	"03/25/2015" or "2015/03/25"
    // Long Date	"Mar 25 2015" or "25 Mar 2015"
    // Full Date	"Wednesday March 25 2015"
    //=========================================
    //-- also -
    // if the given epoch is really small, they've probably given seconds and not milliseconds
    // anything below this number is likely (but not necessarily) a mistaken input.
    // this may seem like an arbitrary number, but it's 'within jan 1970'
    // this is only really ambiguous until 2054 or so

    var minimumEpoch = 2500000000;
    var defaults = {
      year: new Date().getFullYear(),
      month: 0,
      date: 1
    }; //support [2016, 03, 01] format

    var handleArray = function handleArray(s, arr, today) {
      var order = ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'];

      for (var i = 0; i < order.length; i++) {
        var num = arr[i] || today[order[i]] || defaults[order[i]] || 0;
        s = s[order[i]](num);
      }

      return s;
    }; //support {year:2016, month:3} format


    var handleObject = function handleObject(s, obj, today) {
      obj = Object.assign({}, defaults, today, obj);
      var keys = Object.keys(obj);

      for (var i = 0; i < keys.length; i++) {
        var unit = keys[i]; //make sure we have this method

        if (s[unit] === undefined || typeof s[unit] !== 'function') {
          continue;
        } //make sure the value is a number


        if (obj[unit] === null || obj[unit] === undefined || obj[unit] === '') {
          continue;
        }

        var num = obj[unit] || today[unit] || defaults[unit] || 0;
        s = s[unit](num);
      }

      return s;
    }; //find the epoch from different input styles


    var parseInput = function parseInput(s, input, givenTz) {
      var today = s._today || defaults; //if we've been given a epoch number, it's easy

      if (typeof input === 'number') {
        if (input > 0 && input < minimumEpoch && s.silent === false) {
          console.warn('  - Warning: You are setting the date to January 1970.');
          console.warn('       -   did input seconds instead of milliseconds?');
        }

        s.epoch = input;
        return s;
      } //set tmp time


      s.epoch = Date.now(); // overwrite tmp time with 'today' value, if exists

      if (s._today && fns.isObject(s._today) && Object.keys(s._today).length > 0) {
        var res = handleObject(s, today, defaults);

        if (res.isValid()) {
          s.epoch = res.epoch;
        }
      } // null input means 'now'


      if (input === null || input === undefined || input === '') {
        return s; //k, we're good.
      } //support input of Date() object


      if (fns.isDate(input) === true) {
        s.epoch = input.getTime();
        return s;
      } //support [2016, 03, 01] format


      if (fns.isArray(input) === true) {
        s = handleArray(s, input, today);
        return s;
      } //support {year:2016, month:3} format


      if (fns.isObject(input) === true) {
        //support spacetime object as input
        if (input.epoch) {
          s.epoch = input.epoch;
          s.tz = input.tz;
          return s;
        }

        s = handleObject(s, input, today);
        return s;
      } //input as a string..


      if (typeof input !== 'string') {
        return s;
      } //little cleanup..


      input = input.replace(/\b(mon|tues|wed|wednes|thu|thurs|fri|sat|satur|sun)(day)?\b/i, '');
      input = input.replace(/,/g, '');
      input = input.replace(/ +/g, ' ').trim(); //try some known-words, like 'now'

      if (namedDates.hasOwnProperty(input) === true) {
        s = namedDates[input](s);
        return s;
      } //try each text-parse template, use the first good result


      for (var i = 0; i < strParse.length; i++) {
        var m = input.match(strParse[i].reg);

        if (m) {
          var _res = strParse[i].parse(s, m, givenTz);

          if (_res !== null) {
            return _res;
          }
        }
      }

      if (s.silent === false) {
        console.warn("Warning: couldn't parse date-string: '" + input + "'");
      }

      s.epoch = null;
      return s;
    };

    var input = parseInput;

    var shortDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    var longDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var days = {
      "short": function short() {
        return shortDays;
      },
      "long": function long() {
        return longDays;
      },
      set: function set(i18n) {
        shortDays = i18n["short"] || shortDays;
        longDays = i18n["long"] || longDays;
      }
    };

    // it's kind of nuts how involved this is
    // "+01:00", "+0100", or simply "+01"

    var isoOffset = function isoOffset(s) {
      var offset = s.timezone().current.offset;
      var isNegative = offset < 0;
      var minute = '00'; //handle 5.5 → '5:30'

      if (Math.abs(offset % 1) === 0.5) {
        minute = '30';

        if (offset >= 0) {
          offset = Math.floor(offset);
        } else {
          offset = Math.ceil(offset);
        }
      }

      if (isNegative) {
        //handle negative sign
        offset *= -1;
        offset = fns.zeroPad(offset, 2);
        offset = '-' + offset;
      } else {
        offset = fns.zeroPad(offset, 2);
        offset = '+' + offset;
      }

      offset = offset + ':' + minute; //'Z' means 00

      if (offset === '+00:00') {
        offset = 'Z';
      }

      return offset;
    };

    var _offset = isoOffset;

    var format = {
      day: function day(s) {
        return fns.titleCase(s.dayName());
      },
      'day-short': function dayShort(s) {
        return fns.titleCase(days["short"]()[s.day()]);
      },
      'day-number': function dayNumber(s) {
        return s.day();
      },
      'day-ordinal': function dayOrdinal(s) {
        return fns.ordinal(s.day());
      },
      'day-pad': function dayPad(s) {
        return fns.zeroPad(s.day());
      },
      date: function date(s) {
        return s.date();
      },
      'date-ordinal': function dateOrdinal(s) {
        return fns.ordinal(s.date());
      },
      'date-pad': function datePad(s) {
        return fns.zeroPad(s.date());
      },
      month: function month(s) {
        return fns.titleCase(s.monthName());
      },
      'month-short': function monthShort(s) {
        return fns.titleCase(months["short"]()[s.month()]);
      },
      'month-number': function monthNumber(s) {
        return s.month();
      },
      'month-ordinal': function monthOrdinal(s) {
        return fns.ordinal(s.month());
      },
      'month-pad': function monthPad(s) {
        return fns.zeroPad(s.month());
      },
      'iso-month': function isoMonth(s) {
        return fns.zeroPad(s.month() + 1);
      },
      //1-based months
      year: function year(s) {
        var year = s.year();

        if (year > 0) {
          return year;
        }

        year = Math.abs(year);
        return year + ' BC';
      },
      'year-short': function yearShort(s) {
        var year = s.year();

        if (year > 0) {
          return "'".concat(String(s.year()).substr(2, 4));
        }

        year = Math.abs(year);
        return year + ' BC';
      },
      'iso-year': function isoYear(s) {
        var year = s.year();
        var isNegative = year < 0;
        var str = fns.zeroPad(Math.abs(year), 4); //0-padded

        if (isNegative) {
          //negative years are for some reason 6-digits ('-00008')
          str = fns.zeroPad(str, 6);
          str = '-' + str;
        }

        return str;
      },
      time: function time(s) {
        return s.time();
      },
      'time-24': function time24(s) {
        return "".concat(s.hour24(), ":").concat(fns.zeroPad(s.minute()));
      },
      hour: function hour(s) {
        return s.hour12();
      },
      'hour-pad': function hourPad(s) {
        return fns.zeroPad(s.hour12());
      },
      'hour-24': function hour24(s) {
        return s.hour24();
      },
      'hour-24-pad': function hour24Pad(s) {
        return fns.zeroPad(s.hour24());
      },
      minute: function minute(s) {
        return s.minute();
      },
      'minute-pad': function minutePad(s) {
        return fns.zeroPad(s.minute());
      },
      second: function second(s) {
        return s.second();
      },
      'second-pad': function secondPad(s) {
        return fns.zeroPad(s.second());
      },
      ampm: function ampm(s) {
        return s.ampm();
      },
      quarter: function quarter(s) {
        return 'Q' + s.quarter();
      },
      season: function season(s) {
        return s.season();
      },
      era: function era(s) {
        return s.era();
      },
      json: function json(s) {
        return s.json();
      },
      timezone: function timezone(s) {
        return s.timezone().name;
      },
      offset: function offset(s) {
        return _offset(s);
      },
      numeric: function numeric(s) {
        return "".concat(s.year(), "/").concat(fns.zeroPad(s.month() + 1), "/").concat(fns.zeroPad(s.date()));
      },
      // yyyy/mm/dd
      'numeric-us': function numericUs(s) {
        return "".concat(fns.zeroPad(s.month() + 1), "/").concat(fns.zeroPad(s.date()), "/").concat(s.year());
      },
      // mm/dd/yyyy
      'numeric-uk': function numericUk(s) {
        return "".concat(fns.zeroPad(s.date()), "/").concat(fns.zeroPad(s.month() + 1), "/").concat(s.year());
      },
      //dd/mm/yyyy
      'mm/dd': function mmDd(s) {
        return "".concat(fns.zeroPad(s.month() + 1), "/").concat(fns.zeroPad(s.date()));
      },
      //mm/dd
      // ... https://en.wikipedia.org/wiki/ISO_8601 ;(((
      iso: function iso(s) {
        var year = s.format('iso-year');
        var month = fns.zeroPad(s.month() + 1); //1-based months

        var date = fns.zeroPad(s.date());
        var hour = fns.zeroPad(s.h24());
        var minute = fns.zeroPad(s.minute());
        var second = fns.zeroPad(s.second());
        var ms = fns.zeroPad(s.millisecond(), 3);
        var offset = _offset(s);
        return "".concat(year, "-").concat(month, "-").concat(date, "T").concat(hour, ":").concat(minute, ":").concat(second, ".").concat(ms).concat(offset); //2018-03-09T08:50:00.000-05:00
      },
      'iso-short': function isoShort(s) {
        var month = fns.zeroPad(s.month() + 1); //1-based months

        var date = fns.zeroPad(s.date());
        return "".concat(s.year(), "-").concat(month, "-").concat(date); //2017-02-15
      },
      'iso-utc': function isoUtc(s) {
        return new Date(s.epoch).toISOString(); //2017-03-08T19:45:28.367Z
      },
      //i made these up
      nice: function nice(s) {
        return "".concat(months["short"]()[s.month()], " ").concat(fns.ordinal(s.date()), ", ").concat(s.time());
      },
      'nice-year': function niceYear(s) {
        return "".concat(months["short"]()[s.month()], " ").concat(fns.ordinal(s.date()), ", ").concat(s.year());
      },
      'nice-day': function niceDay(s) {
        return "".concat(days["short"]()[s.day()], " ").concat(fns.titleCase(months["short"]()[s.month()]), " ").concat(fns.ordinal(s.date()));
      },
      'nice-full': function niceFull(s) {
        return "".concat(s.dayName(), " ").concat(fns.titleCase(s.monthName()), " ").concat(fns.ordinal(s.date()), ", ").concat(s.time());
      }
    }; //aliases

    var aliases = {
      'day-name': 'day',
      'month-name': 'month',
      'iso 8601': 'iso',
      'time-h24': 'time-24',
      'time-12': 'time',
      'time-h12': 'time',
      tz: 'timezone',
      'day-num': 'day-number',
      'month-num': 'month-number',
      'month-iso': 'iso-month',
      'year-iso': 'iso-year',
      'nice-short': 'nice',
      mdy: 'numeric-us',
      dmy: 'numeric-uk',
      ymd: 'numeric',
      'yyyy/mm/dd': 'numeric',
      'mm/dd/yyyy': 'numeric-us',
      'dd/mm/yyyy': 'numeric-us',
      'little-endian': 'numeric-uk',
      'big-endian': 'numeric',
      'day-nice': 'nice-day'
    };
    Object.keys(aliases).forEach(function (k) {
      return format[k] = format[aliases[k]];
    });

    var printFormat = function printFormat(s) {
      var str = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      //don't print anything if it's an invalid date
      if (s.isValid() !== true) {
        return '';
      } //support .format('month')


      if (format.hasOwnProperty(str)) {
        var out = format[str](s) || '';

        if (str !== 'json') {
          out = String(out);

          if (str !== 'ampm') {
            out = fns.titleCase(out);
          }
        }

        return out;
      } //support '{hour}:{minute}' notation


      if (str.indexOf('{') !== -1) {
        var sections = /\{(.+?)\}/g;
        str = str.replace(sections, function (_, fmt) {
          fmt = fmt.toLowerCase().trim();

          if (format.hasOwnProperty(fmt)) {
            return String(format[fmt](s));
          }

          return '';
        });
        return str;
      }

      return s.format('iso-short');
    };

    var format_1 = printFormat;

    var pad = fns.zeroPad;
    var formatTimezone = fns.formatTimezone; //parse this insane unix-time-templating thing, from the 19th century
    //http://unicode.org/reports/tr35/tr35-25.html#Date_Format_Patterns
    //time-symbols we support

    var mapping = {
      G: function G(s) {
        return s.era();
      },
      GG: function GG(s) {
        return s.era();
      },
      GGG: function GGG(s) {
        return s.era();
      },
      GGGG: function GGGG(s) {
        return s.era() === 'AD' ? 'Anno Domini' : 'Before Christ';
      },
      //year
      y: function y(s) {
        return s.year();
      },
      yy: function yy(s) {
        //last two chars
        return parseInt(String(s.year()).substr(2, 4), 10);
      },
      yyy: function yyy(s) {
        return s.year();
      },
      yyyy: function yyyy(s) {
        return s.year();
      },
      yyyyy: function yyyyy(s) {
        return '0' + s.year();
      },
      // u: (s) => {},//extended non-gregorian years
      //quarter
      Q: function Q(s) {
        return s.quarter();
      },
      QQ: function QQ(s) {
        return s.quarter();
      },
      QQQ: function QQQ(s) {
        return s.quarter();
      },
      QQQQ: function QQQQ(s) {
        return s.quarter();
      },
      //month
      M: function M(s) {
        return s.month() + 1;
      },
      MM: function MM(s) {
        return pad(s.month() + 1);
      },
      MMM: function MMM(s) {
        return s.format('month-short');
      },
      MMMM: function MMMM(s) {
        return s.format('month');
      },
      //week
      w: function w(s) {
        return s.week();
      },
      ww: function ww(s) {
        return pad(s.week());
      },
      //week of month
      // W: (s) => s.week(),
      //date of month
      d: function d(s) {
        return s.date();
      },
      dd: function dd(s) {
        return pad(s.date());
      },
      //date of year
      D: function D(s) {
        return s.dayOfYear();
      },
      DD: function DD(s) {
        return pad(s.dayOfYear());
      },
      DDD: function DDD(s) {
        return pad(s.dayOfYear(), 3);
      },
      // F: (s) => {},//date of week in month
      // g: (s) => {},//modified julian day
      //day
      E: function E(s) {
        return s.format('day-short');
      },
      EE: function EE(s) {
        return s.format('day-short');
      },
      EEE: function EEE(s) {
        return s.format('day-short');
      },
      EEEE: function EEEE(s) {
        return s.format('day');
      },
      EEEEE: function EEEEE(s) {
        return s.format('day')[0];
      },
      e: function e(s) {
        return s.day();
      },
      ee: function ee(s) {
        return s.day();
      },
      eee: function eee(s) {
        return s.format('day-short');
      },
      eeee: function eeee(s) {
        return s.format('day');
      },
      eeeee: function eeeee(s) {
        return s.format('day')[0];
      },
      //am/pm
      a: function a(s) {
        return s.ampm().toUpperCase();
      },
      aa: function aa(s) {
        return s.ampm().toUpperCase();
      },
      aaa: function aaa(s) {
        return s.ampm().toUpperCase();
      },
      aaaa: function aaaa(s) {
        return s.ampm().toUpperCase();
      },
      //hour
      h: function h(s) {
        return s.h12();
      },
      hh: function hh(s) {
        return pad(s.h12());
      },
      H: function H(s) {
        return s.hour();
      },
      HH: function HH(s) {
        return pad(s.hour());
      },
      // j: (s) => {},//weird hour format
      m: function m(s) {
        return s.minute();
      },
      mm: function mm(s) {
        return pad(s.minute());
      },
      s: function s(_s) {
        return _s.second();
      },
      ss: function ss(s) {
        return pad(s.second());
      },
      //milliseconds in the day
      A: function A(s) {
        return s.epoch - s.startOf('day').epoch;
      },
      //timezone
      z: function z(s) {
        return s.timezone().name;
      },
      zz: function zz(s) {
        return s.timezone().name;
      },
      zzz: function zzz(s) {
        return s.timezone().name;
      },
      zzzz: function zzzz(s) {
        return s.timezone().name;
      },
      Z: function Z(s) {
        return formatTimezone(s.timezone().current.offset);
      },
      ZZ: function ZZ(s) {
        return formatTimezone(s.timezone().current.offset);
      },
      ZZZ: function ZZZ(s) {
        return formatTimezone(s.timezone().current.offset);
      },
      ZZZZ: function ZZZZ(s) {
        return formatTimezone(s.timezone().current.offset, ':');
      }
    };

    var addAlias = function addAlias(_char, to, n) {
      var name = _char;
      var toName = to;

      for (var i = 0; i < n; i += 1) {
        mapping[name] = mapping[toName];
        name += _char;
        toName += to;
      }
    };

    addAlias('q', 'Q', 4);
    addAlias('L', 'M', 4);
    addAlias('Y', 'y', 4);
    addAlias('c', 'e', 4);
    addAlias('k', 'H', 2);
    addAlias('K', 'h', 2);
    addAlias('S', 's', 2);
    addAlias('v', 'z', 4);
    addAlias('V', 'Z', 4);

    var unixFmt = function unixFmt(s, str) {
      var chars = str.split(''); //combine consecutive chars, like 'yyyy' as one.

      var arr = [chars[0]];
      var quoteOn = false;

      for (var i = 1; i < chars.length; i += 1) {
        //support quoted substrings
        if (chars[i] === "'") {
          quoteOn = !quoteOn; //support '', meaning one tick

          if (quoteOn === true && chars[i + 1] && chars[i + 1] === "'") {
            quoteOn = true;
          } else {
            continue;
          }
        } //merge it with the last one


        if (quoteOn === true || chars[i] === arr[arr.length - 1][0]) {
          arr[arr.length - 1] += chars[i];
        } else {
          arr.push(chars[i]);
        }
      }

      return arr.reduce(function (txt, c) {
        if (mapping[c] !== undefined) {
          txt += mapping[c](s) || '';
        } else {
          txt += c;
        }

        return txt;
      }, '');
    };

    var unixFmt_1 = unixFmt;

    var units$1 = ['year', 'season', 'quarter', 'month', 'week', 'day', 'quarterHour', 'hour', 'minute'];

    var doUnit = function doUnit(s, k) {
      var start = s.clone().startOf(k);
      var end = s.clone().endOf(k);
      var duration = end.epoch - start.epoch;
      var percent = (s.epoch - start.epoch) / duration;
      return parseFloat(percent.toFixed(2));
    }; //how far it is along, from 0-1


    var progress = function progress(s, unit) {
      if (unit) {
        unit = fns.normalize(unit);
        return doUnit(s, unit);
      }

      var obj = {};
      units$1.forEach(function (k) {
        obj[k] = doUnit(s, k);
      });
      return obj;
    };

    var progress_1 = progress;

    var nearest = function nearest(s, unit) {
      //how far have we gone?
      var prog = s.progress();
      unit = fns.normalize(unit); //fix camel-case for this one

      if (unit === 'quarterhour') {
        unit = 'quarterHour';
      }

      if (prog[unit] !== undefined) {
        // go forward one?
        if (prog[unit] > 0.5) {
          s = s.add(1, unit);
        } // go to start


        s = s.startOf(unit);
      } else if (s.silent === false) {
        console.warn("no known unit '" + unit + "'");
      }

      return s;
    };

    var nearest_1 = nearest;

    //increment until dates are the same
    var climb = function climb(a, b, unit) {
      var i = 0;
      a = a.clone();

      while (a.isBefore(b)) {
        //do proper, expensive increment to catch all-the-tricks
        a = a.add(1, unit);
        i += 1;
      } //oops, we went too-far..


      if (a.isAfter(b, unit)) {
        i -= 1;
      }

      return i;
    }; // do a thurough +=1 on the unit, until they match
    // for speed-reasons, only used on day, month, week.


    var diffOne = function diffOne(a, b, unit) {
      if (a.isBefore(b)) {
        return climb(a, b, unit);
      } else {
        return climb(b, a, unit) * -1; //reverse it
      }
    };

    var one = diffOne;

    // 2020 - 2019 may be 1 year, or 0 years
    // - '1 year difference' means 366 days during a leap year

    var fastYear = function fastYear(a, b) {
      var years = b.year() - a.year(); // should we decrement it by 1?

      a = a.year(b.year());

      if (a.isAfter(b)) {
        years -= 1;
      }

      return years;
    }; // use a waterfall-method for computing a diff of any 'pre-knowable' units
    // compute years, then compute months, etc..
    // ... then ms-math for any very-small units


    var diff = function diff(a, b) {
      // an hour is always the same # of milliseconds
      // so these units can be 'pre-calculated'
      var msDiff = b.epoch - a.epoch;
      var obj = {
        milliseconds: msDiff,
        seconds: parseInt(msDiff / 1000, 10)
      };
      obj.minutes = parseInt(obj.seconds / 60, 10);
      obj.hours = parseInt(obj.minutes / 60, 10); //do the year

      var tmp = a.clone();
      obj.years = fastYear(tmp, b);
      tmp = a.add(obj.years, 'year'); //there's always 12 months in a year...

      obj.months = obj.years * 12;
      tmp = a.add(obj.months, 'month');
      obj.months += one(tmp, b, 'month'); // there's always atleast 52 weeks in a year..
      // (month * 4) isn't as close

      obj.weeks = obj.years * 52;
      tmp = a.add(obj.weeks, 'week');
      obj.weeks += one(tmp, b, 'week'); // there's always atleast 7 days in a week

      obj.days = obj.weeks * 7;
      tmp = a.add(obj.days, 'day');
      obj.days += one(tmp, b, 'day');
      return obj;
    };

    var waterfall = diff;

    var reverseDiff = function reverseDiff(obj) {
      Object.keys(obj).forEach(function (k) {
        obj[k] *= -1;
      });
      return obj;
    }; // this method counts a total # of each unit, between a, b.
    // '1 month' means 28 days in february
    // '1 year' means 366 days in a leap year


    var main = function main(a, b, unit) {
      b = fns.beADate(b, a); //reverse values, if necessary

      var reversed = false;

      if (a.isAfter(b)) {
        var tmp = a;
        a = b;
        b = tmp;
        reversed = true;
      } //compute them all (i know!)


      var obj = waterfall(a, b);

      if (reversed) {
        obj = reverseDiff(obj);
      } //return just the requested unit


      if (unit) {
        //make sure it's plural-form
        unit = fns.normalize(unit);

        if (/s$/.test(unit) !== true) {
          unit += 's';
        }

        if (unit === 'dates') {
          unit = 'days';
        }

        return obj[unit];
      }

      return obj;
    };

    var diff$1 = main;

    //our conceptual 'break-points' for each unit

    var qualifiers = {
      months: {
        almost: 10,
        over: 4
      },
      days: {
        almost: 25,
        over: 10
      },
      hours: {
        almost: 20,
        over: 8
      },
      minutes: {
        almost: 50,
        over: 20
      },
      seconds: {
        almost: 50,
        over: 20
      }
    }; //get number of hours/minutes... between the two dates

    function getDiff(a, b) {
      var isBefore = a.isBefore(b);
      var later = isBefore ? b : a;
      var earlier = isBefore ? a : b;
      earlier = earlier.clone();
      var diff = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
      Object.keys(diff).forEach(function (unit) {
        if (earlier.isSame(later, unit)) {
          return;
        }

        var max = earlier.diff(later, unit);
        earlier = earlier.add(max, unit);
        diff[unit] = max;
      }); //reverse it, if necessary

      if (isBefore) {
        Object.keys(diff).forEach(function (u) {
          if (diff[u] !== 0) {
            diff[u] *= -1;
          }
        });
      }

      return diff;
    } // Expects a plural unit arg


    function pluralize(value, unit) {
      if (value === 1) {
        unit = unit.slice(0, -1);
      }

      return value + ' ' + unit;
    } //create the human-readable diff between the two dates


    var since = function since(start, end) {
      end = fns.beADate(end, start);
      var diff = getDiff(start, end);
      var isNow = Object.keys(diff).every(function (u) {
        return !diff[u];
      });

      if (isNow === true) {
        return {
          diff: diff,
          rounded: 'now',
          qualified: 'now',
          precise: 'now'
        };
      }

      var rounded;
      var qualified;
      var precise;
      var englishValues = []; //go through each value and create its text-representation

      Object.keys(diff).forEach(function (unit, i, units) {
        var value = Math.abs(diff[unit]);

        if (value === 0) {
          return;
        }

        var englishValue = pluralize(value, unit);
        englishValues.push(englishValue);

        if (!rounded) {
          rounded = qualified = englishValue;

          if (i > 4) {
            return;
          } //is it a 'almost' something, etc?


          var nextUnit = units[i + 1];
          var nextValue = Math.abs(diff[nextUnit]);

          if (nextValue > qualifiers[nextUnit].almost) {
            rounded = pluralize(value + 1, unit);
            qualified = 'almost ' + rounded;
          } else if (nextValue > qualifiers[nextUnit].over) qualified = 'over ' + englishValue;
        }
      }); //make them into a string

      precise = englishValues.splice(0, 2).join(', '); //handle before/after logic

      if (start.isAfter(end) === true) {
        rounded += ' ago';
        qualified += ' ago';
        precise += ' ago';
      } else {
        rounded = 'in ' + rounded;
        qualified = 'in ' + qualified;
        precise = 'in ' + precise;
      }

      return {
        diff: diff,
        rounded: rounded,
        qualified: qualified,
        precise: precise
      };
    };

    var since_1 = since;

    //https://www.timeanddate.com/calendar/aboutseasons.html
    // Spring - from March 1 to May 31;
    // Summer - from June 1 to August 31;
    // Fall (autumn) - from September 1 to November 30; and,
    // Winter - from December 1 to February 28 (February 29 in a leap year).
    var seasons = {
      north: [['spring', 2, 1], //spring march 1
      ['summer', 5, 1], //june 1
      ['fall', 8, 1], //sept 1
      ['autumn', 8, 1], //sept 1
      ['winter', 11, 1] //dec 1
      ],
      south: [['fall', 2, 1], //march 1
      ['autumn', 2, 1], //march 1
      ['winter', 5, 1], //june 1
      ['spring', 8, 1], //sept 1
      ['summer', 11, 1] //dec 1
      ]
    };

    var quarters = [null, [0, 1], //jan 1
    [3, 1], //apr 1
    [6, 1], //july 1
    [9, 1] //oct 1
    ];

    var units$2 = {
      minute: function minute(s) {
        walk_1(s, {
          second: 0,
          millisecond: 0
        });
        return s;
      },
      quarterhour: function quarterhour(s) {
        var minute = s.minutes();

        if (minute >= 45) {
          s = s.minutes(45);
        } else if (minute >= 30) {
          s = s.minutes(30);
        } else if (minute >= 15) {
          s = s.minutes(15);
        } else {
          s = s.minutes(0);
        }

        walk_1(s, {
          second: 0,
          millisecond: 0
        });
        return s;
      },
      hour: function hour(s) {
        walk_1(s, {
          minute: 0,
          second: 0,
          millisecond: 0
        });
        return s;
      },
      day: function day(s) {
        walk_1(s, {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        return s;
      },
      week: function week(s) {
        var original = s.clone();
        s = s.day(s._weekStart); //monday

        if (s.isAfter(original)) {
          s = s.subtract(1, 'week');
        }

        walk_1(s, {
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        return s;
      },
      month: function month(s) {
        walk_1(s, {
          date: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        return s;
      },
      quarter: function quarter(s) {
        var q = s.quarter();

        if (quarters[q]) {
          walk_1(s, {
            month: quarters[q][0],
            date: quarters[q][1],
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
          });
        }

        return s;
      },
      season: function season(s) {
        var current = s.season();
        var hem = 'north';

        if (s.hemisphere() === 'South') {
          hem = 'south';
        }

        for (var i = 0; i < seasons[hem].length; i++) {
          if (seasons[hem][i][0] === current) {
            //winter goes between years
            var year = s.year();

            if (current === 'winter' && s.month() < 3) {
              year -= 1;
            }

            walk_1(s, {
              year: year,
              month: seasons[hem][i][1],
              date: seasons[hem][i][2],
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0
            });
            return s;
          }
        }

        return s;
      },
      year: function year(s) {
        walk_1(s, {
          month: 0,
          date: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
        return s;
      },
      decade: function decade(s) {
        s = s.startOf('year');
        var year = s.year();
        var decade = parseInt(year / 10, 10) * 10;
        s = s.year(decade);
        return s;
      },
      century: function century(s) {
        s = s.startOf('year');
        var year = s.year(); // near 0AD goes '-1 | +1'

        var decade = parseInt(year / 100, 10) * 100;
        s = s.year(decade);
        return s;
      }
    };
    units$2.date = units$2.day;

    var startOf = function startOf(a, unit) {
      var s = a.clone();
      unit = fns.normalize(unit);

      if (units$2[unit]) {
        return units$2[unit](s);
      }

      if (unit === 'summer' || unit === 'winter') {
        s = s.season(unit);
        return units$2.season(s);
      }

      return s;
    }; //piggy-backs off startOf


    var endOf = function endOf(a, unit) {
      var s = a.clone();
      unit = fns.normalize(unit);

      if (units$2[unit]) {
        s = units$2[unit](s);
        s = s.add(1, unit);
        s = s.subtract(1, 'milliseconds');
        return s;
      }

      return s;
    };

    var startOf_1 = {
      startOf: startOf,
      endOf: endOf
    };

    var isDay = function isDay(unit) {
      if (days["short"]().find(function (s) {
        return s === unit;
      })) {
        return true;
      }

      if (days["long"]().find(function (s) {
        return s === unit;
      })) {
        return true;
      }

      return false;
    }; // return a list of the weeks/months/days between a -> b
    // returns spacetime objects in the timezone of the input


    var every = function every(start) {
      var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var end = arguments.length > 2 ? arguments[2] : undefined;

      if (!unit || !end) {
        return [];
      } //cleanup unit param


      unit = fns.normalize(unit); //cleanup to param

      end = start.clone().set(end); //swap them, if they're backwards

      if (start.isAfter(end)) {
        var tmp = start;
        start = end;
        end = tmp;
      } //support 'every wednesday'


      var d = start.clone();

      if (isDay(unit)) {
        d = d.next(unit);
        unit = 'week';
      } else {
        d = d.next(unit);
      } //okay, actually start doing it


      var result = [];

      while (d.isBefore(end)) {
        result.push(d);
        d = d.add(1, unit);
      }

      return result;
    };

    var every_1 = every;

    var parseDst = function parseDst(dst) {
      if (!dst) {
        return [];
      }

      return dst.split('->');
    };

    var titleCase = function titleCase(str) {
      str = str[0].toUpperCase() + str.substr(1);
      str = str.replace(/\/gmt/, '/GMT');
      str = str.replace(/[\/_]([a-z])/gi, function (s) {
        return s.toUpperCase();
      });
      return str;
    }; //get metadata about this timezone


    var timezone = function timezone(s) {
      var zones = s.timezones;
      var tz = s.tz;

      if (zones.hasOwnProperty(tz) === false) {
        tz = find(s.tz, zones);
      }

      if (tz === null) {
        if (s.silent === false) {
          console.warn("Warn: could not find given or local timezone - '" + s.tz + "'");
        }

        return {
          current: {
            epochShift: 0
          }
        };
      }

      var found = zones[tz];
      var result = {
        name: titleCase(tz),
        hasDst: Boolean(found.dst),
        default_offset: found.offset,
        //do north-hemisphere version as default (sorry!)
        hemisphere: found.hem === 's' ? 'South' : 'North',
        current: {}
      };

      if (result.hasDst) {
        var arr = parseDst(found.dst);
        result.change = {
          start: arr[0],
          back: arr[1]
        };
      } //find the offsets for summer/winter times
      //(these variable names are north-centric)


      var summer = found.offset; // (july)

      var winter = summer; // (january) assume it's the same for now

      if (result.hasDst === true) {
        if (result.hemisphere === 'North') {
          winter = summer - 1;
        } else {
          //southern hemisphere
          winter = found.offset + 1;
        }
      } //find out which offset to use right now
      //use 'summer' time july-time


      if (result.hasDst === false) {
        result.current.offset = summer;
        result.current.isDST = false;
      } else if (summerTime(s.epoch, result.change.start, result.change.back, summer) === true) {
        result.current.offset = summer;
        result.current.isDST = result.hemisphere === 'North'; //dst 'on' in winter in north
      } else {
        //use 'winter' january-time
        result.current.offset = winter;
        result.current.isDST = result.hemisphere === 'South'; //dst 'on' in summer in south
      }

      return result;
    };

    var timezone_1 = timezone;

    var units$3 = ['century', 'decade', 'year', 'month', 'date', 'day', 'hour', 'minute', 'second', 'millisecond']; //the spacetime instance methods (also, the API)

    var methods = {
      set: function set(input$1, tz) {
        var s = this.clone();
        s = input(s, input$1, null);

        if (tz) {
          this.tz = find(tz);
        }

        return s;
      },
      timezone: function timezone() {
        return timezone_1(this);
      },
      isDST: function isDST() {
        return timezone_1(this).current.isDST;
      },
      hasDST: function hasDST() {
        return timezone_1(this).hasDst;
      },
      offset: function offset() {
        return timezone_1(this).current.offset * 60;
      },
      hemisphere: function hemisphere() {
        return timezone_1(this).hemisphere;
      },
      format: function format(fmt) {
        return format_1(this, fmt);
      },
      unixFmt: function unixFmt(fmt) {
        return unixFmt_1(this, fmt);
      },
      startOf: function startOf(unit) {
        return startOf_1.startOf(this, unit);
      },
      endOf: function endOf(unit) {
        return startOf_1.endOf(this, unit);
      },
      leapYear: function leapYear() {
        var year = this.year();
        return fns.isLeapYear(year);
      },
      progress: function progress(unit) {
        return progress_1(this, unit);
      },
      nearest: function nearest(unit) {
        return nearest_1(this, unit);
      },
      diff: function diff(d, unit) {
        return diff$1(this, d, unit);
      },
      since: function since(d) {
        if (!d) {
          d = this.clone().set();
        }

        return since_1(this, d);
      },
      next: function next(unit) {
        var s = this.add(1, unit);
        return s.startOf(unit);
      },
      //the start of the previous year/week/century
      last: function last(unit) {
        var s = this.subtract(1, unit);
        return s.startOf(unit);
      },
      isValid: function isValid() {
        //null/undefined epochs
        if (!this.epoch && this.epoch !== 0) {
          return false;
        }

        return !isNaN(this.d.getTime());
      },
      //travel to this timezone
      "goto": function goto(tz) {
        var s = this.clone();
        s.tz = find(tz, s.timezones); //science!

        return s;
      },
      //get each week/month/day between a -> b
      every: function every(unit, to) {
        return every_1(this, unit, to);
      },
      isAwake: function isAwake() {
        var hour = this.hour(); //10pm -> 8am

        if (hour < 8 || hour > 22) {
          return false;
        }

        return true;
      },
      isAsleep: function isAsleep() {
        return !this.isAwake();
      },
      //pretty-printing
      log: function log() {
        console.log('');
        console.log(format_1(this, 'nice-short'));
        return this;
      },
      logYear: function logYear() {
        console.log('');
        console.log(format_1(this, 'full-short'));
        return this;
      },
      json: function json() {
        var _this = this;

        return units$3.reduce(function (h, unit) {
          h[unit] = _this[unit]();
          return h;
        }, {});
      },
      debug: function debug() {
        var tz = this.timezone();
        var date = this.format('MM') + ' ' + this.format('date-ordinal') + ' ' + this.year();
        date += '\n     - ' + this.format('time');
        console.log('\n\n', date + '\n     - ' + tz.name + ' (' + tz.current.offset + ')');
        return this;
      },
      //alias of 'since' but opposite - like moment.js
      from: function from(d) {
        d = this.clone().set(d);
        return d.since(this);
      },
      fromNow: function fromNow() {
        var d = this.clone().set(Date.now());
        return d.since(this);
      },
      weekStart: function weekStart(input) {
        //accept a number directly
        if (typeof input === 'number') {
          this._weekStart = input;
          return this;
        }

        if (typeof input === 'string') {
          // accept 'wednesday'
          input = input.toLowerCase().trim();
          var num = days["short"]().indexOf(input);

          if (num === -1) {
            num = days["long"]().indexOf(input);
          }

          if (num === -1) {
            num = 1; //go back to default
          }

          this._weekStart = num;
        } else {
          console.warn('Spacetime Error: Cannot understand .weekStart() input:', input);
        }

        return this;
      }
    }; // aliases

    methods.inDST = methods.isDST;
    methods.round = methods.nearest;
    methods.each = methods.every;
    var methods_1 = methods;

    //these methods wrap around them.

    var isLeapYear$1 = fns.isLeapYear;

    var validate = function validate(n) {
      //handle number as a string
      if (typeof n === 'string') {
        n = parseInt(n, 10);
      }

      return n;
    };

    var order = ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond']; //reduce hostile micro-changes when moving dates by millisecond

    var confirm = function confirm(s, tmp, unit) {
      var n = order.indexOf(unit);
      var arr = order.slice(n, order.length);

      for (var i = 0; i < arr.length; i++) {
        var want = tmp[arr[i]]();
        s[arr[i]](want);
      }

      return s;
    };

    var set = {
      milliseconds: function milliseconds(s, n) {
        n = validate(n);
        var current = s.millisecond();
        var diff = current - n; //milliseconds to shift by

        return s.epoch - diff;
      },
      seconds: function seconds(s, n) {
        n = validate(n);
        var diff = s.second() - n;
        var shift = diff * milliseconds.second;
        return s.epoch - shift;
      },
      minutes: function minutes(s, n) {
        n = validate(n);
        var old = s.clone();
        var diff = s.minute() - n;
        var shift = diff * milliseconds.minute;
        s.epoch -= shift; // check against a screw-up
        // if (old.hour() != s.hour()) {
        //   walkTo(old, {
        //     minute: n
        //   })
        //   return old.epoch
        // }

        confirm(s, old, 'second');
        return s.epoch;
      },
      hours: function hours(s, n) {
        n = validate(n);

        if (n >= 24) {
          n = 24;
        } else if (n < 0) {
          n = 0;
        }

        var old = s.clone();
        var diff = s.hour() - n;
        var shift = diff * milliseconds.hour;
        s.epoch -= shift;
        walk_1(s, {
          hour: n
        });
        confirm(s, old, 'minute');
        return s.epoch;
      },
      //support setting time by '4:25pm' - this isn't very-well developed..
      time: function time(s, str) {
        var m = str.match(/([0-9]{1,2}):([0-9]{1,2})(am|pm)?/);

        if (!m) {
          //fallback to support just '2am'
          m = str.match(/([0-9]{1,2})(am|pm)/);

          if (!m) {
            return s.epoch;
          }

          m.splice(2, 0, '0'); //add implicit 0 minutes
        }

        var h24 = false;
        var hour = parseInt(m[1], 10);
        var minute = parseInt(m[2], 10);

        if (hour > 12) {
          h24 = true;
        } //make the hour into proper 24h time


        if (h24 === false) {
          if (m[3] === 'am' && hour === 12) {
            //12am is midnight
            hour = 0;
          }

          if (m[3] === 'pm' && hour < 12) {
            //12pm is noon
            hour += 12;
          }
        }

        s = s.hour(hour);
        s = s.minute(minute);
        s = s.second(0);
        s = s.millisecond(0);
        return s.epoch;
      },
      date: function date(s, n) {
        n = validate(n); //avoid setting february 31st

        if (n > 28) {
          var month = s.month();
          var max = monthLengths_1[month]; // support leap day in february

          if (month === 1 && n === 29 && isLeapYear$1(s.year())) {
            max = 29;
          }

          if (n > max) {
            n = max;
          }
        } //avoid setting < 0


        if (n <= 0) {
          n = 1;
        }

        walk_1(s, {
          date: n
        });
        return s.epoch;
      },
      //this one's tricky
      month: function month(s, n) {
        if (typeof n === 'string') {
          n = months.mapping()[n.toLowerCase()];
        }

        n = validate(n); //don't go past december

        if (n >= 12) {
          n = 11;
        }

        if (n <= 0) {
          n = 0;
        }

        var date = s.date(); //there's no 30th of february, etc.

        if (date > monthLengths_1[n]) {
          //make it as close as we can..
          date = monthLengths_1[n];
        }

        walk_1(s, {
          month: n,
          date: date
        });
        return s.epoch;
      },
      year: function year(s, n) {
        n = validate(n);
        walk_1(s, {
          year: n
        });
        return s.epoch;
      },
      dayOfYear: function dayOfYear(s, n) {
        n = validate(n);
        var old = s.clone();
        n -= 1; //days are 1-based

        if (n <= 0) {
          n = 0;
        } else if (n >= 365) {
          n = 364;
        }

        s = s.startOf('year');
        s = s.add(n, 'day');
        confirm(s, old, 'hour');
        return s.epoch;
      }
    };

    var methods$1 = {
      millisecond: function millisecond(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.milliseconds(s, num);
          return s;
        }

        return this.d.getMilliseconds();
      },
      second: function second(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.seconds(s, num);
          return s;
        }

        return this.d.getSeconds();
      },
      minute: function minute(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.minutes(s, num);
          return s;
        }

        return this.d.getMinutes();
      },
      hour: function hour(num) {
        var d = this.d;

        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.hours(s, num);
          return s;
        }

        return d.getHours();
      },
      //'3:30' is 3.5
      hourFloat: function hourFloat(num) {
        if (num !== undefined) {
          var s = this.clone();

          var _minute = num % 1;

          _minute = _minute * 60;

          var _hour = parseInt(num, 10);

          s.epoch = set.hours(s, _hour);
          s.epoch = set.minutes(s, _minute);
          return s;
        }

        var d = this.d;
        var hour = d.getHours();
        var minute = d.getMinutes();
        minute = minute / 60;
        return hour + minute;
      },
      // hour in 12h format
      hour12: function hour12(str) {
        var d = this.d;

        if (str !== undefined) {
          var s = this.clone();
          str = '' + str;
          var m = str.match(/^([0-9]+)(am|pm)$/);

          if (m) {
            var hour = parseInt(m[1], 10);

            if (m[2] === 'pm') {
              hour += 12;
            }

            s.epoch = set.hours(s, hour);
          }

          return s;
        } //get the hour


        var hour12 = d.getHours();

        if (hour12 > 12) {
          hour12 = hour12 - 12;
        }

        if (hour12 === 0) {
          hour12 = 12;
        }

        return hour12;
      },
      //some ambiguity here with 12/24h
      time: function time(str) {
        if (str !== undefined) {
          var s = this.clone();
          s.epoch = set.time(s, str);
          return s;
        }

        return "".concat(this.h12(), ":").concat(fns.zeroPad(this.minute())).concat(this.ampm());
      },
      // either 'am' or 'pm'
      ampm: function ampm(input) {
        var which = 'am';
        var hour = this.hour();

        if (hour >= 12) {
          which = 'pm';
        }

        if (typeof input !== 'string') {
          return which;
        } //okay, we're doing a setter


        var s = this.clone();
        input = input.toLowerCase().trim(); //ampm should never change the day
        // - so use `.hour(n)` instead of `.minus(12,'hour')`

        if (hour >= 12 && input === 'am') {
          //noon is 12pm
          hour -= 12;
          return s.hour(hour);
        }

        if (hour < 12 && input === 'pm') {
          hour += 12;
          return s.hour(hour);
        }

        return s;
      },
      //some hard-coded times of day, like 'noon'
      dayTime: function dayTime(str) {
        if (str !== undefined) {
          var times = {
            morning: '7:00am',
            breakfast: '7:00am',
            noon: '12:00am',
            lunch: '12:00pm',
            afternoon: '2:00pm',
            evening: '6:00pm',
            dinner: '6:00pm',
            night: '11:00pm',
            midnight: '23:59pm'
          };
          var s = this.clone();
          str = str || '';
          str = str.toLowerCase();

          if (times.hasOwnProperty(str) === true) {
            s = s.time(times[str]);
          }

          return s;
        }

        var h = this.hour();

        if (h < 6) {
          return 'night';
        }

        if (h < 12) {
          //until noon
          return 'morning';
        }

        if (h < 17) {
          //until 5pm
          return 'afternoon';
        }

        if (h < 22) {
          //until 10pm
          return 'evening';
        }

        return 'night';
      },
      //parse a proper iso string
      iso: function iso(num) {
        if (num !== undefined) {
          return this.set(num);
        }

        return this.format('iso');
      }
    };
    var _01Time = methods$1;

    var methods$2 = {
      // # day in the month
      date: function date(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.date(s, num);
          return s;
        }

        return this.d.getDate();
      },
      //like 'wednesday' (hard!)
      day: function day(input) {
        if (input === undefined) {
          return this.d.getDay();
        }

        var original = this.clone();
        var want = input; // accept 'wednesday'

        if (typeof input === 'string') {
          input = input.toLowerCase();
          want = days["short"]().indexOf(input);

          if (want === -1) {
            want = days["long"]().indexOf(input);
          }
        } //move approx


        var day = this.d.getDay();
        var diff = day - want;
        var s = this.subtract(diff * 24, 'hours'); //tighten it back up

        walk_1(s, {
          hour: original.hour(),
          minute: original.minute(),
          second: original.second()
        });
        return s;
      },
      //these are helpful name-wrappers
      dayName: function dayName(input) {
        if (input === undefined) {
          return days["long"]()[this.day()];
        }

        var s = this.clone();
        s = s.day(input);
        return s;
      },
      //either name or number
      month: function month(input) {
        if (input !== undefined) {
          var s = this.clone();
          s.epoch = set.month(s, input);
          return s;
        }

        return this.d.getMonth();
      }
    };
    var _02Date = methods$2;

    var clearMinutes = function clearMinutes(s) {
      s = s.minute(0);
      s = s.second(0);
      s = s.millisecond(1);
      return s;
    };

    var methods$3 = {
      // day 0-366
      dayOfYear: function dayOfYear(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.dayOfYear(s, num);
          return s;
        } //days since newyears - jan 1st is 1, jan 2nd is 2...


        var sum = 0;
        var month = this.d.getMonth();
        var tmp; //count the num days in each month

        for (var i = 1; i <= month; i++) {
          tmp = new Date();
          tmp.setDate(1);
          tmp.setFullYear(this.d.getFullYear()); //the year matters, because leap-years

          tmp.setHours(1);
          tmp.setMinutes(1);
          tmp.setMonth(i);
          tmp.setHours(-2); //the last day of the month

          sum += tmp.getDate();
        }

        return sum + this.d.getDate();
      },
      //since the start of the year
      week: function week(num) {
        // week-setter
        if (num !== undefined) {
          var s = this.clone();
          s = s.month(0);
          s = s.date(1);
          s = s.day('monday');
          s = clearMinutes(s); //don't go into last-year

          if (s.monthName() === 'december') {
            s = s.add(1, 'week');
          }

          num -= 1; //1-based

          s = s.add(num, 'weeks');
          return s;
        } //find-out which week it is


        var tmp = this.clone();
        tmp = tmp.month(0);
        tmp = tmp.date(1);
        tmp = clearMinutes(tmp);
        tmp = tmp.day('monday'); //don't go into last-year

        if (tmp.monthName() === 'december') {
          tmp = tmp.add(1, 'week');
        } // is first monday the 1st?


        var toAdd = 1;

        if (tmp.date() === 1) {
          toAdd = 0;
        }

        tmp = tmp.minus(1, 'second');
        var thisOne = this.epoch; //if the week technically hasn't started yet

        if (tmp.epoch > thisOne) {
          return 1;
        } //speed it up, if we can


        var i = 0;
        var skipWeeks = this.month() * 4;
        tmp.epoch += milliseconds.week * skipWeeks;
        i += skipWeeks;

        for (; i < 52; i++) {
          if (tmp.epoch > thisOne) {
            return i + toAdd;
          }

          tmp = tmp.add(1, 'week');
        }

        return 52;
      },
      //'january'
      monthName: function monthName(input) {
        if (input === undefined) {
          return months["long"]()[this.month()];
        }

        var s = this.clone();
        s = s.month(input);
        return s;
      },
      //q1, q2, q3, q4
      quarter: function quarter(num) {
        if (num !== undefined) {
          if (typeof num === 'string') {
            num = num.replace(/^q/i, '');
            num = parseInt(num, 10);
          }

          if (quarters[num]) {
            var s = this.clone();
            var _month = quarters[num][0];
            s = s.month(_month);
            s = s.date(1);
            s = s.startOf('day');
            return s;
          }
        }

        var month = this.d.getMonth();

        for (var i = 1; i < quarters.length; i++) {
          if (month < quarters[i][0]) {
            return i - 1;
          }
        }

        return 4;
      },
      //spring, summer, winter, fall
      season: function season(input) {
        var hem = 'north';

        if (this.hemisphere() === 'South') {
          hem = 'south';
        }

        if (input !== undefined) {
          var s = this.clone();

          for (var i = 0; i < seasons[hem].length; i++) {
            if (input === seasons[hem][i][0]) {
              s = s.month(seasons[hem][i][1]);
              s = s.date(1);
              s = s.startOf('day');
            }
          }

          return s;
        }

        var month = this.d.getMonth();

        for (var _i = 0; _i < seasons[hem].length - 1; _i++) {
          if (month >= seasons[hem][_i][1] && month < seasons[hem][_i + 1][1]) {
            return seasons[hem][_i][0];
          }
        }

        return 'winter';
      },
      //the year number
      year: function year(num) {
        if (num !== undefined) {
          var s = this.clone();
          s.epoch = set.year(s, num);
          return s;
        }

        return this.d.getFullYear();
      },
      //bc/ad years
      era: function era(str) {
        if (str !== undefined) {
          var s = this.clone();
          str = str.toLowerCase(); //TODO: there is no year-0AD i think. may have off-by-1 error here

          var year = s.d.getFullYear(); //make '1992' into 1992bc..

          if (str === 'bc' && year > 0) {
            s.epoch = set.year(s, year * -1);
          } //make '1992bc' into '1992'


          if (str === 'ad' && year < 0) {
            s.epoch = set.year(s, year * -1);
          }

          return s;
        }

        if (this.d.getFullYear() < 0) {
          return 'BC';
        }

        return 'AD';
      },
      // 2019 -> 2010
      decade: function decade(input) {
        if (input !== undefined) {
          input = String(input);
          input = input.replace(/([0-9])'?s$/, '$1'); //1950's

          input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals

          if (!input) {
            console.warn('Spacetime: Invalid decade input');
            return this;
          } // assume 20th century?? for '70s'.


          if (input.length === 2 && /[0-9][0-9]/.test(input)) {
            input = '19' + input;
          }

          var year = Number(input);

          if (isNaN(year)) {
            return this;
          } // round it down to the decade


          year = Math.floor(year / 10) * 10;
          return this.year(year); //.startOf('decade')
        }

        return this.startOf('decade').year();
      },
      // 1950 -> 19+1
      century: function century(input) {
        if (input !== undefined) {
          if (typeof input === 'string') {
            input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals

            input = input.replace(/([0-9]+) ?(b\.?c\.?|a\.?d\.?)/i, function (a, b, c) {
              if (c.match(/b\.?c\.?/i)) {
                b = '-' + b;
              }

              return b;
            });
            input = input.replace(/c$/, ''); //20thC
          }

          var year = Number(input);

          if (isNaN(input)) {
            console.warn('Spacetime: Invalid century input');
            return this;
          } // there is no century 0


          if (year === 0) {
            year = 1;
          }

          if (year >= 0) {
            year = (year - 1) * 100;
          } else {
            year = (year + 1) * 100;
          }

          return this.year(year);
        } // century getter


        var num = this.startOf('century').year();
        num = Math.floor(num / 100);

        if (num < 0) {
          return num - 1;
        }

        return num + 1;
      },
      // 2019 -> 2+1
      millenium: function millenium(input) {
        if (input !== undefined) {
          if (typeof input === 'string') {
            input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals

            input = Number(input);

            if (isNaN(input)) {
              console.warn('Spacetime: Invalid millenium input');
              return this;
            }
          }

          if (input > 0) {
            input -= 1;
          }

          var year = input * 1000; // there is no year 0

          if (year === 0) {
            year = 1;
          }

          return this.year(year);
        } // get the current millenium


        var num = Math.floor(this.year() / 1000);

        if (num >= 0) {
          num += 1;
        }

        return num;
      }
    };
    var _03Year = methods$3;

    var methods$4 = Object.assign({}, _01Time, _02Date, _03Year); //aliases

    methods$4.milliseconds = methods$4.millisecond;
    methods$4.seconds = methods$4.second;
    methods$4.minutes = methods$4.minute;
    methods$4.hours = methods$4.hour;
    methods$4.hour24 = methods$4.hour;
    methods$4.h12 = methods$4.hour12;
    methods$4.h24 = methods$4.hour24;
    methods$4.days = methods$4.day;

    var addMethods = function addMethods(Space) {
      //hook the methods into prototype
      Object.keys(methods$4).forEach(function (k) {
        Space.prototype[k] = methods$4[k];
      });
    };

    var query = addMethods;

    var isLeapYear$2 = fns.isLeapYear;

    var getMonthLength = function getMonthLength(month, year) {
      if (month === 1 && isLeapYear$2(year)) {
        return 29;
      }

      return monthLengths_1[month];
    }; //month is the one thing we 'model/compute'
    //- because ms-shifting can be off by enough


    var rollMonth = function rollMonth(want, old) {
      //increment year
      if (want.month > 0) {
        var years = parseInt(want.month / 12, 10);
        want.year = old.year() + years;
        want.month = want.month % 12;
      } else if (want.month < 0) {
        //decrement year
        var _years = Math.floor(Math.abs(want.month) / 13, 10);

        _years = Math.abs(_years) + 1;
        want.year = old.year() - _years; //ignore extras

        want.month = want.month % 12;
        want.month = want.month + 12;

        if (want.month === 12) {
          want.month = 0;
        }
      }

      return want;
    }; // briefly support day=-2 (this does not need to be perfect.)


    var rollDaysDown = function rollDaysDown(want, old, sum) {
      want.year = old.year();
      want.month = old.month();
      var date = old.date();
      want.date = date - Math.abs(sum);

      while (want.date < 1) {
        want.month -= 1;

        if (want.month < 0) {
          want.month = 11;
          want.year -= 1;
        }

        var max = getMonthLength(want.month, want.year);
        want.date += max;
      }

      return want;
    }; // briefly support day=33 (this does not need to be perfect.)


    var rollDaysUp = function rollDaysUp(want, old, sum) {
      var year = old.year();
      var month = old.month();
      var max = getMonthLength(month, year);

      while (sum > max) {
        sum -= max;
        month += 1;

        if (month >= 12) {
          month -= 12;
          year += 1;
        }

        max = getMonthLength(month, year);
      }

      want.month = month;
      want.date = sum;
      return want;
    };

    var _model = {
      months: rollMonth,
      days: rollDaysUp,
      daysBack: rollDaysDown
    };

    // but briefly:
    // millisecond-math, and some post-processing covers most-things
    // we 'model' the calendar here only a little bit
    // and that usually works-out...

    var order$1 = ['millisecond', 'second', 'minute', 'hour', 'date', 'month'];
    var keep = {
      second: order$1.slice(0, 1),
      minute: order$1.slice(0, 2),
      quarterhour: order$1.slice(0, 2),
      hour: order$1.slice(0, 3),
      date: order$1.slice(0, 4),
      month: order$1.slice(0, 4),
      quarter: order$1.slice(0, 4),
      season: order$1.slice(0, 4),
      year: order$1,
      decade: order$1,
      century: order$1
    };
    keep.week = keep.hour;
    keep.season = keep.date;
    keep.quarter = keep.date; // Units need to be dst adjuested

    var dstAwareUnits = {
      year: true,
      quarter: true,
      season: true,
      month: true,
      week: true,
      day: true
    };
    var keepDate = {
      month: true,
      quarter: true,
      season: true,
      year: true
    };

    var addMethods$1 = function addMethods(SpaceTime) {
      SpaceTime.prototype.add = function (num, unit) {
        var s = this.clone();

        if (!unit || num === 0) {
          return s; //don't bother
        }

        var old = this.clone();
        unit = fns.normalize(unit); //move forward by the estimated milliseconds (rough)

        if (milliseconds[unit]) {
          s.epoch += milliseconds[unit] * num;
        } else if (unit === 'week') {
          s.epoch += milliseconds.day * (num * 7);
        } else if (unit === 'quarter' || unit === 'season') {
          s.epoch += milliseconds.month * (num * 4);
        } else if (unit === 'season') {
          s.epoch += milliseconds.month * (num * 4);
        } else if (unit === 'quarterhour') {
          s.epoch += milliseconds.minute * 15 * num;
        } //now ensure our milliseconds/etc are in-line


        var want = {};

        if (keep[unit]) {
          keep[unit].forEach(function (u) {
            want[u] = old[u]();
          });
        }

        if (dstAwareUnits[unit]) {
          var diff = old.timezone().current.offset - s.timezone().current.offset;
          s.epoch += diff * 3600 * 1000;
        } //ensure month/year has ticked-over


        if (unit === 'month') {
          want.month = old.month() + num; //month is the one unit we 'model' directly

          want = _model.months(want, old);
        } //support coercing a week, too


        if (unit === 'week') {
          var sum = old.date() + num * 7;

          if (sum <= 28 && sum > 1) {
            want.date = sum;
          }
        } //support 25-hour day-changes on dst-changes
        else if (unit === 'date') {
            if (num < 0) {
              want = _model.daysBack(want, old, num);
            } else {
              //specify a naive date number, if it's easy to do...
              var _sum = old.date() + num; // ok, model this one too


              want = _model.days(want, old, _sum);
            } //manually punt it if we haven't moved at all..


            if (num !== 0 && old.isSame(s, 'day')) {
              want.date = old.date() + num;
            }
          } //ensure year has changed (leap-years)
          else if (unit === 'year' && s.year() === old.year()) {
              s.epoch += milliseconds.week;
            } //these are easier
            else if (unit === 'decade') {
                want.year = s.year() + 10;
              } else if (unit === 'century') {
                want.year = s.year() + 100;
              } //keep current date, unless the month doesn't have it.


        if (keepDate[unit]) {
          var max = monthLengths_1[want.month];
          want.date = old.date();

          if (want.date > max) {
            want.date = max;
          }
        }

        walk_1(s, want);
        return s;
      }; //subtract is only add *-1


      SpaceTime.prototype.subtract = function (num, unit) {
        var s = this.clone();
        return s.add(num * -1, unit);
      }; //add aliases


      SpaceTime.prototype.minus = SpaceTime.prototype.subtract;
      SpaceTime.prototype.plus = SpaceTime.prototype.add;
    };

    var add = addMethods$1;

    //make a string, for easy comparison between dates
    var print = {
      millisecond: function millisecond(s) {
        return s.epoch;
      },
      second: function second(s) {
        return [s.year(), s.month(), s.date(), s.hour(), s.minute(), s.second()].join('-');
      },
      minute: function minute(s) {
        return [s.year(), s.month(), s.date(), s.hour(), s.minute()].join('-');
      },
      hour: function hour(s) {
        return [s.year(), s.month(), s.date(), s.hour()].join('-');
      },
      day: function day(s) {
        return [s.year(), s.month(), s.date()].join('-');
      },
      week: function week(s) {
        return [s.year(), s.week()].join('-');
      },
      month: function month(s) {
        return [s.year(), s.month()].join('-');
      },
      quarter: function quarter(s) {
        return [s.year(), s.quarter()].join('-');
      },
      year: function year(s) {
        return s.year();
      }
    };
    print.date = print.day;

    var addMethods$2 = function addMethods(SpaceTime) {
      SpaceTime.prototype.isSame = function (b, unit) {
        var a = this;

        if (!unit) {
          return null;
        }

        if (typeof b === 'string' || typeof b === 'number') {
          b = new SpaceTime(b, this.timezone.name);
        } //support 'seconds' aswell as 'second'


        unit = unit.replace(/s$/, '');

        if (print[unit]) {
          return print[unit](a) === print[unit](b);
        }

        return null;
      };
    };

    var same = addMethods$2;

    var addMethods$3 = function addMethods(SpaceTime) {
      var methods = {
        isAfter: function isAfter(d) {
          d = fns.beADate(d, this);
          var epoch = fns.getEpoch(d);

          if (epoch === null) {
            return null;
          }

          return this.epoch > epoch;
        },
        isBefore: function isBefore(d) {
          d = fns.beADate(d, this);
          var epoch = fns.getEpoch(d);

          if (epoch === null) {
            return null;
          }

          return this.epoch < epoch;
        },
        isEqual: function isEqual(d) {
          d = fns.beADate(d, this);
          var epoch = fns.getEpoch(d);

          if (epoch === null) {
            return null;
          }

          return this.epoch === epoch;
        },
        isBetween: function isBetween(start, end) {
          var isInclusive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          start = fns.beADate(start, this);
          end = fns.beADate(end, this);
          var startEpoch = fns.getEpoch(start);

          if (startEpoch === null) {
            return null;
          }

          var endEpoch = fns.getEpoch(end);

          if (endEpoch === null) {
            return null;
          }

          if (isInclusive) {
            return this.isBetween(start, end) || this.isEqual(start) || this.isEqual(end);
          }

          return startEpoch < this.epoch && this.epoch < endEpoch;
        }
      }; //hook them into proto

      Object.keys(methods).forEach(function (k) {
        SpaceTime.prototype[k] = methods[k];
      });
    };

    var compare = addMethods$3;

    var addMethods$4 = function addMethods(SpaceTime) {
      var methods = {
        i18n: function i18n(data) {
          //change the day names
          if (fns.isObject(data.days)) {
            days.set(data.days);
          } //change the month names


          if (fns.isObject(data.months)) {
            months.set(data.months);
          }
        }
      }; //hook them into proto

      Object.keys(methods).forEach(function (k) {
        SpaceTime.prototype[k] = methods[k];
      });
    };

    var i18n = addMethods$4;

    var timezones = unpack; //fake timezone-support, for fakers (es5 class)

    var SpaceTime = function SpaceTime(input$1, tz) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      //the holy moment
      this.epoch = null; //the shift for the given timezone

      this.tz = find(tz, timezones); //whether to output warnings to console

      this.silent = options.silent || true; // favour british interpretation of 02/02/2018, etc

      this.british = options.dmy || options.british; //does the week start on sunday, or monday:

      this._weekStart = 1; //default to monday

      if (options.weekStart !== undefined) {
        this._weekStart = options.weekStart;
      } // the reference today date object, (for testing)


      this._today = {};

      if (options.today !== undefined) {
        this._today = options.today;
      } //add getter/setters


      Object.defineProperty(this, 'd', {
        //return a js date object
        get: function get() {
          var offset = quick(this); //every computer is somewhere- get this computer's built-in offset

          var bias = new Date(this.epoch).getTimezoneOffset() || 0; //movement

          var shift = bias + offset * 60; //in minutes

          shift = shift * 60 * 1000; //in ms
          //remove this computer's offset

          var epoch = this.epoch + shift;
          var d = new Date(epoch);
          return d;
        }
      }); //add this data on the object, to allow adding new timezones

      Object.defineProperty(this, 'timezones', {
        get: function get() {
          return timezones;
        },
        set: function set(obj) {
          timezones = obj;
          return obj;
        }
      }); //parse the various formats

      var tmp = input(this, input$1, tz);
      this.epoch = tmp.epoch;
    }; //(add instance methods to prototype)


    Object.keys(methods_1).forEach(function (k) {
      SpaceTime.prototype[k] = methods_1[k];
    }); // ¯\_(ツ)_/¯

    SpaceTime.prototype.clone = function () {
      return new SpaceTime(this.epoch, this.tz, {
        silent: this.silent,
        weekStart: this._weekStart,
        today: this._today
      });
    }; //return native date object at the same epoch


    SpaceTime.prototype.toLocalDate = function () {
      return new Date(this.epoch);
    }; //append more methods


    query(SpaceTime);
    add(SpaceTime);
    same(SpaceTime);
    compare(SpaceTime);
    i18n(SpaceTime);
    var spacetime = SpaceTime;

    var whereIts = function whereIts(a, b) {
      var start = new spacetime(null);
      var end = new spacetime(null);
      start = start.time(a); //if b is undefined, use as 'within one hour'

      if (b) {
        end = end.time(b);
      } else {
        end = start.add(59, 'minutes');
      }

      var startHour = start.hour();
      var endHour = end.hour();
      var tzs = Object.keys(start.timezones).filter(function (tz) {
        if (tz.indexOf('/') === -1) {
          return false;
        }

        var m = new spacetime(null, tz);
        var hour = m.hour(); //do 'calendar-compare' not real-time-compare

        if (hour >= startHour && hour <= endHour) {
          //test minutes too, if applicable
          if (hour === startHour && m.minute() < start.minute()) {
            return false;
          }

          if (hour === endHour && m.minute() > end.minute()) {
            return false;
          }

          return true;
        }

        return false;
      });
      return tzs;
    };

    var whereIts_1 = whereIts;

    var _version = '6.6.3';

    var main$1 = function main(input, tz, options) {
      return new spacetime(input, tz, options);
    }; // set all properties of a given 'today' object


    var setToday = function setToday(s) {
      var today = s._today || {};
      Object.keys(today).forEach(function (k) {
        s = s[k](today[k]);
      });
      return s;
    }; //some helper functions on the main method


    main$1.now = function (tz, options) {
      var s = new spacetime(new Date().getTime(), tz, options);
      s = setToday(s);
      return s;
    };

    main$1.today = function (tz, options) {
      var s = new spacetime(new Date().getTime(), tz, options);
      s = setToday(s);
      return s.startOf('day');
    };

    main$1.tomorrow = function (tz, options) {
      var s = new spacetime(new Date().getTime(), tz, options);
      s = setToday(s);
      return s.add(1, 'day').startOf('day');
    };

    main$1.yesterday = function (tz, options) {
      var s = new spacetime(new Date().getTime(), tz, options);
      s = setToday(s);
      return s.subtract(1, 'day').startOf('day');
    };

    main$1.extend = function (obj) {
      Object.keys(obj).forEach(function (k) {
        spacetime.prototype[k] = obj[k];
      });
      return this;
    }; //find tz by time


    main$1.whereIts = whereIts_1;
    main$1.version = _version; //aliases:

    main$1.plugin = main$1.extend;
    var src = main$1;

    var colors = {
      blue: '#6699cc',
      green: '#6accb2',
      yellow: '#e1e6b3',
      red: '#cc7066',
      pink: '#F2C0BB', //'#e6b8b3',

      brown: '#705E5C',
      orange: '#cc8a66',
      purple: '#d8b3e6',
      navy: '#335799',
      olive: '#7f9c6c',

      fuscia: '#735873', //'#603960',
      beige: '#e6d7b3',
      slate: '#8C8C88',
      suede: '#9c896c',
      burnt: '#603a39',

      sea: '#50617A',
      sky: '#2D85A8',
      night: '#303b50',
      // dark: '#2C3133',
      rouge: '#914045',
      grey: '#838B91',

      mud: '#C4ABAB',
      royal: '#275291',
      cherry: '#cc6966',
      tulip: '#e6b3bc',
      rose: '#D68881',
      fire: '#AB5850',

      greyblue: '#72697D',
      greygreen: '#8BA3A2',
      greypurple: '#978BA3',
      burn: '#6D5685',

      slategrey: '#bfb0b3',
      light: '#a3a5a5',
      lighter: '#d7d5d2',
      fudge: '#4d4d4d',
      lightgrey: '#949a9e',

      white: '#fbfbfb',
      dimgrey: '#606c74',
      softblack: '#463D4F',
      dark: '#443d3d',
      black: '#333333',
    };

    //a very-tiny version of d3-scale's scaleLinear
    const scaleLinear = function (obj, num) {
      let world = obj.world || [];
      let minmax = obj.minmax || [];
      let range = minmax[1] - minmax[0];
      let percent = (num - minmax[0]) / range;
      let size = world[1] - world[0];
      return parseInt(size * percent, 10)
    };
    var scale = scaleLinear;

    /* Users/spencer/mountain/somehow-timeline/src/Timeline.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$I = "Users/spencer/mountain/somehow-timeline/src/Timeline.svelte";

    function create_fragment$M(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "timeline svelte-kav09m");
    			set_style(div, "height", /*$h*/ ctx[0] + "px");
    			add_location(div, file$I, 61, 0, 1228);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*$h*/ 1) {
    				set_style(div, "height", /*$h*/ ctx[0] + "px");
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$M($$self, $$props, $$invalidate) {
    	let $h;
    	let $s;
    	let $e;
    	let { start = null } = $$props;
    	let { end = null } = $$props;
    	let { height = 800 } = $$props;
    	start = src(start);
    	end = src(end);
    	let h = writable(height);
    	validate_store(h, "h");
    	component_subscribe($$self, h, value => $$invalidate(0, $h = value));
    	let s = writable(start);
    	validate_store(s, "s");
    	component_subscribe($$self, s, value => $$invalidate(9, $s = value));
    	let e = writable(end);
    	validate_store(e, "e");
    	component_subscribe($$self, e, value => $$invalidate(10, $e = value));
    	setContext("height", h);
    	setContext("start", s);
    	setContext("end", e);
    	setContext("colors", colors);

    	let myScale = epoch => {
    		return scale(
    			{
    				world: [0, $h],
    				minmax: [$s.epoch, $e.epoch]
    			},
    			epoch
    		);
    	};

    	setContext("scale", myScale);

    	afterUpdate(() => {
    		console.log("update");
    		set_store_value(h, $h = height);
    		set_store_value(s, $s = src(start));
    		set_store_value(e, $e = src(end));
    		setContext("height", h);
    		setContext("start", s);
    		setContext("end", e);
    	});

    	const writable_props = ["start", "end", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("start" in $$props) $$invalidate(4, start = $$props.start);
    		if ("end" in $$props) $$invalidate(5, end = $$props.end);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		afterUpdate,
    		spacetime: src,
    		colors,
    		linear: scale,
    		start,
    		end,
    		height,
    		h,
    		s,
    		e,
    		myScale,
    		$h,
    		$s,
    		$e
    	});

    	$$self.$inject_state = $$props => {
    		if ("start" in $$props) $$invalidate(4, start = $$props.start);
    		if ("end" in $$props) $$invalidate(5, end = $$props.end);
    		if ("height" in $$props) $$invalidate(6, height = $$props.height);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
    		if ("s" in $$props) $$invalidate(2, s = $$props.s);
    		if ("e" in $$props) $$invalidate(3, e = $$props.e);
    		if ("myScale" in $$props) myScale = $$props.myScale;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$h, h, s, e, start, end, height, $$scope, $$slots];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, { start: 4, end: 5, height: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$M.name
    		});
    	}

    	get start() {
    		throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Timeline>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Timeline>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var spencerColor$1 = createCommonjsModule(function (module, exports) {
    !function(e){module.exports=e();}(function(){return function u(i,a,c){function f(r,e){if(!a[r]){if(!i[r]){var o="function"==typeof commonjsRequire&&commonjsRequire;if(!e&&o)return o(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var t=a[r]={exports:{}};i[r][0].call(t.exports,function(e){return f(i[r][1][e]||e)},t,t.exports,u,i,a,c);}return a[r].exports}for(var d="function"==typeof commonjsRequire&&commonjsRequire,e=0;e<c.length;e++)f(c[e]);return f}({1:[function(e,r,o){r.exports={blue:"#6699cc",green:"#6accb2",yellow:"#e1e6b3",red:"#cc7066",pink:"#F2C0BB",brown:"#705E5C",orange:"#cc8a66",purple:"#d8b3e6",navy:"#335799",olive:"#7f9c6c",fuscia:"#735873",beige:"#e6d7b3",slate:"#8C8C88",suede:"#9c896c",burnt:"#603a39",sea:"#50617A",sky:"#2D85A8",night:"#303b50",rouge:"#914045",grey:"#838B91",mud:"#C4ABAB",royal:"#275291",cherry:"#cc6966",tulip:"#e6b3bc",rose:"#D68881",fire:"#AB5850",greyblue:"#72697D",greygreen:"#8BA3A2",greypurple:"#978BA3",burn:"#6D5685",slategrey:"#bfb0b3",light:"#a3a5a5",lighter:"#d7d5d2",fudge:"#4d4d4d",lightgrey:"#949a9e",white:"#fbfbfb",dimgrey:"#606c74",softblack:"#463D4F",dark:"#443d3d",black:"#333333"};},{}],2:[function(e,r,o){var n=e("./colors"),t={juno:["blue","mud","navy","slate","pink","burn"],barrow:["rouge","red","orange","burnt","brown","greygreen"],roma:["#8a849a","#b5b0bf","rose","lighter","greygreen","mud"],palmer:["red","navy","olive","pink","suede","sky"],mark:["#848f9a","#9aa4ac","slate","#b0b8bf","mud","grey"],salmon:["sky","sea","fuscia","slate","mud","fudge"],dupont:["green","brown","orange","red","olive","blue"],bloor:["night","navy","beige","rouge","mud","grey"],yukon:["mud","slate","brown","sky","beige","red"],david:["blue","green","yellow","red","pink","light"],neste:["mud","cherry","royal","rouge","greygreen","greypurple"],ken:["red","sky","#c67a53","greygreen","#dfb59f","mud"]};Object.keys(t).forEach(function(e){t[e]=t[e].map(function(e){return n[e]||e});}),r.exports=t;},{"./colors":1}],3:[function(e,r,o){var n=e("./colors"),t=e("./combos"),u={colors:n,list:Object.keys(n).map(function(e){return n[e]}),combos:t};r.exports=u;},{"./colors":1,"./combos":2}]},{},[3])(3)});
    });

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Axis.svelte generated by Svelte v3.24.1 */
    const file$J = "Users/spencer/mountain/somehow-timeline/src/shapes/Axis.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (87:2) {#each ticks as tick}
    function create_each_block(ctx) {
    	let div;
    	let t0_value = /*tick*/ ctx[14].label + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "label svelte-16g1s6d");
    			set_style(div, "top", /*tick*/ ctx[14].value + "px");
    			set_style(div, "color", /*color*/ ctx[0]);
    			set_style(div, "font-size", /*size*/ ctx[1]);
    			toggle_class(div, "underline", /*tick*/ ctx[14].underline);
    			add_location(div, file$J, 87, 4, 1888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*color*/ 1) {
    				set_style(div, "color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 2) {
    				set_style(div, "font-size", /*size*/ ctx[1]);
    			}

    			if (dirty & /*ticks*/ 16) {
    				toggle_class(div, "underline", /*tick*/ ctx[14].underline);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(87:2) {#each ticks as tick}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$N(ctx) {
    	let div;
    	let each_value = /*ticks*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "container svelte-16g1s6d");
    			add_location(div, file$J, 85, 0, 1836);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*ticks, color, size*/ 19) {
    				each_value = /*ticks*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$N.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$N($$self, $$props, $$invalidate) {
    	let $start;
    	let $end;
    	let { format = "" } = $$props;
    	let { every = "month" } = $$props;
    	let { size = "12px" } = $$props;
    	let { color = "#949a9e" } = $$props;
    	color = spencerColor$1.colors[color] || color;
    	let start = getContext("start");
    	validate_store(start, "start");
    	component_subscribe($$self, start, value => $$invalidate(7, $start = value));
    	const end = getContext("end");
    	validate_store(end, "end");
    	component_subscribe($$self, end, value => $$invalidate(8, $end = value));
    	const scale = getContext("scale");
    	let diff = $start.diff($end);

    	// choose the scale automatically
    	if (diff.years > 400) {
    		every = "century";
    	} else if (diff.years > 40) {
    		every = "decade";
    	} else if (diff.years > 4) {
    		every = "year";
    	} else if (diff.months > 4) {
    		every = "month";
    	} else if (diff.week > 4) {
    		every = "week";
    	} else if (diff.day > 4) {
    		every = "day";
    	} else if (diff.hour > 4) {
    		every = "hour";
    	}

    	const formats = {
    		hour: "{hour}{ampm}",
    		day: "{month-short} {date}",
    		week: "{month-short} {date}",
    		month: "{month-short}",
    		quarter: "{quarter}",
    		year: "year",
    		decade: "year",
    		century: "year"
    	};

    	format = format || formats[every] || "{month-short} {date}";

    	const underline = {
    		hour: /12:00/,
    		year: /00$/,
    		decade: /00$/
    	};

    	set_store_value(start, $start = $start.minus(1, "second"));
    	let arr = $start.every(every, $end);

    	let ticks = arr.map(s => {
    		let y = scale(s.epoch) - 5;
    		let label = s.format(format);

    		return {
    			value: y,
    			underline: underline[every] && underline[every].test(label),
    			label
    		};
    	});

    	const writable_props = ["format", "every", "size", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Axis> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Axis", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("format" in $$props) $$invalidate(5, format = $$props.format);
    		if ("every" in $$props) $$invalidate(6, every = $$props.every);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		spacetime: src,
    		getContext,
    		c: spencerColor$1,
    		format,
    		every,
    		size,
    		color,
    		start,
    		end,
    		scale,
    		diff,
    		formats,
    		underline,
    		arr,
    		ticks,
    		$start,
    		$end
    	});

    	$$self.$inject_state = $$props => {
    		if ("format" in $$props) $$invalidate(5, format = $$props.format);
    		if ("every" in $$props) $$invalidate(6, every = $$props.every);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("start" in $$props) $$invalidate(2, start = $$props.start);
    		if ("diff" in $$props) diff = $$props.diff;
    		if ("arr" in $$props) arr = $$props.arr;
    		if ("ticks" in $$props) $$invalidate(4, ticks = $$props.ticks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, size, start, end, ticks, format, every];
    }

    class Axis extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, { format: 5, every: 6, size: 1, color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Axis",
    			options,
    			id: create_fragment$N.name
    		});
    	}

    	get format() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get every() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set every(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Axis>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Axis>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Column.svelte generated by Svelte v3.24.1 */
    const file$K = "Users/spencer/mountain/somehow-timeline/src/shapes/Column.svelte";

    function create_fragment$O(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "label svelte-1u6y9h5");
    			set_style(div0, "color", /*color*/ ctx[1]);
    			add_location(div0, file$K, 26, 2, 508);
    			attr_dev(div1, "class", "part column svelte-1u6y9h5");
    			set_style(div1, "margin", "0px " + /*margin*/ ctx[2] + " 0px " + /*margin*/ ctx[2]);
    			add_location(div1, file$K, 25, 0, 437);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (!current || dirty & /*color*/ 2) {
    				set_style(div0, "color", /*color*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*margin*/ 4) {
    				set_style(div1, "margin", "0px " + /*margin*/ ctx[2] + " 0px " + /*margin*/ ctx[2]);
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
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$O($$self, $$props, $$invalidate) {
    	let { label = "" } = $$props;
    	let { color = "steelblue" } = $$props;
    	color = spencerColor$1.colors[color] || color;
    	let { title = "" } = $$props;
    	let { margin = "20px" } = $$props;
    	label = label || title;
    	const writable_props = ["label", "color", "title", "margin"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Column> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Column", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(2, margin = $$props.margin);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ c: spencerColor$1, label, color, title, margin });

    	$$self.$inject_state = $$props => {
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("title" in $$props) $$invalidate(3, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(2, margin = $$props.margin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, color, margin, title, $$scope, $$slots];
    }

    class Column extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, { label: 0, color: 1, title: 3, margin: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Column",
    			options,
    			id: create_fragment$O.name
    		});
    	}

    	get label() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Dots.svelte generated by Svelte v3.24.1 */

    const file$L = "Users/spencer/mountain/somehow-timeline/src/shapes/Dots.svelte";

    function create_fragment$P(ctx) {
    	let svg;
    	let defs;
    	let pattern;
    	let circle;
    	let rect;
    	let rect_fill_value;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			pattern = svg_element("pattern");
    			circle = svg_element("circle");
    			rect = svg_element("rect");
    			attr_dev(circle, "fill", /*color*/ ctx[0]);
    			attr_dev(circle, "cx", "3");
    			attr_dev(circle, "cy", "3");
    			attr_dev(circle, "r", "1.5");
    			add_location(circle, file$L, 19, 6, 413);
    			attr_dev(pattern, "id", /*id*/ ctx[1]);
    			attr_dev(pattern, "x", "0");
    			attr_dev(pattern, "y", "0");
    			attr_dev(pattern, "width", "5");
    			attr_dev(pattern, "height", "5");
    			attr_dev(pattern, "patternUnits", "userSpaceOnUse");
    			add_location(pattern, file$L, 18, 4, 329);
    			add_location(defs, file$L, 17, 2, 318);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "100%");
    			attr_dev(rect, "height", "100%");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*id*/ ctx[1] + ")");
    			add_location(rect, file$L, 23, 2, 487);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file$L, 16, 0, 283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, pattern);
    			append_dev(pattern, circle);
    			append_dev(svg, rect);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*color*/ 1) {
    				attr_dev(circle, "fill", /*color*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$P.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function uuid() {
    	return ("xxxxxx").replace(/[xy]/g, function (c) {
    		var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    		return v.toString(16);
    	});
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let { color = "steelblue" } = $$props;
    	let id = uuid();
    	const writable_props = ["color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dots> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dots", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ color, uuid, id });

    	$$self.$inject_state = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, id];
    }

    class Dots extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dots",
    			options,
    			id: create_fragment$P.name
    		});
    	}

    	get color() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Line.svelte generated by Svelte v3.24.1 */
    const file$M = "Users/spencer/mountain/somehow-timeline/src/shapes/Line.svelte";

    // (102:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "topLabel svelte-wx2l2y");
    			set_style(div, "color", /*color*/ ctx[0]);
    			set_style(div, "text-decoration", /*underline*/ ctx[6] === true ? "underline" : "none");
    			toggle_class(div, "rotate", /*rotate*/ ctx[8]);
    			add_location(div, file$M, 102, 4, 2220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*label*/ ctx[5];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) div.innerHTML = /*label*/ ctx[5];
    			if (dirty & /*color*/ 1) {
    				set_style(div, "color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*underline*/ 64) {
    				set_style(div, "text-decoration", /*underline*/ ctx[6] === true ? "underline" : "none");
    			}

    			if (dirty & /*rotate*/ 256) {
    				toggle_class(div, "rotate", /*rotate*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(102:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#if height > 20}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "midLabel svelte-wx2l2y");
    			toggle_class(div, "rotate", /*rotate*/ ctx[8]);
    			add_location(div, file$M, 98, 4, 2139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*label*/ ctx[5];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 32) div.innerHTML = /*label*/ ctx[5];
    			if (dirty & /*rotate*/ 256) {
    				toggle_class(div, "rotate", /*rotate*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(98:2) {#if height > 20}",
    		ctx
    	});

    	return block;
    }

    // (114:2) {#if dotted === true}
    function create_if_block$2(ctx) {
    	let div;
    	let dots;
    	let current;

    	dots = new Dots({
    			props: { color: /*color*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(dots.$$.fragment);
    			attr_dev(div, "class", "dots svelte-wx2l2y");
    			set_style(div, "background-color", "white");
    			add_location(div, file$M, 114, 4, 2515);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dots, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dots_changes = {};
    			if (dirty & /*color*/ 1) dots_changes.color = /*color*/ ctx[0];
    			dots.$set(dots_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dots.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dots.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dots);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(114:2) {#if dotted === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$Q(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*height*/ ctx[10] > 20) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*dotted*/ ctx[7] === true && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "line svelte-wx2l2y");
    			set_style(div0, "width", /*width*/ ctx[1]);
    			set_style(div0, "background-color", /*color*/ ctx[0]);
    			add_location(div0, file$M, 111, 2, 2416);
    			attr_dev(div1, "class", "container svelte-wx2l2y");
    			set_style(div1, "opacity", /*opacity*/ ctx[4]);
    			set_style(div1, "top", /*top*/ ctx[9] + /*margin*/ ctx[3] + "px");
    			set_style(div1, "height", /*height*/ ctx[10] - /*margin*/ ctx[3] * 2 + "px");
    			attr_dev(div1, "title", /*title*/ ctx[2]);
    			add_location(div1, file$M, 94, 0, 1983);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			}

    			if (!current || dirty & /*width*/ 2) {
    				set_style(div0, "width", /*width*/ ctx[1]);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(div0, "background-color", /*color*/ ctx[0]);
    			}

    			if (/*dotted*/ ctx[7] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*dotted*/ 128) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*opacity*/ 16) {
    				set_style(div1, "opacity", /*opacity*/ ctx[4]);
    			}

    			if (!current || dirty & /*top, margin*/ 520) {
    				set_style(div1, "top", /*top*/ ctx[9] + /*margin*/ ctx[3] + "px");
    			}

    			if (!current || dirty & /*height, margin*/ 1032) {
    				set_style(div1, "height", /*height*/ ctx[10] - /*margin*/ ctx[3] * 2 + "px");
    			}

    			if (!current || dirty & /*title*/ 4) {
    				attr_dev(div1, "title", /*title*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Q($$self, $$props, $$invalidate) {
    	let myScale = getContext("scale");
    	let { color = "steelblue" } = $$props;
    	let { width = "100%" } = $$props;
    	let { title = "" } = $$props;
    	let { margin = 2 } = $$props;
    	let { opacity = "0.7" } = $$props;
    	let { label = "" } = $$props;
    	let { underline = "none" } = $$props;
    	let { dotted = false } = $$props;
    	let { rotate = false } = $$props;
    	let { duration = "" } = $$props;
    	let { start = getContext("start") } = $$props;
    	let { date = "" } = $$props;
    	start = date || start;
    	let { end = getContext("end") } = $$props;
    	start = src(start);

    	if (!end && duration) {
    		let words = duration.split(" ");
    		end = start.add(words[0], words[1]);
    	}

    	color = spencerColor$1.colors[color] || color;
    	start = start.epoch;
    	end = src(end).epoch;

    	if (duration) {
    		let split = duration.split(" ");
    		end = src(start).add(Number(split[0]), split[1]).epoch;
    	}

    	const scale = getContext("scale");

    	const writable_props = [
    		"color",
    		"width",
    		"title",
    		"margin",
    		"opacity",
    		"label",
    		"underline",
    		"dotted",
    		"rotate",
    		"duration",
    		"start",
    		"date",
    		"end"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Line> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Line", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(3, margin = $$props.margin);
    		if ("opacity" in $$props) $$invalidate(4, opacity = $$props.opacity);
    		if ("label" in $$props) $$invalidate(5, label = $$props.label);
    		if ("underline" in $$props) $$invalidate(6, underline = $$props.underline);
    		if ("dotted" in $$props) $$invalidate(7, dotted = $$props.dotted);
    		if ("rotate" in $$props) $$invalidate(8, rotate = $$props.rotate);
    		if ("duration" in $$props) $$invalidate(13, duration = $$props.duration);
    		if ("start" in $$props) $$invalidate(11, start = $$props.start);
    		if ("date" in $$props) $$invalidate(14, date = $$props.date);
    		if ("end" in $$props) $$invalidate(12, end = $$props.end);
    	};

    	$$self.$capture_state = () => ({
    		spacetime: src,
    		getContext,
    		Dots,
    		c: spencerColor$1,
    		myScale,
    		color,
    		width,
    		title,
    		margin,
    		opacity,
    		label,
    		underline,
    		dotted,
    		rotate,
    		duration,
    		start,
    		date,
    		end,
    		scale,
    		top,
    		bottom,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("myScale" in $$props) $$invalidate(16, myScale = $$props.myScale);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(3, margin = $$props.margin);
    		if ("opacity" in $$props) $$invalidate(4, opacity = $$props.opacity);
    		if ("label" in $$props) $$invalidate(5, label = $$props.label);
    		if ("underline" in $$props) $$invalidate(6, underline = $$props.underline);
    		if ("dotted" in $$props) $$invalidate(7, dotted = $$props.dotted);
    		if ("rotate" in $$props) $$invalidate(8, rotate = $$props.rotate);
    		if ("duration" in $$props) $$invalidate(13, duration = $$props.duration);
    		if ("start" in $$props) $$invalidate(11, start = $$props.start);
    		if ("date" in $$props) $$invalidate(14, date = $$props.date);
    		if ("end" in $$props) $$invalidate(12, end = $$props.end);
    		if ("top" in $$props) $$invalidate(9, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(15, bottom = $$props.bottom);
    		if ("height" in $$props) $$invalidate(10, height = $$props.height);
    	};

    	let top;
    	let bottom;
    	let height;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*start*/ 2048) {
    			 $$invalidate(9, top = myScale(start));
    		}

    		if ($$self.$$.dirty & /*end*/ 4096) {
    			 $$invalidate(15, bottom = myScale(end));
    		}

    		if ($$self.$$.dirty & /*bottom, top*/ 33280) {
    			 $$invalidate(10, height = bottom - top);
    		}
    	};

    	return [
    		color,
    		width,
    		title,
    		margin,
    		opacity,
    		label,
    		underline,
    		dotted,
    		rotate,
    		top,
    		height,
    		start,
    		end,
    		duration,
    		date
    	];
    }

    class Line extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {
    			color: 0,
    			width: 1,
    			title: 2,
    			margin: 3,
    			opacity: 4,
    			label: 5,
    			underline: 6,
    			dotted: 7,
    			rotate: 8,
    			duration: 13,
    			start: 11,
    			date: 14,
    			end: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$Q.name
    		});
    	}

    	get color() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get underline() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set underline(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dotted() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dotted(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var somehowTicks = createCommonjsModule(function (module, exports) {
    /* somehow v0.0.3
       github.com/spencermountain/somehow-ticks
       MIT
    */

    (function(f){{module.exports=f();}})(function(){return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof commonjsRequire&&commonjsRequire;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t);}return n[i].exports}for(var u="function"==typeof commonjsRequire&&commonjsRequire,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){

    module.exports = {
      trillion: 1000000000000,
      billion: 1000000000,
      million: 1000000,
      hundredThousand: 100000,
      tenThousand: 10000,
      thousand: 1000,
      hundred: 100,
      ten: 10,
      one: 1,
      tenth: 0.1,
      hundredth: 0.01,
      thousandth: 0.01
    };

    },{}],2:[function(_dereq_,module,exports){

    var n = _dereq_('./_constants');

    var prettyNum = function prettyNum(num) {
      num = parseFloat(num);

      if (num >= n.trillion) {
        num = parseInt(num / 100000000000, 10) * 100000000000;
        return num / n.trillion + 't';
      }

      if (num >= n.billion) {
        num = parseInt(num / 100000000, 10) * 100000000;
        return num / n.billion + 'b';
      }

      if (num >= n.million) {
        num = parseInt(num / 100000, 10) * 100000;
        return num / n.million + 'm';
      }

      if (num >= n.tenThousand) {
        num = parseInt(num / n.thousand, 10) * n.thousand;
        return num / n.thousand + 'k';
      }

      if (num >= n.thousand) {
        num = parseInt(num / n.hundred, 10) * n.hundred;
        return num / n.thousand + 'k';
      }

      return num.toLocaleString();
    };

    module.exports = prettyNum;

    },{"./_constants":1}],3:[function(_dereq_,module,exports){

    // const zeroPad = (str, len = 2) => {
    //   let pad = '0'
    //   str = str + ''
    //   return str.length >= len
    //     ? str
    //     : new Array(len - str.length + 1).join(pad) + str
    // }
    //
    // const preferZeros = function(arr, ticks) {
    //   const max = String(arr[arr.length - 1] || '').length
    //   const zeroArr = arr.map(a => {
    //     let str = zeroPad(String(a), max)
    //     const zeros = (str.match(/0/g) || []).length
    //     return [a, zeros]
    //   })
    //   let ranked = zeroArr.sort((a, b) => (a[1] < b[1] ? 1 : -1))
    //   console.log(ranked)
    //   return ranked
    //     .map(a => a[0])
    //     .slice(0, ticks)
    //     .sort()
    // }
    var reduceTo = function reduceTo(arr, n) {
      if (arr.length <= n || arr.length <= 5) {
        return arr;
      } //try filtering-down by # of non-zero digits used
      // let tmp = preferZeros(arr, n)
      // if (tmp.length > 0 && tmp.length <= n) {
      //   return tmp
      // }
      //otherwise, remove every other selection (less good)


      while (arr.length > n) {
        arr = arr.filter(function (o, i) {
          return i % 2 === 0;
        });

        if (arr.length <= n || arr.length <= 5) {
          return arr;
        }
      }

      return arr;
    };

    module.exports = reduceTo;

    },{}],4:[function(_dereq_,module,exports){

    var methods = _dereq_('./methods');

    var chooseMethod = function chooseMethod(start, end) {
      var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
      var diff = Math.abs(end - start);

      if (diff === 0) {
        return [];
      } //1 million


      if (diff > 3000000) {
        return methods.millions(start, end, n);
      } //100k


      if (diff > 300000) {
        return methods.hundredKs(start, end, n);
      } //1k


      if (diff > 3000) {
        return methods.thousands(start, end, n);
      } //100


      if (diff > 300) {
        return methods.hundreds(start, end, n);
      } //10


      if (diff > 30) {
        return methods.tens(start, end, n);
      } //1


      if (diff > 3) {
        return methods.ones(start, end, n);
      } //.1


      if (diff > 0.3) {
        return methods.tenths(start, end, n);
      } //.01


      return methods.hundredths(start, end, n);
    }; //flip it around backwards


    var reverseTicks = function reverseTicks(ticks) {
      ticks = ticks.map(function (o) {
        o.value = 1 - o.value;
        return o;
      });
      return ticks.reverse();
    }; //


    var somehowTicks = function somehowTicks(start, end, n) {
      var reverse = false;
      start = Number(start);
      end = Number(end); //reverse them, if necessary

      if (start > end) {
        reverse = true;
        var tmp = start;
        start = end;
        end = tmp;
      }

      var ticks = chooseMethod(start, end, n); //support backwards ticks

      if (reverse === true) {
        ticks = reverseTicks(ticks);
      }

      return ticks;
    };

    module.exports = somehowTicks;

    },{"./methods":5}],5:[function(_dereq_,module,exports){

    var reduceTo = _dereq_('./_reduce');

    var prettyNum = _dereq_('./_prettyNum');

    var c = _dereq_('./_constants');

    var roundDown = function roundDown(n, unit) {
      return Math.floor(n / unit) * unit;
    }; //increment by this unit


    var allTicks = function allTicks(start, end, unit) {
      var inc = unit / 2; //increment by .5

      var ticks = [];
      start = start += unit;
      start = roundDown(start, unit);

      while (start < end) {
        ticks.push(start);
        start = start += inc;
      }

      return ticks;
    };

    var formatTicks = function formatTicks(arr, fmt, start, end) {
      var delta = end - start;
      return arr.map(function (s) {
        var percent = (s - start) / delta;
        return {
          label: prettyNum(s),
          number: s,
          value: parseInt(percent * 1000, 10) / 1000
        };
      });
    };

    var methods = {
      millions: function millions(start, end, n) {
        var ticks = allTicks(start, end, c.million);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, 'm', start, end);
        return ticks;
      },
      hundredKs: function hundredKs(start, end, n) {
        var ticks = allTicks(start, end, c.hundredThousand);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, 'k', start, end);
        return ticks;
      },
      thousands: function thousands(start, end, n) {
        var ticks = allTicks(start, end, c.thousand);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, 'm', start, end);
        return ticks;
      },
      hundreds: function hundreds(start, end, n) {
        var ticks = allTicks(start, end, c.hundred);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, 'm', start, end);
        return ticks;
      },
      tens: function tens(start, end, n) {
        var ticks = allTicks(start, end, c.ten);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, '', start, end);
        return ticks;
      },
      ones: function ones(start, end, n) {
        var ticks = allTicks(start, end, c.one);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, '', start, end);
        return ticks;
      },
      tenths: function tenths(start, end, n) {
        var ticks = allTicks(start, end, c.tenth);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, '', start, end);
        return ticks;
      },
      hundredths: function hundredths(start, end, n) {
        var ticks = allTicks(start, end, c.hundredth);
        ticks = reduceTo(ticks, n);
        ticks = formatTicks(ticks, '', start, end);
        return ticks;
      }
    };
    module.exports = methods;

    },{"./_constants":1,"./_prettyNum":2,"./_reduce":3}]},{},[4])(4)
    });
    });

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Label.svelte generated by Svelte v3.24.1 */
    const file$N = "Users/spencer/mountain/somehow-timeline/src/shapes/Label.svelte";

    function create_fragment$R(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div1_resize_listener;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(/*label*/ ctx[6]);
    			attr_dev(div0, "class", "line svelte-309jbi");
    			set_style(div0, "max-width", /*width*/ ctx[1]);
    			set_style(div0, "background-color", /*color*/ ctx[0]);
    			add_location(div0, file$N, 82, 2, 1849);
    			attr_dev(div1, "class", "label svelte-309jbi");
    			set_style(div1, "color", /*color*/ ctx[0]);
    			set_style(div1, "font-size", /*size*/ ctx[5]);
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[16].call(div1));
    			toggle_class(div1, "isTiny", /*isTiny*/ ctx[9]);
    			add_location(div1, file$N, 83, 2, 1925);
    			attr_dev(div2, "class", "container svelte-309jbi");
    			set_style(div2, "opacity", /*opacity*/ ctx[4]);
    			set_style(div2, "top", /*top*/ ctx[10] + /*margin*/ ctx[3] + "px");
    			set_style(div2, "height", /*height*/ ctx[11] - /*margin*/ ctx[3] * 2 + "px");
    			attr_dev(div2, "title", /*title*/ ctx[2]);
    			add_location(div2, file$N, 79, 0, 1716);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[16].bind(div1));

    			if (!mounted) {
    				dispose = listen_dev(
    					div1,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[7])) /*onClick*/ ctx[7].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*width*/ 2) {
    				set_style(div0, "max-width", /*width*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(div0, "background-color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*label*/ 64) set_data_dev(t1, /*label*/ ctx[6]);

    			if (dirty & /*color*/ 1) {
    				set_style(div1, "color", /*color*/ ctx[0]);
    			}

    			if (dirty & /*size*/ 32) {
    				set_style(div1, "font-size", /*size*/ ctx[5]);
    			}

    			if (dirty & /*isTiny*/ 512) {
    				toggle_class(div1, "isTiny", /*isTiny*/ ctx[9]);
    			}

    			if (dirty & /*opacity*/ 16) {
    				set_style(div2, "opacity", /*opacity*/ ctx[4]);
    			}

    			if (dirty & /*top, margin*/ 1032) {
    				set_style(div2, "top", /*top*/ ctx[10] + /*margin*/ ctx[3] + "px");
    			}

    			if (dirty & /*height, margin*/ 2056) {
    				set_style(div2, "height", /*height*/ ctx[11] - /*margin*/ ctx[3] * 2 + "px");
    			}

    			if (dirty & /*title*/ 4) {
    				attr_dev(div2, "title", /*title*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			div1_resize_listener();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$R.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$R($$self, $$props, $$invalidate) {
    	let w = 100;
    	let myScale = getContext("scale");
    	let { color = "steelblue" } = $$props;
    	let { width = "100%" } = $$props;
    	let { title = "" } = $$props;
    	let { margin = 2 } = $$props;
    	let { opacity = "0.7" } = $$props;
    	let { size = "1rem" } = $$props;
    	let { label = "" } = $$props;
    	let { duration = "" } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	let { start = getContext("start") } = $$props;
    	let { date = "" } = $$props;
    	start = date || start;
    	let { end = getContext("end") } = $$props;
    	start = src(start);

    	if (!end && duration) {
    		let words = duration.split(" ");
    		end = start.add(words[0], words[1]);
    	}

    	color = spencerColor$1.colors[color] || color;
    	start = start.epoch;
    	end = src(end).epoch;

    	if (duration) {
    		let split = duration.split(" ");
    		end = src(start).add(Number(split[0]), split[1]).epoch;
    	}

    	const scale = getContext("scale");

    	const writable_props = [
    		"color",
    		"width",
    		"title",
    		"margin",
    		"opacity",
    		"size",
    		"label",
    		"duration",
    		"onClick",
    		"start",
    		"date",
    		"end"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, []);

    	function div1_elementresize_handler() {
    		w = this.clientWidth;
    		$$invalidate(8, w);
    	}

    	$$self.$$set = $$props => {
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(3, margin = $$props.margin);
    		if ("opacity" in $$props) $$invalidate(4, opacity = $$props.opacity);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("duration" in $$props) $$invalidate(14, duration = $$props.duration);
    		if ("onClick" in $$props) $$invalidate(7, onClick = $$props.onClick);
    		if ("start" in $$props) $$invalidate(12, start = $$props.start);
    		if ("date" in $$props) $$invalidate(15, date = $$props.date);
    		if ("end" in $$props) $$invalidate(13, end = $$props.end);
    	};

    	$$self.$capture_state = () => ({
    		spacetime: src,
    		getContext,
    		Dots,
    		c: spencerColor$1,
    		w,
    		myScale,
    		color,
    		width,
    		title,
    		margin,
    		opacity,
    		size,
    		label,
    		duration,
    		onClick,
    		start,
    		date,
    		end,
    		scale,
    		isTiny,
    		top,
    		bottom,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) $$invalidate(8, w = $$props.w);
    		if ("myScale" in $$props) $$invalidate(18, myScale = $$props.myScale);
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("margin" in $$props) $$invalidate(3, margin = $$props.margin);
    		if ("opacity" in $$props) $$invalidate(4, opacity = $$props.opacity);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("label" in $$props) $$invalidate(6, label = $$props.label);
    		if ("duration" in $$props) $$invalidate(14, duration = $$props.duration);
    		if ("onClick" in $$props) $$invalidate(7, onClick = $$props.onClick);
    		if ("start" in $$props) $$invalidate(12, start = $$props.start);
    		if ("date" in $$props) $$invalidate(15, date = $$props.date);
    		if ("end" in $$props) $$invalidate(13, end = $$props.end);
    		if ("isTiny" in $$props) $$invalidate(9, isTiny = $$props.isTiny);
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(17, bottom = $$props.bottom);
    		if ("height" in $$props) $$invalidate(11, height = $$props.height);
    	};

    	let isTiny;
    	let top;
    	let bottom;
    	let height;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*w*/ 256) {
    			 $$invalidate(9, isTiny = w < 100);
    		}

    		if ($$self.$$.dirty & /*start*/ 4096) {
    			 $$invalidate(10, top = myScale(start));
    		}

    		if ($$self.$$.dirty & /*end*/ 8192) {
    			 $$invalidate(17, bottom = myScale(end));
    		}

    		if ($$self.$$.dirty & /*bottom, top*/ 132096) {
    			 $$invalidate(11, height = bottom - top);
    		}
    	};

    	return [
    		color,
    		width,
    		title,
    		margin,
    		opacity,
    		size,
    		label,
    		onClick,
    		w,
    		isTiny,
    		top,
    		height,
    		start,
    		end,
    		duration,
    		date,
    		div1_elementresize_handler
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$R, create_fragment$R, safe_not_equal, {
    			color: 0,
    			width: 1,
    			title: 2,
    			margin: 3,
    			opacity: 4,
    			size: 5,
    			label: 6,
    			duration: 14,
    			onClick: 7,
    			start: 12,
    			date: 15,
    			end: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$R.name
    		});
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/01.punctuation/Timeline.svelte generated by Svelte v3.24.1 */

    const file$O = "src/01.punctuation/Timeline.svelte";

    // (36:8) <Column>
    function create_default_slot_2(ctx) {
    	let axis;
    	let current;
    	axis = new Axis({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(axis.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axis, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axis, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(36:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (39:8) <Column>
    function create_default_slot_1(ctx) {
    	let label0;
    	let t0;
    	let label1;
    	let t1;
    	let label2;
    	let current;

    	label0 = new Label({
    			props: {
    				start: "January 1 1900",
    				end: "Feb 20 1965",
    				color: "pink",
    				label: "Typewriters"
    			},
    			$$inline: true
    		});

    	label1 = new Label({
    			props: {
    				start: "January 1 1965",
    				end: "Feb 20 1984",
    				color: "blue",
    				label: "Command-line"
    			},
    			$$inline: true
    		});

    	label2 = new Label({
    			props: {
    				start: "March 1 1984",
    				end: "June 20 2020",
    				color: "red",
    				label: "Prose"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label0.$$.fragment);
    			t0 = space();
    			create_component(label1.$$.fragment);
    			t1 = space();
    			create_component(label2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(label1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(label2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label0.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			transition_in(label2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label0.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			transition_out(label2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(label1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(label2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(39:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (35:6) <Timeline start="Jan 1 1900" end="Dec 30 2020" height="600">
    function create_default_slot$8(ctx) {
    	let column0;
    	let t;
    	let column1;
    	let current;

    	column0 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	column1 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column0.$$.fragment);
    			t = space();
    			create_component(column1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(column1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				column0_changes.$$scope = { dirty, ctx };
    			}

    			column0.$set(column0_changes);
    			const column1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				column1_changes.$$scope = { dirty, ctx };
    			}

    			column1.$set(column1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column0.$$.fragment, local);
    			transition_in(column1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column0.$$.fragment, local);
    			transition_out(column1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(column1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(35:6) <Timeline start=\\\"Jan 1 1900\\\" end=\\\"Dec 30 2020\\\" height=\\\"600\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$S(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let timeline;
    	let t0;
    	let div3;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let t6;
    	let li3;
    	let current;

    	timeline = new Timeline({
    			props: {
    				start: "Jan 1 1900",
    				end: "Dec 30 2020",
    				height: "600",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(timeline.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			li0 = element("li");
    			li0.textContent = "the command-line came before prose-editor";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "20 years of commands-only.";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "computer programmers determined the keyboard";
    			t6 = space();
    			li3 = element("li");
    			li3.textContent = "now people are writing novels with < key";
    			set_style(div0, "width", "400px");
    			add_location(div0, file$O, 33, 4, 580);
    			attr_dev(div1, "class", "row svelte-u9qx7l");
    			add_location(div1, file$O, 32, 2, 558);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$O, 31, 0, 538);
    			add_location(li0, file$O, 60, 2, 1248);
    			add_location(li1, file$O, 61, 2, 1301);
    			add_location(li2, file$O, 62, 2, 1339);
    			add_location(li3, file$O, 63, 2, 1395);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$O, 59, 0, 1226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(timeline, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li0);
    			append_dev(div3, t2);
    			append_dev(div3, li1);
    			append_dev(div3, t4);
    			append_dev(div3, li2);
    			append_dev(div3, t6);
    			append_dev(div3, li3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const timeline_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				timeline_changes.$$scope = { dirty, ctx };
    			}

    			timeline.$set(timeline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(timeline);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$S.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$S($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);
    	$$self.$capture_state = () => ({ Timeline, Column, Line, Label, Axis });
    	return [];
    }

    class Timeline_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline_1",
    			options,
    			id: create_fragment$S.name
    		});
    	}
    }

    /* src/01.punctuation/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$T(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$T.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$T($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;

    	let steps = [
    		Keyboard_1,
    		Keyboard_2,
    		Keyboard_3,
    		KeyTilde,
    		// Tilde,
    		KeyAt,
    		KeyHash,
    		KeyAsterix,
    		KeyBrackets,
    		Tomlinson,
    		Timeline_1
    	];

    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_01_punctuation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_01_punctuation", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Keyboard1: Keyboard_1,
    		Keyboard2: Keyboard_2,
    		Keyboard3: Keyboard_3,
    		KeyTilde,
    		Tilde,
    		KeyHash,
    		KeyAt,
    		KeyAsterix,
    		KeyBrackets,
    		Tomlinson,
    		Timeline: Timeline_1,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _01_punctuation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$T, create_fragment$T, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_punctuation",
    			options,
    			id: create_fragment$T.name
    		});
    	}

    	get done() {
    		throw new Error("<_01_punctuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_01_punctuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_01_punctuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_01_punctuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_01_punctuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_01_punctuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/02.markup/Question.svelte generated by Svelte v3.24.1 */

    const file$P = "src/02.markup/Question.svelte";

    function create_fragment$U(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div2;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let div1;
    	let t7;
    	let div5;
    	let li;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "how can a user";
    			t1 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "make";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "data";
    			t5 = space();
    			div1 = element("div");
    			div1.textContent = "with their keyboard?";
    			t7 = space();
    			div5 = element("div");
    			li = element("li");
    			li.textContent = "everybody knows freehand text can't be parsed";
    			attr_dev(div0, "class", "f2 i");
    			add_location(div0, file$P, 23, 4, 296);
    			attr_dev(span0, "class", "blue med  svelte-10y1wyx");
    			add_location(span0, file$P, 25, 6, 363);
    			attr_dev(span1, "class", "red i");
    			add_location(span1, file$P, 26, 6, 405);
    			attr_dev(div1, "class", "blue med  svelte-10y1wyx");
    			add_location(div1, file$P, 27, 6, 443);
    			attr_dev(div2, "class", "med svelte-10y1wyx");
    			add_location(div2, file$P, 24, 4, 339);
    			add_location(div3, file$P, 22, 2, 286);
    			attr_dev(div4, "class", "box big svelte-10y1wyx");
    			add_location(div4, file$P, 21, 0, 262);
    			add_location(li, file$P, 32, 2, 542);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$P, 31, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, span0);
    			append_dev(div2, t3);
    			append_dev(div2, span1);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$U.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$U($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Question", $$slots, []);
    	return [];
    }

    class Question$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$U, create_fragment$U, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$U.name
    		});
    	}
    }

    /* src/02.markup/Wikipedia.svelte generated by Svelte v3.24.1 */
    const file$Q = "src/02.markup/Wikipedia.svelte";

    function create_fragment$V(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "first two sentences";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "dream of information-as-text";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$Q, 7, 0, 136);
    			add_location(li0, file$Q, 12, 2, 207);
    			add_location(li1, file$Q, 13, 2, 238);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$Q, 11, 0, 185);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$V.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$V($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/02.markup/assets/einstein.png"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wikipedia> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wikipedia", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Wikipedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$V, create_fragment$V, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wikipedia",
    			options,
    			id: create_fragment$V.name
    		});
    	}
    }

    /* src/02.markup/Escaping.svelte generated by Svelte v3.24.1 */
    const file$R = "src/02.markup/Escaping.svelte";

    function create_fragment$W(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li = element("li");
    			li.textContent = "maybe the largest single failure of information technology";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$R, 7, 0, 137);
    			add_location(li, file$R, 12, 2, 208);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$R, 11, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$W.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$W($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/02.markup/assets/injection.jpg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Escaping> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Escaping", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Escaping extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$W, create_fragment$W, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Escaping",
    			options,
    			id: create_fragment$W.name
    		});
    	}
    }

    /* src/02.markup/MarkupQuestion.svelte generated by Svelte v3.24.1 */

    const file$S = "src/02.markup/MarkupQuestion.svelte";

    function create_fragment$X(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let span1;
    	let div1;
    	let t3;
    	let span0;
    	let t5;
    	let div4;
    	let li0;
    	let t7;
    	let li1;
    	let t9;
    	let li2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "can there ever be";
    			t1 = space();
    			span1 = element("span");
    			div1 = element("div");
    			div1.textContent = "a good";
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "markup language?";
    			t5 = space();
    			div4 = element("div");
    			li0 = element("li");
    			li0.textContent = "do we need a new character?";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "a good parser?";
    			t9 = space();
    			li2 = element("li");
    			li2.textContent = "the central question of computer-science";
    			attr_dev(div0, "class", "f2");
    			add_location(div0, file$S, 20, 4, 217);
    			attr_dev(div1, "class", "red i");
    			add_location(div1, file$S, 22, 6, 286);
    			attr_dev(span0, "class", "blue f3 svelte-3w2vdo");
    			add_location(span0, file$S, 23, 6, 324);
    			attr_dev(span1, "class", "med svelte-3w2vdo");
    			add_location(span1, file$S, 21, 4, 261);
    			add_location(div2, file$S, 19, 2, 207);
    			attr_dev(div3, "class", "box big svelte-3w2vdo");
    			add_location(div3, file$S, 18, 0, 183);
    			add_location(li0, file$S, 28, 2, 420);
    			add_location(li1, file$S, 29, 2, 459);
    			add_location(li2, file$S, 30, 2, 485);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$S, 27, 0, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, span1);
    			append_dev(span1, div1);
    			append_dev(span1, t3);
    			append_dev(span1, span0);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, li0);
    			append_dev(div4, t7);
    			append_dev(div4, li1);
    			append_dev(div4, t9);
    			append_dev(div4, li2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$X.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$X($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MarkupQuestion> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MarkupQuestion", $$slots, []);
    	return [];
    }

    class MarkupQuestion extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$X, create_fragment$X, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MarkupQuestion",
    			options,
    			id: create_fragment$X.name
    		});
    	}
    }

    /* src/02.markup/Margin.svelte generated by Svelte v3.24.1 */
    const file$T = "src/02.markup/Margin.svelte";

    function create_fragment$Y(ctx) {
    	let div0;
    	let image_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "non-programmers writing data";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "nytimes uses archieML";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$T, 9, 0, 185);
    			add_location(li0, file$T, 14, 2, 256);
    			add_location(li1, file$T, 15, 2, 296);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$T, 13, 0, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(image_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Y($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/02.markup/assets/margin.png",
    		title: "Margin.love",
    		sub: "Alex Gamburg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Margin> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Margin", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Margin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Y, create_fragment$Y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Margin",
    			options,
    			id: create_fragment$Y.name
    		});
    	}
    }

    /* src/02.markup/Glimpse.svelte generated by Svelte v3.24.1 */
    const file$U = "src/02.markup/Glimpse.svelte";

    function create_fragment$Z(ctx) {
    	let div0;
    	let video_1;
    	let t0;
    	let div1;
    	let li0;
    	let t2;
    	let li1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0], { loop: "true" }];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(video_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "2011";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "giving-up on wysiwyg";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$U, 14, 0, 267);
    			add_location(li0, file$U, 18, 2, 349);
    			add_location(li1, file$U, 19, 2, 365);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$U, 17, 0, 327);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(video_1, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(div1, t2);
    			append_dev(div1, li1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0]), video_1_spread_levels[1]])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(video_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$Z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Z($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/02.markup/assets/glimpse.mp4",
    		title: "Glimpse",
    		sub: "UIST 2011: Dragicevic, Huot, Chevalier"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Glimpse> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Glimpse", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Glimpse extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$Z, create_fragment$Z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Glimpse",
    			options,
    			id: create_fragment$Z.name
    		});
    	}
    }

    /* src/02.markup/Timeline.svelte generated by Svelte v3.24.1 */

    const file$V = "src/02.markup/Timeline.svelte";

    // (36:8) <Column>
    function create_default_slot_2$1(ctx) {
    	let axis;
    	let current;
    	axis = new Axis({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(axis.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axis, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axis.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axis.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axis, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(36:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (39:8) <Column>
    function create_default_slot_1$1(ctx) {
    	let label0;
    	let t0;
    	let label1;
    	let t1;
    	let label2;
    	let current;

    	label0 = new Label({
    			props: {
    				start: "January 1 1900",
    				end: "Feb 20 1965",
    				color: "pink",
    				label: "Typewriters"
    			},
    			$$inline: true
    		});

    	label1 = new Label({
    			props: {
    				start: "January 1 1965",
    				end: "Feb 20 1984",
    				color: "blue",
    				label: "Command-line"
    			},
    			$$inline: true
    		});

    	label2 = new Label({
    			props: {
    				start: "March 1 1984",
    				end: "June 20 2020",
    				color: "red",
    				label: "Awkward relationships with markup + UI"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label0.$$.fragment);
    			t0 = space();
    			create_component(label1.$$.fragment);
    			t1 = space();
    			create_component(label2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(label1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(label2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label0.$$.fragment, local);
    			transition_in(label1.$$.fragment, local);
    			transition_in(label2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label0.$$.fragment, local);
    			transition_out(label1.$$.fragment, local);
    			transition_out(label2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(label1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(label2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(39:8) <Column>",
    		ctx
    	});

    	return block;
    }

    // (35:6) <Timeline start="Jan 1 1900" end="Dec 30 2020" height="600">
    function create_default_slot$9(ctx) {
    	let column0;
    	let t;
    	let column1;
    	let current;

    	column0 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	column1 = new Column({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(column0.$$.fragment);
    			t = space();
    			create_component(column1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(column0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(column1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const column0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				column0_changes.$$scope = { dirty, ctx };
    			}

    			column0.$set(column0_changes);
    			const column1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				column1_changes.$$scope = { dirty, ctx };
    			}

    			column1.$set(column1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(column0.$$.fragment, local);
    			transition_in(column1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(column0.$$.fragment, local);
    			transition_out(column1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(column0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(column1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(35:6) <Timeline start=\\\"Jan 1 1900\\\" end=\\\"Dec 30 2020\\\" height=\\\"600\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$_(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let timeline;
    	let t0;
    	let div3;
    	let li0;
    	let t2;
    	let li1;
    	let current;

    	timeline = new Timeline({
    			props: {
    				start: "Jan 1 1900",
    				end: "Dec 30 2020",
    				height: "600",
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(timeline.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			li0 = element("li");
    			li0.textContent = "in CLI computer was under your fingers";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "users are desperate for a powerful interface, we give them another GUI";
    			set_style(div0, "width", "400px");
    			add_location(div0, file$V, 33, 4, 580);
    			attr_dev(div1, "class", "row svelte-u9qx7l");
    			add_location(div1, file$V, 32, 2, 558);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$V, 31, 0, 538);
    			add_location(li0, file$V, 60, 2, 1281);
    			add_location(li1, file$V, 61, 2, 1331);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$V, 59, 0, 1259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(timeline, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li0);
    			append_dev(div3, t2);
    			append_dev(div3, li1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const timeline_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				timeline_changes.$$scope = { dirty, ctx };
    			}

    			timeline.$set(timeline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(timeline);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$_.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$_($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);
    	$$self.$capture_state = () => ({ Timeline, Column, Line, Label, Axis });
    	return [];
    }

    class Timeline_1$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$_, create_fragment$_, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline_1",
    			options,
    			id: create_fragment$_.name
    		});
    	}
    }

    /* src/02.markup/Loop.svelte generated by Svelte v3.24.1 */

    const file$W = "src/02.markup/Loop.svelte";

    function create_fragment$$(ctx) {
    	let div9;
    	let div1;
    	let span0;
    	let t1;
    	let div0;
    	let t3;
    	let div3;
    	let span1;
    	let t5;
    	let br;
    	let t6;
    	let div2;
    	let t8;
    	let div5;
    	let span2;
    	let t10;
    	let div4;
    	let t12;
    	let div7;
    	let span3;
    	let t14;
    	let div6;
    	let t16;
    	let div8;
    	let svg;
    	let defs;
    	let marker0;
    	let path0;
    	let marker1;
    	let path1;
    	let path2;
    	let path3;
    	let g;
    	let path4;
    	let path5;
    	let t17;
    	let div10;
    	let li0;
    	let t19;
    	let li1;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "deeply arcane";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "CLI";
    			t3 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "deeply patronizing";
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			div2 = element("div");
    			div2.textContent = "GUI";
    			t8 = space();
    			div5 = element("div");
    			span2 = element("span");
    			span2.textContent = "add commands";
    			t10 = space();
    			div4 = element("div");
    			div4.textContent = "create a markup";
    			t12 = space();
    			div7 = element("div");
    			span3 = element("span");
    			span3.textContent = "\"wysiwyg\"";
    			t14 = space();
    			div6 = element("div");
    			div6.textContent = "build a UI";
    			t16 = space();
    			div8 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			marker0 = svg_element("marker");
    			path0 = svg_element("path");
    			marker1 = svg_element("marker");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g = svg_element("g");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t17 = space();
    			div10 = element("div");
    			li0 = element("li");
    			li0.textContent = "people hate our UIs, especially if they're beautiful";
    			t19 = space();
    			li1 = element("li");
    			li1.textContent = "i've been both the blue and red arrows in my career";
    			attr_dev(span0, "class", "sub i svelte-1750xxe");
    			add_location(span0, file$W, 33, 4, 627);
    			attr_dev(div0, "class", "f2");
    			add_location(div0, file$W, 34, 4, 672);
    			attr_dev(div1, "class", "label blue svelte-1750xxe");
    			set_style(div1, "top", "40%");
    			set_style(div1, "left", "24%");
    			add_location(div1, file$W, 32, 2, 571);
    			attr_dev(span1, "class", "sub i svelte-1750xxe");
    			add_location(span1, file$W, 37, 4, 764);
    			add_location(br, file$W, 38, 4, 814);
    			attr_dev(div2, "class", "f2");
    			add_location(div2, file$W, 39, 4, 825);
    			attr_dev(div3, "class", "label red svelte-1750xxe");
    			set_style(div3, "top", "40%");
    			set_style(div3, "left", "57%");
    			add_location(div3, file$W, 36, 2, 709);
    			attr_dev(span2, "class", "sub i  svelte-1750xxe");
    			set_style(span2, "font-size", "1.2rem");
    			add_location(span2, file$W, 42, 4, 909);
    			add_location(div4, file$W, 43, 4, 980);
    			attr_dev(div5, "class", "label blue svelte-1750xxe");
    			set_style(div5, "top", "50px");
    			add_location(div5, file$W, 41, 2, 862);
    			attr_dev(span3, "class", "sub i  svelte-1750xxe");
    			set_style(span3, "font-size", "1.2rem");
    			add_location(span3, file$W, 46, 4, 1067);
    			add_location(div6, file$W, 47, 4, 1135);
    			attr_dev(div7, "class", "label red svelte-1750xxe");
    			set_style(div7, "bottom", "50px");
    			add_location(div7, file$W, 45, 2, 1018);
    			attr_dev(path0, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path0, "fill", "#D68881");
    			attr_dev(path0, "transform", "rotate(23)");
    			attr_dev(path0, "class", "svelte-1lnhtnf");
    			add_location(path0, file$W, 66, 10, 1600);
    			attr_dev(marker0, "id", "triangle");
    			attr_dev(marker0, "viewBox", "0 0 10 10");
    			attr_dev(marker0, "refX", "4");
    			attr_dev(marker0, "refY", "6");
    			attr_dev(marker0, "markerUnits", "strokeWidth");
    			attr_dev(marker0, "markerWidth", "9");
    			attr_dev(marker0, "markerHeight", "9");
    			attr_dev(marker0, "orient", "auto");
    			add_location(marker0, file$W, 57, 8, 1376);
    			attr_dev(path1, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path1, "fill", "#6699cc");
    			attr_dev(path1, "transform", "rotate(23)");
    			attr_dev(path1, "class", "svelte-1lnhtnf");
    			add_location(path1, file$W, 81, 10, 1995);
    			attr_dev(marker1, "id", "triangle2");
    			attr_dev(marker1, "viewBox", "0 0 10 10");
    			attr_dev(marker1, "refX", "4");
    			attr_dev(marker1, "refY", "6");
    			attr_dev(marker1, "markerUnits", "strokeWidth");
    			attr_dev(marker1, "markerWidth", "9");
    			attr_dev(marker1, "markerHeight", "9");
    			attr_dev(marker1, "orient", "auto");
    			add_location(marker1, file$W, 72, 8, 1770);
    			add_location(defs, file$W, 56, 6, 1361);
    			attr_dev(path2, "class", "link svelte-1lnhtnf");
    			attr_dev(path2, "d", "M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z");
    			attr_dev(path2, "stroke", "none");
    			attr_dev(path2, "fill", "#6699cc");
    			attr_dev(path2, "stroke-width", "1");
    			attr_dev(path2, "marker-end", "url(#triangle2)");
    			add_location(path2, file$W, 88, 6, 2177);
    			attr_dev(path3, "class", "link svelte-1lnhtnf");
    			attr_dev(path3, "d", "M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "fill", "#D68881");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "marker-end", "url(#triangle)");
    			add_location(path3, file$W, 95, 6, 2521);
    			attr_dev(path4, "class", "link svelte-1lnhtnf");
    			attr_dev(path4, "d", "M8.799847533485712,-32.84147809382832A34,34,0,0,1,32.84147809382832,-8.79984753348571L30.909626441250182,-8.282209443280669A32,32,0,0,0,8.28220944328067,-30.909626441250182Z");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "fill", "#F2C0BB");
    			attr_dev(path4, "stroke-width", "1");
    			add_location(path4, file$W, 105, 8, 2925);
    			attr_dev(path5, "class", "link svelte-1lnhtnf");
    			attr_dev(path5, "d", "M32.84147809382832,8.799847533485696A34,34,0,0,1,8.799847533485698,32.84147809382832L8.282209443280657,30.909626441250186A32,32,0,0,0,30.909626441250186,8.282209443280655Z");
    			attr_dev(path5, "stroke", "none");
    			attr_dev(path5, "fill", "#F2C0BB");
    			attr_dev(path5, "stroke-width", "1");
    			add_location(path5, file$W, 111, 8, 3244);
    			attr_dev(g, "transform", "scale(0.82)");
    			add_location(g, file$W, 104, 6, 2889);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file$W, 51, 4, 1235);
    			attr_dev(div8, "class", "col svelte-1750xxe");
    			set_style(div8, "transform", "scaleX(-1)");
    			set_style(div8, "height", "600px");
    			add_location(div8, file$W, 49, 2, 1168);
    			attr_dev(div9, "class", "box");
    			set_style(div9, "position", "relative");
    			set_style(div9, "with", "100%");
    			add_location(div9, file$W, 31, 0, 513);
    			add_location(li0, file$W, 125, 2, 3616);
    			add_location(li1, file$W, 126, 2, 3680);
    			attr_dev(div10, "class", "notes");
    			add_location(div10, file$W, 124, 0, 3594);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div9, t3);
    			append_dev(div9, div3);
    			append_dev(div3, span1);
    			append_dev(div3, t5);
    			append_dev(div3, br);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div9, t8);
    			append_dev(div9, div5);
    			append_dev(div5, span2);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div9, t12);
    			append_dev(div9, div7);
    			append_dev(div7, span3);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div9, t16);
    			append_dev(div9, div8);
    			append_dev(div8, svg);
    			append_dev(svg, defs);
    			append_dev(defs, marker0);
    			append_dev(marker0, path0);
    			append_dev(defs, marker1);
    			append_dev(marker1, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, g);
    			append_dev(g, path4);
    			append_dev(g, path5);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, li0);
    			append_dev(div10, t19);
    			append_dev(div10, li1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$$.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$$($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loop> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Loop", $$slots, []);
    	return [];
    }

    class Loop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$$, create_fragment$$, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loop",
    			options,
    			id: create_fragment$$.name
    		});
    	}
    }

    /* src/02.markup/LoopPink.svelte generated by Svelte v3.24.1 */

    const file$X = "src/02.markup/LoopPink.svelte";

    function create_fragment$10(ctx) {
    	let div20;
    	let div8;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let div6;
    	let t13;
    	let div7;
    	let t15;
    	let div9;
    	let t16;
    	let div12;
    	let div10;
    	let t18;
    	let div11;
    	let t20;
    	let div14;
    	let br;
    	let t21;
    	let div13;
    	let t23;
    	let div16;
    	let span0;
    	let t25;
    	let div15;
    	let t27;
    	let div18;
    	let span1;
    	let t29;
    	let div17;
    	let t31;
    	let div19;
    	let svg;
    	let defs;
    	let marker0;
    	let path0;
    	let marker1;
    	let path1;
    	let path2;
    	let path3;
    	let g;
    	let path4;
    	let path5;
    	let t32;
    	let div21;
    	let li;

    	const block = {
    		c: function create() {
    			div20 = element("div");
    			div8 = element("div");
    			div0 = element("div");
    			div0.textContent = "• ubiquity";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "• sublime cmds";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "• medium";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "• blekko tags";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "• Apple spotlight";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "• FB graph-search";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "• Wolfram Language";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "• linear.app";
    			t15 = space();
    			div9 = element("div");
    			t16 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = `${" -"}`;
    			t18 = space();
    			div11 = element("div");
    			div11.textContent = "CLI";
    			t20 = space();
    			div14 = element("div");
    			br = element("br");
    			t21 = space();
    			div13 = element("div");
    			div13.textContent = "GUI";
    			t23 = space();
    			div16 = element("div");
    			span0 = element("span");
    			span0.textContent = "add commands";
    			t25 = space();
    			div15 = element("div");
    			div15.textContent = "create a markup";
    			t27 = space();
    			div18 = element("div");
    			span1 = element("span");
    			span1.textContent = "\"wysiwyg\"";
    			t29 = space();
    			div17 = element("div");
    			div17.textContent = "build a UI";
    			t31 = space();
    			div19 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			marker0 = svg_element("marker");
    			path0 = svg_element("path");
    			marker1 = svg_element("marker");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			g = svg_element("g");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t32 = space();
    			div21 = element("div");
    			li = element("li");
    			li.textContent = "sweet spot";
    			add_location(div0, file$X, 43, 4, 756);
    			add_location(div1, file$X, 44, 4, 782);
    			add_location(div2, file$X, 45, 4, 812);
    			add_location(div3, file$X, 46, 4, 836);
    			add_location(div4, file$X, 47, 4, 865);
    			add_location(div5, file$X, 48, 4, 898);
    			add_location(div6, file$X, 49, 4, 931);
    			add_location(div7, file$X, 50, 4, 965);
    			attr_dev(div8, "class", "onleft svelte-sbsgm0");
    			add_location(div8, file$X, 42, 2, 731);
    			attr_dev(div9, "class", "label pink svelte-sbsgm0");
    			set_style(div9, "top", "40%");
    			set_style(div9, "left", "34%");
    			add_location(div9, file$X, 52, 2, 1000);
    			set_style(div10, "opacity", "0");
    			add_location(div10, file$X, 54, 4, 1111);
    			attr_dev(div11, "class", "f2 blue");
    			add_location(div11, file$X, 55, 4, 1152);
    			attr_dev(div12, "class", "label red svelte-sbsgm0");
    			set_style(div12, "top", "40%");
    			set_style(div12, "left", "24%");
    			add_location(div12, file$X, 53, 2, 1056);
    			add_location(br, file$X, 59, 4, 1308);
    			attr_dev(div13, "class", "f2");
    			add_location(div13, file$X, 60, 4, 1319);
    			attr_dev(div14, "class", "label red svelte-sbsgm0");
    			set_style(div14, "top", "40%");
    			set_style(div14, "left", "57%");
    			add_location(div14, file$X, 57, 2, 1194);
    			attr_dev(span0, "class", "sub i  svelte-sbsgm0");
    			set_style(span0, "font-size", "1.2rem");
    			add_location(span0, file$X, 63, 4, 1403);
    			add_location(div15, file$X, 64, 4, 1474);
    			attr_dev(div16, "class", "label blue svelte-sbsgm0");
    			set_style(div16, "top", "50px");
    			add_location(div16, file$X, 62, 2, 1356);
    			attr_dev(span1, "class", "sub i  svelte-sbsgm0");
    			set_style(span1, "font-size", "1.2rem");
    			add_location(span1, file$X, 67, 4, 1561);
    			add_location(div17, file$X, 68, 4, 1629);
    			attr_dev(div18, "class", "label red svelte-sbsgm0");
    			set_style(div18, "bottom", "50px");
    			add_location(div18, file$X, 66, 2, 1512);
    			attr_dev(path0, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path0, "fill", "#D68881");
    			attr_dev(path0, "transform", "rotate(23)");
    			attr_dev(path0, "class", "svelte-1lnhtnf");
    			add_location(path0, file$X, 87, 10, 2094);
    			attr_dev(marker0, "id", "triangle");
    			attr_dev(marker0, "viewBox", "0 0 10 10");
    			attr_dev(marker0, "refX", "4");
    			attr_dev(marker0, "refY", "6");
    			attr_dev(marker0, "markerUnits", "strokeWidth");
    			attr_dev(marker0, "markerWidth", "9");
    			attr_dev(marker0, "markerHeight", "9");
    			attr_dev(marker0, "orient", "auto");
    			add_location(marker0, file$X, 78, 8, 1870);
    			attr_dev(path1, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path1, "fill", "#6699cc");
    			attr_dev(path1, "transform", "rotate(23)");
    			attr_dev(path1, "class", "svelte-1lnhtnf");
    			add_location(path1, file$X, 102, 10, 2489);
    			attr_dev(marker1, "id", "triangle2");
    			attr_dev(marker1, "viewBox", "0 0 10 10");
    			attr_dev(marker1, "refX", "4");
    			attr_dev(marker1, "refY", "6");
    			attr_dev(marker1, "markerUnits", "strokeWidth");
    			attr_dev(marker1, "markerWidth", "9");
    			attr_dev(marker1, "markerHeight", "9");
    			attr_dev(marker1, "orient", "auto");
    			add_location(marker1, file$X, 93, 8, 2264);
    			add_location(defs, file$X, 77, 6, 1855);
    			attr_dev(path2, "class", "link svelte-1lnhtnf");
    			attr_dev(path2, "d", "M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z");
    			attr_dev(path2, "stroke", "none");
    			attr_dev(path2, "fill", "#6699cc");
    			attr_dev(path2, "stroke-width", "1");
    			attr_dev(path2, "marker-end", "url(#triangle2)");
    			add_location(path2, file$X, 109, 6, 2671);
    			attr_dev(path3, "class", "link svelte-1lnhtnf");
    			attr_dev(path3, "d", "M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "fill", "#D68881");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "marker-end", "url(#triangle)");
    			add_location(path3, file$X, 116, 6, 3015);
    			attr_dev(path4, "class", "link svelte-1lnhtnf");
    			attr_dev(path4, "d", "M8.799847533485712,-32.84147809382832A34,34,0,0,1,32.84147809382832,-8.79984753348571L30.909626441250182,-8.282209443280669A32,32,0,0,0,8.28220944328067,-30.909626441250182Z");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "fill", "#F2C0BB");
    			attr_dev(path4, "stroke-width", "1");
    			add_location(path4, file$X, 126, 8, 3418);
    			attr_dev(path5, "class", "link svelte-1lnhtnf");
    			attr_dev(path5, "d", "M32.84147809382832,8.799847533485696A34,34,0,0,1,8.799847533485698,32.84147809382832L8.282209443280657,30.909626441250186A32,32,0,0,0,30.909626441250186,8.282209443280655Z");
    			attr_dev(path5, "stroke", "none");
    			attr_dev(path5, "fill", "#F2C0BB");
    			attr_dev(path5, "stroke-width", "1");
    			add_location(path5, file$X, 132, 8, 3737);
    			attr_dev(g, "transform", "scale(0.8)");
    			add_location(g, file$X, 125, 6, 3383);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file$X, 72, 4, 1729);
    			attr_dev(div19, "class", "col svelte-sbsgm0");
    			set_style(div19, "transform", "scaleX(-1)");
    			set_style(div19, "height", "600px");
    			add_location(div19, file$X, 70, 2, 1662);
    			attr_dev(div20, "class", "box");
    			set_style(div20, "position", "relative");
    			set_style(div20, "width", "100%");
    			add_location(div20, file$X, 40, 0, 671);
    			add_location(li, file$X, 146, 2, 4109);
    			attr_dev(div21, "class", "notes");
    			add_location(div21, file$X, 145, 0, 4087);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div20, anchor);
    			append_dev(div20, div8);
    			append_dev(div8, div0);
    			append_dev(div8, t1);
    			append_dev(div8, div1);
    			append_dev(div8, t3);
    			append_dev(div8, div2);
    			append_dev(div8, t5);
    			append_dev(div8, div3);
    			append_dev(div8, t7);
    			append_dev(div8, div4);
    			append_dev(div8, t9);
    			append_dev(div8, div5);
    			append_dev(div8, t11);
    			append_dev(div8, div6);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div20, t15);
    			append_dev(div20, div9);
    			append_dev(div20, t16);
    			append_dev(div20, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t18);
    			append_dev(div12, div11);
    			append_dev(div20, t20);
    			append_dev(div20, div14);
    			append_dev(div14, br);
    			append_dev(div14, t21);
    			append_dev(div14, div13);
    			append_dev(div20, t23);
    			append_dev(div20, div16);
    			append_dev(div16, span0);
    			append_dev(div16, t25);
    			append_dev(div16, div15);
    			append_dev(div20, t27);
    			append_dev(div20, div18);
    			append_dev(div18, span1);
    			append_dev(div18, t29);
    			append_dev(div18, div17);
    			append_dev(div20, t31);
    			append_dev(div20, div19);
    			append_dev(div19, svg);
    			append_dev(svg, defs);
    			append_dev(defs, marker0);
    			append_dev(marker0, path0);
    			append_dev(defs, marker1);
    			append_dev(marker1, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, g);
    			append_dev(g, path4);
    			append_dev(g, path5);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, div21, anchor);
    			append_dev(div21, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div20);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(div21);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$10.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$10($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoopPink> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoopPink", $$slots, []);
    	return [];
    }

    class LoopPink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$10, create_fragment$10, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopPink",
    			options,
    			id: create_fragment$10.name
    		});
    	}
    }

    /* src/02.markup/LoopNLP.svelte generated by Svelte v3.24.1 */

    const file$Y = "src/02.markup/LoopNLP.svelte";

    function create_fragment$11(ctx) {
    	let div9;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div5;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div7;
    	let span0;
    	let t9;
    	let div6;
    	let t11;
    	let span1;
    	let t13;
    	let div8;
    	let svg;
    	let defs;
    	let marker0;
    	let path0;
    	let marker1;
    	let path1;
    	let marker2;
    	let path2;
    	let path3;
    	let path4;
    	let g;
    	let path5;
    	let t14;
    	let div10;
    	let li0;
    	let t16;
    	let li1;
    	let t18;
    	let li2;

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = `${" -"}`;
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "CLI";
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = `${" -"}`;
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "GUI";
    			t7 = space();
    			div7 = element("div");
    			span0 = element("span");
    			span0.textContent = "a somehow-good";
    			t9 = space();
    			div6 = element("div");
    			div6.textContent = "NLP";
    			t11 = space();
    			span1 = element("span");
    			span1.textContent = "interface";
    			t13 = space();
    			div8 = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			marker0 = svg_element("marker");
    			path0 = svg_element("path");
    			marker1 = svg_element("marker");
    			path1 = svg_element("path");
    			marker2 = svg_element("marker");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			g = svg_element("g");
    			path5 = svg_element("path");
    			t14 = space();
    			div10 = element("div");
    			li0 = element("li");
    			li0.textContent = "never happened";
    			t16 = space();
    			li1 = element("li");
    			li1.textContent = "throw text at";
    			t18 = space();
    			li2 = element("li");
    			li2.textContent = "not question-answering!";
    			set_style(div0, "opacity", "0");
    			add_location(div0, file$Y, 43, 4, 786);
    			attr_dev(div1, "class", "f2 blue");
    			add_location(div1, file$Y, 44, 4, 827);
    			attr_dev(div2, "class", "label red svelte-1v5aa7h");
    			set_style(div2, "top", "40%");
    			set_style(div2, "left", "24%");
    			add_location(div2, file$Y, 42, 2, 731);
    			set_style(div3, "opacity", "0");
    			add_location(div3, file$Y, 47, 4, 924);
    			attr_dev(div4, "class", "f2");
    			add_location(div4, file$Y, 48, 4, 965);
    			attr_dev(div5, "class", "label red svelte-1v5aa7h");
    			set_style(div5, "top", "40%");
    			set_style(div5, "left", "57%");
    			add_location(div5, file$Y, 46, 2, 869);
    			attr_dev(span0, "class", "sub i  svelte-1v5aa7h");
    			set_style(span0, "font-size", "1.2rem");
    			add_location(span0, file$Y, 51, 4, 1058);
    			attr_dev(div6, "class", "f2");
    			add_location(div6, file$Y, 52, 4, 1131);
    			attr_dev(span1, "class", "sub i  svelte-1v5aa7h");
    			set_style(span1, "font-size", "1.2rem");
    			add_location(span1, file$Y, 53, 4, 1161);
    			attr_dev(div7, "class", "label green svelte-1v5aa7h");
    			set_style(div7, "top", "58%");
    			set_style(div7, "left", "7%");
    			add_location(div7, file$Y, 50, 2, 1002);
    			attr_dev(path0, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path0, "fill", "#D68881");
    			attr_dev(path0, "transform", "rotate(23)");
    			attr_dev(path0, "class", "svelte-1lnhtnf");
    			add_location(path0, file$Y, 73, 10, 1669);
    			attr_dev(marker0, "id", "triangle");
    			attr_dev(marker0, "viewBox", "0 0 10 10");
    			attr_dev(marker0, "refX", "4");
    			attr_dev(marker0, "refY", "6");
    			attr_dev(marker0, "markerUnits", "strokeWidth");
    			attr_dev(marker0, "markerWidth", "9");
    			attr_dev(marker0, "markerHeight", "9");
    			attr_dev(marker0, "orient", "auto");
    			add_location(marker0, file$Y, 64, 8, 1445);
    			attr_dev(path1, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path1, "fill", "#6699cc");
    			attr_dev(path1, "transform", "rotate(23)");
    			attr_dev(path1, "class", "svelte-1lnhtnf");
    			add_location(path1, file$Y, 88, 10, 2064);
    			attr_dev(marker1, "id", "triangle2");
    			attr_dev(marker1, "viewBox", "0 0 10 10");
    			attr_dev(marker1, "refX", "4");
    			attr_dev(marker1, "refY", "6");
    			attr_dev(marker1, "markerUnits", "strokeWidth");
    			attr_dev(marker1, "markerWidth", "9");
    			attr_dev(marker1, "markerHeight", "9");
    			attr_dev(marker1, "orient", "auto");
    			add_location(marker1, file$Y, 79, 8, 1839);
    			attr_dev(path2, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path2, "fill", "#6accb2");
    			attr_dev(path2, "transform", "rotate(23)");
    			attr_dev(path2, "class", "svelte-1lnhtnf");
    			add_location(path2, file$Y, 103, 10, 2459);
    			attr_dev(marker2, "id", "triangle3");
    			attr_dev(marker2, "viewBox", "0 0 10 10");
    			attr_dev(marker2, "refX", "4");
    			attr_dev(marker2, "refY", "6");
    			attr_dev(marker2, "markerUnits", "strokeWidth");
    			attr_dev(marker2, "markerWidth", "9");
    			attr_dev(marker2, "markerHeight", "9");
    			attr_dev(marker2, "orient", "auto");
    			add_location(marker2, file$Y, 94, 8, 2234);
    			add_location(defs, file$Y, 63, 6, 1430);
    			attr_dev(path3, "class", "link svelte-1lnhtnf");
    			attr_dev(path3, "d", "M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "fill", "#6699cc");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "marker-end", "url(#triangle2)");
    			add_location(path3, file$Y, 110, 6, 2641);
    			attr_dev(path4, "class", "link svelte-1lnhtnf");
    			attr_dev(path4, "d", "M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "fill", "#D68881");
    			attr_dev(path4, "stroke-width", "1");
    			attr_dev(path4, "marker-end", "url(#triangle)");
    			add_location(path4, file$Y, 117, 6, 2985);
    			attr_dev(path5, "class", "link svelte-1lnhtnf");
    			attr_dev(path5, "d", "M2.9632952534203763,33.87061973511935A34,34,0,0,0,33.87061973511935,2.9632952534203745L31.878230338935857,2.788983767925058A32,32,0,0,1,2.78898376792506,31.878230338935857Z");
    			attr_dev(path5, "stroke", "none");
    			attr_dev(path5, "fill", "#6accb2");
    			attr_dev(path5, "stroke-width", "1");
    			attr_dev(path5, "marker-end", "url(#triangle3)");
    			add_location(path5, file$Y, 126, 8, 3394);
    			set_style(g, "scale", "-1 1");
    			set_style(g, "transform", "translate(-70px, 6px)");
    			add_location(g, file$Y, 125, 6, 3327);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file$Y, 58, 4, 1304);
    			attr_dev(div8, "class", "col svelte-1v5aa7h");
    			set_style(div8, "transform", "scaleX(-1)");
    			set_style(div8, "height", "600px");
    			add_location(div8, file$Y, 56, 2, 1237);
    			attr_dev(div9, "class", "box");
    			set_style(div9, "position", "relative");
    			set_style(div9, "width", "100%");
    			add_location(div9, file$Y, 40, 0, 671);
    			add_location(li0, file$Y, 140, 2, 3805);
    			add_location(li1, file$Y, 141, 2, 3831);
    			add_location(li2, file$Y, 142, 2, 3856);
    			attr_dev(div10, "class", "notes");
    			add_location(div10, file$Y, 139, 0, 3783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div9, t3);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div9, t7);
    			append_dev(div9, div7);
    			append_dev(div7, span0);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div7, t11);
    			append_dev(div7, span1);
    			append_dev(div9, t13);
    			append_dev(div9, div8);
    			append_dev(div8, svg);
    			append_dev(svg, defs);
    			append_dev(defs, marker0);
    			append_dev(marker0, path0);
    			append_dev(defs, marker1);
    			append_dev(marker1, path1);
    			append_dev(defs, marker2);
    			append_dev(marker2, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, g);
    			append_dev(g, path5);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, li0);
    			append_dev(div10, t16);
    			append_dev(div10, li1);
    			append_dev(div10, t18);
    			append_dev(div10, li2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div10);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$11.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$11($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoopNLP> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoopNLP", $$slots, []);
    	return [];
    }

    class LoopNLP extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$11, create_fragment$11, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopNLP",
    			options,
    			id: create_fragment$11.name
    		});
    	}
    }

    /* src/02.markup/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$12(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$12.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$12($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;

    	let steps = [
    		Question$1,
    		Wikipedia,
    		MarkupQuestion,
    		Escaping,
    		// Newline,
    		Margin,
    		Glimpse,
    		Timeline_1$1,
    		Loop,
    		LoopPink,
    		LoopNLP
    	];

    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_02_markup> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_02_markup", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Question: Question$1,
    		Wikipedia,
    		Escaping,
    		MarkupQuestion,
    		Margin,
    		Glimpse,
    		Timeline: Timeline_1$1,
    		Loop,
    		LoopPink,
    		LoopNLP,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _02_markup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$12, create_fragment$12, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_02_markup",
    			options,
    			id: create_fragment$12.name
    		});
    	}

    	get done() {
    		throw new Error("<_02_markup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_02_markup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_02_markup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_02_markup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_02_markup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_02_markup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/03.word-wrap/Newline.svelte generated by Svelte v3.24.1 */

    const file$Z = "src/03.word-wrap/Newline.svelte";

    function create_fragment$13(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let li0;
    	let t2;
    	let i;
    	let t4;
    	let t5;
    	let li1;
    	let t7;
    	let li2;
    	let t9;
    	let li3;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "• − • −";
    			t1 = space();
    			div1 = element("div");
    			li0 = element("li");
    			t2 = text("morse\n    ");
    			i = element("i");
    			i.textContent = "'prosign'";
    			t4 = text("\n    - AA 'after all'");
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "punchcards had an overflow character";
    			t7 = space();
    			li2 = element("li");
    			li2.textContent = "typewriter RUNOFF";
    			t9 = space();
    			li3 = element("li");
    			li3.textContent = "there is no plaintext.";
    			attr_dev(div0, "class", "box f4 svelte-1d5z98v");
    			add_location(div0, file$Z, 11, 0, 99);
    			add_location(i, file$Z, 16, 4, 175);
    			add_location(li0, file$Z, 14, 2, 156);
    			add_location(li1, file$Z, 19, 2, 223);
    			add_location(li2, file$Z, 20, 2, 271);
    			add_location(li3, file$Z, 21, 2, 300);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$Z, 13, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, li0);
    			append_dev(li0, t2);
    			append_dev(li0, i);
    			append_dev(li0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, li1);
    			append_dev(div1, t7);
    			append_dev(div1, li2);
    			append_dev(div1, t9);
    			append_dev(div1, li3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$13.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$13($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Newline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Newline", $$slots, []);
    	return [];
    }

    class Newline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$13, create_fragment$13, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Newline",
    			options,
    			id: create_fragment$13.name
    		});
    	}
    }

    /* src/03.word-wrap/Spreadsheet.svelte generated by Svelte v3.24.1 */

    const file$_ = "src/03.word-wrap/Spreadsheet.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (60:4) {#each Array(cols) as _2, i2}
    function create_each_block_2(ctx) {
    	let div;
    	let t_value = (/*letters*/ ctx[3][/*i2*/ ctx[9]] || "") + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "cell top svelte-10qh3b4");
    			add_location(div, file$_, 60, 6, 1276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(60:4) {#each Array(cols) as _2, i2}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cell svelte-10qh3b4");
    			add_location(div, file$_, 69, 10, 1563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(69:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#if content[i] && content[i][i2]}
    function create_if_block$3(ctx) {
    	let div;
    	let t_value = /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "cell svelte-10qh3b4");
    			add_location(div, file$_, 67, 10, 1496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1 && t_value !== (t_value = /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(67:8) {#if content[i] && content[i][i2]}",
    		ctx
    	});

    	return block;
    }

    // (66:6) {#each Array(cols) as _2, i2}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*content*/ ctx[0][/*i*/ ctx[6]] && /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(66:6) {#each Array(cols) as _2, i2}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {#each Array(rows) as _, i}
    function create_each_block$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let each_value_1 = Array(/*cols*/ ctx[2]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*i*/ ctx[6]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "cell num svelte-10qh3b4");
    			add_location(div, file$_, 64, 6, 1375);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1) {
    				each_value_1 = Array(/*cols*/ ctx[2]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(64:4) {#each Array(rows) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$14(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div3;
    	let li;
    	let each_value_2 = Array(/*cols*/ ctx[2]);
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Array(/*rows*/ ctx[1]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div3 = element("div");
    			li = element("li");
    			li.textContent = "typewriter was 2D (carriage+scroll)";
    			attr_dev(div0, "class", "cell num top svelte-10qh3b4");
    			add_location(div0, file$_, 58, 4, 1207);
    			attr_dev(div1, "class", "container svelte-10qh3b4");
    			add_location(div1, file$_, 56, 2, 1158);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$_, 55, 0, 1138);
    			add_location(li, file$_, 77, 2, 1663);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$_, 76, 0, 1641);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, li);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*letters*/ 8) {
    				each_value_2 = Array(/*cols*/ ctx[2]);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t1);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*Array, cols, content*/ 5) {
    				each_value = Array(/*rows*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$14.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$14($$self, $$props, $$invalidate) {
    	let rows = 14;
    	let cols = 22;

    	let content = [
    		"",
    		" in west philadelphia",
    		" born and raised,",
    		" on the playground",
    		" is where I spent",
    		" most of my days."
    	];

    	content = content.map(str => str.split(""));
    	let letters = ("abcdefghijklmnopqrstuv").split("");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spreadsheet> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spreadsheet", $$slots, []);
    	$$self.$capture_state = () => ({ rows, cols, content, letters });

    	$$self.$inject_state = $$props => {
    		if ("rows" in $$props) $$invalidate(1, rows = $$props.rows);
    		if ("cols" in $$props) $$invalidate(2, cols = $$props.cols);
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("letters" in $$props) $$invalidate(3, letters = $$props.letters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, rows, cols, letters];
    }

    class Spreadsheet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$14, create_fragment$14, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spreadsheet",
    			options,
    			id: create_fragment$14.name
    		});
    	}
    }

    /* src/03.word-wrap/Wrap.svelte generated by Svelte v3.24.1 */
    const file$$ = "src/03.word-wrap/Wrap.svelte";

    function create_fragment$15(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$$, 13, 0, 215);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$15.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$15($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/03.word-wrap/assets/word-wrap.mp4",
    		loop: true
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wrap", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$15, create_fragment$15, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap",
    			options,
    			id: create_fragment$15.name
    		});
    	}
    }

    /* src/03.word-wrap/Insert.svelte generated by Svelte v3.24.1 */
    const file$10 = "src/03.word-wrap/Insert.svelte";

    function create_fragment$16(ctx) {
    	let div;
    	let image;
    	let current;
    	const image_spread_levels = [/*images*/ ctx[1][/*i*/ ctx[0]]];
    	let image_props = {};

    	for (let i = 0; i < image_spread_levels.length; i += 1) {
    		image_props = assign(image_props, image_spread_levels[i]);
    	}

    	image = new Image({ props: image_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(image.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$10, 21, 0, 324);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(image, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_changes = (dirty & /*images, i*/ 3)
    			? get_spread_update(image_spread_levels, [get_spread_object(/*images*/ ctx[1][/*i*/ ctx[0]])])
    			: {};

    			image.$set(image_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(image);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$16.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$16($$self, $$props, $$invalidate) {
    	let images = [
    		{
    			src: "./src/03.word-wrap/assets/insert-1.png"
    		},
    		{
    			src: "./src/03.word-wrap/assets/insert-2.png"
    		}
    	];

    	let i = 0;

    	wait(1, () => {
    		$$invalidate(0, i += 1);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Insert> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Insert", $$slots, []);
    	$$self.$capture_state = () => ({ Image, wait, images, i });

    	$$self.$inject_state = $$props => {
    		if ("images" in $$props) $$invalidate(1, images = $$props.images);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, images];
    }

    class Insert extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$16, create_fragment$16, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Insert",
    			options,
    			id: create_fragment$16.name
    		});
    	}
    }

    /* src/03.word-wrap/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$17(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$17.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$17($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Newline, Spreadsheet, Wrap, Insert];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_03_word_wrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_03_word_wrap", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Newline,
    		Spreadsheet,
    		Wrap1: Wrap,
    		Insert,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _03_word_wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$17, create_fragment$17, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_03_word_wrap",
    			options,
    			id: create_fragment$17.name
    		});
    	}

    	get done() {
    		throw new Error("<_03_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_03_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_03_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_03_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_03_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_03_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/04.text-editor/Drake.svelte generated by Svelte v3.24.1 */
    const file$11 = "src/04.text-editor/Drake.svelte";

    function create_fragment$18(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$11, 12, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$18.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$18($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/04.text-editor/assets/drake.mp4"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Drake> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Drake", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Drake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$18, create_fragment$18, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drake",
    			options,
    			id: create_fragment$18.name
    		});
    	}
    }

    /* src/04.text-editor/Timeline.svelte generated by Svelte v3.24.1 */

    const file$12 = "src/04.text-editor/Timeline.svelte";

    function create_fragment$19(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let t1;
    	let li;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			t1 = space();
    			li = element("li");
    			attr_dev(img, "class", "img svelte-1cxyf7j");
    			if (img.src !== (img_src_value = "./src/04.text-editor/assets/refactoring-timeline.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$12, 36, 4, 880);
    			attr_dev(div0, "class", "middle svelte-1cxyf7j");
    			add_location(div0, file$12, 35, 2, 855);
    			attr_dev(div1, "class", "box ");
    			add_location(div1, file$12, 34, 0, 834);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$12, 64, 0, 1610);
    			add_location(li, file$12, 65, 0, 1632);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, li, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$19.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$19($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);
    	return [];
    }

    class Timeline$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$19, create_fragment$19, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$19.name
    		});
    	}
    }

    /* src/04.text-editor/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$1a(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1a($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Drake, Timeline$1];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_04_text_editor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_04_text_editor", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Drake,
    		Timeline: Timeline$1,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _04_text_editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1a, create_fragment$1a, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_04_text_editor",
    			options,
    			id: create_fragment$1a.name
    		});
    	}

    	get done() {
    		throw new Error("<_04_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_04_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_04_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_04_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_04_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_04_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/05.focus/Zelda.svelte generated by Svelte v3.24.1 */
    const file$13 = "src/05.focus/Zelda.svelte";

    function create_fragment$1b(ctx) {
    	let div;
    	let video_1;
    	let current;
    	const video_1_spread_levels = [/*video*/ ctx[0]];
    	let video_1_props = {};

    	for (let i = 0; i < video_1_spread_levels.length; i += 1) {
    		video_1_props = assign(video_1_props, video_1_spread_levels[i]);
    	}

    	video_1 = new Video({ props: video_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$13, 12, 0, 193);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_1_changes = (dirty & /*video*/ 1)
    			? get_spread_update(video_1_spread_levels, [get_spread_object(/*video*/ ctx[0])])
    			: {};

    			video_1.$set(video_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1b($$self, $$props, $$invalidate) {
    	let video = { src: "./src/05.focus/assets/zelda-2.mp4" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Zelda> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Zelda", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, video });

    	$$self.$inject_state = $$props => {
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [video];
    }

    class Zelda extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1b, create_fragment$1b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zelda",
    			options,
    			id: create_fragment$1b.name
    		});
    	}
    }

    /* src/05.focus/Canon-cat.svelte generated by Svelte v3.24.1 */
    const file$14 = "src/05.focus/Canon-cat.svelte";

    function create_fragment$1c(ctx) {
    	let div;
    	let image_1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(image_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$14, 9, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(image_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(image_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1c($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/05.focus/assets/canon-cat.jpg",
    		title: "Canon Cat",
    		sub: "by Jef Raskin"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Canon_cat> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Canon_cat", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Canon_cat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1c, create_fragment$1c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canon_cat",
    			options,
    			id: create_fragment$1c.name
    		});
    	}
    }

    /* src/05.focus/Spicer.svelte generated by Svelte v3.24.1 */
    const file$15 = "src/05.focus/Spicer.svelte";

    function create_fragment$1d(ctx) {
    	let div;
    	let image_1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(image_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$15, 7, 0, 133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(image_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(image_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1d($$self, $$props, $$invalidate) {
    	let image = { src: "./src/05.focus/assets/spicer.png" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Spicer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Spicer", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Spicer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1d, create_fragment$1d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spicer",
    			options,
    			id: create_fragment$1d.name
    		});
    	}
    }

    /* src/05.focus/Quake.svelte generated by Svelte v3.24.1 */
    const file$16 = "src/05.focus/Quake.svelte";

    function create_fragment$1e(ctx) {
    	let div;
    	let image_1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0]];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(image_1.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$16, 9, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(image_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0])])
    			: {};

    			image_1.$set(image_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(image_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1e($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/05.focus/assets/quake-wide.png",
    		title: "Quake",
    		sub: "id Software - 1996"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Quake> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Quake", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Quake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1e, create_fragment$1e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quake",
    			options,
    			id: create_fragment$1e.name
    		});
    	}
    }

    /* src/05.focus/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$1f(ctx) {
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "keydown", /*spaceBar*/ ctx[2], false, false, false),
    					listen_dev(document.body, "click", /*onClick*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (switch_value !== (switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1f($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Spicer, Zelda, Canon_cat, Quake];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	const spaceBar = function (e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	};

    	const onClick = function () {
    		$$invalidate(0, i += 1);

    		if (!steps[i]) {
    			done();
    		}
    	};

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_05_focus> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_05_focus", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Zelda,
    		CanonCat: Canon_cat,
    		Spicer,
    		Quake,
    		steps,
    		i,
    		spaceBar,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(4, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(5, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(6, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, onClick, done, prev, doEnd];
    }

    class _05_focus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1f, create_fragment$1f, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_05_focus",
    			options,
    			id: create_fragment$1f.name
    		});
    	}

    	get done() {
    		throw new Error("<_05_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_05_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_05_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_05_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_05_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_05_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/End.svelte generated by Svelte v3.24.1 */
    const file$17 = "src/End.svelte";

    function create_fragment$1g(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t2;
    	let div3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "@spencermountain";
    			t2 = space();
    			div3 = element("div");
    			set_style(img, "width", "250px");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/cn-tower.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$17, 18, 4, 309);
    			add_location(div0, file$17, 19, 4, 390);
    			attr_dev(div1, "class", "row svelte-1mnnj7d");
    			add_location(div1, file$17, 17, 2, 287);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$17, 16, 0, 267);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$17, 22, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<End> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("End", $$slots, []);
    	$$self.$capture_state = () => ({ Image });
    	return [];
    }

    class End extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1g, create_fragment$1g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "End",
    			options,
    			id: create_fragment$1g.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file$18 = "src/App.svelte";

    function create_fragment$1h(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let t11;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*steps*/ ctx[2][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return {
    			props: {
    				done: /*done*/ ctx[4],
    				prev: /*prev*/ ctx[3],
    				doEnd: /*doEnd*/ ctx[1]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("part: ");
    			t1 = text(/*i*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "intro";
    			option1 = element("option");
    			option1.textContent = "keyboards";
    			option2 = element("option");
    			option2.textContent = "typing";
    			option3 = element("option");
    			option3.textContent = "punctuation";
    			option4 = element("option");
    			option4.textContent = "markup";
    			option5 = element("option");
    			option5.textContent = "wrapping";
    			option6 = element("option");
    			option6.textContent = "text-editor";
    			option7 = element("option");
    			option7.textContent = "focus";
    			t11 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(div0, file$18, 54, 0, 1120);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$18, 61, 4, 1268);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$18, 62, 4, 1305);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$18, 63, 4, 1346);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$18, 64, 4, 1384);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$18, 65, 4, 1427);
    			option5.__value = "5";
    			option5.value = option5.__value;
    			add_location(option5, file$18, 66, 4, 1465);
    			option6.__value = "6";
    			option6.value = option6.__value;
    			add_location(option6, file$18, 67, 4, 1505);
    			option7.__value = "7";
    			option7.value = option7.__value;
    			add_location(option7, file$18, 68, 4, 1548);
    			if (/*i*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file$18, 56, 2, 1149);
    			add_location(div1, file$18, 55, 0, 1141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			append_dev(select, option7);
    			select_option(select, /*i*/ ctx[0]);
    			insert_dev(target, t11, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[6]),
    					listen_dev(select, "click", click_handler, false, false, false),
    					listen_dev(select, "change", /*changeIt*/ ctx[5], false, false, false),
    					listen_dev(select, "blur", blur_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*i*/ 1) set_data_dev(t1, /*i*/ ctx[0]);

    			if (dirty & /*i*/ 1) {
    				select_option(select, /*i*/ ctx[0]);
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*doEnd*/ 2) switch_instance_changes.doEnd = /*doEnd*/ ctx[1];

    			if (switch_value !== (switch_value = /*steps*/ ctx[2][/*i*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = e => e.preventDefault();

    const blur_handler = () => {
    	
    };

    function instance$1h($$self, $$props, $$invalidate) {
    	setContext("size", { width: 1280, height: 720 });
    	let i = 0;

    	let steps = [
    		Start,
    		_00_intro,
    		_01_keyboards,
    		_01_typing,
    		_01_punctuation,
    		_02_markup,
    		_03_word_wrap,
    		_04_text_editor,
    		_05_focus,
    		End
    	];

    	let doEnd = false;

    	function prev() {
    		if (i > 0) {
    			$$invalidate(0, i -= 1);
    		}

    		$$invalidate(0, i = i < 0 ? 0 : i); // dont go under 0
    		$$invalidate(1, doEnd = true);
    	}

    	function done() {
    		if (steps[i + 1]) {
    			$$invalidate(0, i += 1);
    		} else {
    			console.log("done");
    		}

    		$$invalidate(1, doEnd = false);
    	}

    	function changeIt(e) {
    		$$invalidate(0, i = parseInt(e.target.value, 10));
    		e.preventDefault();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function select_change_handler() {
    		i = select_value(this);
    		$$invalidate(0, i);
    	}

    	$$self.$capture_state = () => ({
    		setContext,
    		Start,
    		Intro: _00_intro,
    		Keyboards: _01_keyboards,
    		Typing: _01_typing,
    		Punctuation: _01_punctuation,
    		Markup: _02_markup,
    		Wrapping: _03_word_wrap,
    		TextEditor: _04_text_editor,
    		Focus: _05_focus,
    		End,
    		i,
    		steps,
    		doEnd,
    		prev,
    		done,
    		changeIt
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    		if ("steps" in $$props) $$invalidate(2, steps = $$props.steps);
    		if ("doEnd" in $$props) $$invalidate(1, doEnd = $$props.doEnd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, doEnd, steps, prev, done, changeIt, select_change_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1h, create_fragment$1h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1h.name
    		});
    	}
    }

    var app = new App({
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
