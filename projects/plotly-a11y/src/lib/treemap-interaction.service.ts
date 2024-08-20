import {
    Injectable,
    Renderer2,
    RendererFactory2,
} from '@angular/core';
import { KEY } from './constant-util';

@Injectable({
    providedIn: 'root',
})
export class TreemapInteractionService {
    private _renderer: Renderer2;
    private _unlistenKeydown!: () => void;
    private _unlistenFocusin!: () => void;
    private _unlistenHover!: () => void;
    private _currentHoveredElement: HTMLElement | null = null;

    constructor(private _rendererFactory: RendererFactory2) {
        this._renderer = this._rendererFactory.createRenderer(null, null);
    }

    addKeyboardInteractions(treemapSelector: string) {
        /* Make sure to clean up the listeners when you are adding listeners again */
        this.cleanUpListeners();
        const treemap = document.querySelector(treemapSelector);
        const items = treemap?.querySelectorAll('.slice');
        items?.forEach((item) => {
            this._renderer.setAttribute(item, 'role', 'button');
            this._renderer.setAttribute(item, 'tabindex', '0');
        });

        this._addGlobalEventListeners(treemapSelector);
        this._addDummyFocusElement(treemapSelector);
    }

    /**
     * Trigger click event on the slice
     *
     * @param slice
     */
    triggerClick(slice: SVGAElement) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
        });
        slice.querySelector('path.surface')?.dispatchEvent(clickEvent);
    }

    /**
     *
     * Clean up listeners
     */
    public cleanUpListeners() {
        this._unlistenKeydown?.();
        this._unlistenFocusin?.();
        this._unlistenHover?.();
    }

    /**
     * Add global keydown listener to hide tooltip on escape key press
     *
     * @param treemapSelector
     */
    private _addGlobalEventListeners(treemapSelector: string) {
        this._unlistenFocusin = this._renderer.listen('document', 'focusin', this._handleFocusIn.bind(this));
        this._unlistenKeydown = this._renderer.listen('document', 'keydown', (event: KeyboardEvent) => this._handleKeydown(event, treemapSelector));
        this._unlistenHover = this._renderer.listen('document', 'mouseover', (event: MouseEvent) => {
            this._currentHoveredElement = event.target as HTMLElement;
        });
    }

    private _handleFocusIn() {
        const currentElement = document.activeElement as SVGAElement;
        if (currentElement && this._isSliceElement(currentElement)) {
            this._triggerMouseHover(currentElement);
        }
    }

    private _handleKeydown(event: KeyboardEvent, treemapSelector: string) {
        const currentElement = document.activeElement as SVGAElement;
        const toolTipSvg = document.querySelector(`${treemapSelector} .hoverlayer .hovertext`);

        if (event.key === KEY.Escape) {
            this._handleEscapeKey(toolTipSvg, currentElement, treemapSelector);
        } else if (this._isSliceElement(currentElement)) {
            if (event.key === KEY.Enter || event.key === ' ') {
                this.triggerClick(currentElement);
            } else {
                this._triggerMouseOut(currentElement);
            }
        }
    }

    private _handleEscapeKey(toolTipSvg: Element | null, currentElement: SVGAElement, treemapSelector: string) {
        const isSliceElement = this._isSliceElement(currentElement);
        if (toolTipSvg) {
            if (isSliceElement) {
                this._triggerMouseOut(currentElement);
            } else if (this._isSurfaceElement(this._currentHoveredElement as any)) { // Should hide tooltip only if the mouse is on the surface element
                this._hideTooltip(treemapSelector);
            }
        } else if (isSliceElement) {
            this._setFocusOutsideHeatmap();
        }
    }

    /**
     * Hide tooltip
     *
     * @param treemapSelector
     */
    private _hideTooltip(treemapSelector: string) {
        const tooltipContainerSvg = document.querySelector(`${treemapSelector} .hoverlayer`);
        const toolTipSvg = document.querySelector(`${treemapSelector} .hoverlayer .hovertext`);
        if (tooltipContainerSvg && toolTipSvg) {
            this._renderer.removeChild(tooltipContainerSvg, toolTipSvg);
        }
    }

    private _isSliceElement(element: HTMLElement | SVGAElement): boolean {
        return (
            element.tagName.toLowerCase() === 'g' &&
            element.classList.contains('slice') &&
            element.classList.contains('cursor-pointer') &&
            element.getAttribute('role') === 'button'
        );
    }

    private _isSurfaceElement(element: HTMLElement | SVGAElement): boolean {
        return (
            element.tagName.toLowerCase() === 'path' &&
            element.classList.contains('surface')
        );
    }

    /**
     * Fire mouseover event on the element
     *
     * @param element
     */
    private _triggerMouseHover(element: HTMLElement | SVGAElement) {
        const event = new MouseEvent('mouseover', {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        element.dispatchEvent(event);
    }

    /**
     * Fire mouseout event on the element
     *
     * @param element
     */
    private _triggerMouseOut(element: HTMLElement | SVGAElement) {
        const event = new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: true,
            view: window,
        });

        element.dispatchEvent(event);
    }

    private _setFocusOutsideHeatmap() {
        /* Focus the dummy anchor element to remove focus from the treemap */
        const dummyAnchor = document.querySelector('#dummy-anchor') as HTMLAnchorElement;
        dummyAnchor?.focus();
    }
    /**
     * Add a dummy anchor element to remove focus from the treemap
     *
     * @param treemapSelector
     */
    private _addDummyFocusElement(treemapSelector: string) {
        if (document.querySelector('#dummy-anchor')) {
            return;
        }
        const parent = document.querySelector(`${treemapSelector}`);
        const dummyAnchor = this._renderer.createElement('a');
        // Set attributes for the new anchor element
        this._renderer.setAttribute(dummyAnchor, 'width', '0');
        this._renderer.setAttribute(dummyAnchor, 'height', '0');
        this._renderer.setAttribute(dummyAnchor, 'tabindex', '-1');
        this._renderer.setAttribute(dummyAnchor, 'id', 'dummy-anchor');
        this._renderer.appendChild(parent, dummyAnchor);
    }
}
