
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

    // (40:0) {#if title}
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
    			attr_dev(div0, "class", "title svelte-1kjz4mv");
    			add_location(div0, file, 41, 4, 680);
    			attr_dev(div1, "class", "sub svelte-1kjz4mv");
    			add_location(div1, file, 42, 4, 717);
    			attr_dev(div2, "class", "caption svelte-1kjz4mv");
    			add_location(div2, file, 40, 2, 654);
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
    		source: "(40:0) {#if title}",
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
    			attr_dev(img, "class", "img svelte-1kjz4mv");
    			set_style(img, "margin-bottom", "0px");
    			if (img.src !== (img_src_value = /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file, 45, 0, 761);
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
    			li0.textContent = "hello";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "hello there too";
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$1, 9, 0, 181);
    			add_location(li0, file$1, 14, 2, 252);
    			add_location(li1, file$1, 15, 2, 269);
    			attr_dev(div1, "class", "notes");
    			add_location(div1, file$1, 13, 0, 230);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/00.intro/assets/splash.png",
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

    /* src/00.intro/Resolution-1.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/00.intro/Resolution-1.svelte";

    function create_fragment$2(ctx) {
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
    			div5.textContent = "◻️ - go to Toronto symphony";
    			attr_dev(div0, "class", "todo svelte-tvmeqn");
    			add_location(div0, file$2, 22, 4, 322);
    			attr_dev(div1, "class", "todo svelte-tvmeqn");
    			add_location(div1, file$2, 23, 4, 369);
    			attr_dev(div2, "class", "todo svelte-tvmeqn");
    			add_location(div2, file$2, 24, 4, 429);
    			attr_dev(div3, "class", "todo svelte-tvmeqn");
    			add_location(div3, file$2, 25, 4, 496);
    			attr_dev(div4, "class", "todo svelte-tvmeqn");
    			add_location(div4, file$2, 26, 4, 556);
    			attr_dev(div5, "class", "todo svelte-tvmeqn");
    			add_location(div5, file$2, 27, 4, 604);
    			attr_dev(div6, "class", "main svelte-tvmeqn");
    			add_location(div6, file$2, 21, 2, 299);
    			attr_dev(div7, "class", "box dark svelte-tvmeqn");
    			add_location(div7, file$2, 20, 0, 274);
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
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_1",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/00.intro/Resolution-2.svelte generated by Svelte v3.24.1 */

    const file$3 = "src/00.intro/Resolution-2.svelte";

    function create_fragment$3(ctx) {
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
    			div5.textContent = "◻️ - go to Toronto symphony";
    			attr_dev(div0, "class", "todo nope svelte-1opvdga");
    			add_location(div0, file$3, 27, 4, 413);
    			attr_dev(div1, "class", "todo nope svelte-1opvdga");
    			add_location(div1, file$3, 28, 4, 465);
    			attr_dev(div2, "class", "todo nope svelte-1opvdga");
    			add_location(div2, file$3, 29, 4, 530);
    			attr_dev(div3, "class", "todo svelte-1opvdga");
    			add_location(div3, file$3, 30, 4, 602);
    			attr_dev(div4, "class", "todo nope svelte-1opvdga");
    			add_location(div4, file$3, 31, 4, 662);
    			attr_dev(div5, "class", "todo nope svelte-1opvdga");
    			add_location(div5, file$3, 32, 4, 715);
    			attr_dev(div6, "class", "main svelte-1opvdga");
    			add_location(div6, file$3, 26, 2, 390);
    			attr_dev(div7, "class", "box dark svelte-1opvdga");
    			add_location(div7, file$3, 25, 0, 365);
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
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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

    function instance$3($$self, $$props) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_2",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Components/Video.svelte generated by Svelte v3.24.1 */

    const file$4 = "src/Components/Video.svelte";

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
    			add_location(div0, file$4, 42, 4, 707);
    			attr_dev(div1, "class", "sub svelte-18ucy0n");
    			add_location(div1, file$4, 43, 4, 744);
    			attr_dev(div2, "class", "caption svelte-18ucy0n");
    			add_location(div2, file$4, 41, 2, 681);
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

    function create_fragment$4(ctx) {
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
    			add_location(track, file$4, 47, 2, 854);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.loop = /*loop*/ ctx[3];
    			video.autoplay = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-18ucy0n");
    			add_location(video, file$4, 46, 0, 788);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { src: 0, title: 1, sub: 2, loop: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$4.name
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

    /* src/00.intro/Concepts.svelte generated by Svelte v3.24.1 */
    const file$5 = "src/00.intro/Concepts.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let video;
    	let current;
    	const video_spread_levels = [/*videos*/ ctx[1][/*i*/ ctx[0]]];
    	let video_props = {};

    	for (let i = 0; i < video_spread_levels.length; i += 1) {
    		video_props = assign(video_props, video_spread_levels[i]);
    	}

    	video = new Video({ props: video_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video.$$.fragment);
    			attr_dev(div, "class", "box");
    			add_location(div, file$5, 32, 0, 593);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const video_changes = (dirty & /*videos, i*/ 3)
    			? get_spread_update(video_spread_levels, [get_spread_object(/*videos*/ ctx[1][/*i*/ ctx[0]])])
    			: {};

    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video);
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
    	let videos = [
    		{
    			src: "./src/00.intro/assets/mercury-os.mp4",
    			title: "MercuryOs",
    			sub: "by Jason Yuan"
    		},
    		{
    			src: "./src/00.intro/assets/desktop-neo.mp4",
    			title: "Desktop Neo",
    			sub: "by Lennart Ziburski"
    		},
    		{
    			src: "./src/00.intro/assets/vr-os.mp4",
    			title: "VR-OS",
    			sub: "by Matthaeus Krenn"
    		}
    	];

    	let i = 0;

    	wait(9, () => {
    		$$invalidate(0, i += 1);

    		wait(5, () => {
    			$$invalidate(0, i += 1);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Concepts> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Concepts", $$slots, []);
    	$$self.$capture_state = () => ({ Video, wait, videos, i });

    	$$self.$inject_state = $$props => {
    		if ("videos" in $$props) $$invalidate(1, videos = $$props.videos);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, videos];
    }

    class Concepts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Concepts",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/00.intro/Shoulders.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/00.intro/Shoulders.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t;
    	let div1;
    	let image;
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
    			t = space();
    			div1 = element("div");
    			create_component(image.$$.fragment);
    			attr_dev(img, "class", "img svelte-4kxeno");
    			if (img.src !== (img_src_value = "./src/00.intro/assets/arms.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 28, 4, 472);
    			attr_dev(div0, "class", "background svelte-4kxeno");
    			add_location(div0, file$6, 27, 2, 443);
    			attr_dev(div1, "class", "mid svelte-4kxeno");
    			add_location(div1, file$6, 30, 2, 547);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$6, 26, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(image, div1, null);
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shoulders",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/00.intro/Bear.svelte generated by Svelte v3.24.1 */
    const file$7 = "src/00.intro/Bear.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(div, file$7, 9, 0, 181);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bear",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/00.intro/FigureSkating.svelte generated by Svelte v3.24.1 */
    const file$8 = "src/00.intro/FigureSkating.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(div, file$8, 12, 0, 211);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FigureSkating",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/00.intro/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$9(ctx) {
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*spaceBar*/ ctx[2], false, false, false);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
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
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Splash_page, Resolution_1, Resolution_2, Concepts, Shoulders, Bear, FigureSkating];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_00_intro> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_00_intro", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Splash: Splash_page,
    		Resolution1: Resolution_1,
    		Resolution2: Resolution_2,
    		Concepts,
    		Shoulders,
    		Bear,
    		FigureSkating,
    		steps,
    		i,
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev, doEnd];
    }

    class _00_intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { done: 3, prev: 4, doEnd: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_00_intro",
    			options,
    			id: create_fragment$9.name
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

    /* src/01.keyboards/Question.svelte generated by Svelte v3.24.1 */

    const file$9 = "src/01.keyboards/Question.svelte";

    function create_fragment$a(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let span;
    	let t4;
    	let div2;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "what if a computer";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("was just a ");
    			span = element("span");
    			span.textContent = "really good";
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "text editor?";
    			add_location(div0, file$9, 22, 4, 295);
    			attr_dev(span, "class", "red i");
    			add_location(span, file$9, 23, 32, 357);
    			attr_dev(div1, "class", "med svelte-10y1wyx");
    			add_location(div1, file$9, 23, 4, 329);
    			attr_dev(div2, "class", "blue med goright svelte-10y1wyx");
    			add_location(div2, file$9, 24, 4, 406);
    			add_location(div3, file$9, 21, 2, 285);
    			attr_dev(div4, "class", "box big svelte-10y1wyx");
    			add_location(div4, file$9, 20, 0, 261);
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
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
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

    function instance$a($$self, $$props) {
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
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/01.keyboards/OscarsTalk.svelte generated by Svelte v3.24.1 */
    const file$a = "src/01.keyboards/OscarsTalk.svelte";

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
    			add_location(div, file$a, 14, 0, 277);
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OscarsTalk",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/01.keyboards/Desks.svelte generated by Svelte v3.24.1 */

    const file$b = "src/01.keyboards/Desks.svelte";

    function create_fragment$c(ctx) {
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
    			li0.textContent = "mjackson 2019";
    			t7 = space();
    			li1 = element("li");
    			li1.textContent = "most important developers";
    			if (img0.src !== (img0_src_value = "./src/01.keyboards/assets/desks/one.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$b, 8, 4, 80);
    			if (img1.src !== (img1_src_value = "./src/01.keyboards/assets/desks/two.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$b, 9, 4, 145);
    			if (img2.src !== (img2_src_value = "./src/01.keyboards/assets/desks/three.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$b, 10, 4, 210);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$b, 7, 2, 58);
    			if (img3.src !== (img3_src_value = "./src/01.keyboards/assets/desks/four.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			add_location(img3, file$b, 13, 4, 306);
    			if (img4.src !== (img4_src_value = "./src/01.keyboards/assets/desks/five.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			add_location(img4, file$b, 14, 4, 372);
    			if (img5.src !== (img5_src_value = "./src/01.keyboards/assets/desks/six.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			add_location(img5, file$b, 15, 4, 438);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$b, 12, 2, 284);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$b, 6, 0, 38);
    			add_location(li0, file$b, 20, 2, 538);
    			add_location(li1, file$b, 21, 2, 563);
    			attr_dev(div3, "class", "notes");
    			add_location(div3, file$b, 19, 0, 516);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Desks",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/01.keyboards/NowCLI.svelte generated by Svelte v3.24.1 */
    const file$c = "src/01.keyboards/NowCLI.svelte";

    function create_fragment$d(ctx) {
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
    			add_location(div, file$c, 13, 0, 250);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NowCLI",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/01.keyboards/ISSKeyboard.svelte generated by Svelte v3.24.1 */
    const file$d = "src/01.keyboards/ISSKeyboard.svelte";

    function create_fragment$e(ctx) {
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
    			add_location(div, file$d, 13, 0, 228);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ISSKeyboard",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/01.keyboards/Typewriter.1.svelte generated by Svelte v3.24.1 */

    const file$e = "src/01.keyboards/Typewriter.1.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(div0, file$e, 43, 6, 798);
    			attr_dev(div1, "class", "key svelte-1uh5q9t");
    			add_location(div1, file$e, 44, 6, 853);
    			attr_dev(div2, "class", "key svelte-1uh5q9t");
    			add_location(div2, file$e, 45, 6, 884);
    			attr_dev(div3, "class", "key svelte-1uh5q9t");
    			add_location(div3, file$e, 46, 6, 915);
    			attr_dev(div4, "class", "key svelte-1uh5q9t");
    			add_location(div4, file$e, 47, 6, 946);
    			attr_dev(div5, "class", "key svelte-1uh5q9t");
    			add_location(div5, file$e, 48, 6, 977);
    			attr_dev(div6, "class", "key svelte-1uh5q9t");
    			add_location(div6, file$e, 49, 6, 1008);
    			attr_dev(div7, "class", "key svelte-1uh5q9t");
    			add_location(div7, file$e, 50, 6, 1039);
    			attr_dev(div8, "class", "key svelte-1uh5q9t");
    			add_location(div8, file$e, 51, 6, 1070);
    			attr_dev(div9, "class", "key svelte-1uh5q9t");
    			add_location(div9, file$e, 52, 6, 1101);
    			attr_dev(div10, "class", "key svelte-1uh5q9t");
    			add_location(div10, file$e, 53, 6, 1132);
    			attr_dev(div11, "class", "key svelte-1uh5q9t");
    			add_location(div11, file$e, 54, 6, 1163);
    			attr_dev(div12, "class", "key svelte-1uh5q9t");
    			add_location(div12, file$e, 55, 6, 1194);
    			attr_dev(div13, "class", "key svelte-1uh5q9t");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$e, 56, 6, 1225);
    			attr_dev(div14, "class", "row svelte-1uh5q9t");
    			add_location(div14, file$e, 42, 4, 774);
    			attr_dev(div15, "class", "key red svelte-1uh5q9t");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$e, 59, 6, 1308);
    			attr_dev(div16, "class", "key svelte-1uh5q9t");
    			add_location(div16, file$e, 60, 6, 1364);
    			attr_dev(div17, "class", "key svelte-1uh5q9t");
    			add_location(div17, file$e, 61, 6, 1395);
    			attr_dev(div18, "class", "key svelte-1uh5q9t");
    			add_location(div18, file$e, 62, 6, 1426);
    			attr_dev(div19, "class", "key svelte-1uh5q9t");
    			add_location(div19, file$e, 63, 6, 1457);
    			attr_dev(div20, "class", "key svelte-1uh5q9t");
    			add_location(div20, file$e, 64, 6, 1488);
    			attr_dev(div21, "class", "key svelte-1uh5q9t");
    			add_location(div21, file$e, 65, 6, 1519);
    			attr_dev(div22, "class", "key svelte-1uh5q9t");
    			add_location(div22, file$e, 66, 6, 1550);
    			attr_dev(div23, "class", "key svelte-1uh5q9t");
    			add_location(div23, file$e, 67, 6, 1581);
    			attr_dev(div24, "class", "key svelte-1uh5q9t");
    			add_location(div24, file$e, 68, 6, 1612);
    			attr_dev(div25, "class", "key svelte-1uh5q9t");
    			add_location(div25, file$e, 69, 6, 1643);
    			attr_dev(div26, "class", "key svelte-1uh5q9t");
    			add_location(div26, file$e, 70, 6, 1674);
    			attr_dev(div27, "class", "key svelte-1uh5q9t");
    			add_location(div27, file$e, 71, 6, 1705);
    			attr_dev(div28, "class", "key svelte-1uh5q9t");
    			add_location(div28, file$e, 72, 6, 1736);
    			attr_dev(div29, "class", "row svelte-1uh5q9t");
    			add_location(div29, file$e, 58, 4, 1284);
    			attr_dev(div30, "class", "key red svelte-1uh5q9t");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$e, 75, 6, 1800);
    			attr_dev(div31, "class", "key svelte-1uh5q9t");
    			add_location(div31, file$e, 76, 6, 1857);
    			attr_dev(div32, "class", "key svelte-1uh5q9t");
    			add_location(div32, file$e, 77, 6, 1888);
    			attr_dev(div33, "class", "key svelte-1uh5q9t");
    			add_location(div33, file$e, 78, 6, 1919);
    			attr_dev(div34, "class", "key svelte-1uh5q9t");
    			add_location(div34, file$e, 79, 6, 1950);
    			attr_dev(div35, "class", "key svelte-1uh5q9t");
    			add_location(div35, file$e, 80, 6, 1981);
    			attr_dev(div36, "class", "key svelte-1uh5q9t");
    			add_location(div36, file$e, 81, 6, 2012);
    			attr_dev(div37, "class", "key svelte-1uh5q9t");
    			add_location(div37, file$e, 82, 6, 2043);
    			attr_dev(div38, "class", "key svelte-1uh5q9t");
    			add_location(div38, file$e, 83, 6, 2074);
    			attr_dev(div39, "class", "key svelte-1uh5q9t");
    			add_location(div39, file$e, 84, 6, 2105);
    			attr_dev(div40, "class", "key svelte-1uh5q9t");
    			add_location(div40, file$e, 85, 6, 2136);
    			attr_dev(div41, "class", "key svelte-1uh5q9t");
    			add_location(div41, file$e, 86, 6, 2167);
    			attr_dev(div42, "class", "key red svelte-1uh5q9t");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$e, 87, 6, 2198);
    			attr_dev(div43, "class", "row svelte-1uh5q9t");
    			add_location(div43, file$e, 74, 4, 1776);
    			attr_dev(div44, "class", "key red svelte-1uh5q9t");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$e, 90, 6, 2285);
    			attr_dev(div45, "class", "key svelte-1uh5q9t");
    			add_location(div45, file$e, 91, 6, 2340);
    			attr_dev(div46, "class", "key svelte-1uh5q9t");
    			add_location(div46, file$e, 92, 6, 2371);
    			attr_dev(div47, "class", "key svelte-1uh5q9t");
    			add_location(div47, file$e, 93, 6, 2402);
    			attr_dev(div48, "class", "key svelte-1uh5q9t");
    			add_location(div48, file$e, 94, 6, 2433);
    			attr_dev(div49, "class", "key svelte-1uh5q9t");
    			add_location(div49, file$e, 95, 6, 2464);
    			attr_dev(div50, "class", "key svelte-1uh5q9t");
    			add_location(div50, file$e, 96, 6, 2495);
    			attr_dev(div51, "class", "key svelte-1uh5q9t");
    			add_location(div51, file$e, 97, 6, 2526);
    			attr_dev(div52, "class", "key svelte-1uh5q9t");
    			add_location(div52, file$e, 98, 6, 2557);
    			attr_dev(div53, "class", "key svelte-1uh5q9t");
    			add_location(div53, file$e, 99, 6, 2588);
    			attr_dev(div54, "class", "key svelte-1uh5q9t");
    			add_location(div54, file$e, 100, 6, 2619);
    			attr_dev(div55, "class", "key red svelte-1uh5q9t");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$e, 101, 6, 2650);
    			attr_dev(div56, "class", "row svelte-1uh5q9t");
    			add_location(div56, file$e, 89, 4, 2261);
    			attr_dev(div57, "class", "key svelte-1uh5q9t");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$e, 104, 6, 2738);
    			attr_dev(div58, "class", "key svelte-1uh5q9t");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$e, 105, 6, 2788);
    			attr_dev(div59, "class", "key svelte-1uh5q9t");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$e, 106, 6, 2838);
    			attr_dev(div60, "class", "key red svelte-1uh5q9t");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$e, 107, 6, 2888);
    			attr_dev(div61, "class", "key svelte-1uh5q9t");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$e, 108, 6, 2938);
    			attr_dev(div62, "class", "key svelte-1uh5q9t");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$e, 109, 6, 2988);
    			attr_dev(div63, "class", "key svelte-1uh5q9t");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$e, 110, 6, 3038);
    			attr_dev(div64, "class", "row svelte-1uh5q9t");
    			add_location(div64, file$e, 103, 4, 2714);
    			attr_dev(div65, "class", "container svelte-1uh5q9t");
    			add_location(div65, file$e, 41, 2, 746);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$e, 40, 0, 726);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_1",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/01.keyboards/Typewriter.2.svelte generated by Svelte v3.24.1 */

    const file$f = "src/01.keyboards/Typewriter.2.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(div0, file$f, 48, 6, 894);
    			attr_dev(div1, "class", "key svelte-1upw8wx");
    			add_location(div1, file$f, 49, 6, 949);
    			attr_dev(div2, "class", "key svelte-1upw8wx");
    			add_location(div2, file$f, 50, 6, 980);
    			attr_dev(div3, "class", "key svelte-1upw8wx");
    			add_location(div3, file$f, 51, 6, 1011);
    			attr_dev(div4, "class", "key svelte-1upw8wx");
    			add_location(div4, file$f, 52, 6, 1042);
    			attr_dev(div5, "class", "key svelte-1upw8wx");
    			add_location(div5, file$f, 53, 6, 1073);
    			attr_dev(div6, "class", "key svelte-1upw8wx");
    			add_location(div6, file$f, 54, 6, 1104);
    			attr_dev(div7, "class", "key svelte-1upw8wx");
    			add_location(div7, file$f, 55, 6, 1135);
    			attr_dev(div8, "class", "key svelte-1upw8wx");
    			add_location(div8, file$f, 56, 6, 1166);
    			attr_dev(div9, "class", "key svelte-1upw8wx");
    			add_location(div9, file$f, 57, 6, 1197);
    			attr_dev(div10, "class", "key svelte-1upw8wx");
    			add_location(div10, file$f, 58, 6, 1228);
    			attr_dev(div11, "class", "key svelte-1upw8wx");
    			add_location(div11, file$f, 59, 6, 1259);
    			attr_dev(div12, "class", "key svelte-1upw8wx");
    			add_location(div12, file$f, 60, 6, 1290);
    			attr_dev(div13, "class", "key svelte-1upw8wx");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$f, 61, 6, 1321);
    			attr_dev(div14, "class", "row svelte-1upw8wx");
    			add_location(div14, file$f, 47, 4, 870);
    			attr_dev(div15, "class", "key red svelte-1upw8wx");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$f, 64, 6, 1404);
    			attr_dev(div16, "class", "key svelte-1upw8wx");
    			add_location(div16, file$f, 65, 6, 1460);
    			attr_dev(div17, "class", "key svelte-1upw8wx");
    			add_location(div17, file$f, 66, 6, 1491);
    			attr_dev(div18, "class", "key svelte-1upw8wx");
    			add_location(div18, file$f, 67, 6, 1522);
    			attr_dev(div19, "class", "key svelte-1upw8wx");
    			add_location(div19, file$f, 68, 6, 1553);
    			attr_dev(div20, "class", "key svelte-1upw8wx");
    			add_location(div20, file$f, 69, 6, 1584);
    			attr_dev(div21, "class", "key svelte-1upw8wx");
    			add_location(div21, file$f, 70, 6, 1615);
    			attr_dev(div22, "class", "key svelte-1upw8wx");
    			add_location(div22, file$f, 71, 6, 1646);
    			attr_dev(div23, "class", "key svelte-1upw8wx");
    			add_location(div23, file$f, 72, 6, 1677);
    			attr_dev(div24, "class", "key svelte-1upw8wx");
    			add_location(div24, file$f, 73, 6, 1708);
    			attr_dev(div25, "class", "key svelte-1upw8wx");
    			add_location(div25, file$f, 74, 6, 1739);
    			attr_dev(div26, "class", "key svelte-1upw8wx");
    			add_location(div26, file$f, 75, 6, 1770);
    			attr_dev(div27, "class", "key svelte-1upw8wx");
    			add_location(div27, file$f, 76, 6, 1801);
    			attr_dev(div28, "class", "key svelte-1upw8wx");
    			add_location(div28, file$f, 77, 6, 1832);
    			attr_dev(div29, "class", "row svelte-1upw8wx");
    			add_location(div29, file$f, 63, 4, 1380);
    			attr_dev(div30, "class", "key red svelte-1upw8wx");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$f, 80, 6, 1896);
    			attr_dev(div31, "class", "key svelte-1upw8wx");
    			add_location(div31, file$f, 81, 6, 1953);
    			attr_dev(div32, "class", "key svelte-1upw8wx");
    			add_location(div32, file$f, 82, 6, 1984);
    			attr_dev(div33, "class", "key svelte-1upw8wx");
    			add_location(div33, file$f, 83, 6, 2015);
    			attr_dev(div34, "class", "key svelte-1upw8wx");
    			add_location(div34, file$f, 84, 6, 2046);
    			attr_dev(div35, "class", "key svelte-1upw8wx");
    			add_location(div35, file$f, 85, 6, 2077);
    			attr_dev(div36, "class", "key svelte-1upw8wx");
    			add_location(div36, file$f, 86, 6, 2108);
    			attr_dev(div37, "class", "key svelte-1upw8wx");
    			add_location(div37, file$f, 87, 6, 2139);
    			attr_dev(div38, "class", "key svelte-1upw8wx");
    			add_location(div38, file$f, 88, 6, 2170);
    			attr_dev(div39, "class", "key svelte-1upw8wx");
    			add_location(div39, file$f, 89, 6, 2201);
    			attr_dev(div40, "class", "key svelte-1upw8wx");
    			add_location(div40, file$f, 90, 6, 2232);
    			attr_dev(div41, "class", "key svelte-1upw8wx");
    			add_location(div41, file$f, 91, 6, 2263);
    			attr_dev(div42, "class", "key blue svelte-1upw8wx");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$f, 92, 6, 2294);
    			attr_dev(div43, "class", "row svelte-1upw8wx");
    			add_location(div43, file$f, 79, 4, 1872);
    			attr_dev(div44, "class", "key red svelte-1upw8wx");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$f, 95, 6, 2382);
    			attr_dev(div45, "class", "key svelte-1upw8wx");
    			add_location(div45, file$f, 96, 6, 2437);
    			attr_dev(div46, "class", "key svelte-1upw8wx");
    			add_location(div46, file$f, 97, 6, 2468);
    			attr_dev(div47, "class", "key svelte-1upw8wx");
    			add_location(div47, file$f, 98, 6, 2499);
    			attr_dev(div48, "class", "key svelte-1upw8wx");
    			add_location(div48, file$f, 99, 6, 2530);
    			attr_dev(div49, "class", "key svelte-1upw8wx");
    			add_location(div49, file$f, 100, 6, 2561);
    			attr_dev(div50, "class", "key svelte-1upw8wx");
    			add_location(div50, file$f, 101, 6, 2592);
    			attr_dev(div51, "class", "key svelte-1upw8wx");
    			add_location(div51, file$f, 102, 6, 2623);
    			attr_dev(div52, "class", "key svelte-1upw8wx");
    			add_location(div52, file$f, 103, 6, 2654);
    			attr_dev(div53, "class", "key svelte-1upw8wx");
    			add_location(div53, file$f, 104, 6, 2685);
    			attr_dev(div54, "class", "key svelte-1upw8wx");
    			add_location(div54, file$f, 105, 6, 2716);
    			attr_dev(div55, "class", "key red svelte-1upw8wx");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$f, 106, 6, 2747);
    			attr_dev(div56, "class", "row svelte-1upw8wx");
    			add_location(div56, file$f, 94, 4, 2358);
    			attr_dev(div57, "class", "key svelte-1upw8wx");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$f, 109, 6, 2835);
    			attr_dev(div58, "class", "key svelte-1upw8wx");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$f, 110, 6, 2885);
    			attr_dev(div59, "class", "key svelte-1upw8wx");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$f, 111, 6, 2935);
    			attr_dev(div60, "class", "key red svelte-1upw8wx");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$f, 112, 6, 2985);
    			attr_dev(div61, "class", "key svelte-1upw8wx");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$f, 113, 6, 3035);
    			attr_dev(div62, "class", "key svelte-1upw8wx");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$f, 114, 6, 3085);
    			attr_dev(div63, "class", "key svelte-1upw8wx");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$f, 115, 6, 3135);
    			attr_dev(div64, "class", "row svelte-1upw8wx");
    			add_location(div64, file$f, 108, 4, 2811);
    			attr_dev(div65, "class", "container svelte-1upw8wx");
    			add_location(div65, file$f, 46, 2, 842);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$f, 45, 0, 822);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typewriter_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typewriter_2", $$slots, []);
    	return [];
    }

    class Typewriter_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_2",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/01.keyboards/Punctuation.1.svelte generated by Svelte v3.24.1 */

    const file$g = "src/01.keyboards/Punctuation.1.svelte";

    function create_fragment$h(ctx) {
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
    			attr_dev(div0, "class", "key show svelte-scstui");
    			set_style(div0, "max-width", "30px");
    			add_location(div0, file$g, 45, 6, 813);
    			attr_dev(div1, "class", "key show svelte-scstui");
    			add_location(div1, file$g, 46, 6, 873);
    			attr_dev(div2, "class", "key show svelte-scstui");
    			add_location(div2, file$g, 47, 6, 909);
    			attr_dev(div3, "class", "key show svelte-scstui");
    			add_location(div3, file$g, 48, 6, 945);
    			attr_dev(div4, "class", "key show svelte-scstui");
    			add_location(div4, file$g, 49, 6, 981);
    			attr_dev(div5, "class", "key show svelte-scstui");
    			add_location(div5, file$g, 50, 6, 1017);
    			attr_dev(div6, "class", "key show svelte-scstui");
    			add_location(div6, file$g, 51, 6, 1053);
    			attr_dev(div7, "class", "key show svelte-scstui");
    			add_location(div7, file$g, 52, 6, 1089);
    			attr_dev(div8, "class", "key show svelte-scstui");
    			add_location(div8, file$g, 53, 6, 1125);
    			attr_dev(div9, "class", "key show svelte-scstui");
    			add_location(div9, file$g, 54, 6, 1161);
    			attr_dev(div10, "class", "key show svelte-scstui");
    			add_location(div10, file$g, 55, 6, 1197);
    			attr_dev(div11, "class", "key show svelte-scstui");
    			add_location(div11, file$g, 56, 6, 1233);
    			attr_dev(div12, "class", "key show svelte-scstui");
    			add_location(div12, file$g, 57, 6, 1269);
    			attr_dev(div13, "class", "key pink svelte-scstui");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$g, 58, 6, 1305);
    			attr_dev(div14, "class", "row svelte-scstui");
    			add_location(div14, file$g, 44, 4, 789);
    			attr_dev(div15, "class", "key pink svelte-scstui");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$g, 61, 6, 1393);
    			attr_dev(div16, "class", "key svelte-scstui");
    			add_location(div16, file$g, 62, 6, 1450);
    			attr_dev(div17, "class", "key svelte-scstui");
    			add_location(div17, file$g, 63, 6, 1481);
    			attr_dev(div18, "class", "key svelte-scstui");
    			add_location(div18, file$g, 64, 6, 1512);
    			attr_dev(div19, "class", "key svelte-scstui");
    			add_location(div19, file$g, 65, 6, 1543);
    			attr_dev(div20, "class", "key svelte-scstui");
    			add_location(div20, file$g, 66, 6, 1574);
    			attr_dev(div21, "class", "key svelte-scstui");
    			add_location(div21, file$g, 67, 6, 1605);
    			attr_dev(div22, "class", "key svelte-scstui");
    			add_location(div22, file$g, 68, 6, 1636);
    			attr_dev(div23, "class", "key svelte-scstui");
    			add_location(div23, file$g, 69, 6, 1667);
    			attr_dev(div24, "class", "key svelte-scstui");
    			add_location(div24, file$g, 70, 6, 1698);
    			attr_dev(div25, "class", "key svelte-scstui");
    			add_location(div25, file$g, 71, 6, 1729);
    			attr_dev(div26, "class", "key show svelte-scstui");
    			add_location(div26, file$g, 72, 6, 1760);
    			attr_dev(div27, "class", "key show svelte-scstui");
    			add_location(div27, file$g, 73, 6, 1796);
    			attr_dev(div28, "class", "key show svelte-scstui");
    			add_location(div28, file$g, 74, 6, 1832);
    			attr_dev(div29, "class", "row svelte-scstui");
    			add_location(div29, file$g, 60, 4, 1369);
    			attr_dev(div30, "class", "key pink svelte-scstui");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$g, 77, 6, 1901);
    			attr_dev(div31, "class", "key svelte-scstui");
    			add_location(div31, file$g, 78, 6, 1959);
    			attr_dev(div32, "class", "key svelte-scstui");
    			add_location(div32, file$g, 79, 6, 1990);
    			attr_dev(div33, "class", "key svelte-scstui");
    			add_location(div33, file$g, 80, 6, 2021);
    			attr_dev(div34, "class", "key svelte-scstui");
    			add_location(div34, file$g, 81, 6, 2052);
    			attr_dev(div35, "class", "key svelte-scstui");
    			add_location(div35, file$g, 82, 6, 2083);
    			attr_dev(div36, "class", "key svelte-scstui");
    			add_location(div36, file$g, 83, 6, 2114);
    			attr_dev(div37, "class", "key svelte-scstui");
    			add_location(div37, file$g, 84, 6, 2145);
    			attr_dev(div38, "class", "key svelte-scstui");
    			add_location(div38, file$g, 85, 6, 2176);
    			attr_dev(div39, "class", "key svelte-scstui");
    			add_location(div39, file$g, 86, 6, 2207);
    			attr_dev(div40, "class", "key show svelte-scstui");
    			add_location(div40, file$g, 87, 6, 2238);
    			attr_dev(div41, "class", "key show svelte-scstui");
    			add_location(div41, file$g, 88, 6, 2274);
    			attr_dev(div42, "class", "key pink svelte-scstui");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$g, 89, 6, 2310);
    			attr_dev(div43, "class", "row svelte-scstui");
    			add_location(div43, file$g, 76, 4, 1877);
    			attr_dev(div44, "class", "key pink svelte-scstui");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$g, 92, 6, 2398);
    			attr_dev(div45, "class", "key svelte-scstui");
    			add_location(div45, file$g, 93, 6, 2454);
    			attr_dev(div46, "class", "key svelte-scstui");
    			add_location(div46, file$g, 94, 6, 2485);
    			attr_dev(div47, "class", "key svelte-scstui");
    			add_location(div47, file$g, 95, 6, 2516);
    			attr_dev(div48, "class", "key svelte-scstui");
    			add_location(div48, file$g, 96, 6, 2547);
    			attr_dev(div49, "class", "key svelte-scstui");
    			add_location(div49, file$g, 97, 6, 2578);
    			attr_dev(div50, "class", "key svelte-scstui");
    			add_location(div50, file$g, 98, 6, 2609);
    			attr_dev(div51, "class", "key svelte-scstui");
    			add_location(div51, file$g, 99, 6, 2640);
    			attr_dev(div52, "class", "key show svelte-scstui");
    			add_location(div52, file$g, 100, 6, 2671);
    			attr_dev(div53, "class", "key show svelte-scstui");
    			add_location(div53, file$g, 101, 6, 2707);
    			attr_dev(div54, "class", "key show svelte-scstui");
    			add_location(div54, file$g, 102, 6, 2743);
    			attr_dev(div55, "class", "key pink svelte-scstui");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$g, 103, 6, 2779);
    			attr_dev(div56, "class", "row svelte-scstui");
    			add_location(div56, file$g, 91, 4, 2374);
    			attr_dev(div57, "class", "key pink svelte-scstui");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$g, 106, 6, 2868);
    			attr_dev(div58, "class", "key pink svelte-scstui");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$g, 107, 6, 2923);
    			attr_dev(div59, "class", "key pink svelte-scstui");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$g, 108, 6, 2978);
    			attr_dev(div60, "class", "key  svelte-scstui");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$g, 109, 6, 3033);
    			attr_dev(div61, "class", "key pink svelte-scstui");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$g, 110, 6, 3080);
    			attr_dev(div62, "class", "key pink svelte-scstui");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$g, 111, 6, 3135);
    			attr_dev(div63, "class", "key pink svelte-scstui");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$g, 112, 6, 3190);
    			attr_dev(div64, "class", "row svelte-scstui");
    			add_location(div64, file$g, 105, 4, 2844);
    			attr_dev(div65, "class", "container svelte-scstui");
    			add_location(div65, file$g, 43, 2, 761);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$g, 42, 0, 741);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Punctuation_1", $$slots, []);
    	return [];
    }

    class Punctuation_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_1",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/01.keyboards/Punctuation.2.svelte generated by Svelte v3.24.1 */

    const file$h = "src/01.keyboards/Punctuation.2.svelte";

    function create_fragment$i(ctx) {
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
    			add_location(div0, file$h, 48, 6, 845);
    			attr_dev(div1, "class", "key show nope svelte-4wi716");
    			add_location(div1, file$h, 49, 6, 905);
    			attr_dev(div2, "class", "key show svelte-4wi716");
    			add_location(div2, file$h, 50, 6, 946);
    			attr_dev(div3, "class", "key show svelte-4wi716");
    			add_location(div3, file$h, 51, 6, 982);
    			attr_dev(div4, "class", "key show nope svelte-4wi716");
    			add_location(div4, file$h, 52, 6, 1018);
    			attr_dev(div5, "class", "key show nope svelte-4wi716");
    			add_location(div5, file$h, 53, 6, 1059);
    			attr_dev(div6, "class", "key show svelte-4wi716");
    			add_location(div6, file$h, 54, 6, 1100);
    			attr_dev(div7, "class", "key show svelte-4wi716");
    			add_location(div7, file$h, 55, 6, 1136);
    			attr_dev(div8, "class", "key show svelte-4wi716");
    			add_location(div8, file$h, 56, 6, 1172);
    			attr_dev(div9, "class", "key show nope svelte-4wi716");
    			add_location(div9, file$h, 57, 6, 1208);
    			attr_dev(div10, "class", "key show nope svelte-4wi716");
    			add_location(div10, file$h, 58, 6, 1249);
    			attr_dev(div11, "class", "key show nope svelte-4wi716");
    			add_location(div11, file$h, 59, 6, 1290);
    			attr_dev(div12, "class", "key show nope svelte-4wi716");
    			add_location(div12, file$h, 60, 6, 1331);
    			attr_dev(div13, "class", "key nope pink svelte-4wi716");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$h, 61, 6, 1372);
    			attr_dev(div14, "class", "row svelte-4wi716");
    			add_location(div14, file$h, 47, 4, 821);
    			attr_dev(div15, "class", "key nope pink svelte-4wi716");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$h, 64, 6, 1465);
    			attr_dev(div16, "class", "key nope svelte-4wi716");
    			add_location(div16, file$h, 65, 6, 1527);
    			attr_dev(div17, "class", "key nope svelte-4wi716");
    			add_location(div17, file$h, 66, 6, 1563);
    			attr_dev(div18, "class", "key nope svelte-4wi716");
    			add_location(div18, file$h, 67, 6, 1599);
    			attr_dev(div19, "class", "key nope svelte-4wi716");
    			add_location(div19, file$h, 68, 6, 1635);
    			attr_dev(div20, "class", "key nope svelte-4wi716");
    			add_location(div20, file$h, 69, 6, 1671);
    			attr_dev(div21, "class", "key nope svelte-4wi716");
    			add_location(div21, file$h, 70, 6, 1707);
    			attr_dev(div22, "class", "key nope svelte-4wi716");
    			add_location(div22, file$h, 71, 6, 1743);
    			attr_dev(div23, "class", "key nope svelte-4wi716");
    			add_location(div23, file$h, 72, 6, 1779);
    			attr_dev(div24, "class", "key nope svelte-4wi716");
    			add_location(div24, file$h, 73, 6, 1815);
    			attr_dev(div25, "class", "key nope svelte-4wi716");
    			add_location(div25, file$h, 74, 6, 1851);
    			attr_dev(div26, "class", "key show svelte-4wi716");
    			add_location(div26, file$h, 75, 6, 1887);
    			attr_dev(div27, "class", "key show svelte-4wi716");
    			add_location(div27, file$h, 76, 6, 1923);
    			attr_dev(div28, "class", "key show svelte-4wi716");
    			add_location(div28, file$h, 77, 6, 1959);
    			attr_dev(div29, "class", "row svelte-4wi716");
    			add_location(div29, file$h, 63, 4, 1441);
    			attr_dev(div30, "class", "key nope pink svelte-4wi716");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$h, 80, 6, 2028);
    			attr_dev(div31, "class", "key nope svelte-4wi716");
    			add_location(div31, file$h, 81, 6, 2091);
    			attr_dev(div32, "class", "key nope svelte-4wi716");
    			add_location(div32, file$h, 82, 6, 2127);
    			attr_dev(div33, "class", "key nope svelte-4wi716");
    			add_location(div33, file$h, 83, 6, 2163);
    			attr_dev(div34, "class", "key nope svelte-4wi716");
    			add_location(div34, file$h, 84, 6, 2199);
    			attr_dev(div35, "class", "key nope svelte-4wi716");
    			add_location(div35, file$h, 85, 6, 2235);
    			attr_dev(div36, "class", "key nope svelte-4wi716");
    			add_location(div36, file$h, 86, 6, 2271);
    			attr_dev(div37, "class", "key nope svelte-4wi716");
    			add_location(div37, file$h, 87, 6, 2307);
    			attr_dev(div38, "class", "key nope svelte-4wi716");
    			add_location(div38, file$h, 88, 6, 2343);
    			attr_dev(div39, "class", "key nope svelte-4wi716");
    			add_location(div39, file$h, 89, 6, 2379);
    			attr_dev(div40, "class", "key nope show svelte-4wi716");
    			add_location(div40, file$h, 90, 6, 2415);
    			attr_dev(div41, "class", "key nope show svelte-4wi716");
    			add_location(div41, file$h, 91, 6, 2456);
    			attr_dev(div42, "class", "key nope pink svelte-4wi716");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$h, 92, 6, 2497);
    			attr_dev(div43, "class", "row svelte-4wi716");
    			add_location(div43, file$h, 79, 4, 2004);
    			attr_dev(div44, "class", "key nope pink svelte-4wi716");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$h, 95, 6, 2590);
    			attr_dev(div45, "class", "key nope svelte-4wi716");
    			add_location(div45, file$h, 96, 6, 2651);
    			attr_dev(div46, "class", "key nope svelte-4wi716");
    			add_location(div46, file$h, 97, 6, 2687);
    			attr_dev(div47, "class", "key nope svelte-4wi716");
    			add_location(div47, file$h, 98, 6, 2723);
    			attr_dev(div48, "class", "key nope svelte-4wi716");
    			add_location(div48, file$h, 99, 6, 2759);
    			attr_dev(div49, "class", "key nope svelte-4wi716");
    			add_location(div49, file$h, 100, 6, 2795);
    			attr_dev(div50, "class", "key nope svelte-4wi716");
    			add_location(div50, file$h, 101, 6, 2831);
    			attr_dev(div51, "class", "key nope svelte-4wi716");
    			add_location(div51, file$h, 102, 6, 2867);
    			attr_dev(div52, "class", "key nope show svelte-4wi716");
    			add_location(div52, file$h, 103, 6, 2903);
    			attr_dev(div53, "class", "key nope show svelte-4wi716");
    			add_location(div53, file$h, 104, 6, 2944);
    			attr_dev(div54, "class", "key nope show svelte-4wi716");
    			add_location(div54, file$h, 105, 6, 2985);
    			attr_dev(div55, "class", "key nope pink svelte-4wi716");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$h, 106, 6, 3026);
    			attr_dev(div56, "class", "row svelte-4wi716");
    			add_location(div56, file$h, 94, 4, 2566);
    			attr_dev(div57, "class", "key nope pink svelte-4wi716");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$h, 109, 6, 3120);
    			attr_dev(div58, "class", "key nope pink svelte-4wi716");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$h, 110, 6, 3180);
    			attr_dev(div59, "class", "key nope pink svelte-4wi716");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$h, 111, 6, 3240);
    			attr_dev(div60, "class", "key nope  svelte-4wi716");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$h, 112, 6, 3300);
    			attr_dev(div61, "class", "key nope pink svelte-4wi716");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$h, 113, 6, 3352);
    			attr_dev(div62, "class", "key nope pink svelte-4wi716");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$h, 114, 6, 3412);
    			attr_dev(div63, "class", "key nope pink svelte-4wi716");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$h, 115, 6, 3472);
    			attr_dev(div64, "class", "row svelte-4wi716");
    			add_location(div64, file$h, 108, 4, 3096);
    			attr_dev(div65, "class", "container svelte-4wi716");
    			add_location(div65, file$h, 46, 2, 793);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$h, 45, 0, 773);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Punctuation_2", $$slots, []);
    	return [];
    }

    class Punctuation_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_2",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/01.keyboards/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$j(ctx) {
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*spaceBar*/ ctx[2], false, false, false);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
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
    		Question,
    		OscarsTalk,
    		Desks,
    		ISSKeyboard,
    		NowCLI,
    		Typewriter_1,
    		Typewriter_2,
    		Punctuation_1,
    		Punctuation_2
    	];

    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_01_keyboards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_01_keyboards", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Question,
    		OscarsTalk,
    		Desks,
    		NowCLI,
    		ISSKeyboard,
    		Typewriter1: Typewriter_1,
    		Typewriter2: Typewriter_2,
    		Punctuation1: Punctuation_1,
    		Punctuation2: Punctuation_2,
    		steps,
    		i,
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev, doEnd];
    }

    class _01_keyboards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { done: 3, prev: 4, doEnd: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_keyboards",
    			options,
    			id: create_fragment$j.name
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

    /* src/02.word-wrap/Spreadsheet.svelte generated by Svelte v3.24.1 */

    const file$i = "src/02.word-wrap/Spreadsheet.svelte";

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
    			add_location(div, file$i, 60, 6, 1276);
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
    			add_location(div, file$i, 69, 10, 1563);
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
    			add_location(div, file$i, 67, 10, 1496);
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
    			add_location(div, file$i, 64, 6, 1375);
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

    function create_fragment$k(ctx) {
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
    			add_location(div0, file$i, 58, 4, 1207);
    			attr_dev(div1, "class", "container svelte-10qh3b4");
    			add_location(div1, file$i, 56, 2, 1158);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$i, 55, 0, 1138);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spreadsheet",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/02.word-wrap/Wrap.svelte generated by Svelte v3.24.1 */
    const file$j = "src/02.word-wrap/Wrap.svelte";

    function create_fragment$l(ctx) {
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
    			add_location(div, file$j, 12, 0, 215);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let video = {
    		src: "./src/02.word-wrap/assets/word-wrap.mp4",
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src/02.word-wrap/Insert.svelte generated by Svelte v3.24.1 */
    const file$k = "src/02.word-wrap/Insert.svelte";

    function create_fragment$m(ctx) {
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
    			add_location(div, file$k, 20, 0, 326);
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
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let images = [
    		{
    			src: "./src/02.word-wrap/assets/insert-1.png"
    		},
    		{
    			src: "./src/02.word-wrap/assets/insert-2.png"
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
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Insert",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    /* src/02.word-wrap/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$n(ctx) {
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*spaceBar*/ ctx[2], false, false, false);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
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
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Spreadsheet, Wrap, Insert];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_02_word_wrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_02_word_wrap", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
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
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev, doEnd];
    }

    class _02_word_wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { done: 3, prev: 4, doEnd: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_02_word_wrap",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get done() {
    		throw new Error("<_02_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_02_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_02_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_02_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_02_word_wrap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_02_word_wrap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* spencermountain/spacetime 6.6.3 Apache 2.0 */
    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var fns = createCommonjsModule(function (module, exports) {
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
    const file$l = "Users/spencer/mountain/somehow-timeline/src/Timeline.svelte";

    function create_fragment$o(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "slot svelte-1t26m4d");
    			set_style(div0, "min-height", /*height*/ ctx[0] + "px");
    			add_location(div0, file$l, 49, 2, 996);
    			attr_dev(div1, "class", "container svelte-1t26m4d");
    			add_location(div1, file$l, 48, 0, 970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*height*/ 1) {
    				set_style(div0, "min-height", /*height*/ ctx[0] + "px");
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
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { start = null } = $$props;
    	let { end = null } = $$props;
    	let { height = 800 } = $$props;
    	start = src(start);
    	end = src(end);
    	setContext("height", height);
    	setContext("start", start);
    	setContext("end", end);
    	setContext("colors", colors);

    	setContext("scale", val => {
    		return scale(
    			{
    				world: [0, height],
    				minmax: [start.epoch, end.epoch]
    			},
    			val
    		);
    	});

    	const writable_props = ["start", "end", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("start" in $$props) $$invalidate(1, start = $$props.start);
    		if ("end" in $$props) $$invalidate(2, end = $$props.end);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		spacetime: src,
    		colors,
    		scale,
    		start,
    		end,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("start" in $$props) $$invalidate(1, start = $$props.start);
    		if ("end" in $$props) $$invalidate(2, end = $$props.end);
    		if ("height" in $$props) $$invalidate(0, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [height, start, end, $$scope, $$slots];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, { start: 1, end: 2, height: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$o.name
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

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Dots.svelte generated by Svelte v3.24.1 */

    const file$m = "Users/spencer/mountain/somehow-timeline/src/shapes/Dots.svelte";

    function create_fragment$p(ctx) {
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
    			add_location(circle, file$m, 19, 6, 413);
    			attr_dev(pattern, "id", /*id*/ ctx[1]);
    			attr_dev(pattern, "x", "0");
    			attr_dev(pattern, "y", "0");
    			attr_dev(pattern, "width", "5");
    			attr_dev(pattern, "height", "5");
    			attr_dev(pattern, "patternUnits", "userSpaceOnUse");
    			add_location(pattern, file$m, 18, 4, 329);
    			add_location(defs, file$m, 17, 2, 318);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "0");
    			attr_dev(rect, "width", "100%");
    			attr_dev(rect, "height", "100%");
    			attr_dev(rect, "fill", rect_fill_value = "url(#" + /*id*/ ctx[1] + ")");
    			add_location(rect, file$m, 23, 2, 487);
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file$m, 16, 0, 283);
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
    		id: create_fragment$p.name,
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

    function instance$p($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, { color: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dots",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get color() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function createCommonjsModule$1(fn, basedir, module) {
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

    var spencerColor = createCommonjsModule$1(function (module, exports) {
    !function(e){module.exports=e();}(function(){return function u(i,a,c){function f(r,e){if(!a[r]){if(!i[r]){var o="function"==typeof commonjsRequire&&commonjsRequire;if(!e&&o)return o(r,!0);if(d)return d(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var t=a[r]={exports:{}};i[r][0].call(t.exports,function(e){return f(i[r][1][e]||e)},t,t.exports,u,i,a,c);}return a[r].exports}for(var d="function"==typeof commonjsRequire&&commonjsRequire,e=0;e<c.length;e++)f(c[e]);return f}({1:[function(e,r,o){r.exports={blue:"#6699cc",green:"#6accb2",yellow:"#e1e6b3",red:"#cc7066",pink:"#F2C0BB",brown:"#705E5C",orange:"#cc8a66",purple:"#d8b3e6",navy:"#335799",olive:"#7f9c6c",fuscia:"#735873",beige:"#e6d7b3",slate:"#8C8C88",suede:"#9c896c",burnt:"#603a39",sea:"#50617A",sky:"#2D85A8",night:"#303b50",rouge:"#914045",grey:"#838B91",mud:"#C4ABAB",royal:"#275291",cherry:"#cc6966",tulip:"#e6b3bc",rose:"#D68881",fire:"#AB5850",greyblue:"#72697D",greygreen:"#8BA3A2",greypurple:"#978BA3",burn:"#6D5685",slategrey:"#bfb0b3",light:"#a3a5a5",lighter:"#d7d5d2",fudge:"#4d4d4d",lightgrey:"#949a9e",white:"#fbfbfb",dimgrey:"#606c74",softblack:"#463D4F",dark:"#443d3d",black:"#333333"};},{}],2:[function(e,r,o){var n=e("./colors"),t={juno:["blue","mud","navy","slate","pink","burn"],barrow:["rouge","red","orange","burnt","brown","greygreen"],roma:["#8a849a","#b5b0bf","rose","lighter","greygreen","mud"],palmer:["red","navy","olive","pink","suede","sky"],mark:["#848f9a","#9aa4ac","slate","#b0b8bf","mud","grey"],salmon:["sky","sea","fuscia","slate","mud","fudge"],dupont:["green","brown","orange","red","olive","blue"],bloor:["night","navy","beige","rouge","mud","grey"],yukon:["mud","slate","brown","sky","beige","red"],david:["blue","green","yellow","red","pink","light"],neste:["mud","cherry","royal","rouge","greygreen","greypurple"],ken:["red","sky","#c67a53","greygreen","#dfb59f","mud"]};Object.keys(t).forEach(function(e){t[e]=t[e].map(function(e){return n[e]||e});}),r.exports=t;},{"./colors":1}],3:[function(e,r,o){var n=e("./colors"),t=e("./combos"),u={colors:n,list:Object.keys(n).map(function(e){return n[e]}),combos:t};r.exports=u;},{"./colors":1,"./combos":2}]},{},[3])(3)});
    });

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Line.svelte generated by Svelte v3.24.1 */
    const file$n = "Users/spencer/mountain/somehow-timeline/src/shapes/Line.svelte";

    // (90:2) {#if dotted === true}
    function create_if_block$3(ctx) {
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
    			attr_dev(div, "class", "dots svelte-ar7nvv");
    			set_style(div, "background-color", "white");
    			add_location(div, file$n, 90, 4, 2049);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(90:2) {#if dotted === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$q(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	let if_block = /*dotted*/ ctx[9] === true && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line svelte-ar7nvv");
    			set_style(div0, "width", /*width*/ ctx[1]);
    			set_style(div0, "background-color", /*color*/ ctx[0]);
    			add_location(div0, file$n, 87, 2, 1950);
    			attr_dev(div1, "class", "label svelte-ar7nvv");
    			set_style(div1, "top", "37%");
    			set_style(div1, "left", /*width*/ ctx[1]);
    			set_style(div1, "color", /*color*/ ctx[0]);
    			set_style(div1, "font-size", /*size*/ ctx[5]);
    			set_style(div1, "text-decoration", /*underline*/ ctx[8] === true ? "underline" : "none");
    			toggle_class(div1, "rotate", /*rotate*/ ctx[10]);
    			add_location(div1, file$n, 95, 2, 2150);
    			attr_dev(div2, "class", "container svelte-ar7nvv");
    			set_style(div2, "min-width", /*space*/ ctx[3]);
    			set_style(div2, "opacity", /*opacity*/ ctx[6]);
    			set_style(div2, "top", /*top*/ ctx[11] + /*margin*/ ctx[4] + "px");
    			set_style(div2, "height", /*height*/ ctx[12] - /*margin*/ ctx[4] * 2 + "px");
    			attr_dev(div2, "title", /*title*/ ctx[2]);
    			add_location(div2, file$n, 83, 0, 1809);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			div1.innerHTML = /*label*/ ctx[7];
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*width*/ 2) {
    				set_style(div0, "width", /*width*/ ctx[1]);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(div0, "background-color", /*color*/ ctx[0]);
    			}

    			if (/*dotted*/ ctx[9] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*dotted*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*label*/ 128) div1.innerHTML = /*label*/ ctx[7];
    			if (!current || dirty & /*width*/ 2) {
    				set_style(div1, "left", /*width*/ ctx[1]);
    			}

    			if (!current || dirty & /*color*/ 1) {
    				set_style(div1, "color", /*color*/ ctx[0]);
    			}

    			if (!current || dirty & /*size*/ 32) {
    				set_style(div1, "font-size", /*size*/ ctx[5]);
    			}

    			if (!current || dirty & /*underline*/ 256) {
    				set_style(div1, "text-decoration", /*underline*/ ctx[8] === true ? "underline" : "none");
    			}

    			if (dirty & /*rotate*/ 1024) {
    				toggle_class(div1, "rotate", /*rotate*/ ctx[10]);
    			}

    			if (!current || dirty & /*space*/ 8) {
    				set_style(div2, "min-width", /*space*/ ctx[3]);
    			}

    			if (!current || dirty & /*opacity*/ 64) {
    				set_style(div2, "opacity", /*opacity*/ ctx[6]);
    			}

    			if (!current || dirty & /*margin*/ 16) {
    				set_style(div2, "top", /*top*/ ctx[11] + /*margin*/ ctx[4] + "px");
    			}

    			if (!current || dirty & /*margin*/ 16) {
    				set_style(div2, "height", /*height*/ ctx[12] - /*margin*/ ctx[4] * 2 + "px");
    			}

    			if (!current || dirty & /*title*/ 4) {
    				attr_dev(div2, "title", /*title*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
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

    function instance$q($$self, $$props, $$invalidate) {
    	let { color = "steelblue" } = $$props;
    	let { width = "50px" } = $$props;
    	let { title = "" } = $$props;
    	let { space = "5px" } = $$props;
    	let { margin = 2 } = $$props;
    	let { size = "20px" } = $$props;
    	let { opacity = "1" } = $$props;
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

    	color = spencerColor.colors[color] || color;
    	const scale = getContext("scale");
    	start = start.epoch;
    	end = src(end).epoch;

    	if (duration) {
    		let split = duration.split(" ");
    		end = src(start).add(Number(split[0]), split[1]).epoch;
    	}

    	let top = scale(start);
    	let bottom = scale(end);
    	let height = bottom - top;

    	const writable_props = [
    		"color",
    		"width",
    		"title",
    		"space",
    		"margin",
    		"size",
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
    		if ("space" in $$props) $$invalidate(3, space = $$props.space);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("opacity" in $$props) $$invalidate(6, opacity = $$props.opacity);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("underline" in $$props) $$invalidate(8, underline = $$props.underline);
    		if ("dotted" in $$props) $$invalidate(9, dotted = $$props.dotted);
    		if ("rotate" in $$props) $$invalidate(10, rotate = $$props.rotate);
    		if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
    		if ("start" in $$props) $$invalidate(13, start = $$props.start);
    		if ("date" in $$props) $$invalidate(16, date = $$props.date);
    		if ("end" in $$props) $$invalidate(14, end = $$props.end);
    	};

    	$$self.$capture_state = () => ({
    		spacetime: src,
    		getContext,
    		Dots,
    		c: spencerColor,
    		color,
    		width,
    		title,
    		space,
    		margin,
    		size,
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
    		if ("color" in $$props) $$invalidate(0, color = $$props.color);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("space" in $$props) $$invalidate(3, space = $$props.space);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("opacity" in $$props) $$invalidate(6, opacity = $$props.opacity);
    		if ("label" in $$props) $$invalidate(7, label = $$props.label);
    		if ("underline" in $$props) $$invalidate(8, underline = $$props.underline);
    		if ("dotted" in $$props) $$invalidate(9, dotted = $$props.dotted);
    		if ("rotate" in $$props) $$invalidate(10, rotate = $$props.rotate);
    		if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
    		if ("start" in $$props) $$invalidate(13, start = $$props.start);
    		if ("date" in $$props) $$invalidate(16, date = $$props.date);
    		if ("end" in $$props) $$invalidate(14, end = $$props.end);
    		if ("top" in $$props) $$invalidate(11, top = $$props.top);
    		if ("bottom" in $$props) bottom = $$props.bottom;
    		if ("height" in $$props) $$invalidate(12, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		color,
    		width,
    		title,
    		space,
    		margin,
    		size,
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

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			color: 0,
    			width: 1,
    			title: 2,
    			space: 3,
    			margin: 4,
    			size: 5,
    			opacity: 6,
    			label: 7,
    			underline: 8,
    			dotted: 9,
    			rotate: 10,
    			duration: 15,
    			start: 13,
    			date: 16,
    			end: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Line",
    			options,
    			id: create_fragment$q.name
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

    	get space() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set space(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Line>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Line>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
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

    var somehowTicks = createCommonjsModule$1(function (module, exports) {
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
    const file$o = "Users/spencer/mountain/somehow-timeline/src/shapes/Label.svelte";

    // (81:2) {:else}
    function create_else_block$1(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "label svelte-1pa4pjr");
    			set_style(div0, "top", "20%");
    			set_style(div0, "color", /*color*/ ctx[1]);
    			set_style(div0, "font-size", /*size*/ ctx[5]);
    			add_location(div0, file$o, 81, 4, 1774);
    			attr_dev(div1, "class", "line svelte-1pa4pjr");
    			set_style(div1, "border-right", /*width*/ ctx[2] + " solid " + /*color*/ ctx[1]);
    			add_location(div1, file$o, 84, 4, 1879);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			div0.innerHTML = /*label*/ ctx[0];
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) div0.innerHTML = /*label*/ ctx[0];
    			if (dirty & /*color*/ 2) {
    				set_style(div0, "color", /*color*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 32) {
    				set_style(div0, "font-size", /*size*/ ctx[5]);
    			}

    			if (dirty & /*width, color*/ 6) {
    				set_style(div1, "border-right", /*width*/ ctx[2] + " solid " + /*color*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(81:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:2) {#if align === 'left'}
    function create_if_block$4(ctx) {
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "line svelte-1pa4pjr");
    			set_style(div0, "border-left", /*width*/ ctx[2] + " solid " + /*color*/ ctx[1]);
    			add_location(div0, file$o, 76, 4, 1590);
    			attr_dev(div1, "class", "label svelte-1pa4pjr");
    			set_style(div1, "top", "20%");
    			set_style(div1, "color", /*color*/ ctx[1]);
    			set_style(div1, "font-size", /*size*/ ctx[5]);
    			add_location(div1, file$o, 77, 4, 1659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			div1.innerHTML = /*label*/ ctx[0];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*width, color*/ 6) {
    				set_style(div0, "border-left", /*width*/ ctx[2] + " solid " + /*color*/ ctx[1]);
    			}

    			if (dirty & /*label*/ 1) div1.innerHTML = /*label*/ ctx[0];
    			if (dirty & /*color*/ 2) {
    				set_style(div1, "color", /*color*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 32) {
    				set_style(div1, "font-size", /*size*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(76:2) {#if align === 'left'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$r(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*align*/ ctx[3] === "left") return create_if_block$4;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "container svelte-1pa4pjr");
    			set_style(div, "width", "100%");
    			set_style(div, "opacity", /*opacity*/ ctx[6]);
    			set_style(div, "top", /*top*/ ctx[8] + /*margin*/ ctx[4] + "px");
    			set_style(div, "height", /*height*/ ctx[9] - /*margin*/ ctx[4] * 2 + "px");
    			attr_dev(div, "title", /*title*/ ctx[7]);
    			add_location(div, file$o, 70, 0, 1429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*opacity*/ 64) {
    				set_style(div, "opacity", /*opacity*/ ctx[6]);
    			}

    			if (dirty & /*margin*/ 16) {
    				set_style(div, "top", /*top*/ ctx[8] + /*margin*/ ctx[4] + "px");
    			}

    			if (dirty & /*margin*/ 16) {
    				set_style(div, "height", /*height*/ ctx[9] - /*margin*/ ctx[4] * 2 + "px");
    			}

    			if (dirty & /*title*/ 128) {
    				attr_dev(div, "title", /*title*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	let { width = "5px" } = $$props;
    	let { space = "5px" } = $$props;
    	let { align = "right" } = $$props;
    	let { margin = 0 } = $$props;
    	let { size = "14px" } = $$props;
    	let { opacity = "1" } = $$props;
    	let { title = "" } = $$props; //hover text
    	let { label = "" } = $$props;
    	let { text = "" } = $$props;
    	label = label || text;
    	let { color = "steelblue" } = $$props;
    	color = spencerColor.colors[color] || color;
    	let { start = getContext("start") } = $$props;
    	let { date = "" } = $$props;
    	start = date || start;
    	start = src(start);
    	let { end = getContext("end") } = $$props;
    	let { duration = "" } = $$props;

    	if (!end && duration) {
    		let words = duration.split(" ");
    		end = start.add(words[0], words[1]);
    	}

    	const scale = getContext("scale");
    	start = start.epoch;
    	end = src(end).epoch;

    	if (duration) {
    		let split = duration.split(" ");
    		end = src(start).add(Number(split[0]), split[1]).epoch;
    	}

    	let top = scale(start);
    	let bottom = scale(end);
    	let height = bottom - top;

    	const writable_props = [
    		"width",
    		"space",
    		"align",
    		"margin",
    		"size",
    		"opacity",
    		"title",
    		"label",
    		"text",
    		"color",
    		"start",
    		"date",
    		"end",
    		"duration"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Label> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Label", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("space" in $$props) $$invalidate(12, space = $$props.space);
    		if ("align" in $$props) $$invalidate(3, align = $$props.align);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("opacity" in $$props) $$invalidate(6, opacity = $$props.opacity);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("text" in $$props) $$invalidate(13, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("date" in $$props) $$invalidate(14, date = $$props.date);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
    	};

    	$$self.$capture_state = () => ({
    		spacetime: src,
    		getContext,
    		c: spencerColor,
    		width,
    		space,
    		align,
    		margin,
    		size,
    		opacity,
    		title,
    		label,
    		text,
    		color,
    		start,
    		date,
    		end,
    		duration,
    		scale,
    		top,
    		bottom,
    		height
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("space" in $$props) $$invalidate(12, space = $$props.space);
    		if ("align" in $$props) $$invalidate(3, align = $$props.align);
    		if ("margin" in $$props) $$invalidate(4, margin = $$props.margin);
    		if ("size" in $$props) $$invalidate(5, size = $$props.size);
    		if ("opacity" in $$props) $$invalidate(6, opacity = $$props.opacity);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("text" in $$props) $$invalidate(13, text = $$props.text);
    		if ("color" in $$props) $$invalidate(1, color = $$props.color);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("date" in $$props) $$invalidate(14, date = $$props.date);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("duration" in $$props) $$invalidate(15, duration = $$props.duration);
    		if ("top" in $$props) $$invalidate(8, top = $$props.top);
    		if ("bottom" in $$props) bottom = $$props.bottom;
    		if ("height" in $$props) $$invalidate(9, height = $$props.height);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		label,
    		color,
    		width,
    		align,
    		margin,
    		size,
    		opacity,
    		title,
    		top,
    		height,
    		start,
    		end,
    		space,
    		text,
    		date,
    		duration
    	];
    }

    class Label extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$r, create_fragment$r, safe_not_equal, {
    			width: 2,
    			space: 12,
    			align: 3,
    			margin: 4,
    			size: 5,
    			opacity: 6,
    			title: 7,
    			label: 0,
    			text: 13,
    			color: 1,
    			start: 10,
    			date: 14,
    			end: 11,
    			duration: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Label",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get width() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get space() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set space(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get margin() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
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

    	get duration() {
    		throw new Error("<Label>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Label>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Users/spencer/mountain/somehow-timeline/src/shapes/Column.svelte generated by Svelte v3.24.1 */

    const file$p = "Users/spencer/mountain/somehow-timeline/src/shapes/Column.svelte";

    function create_fragment$s(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "label svelte-zuei5e");
    			add_location(div0, file$p, 24, 2, 460);
    			attr_dev(div1, "class", "part column svelte-zuei5e");
    			set_style(div1, "width", /*width*/ ctx[1]);
    			add_location(div1, file$p, 23, 0, 409);
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

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*width*/ 2) {
    				set_style(div1, "width", /*width*/ ctx[1]);
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
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { width = "30px" } = $$props;
    	let { label = "" } = $$props;
    	let { title = "" } = $$props;
    	label = label || title;
    	const writable_props = ["width", "label", "title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Column> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Column", $$slots, ['default']);

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ width, label, title });

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("label" in $$props) $$invalidate(0, label = $$props.label);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, width, title, $$scope, $$slots];
    }

    class Column extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$s, create_fragment$s, safe_not_equal, { width: 1, label: 0, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Column",
    			options,
    			id: create_fragment$s.name
    		});
    	}

    	get width() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Column>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Column>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/TextArea.svelte generated by Svelte v3.24.1 */
    const file$q = "src/Components/TextArea.svelte";

    function create_fragment$t(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "class", "input svelte-1regd19");
    			set_style(textarea, "width", /*width*/ ctx[1]);
    			set_style(textarea, "height", /*height*/ ctx[2]);
    			set_style(textarea, "font-size", /*size*/ ctx[3]);
    			attr_dev(textarea, "spellcheck", "false");
    			attr_dev(textarea, "type", "text");
    			textarea.value = /*value*/ ctx[0];
    			add_location(textarea, file$q, 41, 0, 923);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[5](textarea);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 2) {
    				set_style(textarea, "width", /*width*/ ctx[1]);
    			}

    			if (dirty & /*height*/ 4) {
    				set_style(textarea, "height", /*height*/ ctx[2]);
    			}

    			if (dirty & /*size*/ 8) {
    				set_style(textarea, "font-size", /*size*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1) {
    				prop_dev(textarea, "value", /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[5](null);
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
    	let { value = "" } = $$props;
    	let el;

    	onMount(() => {
    		el.focus();
    	});

    	let { width = "60%" } = $$props;
    	let { height = "162px" } = $$props;
    	let { size = "2rem" } = $$props;
    	const writable_props = ["value", "width", "height", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextArea> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TextArea", $$slots, []);

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(4, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({ onMount, value, el, width, height, size });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("el" in $$props) $$invalidate(4, el = $$props.el);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, width, height, size, el, textarea_binding];
    }

    class TextArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$t, create_fragment$t, safe_not_equal, { value: 0, width: 1, height: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextArea",
    			options,
    			id: create_fragment$t.name
    		});
    	}

    	get value() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/03.refactoring/Timeline.svelte generated by Svelte v3.24.1 */
    const file$r = "src/03.refactoring/Timeline.svelte";

    // (37:6) <Column width="15px">
    function create_default_slot_2(ctx) {
    	let line0;
    	let t0;
    	let line1;
    	let t1;
    	let line2;
    	let current;

    	line0 = new Line({
    			props: {
    				start: "January 1 2020",
    				width: "20px",
    				end: "Feb 20 2020",
    				color: "pink"
    			},
    			$$inline: true
    		});

    	line1 = new Line({
    			props: {
    				start: "Feb 20 2020",
    				width: "20px",
    				end: "November 11 2020",
    				color: "#6699cc"
    			},
    			$$inline: true
    		});

    	line2 = new Line({
    			props: {
    				start: "November 11 2020",
    				width: "20px",
    				end: "December 20 2020",
    				color: "fire"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(line0.$$.fragment);
    			t0 = space();
    			create_component(line1.$$.fragment);
    			t1 = space();
    			create_component(line2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(line0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(line1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(line2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line0.$$.fragment, local);
    			transition_in(line1.$$.fragment, local);
    			transition_in(line2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line0.$$.fragment, local);
    			transition_out(line1.$$.fragment, local);
    			transition_out(line2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(line1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(line2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(37:6) <Column width=\\\"15px\\\">",
    		ctx
    	});

    	return block;
    }

    // (54:6) <Column width="75">
    function create_default_slot_1(ctx) {
    	let line0;
    	let t0;
    	let line1;
    	let t1;
    	let line2;
    	let current;

    	line0 = new Line({
    			props: {
    				start: "January 1 2020",
    				end: "Feb 20 2020",
    				color: "pink",
    				width: "15px",
    				dotted: true,
    				label: "Typing"
    			},
    			$$inline: true
    		});

    	line1 = new Line({
    			props: {
    				start: "Feb 20 2020",
    				end: "November 11 2020",
    				width: "15px",
    				dotted: true,
    				color: "#6699cc",
    				label: "Refactoring"
    			},
    			$$inline: true
    		});

    	line2 = new Line({
    			props: {
    				start: "November 11 2020",
    				end: "December 20 2020",
    				width: "15px",
    				dotted: true,
    				color: "fire",
    				label: "Proof-reading"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(line0.$$.fragment);
    			t0 = space();
    			create_component(line1.$$.fragment);
    			t1 = space();
    			create_component(line2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(line0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(line1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(line2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(line0.$$.fragment, local);
    			transition_in(line1.$$.fragment, local);
    			transition_in(line2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(line0.$$.fragment, local);
    			transition_out(line1.$$.fragment, local);
    			transition_out(line2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(line0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(line1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(line2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(54:6) <Column width=\\\"75\\\">",
    		ctx
    	});

    	return block;
    }

    // (36:4) <Timeline start="Jan 1 2020" end="Dec 30 2020" height="500">
    function create_default_slot(ctx) {
    	let column0;
    	let t;
    	let column1;
    	let current;

    	column0 = new Column({
    			props: {
    				width: "15px",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	column1 = new Column({
    			props: {
    				width: "75",
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

    			if (dirty & /*$$scope*/ 2) {
    				column0_changes.$$scope = { dirty, ctx };
    			}

    			column0.$set(column0_changes);
    			const column1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(36:4) <Timeline start=\\\"Jan 1 2020\\\" end=\\\"Dec 30 2020\\\" height=\\\"500\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$u(ctx) {
    	let div1;
    	let div0;
    	let textarea;
    	let t;
    	let timeline;
    	let current;

    	textarea = new TextArea({
    			props: {
    				width: "300px",
    				height: "400px",
    				value: /*txt*/ ctx[0],
    				size: "1.3rem"
    			},
    			$$inline: true
    		});

    	timeline = new Timeline({
    			props: {
    				start: "Jan 1 2020",
    				end: "Dec 30 2020",
    				height: "500",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(textarea.$$.fragment);
    			t = space();
    			create_component(timeline.$$.fragment);
    			attr_dev(div0, "class", "middle svelte-yixigh");
    			add_location(div0, file$r, 33, 2, 786);
    			attr_dev(div1, "class", "box ");
    			add_location(div1, file$r, 32, 0, 765);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(textarea, div0, null);
    			append_dev(div0, t);
    			mount_component(timeline, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const timeline_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				timeline_changes.$$scope = { dirty, ctx };
    			}

    			timeline.$set(timeline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textarea.$$.fragment, local);
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textarea.$$.fragment, local);
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(textarea);
    			destroy_component(timeline);
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
    	let txt = `In West Philadelphia born and raised, on the playground is where I spent most of my days.

Chilling out, maxing, relaxing all cool, and all shooting some b-ball outside of the school.

When a couple of guys, who were up to no good, started making trouble in my neighborhood.`;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);

    	$$self.$capture_state = () => ({
    		Timeline,
    		Column,
    		Line,
    		Label,
    		TextArea,
    		txt
    	});

    	$$self.$inject_state = $$props => {
    		if ("txt" in $$props) $$invalidate(0, txt = $$props.txt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [txt];
    }

    class Timeline_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline_1",
    			options,
    			id: create_fragment$u.name
    		});
    	}
    }

    /* src/03.refactoring/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$v(ctx) {
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*spaceBar*/ ctx[2], false, false, false);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
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
    	let steps = [Timeline_1];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_03_refactoring> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_03_refactoring", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		doEnd,
    		Timeline: Timeline_1,
    		steps,
    		i,
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev, doEnd];
    }

    class _03_refactoring extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, { done: 3, prev: 4, doEnd: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_03_refactoring",
    			options,
    			id: create_fragment$v.name
    		});
    	}

    	get done() {
    		throw new Error("<_03_refactoring>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_03_refactoring>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_03_refactoring>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_03_refactoring>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_03_refactoring>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_03_refactoring>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/04.focus/Zelda.svelte generated by Svelte v3.24.1 */
    const file$s = "src/04.focus/Zelda.svelte";

    function create_fragment$w(ctx) {
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
    			add_location(div, file$s, 11, 0, 193);
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
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let video = { src: "./src/04.focus/assets/zelda-2.mp4" };
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
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Zelda",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/04.focus/Canon-cat.svelte generated by Svelte v3.24.1 */
    const file$t = "src/04.focus/Canon-cat.svelte";

    function create_fragment$x(ctx) {
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
    			add_location(div, file$t, 9, 0, 187);
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
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let image = {
    		src: "./src/04.focus/assets/canon-cat.jpg",
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
    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canon_cat",
    			options,
    			id: create_fragment$x.name
    		});
    	}
    }

    /* src/04.focus/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$y(ctx) {
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
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*spaceBar*/ ctx[2], false, false, false);
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    			mounted = false;
    			dispose();
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
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let { doEnd = false } = $$props;
    	let steps = [Zelda, Canon_cat];
    	let i = 0;

    	// come from backward
    	i = doEnd === true ? steps.length - 1 : i;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		} else if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev", "doEnd"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_04_focus> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_04_focus", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
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
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("doEnd" in $$props) $$invalidate(5, doEnd = $$props.doEnd);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev, doEnd];
    }

    class _04_focus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$y, create_fragment$y, safe_not_equal, { done: 3, prev: 4, doEnd: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_04_focus",
    			options,
    			id: create_fragment$y.name
    		});
    	}

    	get done() {
    		throw new Error("<_04_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set done(value) {
    		throw new Error("<_04_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		throw new Error("<_04_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prev(value) {
    		throw new Error("<_04_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get doEnd() {
    		throw new Error("<_04_focus>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set doEnd(value) {
    		throw new Error("<_04_focus>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;
    const file$u = "src/App.svelte";

    function create_fragment$z(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
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
    			div = element("div");
    			t0 = text("part: ");
    			t1 = text(/*i*/ ctx[0]);
    			t2 = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			add_location(div, file$u, 33, 0, 749);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			insert_dev(target, t2, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*i*/ 1) set_data_dev(t1, /*i*/ ctx[0]);
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
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
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
    	setContext("size", { width: 1280, height: 720 });
    	let i = 0;
    	let steps = [_00_intro, _01_keyboards, _02_word_wrap, _03_refactoring, _04_focus];
    	let doEnd = false;

    	function prev() {
    		if (i > 0) {
    			$$invalidate(0, i -= 1);
    		}

    		$$invalidate(0, i = i < 0 ? 0 : i); // dont go under 0
    		$$invalidate(1, doEnd = true);
    		console.log("prev", i);
    	}

    	function done() {
    		if (steps[i + 1]) {
    			$$invalidate(0, i += 1);
    		} else {
    			console.log("done");
    		}

    		$$invalidate(1, doEnd = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		setContext,
    		Intro: _00_intro,
    		Keyboards: _01_keyboards,
    		Wrapping: _02_word_wrap,
    		Refactoring: _03_refactoring,
    		Focus: _04_focus,
    		i,
    		steps,
    		doEnd,
    		prev,
    		done
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    		if ("steps" in $$props) $$invalidate(2, steps = $$props.steps);
    		if ("doEnd" in $$props) $$invalidate(1, doEnd = $$props.doEnd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, doEnd, steps, prev, done];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$z.name
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
