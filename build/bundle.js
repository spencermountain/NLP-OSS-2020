
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    /* src/demos/Sentences.svelte generated by Svelte v3.24.1 */

    const file = "src/demos/Sentences.svelte";

    function create_fragment(ctx) {
    	let div10;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let div4_draggable_value;
    	let t8;
    	let div5;
    	let div5_draggable_value;
    	let t9;
    	let div6;
    	let t11;
    	let div7;
    	let t13;
    	let div8;
    	let t15;
    	let div9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div0 = element("div");
    			div0.textContent = "He was a skater boy.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "She said, \"See you later, boy\".";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "He wasn't good enough for her.";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "-";
    			t7 = space();
    			div4 = element("div");
    			t8 = space();
    			div5 = element("div");
    			t9 = space();
    			div6 = element("div");
    			div6.textContent = "-";
    			t11 = space();
    			div7 = element("div");
    			div7.textContent = "Five years from now";
    			t13 = space();
    			div8 = element("div");
    			div8.textContent = "She sits at home";
    			t15 = space();
    			div9 = element("div");
    			div9.textContent = "Feeding the baby, she's all alone.";
    			attr_dev(div0, "class", "list-item svelte-jfrxoa");
    			add_location(div0, file, 81, 2, 2357);
    			attr_dev(div1, "class", "list-item svelte-jfrxoa");
    			add_location(div1, file, 82, 2, 2409);
    			attr_dev(div2, "class", "list-item svelte-jfrxoa");
    			add_location(div2, file, 83, 2, 2472);
    			attr_dev(div3, "class", "list-item svelte-jfrxoa");
    			add_location(div3, file, 84, 2, 2534);
    			attr_dev(div4, "class", "list-item svelte-jfrxoa");
    			attr_dev(div4, "draggable", div4_draggable_value = true);
    			attr_dev(div4, "ondragover", "return false");
    			toggle_class(div4, "is-active", /*hovering*/ ctx[2] === 0);
    			add_location(div4, file, 85, 2, 2567);
    			attr_dev(div5, "class", "list-item svelte-jfrxoa");
    			attr_dev(div5, "draggable", div5_draggable_value = true);
    			attr_dev(div5, "ondragover", "return false");
    			toggle_class(div5, "is-active", /*hovering*/ ctx[2] === 1);
    			add_location(div5, file, 95, 2, 2853);
    			attr_dev(div6, "class", "list-item svelte-jfrxoa");
    			add_location(div6, file, 105, 2, 3140);
    			attr_dev(div7, "class", "list-item svelte-jfrxoa");
    			add_location(div7, file, 106, 2, 3173);
    			attr_dev(div8, "class", "list-item svelte-jfrxoa");
    			add_location(div8, file, 107, 2, 3224);
    			attr_dev(div9, "class", "list-item svelte-jfrxoa");
    			add_location(div9, file, 108, 2, 3272);
    			attr_dev(div10, "class", "container svelte-jfrxoa");
    			add_location(div10, file, 80, 0, 2331);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div0);
    			append_dev(div10, t1);
    			append_dev(div10, div1);
    			append_dev(div10, t3);
    			append_dev(div10, div2);
    			append_dev(div10, t5);
    			append_dev(div10, div3);
    			append_dev(div10, t7);
    			append_dev(div10, div4);
    			div4.innerHTML = /*first*/ ctx[0];
    			append_dev(div10, t8);
    			append_dev(div10, div5);
    			div5.innerHTML = /*second*/ ctx[1];
    			append_dev(div10, t9);
    			append_dev(div10, div6);
    			append_dev(div10, t11);
    			append_dev(div10, div7);
    			append_dev(div10, t13);
    			append_dev(div10, div8);
    			append_dev(div10, t15);
    			append_dev(div10, div9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div4, "dragstart", /*dragstart_handler*/ ctx[5], false, false, false),
    					listen_dev(div4, "drop", prevent_default(/*drop_handler*/ ctx[6]), false, true, false),
    					listen_dev(div4, "dragenter", /*dragenter_handler*/ ctx[7], false, false, false),
    					listen_dev(div5, "dragstart", /*dragstart_handler_1*/ ctx[8], false, false, false),
    					listen_dev(div5, "drop", prevent_default(/*drop_handler_1*/ ctx[9]), false, true, false),
    					listen_dev(div5, "dragenter", /*dragenter_handler_1*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*first*/ 1) div4.innerHTML = /*first*/ ctx[0];
    			if (dirty & /*hovering*/ 4) {
    				toggle_class(div4, "is-active", /*hovering*/ ctx[2] === 0);
    			}

    			if (dirty & /*second*/ 2) div5.innerHTML = /*second*/ ctx[1];
    			if (dirty & /*hovering*/ 4) {
    				toggle_class(div5, "is-active", /*hovering*/ ctx[2] === 1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
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
    	let style = `background-color: #f2c0bb; color: white; transition: 1.2s; padding: 3px; border-radius: 4px;`;
    	let first = "All of her friends stuck up their nose.";
    	let second = "They had a problem with his baggy clothes.";
    	let hovering = false;

    	const drop = (event, target) => {
    		event.dataTransfer.dropEffect = "move";
    		const start = parseInt(event.dataTransfer.getData("text/plain"));

    		// const newTracklist = list
    		// if (start <span target) {
    		//   newTracklist.splice(target + 1, 0, newTracklist[start])
    		//   newTracklist.splice(start, 1)
    		// } else {
    		//   newTracklist.splice(target, 0, newTracklist[start])
    		//   newTracklist.splice(start + 1, 1)
    		// }
    		// list = newTracklist
    		$$invalidate(0, first = `<span id="first" style="${style}">All of her friends</span> had a problem with his baggy clothes.`);

    		$$invalidate(1, second = `<span id="second" style="${style}">They</span> stuck up their nose.`);
    		$$invalidate(2, hovering = null);

    		setTimeout(
    			() => {
    				let el = document.getElementById("first"); // first = `<span style="transition: background-color 0.5s ease; background-color: none; color:black;">All of her friends</span> had a problem with his baggy clothes.`
    				// second = `<span style="">They</span> stuck up their nose.`

    				el.style["background-color"] = "white";
    				el.style["color"] = "#4d4d4d";
    				el = document.getElementById("second");
    				el.style["background-color"] = "white";
    				el.style["color"] = "#4d4d4d";
    			},
    			1000
    		); // first = `<span style="transition: background-color 0.5s ease; background-color: none; color:black;">All of her friends</span> had a problem with his baggy clothes.`
    		// second = `<span style="">They</span> stuck up their nose.`
    	};

    	const dragstart = (event, i) => {
    		event.dataTransfer.effectAllowed = "move";
    		event.dataTransfer.dropEffect = "move";
    		const start = i;
    		event.dataTransfer.setData("text/plain", start);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sentences> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Sentences", $$slots, []);
    	const dragstart_handler = event => dragstart(event, 0);
    	const drop_handler = event => drop(event);
    	const dragenter_handler = () => $$invalidate(2, hovering = 0);
    	const dragstart_handler_1 = event => dragstart(event, 1);
    	const drop_handler_1 = event => drop(event);
    	const dragenter_handler_1 = () => $$invalidate(2, hovering = 1);

    	$$self.$capture_state = () => ({
    		style,
    		first,
    		second,
    		hovering,
    		drop,
    		dragstart
    	});

    	$$self.$inject_state = $$props => {
    		if ("style" in $$props) style = $$props.style;
    		if ("first" in $$props) $$invalidate(0, first = $$props.first);
    		if ("second" in $$props) $$invalidate(1, second = $$props.second);
    		if ("hovering" in $$props) $$invalidate(2, hovering = $$props.hovering);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		first,
    		second,
    		hovering,
    		drop,
    		dragstart,
    		dragstart_handler,
    		drop_handler,
    		dragenter_handler,
    		dragstart_handler_1,
    		drop_handler_1,
    		dragenter_handler_1
    	];
    }

    class Sentences extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sentences",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import App from './00.intro/FigureSkating.svelte'

    var app = new Sentences({
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
