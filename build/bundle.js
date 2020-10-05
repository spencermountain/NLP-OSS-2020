
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
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
    			if (img0.src !== (img0_src_value = "./src/00.intro/assets/wolfram-desk.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file, 30, 8, 503);
    			attr_dev(div0, "class", "square svelte-153lcxt");
    			add_location(div0, file, 29, 6, 474);
    			set_style(img1, "height", "320px");
    			if (img1.src !== (img1_src_value = "./src/02.markup/assets/injection.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file, 36, 8, 662);
    			attr_dev(div1, "class", "square svelte-153lcxt");
    			add_location(div1, file, 35, 6, 633);
    			attr_dev(div2, "class", "row svelte-153lcxt");
    			add_location(div2, file, 28, 4, 450);
    			set_style(img2, "width", "450px");
    			if (img2.src !== (img2_src_value = "./src/00.intro/assets/splash.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file, 45, 8, 854);
    			attr_dev(div3, "class", "square svelte-153lcxt");
    			add_location(div3, file, 44, 6, 825);
    			attr_dev(span, "class", "blue ");
    			add_location(span, file, 54, 10, 1078);
    			attr_dev(div4, "class", "f1");
    			add_location(div4, file, 52, 8, 1028);
    			attr_dev(div5, "class", "square f4 svelte-153lcxt");
    			add_location(div5, file, 50, 6, 978);
    			attr_dev(div6, "class", "row svelte-153lcxt");
    			add_location(div6, file, 43, 4, 801);
    			attr_dev(div7, "class", "container svelte-153lcxt");
    			add_location(div7, file, 27, 2, 422);
    			attr_dev(div8, "class", "box");
    			add_location(div8, file, 26, 0, 402);
    			attr_dev(div9, "class", "notes");
    			add_location(div9, file, 60, 0, 1177);
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

    // (41:0) {#if title}
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
    			attr_dev(div0, "class", "title svelte-r15mc1");
    			add_location(div0, file$9, 42, 4, 712);
    			attr_dev(div1, "class", "sub svelte-r15mc1");
    			add_location(div1, file$9, 43, 4, 749);
    			attr_dev(div2, "class", "caption svelte-r15mc1");
    			add_location(div2, file$9, 41, 2, 686);
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
    		source: "(41:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let t;
    	let video;
    	let track;
    	let video_src_value;
    	let if_block = /*title*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			video = element("video");
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$9, 47, 2, 859);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.loop = /*loop*/ ctx[3];
    			video.autoplay = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-r15mc1");
    			add_location(video, file$9, 46, 0, 793);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, video, anchor);
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
    			if (detaching) detach_dev(video);
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
    	let div0;
    	let video_1;
    	let t0;
    	let div1;
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
    			div0 = element("div");
    			create_component(video_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			li0 = element("li");
    			li0.textContent = "bicyle for the mind";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "smooth and comfortable fig skating routine";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "how much of this is the keyboard?";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$f, 13, 0, 211);
    			add_location(li0, file$f, 17, 2, 281);
    			add_location(li1, file$f, 18, 2, 312);
    			add_location(li2, file$f, 19, 2, 366);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$f, 16, 0, 259);
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
    			append_dev(div1, t4);
    			append_dev(div1, li2);
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
    			if (detaching) detach_dev(div0);
    			destroy_component(video_1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
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

    /* src/01.keyboards/NowCLI.svelte generated by Svelte v3.24.1 */
    const file$q = "src/01.keyboards/NowCLI.svelte";

    function create_fragment$r(ctx) {
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
    			add_location(div, file$q, 13, 0, 250);
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
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/01.keyboards/assets/now-cli.mp4",
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
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NowCLI",
    			options,
    			id: create_fragment$r.name
    		});
    	}
    }

    /* src/01.keyboards/LoveTyping.svelte generated by Svelte v3.24.1 */
    const file$r = "src/01.keyboards/LoveTyping.svelte";

    function create_fragment$s(ctx) {
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
    			add_location(div0, file$r, 7, 0, 142);
    			add_location(li0, file$r, 12, 2, 213);
    			add_location(li1, file$r, 13, 2, 246);
    			add_location(li2, file$r, 14, 2, 276);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$r, 11, 0, 191);
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/01.keyboards/assets/kids-typing.jpg"
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
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoveTyping",
    			options,
    			id: create_fragment$s.name
    		});
    	}
    }

    /* src/01.keyboards/Typewriter.svelte generated by Svelte v3.24.1 */
    const file$s = "src/01.keyboards/Typewriter.svelte";

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
    			li0.textContent = "we romanticize them, but hellish";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "undiagnosed domestic pain - defines modern working conditions";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "professionalism";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$s, 7, 0, 141);
    			add_location(li0, file$s, 12, 2, 212);
    			add_location(li1, file$s, 13, 2, 256);
    			add_location(li2, file$s, 14, 2, 329);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$s, 11, 0, 190);
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
    		src: "./src/01.keyboards/assets/typewriter.jpg"
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
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/01.keyboards/TypewriterMag.svelte generated by Svelte v3.24.1 */

    const file$t = "src/01.keyboards/TypewriterMag.svelte";

    function create_fragment$u(ctx) {
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
    			div1.textContent = "“i used to get nervous at the end of the page”";
    			t2 = space();
    			div4 = element("div");
    			li0 = element("li");
    			li0.textContent = "IBM Selectric Magnetic tape";
    			t4 = space();
    			li1 = element("li");
    			li1.textContent = "re-played a page like a player-piano";
    			if (img.src !== (img_src_value = "./src/01.keyboards/assets/mag-type.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "300px;");
    			add_location(img, file$t, 19, 6, 309);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$t, 18, 4, 288);
    			set_style(div1, "width", "300px");
    			set_style(div1, "font-size", "1.4rem");
    			attr_dev(div1, "class", "");
    			add_location(div1, file$t, 21, 4, 399);
    			attr_dev(div2, "class", "row svelte-ssqihk");
    			add_location(div2, file$t, 17, 2, 266);
    			attr_dev(div3, "class", "box");
    			add_location(div3, file$t, 16, 0, 246);
    			add_location(li0, file$t, 27, 2, 555);
    			add_location(li1, file$t, 28, 2, 594);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$t, 26, 0, 533);
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
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props) {
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
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TypewriterMag",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/01.keyboards/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$v(ctx) {
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
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
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
    		LoveTyping,
    		NowCLI,
    		Typewriter,
    		TypewriterMag
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
    		NowCLI,
    		LoveTyping,
    		Typewriter,
    		TypewriterMag,
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
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_keyboards",
    			options,
    			id: create_fragment$v.name
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
    const file$u = "Users/spencer/mountain/somehow-keyboard/src/Keyboard.svelte";

    function create_fragment$w(ctx) {
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
    			add_location(div0, file$u, 59, 4, 1212);
    			attr_dev(div1, "class", "key svelte-s6zq7o");
    			set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			set_style(div1, "opacity", /*$keys*/ ctx[2]["1"].opacity);
    			toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			add_location(div1, file$u, 65, 4, 1407);
    			attr_dev(div2, "class", "key svelte-s6zq7o");
    			set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			set_style(div2, "opacity", /*$keys*/ ctx[2]["2"].opacity);
    			toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			add_location(div2, file$u, 71, 4, 1593);
    			attr_dev(div3, "class", "key svelte-s6zq7o");
    			set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			set_style(div3, "opacity", /*$keys*/ ctx[2]["3"].opacity);
    			toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			add_location(div3, file$u, 77, 4, 1779);
    			attr_dev(div4, "class", "key svelte-s6zq7o");
    			set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			set_style(div4, "opacity", /*$keys*/ ctx[2]["4"].opacity);
    			toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			add_location(div4, file$u, 83, 4, 1965);
    			attr_dev(div5, "class", "key svelte-s6zq7o");
    			set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			set_style(div5, "opacity", /*$keys*/ ctx[2]["5"].opacity);
    			toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			add_location(div5, file$u, 89, 4, 2151);
    			attr_dev(div6, "class", "key svelte-s6zq7o");
    			set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			set_style(div6, "opacity", /*$keys*/ ctx[2]["6"].opacity);
    			toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			add_location(div6, file$u, 95, 4, 2337);
    			attr_dev(div7, "class", "key svelte-s6zq7o");
    			set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			set_style(div7, "opacity", /*$keys*/ ctx[2]["7"].opacity);
    			toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			add_location(div7, file$u, 101, 4, 2523);
    			attr_dev(div8, "class", "key svelte-s6zq7o");
    			set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			set_style(div8, "opacity", /*$keys*/ ctx[2]["8"].opacity);
    			toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			add_location(div8, file$u, 107, 4, 2709);
    			attr_dev(div9, "class", "key svelte-s6zq7o");
    			set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			set_style(div9, "opacity", /*$keys*/ ctx[2]["9"].opacity);
    			toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			add_location(div9, file$u, 113, 4, 2895);
    			attr_dev(div10, "class", "key svelte-s6zq7o");
    			set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			set_style(div10, "opacity", /*$keys*/ ctx[2]["0"].opacity);
    			toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			add_location(div10, file$u, 119, 4, 3081);
    			attr_dev(div11, "class", "key svelte-s6zq7o");
    			set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			set_style(div11, "opacity", /*$keys*/ ctx[2]["-"].opacity);
    			toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			add_location(div11, file$u, 125, 4, 3267);
    			attr_dev(div12, "class", "key svelte-s6zq7o");
    			set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			set_style(div12, "opacity", /*$keys*/ ctx[2]["="].opacity);
    			toggle_class(div12, "show", /*$keys*/ ctx[2]["="].color);
    			add_location(div12, file$u, 131, 4, 3453);
    			attr_dev(div13, "class", "key svelte-s6zq7o");
    			set_style(div13, "background-color", /*$keys*/ ctx[2]["del"].color);
    			set_style(div13, "opacity", /*$keys*/ ctx[2]["del"].opacity);
    			set_style(div13, "flex", "1.5");
    			toggle_class(div13, "show", /*$keys*/ ctx[2]["del"].color);
    			add_location(div13, file$u, 137, 4, 3639);
    			attr_dev(div14, "class", "row svelte-s6zq7o");
    			add_location(div14, file$u, 58, 2, 1190);
    			attr_dev(div15, "class", "key svelte-s6zq7o");
    			set_style(div15, "background-color", /*$keys*/ ctx[2]["tab"].color);
    			set_style(div15, "opacity", /*$keys*/ ctx[2]["tab"].opacity);
    			toggle_class(div15, "show", /*$keys*/ ctx[2]["tab"].color);
    			add_location(div15, file$u, 145, 4, 3872);
    			attr_dev(div16, "class", "key svelte-s6zq7o");
    			set_style(div16, "background-color", /*$keys*/ ctx[2]["q"].color);
    			set_style(div16, "opacity", /*$keys*/ ctx[2]["q"].opacity);
    			toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			add_location(div16, file$u, 151, 4, 4066);
    			attr_dev(div17, "class", "key svelte-s6zq7o");
    			set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			set_style(div17, "opacity", /*$keys*/ ctx[2]["w"].opacity);
    			toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			add_location(div17, file$u, 157, 4, 4252);
    			attr_dev(div18, "class", "key svelte-s6zq7o");
    			set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			set_style(div18, "opacity", /*$keys*/ ctx[2]["e"].opacity);
    			toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			add_location(div18, file$u, 163, 4, 4438);
    			attr_dev(div19, "class", "key svelte-s6zq7o");
    			set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			set_style(div19, "opacity", /*$keys*/ ctx[2]["r"].opacity);
    			toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			add_location(div19, file$u, 169, 4, 4624);
    			attr_dev(div20, "class", "key svelte-s6zq7o");
    			set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			set_style(div20, "opacity", /*$keys*/ ctx[2]["t"].opacity);
    			toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			add_location(div20, file$u, 175, 4, 4810);
    			attr_dev(div21, "class", "key svelte-s6zq7o");
    			set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			set_style(div21, "opacity", /*$keys*/ ctx[2]["y"].opacity);
    			toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			add_location(div21, file$u, 181, 4, 4996);
    			attr_dev(div22, "class", "key svelte-s6zq7o");
    			set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			set_style(div22, "opacity", /*$keys*/ ctx[2]["u"].opacity);
    			toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			add_location(div22, file$u, 187, 4, 5182);
    			attr_dev(div23, "class", "key svelte-s6zq7o");
    			set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			set_style(div23, "opacity", /*$keys*/ ctx[2]["i"].opacity);
    			toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			add_location(div23, file$u, 193, 4, 5368);
    			attr_dev(div24, "class", "key svelte-s6zq7o");
    			set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			set_style(div24, "opacity", /*$keys*/ ctx[2]["o"].opacity);
    			toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			add_location(div24, file$u, 199, 4, 5554);
    			attr_dev(div25, "class", "key svelte-s6zq7o");
    			set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			set_style(div25, "opacity", /*$keys*/ ctx[2]["p"].opacity);
    			toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			add_location(div25, file$u, 205, 4, 5740);
    			attr_dev(div26, "class", "key svelte-s6zq7o");
    			set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			set_style(div26, "opacity", /*$keys*/ ctx[2]["["].opacity);
    			toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			add_location(div26, file$u, 211, 4, 5926);
    			attr_dev(div27, "class", "key svelte-s6zq7o");
    			set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			set_style(div27, "opacity", /*$keys*/ ctx[2]["]"].opacity);
    			toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			add_location(div27, file$u, 217, 4, 6112);
    			attr_dev(div28, "class", "key svelte-s6zq7o");
    			set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			set_style(div28, "opacity", /*$keys*/ ctx[2]["\\"].opacity);
    			toggle_class(div28, "show", /*$keys*/ ctx[2]["\\"].color);
    			add_location(div28, file$u, 223, 4, 6298);
    			attr_dev(div29, "class", "row svelte-s6zq7o");
    			add_location(div29, file$u, 144, 2, 3850);
    			attr_dev(div30, "class", "key svelte-s6zq7o");
    			set_style(div30, "background-color", /*$keys*/ ctx[2]["caps"].color);
    			set_style(div30, "opacity", /*$keys*/ ctx[2]["caps"].opacity);
    			set_style(div30, "flex", "1.6");
    			toggle_class(div30, "show", /*$keys*/ ctx[2]["caps"].color);
    			add_location(div30, file$u, 231, 4, 6517);
    			attr_dev(div31, "class", "key svelte-s6zq7o");
    			set_style(div31, "background-color", /*$keys*/ ctx[2]["a"].color);
    			set_style(div31, "opacity", /*$keys*/ ctx[2]["a"].opacity);
    			toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			add_location(div31, file$u, 237, 4, 6725);
    			attr_dev(div32, "class", "key svelte-s6zq7o");
    			set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			set_style(div32, "opacity", /*$keys*/ ctx[2]["s"].opacity);
    			toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			add_location(div32, file$u, 243, 4, 6911);
    			attr_dev(div33, "class", "key svelte-s6zq7o");
    			set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			set_style(div33, "opacity", /*$keys*/ ctx[2]["d"].opacity);
    			toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			add_location(div33, file$u, 249, 4, 7097);
    			attr_dev(div34, "class", "key svelte-s6zq7o");
    			set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			set_style(div34, "opacity", /*$keys*/ ctx[2]["f"].opacity);
    			toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			add_location(div34, file$u, 255, 4, 7283);
    			attr_dev(div35, "class", "key svelte-s6zq7o");
    			set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			set_style(div35, "opacity", /*$keys*/ ctx[2]["g"].opacity);
    			toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			add_location(div35, file$u, 261, 4, 7469);
    			attr_dev(div36, "class", "key svelte-s6zq7o");
    			set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			set_style(div36, "opacity", /*$keys*/ ctx[2]["h"].opacity);
    			toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			add_location(div36, file$u, 267, 4, 7655);
    			attr_dev(div37, "class", "key svelte-s6zq7o");
    			set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			set_style(div37, "opacity", /*$keys*/ ctx[2]["j"].opacity);
    			toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			add_location(div37, file$u, 273, 4, 7841);
    			attr_dev(div38, "class", "key svelte-s6zq7o");
    			set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			set_style(div38, "opacity", /*$keys*/ ctx[2]["k"].opacity);
    			toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			add_location(div38, file$u, 279, 4, 8028);
    			attr_dev(div39, "class", "key svelte-s6zq7o");
    			set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			set_style(div39, "opacity", /*$keys*/ ctx[2]["l"].opacity);
    			toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			add_location(div39, file$u, 285, 4, 8214);
    			attr_dev(div40, "class", "key svelte-s6zq7o");
    			set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			set_style(div40, "opacity", /*$keys*/ ctx[2][";"].opacity);
    			toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			add_location(div40, file$u, 291, 4, 8400);
    			attr_dev(div41, "class", "key svelte-s6zq7o");
    			set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			set_style(div41, "opacity", /*$keys*/ ctx[2]["'"].opacity);
    			toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			add_location(div41, file$u, 297, 4, 8586);
    			attr_dev(div42, "class", "key svelte-s6zq7o");
    			set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			set_style(div42, "flex", "1.6");
    			toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			add_location(div42, file$u, 303, 4, 8772);
    			attr_dev(div43, "class", "row svelte-s6zq7o");
    			add_location(div43, file$u, 230, 2, 6495);
    			attr_dev(div44, "class", "key svelte-s6zq7o");
    			set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			set_style(div44, "flex", "2.2");
    			toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			add_location(div44, file$u, 311, 4, 9013);
    			attr_dev(div45, "class", "key svelte-s6zq7o");
    			set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			set_style(div45, "opacity", /*$keys*/ ctx[2]["z"].opacity);
    			toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			add_location(div45, file$u, 317, 4, 9229);
    			attr_dev(div46, "class", "key svelte-s6zq7o");
    			set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			set_style(div46, "opacity", /*$keys*/ ctx[2]["x"].opacity);
    			toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			add_location(div46, file$u, 323, 4, 9414);
    			attr_dev(div47, "class", "key svelte-s6zq7o");
    			set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			set_style(div47, "opacity", /*$keys*/ ctx[2]["c"].opacity);
    			toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			add_location(div47, file$u, 329, 4, 9599);
    			attr_dev(div48, "class", "key svelte-s6zq7o");
    			set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			set_style(div48, "opacity", /*$keys*/ ctx[2]["v"].opacity);
    			toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			add_location(div48, file$u, 335, 4, 9784);
    			attr_dev(div49, "class", "key svelte-s6zq7o");
    			set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			set_style(div49, "opacity", /*$keys*/ ctx[2]["b"].opacity);
    			toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			add_location(div49, file$u, 341, 4, 9969);
    			attr_dev(div50, "class", "key svelte-s6zq7o");
    			set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			set_style(div50, "opacity", /*$keys*/ ctx[2]["n"].opacity);
    			toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			add_location(div50, file$u, 347, 4, 10154);
    			attr_dev(div51, "class", "key svelte-s6zq7o");
    			set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			set_style(div51, "opacity", /*$keys*/ ctx[2]["m"].opacity);
    			toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			add_location(div51, file$u, 353, 4, 10339);
    			attr_dev(div52, "class", "key svelte-s6zq7o");
    			set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			set_style(div52, "opacity", /*$keys*/ ctx[2][","].opacity);
    			toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			add_location(div52, file$u, 359, 4, 10524);
    			attr_dev(div53, "class", "key svelte-s6zq7o");
    			set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			set_style(div53, "opacity", /*$keys*/ ctx[2]["."].opacity);
    			toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			add_location(div53, file$u, 365, 4, 10709);
    			attr_dev(div54, "class", "key svelte-s6zq7o");
    			set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			set_style(div54, "opacity", /*$keys*/ ctx[2]["/"].opacity);
    			toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			add_location(div54, file$u, 371, 4, 10894);
    			attr_dev(div55, "class", "key svelte-s6zq7o");
    			set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			set_style(div55, "flex", "2.2");
    			toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			add_location(div55, file$u, 377, 4, 11079);
    			attr_dev(div56, "class", "row svelte-s6zq7o");
    			add_location(div56, file$u, 310, 2, 8991);
    			attr_dev(div57, "class", "key svelte-s6zq7o");
    			set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			set_style(div57, "flex", "1.4");
    			toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			add_location(div57, file$u, 385, 4, 11324);
    			attr_dev(div58, "class", "key svelte-s6zq7o");
    			set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			set_style(div58, "flex", "1.4");
    			toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			add_location(div58, file$u, 391, 4, 11536);
    			attr_dev(div59, "class", "key svelte-s6zq7o");
    			set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			set_style(div59, "flex", "1.4");
    			toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			add_location(div59, file$u, 397, 4, 11744);
    			attr_dev(div60, "class", "key svelte-s6zq7o");
    			set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			set_style(div60, "flex", "6.8");
    			toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			add_location(div60, file$u, 403, 4, 11952);
    			attr_dev(div61, "class", "key svelte-s6zq7o");
    			set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			set_style(div61, "flex", "1.4");
    			toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			add_location(div61, file$u, 409, 4, 12164);
    			attr_dev(div62, "class", "key svelte-s6zq7o");
    			set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			set_style(div62, "flex", "1.4");
    			toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			add_location(div62, file$u, 415, 4, 12372);
    			attr_dev(div63, "class", "key svelte-s6zq7o");
    			set_style(div63, "background-color", /*$keys*/ ctx[2]["rctrl"].color);
    			set_style(div63, "opacity", /*$keys*/ ctx[2]["rctrl"].opacity);
    			set_style(div63, "flex", "1.4");
    			toggle_class(div63, "show", /*$keys*/ ctx[2]["rctrl"].color);
    			add_location(div63, file$u, 421, 4, 12580);
    			attr_dev(div64, "class", "row svelte-s6zq7o");
    			add_location(div64, file$u, 384, 2, 11302);
    			attr_dev(div65, "class", "container svelte-s6zq7o");
    			set_style(div65, "max-height", /*height*/ ctx[1] + "px");
    			add_render_callback(() => /*div65_elementresize_handler*/ ctx[5].call(div65));
    			add_location(div65, file$u, 57, 0, 1112);
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
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$w.name
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

    function create_fragment$x(ctx) {
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
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {
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
    			id: create_fragment$x.name
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

    const file$v = "src/01.punctuation/Keyboard.1.svelte";

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

    function create_fragment$y(ctx) {
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
    			add_location(div0, file$v, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$v, 20, 0, 348);
    			add_location(li0, file$v, 41, 2, 961);
    			add_location(li1, file$v, 42, 2, 994);
    			add_location(li2, file$v, 43, 2, 1047);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$v, 40, 0, 939);
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
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_1",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src/01.punctuation/Keyboard.2.svelte generated by Svelte v3.24.1 */

    const file$w = "src/01.punctuation/Keyboard.2.svelte";

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

    function create_fragment$z(ctx) {
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
    			add_location(div0, file$w, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$w, 20, 0, 348);
    			add_location(li0, file$w, 64, 2, 2048);
    			add_location(li1, file$w, 65, 2, 2090);
    			add_location(li2, file$w, 66, 2, 2137);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$w, 63, 0, 2026);
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
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$z($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_2",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/01.punctuation/Keyboard.3.svelte generated by Svelte v3.24.1 */

    const file$x = "src/01.punctuation/Keyboard.3.svelte";

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

    function create_fragment$A(ctx) {
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
    			add_location(div0, file$x, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$x, 20, 0, 348);
    			add_location(li, file$x, 64, 2, 2188);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$x, 63, 0, 2166);
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
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard_3",
    			options,
    			id: create_fragment$A.name
    		});
    	}
    }

    /* src/01.punctuation/KeyTilde.svelte generated by Svelte v3.24.1 */

    const file$y = "src/01.punctuation/KeyTilde.svelte";

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

    function create_fragment$B(ctx) {
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
    			add_location(div0, file$y, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-gvw6fu");
    			add_location(div1, file$y, 60, 4, 1073);
    			attr_dev(div2, "class", "topWord svelte-gvw6fu");
    			add_location(div2, file$y, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-gvw6fu");
    			add_location(div3, file$y, 62, 2, 1117);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$y, 104, 6, 3066);
    			attr_dev(div5, "class", "desc svelte-gvw6fu");
    			add_location(div5, file$y, 105, 6, 3108);
    			add_location(div6, file$y, 103, 4, 3054);
    			attr_dev(div7, "class", "mud svelte-gvw6fu");
    			add_location(div7, file$y, 108, 6, 3171);
    			attr_dev(div8, "class", "desc svelte-gvw6fu");
    			add_location(div8, file$y, 109, 6, 3206);
    			add_location(div9, file$y, 107, 4, 3159);
    			attr_dev(div10, "class", "bottom svelte-gvw6fu");
    			add_location(div10, file$y, 102, 2, 3029);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$y, 57, 0, 1004);
    			add_location(li0, file$y, 115, 2, 3288);
    			add_location(li1, file$y, 116, 2, 3335);
    			add_location(li2, file$y, 117, 2, 3362);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$y, 114, 0, 3266);
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
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyTilde",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/01.punctuation/Tilde.svelte generated by Svelte v3.24.1 */
    const file$z = "src/01.punctuation/Tilde.svelte";

    function create_fragment$C(ctx) {
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
    			add_location(div0, file$z, 14, 0, 225);
    			add_location(li, file$z, 19, 2, 296);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$z, 18, 0, 274);
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
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tilde",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src/01.punctuation/KeyHash.svelte generated by Svelte v3.24.1 */

    const file$A = "src/01.punctuation/KeyHash.svelte";

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

    function create_fragment$D(ctx) {
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
    			add_location(div0, file$A, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-gvw6fu");
    			add_location(div1, file$A, 60, 4, 1072);
    			attr_dev(div2, "class", "topWord svelte-gvw6fu");
    			add_location(div2, file$A, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-gvw6fu");
    			add_location(div3, file$A, 62, 2, 1116);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$A, 104, 6, 3065);
    			attr_dev(div5, "class", "desc svelte-gvw6fu");
    			add_location(div5, file$A, 105, 6, 3104);
    			add_location(div6, file$A, 103, 4, 3053);
    			attr_dev(div7, "class", "mud svelte-gvw6fu");
    			add_location(div7, file$A, 108, 6, 3167);
    			attr_dev(div8, "class", "desc svelte-gvw6fu");
    			add_location(div8, file$A, 109, 6, 3205);
    			add_location(div9, file$A, 107, 4, 3155);
    			attr_dev(div10, "class", "bottom svelte-gvw6fu");
    			add_location(div10, file$A, 102, 2, 3028);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$A, 57, 0, 1004);
    			add_location(li0, file$A, 115, 2, 3287);
    			add_location(li1, file$A, 116, 2, 3313);
    			add_location(li2, file$A, 117, 2, 3365);
    			add_location(li3, file$A, 118, 2, 3389);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$A, 114, 0, 3265);
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
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyHash",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/01.punctuation/KeyAt.svelte generated by Svelte v3.24.1 */

    const file$B = "src/01.punctuation/KeyAt.svelte";

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

    function create_fragment$E(ctx) {
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
    			add_location(div0, file$B, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-1gvmhr9");
    			add_location(div1, file$B, 60, 4, 1079);
    			attr_dev(div2, "class", "topWord svelte-1gvmhr9");
    			add_location(div2, file$B, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-1gvmhr9");
    			add_location(div3, file$B, 62, 2, 1123);
    			attr_dev(div4, "class", "orange");
    			add_location(div4, file$B, 104, 6, 3072);
    			attr_dev(div5, "class", "desc svelte-1gvmhr9");
    			add_location(div5, file$B, 105, 6, 3117);
    			add_location(div6, file$B, 103, 4, 3060);
    			attr_dev(div7, "class", "mud svelte-1gvmhr9");
    			add_location(div7, file$B, 108, 6, 3180);
    			attr_dev(div8, "class", "desc svelte-1gvmhr9");
    			add_location(div8, file$B, 109, 6, 3218);
    			add_location(div9, file$B, 107, 4, 3168);
    			attr_dev(div10, "class", "bottom svelte-1gvmhr9");
    			add_location(div10, file$B, 102, 2, 3035);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$B, 57, 0, 1004);
    			add_location(li0, file$B, 115, 2, 3300);
    			add_location(li1, file$B, 116, 2, 3339);
    			add_location(li2, file$B, 117, 2, 3372);
    			add_location(li3, file$B, 118, 2, 3394);
    			add_location(li4, file$B, 119, 2, 3463);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$B, 114, 0, 3278);
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
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyAt",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src/01.punctuation/KeyAsterix.svelte generated by Svelte v3.24.1 */

    const file$C = "src/01.punctuation/KeyAsterix.svelte";

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
    			add_location(div0, file$C, 59, 4, 1050);
    			attr_dev(div1, "class", "desc svelte-1gvmhr9");
    			add_location(div1, file$C, 60, 4, 1071);
    			attr_dev(div2, "class", "topWord svelte-1gvmhr9");
    			add_location(div2, file$C, 58, 2, 1024);
    			attr_dev(div3, "class", "container svelte-1gvmhr9");
    			add_location(div3, file$C, 62, 2, 1115);
    			attr_dev(div4, "class", "orange");
    			set_style(div4, "font-family", "monospace");
    			add_location(div4, file$C, 104, 6, 3064);
    			attr_dev(div5, "class", "desc svelte-1gvmhr9");
    			add_location(div5, file$C, 105, 6, 3138);
    			add_location(div6, file$C, 103, 4, 3052);
    			attr_dev(div7, "class", "mud svelte-1gvmhr9");
    			add_location(div7, file$C, 108, 6, 3201);
    			attr_dev(div8, "class", "desc svelte-1gvmhr9");
    			add_location(div8, file$C, 109, 6, 3237);
    			add_location(div9, file$C, 107, 4, 3189);
    			attr_dev(div10, "class", "bottom svelte-1gvmhr9");
    			add_location(div10, file$C, 102, 2, 3027);
    			attr_dev(div11, "class", "box");
    			add_location(div11, file$C, 57, 0, 1004);
    			add_location(li0, file$C, 115, 2, 3319);
    			add_location(li1, file$C, 116, 2, 3352);
    			add_location(li2, file$C, 117, 2, 3378);
    			attr_dev(div12, "class", "notes");
    			add_location(div12, file$C, 114, 0, 3297);
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
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyAsterix",
    			options,
    			id: create_fragment$F.name
    		});
    	}
    }

    /* src/01.punctuation/KeyBrackets.svelte generated by Svelte v3.24.1 */

    const file$D = "src/01.punctuation/KeyBrackets.svelte";

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

    function create_fragment$G(ctx) {
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
    			add_location(div0, file$D, 21, 2, 368);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$D, 20, 0, 348);
    			add_location(li0, file$D, 64, 2, 2272);
    			add_location(li1, file$D, 65, 2, 2307);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$D, 63, 0, 2250);
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
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "KeyBrackets",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src/01.punctuation/Tomlinson.svelte generated by Svelte v3.24.1 */

    const file$E = "src/01.punctuation/Tomlinson.svelte";

    function create_fragment$H(ctx) {
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
    			add_location(img, file$E, 19, 6, 309);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$E, 18, 4, 288);
    			set_style(div1, "width", "300px");
    			set_style(div1, "font-size", "1.4rem");
    			attr_dev(div1, "class", "");
    			add_location(div1, file$E, 24, 4, 430);
    			attr_dev(div2, "class", "row svelte-ssqihk");
    			add_location(div2, file$E, 17, 2, 266);
    			attr_dev(div3, "class", "box");
    			add_location(div3, file$E, 16, 0, 246);
    			add_location(li0, file$E, 30, 2, 597);
    			add_location(li1, file$E, 31, 2, 622);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$E, 29, 0, 575);
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
    		id: create_fragment$H.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$H($$self, $$props) {
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
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tomlinson",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src/01.punctuation/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$I(ctx) {
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
    		id: create_fragment$I.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$I($$self, $$props, $$invalidate) {
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
    		Tomlinson
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
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_punctuation",
    			options,
    			id: create_fragment$I.name
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

    const file$F = "src/02.markup/Question.svelte";

    function create_fragment$J(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let div4;
    	let li;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "how can a user";
    			t1 = space();
    			div1 = element("div");
    			span0 = element("span");
    			span0.textContent = "write";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "clear data?";
    			t5 = space();
    			div4 = element("div");
    			li = element("li");
    			li.textContent = "everybody knows freehand text can't be parsed";
    			attr_dev(div0, "class", "f2 i");
    			add_location(div0, file$F, 23, 4, 296);
    			attr_dev(span0, "class", "red i");
    			add_location(span0, file$F, 25, 6, 363);
    			attr_dev(span1, "class", "blue med  svelte-10y1wyx");
    			add_location(span1, file$F, 26, 6, 402);
    			attr_dev(div1, "class", "med svelte-10y1wyx");
    			add_location(div1, file$F, 24, 4, 339);
    			add_location(div2, file$F, 22, 2, 286);
    			attr_dev(div3, "class", "box big svelte-10y1wyx");
    			add_location(div3, file$F, 21, 0, 262);
    			add_location(li, file$F, 31, 2, 494);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$F, 30, 0, 472);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, li);
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
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props) {
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
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src/02.markup/Wikipedia.svelte generated by Svelte v3.24.1 */
    const file$G = "src/02.markup/Wikipedia.svelte";

    function create_fragment$K(ctx) {
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
    			add_location(div0, file$G, 7, 0, 136);
    			add_location(li0, file$G, 12, 2, 207);
    			add_location(li1, file$G, 13, 2, 238);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$G, 11, 0, 185);
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
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$K($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wikipedia",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    /* src/02.markup/Escaping.svelte generated by Svelte v3.24.1 */
    const file$H = "src/02.markup/Escaping.svelte";

    function create_fragment$L(ctx) {
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
    			add_location(div0, file$H, 7, 0, 137);
    			add_location(li, file$H, 12, 2, 208);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$H, 11, 0, 186);
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
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$L($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Escaping",
    			options,
    			id: create_fragment$L.name
    		});
    	}
    }

    /* src/02.markup/Newline.svelte generated by Svelte v3.24.1 */

    const file$I = "src/02.markup/Newline.svelte";

    function create_fragment$M(ctx) {
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
    			add_location(div0, file$I, 11, 0, 99);
    			add_location(i, file$I, 16, 4, 175);
    			add_location(li0, file$I, 14, 2, 156);
    			add_location(li1, file$I, 19, 2, 223);
    			add_location(li2, file$I, 20, 2, 271);
    			add_location(li3, file$I, 21, 2, 300);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$I, 13, 0, 134);
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
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$M($$self, $$props) {
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
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Newline",
    			options,
    			id: create_fragment$M.name
    		});
    	}
    }

    /* src/02.markup/MarkupQuestion.svelte generated by Svelte v3.24.1 */

    const file$J = "src/02.markup/MarkupQuestion.svelte";

    function create_fragment$N(ctx) {
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
    			add_location(div0, file$J, 25, 4, 306);
    			attr_dev(div1, "class", "red i");
    			add_location(div1, file$J, 27, 6, 375);
    			attr_dev(span0, "class", "blue f3 svelte-tjnuip");
    			add_location(span0, file$J, 28, 6, 413);
    			attr_dev(span1, "class", "med svelte-tjnuip");
    			add_location(span1, file$J, 26, 4, 350);
    			add_location(div2, file$J, 24, 2, 296);
    			attr_dev(div3, "class", "box big svelte-tjnuip");
    			add_location(div3, file$J, 23, 0, 272);
    			add_location(li0, file$J, 33, 2, 509);
    			add_location(li1, file$J, 34, 2, 548);
    			add_location(li2, file$J, 35, 2, 574);
    			attr_dev(div4, "class", "notes");
    			add_location(div4, file$J, 32, 0, 487);
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
    		id: create_fragment$N.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$N($$self, $$props) {
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
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MarkupQuestion",
    			options,
    			id: create_fragment$N.name
    		});
    	}
    }

    /* src/02.markup/Glimpse.svelte generated by Svelte v3.24.1 */
    const file$K = "src/02.markup/Glimpse.svelte";

    function create_fragment$O(ctx) {
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
    			add_location(div0, file$K, 14, 0, 267);
    			add_location(li0, file$K, 18, 2, 349);
    			add_location(li1, file$K, 19, 2, 365);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$K, 17, 0, 327);
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
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$O($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Glimpse",
    			options,
    			id: create_fragment$O.name
    		});
    	}
    }

    /* src/02.markup/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$P(ctx) {
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
    		id: create_fragment$P.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Question$1, Wikipedia, MarkupQuestion, Escaping, Newline, Glimpse];
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
    		Newline,
    		MarkupQuestion,
    		Glimpse,
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
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_02_markup",
    			options,
    			id: create_fragment$P.name
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

    /* src/03.word-wrap/Spreadsheet.svelte generated by Svelte v3.24.1 */

    const file$L = "src/03.word-wrap/Spreadsheet.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
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
    			add_location(div, file$L, 60, 6, 1276);
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
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cell svelte-10qh3b4");
    			add_location(div, file$L, 69, 10, 1563);
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
    		id: create_else_block.name,
    		type: "else",
    		source: "(69:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (67:8) {#if content[i] && content[i][i2]}
    function create_if_block$2(ctx) {
    	let div;
    	let t_value = /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "cell svelte-10qh3b4");
    			add_location(div, file$L, 67, 10, 1496);
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
    		id: create_if_block$2.name,
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
    		if (/*content*/ ctx[0][/*i*/ ctx[6]] && /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]]) return create_if_block$2;
    		return create_else_block;
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
    function create_each_block(ctx) {
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
    			add_location(div, file$L, 64, 6, 1375);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(64:4) {#each Array(rows) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$Q(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
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
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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

    			attr_dev(div0, "class", "cell num top svelte-10qh3b4");
    			add_location(div0, file$L, 58, 4, 1207);
    			attr_dev(div1, "class", "container svelte-10qh3b4");
    			add_location(div1, file$L, 56, 2, 1158);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$L, 55, 0, 1138);
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spreadsheet",
    			options,
    			id: create_fragment$Q.name
    		});
    	}
    }

    /* src/03.word-wrap/Wrap.svelte generated by Svelte v3.24.1 */
    const file$M = "src/03.word-wrap/Wrap.svelte";

    function create_fragment$R(ctx) {
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
    			add_location(div, file$M, 13, 0, 215);
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
    		id: create_fragment$R.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$R($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$R, create_fragment$R, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap",
    			options,
    			id: create_fragment$R.name
    		});
    	}
    }

    /* src/03.word-wrap/Insert.svelte generated by Svelte v3.24.1 */
    const file$N = "src/03.word-wrap/Insert.svelte";

    function create_fragment$S(ctx) {
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
    			add_location(div, file$N, 21, 0, 324);
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
    		id: create_fragment$S.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$S($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$S, create_fragment$S, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Insert",
    			options,
    			id: create_fragment$S.name
    		});
    	}
    }

    /* src/03.word-wrap/index.svelte generated by Svelte v3.24.1 */

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
    	let steps = [Spreadsheet, Wrap, Insert];
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
    		init(this, options, instance$T, create_fragment$T, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_03_word_wrap",
    			options,
    			id: create_fragment$T.name
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
    const file$O = "src/04.text-editor/Drake.svelte";

    function create_fragment$U(ctx) {
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
    			add_location(div, file$O, 12, 0, 197);
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
    		id: create_fragment$U.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$U($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$U, create_fragment$U, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drake",
    			options,
    			id: create_fragment$U.name
    		});
    	}
    }

    /* src/04.text-editor/Timeline.svelte generated by Svelte v3.24.1 */

    const file$P = "src/04.text-editor/Timeline.svelte";

    function create_fragment$V(ctx) {
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
    			add_location(img, file$P, 36, 4, 880);
    			attr_dev(div0, "class", "middle svelte-1cxyf7j");
    			add_location(div0, file$P, 35, 2, 855);
    			attr_dev(div1, "class", "box ");
    			add_location(div1, file$P, 34, 0, 834);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$P, 64, 0, 1610);
    			add_location(li, file$P, 65, 0, 1632);
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
    		id: create_fragment$V.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$V($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);
    	return [];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$V, create_fragment$V, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$V.name
    		});
    	}
    }

    /* src/04.text-editor/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$W(ctx) {
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
    		id: create_fragment$W.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$W($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Drake, Timeline];
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
    		Timeline,
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
    		init(this, options, instance$W, create_fragment$W, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_04_text_editor",
    			options,
    			id: create_fragment$W.name
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
    const file$Q = "src/05.focus/Zelda.svelte";

    function create_fragment$X(ctx) {
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
    			add_location(div, file$Q, 12, 0, 193);
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
    		id: create_fragment$X.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$X($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$X, create_fragment$X, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zelda",
    			options,
    			id: create_fragment$X.name
    		});
    	}
    }

    /* src/05.focus/Canon-cat.svelte generated by Svelte v3.24.1 */
    const file$R = "src/05.focus/Canon-cat.svelte";

    function create_fragment$Y(ctx) {
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
    			add_location(div, file$R, 9, 0, 186);
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
    		id: create_fragment$Y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Y($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$Y, create_fragment$Y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canon_cat",
    			options,
    			id: create_fragment$Y.name
    		});
    	}
    }

    /* src/05.focus/Spicer.svelte generated by Svelte v3.24.1 */
    const file$S = "src/05.focus/Spicer.svelte";

    function create_fragment$Z(ctx) {
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
    			add_location(div, file$S, 7, 0, 133);
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
    		id: create_fragment$Z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$Z($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$Z, create_fragment$Z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spicer",
    			options,
    			id: create_fragment$Z.name
    		});
    	}
    }

    /* src/05.focus/Quake.svelte generated by Svelte v3.24.1 */
    const file$T = "src/05.focus/Quake.svelte";

    function create_fragment$_(ctx) {
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
    			add_location(div, file$T, 9, 0, 188);
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
    		id: create_fragment$_.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$_($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$_, create_fragment$_, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quake",
    			options,
    			id: create_fragment$_.name
    		});
    	}
    }

    /* src/05.focus/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$$(ctx) {
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
    		id: create_fragment$$.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$$($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$$, create_fragment$$, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_05_focus",
    			options,
    			id: create_fragment$$.name
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
    const file$U = "src/End.svelte";

    function create_fragment$10(ctx) {
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
    			add_location(img, file$U, 18, 4, 309);
    			add_location(div0, file$U, 19, 4, 390);
    			attr_dev(div1, "class", "row svelte-1mnnj7d");
    			add_location(div1, file$U, 17, 2, 287);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$U, 16, 0, 267);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$U, 22, 0, 434);
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
    		id: create_fragment$10.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$10($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$10, create_fragment$10, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "End",
    			options,
    			id: create_fragment$10.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$V = "src/App.svelte";

    function create_fragment$11(ctx) {
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
    	let t10;
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
    			option2.textContent = "punctuation";
    			option3 = element("option");
    			option3.textContent = "markup";
    			option4 = element("option");
    			option4.textContent = "wrapping";
    			option5 = element("option");
    			option5.textContent = "text-editor";
    			option6 = element("option");
    			option6.textContent = "focus";
    			t10 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(div0, file$V, 51, 0, 1059);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$V, 54, 4, 1170);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$V, 55, 4, 1207);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$V, 56, 4, 1248);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$V, 57, 4, 1291);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$V, 58, 4, 1329);
    			option5.__value = "5";
    			option5.value = option5.__value;
    			add_location(option5, file$V, 59, 4, 1369);
    			option6.__value = "6";
    			option6.value = option6.__value;
    			add_location(option6, file$V, 60, 4, 1412);
    			if (/*i*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file$V, 53, 2, 1088);
    			add_location(div1, file$V, 52, 0, 1080);
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
    			select_option(select, /*i*/ ctx[0]);
    			insert_dev(target, t10, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[6]),
    					listen_dev(select, "click", click_handler, false, false, false),
    					listen_dev(select, "blur", /*changeIt*/ ctx[5], false, false, false)
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
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			run_all(dispose);
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

    const click_handler = e => e.preventDefault();

    function instance$11($$self, $$props, $$invalidate) {
    	setContext("size", { width: 1280, height: 720 });
    	let i = 0;
    	let steps = [Start, _00_intro, _01_keyboards, _01_punctuation, _02_markup, _03_word_wrap, _04_text_editor, _05_focus, End];
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$11, create_fragment$11, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$11.name
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
