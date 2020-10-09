
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
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

    /* src/02.markup/LoopPink.svelte generated by Svelte v3.24.1 */

    const file = "src/02.markup/LoopPink.svelte";

    function create_fragment(ctx) {
    	let div15;
    	let div5;
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
    	let div7;
    	let div6;
    	let t11;
    	let div9;
    	let br;
    	let t12;
    	let div8;
    	let t14;
    	let div11;
    	let span0;
    	let t16;
    	let div10;
    	let t18;
    	let div13;
    	let span1;
    	let t20;
    	let div12;
    	let t22;
    	let div14;
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
    	let t23;
    	let div16;
    	let li;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = "• ubiquity";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "• spotlight";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "• sublime";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "• medium";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "• linear.app";
    			t9 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "text-based interfaces";
    			t11 = space();
    			div9 = element("div");
    			br = element("br");
    			t12 = space();
    			div8 = element("div");
    			div8.textContent = "GUI";
    			t14 = space();
    			div11 = element("div");
    			span0 = element("span");
    			span0.textContent = "add commands";
    			t16 = space();
    			div10 = element("div");
    			div10.textContent = "create a markup";
    			t18 = space();
    			div13 = element("div");
    			span1 = element("span");
    			span1.textContent = "\"wysiwyg\"";
    			t20 = space();
    			div12 = element("div");
    			div12.textContent = "build a UI";
    			t22 = space();
    			div14 = element("div");
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
    			t23 = space();
    			div16 = element("div");
    			li = element("li");
    			li.textContent = "sweet spot";
    			add_location(div0, file, 43, 4, 756);
    			add_location(div1, file, 44, 4, 782);
    			add_location(div2, file, 45, 4, 809);
    			add_location(div3, file, 46, 4, 834);
    			add_location(div4, file, 47, 4, 858);
    			attr_dev(div5, "class", "onleft svelte-1cf7mr9");
    			add_location(div5, file, 42, 2, 731);
    			attr_dev(div6, "class", "");
    			set_style(div6, "line-height", "3rem");
    			add_location(div6, file, 51, 4, 1001);
    			attr_dev(div7, "class", "label pink svelte-1cf7mr9");
    			set_style(div7, "top", "40%");
    			set_style(div7, "left", "34%");
    			add_location(div7, file, 49, 2, 893);
    			add_location(br, file, 59, 4, 1351);
    			attr_dev(div8, "class", "f2");
    			add_location(div8, file, 60, 4, 1362);
    			attr_dev(div9, "class", "label red svelte-1cf7mr9");
    			set_style(div9, "top", "40%");
    			set_style(div9, "left", "57%");
    			add_location(div9, file, 57, 2, 1237);
    			attr_dev(span0, "class", "sub i  svelte-1cf7mr9");
    			set_style(span0, "font-size", "1.2rem");
    			add_location(span0, file, 63, 4, 1446);
    			add_location(div10, file, 64, 4, 1517);
    			attr_dev(div11, "class", "label blue svelte-1cf7mr9");
    			set_style(div11, "top", "50px");
    			add_location(div11, file, 62, 2, 1399);
    			attr_dev(span1, "class", "sub i  svelte-1cf7mr9");
    			set_style(span1, "font-size", "1.2rem");
    			add_location(span1, file, 67, 4, 1604);
    			add_location(div12, file, 68, 4, 1672);
    			attr_dev(div13, "class", "label red svelte-1cf7mr9");
    			set_style(div13, "bottom", "50px");
    			add_location(div13, file, 66, 2, 1555);
    			attr_dev(path0, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path0, "fill", "#D68881");
    			attr_dev(path0, "transform", "rotate(23)");
    			attr_dev(path0, "class", "svelte-1lnhtnf");
    			add_location(path0, file, 87, 10, 2137);
    			attr_dev(marker0, "id", "triangle");
    			attr_dev(marker0, "viewBox", "0 0 10 10");
    			attr_dev(marker0, "refX", "4");
    			attr_dev(marker0, "refY", "6");
    			attr_dev(marker0, "markerUnits", "strokeWidth");
    			attr_dev(marker0, "markerWidth", "9");
    			attr_dev(marker0, "markerHeight", "9");
    			attr_dev(marker0, "orient", "auto");
    			add_location(marker0, file, 78, 8, 1913);
    			attr_dev(path1, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path1, "fill", "#6699cc");
    			attr_dev(path1, "transform", "rotate(23)");
    			attr_dev(path1, "class", "svelte-1lnhtnf");
    			add_location(path1, file, 102, 10, 2532);
    			attr_dev(marker1, "id", "triangle2");
    			attr_dev(marker1, "viewBox", "0 0 10 10");
    			attr_dev(marker1, "refX", "4");
    			attr_dev(marker1, "refY", "6");
    			attr_dev(marker1, "markerUnits", "strokeWidth");
    			attr_dev(marker1, "markerWidth", "9");
    			attr_dev(marker1, "markerHeight", "9");
    			attr_dev(marker1, "orient", "auto");
    			add_location(marker1, file, 93, 8, 2307);
    			add_location(defs, file, 77, 6, 1898);
    			attr_dev(path2, "class", "link svelte-1lnhtnf");
    			attr_dev(path2, "d", "M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z");
    			attr_dev(path2, "stroke", "none");
    			attr_dev(path2, "fill", "#6699cc");
    			attr_dev(path2, "stroke-width", "1");
    			attr_dev(path2, "marker-end", "url(#triangle2)");
    			add_location(path2, file, 109, 6, 2714);
    			attr_dev(path3, "class", "link svelte-1lnhtnf");
    			attr_dev(path3, "d", "M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "fill", "#D68881");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "marker-end", "url(#triangle)");
    			add_location(path3, file, 116, 6, 3058);
    			attr_dev(path4, "class", "link svelte-1lnhtnf");
    			attr_dev(path4, "d", "M8.799847533485712,-32.84147809382832A34,34,0,0,1,32.84147809382832,-8.79984753348571L30.909626441250182,-8.282209443280669A32,32,0,0,0,8.28220944328067,-30.909626441250182Z");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "fill", "#F2C0BB");
    			attr_dev(path4, "stroke-width", "1");
    			add_location(path4, file, 126, 8, 3461);
    			attr_dev(path5, "class", "link svelte-1lnhtnf");
    			attr_dev(path5, "d", "M32.84147809382832,8.799847533485696A34,34,0,0,1,8.799847533485698,32.84147809382832L8.282209443280657,30.909626441250186A32,32,0,0,0,30.909626441250186,8.282209443280655Z");
    			attr_dev(path5, "stroke", "none");
    			attr_dev(path5, "fill", "#F2C0BB");
    			attr_dev(path5, "stroke-width", "1");
    			add_location(path5, file, 132, 8, 3780);
    			attr_dev(g, "transform", "scale(0.8)");
    			add_location(g, file, 125, 6, 3426);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file, 72, 4, 1772);
    			attr_dev(div14, "class", "col svelte-1cf7mr9");
    			set_style(div14, "transform", "scaleX(-1)");
    			set_style(div14, "height", "600px");
    			add_location(div14, file, 70, 2, 1705);
    			attr_dev(div15, "class", "box");
    			set_style(div15, "position", "relative");
    			set_style(div15, "width", "100%");
    			add_location(div15, file, 40, 0, 671);
    			add_location(li, file, 146, 2, 4152);
    			attr_dev(div16, "class", "notes");
    			add_location(div16, file, 145, 0, 4130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div15, anchor);
    			append_dev(div15, div5);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div15, t9);
    			append_dev(div15, div7);
    			append_dev(div7, div6);
    			append_dev(div15, t11);
    			append_dev(div15, div9);
    			append_dev(div9, br);
    			append_dev(div9, t12);
    			append_dev(div9, div8);
    			append_dev(div15, t14);
    			append_dev(div15, div11);
    			append_dev(div11, span0);
    			append_dev(div11, t16);
    			append_dev(div11, div10);
    			append_dev(div15, t18);
    			append_dev(div15, div13);
    			append_dev(div13, span1);
    			append_dev(div13, t20);
    			append_dev(div13, div12);
    			append_dev(div15, t22);
    			append_dev(div15, div14);
    			append_dev(div14, svg);
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
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div16, anchor);
    			append_dev(div16, li);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div16);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoopPink> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoopPink", $$slots, []);
    	return [];
    }

    class LoopPink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopPink",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import App from './00.intro/Menu.svelte'
    // import App from './04.word-wrap/Wrap.svelte'
    // import App from './03.text-editor/Timeline.svelte'
    // import App from './05.focus/Quake.svelte'
    // import App from './demos/Demo.svelte'
    // import App from './demos/UI.svelte'

    var app = new LoopPink({
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
