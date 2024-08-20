import { TestBed } from '@angular/core/testing';
import {
    Renderer2,
    RendererFactory2,
} from '@angular/core';
import { TreemapInteractionService } from './treemap-interaction.service';
import { KEY } from './constant-util';


describe('TreemapInteractionService', () => {
    let service: TreemapInteractionService;
    let renderer: jasmine.SpyObj<Renderer2>;
    let rendererFactory: jasmine.SpyObj<RendererFactory2>;

    beforeEach(() => {
        renderer = jasmine.createSpyObj('Renderer2', ['setAttribute', 'createElement', 'appendChild', 'removeChild', 'listen']);
        rendererFactory = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
        rendererFactory.createRenderer.and.returnValue(renderer);

        TestBed.configureTestingModule({
            providers: [
                TreemapInteractionService,
                { provide: RendererFactory2, useValue: rendererFactory },
            ],
        });

        service = TestBed.inject(TreemapInteractionService);
    });

    it('should create the service', () => {
        expect(service).toBeTruthy();
    });

    describe('_addGlobalEventListeners', () => {
        let mockFocusinCallback: jasmine.Spy;
        let mockKeydownCallback: jasmine.Spy;
        let mockElement: SVGAElement;

        beforeEach(() => {
            mockElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGAElement;
            spyOn(document, 'querySelector').and.callFake((selector: string) => {
                if (selector.includes('.hoverlayer .hovertext')) {
                    return document.createElement('div');
                }
                return null;
            });
            spyOn(document, 'activeElement' as any).and.returnValue(mockElement);

            mockFocusinCallback = jasmine.createSpy('focusinCallback');
            mockKeydownCallback = jasmine.createSpy('keydownCallback');
            renderer.listen.and.callFake((target: string, event: string, callback: EventListenerOrEventListenerObject) => {
                if (event === 'focusin') {
                    mockFocusinCallback = jasmine.createSpy('focusinCallback').and.callFake(callback as EventListener);
                }
                if (event === 'keydown') {
                    mockKeydownCallback = jasmine.createSpy('keydownCallback').and.callFake(callback as EventListener);
                }
                return () => { };
            });

            service['_addGlobalEventListeners']('some-selector');
        });

        it('should register focusin and keydown event listeners', () => {
            expect(renderer.listen).toHaveBeenCalledWith('document', 'focusin', jasmine.any(Function));
            expect(renderer.listen).toHaveBeenCalledWith('document', 'keydown', jasmine.any(Function));
        });

        it('should call _triggerMouseHover on focusin for a slice element', () => {
            spyOn(service as any, '_isSliceElement').and.returnValue(true);
            spyOn(service as any, '_triggerMouseHover');

            mockFocusinCallback();

            expect(service['_isSliceElement']).toHaveBeenCalled();
            expect(service['_triggerMouseHover']).toHaveBeenCalled();
        });

        it('should not call _triggerMouseHover on focusin for a non-slice element', () => {
            spyOn(service as any, '_isSliceElement').and.returnValue(false);
            spyOn(service as any, '_triggerMouseHover');

            mockFocusinCallback();

            expect(service['_isSliceElement']).toHaveBeenCalled();
            expect(service['_triggerMouseHover']).not.toHaveBeenCalled();
        });

        it('should call _hideTooltip on escape key press if tooltip is present', () => {
            spyOn(service as any, '_hideTooltip');
            spyOn(service as any, '_isSliceElement').and.returnValue(false);
            spyOn(service as any, '_isSurfaceElement').and.returnValue(true);
            spyOn(service as any, '_triggerMouseOut');

            const mockEvent = { key: KEY.Escape } as KeyboardEvent;
            mockKeydownCallback(mockEvent);

            expect(service['_hideTooltip']).toHaveBeenCalledWith('some-selector');
        });

        it('should call _triggerMouseOut on escape key press if tooltip is present and slice element is active', () => {
            spyOn(service as any, '_isSliceElement').and.returnValue(true);
            spyOn(service as any, '_triggerMouseOut');
            spyOn(service as any, '_hideTooltip');

            const mockEvent = { key: KEY.Escape } as KeyboardEvent;
            mockKeydownCallback(mockEvent);

            expect(service['_triggerMouseOut']).toHaveBeenCalled();
        });
    });

    describe('triggerClick', () => {
        it('should dispatch a click event on the slice', () => {
            const mockSlice = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const mockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            mockPath.classList.add('surface');
            mockSlice.appendChild(mockPath);

            spyOn(mockPath, 'dispatchEvent');

            service.triggerClick(mockSlice as unknown as SVGAElement);

            expect(mockPath.dispatchEvent).toHaveBeenCalled();
        });
    });

    describe('cleanUpListeners', () => {
        it('should clean up the event listeners', () => {
            service['_unlistenKeydown'] = jasmine.createSpy();
            service['_unlistenFocusin'] = jasmine.createSpy();

            service.cleanUpListeners();

            expect(service['_unlistenKeydown']).toHaveBeenCalled();
            expect(service['_unlistenFocusin']).toHaveBeenCalled();
        });
    });

    describe('hideTooltip', () => {
        it('should remove the tooltip from the DOM', () => {
            const mockTooltip = document.createElement('div');
            const mockTooltipContainer = document.createElement('div');
            mockTooltipContainer.classList.add('hoverlayer');
            mockTooltipContainer.appendChild(mockTooltip);
            spyOn(document, 'querySelector').and.callFake((selector: string) => {
                if (selector.includes('.hoverlayer')) {
                    return mockTooltipContainer;
                }
                return null;
            });

            service['_hideTooltip']('some-selector');

            expect(renderer.removeChild).toHaveBeenCalled();
        });
    });

    describe('_isSliceElement', () => {
        it('should return true for valid slice elements', () => {
            const validElement = document.createElement('g');
            validElement.classList.add('slice', 'cursor-pointer');
            validElement.setAttribute('role', 'button');

            expect(service['_isSliceElement'](validElement)).toBeTrue();
        });

        it('should return false for invalid elements', () => {
            const invalidElement = document.createElement('div');
            expect(service['_isSliceElement'](invalidElement)).toBeFalse();
        });
    });

    describe('_isSurfaceElement', () => {
        it('should return true when element is a <path> with class "surface"', () => {
            const element = document.createElement('path');
            element.classList.add('surface');

            const result = (service as any)._isSurfaceElement(element);

            expect(result).toBe(true);
        });

        it('should return false when element is a <path> without class "surface"', () => {
            const element = document.createElement('path');

            const result = (service as any)._isSurfaceElement(element);

            expect(result).toBe(false);
        });

        it('should return false when element is not a <path>', () => {
            const element = document.createElement('div');
            element.classList.add('surface');

            const result = (service as any)._isSurfaceElement(element);

            expect(result).toBe(false);
        });
    });

    describe('_triggerMouseHover', () => {
        it('should dispatch a mouseover event on the element', () => {
            const mockElement = document.createElement('div');
            spyOn(mockElement, 'dispatchEvent');

            service['_triggerMouseHover'](mockElement);

            expect(mockElement.dispatchEvent).toHaveBeenCalled();
        });
    });

    describe('_triggerMouseOut', () => {
        it('should dispatch a mouseout event on the element', () => {
            const mockElement = document.createElement('div');
            spyOn(mockElement, 'dispatchEvent');

            service['_triggerMouseOut'](mockElement);

            expect(mockElement.dispatchEvent).toHaveBeenCalled();
        });
    });

    describe('_setFocusOutsideHeatmap', () => {
        it('should focus the dummy anchor element', () => {
            const mockAnchor = document.createElement('a');
            spyOn(document, 'querySelector').and.returnValue(mockAnchor);
            spyOn(mockAnchor, 'focus');

            service['_setFocusOutsideHeatmap']();

            expect(mockAnchor.focus).toHaveBeenCalled();
        });
    });

    describe('_addDummyFocusElement', () => {
        it('should add a dummy anchor element if it does not exist', () => {
            renderer.createElement.and.returnValue(document.createElement('a'));
            spyOn(document, 'querySelectorAll').and.returnValue([] as any);

            service['_addDummyFocusElement']('some-selector');

            expect(renderer.createElement).toHaveBeenCalledWith('a');
            expect(renderer.appendChild).toHaveBeenCalled();
        });

        it('should not add a dummy anchor element if it already exists', () => {
            spyOn(document, 'querySelector').and.returnValue([document.createElement('a')] as any);
            service['_addDummyFocusElement']('some-selector');

            expect(renderer.createElement).not.toHaveBeenCalled();
            expect(renderer.appendChild).not.toHaveBeenCalled();
        });
    });
});
