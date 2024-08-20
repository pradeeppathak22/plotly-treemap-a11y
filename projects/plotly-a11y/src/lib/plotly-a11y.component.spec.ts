import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyA11yComponent } from './plotly-a11y.component';

describe('PlotlyA11yComponent', () => {
  let component: PlotlyA11yComponent;
  let fixture: ComponentFixture<PlotlyA11yComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlotlyA11yComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlotlyA11yComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
