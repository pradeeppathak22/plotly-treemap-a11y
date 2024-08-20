import { TestBed } from '@angular/core/testing';

import { PlotlyA11yService } from './plotly-a11y.service';

describe('PlotlyA11yService', () => {
  let service: PlotlyA11yService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlotlyA11yService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
