
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

    /* src/02.markup/LoopNLP.svelte generated by Svelte v3.24.1 */

    const file = "src/02.markup/LoopNLP.svelte";

    function create_fragment(ctx) {
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
    			add_location(div0, file, 43, 4, 786);
    			attr_dev(div1, "class", "f2 blue");
    			add_location(div1, file, 44, 4, 827);
    			attr_dev(div2, "class", "label red svelte-1v5aa7h");
    			set_style(div2, "top", "40%");
    			set_style(div2, "left", "24%");
    			add_location(div2, file, 42, 2, 731);
    			set_style(div3, "opacity", "0");
    			add_location(div3, file, 47, 4, 924);
    			attr_dev(div4, "class", "f2");
    			add_location(div4, file, 48, 4, 965);
    			attr_dev(div5, "class", "label red svelte-1v5aa7h");
    			set_style(div5, "top", "40%");
    			set_style(div5, "left", "57%");
    			add_location(div5, file, 46, 2, 869);
    			attr_dev(span0, "class", "sub i  svelte-1v5aa7h");
    			set_style(span0, "font-size", "1.2rem");
    			add_location(span0, file, 51, 4, 1058);
    			attr_dev(div6, "class", "f2");
    			add_location(div6, file, 52, 4, 1131);
    			attr_dev(span1, "class", "sub i  svelte-1v5aa7h");
    			set_style(span1, "font-size", "1.2rem");
    			add_location(span1, file, 53, 4, 1161);
    			attr_dev(div7, "class", "label green svelte-1v5aa7h");
    			set_style(div7, "top", "58%");
    			set_style(div7, "left", "7%");
    			add_location(div7, file, 50, 2, 1002);
    			attr_dev(path0, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path0, "fill", "#D68881");
    			attr_dev(path0, "transform", "rotate(23)");
    			attr_dev(path0, "class", "svelte-1lnhtnf");
    			add_location(path0, file, 73, 10, 1669);
    			attr_dev(marker0, "id", "triangle");
    			attr_dev(marker0, "viewBox", "0 0 10 10");
    			attr_dev(marker0, "refX", "4");
    			attr_dev(marker0, "refY", "6");
    			attr_dev(marker0, "markerUnits", "strokeWidth");
    			attr_dev(marker0, "markerWidth", "9");
    			attr_dev(marker0, "markerHeight", "9");
    			attr_dev(marker0, "orient", "auto");
    			add_location(marker0, file, 64, 8, 1445);
    			attr_dev(path1, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path1, "fill", "#6699cc");
    			attr_dev(path1, "transform", "rotate(23)");
    			attr_dev(path1, "class", "svelte-1lnhtnf");
    			add_location(path1, file, 88, 10, 2064);
    			attr_dev(marker1, "id", "triangle2");
    			attr_dev(marker1, "viewBox", "0 0 10 10");
    			attr_dev(marker1, "refX", "4");
    			attr_dev(marker1, "refY", "6");
    			attr_dev(marker1, "markerUnits", "strokeWidth");
    			attr_dev(marker1, "markerWidth", "9");
    			attr_dev(marker1, "markerHeight", "9");
    			attr_dev(marker1, "orient", "auto");
    			add_location(marker1, file, 79, 8, 1839);
    			attr_dev(path2, "d", "M 0 0 L 10 4 L 0 10 z");
    			attr_dev(path2, "fill", "#6accb2");
    			attr_dev(path2, "transform", "rotate(23)");
    			attr_dev(path2, "class", "svelte-1lnhtnf");
    			add_location(path2, file, 103, 10, 2459);
    			attr_dev(marker2, "id", "triangle3");
    			attr_dev(marker2, "viewBox", "0 0 10 10");
    			attr_dev(marker2, "refX", "4");
    			attr_dev(marker2, "refY", "6");
    			attr_dev(marker2, "markerUnits", "strokeWidth");
    			attr_dev(marker2, "markerWidth", "9");
    			attr_dev(marker2, "markerHeight", "9");
    			attr_dev(marker2, "orient", "auto");
    			add_location(marker2, file, 94, 8, 2234);
    			add_location(defs, file, 63, 6, 1430);
    			attr_dev(path3, "class", "link svelte-1lnhtnf");
    			attr_dev(path3, "d", "M30.8144647592461,-14.369020899183779A34,34,0,0,0,-32.84147809382832,-8.7998475334857L-30.909626441250186,-8.282209443280658A32,32,0,0,1,29.0018491851728,-13.52378437570238Z");
    			attr_dev(path3, "stroke", "none");
    			attr_dev(path3, "fill", "#6699cc");
    			attr_dev(path3, "stroke-width", "1");
    			attr_dev(path3, "marker-end", "url(#triangle2)");
    			add_location(path3, file, 110, 6, 2641);
    			attr_dev(path4, "class", "link svelte-1lnhtnf");
    			attr_dev(path4, "d", "M-32.84147809382832,8.7998475334857A34,34,0,0,0,32.84147809382832,8.799847533485696L30.909626441250186,8.282209443280655A32,32,0,0,1,-30.909626441250186,8.282209443280658Z");
    			attr_dev(path4, "stroke", "none");
    			attr_dev(path4, "fill", "#D68881");
    			attr_dev(path4, "stroke-width", "1");
    			attr_dev(path4, "marker-end", "url(#triangle)");
    			add_location(path4, file, 117, 6, 2985);
    			attr_dev(path5, "class", "link svelte-1lnhtnf");
    			attr_dev(path5, "d", "M2.9632952534203763,33.87061973511935A34,34,0,0,0,33.87061973511935,2.9632952534203745L31.878230338935857,2.788983767925058A32,32,0,0,1,2.78898376792506,31.878230338935857Z");
    			attr_dev(path5, "stroke", "none");
    			attr_dev(path5, "fill", "#6accb2");
    			attr_dev(path5, "stroke-width", "1");
    			attr_dev(path5, "marker-end", "url(#triangle3)");
    			add_location(path5, file, 141, 8, 4109);
    			set_style(g, "scale", "-1 1");
    			set_style(g, "transform", "translate(-70px, 5px)");
    			add_location(g, file, 140, 6, 4042);
    			attr_dev(svg, "viewBox", "-50,-50,100,100");
    			attr_dev(svg, "shape-rendering", "geometricPrecision");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "height", "100%");
    			add_location(svg, file, 58, 4, 1304);
    			attr_dev(div8, "class", "col svelte-1v5aa7h");
    			set_style(div8, "transform", "scaleX(-1)");
    			set_style(div8, "height", "600px");
    			add_location(div8, file, 56, 2, 1237);
    			attr_dev(div9, "class", "box");
    			set_style(div9, "position", "relative");
    			set_style(div9, "width", "100%");
    			add_location(div9, file, 40, 0, 671);
    			add_location(li0, file, 155, 2, 4520);
    			add_location(li1, file, 156, 2, 4546);
    			add_location(li2, file, 157, 2, 4571);
    			attr_dev(div10, "class", "notes");
    			add_location(div10, file, 154, 0, 4498);
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoopNLP> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoopNLP", $$slots, []);
    	return [];
    }

    class LoopNLP extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopNLP",
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

    var app = new LoopNLP({
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
