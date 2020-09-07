
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
      console.log(e.keyCode);
      if (e.keyCode === 32 || e.keyCode === 39 || e.keyCode === 40) {
        e.preventDefault();
        return i + 1
      }
      if (e.keyCode === 37 || e.keyCode === 38) {
        e.preventDefault();
        return i - 1
      }
      return i
    };

    /* src/00.intro/Resolution-1.svelte generated by Svelte v3.24.1 */

    const file = "src/00.intro/Resolution-1.svelte";

    function create_fragment(ctx) {
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
    			attr_dev(div0, "class", "todo svelte-nhz2za");
    			add_location(div0, file, 20, 2, 293);
    			attr_dev(div1, "class", "todo svelte-nhz2za");
    			add_location(div1, file, 21, 2, 338);
    			attr_dev(div2, "class", "todo svelte-nhz2za");
    			add_location(div2, file, 22, 2, 396);
    			attr_dev(div3, "class", "todo svelte-nhz2za");
    			add_location(div3, file, 23, 2, 461);
    			attr_dev(div4, "class", "todo svelte-nhz2za");
    			add_location(div4, file, 24, 2, 519);
    			attr_dev(div5, "class", "todo svelte-nhz2za");
    			add_location(div5, file, 25, 2, 565);
    			attr_dev(div6, "class", "box main svelte-nhz2za");
    			add_location(div6, file, 19, 0, 268);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
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
    			if (detaching) detach_dev(div6);
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

    function instance($$self, $$props) {
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
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_1",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/00.intro/Resolution-2.svelte generated by Svelte v3.24.1 */

    const file$1 = "src/00.intro/Resolution-2.svelte";

    function create_fragment$1(ctx) {
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
    			attr_dev(div0, "class", "todo nope svelte-badyux");
    			add_location(div0, file$1, 25, 2, 384);
    			attr_dev(div1, "class", "todo nope svelte-badyux");
    			add_location(div1, file$1, 26, 2, 434);
    			attr_dev(div2, "class", "todo nope svelte-badyux");
    			add_location(div2, file$1, 27, 2, 497);
    			attr_dev(div3, "class", "todo svelte-badyux");
    			add_location(div3, file$1, 28, 2, 567);
    			attr_dev(div4, "class", "todo nope svelte-badyux");
    			add_location(div4, file$1, 29, 2, 625);
    			attr_dev(div5, "class", "todo nope svelte-badyux");
    			add_location(div5, file$1, 30, 2, 676);
    			attr_dev(div6, "class", "box main svelte-badyux");
    			add_location(div6, file$1, 24, 0, 359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
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
    			if (detaching) detach_dev(div6);
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

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Resolution_2",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Components/Video.svelte generated by Svelte v3.24.1 */

    const file$2 = "src/Components/Video.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let video;
    	let track;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*sub*/ ctx[2]);
    			t3 = space();
    			video = element("video");
    			track = element("track");
    			attr_dev(div0, "class", "title svelte-18ucy0n");
    			add_location(div0, file$2, 40, 2, 665);
    			attr_dev(div1, "class", "sub svelte-18ucy0n");
    			add_location(div1, file$2, 41, 2, 700);
    			attr_dev(div2, "class", "caption svelte-18ucy0n");
    			add_location(div2, file$2, 39, 0, 641);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$2, 44, 2, 794);
    			set_style(video, "margin-bottom", "0px");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.autoplay = true;
    			attr_dev(video, "mute", "");
    			attr_dev(video, "class", "svelte-18ucy0n");
    			add_location(video, file$2, 43, 0, 736);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, video, anchor);
    			append_dev(video, track);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);
    			if (dirty & /*sub*/ 4) set_data_dev(t2, /*sub*/ ctx[2]);

    			if (dirty & /*src*/ 1 && video.src !== (video_src_value = /*src*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(video);
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
    	let { src = "" } = $$props;
    	let { title = "" } = $$props;
    	let { sub = "" } = $$props;
    	const writable_props = ["src", "title", "sub"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Video", $$slots, []);

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

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { src: 0, title: 1, sub: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$2.name
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
    }

    const wait = async function (time = 1.2, fn) {
      console.log('set wait');
      console.log('set wait');
      return new Promise((resolve) =>
        setTimeout(() => {
          console.log('resolved');
          fn();
          resolve();
        }, time * 1000)
      )
    };

    /* src/00.intro/Concepts.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/00.intro/Concepts.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(div, file$3, 33, 0, 590);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Concepts",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/00.intro/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let steps = [Resolution_1, Resolution_2, Concepts];
    	let i = 0;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		}

    		if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_00_intro> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_00_intro", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		Resolution1: Resolution_1,
    		Resolution2: Resolution_2,
    		Concepts,
    		steps,
    		i,
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev];
    }

    class _00_intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { done: 3, prev: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_00_intro",
    			options,
    			id: create_fragment$4.name
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
    }

    /* src/01.keyboards/Desks.svelte generated by Svelte v3.24.1 */

    const file$4 = "src/01.keyboards/Desks.svelte";

    function create_fragment$5(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "desks here";
    			attr_dev(div, "class", "box");
    			add_location(div, file$4, 8, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$5($$self, $$props) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Desks",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/01.keyboards/Typewriter.1.svelte generated by Svelte v3.24.1 */

    const file$5 = "src/01.keyboards/Typewriter.1.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(div0, file$5, 43, 6, 798);
    			attr_dev(div1, "class", "key svelte-1uh5q9t");
    			add_location(div1, file$5, 44, 6, 853);
    			attr_dev(div2, "class", "key svelte-1uh5q9t");
    			add_location(div2, file$5, 45, 6, 884);
    			attr_dev(div3, "class", "key svelte-1uh5q9t");
    			add_location(div3, file$5, 46, 6, 915);
    			attr_dev(div4, "class", "key svelte-1uh5q9t");
    			add_location(div4, file$5, 47, 6, 946);
    			attr_dev(div5, "class", "key svelte-1uh5q9t");
    			add_location(div5, file$5, 48, 6, 977);
    			attr_dev(div6, "class", "key svelte-1uh5q9t");
    			add_location(div6, file$5, 49, 6, 1008);
    			attr_dev(div7, "class", "key svelte-1uh5q9t");
    			add_location(div7, file$5, 50, 6, 1039);
    			attr_dev(div8, "class", "key svelte-1uh5q9t");
    			add_location(div8, file$5, 51, 6, 1070);
    			attr_dev(div9, "class", "key svelte-1uh5q9t");
    			add_location(div9, file$5, 52, 6, 1101);
    			attr_dev(div10, "class", "key svelte-1uh5q9t");
    			add_location(div10, file$5, 53, 6, 1132);
    			attr_dev(div11, "class", "key svelte-1uh5q9t");
    			add_location(div11, file$5, 54, 6, 1163);
    			attr_dev(div12, "class", "key svelte-1uh5q9t");
    			add_location(div12, file$5, 55, 6, 1194);
    			attr_dev(div13, "class", "key svelte-1uh5q9t");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$5, 56, 6, 1225);
    			attr_dev(div14, "class", "row svelte-1uh5q9t");
    			add_location(div14, file$5, 42, 4, 774);
    			attr_dev(div15, "class", "key red svelte-1uh5q9t");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$5, 59, 6, 1308);
    			attr_dev(div16, "class", "key svelte-1uh5q9t");
    			add_location(div16, file$5, 60, 6, 1364);
    			attr_dev(div17, "class", "key svelte-1uh5q9t");
    			add_location(div17, file$5, 61, 6, 1395);
    			attr_dev(div18, "class", "key svelte-1uh5q9t");
    			add_location(div18, file$5, 62, 6, 1426);
    			attr_dev(div19, "class", "key svelte-1uh5q9t");
    			add_location(div19, file$5, 63, 6, 1457);
    			attr_dev(div20, "class", "key svelte-1uh5q9t");
    			add_location(div20, file$5, 64, 6, 1488);
    			attr_dev(div21, "class", "key svelte-1uh5q9t");
    			add_location(div21, file$5, 65, 6, 1519);
    			attr_dev(div22, "class", "key svelte-1uh5q9t");
    			add_location(div22, file$5, 66, 6, 1550);
    			attr_dev(div23, "class", "key svelte-1uh5q9t");
    			add_location(div23, file$5, 67, 6, 1581);
    			attr_dev(div24, "class", "key svelte-1uh5q9t");
    			add_location(div24, file$5, 68, 6, 1612);
    			attr_dev(div25, "class", "key svelte-1uh5q9t");
    			add_location(div25, file$5, 69, 6, 1643);
    			attr_dev(div26, "class", "key svelte-1uh5q9t");
    			add_location(div26, file$5, 70, 6, 1674);
    			attr_dev(div27, "class", "key svelte-1uh5q9t");
    			add_location(div27, file$5, 71, 6, 1705);
    			attr_dev(div28, "class", "key svelte-1uh5q9t");
    			add_location(div28, file$5, 72, 6, 1736);
    			attr_dev(div29, "class", "row svelte-1uh5q9t");
    			add_location(div29, file$5, 58, 4, 1284);
    			attr_dev(div30, "class", "key red svelte-1uh5q9t");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$5, 75, 6, 1800);
    			attr_dev(div31, "class", "key svelte-1uh5q9t");
    			add_location(div31, file$5, 76, 6, 1857);
    			attr_dev(div32, "class", "key svelte-1uh5q9t");
    			add_location(div32, file$5, 77, 6, 1888);
    			attr_dev(div33, "class", "key svelte-1uh5q9t");
    			add_location(div33, file$5, 78, 6, 1919);
    			attr_dev(div34, "class", "key svelte-1uh5q9t");
    			add_location(div34, file$5, 79, 6, 1950);
    			attr_dev(div35, "class", "key svelte-1uh5q9t");
    			add_location(div35, file$5, 80, 6, 1981);
    			attr_dev(div36, "class", "key svelte-1uh5q9t");
    			add_location(div36, file$5, 81, 6, 2012);
    			attr_dev(div37, "class", "key svelte-1uh5q9t");
    			add_location(div37, file$5, 82, 6, 2043);
    			attr_dev(div38, "class", "key svelte-1uh5q9t");
    			add_location(div38, file$5, 83, 6, 2074);
    			attr_dev(div39, "class", "key svelte-1uh5q9t");
    			add_location(div39, file$5, 84, 6, 2105);
    			attr_dev(div40, "class", "key svelte-1uh5q9t");
    			add_location(div40, file$5, 85, 6, 2136);
    			attr_dev(div41, "class", "key svelte-1uh5q9t");
    			add_location(div41, file$5, 86, 6, 2167);
    			attr_dev(div42, "class", "key red svelte-1uh5q9t");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$5, 87, 6, 2198);
    			attr_dev(div43, "class", "row svelte-1uh5q9t");
    			add_location(div43, file$5, 74, 4, 1776);
    			attr_dev(div44, "class", "key red svelte-1uh5q9t");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$5, 90, 6, 2285);
    			attr_dev(div45, "class", "key svelte-1uh5q9t");
    			add_location(div45, file$5, 91, 6, 2340);
    			attr_dev(div46, "class", "key svelte-1uh5q9t");
    			add_location(div46, file$5, 92, 6, 2371);
    			attr_dev(div47, "class", "key svelte-1uh5q9t");
    			add_location(div47, file$5, 93, 6, 2402);
    			attr_dev(div48, "class", "key svelte-1uh5q9t");
    			add_location(div48, file$5, 94, 6, 2433);
    			attr_dev(div49, "class", "key svelte-1uh5q9t");
    			add_location(div49, file$5, 95, 6, 2464);
    			attr_dev(div50, "class", "key svelte-1uh5q9t");
    			add_location(div50, file$5, 96, 6, 2495);
    			attr_dev(div51, "class", "key svelte-1uh5q9t");
    			add_location(div51, file$5, 97, 6, 2526);
    			attr_dev(div52, "class", "key svelte-1uh5q9t");
    			add_location(div52, file$5, 98, 6, 2557);
    			attr_dev(div53, "class", "key svelte-1uh5q9t");
    			add_location(div53, file$5, 99, 6, 2588);
    			attr_dev(div54, "class", "key svelte-1uh5q9t");
    			add_location(div54, file$5, 100, 6, 2619);
    			attr_dev(div55, "class", "key red svelte-1uh5q9t");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$5, 101, 6, 2650);
    			attr_dev(div56, "class", "row svelte-1uh5q9t");
    			add_location(div56, file$5, 89, 4, 2261);
    			attr_dev(div57, "class", "key svelte-1uh5q9t");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$5, 104, 6, 2738);
    			attr_dev(div58, "class", "key svelte-1uh5q9t");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$5, 105, 6, 2788);
    			attr_dev(div59, "class", "key svelte-1uh5q9t");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$5, 106, 6, 2838);
    			attr_dev(div60, "class", "key red svelte-1uh5q9t");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$5, 107, 6, 2888);
    			attr_dev(div61, "class", "key svelte-1uh5q9t");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$5, 108, 6, 2938);
    			attr_dev(div62, "class", "key svelte-1uh5q9t");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$5, 109, 6, 2988);
    			attr_dev(div63, "class", "key svelte-1uh5q9t");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$5, 110, 6, 3038);
    			attr_dev(div64, "class", "row svelte-1uh5q9t");
    			add_location(div64, file$5, 103, 4, 2714);
    			attr_dev(div65, "class", "container svelte-1uh5q9t");
    			add_location(div65, file$5, 41, 2, 746);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$5, 40, 0, 726);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_1",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/01.keyboards/Typewriter.2.svelte generated by Svelte v3.24.1 */

    const file$6 = "src/01.keyboards/Typewriter.2.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(div0, file$6, 48, 6, 894);
    			attr_dev(div1, "class", "key svelte-1upw8wx");
    			add_location(div1, file$6, 49, 6, 949);
    			attr_dev(div2, "class", "key svelte-1upw8wx");
    			add_location(div2, file$6, 50, 6, 980);
    			attr_dev(div3, "class", "key svelte-1upw8wx");
    			add_location(div3, file$6, 51, 6, 1011);
    			attr_dev(div4, "class", "key svelte-1upw8wx");
    			add_location(div4, file$6, 52, 6, 1042);
    			attr_dev(div5, "class", "key svelte-1upw8wx");
    			add_location(div5, file$6, 53, 6, 1073);
    			attr_dev(div6, "class", "key svelte-1upw8wx");
    			add_location(div6, file$6, 54, 6, 1104);
    			attr_dev(div7, "class", "key svelte-1upw8wx");
    			add_location(div7, file$6, 55, 6, 1135);
    			attr_dev(div8, "class", "key svelte-1upw8wx");
    			add_location(div8, file$6, 56, 6, 1166);
    			attr_dev(div9, "class", "key svelte-1upw8wx");
    			add_location(div9, file$6, 57, 6, 1197);
    			attr_dev(div10, "class", "key svelte-1upw8wx");
    			add_location(div10, file$6, 58, 6, 1228);
    			attr_dev(div11, "class", "key svelte-1upw8wx");
    			add_location(div11, file$6, 59, 6, 1259);
    			attr_dev(div12, "class", "key svelte-1upw8wx");
    			add_location(div12, file$6, 60, 6, 1290);
    			attr_dev(div13, "class", "key svelte-1upw8wx");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$6, 61, 6, 1321);
    			attr_dev(div14, "class", "row svelte-1upw8wx");
    			add_location(div14, file$6, 47, 4, 870);
    			attr_dev(div15, "class", "key red svelte-1upw8wx");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$6, 64, 6, 1404);
    			attr_dev(div16, "class", "key svelte-1upw8wx");
    			add_location(div16, file$6, 65, 6, 1460);
    			attr_dev(div17, "class", "key svelte-1upw8wx");
    			add_location(div17, file$6, 66, 6, 1491);
    			attr_dev(div18, "class", "key svelte-1upw8wx");
    			add_location(div18, file$6, 67, 6, 1522);
    			attr_dev(div19, "class", "key svelte-1upw8wx");
    			add_location(div19, file$6, 68, 6, 1553);
    			attr_dev(div20, "class", "key svelte-1upw8wx");
    			add_location(div20, file$6, 69, 6, 1584);
    			attr_dev(div21, "class", "key svelte-1upw8wx");
    			add_location(div21, file$6, 70, 6, 1615);
    			attr_dev(div22, "class", "key svelte-1upw8wx");
    			add_location(div22, file$6, 71, 6, 1646);
    			attr_dev(div23, "class", "key svelte-1upw8wx");
    			add_location(div23, file$6, 72, 6, 1677);
    			attr_dev(div24, "class", "key svelte-1upw8wx");
    			add_location(div24, file$6, 73, 6, 1708);
    			attr_dev(div25, "class", "key svelte-1upw8wx");
    			add_location(div25, file$6, 74, 6, 1739);
    			attr_dev(div26, "class", "key svelte-1upw8wx");
    			add_location(div26, file$6, 75, 6, 1770);
    			attr_dev(div27, "class", "key svelte-1upw8wx");
    			add_location(div27, file$6, 76, 6, 1801);
    			attr_dev(div28, "class", "key svelte-1upw8wx");
    			add_location(div28, file$6, 77, 6, 1832);
    			attr_dev(div29, "class", "row svelte-1upw8wx");
    			add_location(div29, file$6, 63, 4, 1380);
    			attr_dev(div30, "class", "key red svelte-1upw8wx");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$6, 80, 6, 1896);
    			attr_dev(div31, "class", "key svelte-1upw8wx");
    			add_location(div31, file$6, 81, 6, 1953);
    			attr_dev(div32, "class", "key svelte-1upw8wx");
    			add_location(div32, file$6, 82, 6, 1984);
    			attr_dev(div33, "class", "key svelte-1upw8wx");
    			add_location(div33, file$6, 83, 6, 2015);
    			attr_dev(div34, "class", "key svelte-1upw8wx");
    			add_location(div34, file$6, 84, 6, 2046);
    			attr_dev(div35, "class", "key svelte-1upw8wx");
    			add_location(div35, file$6, 85, 6, 2077);
    			attr_dev(div36, "class", "key svelte-1upw8wx");
    			add_location(div36, file$6, 86, 6, 2108);
    			attr_dev(div37, "class", "key svelte-1upw8wx");
    			add_location(div37, file$6, 87, 6, 2139);
    			attr_dev(div38, "class", "key svelte-1upw8wx");
    			add_location(div38, file$6, 88, 6, 2170);
    			attr_dev(div39, "class", "key svelte-1upw8wx");
    			add_location(div39, file$6, 89, 6, 2201);
    			attr_dev(div40, "class", "key svelte-1upw8wx");
    			add_location(div40, file$6, 90, 6, 2232);
    			attr_dev(div41, "class", "key svelte-1upw8wx");
    			add_location(div41, file$6, 91, 6, 2263);
    			attr_dev(div42, "class", "key blue svelte-1upw8wx");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$6, 92, 6, 2294);
    			attr_dev(div43, "class", "row svelte-1upw8wx");
    			add_location(div43, file$6, 79, 4, 1872);
    			attr_dev(div44, "class", "key red svelte-1upw8wx");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$6, 95, 6, 2382);
    			attr_dev(div45, "class", "key svelte-1upw8wx");
    			add_location(div45, file$6, 96, 6, 2437);
    			attr_dev(div46, "class", "key svelte-1upw8wx");
    			add_location(div46, file$6, 97, 6, 2468);
    			attr_dev(div47, "class", "key svelte-1upw8wx");
    			add_location(div47, file$6, 98, 6, 2499);
    			attr_dev(div48, "class", "key svelte-1upw8wx");
    			add_location(div48, file$6, 99, 6, 2530);
    			attr_dev(div49, "class", "key svelte-1upw8wx");
    			add_location(div49, file$6, 100, 6, 2561);
    			attr_dev(div50, "class", "key svelte-1upw8wx");
    			add_location(div50, file$6, 101, 6, 2592);
    			attr_dev(div51, "class", "key svelte-1upw8wx");
    			add_location(div51, file$6, 102, 6, 2623);
    			attr_dev(div52, "class", "key svelte-1upw8wx");
    			add_location(div52, file$6, 103, 6, 2654);
    			attr_dev(div53, "class", "key svelte-1upw8wx");
    			add_location(div53, file$6, 104, 6, 2685);
    			attr_dev(div54, "class", "key svelte-1upw8wx");
    			add_location(div54, file$6, 105, 6, 2716);
    			attr_dev(div55, "class", "key red svelte-1upw8wx");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$6, 106, 6, 2747);
    			attr_dev(div56, "class", "row svelte-1upw8wx");
    			add_location(div56, file$6, 94, 4, 2358);
    			attr_dev(div57, "class", "key svelte-1upw8wx");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$6, 109, 6, 2835);
    			attr_dev(div58, "class", "key svelte-1upw8wx");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$6, 110, 6, 2885);
    			attr_dev(div59, "class", "key svelte-1upw8wx");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$6, 111, 6, 2935);
    			attr_dev(div60, "class", "key red svelte-1upw8wx");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$6, 112, 6, 2985);
    			attr_dev(div61, "class", "key svelte-1upw8wx");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$6, 113, 6, 3035);
    			attr_dev(div62, "class", "key svelte-1upw8wx");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$6, 114, 6, 3085);
    			attr_dev(div63, "class", "key svelte-1upw8wx");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$6, 115, 6, 3135);
    			attr_dev(div64, "class", "row svelte-1upw8wx");
    			add_location(div64, file$6, 108, 4, 2811);
    			attr_dev(div65, "class", "container svelte-1upw8wx");
    			add_location(div65, file$6, 46, 2, 842);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$6, 45, 0, 822);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Typewriter_2> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Typewriter_2", $$slots, []);
    	return [];
    }

    class Typewriter_2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Typewriter_2",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/01.keyboards/Punctuation.1.svelte generated by Svelte v3.24.1 */

    const file$7 = "src/01.keyboards/Punctuation.1.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(div0, file$7, 45, 6, 813);
    			attr_dev(div1, "class", "key show svelte-scstui");
    			add_location(div1, file$7, 46, 6, 873);
    			attr_dev(div2, "class", "key show svelte-scstui");
    			add_location(div2, file$7, 47, 6, 909);
    			attr_dev(div3, "class", "key show svelte-scstui");
    			add_location(div3, file$7, 48, 6, 945);
    			attr_dev(div4, "class", "key show svelte-scstui");
    			add_location(div4, file$7, 49, 6, 981);
    			attr_dev(div5, "class", "key show svelte-scstui");
    			add_location(div5, file$7, 50, 6, 1017);
    			attr_dev(div6, "class", "key show svelte-scstui");
    			add_location(div6, file$7, 51, 6, 1053);
    			attr_dev(div7, "class", "key show svelte-scstui");
    			add_location(div7, file$7, 52, 6, 1089);
    			attr_dev(div8, "class", "key show svelte-scstui");
    			add_location(div8, file$7, 53, 6, 1125);
    			attr_dev(div9, "class", "key show svelte-scstui");
    			add_location(div9, file$7, 54, 6, 1161);
    			attr_dev(div10, "class", "key show svelte-scstui");
    			add_location(div10, file$7, 55, 6, 1197);
    			attr_dev(div11, "class", "key show svelte-scstui");
    			add_location(div11, file$7, 56, 6, 1233);
    			attr_dev(div12, "class", "key show svelte-scstui");
    			add_location(div12, file$7, 57, 6, 1269);
    			attr_dev(div13, "class", "key pink svelte-scstui");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$7, 58, 6, 1305);
    			attr_dev(div14, "class", "row svelte-scstui");
    			add_location(div14, file$7, 44, 4, 789);
    			attr_dev(div15, "class", "key pink svelte-scstui");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$7, 61, 6, 1393);
    			attr_dev(div16, "class", "key svelte-scstui");
    			add_location(div16, file$7, 62, 6, 1450);
    			attr_dev(div17, "class", "key svelte-scstui");
    			add_location(div17, file$7, 63, 6, 1481);
    			attr_dev(div18, "class", "key svelte-scstui");
    			add_location(div18, file$7, 64, 6, 1512);
    			attr_dev(div19, "class", "key svelte-scstui");
    			add_location(div19, file$7, 65, 6, 1543);
    			attr_dev(div20, "class", "key svelte-scstui");
    			add_location(div20, file$7, 66, 6, 1574);
    			attr_dev(div21, "class", "key svelte-scstui");
    			add_location(div21, file$7, 67, 6, 1605);
    			attr_dev(div22, "class", "key svelte-scstui");
    			add_location(div22, file$7, 68, 6, 1636);
    			attr_dev(div23, "class", "key svelte-scstui");
    			add_location(div23, file$7, 69, 6, 1667);
    			attr_dev(div24, "class", "key svelte-scstui");
    			add_location(div24, file$7, 70, 6, 1698);
    			attr_dev(div25, "class", "key svelte-scstui");
    			add_location(div25, file$7, 71, 6, 1729);
    			attr_dev(div26, "class", "key show svelte-scstui");
    			add_location(div26, file$7, 72, 6, 1760);
    			attr_dev(div27, "class", "key show svelte-scstui");
    			add_location(div27, file$7, 73, 6, 1796);
    			attr_dev(div28, "class", "key show svelte-scstui");
    			add_location(div28, file$7, 74, 6, 1832);
    			attr_dev(div29, "class", "row svelte-scstui");
    			add_location(div29, file$7, 60, 4, 1369);
    			attr_dev(div30, "class", "key pink svelte-scstui");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$7, 77, 6, 1901);
    			attr_dev(div31, "class", "key svelte-scstui");
    			add_location(div31, file$7, 78, 6, 1959);
    			attr_dev(div32, "class", "key svelte-scstui");
    			add_location(div32, file$7, 79, 6, 1990);
    			attr_dev(div33, "class", "key svelte-scstui");
    			add_location(div33, file$7, 80, 6, 2021);
    			attr_dev(div34, "class", "key svelte-scstui");
    			add_location(div34, file$7, 81, 6, 2052);
    			attr_dev(div35, "class", "key svelte-scstui");
    			add_location(div35, file$7, 82, 6, 2083);
    			attr_dev(div36, "class", "key svelte-scstui");
    			add_location(div36, file$7, 83, 6, 2114);
    			attr_dev(div37, "class", "key svelte-scstui");
    			add_location(div37, file$7, 84, 6, 2145);
    			attr_dev(div38, "class", "key svelte-scstui");
    			add_location(div38, file$7, 85, 6, 2176);
    			attr_dev(div39, "class", "key svelte-scstui");
    			add_location(div39, file$7, 86, 6, 2207);
    			attr_dev(div40, "class", "key show svelte-scstui");
    			add_location(div40, file$7, 87, 6, 2238);
    			attr_dev(div41, "class", "key show svelte-scstui");
    			add_location(div41, file$7, 88, 6, 2274);
    			attr_dev(div42, "class", "key pink svelte-scstui");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$7, 89, 6, 2310);
    			attr_dev(div43, "class", "row svelte-scstui");
    			add_location(div43, file$7, 76, 4, 1877);
    			attr_dev(div44, "class", "key pink svelte-scstui");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$7, 92, 6, 2398);
    			attr_dev(div45, "class", "key svelte-scstui");
    			add_location(div45, file$7, 93, 6, 2454);
    			attr_dev(div46, "class", "key svelte-scstui");
    			add_location(div46, file$7, 94, 6, 2485);
    			attr_dev(div47, "class", "key svelte-scstui");
    			add_location(div47, file$7, 95, 6, 2516);
    			attr_dev(div48, "class", "key svelte-scstui");
    			add_location(div48, file$7, 96, 6, 2547);
    			attr_dev(div49, "class", "key svelte-scstui");
    			add_location(div49, file$7, 97, 6, 2578);
    			attr_dev(div50, "class", "key svelte-scstui");
    			add_location(div50, file$7, 98, 6, 2609);
    			attr_dev(div51, "class", "key svelte-scstui");
    			add_location(div51, file$7, 99, 6, 2640);
    			attr_dev(div52, "class", "key show svelte-scstui");
    			add_location(div52, file$7, 100, 6, 2671);
    			attr_dev(div53, "class", "key show svelte-scstui");
    			add_location(div53, file$7, 101, 6, 2707);
    			attr_dev(div54, "class", "key show svelte-scstui");
    			add_location(div54, file$7, 102, 6, 2743);
    			attr_dev(div55, "class", "key pink svelte-scstui");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$7, 103, 6, 2779);
    			attr_dev(div56, "class", "row svelte-scstui");
    			add_location(div56, file$7, 91, 4, 2374);
    			attr_dev(div57, "class", "key pink svelte-scstui");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$7, 106, 6, 2868);
    			attr_dev(div58, "class", "key pink svelte-scstui");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$7, 107, 6, 2923);
    			attr_dev(div59, "class", "key pink svelte-scstui");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$7, 108, 6, 2978);
    			attr_dev(div60, "class", "key  svelte-scstui");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$7, 109, 6, 3033);
    			attr_dev(div61, "class", "key pink svelte-scstui");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$7, 110, 6, 3080);
    			attr_dev(div62, "class", "key pink svelte-scstui");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$7, 111, 6, 3135);
    			attr_dev(div63, "class", "key pink svelte-scstui");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$7, 112, 6, 3190);
    			attr_dev(div64, "class", "row svelte-scstui");
    			add_location(div64, file$7, 105, 4, 2844);
    			attr_dev(div65, "class", "container svelte-scstui");
    			add_location(div65, file$7, 43, 2, 761);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$7, 42, 0, 741);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Punctuation_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Punctuation_1", $$slots, []);
    	return [];
    }

    class Punctuation_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_1",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/01.keyboards/Punctuation.2.svelte generated by Svelte v3.24.1 */

    const file$8 = "src/01.keyboards/Punctuation.2.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(div0, file$8, 48, 6, 845);
    			attr_dev(div1, "class", "key show nope svelte-4wi716");
    			add_location(div1, file$8, 49, 6, 905);
    			attr_dev(div2, "class", "key show svelte-4wi716");
    			add_location(div2, file$8, 50, 6, 946);
    			attr_dev(div3, "class", "key show svelte-4wi716");
    			add_location(div3, file$8, 51, 6, 982);
    			attr_dev(div4, "class", "key show nope svelte-4wi716");
    			add_location(div4, file$8, 52, 6, 1018);
    			attr_dev(div5, "class", "key show nope svelte-4wi716");
    			add_location(div5, file$8, 53, 6, 1059);
    			attr_dev(div6, "class", "key show svelte-4wi716");
    			add_location(div6, file$8, 54, 6, 1100);
    			attr_dev(div7, "class", "key show svelte-4wi716");
    			add_location(div7, file$8, 55, 6, 1136);
    			attr_dev(div8, "class", "key show svelte-4wi716");
    			add_location(div8, file$8, 56, 6, 1172);
    			attr_dev(div9, "class", "key show nope svelte-4wi716");
    			add_location(div9, file$8, 57, 6, 1208);
    			attr_dev(div10, "class", "key show nope svelte-4wi716");
    			add_location(div10, file$8, 58, 6, 1249);
    			attr_dev(div11, "class", "key show nope svelte-4wi716");
    			add_location(div11, file$8, 59, 6, 1290);
    			attr_dev(div12, "class", "key show nope svelte-4wi716");
    			add_location(div12, file$8, 60, 6, 1331);
    			attr_dev(div13, "class", "key nope pink svelte-4wi716");
    			set_style(div13, "width", "70px");
    			add_location(div13, file$8, 61, 6, 1372);
    			attr_dev(div14, "class", "row svelte-4wi716");
    			add_location(div14, file$8, 47, 4, 821);
    			attr_dev(div15, "class", "key nope pink svelte-4wi716");
    			set_style(div15, "width", "50px");
    			add_location(div15, file$8, 64, 6, 1465);
    			attr_dev(div16, "class", "key nope svelte-4wi716");
    			add_location(div16, file$8, 65, 6, 1527);
    			attr_dev(div17, "class", "key nope svelte-4wi716");
    			add_location(div17, file$8, 66, 6, 1563);
    			attr_dev(div18, "class", "key nope svelte-4wi716");
    			add_location(div18, file$8, 67, 6, 1599);
    			attr_dev(div19, "class", "key nope svelte-4wi716");
    			add_location(div19, file$8, 68, 6, 1635);
    			attr_dev(div20, "class", "key nope svelte-4wi716");
    			add_location(div20, file$8, 69, 6, 1671);
    			attr_dev(div21, "class", "key nope svelte-4wi716");
    			add_location(div21, file$8, 70, 6, 1707);
    			attr_dev(div22, "class", "key nope svelte-4wi716");
    			add_location(div22, file$8, 71, 6, 1743);
    			attr_dev(div23, "class", "key nope svelte-4wi716");
    			add_location(div23, file$8, 72, 6, 1779);
    			attr_dev(div24, "class", "key nope svelte-4wi716");
    			add_location(div24, file$8, 73, 6, 1815);
    			attr_dev(div25, "class", "key nope svelte-4wi716");
    			add_location(div25, file$8, 74, 6, 1851);
    			attr_dev(div26, "class", "key show svelte-4wi716");
    			add_location(div26, file$8, 75, 6, 1887);
    			attr_dev(div27, "class", "key show svelte-4wi716");
    			add_location(div27, file$8, 76, 6, 1923);
    			attr_dev(div28, "class", "key show svelte-4wi716");
    			add_location(div28, file$8, 77, 6, 1959);
    			attr_dev(div29, "class", "row svelte-4wi716");
    			add_location(div29, file$8, 63, 4, 1441);
    			attr_dev(div30, "class", "key nope pink svelte-4wi716");
    			set_style(div30, "width", "80px");
    			add_location(div30, file$8, 80, 6, 2028);
    			attr_dev(div31, "class", "key nope svelte-4wi716");
    			add_location(div31, file$8, 81, 6, 2091);
    			attr_dev(div32, "class", "key nope svelte-4wi716");
    			add_location(div32, file$8, 82, 6, 2127);
    			attr_dev(div33, "class", "key nope svelte-4wi716");
    			add_location(div33, file$8, 83, 6, 2163);
    			attr_dev(div34, "class", "key nope svelte-4wi716");
    			add_location(div34, file$8, 84, 6, 2199);
    			attr_dev(div35, "class", "key nope svelte-4wi716");
    			add_location(div35, file$8, 85, 6, 2235);
    			attr_dev(div36, "class", "key nope svelte-4wi716");
    			add_location(div36, file$8, 86, 6, 2271);
    			attr_dev(div37, "class", "key nope svelte-4wi716");
    			add_location(div37, file$8, 87, 6, 2307);
    			attr_dev(div38, "class", "key nope svelte-4wi716");
    			add_location(div38, file$8, 88, 6, 2343);
    			attr_dev(div39, "class", "key nope svelte-4wi716");
    			add_location(div39, file$8, 89, 6, 2379);
    			attr_dev(div40, "class", "key nope show svelte-4wi716");
    			add_location(div40, file$8, 90, 6, 2415);
    			attr_dev(div41, "class", "key nope show svelte-4wi716");
    			add_location(div41, file$8, 91, 6, 2456);
    			attr_dev(div42, "class", "key nope pink svelte-4wi716");
    			set_style(div42, "width", "80px");
    			add_location(div42, file$8, 92, 6, 2497);
    			attr_dev(div43, "class", "row svelte-4wi716");
    			add_location(div43, file$8, 79, 4, 2004);
    			attr_dev(div44, "class", "key nope pink svelte-4wi716");
    			set_style(div44, "width", "110px");
    			add_location(div44, file$8, 95, 6, 2590);
    			attr_dev(div45, "class", "key nope svelte-4wi716");
    			add_location(div45, file$8, 96, 6, 2651);
    			attr_dev(div46, "class", "key nope svelte-4wi716");
    			add_location(div46, file$8, 97, 6, 2687);
    			attr_dev(div47, "class", "key nope svelte-4wi716");
    			add_location(div47, file$8, 98, 6, 2723);
    			attr_dev(div48, "class", "key nope svelte-4wi716");
    			add_location(div48, file$8, 99, 6, 2759);
    			attr_dev(div49, "class", "key nope svelte-4wi716");
    			add_location(div49, file$8, 100, 6, 2795);
    			attr_dev(div50, "class", "key nope svelte-4wi716");
    			add_location(div50, file$8, 101, 6, 2831);
    			attr_dev(div51, "class", "key nope svelte-4wi716");
    			add_location(div51, file$8, 102, 6, 2867);
    			attr_dev(div52, "class", "key nope show svelte-4wi716");
    			add_location(div52, file$8, 103, 6, 2903);
    			attr_dev(div53, "class", "key nope show svelte-4wi716");
    			add_location(div53, file$8, 104, 6, 2944);
    			attr_dev(div54, "class", "key nope show svelte-4wi716");
    			add_location(div54, file$8, 105, 6, 2985);
    			attr_dev(div55, "class", "key nope pink svelte-4wi716");
    			set_style(div55, "width", "110px");
    			add_location(div55, file$8, 106, 6, 3026);
    			attr_dev(div56, "class", "row svelte-4wi716");
    			add_location(div56, file$8, 94, 4, 2566);
    			attr_dev(div57, "class", "key nope pink svelte-4wi716");
    			set_style(div57, "width", "70px");
    			add_location(div57, file$8, 109, 6, 3120);
    			attr_dev(div58, "class", "key nope pink svelte-4wi716");
    			set_style(div58, "width", "70px");
    			add_location(div58, file$8, 110, 6, 3180);
    			attr_dev(div59, "class", "key nope pink svelte-4wi716");
    			set_style(div59, "width", "70px");
    			add_location(div59, file$8, 111, 6, 3240);
    			attr_dev(div60, "class", "key nope  svelte-4wi716");
    			set_style(div60, "width", "340px");
    			add_location(div60, file$8, 112, 6, 3300);
    			attr_dev(div61, "class", "key nope pink svelte-4wi716");
    			set_style(div61, "width", "70px");
    			add_location(div61, file$8, 113, 6, 3352);
    			attr_dev(div62, "class", "key nope pink svelte-4wi716");
    			set_style(div62, "width", "70px");
    			add_location(div62, file$8, 114, 6, 3412);
    			attr_dev(div63, "class", "key nope pink svelte-4wi716");
    			set_style(div63, "width", "70px");
    			add_location(div63, file$8, 115, 6, 3472);
    			attr_dev(div64, "class", "row svelte-4wi716");
    			add_location(div64, file$8, 108, 4, 3096);
    			attr_dev(div65, "class", "container svelte-4wi716");
    			add_location(div65, file$8, 46, 2, 793);
    			attr_dev(div66, "class", "box");
    			add_location(div66, file$8, 45, 0, 773);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props) {
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
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Punctuation_2",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/01.keyboards/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$a(ctx) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let steps = [Desks, Typewriter_1, Typewriter_2, Punctuation_1, Punctuation_2];
    	let i = 0;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		}

    		if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_01_keyboards> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_01_keyboards", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		Desks,
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
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev];
    }

    class _01_keyboards extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { done: 3, prev: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_01_keyboards",
    			options,
    			id: create_fragment$a.name
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
    }

    /* src/02.word-wrap/Spreadsheet.svelte generated by Svelte v3.24.1 */

    const file$9 = "src/02.word-wrap/Spreadsheet.svelte";

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
    			add_location(div, file$9, 60, 6, 1276);
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
    			add_location(div, file$9, 69, 10, 1563);
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
    function create_if_block(ctx) {
    	let div;
    	let t_value = /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "cell svelte-10qh3b4");
    			add_location(div, file$9, 67, 10, 1496);
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
    		id: create_if_block.name,
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
    		if (/*content*/ ctx[0][/*i*/ ctx[6]] && /*content*/ ctx[0][/*i*/ ctx[6]][/*i2*/ ctx[9]]) return create_if_block;
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
    			add_location(div, file$9, 64, 6, 1375);
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

    function create_fragment$b(ctx) {
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
    			add_location(div0, file$9, 58, 4, 1207);
    			attr_dev(div1, "class", "container svelte-10qh3b4");
    			add_location(div1, file$9, 56, 2, 1158);
    			attr_dev(div2, "class", "box");
    			add_location(div2, file$9, 55, 0, 1138);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spreadsheet",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Components/TextArea.svelte generated by Svelte v3.24.1 */
    const file$a = "src/Components/TextArea.svelte";

    function create_fragment$c(ctx) {
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
    			add_location(textarea, file$a, 41, 0, 923);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { value: 0, width: 1, height: 2, size: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextArea",
    			options,
    			id: create_fragment$c.name
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

    /* src/02.word-wrap/Wrap.1.svelte generated by Svelte v3.24.1 */
    const file$b = "src/02.word-wrap/Wrap.1.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let textarea;
    	let current;

    	textarea = new TextArea({
    			props: { value: "in West Philadelphia " },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(textarea.$$.fragment);
    			attr_dev(div, "class", "box middle svelte-u6rtuq");
    			add_location(div, file$b, 11, 0, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(textarea, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(textarea);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Wrap_1> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wrap_1", $$slots, []);
    	$$self.$capture_state = () => ({ TextArea });
    	return [];
    }

    class Wrap_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrap_1",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/02.word-wrap/index.svelte generated by Svelte v3.24.1 */

    function create_fragment$e(ctx) {
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { done = () => {
    		
    	} } = $$props;

    	let { prev = () => {
    		
    	} } = $$props;

    	let steps = [Spreadsheet, Wrap_1];
    	let i = 0;

    	function spaceBar(e) {
    		$$invalidate(0, i = keypress(e, i));

    		if (i < 0) {
    			prev();
    		}

    		if (!steps[i]) {
    			done();
    		}
    	}

    	const writable_props = ["done", "prev"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<_02_word_wrap> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("_02_word_wrap", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    	};

    	$$self.$capture_state = () => ({
    		keyPress: keypress,
    		done,
    		prev,
    		Spreadsheet,
    		Wrap1: Wrap_1,
    		steps,
    		i,
    		spaceBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("done" in $$props) $$invalidate(3, done = $$props.done);
    		if ("prev" in $$props) $$invalidate(4, prev = $$props.prev);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, spaceBar, done, prev];
    }

    class _02_word_wrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { done: 3, prev: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "_02_word_wrap",
    			options,
    			id: create_fragment$e.name
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
    }

    /* src/App.svelte generated by Svelte v3.24.1 */

    const { console: console_1 } = globals;

    function create_fragment$f(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*steps*/ ctx[1][/*i*/ ctx[0]];

    	function switch_props(ctx) {
    		return {
    			props: {
    				done: /*done*/ ctx[3],
    				prev: /*prev*/ ctx[2]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
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
    					switch_instance = new switch_value(switch_props(ctx));
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
    	setContext("size", { width: 1280, height: 720 });
    	let i = 0;
    	let steps = [_00_intro, _01_keyboards, _02_word_wrap];

    	function prev() {
    		if (i > 0) {
    			$$invalidate(0, i -= 1);
    		}

    		console.log("prev", i);
    	}

    	function done() {
    		if (steps[i + 1]) {
    			$$invalidate(0, i += 1);
    		} else {
    			console.log("done");
    		}
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
    		i,
    		steps,
    		prev,
    		done
    	});

    	$$self.$inject_state = $$props => {
    		if ("i" in $$props) $$invalidate(0, i = $$props.i);
    		if ("steps" in $$props) $$invalidate(1, steps = $$props.steps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [i, steps, prev, done];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$f.name
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
