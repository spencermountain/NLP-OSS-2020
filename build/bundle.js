
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

    const file = "src/Components/Image.svelte";

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
    			attr_dev(div0, "class", "title svelte-a0m73z");
    			add_location(div0, file, 52, 4, 967);
    			attr_dev(div1, "class", "sub svelte-a0m73z");
    			add_location(div1, file, 53, 4, 1004);
    			attr_dev(div2, "class", "caption svelte-a0m73z");
    			add_location(div2, file, 51, 2, 941);
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

    function create_fragment(ctx) {
    	let t;
    	let img;
    	let img_src_value;
    	let if_block = /*title*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			img = element("img");
    			attr_dev(img, "class", "img svelte-a0m73z");
    			set_style(img, "margin-bottom", "0px");
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 56, 0, 1048);
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
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
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
    		init(this, options, instance, create_fragment, safe_not_equal, { src: 0, title: 1, sub: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Image",
    			options,
    			id: create_fragment.name
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

    /* src/00.intro/Splash-page.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/00.intro/Splash-page.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let image_1;
    	let t;
    	let div1;
    	let current;
    	const image_1_spread_levels = [/*image*/ ctx[0], { width: "800px" }];
    	let image_1_props = {};

    	for (let i = 0; i < image_1_spread_levels.length; i += 1) {
    		image_1_props = assign(image_1_props, image_1_spread_levels[i]);
    	}

    	image_1 = new Image({ props: image_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(image_1.$$.fragment);
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$1, 9, 0, 186);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$1, 13, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(image_1, div0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const image_1_changes = (dirty & /*image*/ 1)
    			? get_spread_update(image_1_spread_levels, [get_spread_object(/*image*/ ctx[0]), image_1_spread_levels[1]])
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
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
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
    	let image = {
    		src: "./src/00.intro/assets/wolfram-desk.jpg",
    		title: "On Typing",
    		sub: "EMNLP 2020"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Splash_page> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Splash_page", $$slots, []);
    	$$self.$capture_state = () => ({ Image, image });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image];
    }

    class Splash_page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splash_page",
    			options,
    			id: create_fragment$1.name
    		});
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
    			attr_dev(div0, "class", "title svelte-18ucy0n");
    			add_location(div0, file$9, 42, 4, 707);
    			attr_dev(div1, "class", "sub svelte-18ucy0n");
    			add_location(div1, file$9, 43, 4, 744);
    			attr_dev(div2, "class", "caption svelte-18ucy0n");
    			add_location(div2, file$9, 41, 2, 681);
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
    			add_location(track, file$9, 47, 2, 854);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.loop = /*loop*/ ctx[3];
    			video.autoplay = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-18ucy0n");
    			add_location(video, file$9, 46, 0, 788);
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
    			t2 = text("\n          Keyboard interface");
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
    			attr_dev(span0, "class", "num svelte-1spno7j");
    			add_location(span0, file$h, 35, 10, 699);
    			attr_dev(div1, "class", "f2 svelte-1spno7j");
    			add_location(div1, file$h, 34, 8, 672);
    			attr_dev(span1, "class", "num svelte-1spno7j");
    			add_location(span1, file$h, 39, 10, 806);
    			attr_dev(div2, "class", "f2 svelte-1spno7j");
    			add_location(div2, file$h, 38, 8, 779);
    			attr_dev(span2, "class", "num svelte-1spno7j");
    			add_location(span2, file$h, 43, 10, 911);
    			attr_dev(div3, "class", "f2 svelte-1spno7j");
    			add_location(div3, file$h, 42, 8, 884);
    			attr_dev(span3, "class", "num svelte-1spno7j");
    			add_location(span3, file$h, 48, 10, 1069);
    			attr_dev(div4, "class", "f2 svelte-1spno7j");
    			add_location(div4, file$h, 47, 8, 1042);
    			set_style(div5, "text-align", "left");
    			attr_dev(div5, "class", "ml3");
    			add_location(div5, file$h, 33, 6, 621);
    			add_location(div6, file$h, 32, 4, 609);
    			attr_dev(div7, "class", "row svelte-1spno7j");
    			add_location(div7, file$h, 28, 2, 478);
    			attr_dev(div8, "class", "box");
    			add_location(div8, file$h, 27, 0, 458);
    			attr_dev(div9, "class", "notes");
    			add_location(div9, file$h, 55, 0, 1181);
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
    		Question,
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
    		Splash: Splash_page,
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
    		LoveTyping: Question,
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

    /* src/01.keyboards/NowCLI.svelte generated by Svelte v3.24.1 */
    const file$m = "src/01.keyboards/NowCLI.svelte";

    function create_fragment$n(ctx) {
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
    			add_location(div, file$m, 13, 0, 250);
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
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NowCLI",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/01.keyboards/ISSKeyboard.svelte generated by Svelte v3.24.1 */
    const file$n = "src/01.keyboards/ISSKeyboard.svelte";

    function create_fragment$o(ctx) {
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
    			add_location(div0, file$n, 14, 0, 228);
    			add_location(li0, file$n, 19, 2, 299);
    			add_location(li1, file$n, 20, 2, 326);
    			add_location(li2, file$n, 21, 2, 352);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$n, 18, 0, 277);
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ISSKeyboard",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    /* src/01.keyboards/TonyAbra.svelte generated by Svelte v3.24.1 */

    const file$o = "src/01.keyboards/TonyAbra.svelte";

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
    			add_location(img0, file$o, 28, 6, 472);
    			set_style(img1, "height", "350px");
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/tony-3.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$o, 32, 6, 582);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$o, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$o, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$o, 40, 4, 746);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$o, 38, 2, 708);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$o, 25, 0, 406);
    			add_location(li, file$o, 45, 2, 844);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$o, 44, 0, 822);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TonyAbra> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TonyAbra", $$slots, []);
    	return [];
    }

    class TonyAbra extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TonyAbra",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/01.keyboards/ZoeSmith.svelte generated by Svelte v3.24.1 */

    const file$p = "src/01.keyboards/ZoeSmith.svelte";

    function create_fragment$q(ctx) {
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
    			add_location(img0, file$p, 28, 6, 472);
    			set_style(img1, "height", "450px");
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/zoe-2.jpeg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$p, 32, 6, 585);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$p, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$p, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$p, 40, 4, 746);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$p, 38, 2, 711);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$p, 25, 0, 406);
    			add_location(li, file$p, 45, 2, 835);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$p, 44, 0, 813);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ZoeSmith> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ZoeSmith", $$slots, []);
    	return [];
    }

    class ZoeSmith extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoeSmith",
    			options,
    			id: create_fragment$q.name
    		});
    	}
    }

    /* src/01.keyboards/HandKeyboards.svelte generated by Svelte v3.24.1 */

    const file$q = "src/01.keyboards/HandKeyboards.svelte";

    function create_fragment$r(ctx) {
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
    			add_location(track, file$q, 34, 8, 633);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = "./src/01.keyboards/assets/hand-computer.mp4")) attr_dev(video, "src", video_src_value);
    			video.loop = "true";
    			video.autoplay = true;
    			video.muted = true;
    			add_location(video, file$q, 28, 6, 472);
    			set_style(img, "height", "300px");
    			if (img.src !== (img_src_value = "./src/01.keyboards/assets/septambic.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$q, 36, 6, 680);
    			attr_dev(div0, "class", "row svelte-1r29gou");
    			add_location(div0, file$q, 27, 4, 448);
    			attr_dev(div1, "class", "col svelte-1r29gou");
    			add_location(div1, file$q, 26, 2, 426);
    			attr_dev(div2, "class", "f1 mt1");
    			add_location(div2, file$q, 44, 4, 845);
    			attr_dev(div3, "class", "f2");
    			add_location(div3, file$q, 42, 2, 809);
    			attr_dev(div4, "class", "box");
    			add_location(div4, file$q, 25, 0, 406);
    			add_location(li0, file$q, 49, 2, 928);
    			add_location(li1, file$q, 50, 2, 961);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$q, 48, 0, 906);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HandKeyboards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HandKeyboards", $$slots, []);
    	return [];
    }

    class HandKeyboards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HandKeyboards",
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
    		NowCLI
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
    		NowCLI,
    		ISSKeyboard,
    		TonyAbra,
    		ZoeSmith,
    		HandKeyboards,
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

    /* src/01.punctuation/Typewriter.1.svelte generated by Svelte v3.24.1 */

    const file$r = "src/01.punctuation/Typewriter.1.svelte";

    function create_fragment$t(ctx) {
    	let div66;
    	let div65;
    	let div14;
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
    	let div8;
    	let t17;
    	let div9;
    	let t19;
    	let div10;
    	let t21;
    	let div11;
    	let t23;
    	let div12;
    	let t25;
    	let div13;
    	let t27;
    	let div29;
    	let div15;
    	let t29;
    	let div16;
    	let t31;
    	let div17;
    	let t33;
    	let div18;
    	let t35;
    	let div19;
    	let t37;
    	let div20;
    	let t39;
    	let div21;
    	let t41;
    	let div22;
    	let t43;
    	let div23;
    	let t45;
    	let div24;
    	let t47;
    	let div25;
    	let t49;
    	let div26;
    	let t51;
    	let div27;
    	let t53;
    	let div28;
    	let t55;
    	let div43;
    	let div30;
    	let t57;
    	let div31;
    	let t59;
    	let div32;
    	let t61;
    	let div33;
    	let t63;
    	let div34;
    	let t65;
    	let div35;
    	let t67;
    	let div36;
    	let t69;
    	let div37;
    	let t71;
    	let div38;
    	let t73;
    	let div39;
    	let t75;
    	let div40;
    	let t77;
    	let div41;
    	let t79;
    	let div42;
    	let t81;
    	let div56;
    	let div44;
    	let t83;
    	let div45;
    	let t85;
    	let div46;
    	let t87;
    	let div47;
    	let t89;
    	let div48;
    	let t91;
    	let div49;
    	let t93;
    	let div50;
    	let t95;
    	let div51;
    	let t97;
    	let div52;
    	let t99;
    	let div53;
    	let t101;
    	let div54;
    	let t103;
    	let div55;
    	let t105;
    	let div64;
    	let div57;
    	let t107;
    	let div58;
    	let t109;
    	let div59;
    	let t111;
    	let div60;
    	let t112;
    	let div61;
    	let t114;
    	let div62;
    	let t116;
    	let div63;

    	const block = {
    		c: function create() {
    			div66 = element("div");
    			div65 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			div0.textContent = "~";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "!";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "@";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "#";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "$";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "%";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "^";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "&";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "*";
    			t17 = space();
    			div9 = element("div");
    			div9.textContent = "(";
    			t19 = space();
    			div10 = element("div");
    			div10.textContent = ")";
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "-";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "=";
    			t25 = space();
    			div13 = element("div");
    			div13.textContent = "⟵";
    			t27 = space();
    			div29 = element("div");
    			div15 = element("div");
    			div15.textContent = "tab";
    			t29 = space();
    			div16 = element("div");
    			div16.textContent = "q";
    			t31 = space();
    			div17 = element("div");
    			div17.textContent = "w";
    			t33 = space();
    			div18 = element("div");
    			div18.textContent = "e";
    			t35 = space();
    			div19 = element("div");
    			div19.textContent = "r";
    			t37 = space();
    			div20 = element("div");
    			div20.textContent = "t";
    			t39 = space();
    			div21 = element("div");
    			div21.textContent = "y";
    			t41 = space();
    			div22 = element("div");
    			div22.textContent = "u";
    			t43 = space();
    			div23 = element("div");
    			div23.textContent = "i";
    			t45 = space();
    			div24 = element("div");
    			div24.textContent = "o";
    			t47 = space();
    			div25 = element("div");
    			div25.textContent = "p";
    			t49 = space();
    			div26 = element("div");
    			div26.textContent = "[";
    			t51 = space();
    			div27 = element("div");
    			div27.textContent = "]";
    			t53 = space();
    			div28 = element("div");
    			div28.textContent = "\\";
    			t55 = space();
    			div43 = element("div");
    			div30 = element("div");
    			div30.textContent = "caps";
    			t57 = space();
    			div31 = element("div");
    			div31.textContent = "a";
    			t59 = space();
    			div32 = element("div");
    			div32.textContent = "s";
    			t61 = space();
    			div33 = element("div");
    			div33.textContent = "d";
    			t63 = space();
    			div34 = element("div");
    			div34.textContent = "f";
    			t65 = space();
    			div35 = element("div");
    			div35.textContent = "g";
    			t67 = space();
    			div36 = element("div");
    			div36.textContent = "h";
    			t69 = space();
    			div37 = element("div");
    			div37.textContent = "j";
    			t71 = space();
    			div38 = element("div");
    			div38.textContent = "k";
    			t73 = space();
    			div39 = element("div");
    			div39.textContent = "l";
    			t75 = space();
    			div40 = element("div");
    			div40.textContent = ";";
    			t77 = space();
    			div41 = element("div");
    			div41.textContent = "'";
    			t79 = space();
    			div42 = element("div");
    			div42.textContent = "↵";
    			t81 = space();
    			div56 = element("div");
    			div44 = element("div");
    			div44.textContent = "⇧";
    			t83 = space();
    			div45 = element("div");
    			div45.textContent = "z";
    			t85 = space();
    			div46 = element("div");
    			div46.textContent = "x";
    			t87 = space();
    			div47 = element("div");
    			div47.textContent = "c";
    			t89 = space();
    			div48 = element("div");
    			div48.textContent = "v";
    			t91 = space();
    			div49 = element("div");
    			div49.textContent = "b";
    			t93 = space();
    			div50 = element("div");
    			div50.textContent = "n";
    			t95 = space();
    			div51 = element("div");
    			div51.textContent = "m";
    			t97 = space();
    			div52 = element("div");
    			div52.textContent = ",";
    			t99 = space();
    			div53 = element("div");
    			div53.textContent = ".";
    			t101 = space();
    			div54 = element("div");
    			div54.textContent = "/";
    			t103 = space();
    			div55 = element("div");
    			div55.textContent = "⇧";
    			t105 = space();
    			div64 = element("div");
    			div57 = element("div");
    			div57.textContent = "⌃";
    			t107 = space();
    			div58 = element("div");
    			div58.textContent = "⌥";
    			t109 = space();
    			div59 = element("div");
    			div59.textContent = "⌘";
    			t111 = space();
    			div60 = element("div");
    			t112 = space();
    			div61 = element("div");
    			div61.textContent = "⌘";
    			t114 = space();
    			div62 = element("div");
    			div62.textContent = "⌥";
    			t116 = space();
    			div63 = element("div");
    			div63.textContent = "⌃";
    			attr_dev(div0, "class", "key svelte-1uh5q9t");
    			set_style(div0, "max-width", "30px");
    			add_location(div0, file$r, 43, 6, 798);
    			attr_dev(div1, "class", "key svelte-1uh5q9t");
    			add_location(div1, file$r, 44, 6, 853);
    			attr_dev(div2, "class", "key svelte-1uh5q9t");
    			add_location(div2, file$r, 45, 6, 884);
    			attr_dev(div3, "class", "key svelte-1uh5q9t");
    			add_location(div3, file$r, 46, 6, 915);
    			attr_dev(div4, "class", "key svelte-1uh5q9t");
    			add_location(div4, file$r, 47, 6, 946);
    			attr_dev(div5, "class", "key svelte-1uh5q9t");
    			add_location(div5, file$r, 48, 6, 977);
    			attr_dev(div6, "class", "key svelte-1uh5q9t");
    			add_location(div6, file$r, 49, 6, 1008);
    			attr_dev(div7, "class", "key svelte-1uh5q9t");
    			add_location(div7, file$r, 50, 6, 1039);
    			attr_dev(div8, "class", "key svelte-1uh5q9t");
    			add_location(div8, file$r, 51, 6, 1070);
    			attr_dev(div9, "class", "key svelte-1uh5q9t");
    			add_location(div9, file$r, 52, 6, 1101);
    			attr_dev(div10, "class", "key svelte-1uh5q9t");
    			add_location(div10, file$r, 53, 6, 1132);
    			attr_dev(div11, "class", "key svelte-1uh5q9t");
    			add_location(div11, file$r, 54, 6, 1163);
    			attr_dev(div12, "class", "key svelte-1uh5q9t");
    			add_location(div12, file$r, 55, 6, 1194);
    			attr_dev(div13, "class", "key svelte-1uh5q9t");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$r, 56, 6, 1225);
    			attr_dev(div14, "class", "row svelte-1uh5q9t");
    			add_location(div14, file$r, 42, 4, 774);
    			attr_dev(div15, "class", "key red svelte-1uh5q9t");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$r, 59, 6, 1308);
    			attr_dev(div16, "class", "key svelte-1uh5q9t");
    			add_location(div16, file$r, 60, 6, 1364);
    			attr_dev(div17, "class", "key svelte-1uh5q9t");
    			add_location(div17, file$r, 61, 6, 1395);
    			attr_dev(div18, "class", "key svelte-1uh5q9t");
    			add_location(div18, file$r, 62, 6, 1426);
    			attr_dev(div19, "class", "key svelte-1uh5q9t");
    			add_location(div19, file$r, 63, 6, 1457);
    			attr_dev(div20, "class", "key svelte-1uh5q9t");
    			add_location(div20, file$r, 64, 6, 1488);
    			attr_dev(div21, "class", "key svelte-1uh5q9t");
    			add_location(div21, file$r, 65, 6, 1519);
    			attr_dev(div22, "class", "key svelte-1uh5q9t");
    			add_location(div22, file$r, 66, 6, 1550);
    			attr_dev(div23, "class", "key svelte-1uh5q9t");
    			add_location(div23, file$r, 67, 6, 1581);
    			attr_dev(div24, "class", "key svelte-1uh5q9t");
    			add_location(div24, file$r, 68, 6, 1612);
    			attr_dev(div25, "class", "key svelte-1uh5q9t");
    			add_location(div25, file$r, 69, 6, 1643);
    			attr_dev(div26, "class", "key svelte-1uh5q9t");
    			add_location(div26, file$r, 70, 6, 1674);
    			attr_dev(div27, "class", "key svelte-1uh5q9t");
    			add_location(div27, file$r, 71, 6, 1705);
    			attr_dev(div28, "class", "key svelte-1uh5q9t");
    			add_location(div28, file$r, 72, 6, 1736);
    			attr_dev(div29, "class", "row svelte-1uh5q9t");
    			add_location(div29, file$r, 58, 4, 1284);
    			attr_dev(div30, "class", "key red svelte-1uh5q9t");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$r, 75, 6, 1800);
    			attr_dev(div31, "class", "key svelte-1uh5q9t");
    			add_location(div31, file$r, 76, 6, 1857);
    			attr_dev(div32, "class", "key svelte-1uh5q9t");
    			add_location(div32, file$r, 77, 6, 1888);
    			attr_dev(div33, "class", "key svelte-1uh5q9t");
    			add_location(div33, file$r, 78, 6, 1919);
    			attr_dev(div34, "class", "key svelte-1uh5q9t");
    			add_location(div34, file$r, 79, 6, 1950);
    			attr_dev(div35, "class", "key svelte-1uh5q9t");
    			add_location(div35, file$r, 80, 6, 1981);
    			attr_dev(div36, "class", "key svelte-1uh5q9t");
    			add_location(div36, file$r, 81, 6, 2012);
    			attr_dev(div37, "class", "key svelte-1uh5q9t");
    			add_location(div37, file$r, 82, 6, 2043);
    			attr_dev(div38, "class", "key svelte-1uh5q9t");
    			add_location(div38, file$r, 83, 6, 2074);
    			attr_dev(div39, "class", "key svelte-1uh5q9t");
    			add_location(div39, file$r, 84, 6, 2105);
    			attr_dev(div40, "class", "key svelte-1uh5q9t");
    			add_location(div40, file$r, 85, 6, 2136);
    			attr_dev(div41, "class", "key svelte-1uh5q9t");
    			add_location(div41, file$r, 86, 6, 2167);
    			attr_dev(div42, "class", "key red svelte-1uh5q9t");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$r, 87, 6, 2198);
    			attr_dev(div43, "class", "row svelte-1uh5q9t");
    			add_location(div43, file$r, 74, 4, 1776);
    			attr_dev(div44, "class", "key red svelte-1uh5q9t");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$r, 90, 6, 2285);
    			attr_dev(div45, "class", "key svelte-1uh5q9t");
    			add_location(div45, file$r, 91, 6, 2340);
    			attr_dev(div46, "class", "key svelte-1uh5q9t");
    			add_location(div46, file$r, 92, 6, 2371);
    			attr_dev(div47, "class", "key svelte-1uh5q9t");
    			add_location(div47, file$r, 93, 6, 2402);
    			attr_dev(div48, "class", "key svelte-1uh5q9t");
    			add_location(div48, file$r, 94, 6, 2433);
    			attr_dev(div49, "class", "key svelte-1uh5q9t");
    			add_location(div49, file$r, 95, 6, 2464);
    			attr_dev(div50, "class", "key svelte-1uh5q9t");
    			add_location(div50, file$r, 96, 6, 2495);
    			attr_dev(div51, "class", "key svelte-1uh5q9t");
    			add_location(div51, file$r, 97, 6, 2526);
    			attr_dev(div52, "class", "key svelte-1uh5q9t");
    			add_location(div52, file$r, 98, 6, 2557);
    			attr_dev(div53, "class", "key svelte-1uh5q9t");
    			add_location(div53, file$r, 99, 6, 2588);
    			attr_dev(div54, "class", "key svelte-1uh5q9t");
    			add_location(div54, file$r, 100, 6, 2619);
    			attr_dev(div55, "class", "key red svelte-1uh5q9t");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$r, 101, 6, 2650);
    			attr_dev(div56, "class", "row svelte-1uh5q9t");
    			add_location(div56, file$r, 89, 4, 2261);
    			attr_dev(div57, "class", "key svelte-1uh5q9t");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$r, 104, 6, 2738);
    			attr_dev(div58, "class", "key svelte-1uh5q9t");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$r, 105, 6, 2788);
    			attr_dev(div59, "class", "key svelte-1uh5q9t");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$r, 106, 6, 2838);
    			attr_dev(div60, "class", "key red svelte-1uh5q9t");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$r, 107, 6, 2888);
    			attr_dev(div61, "class", "key svelte-1uh5q9t");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$r, 108, 6, 2938);
    			attr_dev(div62, "class", "key svelte-1uh5q9t");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$r, 109, 6, 2988);
    			attr_dev(div63, "class", "key svelte-1uh5q9t");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$r, 110, 6, 3038);
    			attr_dev(div64, "class", "row svelte-1uh5q9t");
    			add_location(div64, file$r, 103, 4, 2714);
    			attr_dev(div65, "class", "container svelte-1uh5q9t");
    			add_location(div65, file$r, 41, 2, 746);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$r, 40, 0, 726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div66, anchor);
    			append_dev(div66, div65);
    			append_dev(div65, div14);
    			append_dev(div14, div0);
    			append_dev(div14, t1);
    			append_dev(div14, div1);
    			append_dev(div14, t3);
    			append_dev(div14, div2);
    			append_dev(div14, t5);
    			append_dev(div14, div3);
    			append_dev(div14, t7);
    			append_dev(div14, div4);
    			append_dev(div14, t9);
    			append_dev(div14, div5);
    			append_dev(div14, t11);
    			append_dev(div14, div6);
    			append_dev(div14, t13);
    			append_dev(div14, div7);
    			append_dev(div14, t15);
    			append_dev(div14, div8);
    			append_dev(div14, t17);
    			append_dev(div14, div9);
    			append_dev(div14, t19);
    			append_dev(div14, div10);
    			append_dev(div14, t21);
    			append_dev(div14, div11);
    			append_dev(div14, t23);
    			append_dev(div14, div12);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div65, t27);
    			append_dev(div65, div29);
    			append_dev(div29, div15);
    			append_dev(div29, t29);
    			append_dev(div29, div16);
    			append_dev(div29, t31);
    			append_dev(div29, div17);
    			append_dev(div29, t33);
    			append_dev(div29, div18);
    			append_dev(div29, t35);
    			append_dev(div29, div19);
    			append_dev(div29, t37);
    			append_dev(div29, div20);
    			append_dev(div29, t39);
    			append_dev(div29, div21);
    			append_dev(div29, t41);
    			append_dev(div29, div22);
    			append_dev(div29, t43);
    			append_dev(div29, div23);
    			append_dev(div29, t45);
    			append_dev(div29, div24);
    			append_dev(div29, t47);
    			append_dev(div29, div25);
    			append_dev(div29, t49);
    			append_dev(div29, div26);
    			append_dev(div29, t51);
    			append_dev(div29, div27);
    			append_dev(div29, t53);
    			append_dev(div29, div28);
    			append_dev(div65, t55);
    			append_dev(div65, div43);
    			append_dev(div43, div30);
    			append_dev(div43, t57);
    			append_dev(div43, div31);
    			append_dev(div43, t59);
    			append_dev(div43, div32);
    			append_dev(div43, t61);
    			append_dev(div43, div33);
    			append_dev(div43, t63);
    			append_dev(div43, div34);
    			append_dev(div43, t65);
    			append_dev(div43, div35);
    			append_dev(div43, t67);
    			append_dev(div43, div36);
    			append_dev(div43, t69);
    			append_dev(div43, div37);
    			append_dev(div43, t71);
    			append_dev(div43, div38);
    			append_dev(div43, t73);
    			append_dev(div43, div39);
    			append_dev(div43, t75);
    			append_dev(div43, div40);
    			append_dev(div43, t77);
    			append_dev(div43, div41);
    			append_dev(div43, t79);
    			append_dev(div43, div42);
    			append_dev(div65, t81);
    			append_dev(div65, div56);
    			append_dev(div56, div44);
    			append_dev(div56, t83);
    			append_dev(div56, div45);
    			append_dev(div56, t85);
    			append_dev(div56, div46);
    			append_dev(div56, t87);
    			append_dev(div56, div47);
    			append_dev(div56, t89);
    			append_dev(div56, div48);
    			append_dev(div56, t91);
    			append_dev(div56, div49);
    			append_dev(div56, t93);
    			append_dev(div56, div50);
    			append_dev(div56, t95);
    			append_dev(div56, div51);
    			append_dev(div56, t97);
    			append_dev(div56, div52);
    			append_dev(div56, t99);
    			append_dev(div56, div53);
    			append_dev(div56, t101);
    			append_dev(div56, div54);
    			append_dev(div56, t103);
    			append_dev(div56, div55);
    			append_dev(div65, t105);
    			append_dev(div65, div64);
    			append_dev(div64, div57);
    			append_dev(div64, t107);
    			append_dev(div64, div58);
    			append_dev(div64, t109);
    			append_dev(div64, div59);
    			append_dev(div64, t111);
    			append_dev(div64, div60);
    			append_dev(div64, t112);
    			append_dev(div64, div61);
    			append_dev(div64, t114);
    			append_dev(div64, div62);
    			append_dev(div64, t116);
    			append_dev(div64, div63);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div66);
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

    function instance$t($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typewriter_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typewriter_1", $$slots, []);
    	return [];
    }

    class Typewriter_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_1",
    			options,
    			id: create_fragment$t.name
    		});
    	}
    }

    /* src/01.punctuation/Tilde.svelte generated by Svelte v3.24.1 */
    const file$s = "src/01.punctuation/Tilde.svelte";

    function create_fragment$u(ctx) {
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
    			add_location(div0, file$s, 14, 0, 225);
    			add_location(li, file$s, 19, 2, 296);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$s, 18, 0, 274);
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
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tilde",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/01.punctuation/Typewriter.2.svelte generated by Svelte v3.24.1 */

    const file$t = "src/01.punctuation/Typewriter.2.svelte";

    function create_fragment$v(ctx) {
    	let div66;
    	let div65;
    	let div14;
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
    	let div8;
    	let t17;
    	let div9;
    	let t19;
    	let div10;
    	let t21;
    	let div11;
    	let t23;
    	let div12;
    	let t25;
    	let div13;
    	let t27;
    	let div29;
    	let div15;
    	let t29;
    	let div16;
    	let t31;
    	let div17;
    	let t33;
    	let div18;
    	let t35;
    	let div19;
    	let t37;
    	let div20;
    	let t39;
    	let div21;
    	let t41;
    	let div22;
    	let t43;
    	let div23;
    	let t45;
    	let div24;
    	let t47;
    	let div25;
    	let t49;
    	let div26;
    	let t51;
    	let div27;
    	let t53;
    	let div28;
    	let t55;
    	let div43;
    	let div30;
    	let t57;
    	let div31;
    	let t59;
    	let div32;
    	let t61;
    	let div33;
    	let t63;
    	let div34;
    	let t65;
    	let div35;
    	let t67;
    	let div36;
    	let t69;
    	let div37;
    	let t71;
    	let div38;
    	let t73;
    	let div39;
    	let t75;
    	let div40;
    	let t77;
    	let div41;
    	let t79;
    	let div42;
    	let t81;
    	let div56;
    	let div44;
    	let t83;
    	let div45;
    	let t85;
    	let div46;
    	let t87;
    	let div47;
    	let t89;
    	let div48;
    	let t91;
    	let div49;
    	let t93;
    	let div50;
    	let t95;
    	let div51;
    	let t97;
    	let div52;
    	let t99;
    	let div53;
    	let t101;
    	let div54;
    	let t103;
    	let div55;
    	let t105;
    	let div64;
    	let div57;
    	let t107;
    	let div58;
    	let t109;
    	let div59;
    	let t111;
    	let div60;
    	let t112;
    	let div61;
    	let t114;
    	let div62;
    	let t116;
    	let div63;

    	const block = {
    		c: function create() {
    			div66 = element("div");
    			div65 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			div0.textContent = "~";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "!";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "@";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "#";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "$";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "%";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "^";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "&";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "*";
    			t17 = space();
    			div9 = element("div");
    			div9.textContent = "(";
    			t19 = space();
    			div10 = element("div");
    			div10.textContent = ")";
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "-";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "=";
    			t25 = space();
    			div13 = element("div");
    			div13.textContent = "⟵";
    			t27 = space();
    			div29 = element("div");
    			div15 = element("div");
    			div15.textContent = "tab";
    			t29 = space();
    			div16 = element("div");
    			div16.textContent = "q";
    			t31 = space();
    			div17 = element("div");
    			div17.textContent = "w";
    			t33 = space();
    			div18 = element("div");
    			div18.textContent = "e";
    			t35 = space();
    			div19 = element("div");
    			div19.textContent = "r";
    			t37 = space();
    			div20 = element("div");
    			div20.textContent = "t";
    			t39 = space();
    			div21 = element("div");
    			div21.textContent = "y";
    			t41 = space();
    			div22 = element("div");
    			div22.textContent = "u";
    			t43 = space();
    			div23 = element("div");
    			div23.textContent = "i";
    			t45 = space();
    			div24 = element("div");
    			div24.textContent = "o";
    			t47 = space();
    			div25 = element("div");
    			div25.textContent = "p";
    			t49 = space();
    			div26 = element("div");
    			div26.textContent = "[";
    			t51 = space();
    			div27 = element("div");
    			div27.textContent = "]";
    			t53 = space();
    			div28 = element("div");
    			div28.textContent = "\\";
    			t55 = space();
    			div43 = element("div");
    			div30 = element("div");
    			div30.textContent = "caps";
    			t57 = space();
    			div31 = element("div");
    			div31.textContent = "a";
    			t59 = space();
    			div32 = element("div");
    			div32.textContent = "s";
    			t61 = space();
    			div33 = element("div");
    			div33.textContent = "d";
    			t63 = space();
    			div34 = element("div");
    			div34.textContent = "f";
    			t65 = space();
    			div35 = element("div");
    			div35.textContent = "g";
    			t67 = space();
    			div36 = element("div");
    			div36.textContent = "h";
    			t69 = space();
    			div37 = element("div");
    			div37.textContent = "j";
    			t71 = space();
    			div38 = element("div");
    			div38.textContent = "k";
    			t73 = space();
    			div39 = element("div");
    			div39.textContent = "l";
    			t75 = space();
    			div40 = element("div");
    			div40.textContent = ";";
    			t77 = space();
    			div41 = element("div");
    			div41.textContent = "'";
    			t79 = space();
    			div42 = element("div");
    			div42.textContent = "↵";
    			t81 = space();
    			div56 = element("div");
    			div44 = element("div");
    			div44.textContent = "⇧";
    			t83 = space();
    			div45 = element("div");
    			div45.textContent = "z";
    			t85 = space();
    			div46 = element("div");
    			div46.textContent = "x";
    			t87 = space();
    			div47 = element("div");
    			div47.textContent = "c";
    			t89 = space();
    			div48 = element("div");
    			div48.textContent = "v";
    			t91 = space();
    			div49 = element("div");
    			div49.textContent = "b";
    			t93 = space();
    			div50 = element("div");
    			div50.textContent = "n";
    			t95 = space();
    			div51 = element("div");
    			div51.textContent = "m";
    			t97 = space();
    			div52 = element("div");
    			div52.textContent = ",";
    			t99 = space();
    			div53 = element("div");
    			div53.textContent = ".";
    			t101 = space();
    			div54 = element("div");
    			div54.textContent = "/";
    			t103 = space();
    			div55 = element("div");
    			div55.textContent = "⇧";
    			t105 = space();
    			div64 = element("div");
    			div57 = element("div");
    			div57.textContent = "⌃";
    			t107 = space();
    			div58 = element("div");
    			div58.textContent = "⌥";
    			t109 = space();
    			div59 = element("div");
    			div59.textContent = "⌘";
    			t111 = space();
    			div60 = element("div");
    			t112 = space();
    			div61 = element("div");
    			div61.textContent = "⌘";
    			t114 = space();
    			div62 = element("div");
    			div62.textContent = "⌥";
    			t116 = space();
    			div63 = element("div");
    			div63.textContent = "⌃";
    			attr_dev(div0, "class", "key svelte-1upw8wx");
    			set_style(div0, "max-width", "30px");
    			add_location(div0, file$t, 48, 6, 894);
    			attr_dev(div1, "class", "key svelte-1upw8wx");
    			add_location(div1, file$t, 49, 6, 949);
    			attr_dev(div2, "class", "key svelte-1upw8wx");
    			add_location(div2, file$t, 50, 6, 980);
    			attr_dev(div3, "class", "key svelte-1upw8wx");
    			add_location(div3, file$t, 51, 6, 1011);
    			attr_dev(div4, "class", "key svelte-1upw8wx");
    			add_location(div4, file$t, 52, 6, 1042);
    			attr_dev(div5, "class", "key svelte-1upw8wx");
    			add_location(div5, file$t, 53, 6, 1073);
    			attr_dev(div6, "class", "key svelte-1upw8wx");
    			add_location(div6, file$t, 54, 6, 1104);
    			attr_dev(div7, "class", "key svelte-1upw8wx");
    			add_location(div7, file$t, 55, 6, 1135);
    			attr_dev(div8, "class", "key svelte-1upw8wx");
    			add_location(div8, file$t, 56, 6, 1166);
    			attr_dev(div9, "class", "key svelte-1upw8wx");
    			add_location(div9, file$t, 57, 6, 1197);
    			attr_dev(div10, "class", "key svelte-1upw8wx");
    			add_location(div10, file$t, 58, 6, 1228);
    			attr_dev(div11, "class", "key svelte-1upw8wx");
    			add_location(div11, file$t, 59, 6, 1259);
    			attr_dev(div12, "class", "key svelte-1upw8wx");
    			add_location(div12, file$t, 60, 6, 1290);
    			attr_dev(div13, "class", "key svelte-1upw8wx");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$t, 61, 6, 1321);
    			attr_dev(div14, "class", "row svelte-1upw8wx");
    			add_location(div14, file$t, 47, 4, 870);
    			attr_dev(div15, "class", "key red svelte-1upw8wx");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$t, 64, 6, 1404);
    			attr_dev(div16, "class", "key svelte-1upw8wx");
    			add_location(div16, file$t, 65, 6, 1460);
    			attr_dev(div17, "class", "key svelte-1upw8wx");
    			add_location(div17, file$t, 66, 6, 1491);
    			attr_dev(div18, "class", "key svelte-1upw8wx");
    			add_location(div18, file$t, 67, 6, 1522);
    			attr_dev(div19, "class", "key svelte-1upw8wx");
    			add_location(div19, file$t, 68, 6, 1553);
    			attr_dev(div20, "class", "key svelte-1upw8wx");
    			add_location(div20, file$t, 69, 6, 1584);
    			attr_dev(div21, "class", "key svelte-1upw8wx");
    			add_location(div21, file$t, 70, 6, 1615);
    			attr_dev(div22, "class", "key svelte-1upw8wx");
    			add_location(div22, file$t, 71, 6, 1646);
    			attr_dev(div23, "class", "key svelte-1upw8wx");
    			add_location(div23, file$t, 72, 6, 1677);
    			attr_dev(div24, "class", "key svelte-1upw8wx");
    			add_location(div24, file$t, 73, 6, 1708);
    			attr_dev(div25, "class", "key svelte-1upw8wx");
    			add_location(div25, file$t, 74, 6, 1739);
    			attr_dev(div26, "class", "key svelte-1upw8wx");
    			add_location(div26, file$t, 75, 6, 1770);
    			attr_dev(div27, "class", "key svelte-1upw8wx");
    			add_location(div27, file$t, 76, 6, 1801);
    			attr_dev(div28, "class", "key svelte-1upw8wx");
    			add_location(div28, file$t, 77, 6, 1832);
    			attr_dev(div29, "class", "row svelte-1upw8wx");
    			add_location(div29, file$t, 63, 4, 1380);
    			attr_dev(div30, "class", "key red svelte-1upw8wx");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$t, 80, 6, 1896);
    			attr_dev(div31, "class", "key svelte-1upw8wx");
    			add_location(div31, file$t, 81, 6, 1953);
    			attr_dev(div32, "class", "key svelte-1upw8wx");
    			add_location(div32, file$t, 82, 6, 1984);
    			attr_dev(div33, "class", "key svelte-1upw8wx");
    			add_location(div33, file$t, 83, 6, 2015);
    			attr_dev(div34, "class", "key svelte-1upw8wx");
    			add_location(div34, file$t, 84, 6, 2046);
    			attr_dev(div35, "class", "key svelte-1upw8wx");
    			add_location(div35, file$t, 85, 6, 2077);
    			attr_dev(div36, "class", "key svelte-1upw8wx");
    			add_location(div36, file$t, 86, 6, 2108);
    			attr_dev(div37, "class", "key svelte-1upw8wx");
    			add_location(div37, file$t, 87, 6, 2139);
    			attr_dev(div38, "class", "key svelte-1upw8wx");
    			add_location(div38, file$t, 88, 6, 2170);
    			attr_dev(div39, "class", "key svelte-1upw8wx");
    			add_location(div39, file$t, 89, 6, 2201);
    			attr_dev(div40, "class", "key svelte-1upw8wx");
    			add_location(div40, file$t, 90, 6, 2232);
    			attr_dev(div41, "class", "key svelte-1upw8wx");
    			add_location(div41, file$t, 91, 6, 2263);
    			attr_dev(div42, "class", "key blue svelte-1upw8wx");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$t, 92, 6, 2294);
    			attr_dev(div43, "class", "row svelte-1upw8wx");
    			add_location(div43, file$t, 79, 4, 1872);
    			attr_dev(div44, "class", "key red svelte-1upw8wx");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$t, 95, 6, 2382);
    			attr_dev(div45, "class", "key svelte-1upw8wx");
    			add_location(div45, file$t, 96, 6, 2437);
    			attr_dev(div46, "class", "key svelte-1upw8wx");
    			add_location(div46, file$t, 97, 6, 2468);
    			attr_dev(div47, "class", "key svelte-1upw8wx");
    			add_location(div47, file$t, 98, 6, 2499);
    			attr_dev(div48, "class", "key svelte-1upw8wx");
    			add_location(div48, file$t, 99, 6, 2530);
    			attr_dev(div49, "class", "key svelte-1upw8wx");
    			add_location(div49, file$t, 100, 6, 2561);
    			attr_dev(div50, "class", "key svelte-1upw8wx");
    			add_location(div50, file$t, 101, 6, 2592);
    			attr_dev(div51, "class", "key svelte-1upw8wx");
    			add_location(div51, file$t, 102, 6, 2623);
    			attr_dev(div52, "class", "key svelte-1upw8wx");
    			add_location(div52, file$t, 103, 6, 2654);
    			attr_dev(div53, "class", "key svelte-1upw8wx");
    			add_location(div53, file$t, 104, 6, 2685);
    			attr_dev(div54, "class", "key svelte-1upw8wx");
    			add_location(div54, file$t, 105, 6, 2716);
    			attr_dev(div55, "class", "key red svelte-1upw8wx");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$t, 106, 6, 2747);
    			attr_dev(div56, "class", "row svelte-1upw8wx");
    			add_location(div56, file$t, 94, 4, 2358);
    			attr_dev(div57, "class", "key svelte-1upw8wx");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$t, 109, 6, 2835);
    			attr_dev(div58, "class", "key svelte-1upw8wx");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$t, 110, 6, 2885);
    			attr_dev(div59, "class", "key svelte-1upw8wx");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$t, 111, 6, 2935);
    			attr_dev(div60, "class", "key red svelte-1upw8wx");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$t, 112, 6, 2985);
    			attr_dev(div61, "class", "key svelte-1upw8wx");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$t, 113, 6, 3035);
    			attr_dev(div62, "class", "key svelte-1upw8wx");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$t, 114, 6, 3085);
    			attr_dev(div63, "class", "key svelte-1upw8wx");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$t, 115, 6, 3135);
    			attr_dev(div64, "class", "row svelte-1upw8wx");
    			add_location(div64, file$t, 108, 4, 2811);
    			attr_dev(div65, "class", "container svelte-1upw8wx");
    			add_location(div65, file$t, 46, 2, 842);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$t, 45, 0, 822);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div66, anchor);
    			append_dev(div66, div65);
    			append_dev(div65, div14);
    			append_dev(div14, div0);
    			append_dev(div14, t1);
    			append_dev(div14, div1);
    			append_dev(div14, t3);
    			append_dev(div14, div2);
    			append_dev(div14, t5);
    			append_dev(div14, div3);
    			append_dev(div14, t7);
    			append_dev(div14, div4);
    			append_dev(div14, t9);
    			append_dev(div14, div5);
    			append_dev(div14, t11);
    			append_dev(div14, div6);
    			append_dev(div14, t13);
    			append_dev(div14, div7);
    			append_dev(div14, t15);
    			append_dev(div14, div8);
    			append_dev(div14, t17);
    			append_dev(div14, div9);
    			append_dev(div14, t19);
    			append_dev(div14, div10);
    			append_dev(div14, t21);
    			append_dev(div14, div11);
    			append_dev(div14, t23);
    			append_dev(div14, div12);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div65, t27);
    			append_dev(div65, div29);
    			append_dev(div29, div15);
    			append_dev(div29, t29);
    			append_dev(div29, div16);
    			append_dev(div29, t31);
    			append_dev(div29, div17);
    			append_dev(div29, t33);
    			append_dev(div29, div18);
    			append_dev(div29, t35);
    			append_dev(div29, div19);
    			append_dev(div29, t37);
    			append_dev(div29, div20);
    			append_dev(div29, t39);
    			append_dev(div29, div21);
    			append_dev(div29, t41);
    			append_dev(div29, div22);
    			append_dev(div29, t43);
    			append_dev(div29, div23);
    			append_dev(div29, t45);
    			append_dev(div29, div24);
    			append_dev(div29, t47);
    			append_dev(div29, div25);
    			append_dev(div29, t49);
    			append_dev(div29, div26);
    			append_dev(div29, t51);
    			append_dev(div29, div27);
    			append_dev(div29, t53);
    			append_dev(div29, div28);
    			append_dev(div65, t55);
    			append_dev(div65, div43);
    			append_dev(div43, div30);
    			append_dev(div43, t57);
    			append_dev(div43, div31);
    			append_dev(div43, t59);
    			append_dev(div43, div32);
    			append_dev(div43, t61);
    			append_dev(div43, div33);
    			append_dev(div43, t63);
    			append_dev(div43, div34);
    			append_dev(div43, t65);
    			append_dev(div43, div35);
    			append_dev(div43, t67);
    			append_dev(div43, div36);
    			append_dev(div43, t69);
    			append_dev(div43, div37);
    			append_dev(div43, t71);
    			append_dev(div43, div38);
    			append_dev(div43, t73);
    			append_dev(div43, div39);
    			append_dev(div43, t75);
    			append_dev(div43, div40);
    			append_dev(div43, t77);
    			append_dev(div43, div41);
    			append_dev(div43, t79);
    			append_dev(div43, div42);
    			append_dev(div65, t81);
    			append_dev(div65, div56);
    			append_dev(div56, div44);
    			append_dev(div56, t83);
    			append_dev(div56, div45);
    			append_dev(div56, t85);
    			append_dev(div56, div46);
    			append_dev(div56, t87);
    			append_dev(div56, div47);
    			append_dev(div56, t89);
    			append_dev(div56, div48);
    			append_dev(div56, t91);
    			append_dev(div56, div49);
    			append_dev(div56, t93);
    			append_dev(div56, div50);
    			append_dev(div56, t95);
    			append_dev(div56, div51);
    			append_dev(div56, t97);
    			append_dev(div56, div52);
    			append_dev(div56, t99);
    			append_dev(div56, div53);
    			append_dev(div56, t101);
    			append_dev(div56, div54);
    			append_dev(div56, t103);
    			append_dev(div56, div55);
    			append_dev(div65, t105);
    			append_dev(div65, div64);
    			append_dev(div64, div57);
    			append_dev(div64, t107);
    			append_dev(div64, div58);
    			append_dev(div64, t109);
    			append_dev(div64, div59);
    			append_dev(div64, t111);
    			append_dev(div64, div60);
    			append_dev(div64, t112);
    			append_dev(div64, div61);
    			append_dev(div64, t114);
    			append_dev(div64, div62);
    			append_dev(div64, t116);
    			append_dev(div64, div63);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div66);
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

    function instance$v($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typewriter_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typewriter_2", $$slots, []);
    	return [];
    }

    class Typewriter_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_2",
    			options,
    			id: create_fragment$v.name
    		});
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
    			set_style(div0, "flex", "0.7");
    			toggle_class(div0, "show", /*$keys*/ ctx[2]["`"].color);
    			add_location(div0, file$u, 59, 4, 1212);
    			attr_dev(div1, "class", "key svelte-s6zq7o");
    			set_style(div1, "background-color", /*$keys*/ ctx[2]["1"].color);
    			toggle_class(div1, "show", /*$keys*/ ctx[2]["1"].color);
    			add_location(div1, file$u, 62, 4, 1359);
    			attr_dev(div2, "class", "key svelte-s6zq7o");
    			set_style(div2, "background-color", /*$keys*/ ctx[2]["2"].color);
    			toggle_class(div2, "show", /*$keys*/ ctx[2]["2"].color);
    			add_location(div2, file$u, 65, 4, 1497);
    			attr_dev(div3, "class", "key svelte-s6zq7o");
    			set_style(div3, "background-color", /*$keys*/ ctx[2]["3"].color);
    			toggle_class(div3, "show", /*$keys*/ ctx[2]["3"].color);
    			add_location(div3, file$u, 68, 4, 1635);
    			attr_dev(div4, "class", "key svelte-s6zq7o");
    			set_style(div4, "background-color", /*$keys*/ ctx[2]["4"].color);
    			toggle_class(div4, "show", /*$keys*/ ctx[2]["4"].color);
    			add_location(div4, file$u, 71, 4, 1773);
    			attr_dev(div5, "class", "key svelte-s6zq7o");
    			set_style(div5, "background-color", /*$keys*/ ctx[2]["5"].color);
    			toggle_class(div5, "show", /*$keys*/ ctx[2]["5"].color);
    			add_location(div5, file$u, 74, 4, 1911);
    			attr_dev(div6, "class", "key svelte-s6zq7o");
    			set_style(div6, "background-color", /*$keys*/ ctx[2]["6"].color);
    			toggle_class(div6, "show", /*$keys*/ ctx[2]["6"].color);
    			add_location(div6, file$u, 77, 4, 2049);
    			attr_dev(div7, "class", "key svelte-s6zq7o");
    			set_style(div7, "background-color", /*$keys*/ ctx[2]["7"].color);
    			toggle_class(div7, "show", /*$keys*/ ctx[2]["7"].color);
    			add_location(div7, file$u, 80, 4, 2187);
    			attr_dev(div8, "class", "key svelte-s6zq7o");
    			set_style(div8, "background-color", /*$keys*/ ctx[2]["8"].color);
    			toggle_class(div8, "show", /*$keys*/ ctx[2]["8"].color);
    			add_location(div8, file$u, 83, 4, 2325);
    			attr_dev(div9, "class", "key svelte-s6zq7o");
    			set_style(div9, "background-color", /*$keys*/ ctx[2]["9"].color);
    			toggle_class(div9, "show", /*$keys*/ ctx[2]["9"].color);
    			add_location(div9, file$u, 86, 4, 2463);
    			attr_dev(div10, "class", "key svelte-s6zq7o");
    			set_style(div10, "background-color", /*$keys*/ ctx[2]["0"].color);
    			toggle_class(div10, "show", /*$keys*/ ctx[2]["0"].color);
    			add_location(div10, file$u, 89, 4, 2601);
    			attr_dev(div11, "class", "key svelte-s6zq7o");
    			set_style(div11, "background-color", /*$keys*/ ctx[2]["-"].color);
    			toggle_class(div11, "show", /*$keys*/ ctx[2]["-"].color);
    			add_location(div11, file$u, 92, 4, 2739);
    			attr_dev(div12, "class", "key svelte-s6zq7o");
    			set_style(div12, "background-color", /*$keys*/ ctx[2]["="].color);
    			toggle_class(div12, "show", /*$keys*/ ctx[2]["="].color);
    			add_location(div12, file$u, 95, 4, 2877);
    			attr_dev(div13, "class", "key svelte-s6zq7o");
    			set_style(div13, "background-color", /*$keys*/ ctx[2]["del"].color);
    			set_style(div13, "opacity", /*$keys*/ ctx[2]["del"].opacity);
    			set_style(div13, "flex", "1.5");
    			toggle_class(div13, "show", /*$keys*/ ctx[2]["del"].color);
    			add_location(div13, file$u, 98, 4, 3015);
    			attr_dev(div14, "class", "row svelte-s6zq7o");
    			add_location(div14, file$u, 58, 2, 1190);
    			attr_dev(div15, "class", "key svelte-s6zq7o");
    			set_style(div15, "background-color", /*$keys*/ ctx[2]["tab"].color);
    			set_style(div15, "opacity", /*$keys*/ ctx[2]["tab"].opacity);
    			toggle_class(div15, "show", /*$keys*/ ctx[2]["tab"].color);
    			add_location(div15, file$u, 106, 4, 3248);
    			attr_dev(div16, "class", "key svelte-s6zq7o");
    			set_style(div16, "background-color", /*$keys*/ ctx[2]["q"].color);
    			toggle_class(div16, "show", /*$keys*/ ctx[2]["q"].color);
    			add_location(div16, file$u, 112, 4, 3442);
    			attr_dev(div17, "class", "key svelte-s6zq7o");
    			set_style(div17, "background-color", /*$keys*/ ctx[2]["w"].color);
    			toggle_class(div17, "show", /*$keys*/ ctx[2]["w"].color);
    			add_location(div17, file$u, 115, 4, 3580);
    			attr_dev(div18, "class", "key svelte-s6zq7o");
    			set_style(div18, "background-color", /*$keys*/ ctx[2]["e"].color);
    			toggle_class(div18, "show", /*$keys*/ ctx[2]["e"].color);
    			add_location(div18, file$u, 118, 4, 3718);
    			attr_dev(div19, "class", "key svelte-s6zq7o");
    			set_style(div19, "background-color", /*$keys*/ ctx[2]["r"].color);
    			toggle_class(div19, "show", /*$keys*/ ctx[2]["r"].color);
    			add_location(div19, file$u, 121, 4, 3856);
    			attr_dev(div20, "class", "key svelte-s6zq7o");
    			set_style(div20, "background-color", /*$keys*/ ctx[2]["t"].color);
    			toggle_class(div20, "show", /*$keys*/ ctx[2]["t"].color);
    			add_location(div20, file$u, 124, 4, 3994);
    			attr_dev(div21, "class", "key svelte-s6zq7o");
    			set_style(div21, "background-color", /*$keys*/ ctx[2]["y"].color);
    			toggle_class(div21, "show", /*$keys*/ ctx[2]["y"].color);
    			add_location(div21, file$u, 127, 4, 4132);
    			attr_dev(div22, "class", "key svelte-s6zq7o");
    			set_style(div22, "background-color", /*$keys*/ ctx[2]["u"].color);
    			toggle_class(div22, "show", /*$keys*/ ctx[2]["u"].color);
    			add_location(div22, file$u, 130, 4, 4270);
    			attr_dev(div23, "class", "key svelte-s6zq7o");
    			set_style(div23, "background-color", /*$keys*/ ctx[2]["i"].color);
    			toggle_class(div23, "show", /*$keys*/ ctx[2]["i"].color);
    			add_location(div23, file$u, 133, 4, 4408);
    			attr_dev(div24, "class", "key svelte-s6zq7o");
    			set_style(div24, "background-color", /*$keys*/ ctx[2]["o"].color);
    			toggle_class(div24, "show", /*$keys*/ ctx[2]["o"].color);
    			add_location(div24, file$u, 136, 4, 4546);
    			attr_dev(div25, "class", "key svelte-s6zq7o");
    			set_style(div25, "background-color", /*$keys*/ ctx[2]["p"].color);
    			toggle_class(div25, "show", /*$keys*/ ctx[2]["p"].color);
    			add_location(div25, file$u, 139, 4, 4684);
    			attr_dev(div26, "class", "key svelte-s6zq7o");
    			set_style(div26, "background-color", /*$keys*/ ctx[2]["["].color);
    			toggle_class(div26, "show", /*$keys*/ ctx[2]["["].color);
    			add_location(div26, file$u, 142, 4, 4822);
    			attr_dev(div27, "class", "key svelte-s6zq7o");
    			set_style(div27, "background-color", /*$keys*/ ctx[2]["]"].color);
    			toggle_class(div27, "show", /*$keys*/ ctx[2]["]"].color);
    			add_location(div27, file$u, 145, 4, 4960);
    			attr_dev(div28, "class", "key svelte-s6zq7o");
    			set_style(div28, "background-color", /*$keys*/ ctx[2]["\\"].color);
    			toggle_class(div28, "show", /*$keys*/ ctx[2]["\\"].color);
    			add_location(div28, file$u, 148, 4, 5098);
    			attr_dev(div29, "class", "row svelte-s6zq7o");
    			add_location(div29, file$u, 105, 2, 3226);
    			attr_dev(div30, "class", "key svelte-s6zq7o");
    			set_style(div30, "background-color", /*$keys*/ ctx[2]["caps"].color);
    			set_style(div30, "opacity", /*$keys*/ ctx[2]["caps"].opacity);
    			set_style(div30, "flex", "1.6");
    			toggle_class(div30, "show", /*$keys*/ ctx[2]["caps"].color);
    			add_location(div30, file$u, 153, 4, 5268);
    			attr_dev(div31, "class", "key svelte-s6zq7o");
    			set_style(div31, "background-color", /*$keys*/ ctx[2]["a"].color);
    			toggle_class(div31, "show", /*$keys*/ ctx[2]["a"].color);
    			add_location(div31, file$u, 159, 4, 5476);
    			attr_dev(div32, "class", "key svelte-s6zq7o");
    			set_style(div32, "background-color", /*$keys*/ ctx[2]["s"].color);
    			toggle_class(div32, "show", /*$keys*/ ctx[2]["s"].color);
    			add_location(div32, file$u, 162, 4, 5614);
    			attr_dev(div33, "class", "key svelte-s6zq7o");
    			set_style(div33, "background-color", /*$keys*/ ctx[2]["d"].color);
    			toggle_class(div33, "show", /*$keys*/ ctx[2]["d"].color);
    			add_location(div33, file$u, 165, 4, 5752);
    			attr_dev(div34, "class", "key svelte-s6zq7o");
    			set_style(div34, "background-color", /*$keys*/ ctx[2]["f"].color);
    			toggle_class(div34, "show", /*$keys*/ ctx[2]["f"].color);
    			add_location(div34, file$u, 168, 4, 5890);
    			attr_dev(div35, "class", "key svelte-s6zq7o");
    			set_style(div35, "background-color", /*$keys*/ ctx[2]["g"].color);
    			toggle_class(div35, "show", /*$keys*/ ctx[2]["g"].color);
    			add_location(div35, file$u, 171, 4, 6028);
    			attr_dev(div36, "class", "key svelte-s6zq7o");
    			set_style(div36, "background-color", /*$keys*/ ctx[2]["h"].color);
    			toggle_class(div36, "show", /*$keys*/ ctx[2]["h"].color);
    			add_location(div36, file$u, 174, 4, 6166);
    			attr_dev(div37, "class", "key svelte-s6zq7o");
    			set_style(div37, "background-color", /*$keys*/ ctx[2]["j"].color);
    			toggle_class(div37, "show", /*$keys*/ ctx[2]["j"].color);
    			add_location(div37, file$u, 177, 4, 6304);
    			attr_dev(div38, "class", "key svelte-s6zq7o");
    			set_style(div38, "background-color", /*$keys*/ ctx[2]["k"].color);
    			toggle_class(div38, "show", /*$keys*/ ctx[2]["k"].color);
    			add_location(div38, file$u, 180, 4, 6442);
    			attr_dev(div39, "class", "key svelte-s6zq7o");
    			set_style(div39, "background-color", /*$keys*/ ctx[2]["l"].color);
    			toggle_class(div39, "show", /*$keys*/ ctx[2]["l"].color);
    			add_location(div39, file$u, 183, 4, 6580);
    			attr_dev(div40, "class", "key svelte-s6zq7o");
    			set_style(div40, "background-color", /*$keys*/ ctx[2][";"].color);
    			toggle_class(div40, "show", /*$keys*/ ctx[2][";"].color);
    			add_location(div40, file$u, 186, 4, 6718);
    			attr_dev(div41, "class", "key svelte-s6zq7o");
    			set_style(div41, "background-color", /*$keys*/ ctx[2]["'"].color);
    			toggle_class(div41, "show", /*$keys*/ ctx[2]["'"].color);
    			add_location(div41, file$u, 189, 4, 6856);
    			attr_dev(div42, "class", "key svelte-s6zq7o");
    			set_style(div42, "background-color", /*$keys*/ ctx[2]["enter"].color);
    			set_style(div42, "opacity", /*$keys*/ ctx[2]["enter"].opacity);
    			set_style(div42, "flex", "1.6");
    			toggle_class(div42, "show", /*$keys*/ ctx[2]["enter"].color);
    			add_location(div42, file$u, 192, 4, 6994);
    			attr_dev(div43, "class", "row svelte-s6zq7o");
    			add_location(div43, file$u, 152, 2, 5246);
    			attr_dev(div44, "class", "key svelte-s6zq7o");
    			set_style(div44, "background-color", /*$keys*/ ctx[2]["lshift"].color);
    			set_style(div44, "opacity", /*$keys*/ ctx[2]["lshift"].opacity);
    			set_style(div44, "flex", "2.2");
    			toggle_class(div44, "show", /*$keys*/ ctx[2]["lshift"].color);
    			add_location(div44, file$u, 200, 4, 7235);
    			attr_dev(div45, "class", "key svelte-s6zq7o");
    			set_style(div45, "background-color", /*$keys*/ ctx[2]["z"].color);
    			toggle_class(div45, "show", /*$keys*/ ctx[2]["z"].color);
    			add_location(div45, file$u, 206, 4, 7451);
    			attr_dev(div46, "class", "key svelte-s6zq7o");
    			set_style(div46, "background-color", /*$keys*/ ctx[2]["x"].color);
    			toggle_class(div46, "show", /*$keys*/ ctx[2]["x"].color);
    			add_location(div46, file$u, 209, 4, 7589);
    			attr_dev(div47, "class", "key svelte-s6zq7o");
    			set_style(div47, "background-color", /*$keys*/ ctx[2]["c"].color);
    			toggle_class(div47, "show", /*$keys*/ ctx[2]["c"].color);
    			add_location(div47, file$u, 212, 4, 7727);
    			attr_dev(div48, "class", "key svelte-s6zq7o");
    			set_style(div48, "background-color", /*$keys*/ ctx[2]["v"].color);
    			toggle_class(div48, "show", /*$keys*/ ctx[2]["v"].color);
    			add_location(div48, file$u, 215, 4, 7865);
    			attr_dev(div49, "class", "key svelte-s6zq7o");
    			set_style(div49, "background-color", /*$keys*/ ctx[2]["b"].color);
    			toggle_class(div49, "show", /*$keys*/ ctx[2]["b"].color);
    			add_location(div49, file$u, 218, 4, 8003);
    			attr_dev(div50, "class", "key svelte-s6zq7o");
    			set_style(div50, "background-color", /*$keys*/ ctx[2]["n"].color);
    			toggle_class(div50, "show", /*$keys*/ ctx[2]["n"].color);
    			add_location(div50, file$u, 221, 4, 8141);
    			attr_dev(div51, "class", "key svelte-s6zq7o");
    			set_style(div51, "background-color", /*$keys*/ ctx[2]["m"].color);
    			toggle_class(div51, "show", /*$keys*/ ctx[2]["m"].color);
    			add_location(div51, file$u, 224, 4, 8279);
    			attr_dev(div52, "class", "key svelte-s6zq7o");
    			set_style(div52, "background-color", /*$keys*/ ctx[2][","].color);
    			toggle_class(div52, "show", /*$keys*/ ctx[2][","].color);
    			add_location(div52, file$u, 227, 4, 8417);
    			attr_dev(div53, "class", "key svelte-s6zq7o");
    			set_style(div53, "background-color", /*$keys*/ ctx[2]["."].color);
    			toggle_class(div53, "show", /*$keys*/ ctx[2]["."].color);
    			add_location(div53, file$u, 230, 4, 8555);
    			attr_dev(div54, "class", "key svelte-s6zq7o");
    			set_style(div54, "background-color", /*$keys*/ ctx[2]["/"].color);
    			toggle_class(div54, "show", /*$keys*/ ctx[2]["/"].color);
    			add_location(div54, file$u, 233, 4, 8693);
    			attr_dev(div55, "class", "key svelte-s6zq7o");
    			set_style(div55, "background-color", /*$keys*/ ctx[2]["rshift"].color);
    			set_style(div55, "opacity", /*$keys*/ ctx[2]["rshift"].opacity);
    			set_style(div55, "flex", "2.2");
    			toggle_class(div55, "show", /*$keys*/ ctx[2]["rshift"].color);
    			add_location(div55, file$u, 236, 4, 8831);
    			attr_dev(div56, "class", "row svelte-s6zq7o");
    			add_location(div56, file$u, 199, 2, 7213);
    			attr_dev(div57, "class", "key svelte-s6zq7o");
    			set_style(div57, "background-color", /*$keys*/ ctx[2]["lctrl"].color);
    			set_style(div57, "opacity", /*$keys*/ ctx[2]["lctrl"].opacity);
    			set_style(div57, "flex", "1.4");
    			toggle_class(div57, "show", /*$keys*/ ctx[2]["lctrl"].color);
    			add_location(div57, file$u, 244, 4, 9076);
    			attr_dev(div58, "class", "key svelte-s6zq7o");
    			set_style(div58, "background-color", /*$keys*/ ctx[2]["lopt"].color);
    			set_style(div58, "opacity", /*$keys*/ ctx[2]["lopt"].opacity);
    			set_style(div58, "flex", "1.4");
    			toggle_class(div58, "show", /*$keys*/ ctx[2]["lopt"].color);
    			add_location(div58, file$u, 250, 4, 9288);
    			attr_dev(div59, "class", "key svelte-s6zq7o");
    			set_style(div59, "background-color", /*$keys*/ ctx[2]["lcmd"].color);
    			set_style(div59, "opacity", /*$keys*/ ctx[2]["lcmd"].opacity);
    			set_style(div59, "flex", "1.4");
    			toggle_class(div59, "show", /*$keys*/ ctx[2]["lcmd"].color);
    			add_location(div59, file$u, 256, 4, 9496);
    			attr_dev(div60, "class", "key svelte-s6zq7o");
    			set_style(div60, "background-color", /*$keys*/ ctx[2]["space"].color);
    			set_style(div60, "opacity", /*$keys*/ ctx[2]["space"].opacity);
    			set_style(div60, "flex", "6.8");
    			toggle_class(div60, "show", /*$keys*/ ctx[2]["space"].color);
    			add_location(div60, file$u, 262, 4, 9704);
    			attr_dev(div61, "class", "key svelte-s6zq7o");
    			set_style(div61, "background-color", /*$keys*/ ctx[2]["rcmd"].color);
    			set_style(div61, "opacity", /*$keys*/ ctx[2]["rcmd"].opacity);
    			set_style(div61, "flex", "1.4");
    			toggle_class(div61, "show", /*$keys*/ ctx[2]["rcmd"].color);
    			add_location(div61, file$u, 268, 4, 9916);
    			attr_dev(div62, "class", "key svelte-s6zq7o");
    			set_style(div62, "background-color", /*$keys*/ ctx[2]["ropt"].color);
    			set_style(div62, "opacity", /*$keys*/ ctx[2]["ropt"].opacity);
    			set_style(div62, "flex", "1.4");
    			toggle_class(div62, "show", /*$keys*/ ctx[2]["ropt"].color);
    			add_location(div62, file$u, 274, 4, 10124);
    			attr_dev(div63, "class", "key svelte-s6zq7o");
    			set_style(div63, "background-color", /*$keys*/ ctx[2]["rctrl"].color);
    			set_style(div63, "opacity", /*$keys*/ ctx[2]["rctrl"].opacity);
    			set_style(div63, "flex", "1.4");
    			toggle_class(div63, "show", /*$keys*/ ctx[2]["rctrl"].color);
    			add_location(div63, file$u, 280, 4, 10332);
    			attr_dev(div64, "class", "row svelte-s6zq7o");
    			add_location(div64, file$u, 243, 2, 9054);
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

    /* src/01.punctuation/Punctuation.1.svelte generated by Svelte v3.24.1 */

    const file$v = "src/01.punctuation/Punctuation.1.svelte";

    // (49:4) <Keyboard>
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
    			props: { key: "rshift", fill: "red", show: "" },
    			$$inline: true
    		});

    	key1 = new Key({
    			props: { key: "lshift", fill: "red", show: "" },
    			$$inline: true
    		});

    	key2 = new Key({
    			props: { key: "rctrl", fill: "red", show: "" },
    			$$inline: true
    		});

    	key3 = new Key({
    			props: { key: "ropt", fill: "red", show: "" },
    			$$inline: true
    		});

    	key4 = new Key({
    			props: { key: "rcmd", fill: "red", show: "" },
    			$$inline: true
    		});

    	key5 = new Key({
    			props: { key: "lctrl", fill: "red", show: "" },
    			$$inline: true
    		});

    	key6 = new Key({
    			props: { key: "lopt", fill: "red", show: "" },
    			$$inline: true
    		});

    	key7 = new Key({
    			props: { key: "lcmd", fill: "red", show: "" },
    			$$inline: true
    		});

    	key8 = new Key({
    			props: { key: "caps", fill: "red", show: "" },
    			$$inline: true
    		});

    	key9 = new Key({
    			props: { key: "space", fill: "#94b4d4", show: "" },
    			$$inline: true
    		});

    	key10 = new Key({
    			props: { key: "enter", fill: "#94b4d4", show: "" },
    			$$inline: true
    		});

    	key11 = new Key({
    			props: { key: "tab", fill: "#94b4d4", show: "" },
    			$$inline: true
    		});

    	key12 = new Key({
    			props: { key: "del", fill: "#94b4d4", show: "" },
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
    		source: "(49:4) <Keyboard>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$y(ctx) {
    	let div1;
    	let div0;
    	let keyboard;
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
    			attr_dev(div0, "class", "container svelte-pd4tiw");
    			add_location(div0, file$v, 47, 2, 853);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$v, 46, 0, 833);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(keyboard, div0, null);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Punctuation_1", $$slots, []);
    	$$self.$capture_state = () => ({ Keyboard, Key });
    	return [];
    }

    class Punctuation_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_1",
    			options,
    			id: create_fragment$y.name
    		});
    	}
    }

    /* src/01.punctuation/Punctuation.2.svelte generated by Svelte v3.24.1 */

    const file$w = "src/01.punctuation/Punctuation.2.svelte";

    function create_fragment$z(ctx) {
    	let div66;
    	let div65;
    	let div14;
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
    	let div8;
    	let t17;
    	let div9;
    	let t19;
    	let div10;
    	let t21;
    	let div11;
    	let t23;
    	let div12;
    	let t25;
    	let div13;
    	let t27;
    	let div29;
    	let div15;
    	let t29;
    	let div16;
    	let t31;
    	let div17;
    	let t33;
    	let div18;
    	let t35;
    	let div19;
    	let t37;
    	let div20;
    	let t39;
    	let div21;
    	let t41;
    	let div22;
    	let t43;
    	let div23;
    	let t45;
    	let div24;
    	let t47;
    	let div25;
    	let t49;
    	let div26;
    	let t51;
    	let div27;
    	let t53;
    	let div28;
    	let t55;
    	let div43;
    	let div30;
    	let t57;
    	let div31;
    	let t59;
    	let div32;
    	let t61;
    	let div33;
    	let t63;
    	let div34;
    	let t65;
    	let div35;
    	let t67;
    	let div36;
    	let t69;
    	let div37;
    	let t71;
    	let div38;
    	let t73;
    	let div39;
    	let t75;
    	let div40;
    	let t77;
    	let div41;
    	let t79;
    	let div42;
    	let t81;
    	let div56;
    	let div44;
    	let t83;
    	let div45;
    	let t85;
    	let div46;
    	let t87;
    	let div47;
    	let t89;
    	let div48;
    	let t91;
    	let div49;
    	let t93;
    	let div50;
    	let t95;
    	let div51;
    	let t97;
    	let div52;
    	let t99;
    	let div53;
    	let t101;
    	let div54;
    	let t103;
    	let div55;
    	let t105;
    	let div64;
    	let div57;
    	let t107;
    	let div58;
    	let t109;
    	let div59;
    	let t111;
    	let div60;
    	let t112;
    	let div61;
    	let t114;
    	let div62;
    	let t116;
    	let div63;

    	const block = {
    		c: function create() {
    			div66 = element("div");
    			div65 = element("div");
    			div14 = element("div");
    			div0 = element("div");
    			div0.textContent = "~";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "!";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "@";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "#";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "$";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "%";
    			t11 = space();
    			div6 = element("div");
    			div6.textContent = "^";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "&";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "*";
    			t17 = space();
    			div9 = element("div");
    			div9.textContent = "(";
    			t19 = space();
    			div10 = element("div");
    			div10.textContent = ")";
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "-";
    			t23 = space();
    			div12 = element("div");
    			div12.textContent = "=";
    			t25 = space();
    			div13 = element("div");
    			div13.textContent = "⟵";
    			t27 = space();
    			div29 = element("div");
    			div15 = element("div");
    			div15.textContent = "tab";
    			t29 = space();
    			div16 = element("div");
    			div16.textContent = "q";
    			t31 = space();
    			div17 = element("div");
    			div17.textContent = "w";
    			t33 = space();
    			div18 = element("div");
    			div18.textContent = "e";
    			t35 = space();
    			div19 = element("div");
    			div19.textContent = "r";
    			t37 = space();
    			div20 = element("div");
    			div20.textContent = "t";
    			t39 = space();
    			div21 = element("div");
    			div21.textContent = "y";
    			t41 = space();
    			div22 = element("div");
    			div22.textContent = "u";
    			t43 = space();
    			div23 = element("div");
    			div23.textContent = "i";
    			t45 = space();
    			div24 = element("div");
    			div24.textContent = "o";
    			t47 = space();
    			div25 = element("div");
    			div25.textContent = "p";
    			t49 = space();
    			div26 = element("div");
    			div26.textContent = "[";
    			t51 = space();
    			div27 = element("div");
    			div27.textContent = "]";
    			t53 = space();
    			div28 = element("div");
    			div28.textContent = "\\";
    			t55 = space();
    			div43 = element("div");
    			div30 = element("div");
    			div30.textContent = "caps";
    			t57 = space();
    			div31 = element("div");
    			div31.textContent = "a";
    			t59 = space();
    			div32 = element("div");
    			div32.textContent = "s";
    			t61 = space();
    			div33 = element("div");
    			div33.textContent = "d";
    			t63 = space();
    			div34 = element("div");
    			div34.textContent = "f";
    			t65 = space();
    			div35 = element("div");
    			div35.textContent = "g";
    			t67 = space();
    			div36 = element("div");
    			div36.textContent = "h";
    			t69 = space();
    			div37 = element("div");
    			div37.textContent = "j";
    			t71 = space();
    			div38 = element("div");
    			div38.textContent = "k";
    			t73 = space();
    			div39 = element("div");
    			div39.textContent = "l";
    			t75 = space();
    			div40 = element("div");
    			div40.textContent = ";";
    			t77 = space();
    			div41 = element("div");
    			div41.textContent = "'";
    			t79 = space();
    			div42 = element("div");
    			div42.textContent = "↵";
    			t81 = space();
    			div56 = element("div");
    			div44 = element("div");
    			div44.textContent = "⇧";
    			t83 = space();
    			div45 = element("div");
    			div45.textContent = "z";
    			t85 = space();
    			div46 = element("div");
    			div46.textContent = "x";
    			t87 = space();
    			div47 = element("div");
    			div47.textContent = "c";
    			t89 = space();
    			div48 = element("div");
    			div48.textContent = "v";
    			t91 = space();
    			div49 = element("div");
    			div49.textContent = "b";
    			t93 = space();
    			div50 = element("div");
    			div50.textContent = "n";
    			t95 = space();
    			div51 = element("div");
    			div51.textContent = "m";
    			t97 = space();
    			div52 = element("div");
    			div52.textContent = ",";
    			t99 = space();
    			div53 = element("div");
    			div53.textContent = ".";
    			t101 = space();
    			div54 = element("div");
    			div54.textContent = "/";
    			t103 = space();
    			div55 = element("div");
    			div55.textContent = "⇧";
    			t105 = space();
    			div64 = element("div");
    			div57 = element("div");
    			div57.textContent = "⌃";
    			t107 = space();
    			div58 = element("div");
    			div58.textContent = "⌥";
    			t109 = space();
    			div59 = element("div");
    			div59.textContent = "⌘";
    			t111 = space();
    			div60 = element("div");
    			t112 = space();
    			div61 = element("div");
    			div61.textContent = "⌘";
    			t114 = space();
    			div62 = element("div");
    			div62.textContent = "⌥";
    			t116 = space();
    			div63 = element("div");
    			div63.textContent = "⌃";
    			attr_dev(div0, "class", "key show svelte-4wi716");
    			set_style(div0, "max-width", "30px");
    			add_location(div0, file$w, 48, 6, 845);
    			attr_dev(div1, "class", "key show nope svelte-4wi716");
    			add_location(div1, file$w, 49, 6, 905);
    			attr_dev(div2, "class", "key show svelte-4wi716");
    			add_location(div2, file$w, 50, 6, 946);
    			attr_dev(div3, "class", "key show svelte-4wi716");
    			add_location(div3, file$w, 51, 6, 982);
    			attr_dev(div4, "class", "key show nope svelte-4wi716");
    			add_location(div4, file$w, 52, 6, 1018);
    			attr_dev(div5, "class", "key show nope svelte-4wi716");
    			add_location(div5, file$w, 53, 6, 1059);
    			attr_dev(div6, "class", "key show svelte-4wi716");
    			add_location(div6, file$w, 54, 6, 1100);
    			attr_dev(div7, "class", "key show svelte-4wi716");
    			add_location(div7, file$w, 55, 6, 1136);
    			attr_dev(div8, "class", "key show svelte-4wi716");
    			add_location(div8, file$w, 56, 6, 1172);
    			attr_dev(div9, "class", "key show nope svelte-4wi716");
    			add_location(div9, file$w, 57, 6, 1208);
    			attr_dev(div10, "class", "key show nope svelte-4wi716");
    			add_location(div10, file$w, 58, 6, 1249);
    			attr_dev(div11, "class", "key show nope svelte-4wi716");
    			add_location(div11, file$w, 59, 6, 1290);
    			attr_dev(div12, "class", "key show nope svelte-4wi716");
    			add_location(div12, file$w, 60, 6, 1331);
    			attr_dev(div13, "class", "key nope pink svelte-4wi716");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$w, 61, 6, 1372);
    			attr_dev(div14, "class", "row svelte-4wi716");
    			add_location(div14, file$w, 47, 4, 821);
    			attr_dev(div15, "class", "key nope pink svelte-4wi716");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$w, 64, 6, 1465);
    			attr_dev(div16, "class", "key nope svelte-4wi716");
    			add_location(div16, file$w, 65, 6, 1527);
    			attr_dev(div17, "class", "key nope svelte-4wi716");
    			add_location(div17, file$w, 66, 6, 1563);
    			attr_dev(div18, "class", "key nope svelte-4wi716");
    			add_location(div18, file$w, 67, 6, 1599);
    			attr_dev(div19, "class", "key nope svelte-4wi716");
    			add_location(div19, file$w, 68, 6, 1635);
    			attr_dev(div20, "class", "key nope svelte-4wi716");
    			add_location(div20, file$w, 69, 6, 1671);
    			attr_dev(div21, "class", "key nope svelte-4wi716");
    			add_location(div21, file$w, 70, 6, 1707);
    			attr_dev(div22, "class", "key nope svelte-4wi716");
    			add_location(div22, file$w, 71, 6, 1743);
    			attr_dev(div23, "class", "key nope svelte-4wi716");
    			add_location(div23, file$w, 72, 6, 1779);
    			attr_dev(div24, "class", "key nope svelte-4wi716");
    			add_location(div24, file$w, 73, 6, 1815);
    			attr_dev(div25, "class", "key nope svelte-4wi716");
    			add_location(div25, file$w, 74, 6, 1851);
    			attr_dev(div26, "class", "key show svelte-4wi716");
    			add_location(div26, file$w, 75, 6, 1887);
    			attr_dev(div27, "class", "key show svelte-4wi716");
    			add_location(div27, file$w, 76, 6, 1923);
    			attr_dev(div28, "class", "key show svelte-4wi716");
    			add_location(div28, file$w, 77, 6, 1959);
    			attr_dev(div29, "class", "row svelte-4wi716");
    			add_location(div29, file$w, 63, 4, 1441);
    			attr_dev(div30, "class", "key nope pink svelte-4wi716");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$w, 80, 6, 2028);
    			attr_dev(div31, "class", "key nope svelte-4wi716");
    			add_location(div31, file$w, 81, 6, 2091);
    			attr_dev(div32, "class", "key nope svelte-4wi716");
    			add_location(div32, file$w, 82, 6, 2127);
    			attr_dev(div33, "class", "key nope svelte-4wi716");
    			add_location(div33, file$w, 83, 6, 2163);
    			attr_dev(div34, "class", "key nope svelte-4wi716");
    			add_location(div34, file$w, 84, 6, 2199);
    			attr_dev(div35, "class", "key nope svelte-4wi716");
    			add_location(div35, file$w, 85, 6, 2235);
    			attr_dev(div36, "class", "key nope svelte-4wi716");
    			add_location(div36, file$w, 86, 6, 2271);
    			attr_dev(div37, "class", "key nope svelte-4wi716");
    			add_location(div37, file$w, 87, 6, 2307);
    			attr_dev(div38, "class", "key nope svelte-4wi716");
    			add_location(div38, file$w, 88, 6, 2343);
    			attr_dev(div39, "class", "key nope svelte-4wi716");
    			add_location(div39, file$w, 89, 6, 2379);
    			attr_dev(div40, "class", "key nope show svelte-4wi716");
    			add_location(div40, file$w, 90, 6, 2415);
    			attr_dev(div41, "class", "key nope show svelte-4wi716");
    			add_location(div41, file$w, 91, 6, 2456);
    			attr_dev(div42, "class", "key nope pink svelte-4wi716");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$w, 92, 6, 2497);
    			attr_dev(div43, "class", "row svelte-4wi716");
    			add_location(div43, file$w, 79, 4, 2004);
    			attr_dev(div44, "class", "key nope pink svelte-4wi716");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$w, 95, 6, 2590);
    			attr_dev(div45, "class", "key nope svelte-4wi716");
    			add_location(div45, file$w, 96, 6, 2651);
    			attr_dev(div46, "class", "key nope svelte-4wi716");
    			add_location(div46, file$w, 97, 6, 2687);
    			attr_dev(div47, "class", "key nope svelte-4wi716");
    			add_location(div47, file$w, 98, 6, 2723);
    			attr_dev(div48, "class", "key nope svelte-4wi716");
    			add_location(div48, file$w, 99, 6, 2759);
    			attr_dev(div49, "class", "key nope svelte-4wi716");
    			add_location(div49, file$w, 100, 6, 2795);
    			attr_dev(div50, "class", "key nope svelte-4wi716");
    			add_location(div50, file$w, 101, 6, 2831);
    			attr_dev(div51, "class", "key nope svelte-4wi716");
    			add_location(div51, file$w, 102, 6, 2867);
    			attr_dev(div52, "class", "key nope show svelte-4wi716");
    			add_location(div52, file$w, 103, 6, 2903);
    			attr_dev(div53, "class", "key nope show svelte-4wi716");
    			add_location(div53, file$w, 104, 6, 2944);
    			attr_dev(div54, "class", "key nope show svelte-4wi716");
    			add_location(div54, file$w, 105, 6, 2985);
    			attr_dev(div55, "class", "key nope pink svelte-4wi716");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$w, 106, 6, 3026);
    			attr_dev(div56, "class", "row svelte-4wi716");
    			add_location(div56, file$w, 94, 4, 2566);
    			attr_dev(div57, "class", "key nope pink svelte-4wi716");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$w, 109, 6, 3120);
    			attr_dev(div58, "class", "key nope pink svelte-4wi716");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$w, 110, 6, 3180);
    			attr_dev(div59, "class", "key nope pink svelte-4wi716");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$w, 111, 6, 3240);
    			attr_dev(div60, "class", "key nope  svelte-4wi716");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$w, 112, 6, 3300);
    			attr_dev(div61, "class", "key nope pink svelte-4wi716");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$w, 113, 6, 3352);
    			attr_dev(div62, "class", "key nope pink svelte-4wi716");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$w, 114, 6, 3412);
    			attr_dev(div63, "class", "key nope pink svelte-4wi716");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$w, 115, 6, 3472);
    			attr_dev(div64, "class", "row svelte-4wi716");
    			add_location(div64, file$w, 108, 4, 3096);
    			attr_dev(div65, "class", "container svelte-4wi716");
    			add_location(div65, file$w, 46, 2, 793);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$w, 45, 0, 773);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div66, anchor);
    			append_dev(div66, div65);
    			append_dev(div65, div14);
    			append_dev(div14, div0);
    			append_dev(div14, t1);
    			append_dev(div14, div1);
    			append_dev(div14, t3);
    			append_dev(div14, div2);
    			append_dev(div14, t5);
    			append_dev(div14, div3);
    			append_dev(div14, t7);
    			append_dev(div14, div4);
    			append_dev(div14, t9);
    			append_dev(div14, div5);
    			append_dev(div14, t11);
    			append_dev(div14, div6);
    			append_dev(div14, t13);
    			append_dev(div14, div7);
    			append_dev(div14, t15);
    			append_dev(div14, div8);
    			append_dev(div14, t17);
    			append_dev(div14, div9);
    			append_dev(div14, t19);
    			append_dev(div14, div10);
    			append_dev(div14, t21);
    			append_dev(div14, div11);
    			append_dev(div14, t23);
    			append_dev(div14, div12);
    			append_dev(div14, t25);
    			append_dev(div14, div13);
    			append_dev(div65, t27);
    			append_dev(div65, div29);
    			append_dev(div29, div15);
    			append_dev(div29, t29);
    			append_dev(div29, div16);
    			append_dev(div29, t31);
    			append_dev(div29, div17);
    			append_dev(div29, t33);
    			append_dev(div29, div18);
    			append_dev(div29, t35);
    			append_dev(div29, div19);
    			append_dev(div29, t37);
    			append_dev(div29, div20);
    			append_dev(div29, t39);
    			append_dev(div29, div21);
    			append_dev(div29, t41);
    			append_dev(div29, div22);
    			append_dev(div29, t43);
    			append_dev(div29, div23);
    			append_dev(div29, t45);
    			append_dev(div29, div24);
    			append_dev(div29, t47);
    			append_dev(div29, div25);
    			append_dev(div29, t49);
    			append_dev(div29, div26);
    			append_dev(div29, t51);
    			append_dev(div29, div27);
    			append_dev(div29, t53);
    			append_dev(div29, div28);
    			append_dev(div65, t55);
    			append_dev(div65, div43);
    			append_dev(div43, div30);
    			append_dev(div43, t57);
    			append_dev(div43, div31);
    			append_dev(div43, t59);
    			append_dev(div43, div32);
    			append_dev(div43, t61);
    			append_dev(div43, div33);
    			append_dev(div43, t63);
    			append_dev(div43, div34);
    			append_dev(div43, t65);
    			append_dev(div43, div35);
    			append_dev(div43, t67);
    			append_dev(div43, div36);
    			append_dev(div43, t69);
    			append_dev(div43, div37);
    			append_dev(div43, t71);
    			append_dev(div43, div38);
    			append_dev(div43, t73);
    			append_dev(div43, div39);
    			append_dev(div43, t75);
    			append_dev(div43, div40);
    			append_dev(div43, t77);
    			append_dev(div43, div41);
    			append_dev(div43, t79);
    			append_dev(div43, div42);
    			append_dev(div65, t81);
    			append_dev(div65, div56);
    			append_dev(div56, div44);
    			append_dev(div56, t83);
    			append_dev(div56, div45);
    			append_dev(div56, t85);
    			append_dev(div56, div46);
    			append_dev(div56, t87);
    			append_dev(div56, div47);
    			append_dev(div56, t89);
    			append_dev(div56, div48);
    			append_dev(div56, t91);
    			append_dev(div56, div49);
    			append_dev(div56, t93);
    			append_dev(div56, div50);
    			append_dev(div56, t95);
    			append_dev(div56, div51);
    			append_dev(div56, t97);
    			append_dev(div56, div52);
    			append_dev(div56, t99);
    			append_dev(div56, div53);
    			append_dev(div56, t101);
    			append_dev(div56, div54);
    			append_dev(div56, t103);
    			append_dev(div56, div55);
    			append_dev(div65, t105);
    			append_dev(div65, div64);
    			append_dev(div64, div57);
    			append_dev(div64, t107);
    			append_dev(div64, div58);
    			append_dev(div64, t109);
    			append_dev(div64, div59);
    			append_dev(div64, t111);
    			append_dev(div64, div60);
    			append_dev(div64, t112);
    			append_dev(div64, div61);
    			append_dev(div64, t114);
    			append_dev(div64, div62);
    			append_dev(div64, t116);
    			append_dev(div64, div63);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div66);
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

    function instance$z($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Punctuation_2", $$slots, []);
    	return [];
    }

    class Punctuation_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_2",
    			options,
    			id: create_fragment$z.name
    		});
    	}
    }

    /* src/01.punctuation/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$A(ctx) {
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
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Typewriter_1, Tilde, Typewriter_2, Punctuation_1, Punctuation_2];
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
    		Typewriter1: Typewriter_1,
    		Tilde,
    		Typewriter2: Typewriter_2,
    		Punctuation1: Punctuation_1,
    		Punctuation2: Punctuation_2,
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
    		init(this, options, instance$A, create_fragment$A, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_punctuation",
    			options,
    			id: create_fragment$A.name
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

    /* src/02.markup/Escaping.svelte generated by Svelte v3.24.1 */
    const file$x = "src/02.markup/Escaping.svelte";

    function create_fragment$B(ctx) {
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
    			add_location(div0, file$x, 7, 0, 137);
    			add_location(li, file$x, 12, 2, 208);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$x, 11, 0, 186);
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
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Escaping",
    			options,
    			id: create_fragment$B.name
    		});
    	}
    }

    /* src/02.markup/Newline.svelte generated by Svelte v3.24.1 */

    const file$y = "src/02.markup/Newline.svelte";

    function create_fragment$C(ctx) {
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
    			li2.textContent = "typewriters";
    			attr_dev(div0, "class", "box f4 svelte-1d5z98v");
    			add_location(div0, file$y, 11, 0, 99);
    			add_location(i, file$y, 16, 4, 175);
    			add_location(li0, file$y, 14, 2, 156);
    			add_location(li1, file$y, 19, 2, 223);
    			add_location(li2, file$y, 20, 2, 271);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$y, 13, 0, 134);
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
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props) {
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
    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Newline",
    			options,
    			id: create_fragment$C.name
    		});
    	}
    }

    /* src/02.markup/Wikipedia.svelte generated by Svelte v3.24.1 */
    const file$z = "src/02.markup/Wikipedia.svelte";

    function create_fragment$D(ctx) {
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
    			add_location(div0, file$z, 7, 0, 136);
    			add_location(li0, file$z, 12, 2, 207);
    			add_location(li1, file$z, 13, 2, 238);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$z, 11, 0, 185);
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
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$D($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wikipedia",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    /* src/02.markup/Question.svelte generated by Svelte v3.24.1 */

    const file$A = "src/02.markup/Question.svelte";

    function create_fragment$E(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let span;
    	let t3;
    	let div2;
    	let t5;
    	let div5;
    	let li;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "how can you";
    			t1 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "write";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "data?";
    			t5 = space();
    			div5 = element("div");
    			li = element("li");
    			add_location(div0, file$A, 23, 4, 296);
    			attr_dev(span, "class", "red i");
    			add_location(span, file$A, 25, 6, 347);
    			attr_dev(div1, "class", "med svelte-10y1wyx");
    			add_location(div1, file$A, 24, 4, 323);
    			attr_dev(div2, "class", "blue med goright svelte-10y1wyx");
    			add_location(div2, file$A, 27, 4, 395);
    			add_location(div3, file$A, 22, 2, 286);
    			attr_dev(div4, "class", "box big svelte-10y1wyx");
    			add_location(div4, file$A, 21, 0, 262);
    			add_location(li, file$A, 31, 2, 475);
    			attr_dev(div5, "class", "notes");
    			add_location(div5, file$A, 30, 0, 453);
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
    			append_dev(div1, span);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div5);
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

    function instance$E($$self, $$props) {
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
    		init(this, options, instance$E, create_fragment$E, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$E.name
    		});
    	}
    }

    /* src/02.markup/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$F(ctx) {
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
    		id: create_fragment$F.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Newline, Escaping, Question$1, Wikipedia];
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
    		Escaping,
    		Newline,
    		Wikipedia,
    		Question: Question$1,
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
    		init(this, options, instance$F, create_fragment$F, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_02_markup",
    			options,
    			id: create_fragment$F.name
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

    /* src/03.text-editor/Drake.svelte generated by Svelte v3.24.1 */
    const file$B = "src/03.text-editor/Drake.svelte";

    function create_fragment$G(ctx) {
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
    			add_location(div, file$B, 12, 0, 197);
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
    		id: create_fragment$G.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$G($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/03.text-editor/assets/drake.mp4"
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
    		init(this, options, instance$G, create_fragment$G, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Drake",
    			options,
    			id: create_fragment$G.name
    		});
    	}
    }

    /* src/03.text-editor/Timeline.svelte generated by Svelte v3.24.1 */

    const file$C = "src/03.text-editor/Timeline.svelte";

    function create_fragment$H(ctx) {
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
    			if (img.src !== (img_src_value = "./src/03.text-editor/assets/refactoring-timeline.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$C, 33, 4, 845);
    			attr_dev(div0, "class", "middle svelte-yixigh");
    			add_location(div0, file$C, 32, 2, 820);
    			attr_dev(div1, "class", "box ");
    			add_location(div1, file$C, 31, 0, 799);
    			attr_dev(div2, "class", "notes");
    			add_location(div2, file$C, 58, 0, 1545);
    			add_location(li, file$C, 59, 0, 1567);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);
    	return [];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$H, create_fragment$H, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$H.name
    		});
    	}
    }

    /* src/03.text-editor/index.svelte generated by Svelte v3.24.1 */

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_03_text_editor> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_03_text_editor", $$slots, []);

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

    class _03_text_editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$I, create_fragment$I, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_03_text_editor",
    			options,
    			id: create_fragment$I.name
    		});
    	}

    	get done() {
    		throw new Error("<_03_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_03_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_03_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_03_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_03_text_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_03_text_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/04.word-wrap/Spreadsheet.svelte generated by Svelte v3.24.1 */

    const file$D = "src/04.word-wrap/Spreadsheet.svelte";

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
    			add_location(div, file$D, 60, 6, 1276);
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
    			add_location(div, file$D, 69, 10, 1563);
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
    			add_location(div, file$D, 67, 10, 1496);
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
    			add_location(div, file$D, 64, 6, 1375);
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

    function create_fragment$J(ctx) {
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
    			add_location(div0, file$D, 58, 4, 1207);
    			attr_dev(div1, "class", "container svelte-10qh3b4");
    			add_location(div1, file$D, 56, 2, 1158);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$D, 55, 0, 1138);
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
    		id: create_fragment$J.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$J($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$J, create_fragment$J, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spreadsheet",
    			options,
    			id: create_fragment$J.name
    		});
    	}
    }

    /* src/04.word-wrap/Wrap.svelte generated by Svelte v3.24.1 */
    const file$E = "src/04.word-wrap/Wrap.svelte";

    function create_fragment$K(ctx) {
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
    			add_location(div, file$E, 13, 0, 215);
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
    		id: create_fragment$K.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$K($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/04.word-wrap/assets/word-wrap.mp4",
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
    		init(this, options, instance$K, create_fragment$K, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap",
    			options,
    			id: create_fragment$K.name
    		});
    	}
    }

    /* src/04.word-wrap/Insert.svelte generated by Svelte v3.24.1 */
    const file$F = "src/04.word-wrap/Insert.svelte";

    function create_fragment$L(ctx) {
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
    			add_location(div, file$F, 21, 0, 324);
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
    		id: create_fragment$L.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$L($$self, $$props, $$invalidate) {
    	let images = [
    		{
    			src: "./src/04.word-wrap/assets/insert-1.png"
    		},
    		{
    			src: "./src/04.word-wrap/assets/insert-2.png"
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
    		init(this, options, instance$L, create_fragment$L, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Insert",
    			options,
    			id: create_fragment$L.name
    		});
    	}
    }

    /* src/04.word-wrap/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$M(ctx) {
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
    		id: create_fragment$M.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$M($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_04_word_wrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_04_word_wrap", $$slots, []);

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

    class _04_word_wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$M, create_fragment$M, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_04_word_wrap",
    			options,
    			id: create_fragment$M.name
    		});
    	}

    	get done() {
    		throw new Error("<_04_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_04_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_04_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_04_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_04_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_04_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/05.focus/Zelda.svelte generated by Svelte v3.24.1 */
    const file$G = "src/05.focus/Zelda.svelte";

    function create_fragment$N(ctx) {
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
    			add_location(div, file$G, 12, 0, 193);
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
    		id: create_fragment$N.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$N($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$N, create_fragment$N, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zelda",
    			options,
    			id: create_fragment$N.name
    		});
    	}
    }

    /* src/05.focus/Canon-cat.svelte generated by Svelte v3.24.1 */
    const file$H = "src/05.focus/Canon-cat.svelte";

    function create_fragment$O(ctx) {
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
    			add_location(div, file$H, 9, 0, 186);
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
    		id: create_fragment$O.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$O($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$O, create_fragment$O, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canon_cat",
    			options,
    			id: create_fragment$O.name
    		});
    	}
    }

    /* src/05.focus/index.svelte generated by Svelte v3.24.1 */

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
    	let steps = [Zelda, Canon_cat];
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
    		init(this, options, instance$P, create_fragment$P, safe_not_equal, { done: 4, prev: 5, doEnd: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_05_focus",
    			options,
    			id: create_fragment$P.name
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

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$I = "src/App.svelte";

    function create_fragment$Q(ctx) {
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
    			option4.textContent = "text-editor";
    			option5 = element("option");
    			option5.textContent = "wrapping";
    			option6 = element("option");
    			option6.textContent = "focus";
    			t10 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(div0, file$I, 47, 0, 969);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$I, 50, 4, 1080);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$I, 51, 4, 1117);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$I, 52, 4, 1158);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$I, 53, 4, 1201);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$I, 54, 4, 1239);
    			option5.__value = "5";
    			option5.value = option5.__value;
    			add_location(option5, file$I, 55, 4, 1282);
    			option6.__value = "6";
    			option6.value = option6.__value;
    			add_location(option6, file$I, 56, 4, 1322);
    			if (/*i*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[6].call(select));
    			add_location(select, file$I, 49, 2, 998);
    			add_location(div1, file$I, 48, 0, 990);
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
    		id: create_fragment$Q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = e => e.preventDefault();

    function instance$Q($$self, $$props, $$invalidate) {
    	setContext("size", { width: 1280, height: 720 });
    	let i = 0;
    	let steps = [_00_intro, _01_keyboards, _01_punctuation, _02_markup, _03_text_editor, _04_word_wrap, _05_focus];
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
    		Intro: _00_intro,
    		Keyboards: _01_keyboards,
    		Punctuation: _01_punctuation,
    		Markup: _02_markup,
    		TextEditor: _03_text_editor,
    		Wrapping: _04_word_wrap,
    		Focus: _05_focus,
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
    		init(this, options, instance$Q, create_fragment$Q, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$Q.name
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
